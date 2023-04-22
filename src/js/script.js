const alarmName = 'forceTeamsAvailability';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(alarmName, {periodInMinutes: 0.5});
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === alarmName) runForceAvailability();
});

const runMcasStorage = function(url) {
  const pathArray = url.split('?');
  chrome.storage.sync.set({mcas: pathArray[1]}, () => {});
};

chrome.webRequest.onCompleted.addListener(
  function(details) {
    runMcasStorage(details.url);
  },
  {urls: ['https://presence.teams.microsoft.com.mcas.ms/*']}
);

const runForceAvailability = function() {
  chrome.tabs.query(
    {
      url: ['https://teams.microsoft.com.mcas.ms/*', 'https://teams.microsoft.com/*'],
    },
    function(items) {
      for (tab of items) {
        console.log(`tab found: ${tab.url}`);
        const mcas = tab.url.includes('mcas.ms');
        chrome.storage.sync.set({mcasEnabled: mcas});
        chrome.scripting.executeScript(
          {target: {tabId: tab.id}, function: requestForceAvailability},
          () => {}
        );
        break;
      }
      console.log('tab not found');
    }
  );
};

const requestForceAvailability = function() {
  console.log('requestForceAvailability');
  chrome.storage.sync.get(
    [
      'isEnabled',
      'statusType',
      'requestCount',
      'startTime',
      'endTime',
      'onlyRunInTimeWindow',
      'paid',
      'mcasEnabled',
      'mcas',
    ],
    async storage => {
      let {
        isEnabled,
        statusType,
        requestCount,
        startTime,
        endTime,
        onlyRunInTimeWindow,
        paid,
        mcasEnabled,
        mcas,
      } = storage;
      if (mcas === undefined) {
        mcas = '';
      }
      if (mcasEnabled === undefined) {
        mcasEnabled = false;
      }
      if (requestCount === undefined) {
        chrome.storage.sync.set({requestCount: 0}, () => {});
        requestCount = 0;
      }
      console.log(`count: ${requestCount}`);
      console.log(`status: ${statusType}`);

      if (!statusType) {
        chrome.storage.sync.set({statusType: 'Available'}, () => {});
        statusType === 'Available';
      }
      if (paid !== true) {
        console.log('User does not have an access');
        console.log(`paid: ${paid}`);
        return;
      }

      if (isEnabled || isEnabled === undefined) {
        console.log(`startTime: ${startTime}`);
        console.log(`endTime: ${endTime}`);
        if (onlyRunInTimeWindow && startTime && endTime) {
          const currentDate = new Date();
          const startDate = new Date(currentDate.getTime());
          startDate.setHours(startTime.split(':')[0]);
          startDate.setMinutes(startTime.split(':')[1]);
          startDate.setSeconds('00');

          const endDate = new Date(currentDate.getTime());
          endDate.setHours(endTime.split(':')[0]);
          endDate.setMinutes(endTime.split(':')[1]);
          endDate.setSeconds('00');
          const isBetween = startDate < currentDate && endDate > currentDate;
          if (!isBetween) {
            console.log(
              'onlyRunInTimeWindow set to true and current time is not in inputted window'
            );
            return;
          } else {
            console.log(
              'onlyRunInTimeWindow set to true and time is in window! Running force availability...'
            );
          }
        }
        try {
          let tokenJSON;
          for (const key in localStorage) {
            if (key.includes('cache.token.https://presence.teams.microsoft.com/')) {
              tokenJSON = localStorage[key];
              break;
            }
          }
          console.log(`Auth token: ${tokenJSON}`);
          if (!tokenJSON) {
            console.log('MS Teams Always Available: Couldnt find auth token in local stoage');
            return;
          }
          const token = JSON.parse(tokenJSON).token;
          const availableUrl = mcasEnabled
            ? 'https://presence.teams.microsoft.com.mcas.ms/v1/me/forceavailability/?' + mcas
            : 'https://presence.teams.microsoft.com/v1/me/forceavailability/';

          const response = await fetch(availableUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: `{"availability":"${statusType}"}`,
            method: 'PUT',
          });
          if (response.ok) {
            requestCount += 1;

            chrome.storage.sync.set({requestCount: requestCount}, () => {});
          }
          console.log('MS Teams Always Available:');
          console.log(response);
        } catch (e) {
          console.log(`MS Teams Always Available: HTTP req failed to /forceavailability: ${e}`);
        }
      } else {
        console.log('MS Teams Always Available: currently disabled');
      }
    }
  );
};
