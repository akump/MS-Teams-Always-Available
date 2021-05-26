const getAuthToken = function () {
  for (const key in localStorage) {
    if (key.startsWith('ts.') && key.endsWith('cache.token.https://presence.teams.microsoft.com/')) {
      return JSON.parse(localStorage[key]).token;
    }
  }
};

let count = 0;

chrome.storage.sync.set({
  requestCount: count
}, () => { });

const runForceAvailability = async function () {
  chrome.storage.sync.get(['isEnabled', 'requestCount', 'statusType'], async storage => {
    const {
      isEnabled,
      statusType
    } = storage;

    if (!statusType) {
      chrome.storage.sync.set({
        statusType: 'Available'
      }, () => { });
      statusType === 'Available';
    }

    if (isEnabled || isEnabled === undefined) {
      try {
        const response = await fetch('https://presence.teams.microsoft.com/v1/me/forceavailability/', {
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          'body': `{"availability":"${statusType}"}`,
          'method': 'PUT'
        });

        if (response.ok) {
          count += 1;

          chrome.storage.sync.set({
            requestCount: count
          }, () => { });
        }
        console.log('MS Teams Always Available:');
        console.log(response);
      } catch {
        console.log('MS Teams Always Available: HTTP req failed to /forceavailability');
      }
    } else {
      console.log('MS Teams Always Available: currently disabled');
    }
  });
};

setInterval(runForceAvailability, 30 * 1000);
runForceAvailability();