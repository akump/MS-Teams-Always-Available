
chrome.runtime.onInstalled.addListener(async () => {
    chrome.alarms.create('forceTeamsAvailability', {
        periodInMinutes: .1
    });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'forceTeamsAvailability') {
        runForceAvailability();
    }
});

const runForceAvailability = async function () {
    chrome.tabs.query({
        'url': 'https://teams.microsoft.com/*'
    }, function (items) {
        for (tab of items) {
            console.log("tab found: " + tab.url);
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                function: requestForceAvailability
            },
                () => { }
            );
            break;
        }
    });
}

const requestForceAvailability = function () {
    chrome.storage.sync.get(['isEnabled', 'statusType', 'requestCount', 'startTime', 'endTime', 'onlyRunInTimeWindow', 'paid'], async storage => {
        let {
            isEnabled,
            statusType,
            requestCount,
            startTime,
            endTime,
            onlyRunInTimeWindow,
            paid
        } = storage;
        if (requestCount === undefined) {
            chrome.storage.sync.set({
                requestCount: 0
            }, () => { });
            requestCount = 0;
        }
        console.log("count: " + requestCount);
        console.log("status: " + statusType);

        if (!statusType) {
            chrome.storage.sync.set({
                statusType: 'Available'
            }, () => { });
            statusType === 'Available';
        }
        if (!paid) {
            console.log('User does not have an active subscription')
            return;
        }

        if (isEnabled || isEnabled === undefined) {
            console.log(`startTime: ${startTime}`);
            console.log(`endTime: ${endTime}`);
            if (onlyRunInTimeWindow && startTime && endTime) {
                const currentDate = new Date();
                const startDate = new Date(currentDate.getTime());
                startDate.setHours(startTime.split(":")[0]);
                startDate.setMinutes(startTime.split(":")[1]);
                startDate.setSeconds('00');

                const endDate = new Date(currentDate.getTime());
                endDate.setHours(endTime.split(":")[0]);
                endDate.setMinutes(endTime.split(":")[1]);
                endDate.setSeconds('00');
                const isBetween = startDate < currentDate && endDate > currentDate;
                if (!isBetween) {
                    console.log('onlyRunInTimeWindow set to true and current time is not in inputted window');
                    return;
                } else {
                    console.log('onlyRunInTimeWindow set to true and time is in window! Running force availability...')
                }

            }
            try {
                const latestOid = localStorage['ts.latestOid'];
                const tokenJSON = localStorage['ts.' + latestOid + '.cache.token.https://presence.teams.microsoft.com/'];
                const token = JSON.parse(tokenJSON).token;

                const response = await fetch('https://presence.teams.microsoft.com/v1/me/forceavailability/', {
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    'body': `{"availability":"${statusType}"}`,
                    'method': 'PUT'
                });

                if (response.ok) {
                    requestCount += 1;

                    chrome.storage.sync.set({
                        requestCount: requestCount
                    }, () => { });
                }
                console.log('MS Teams Always Available:');
                console.log(response);
            } catch (e) {
                console.log('MS Teams Always Available: HTTP req failed to /forceavailability: ' + e);
            }
        } else {
            console.log('MS Teams Always Available: currently disabled');
        }
    });
};