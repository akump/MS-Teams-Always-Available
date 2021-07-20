chrome.runtime.onInstalled.addListener(async () => {
    chrome.alarms.create('forceTeamsAvailability', {
        periodInMinutes: 0.5
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'forceTeamsAvailability') {
        runForceAvailability();
    }
});


let count = 0;

chrome.storage.sync.set({
    requestCount: count
}, () => {});

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
                () => {}
            );
            break;
        }
    });
}

const requestForceAvailability = function () {
    chrome.storage.sync.get(['isEnabled', 'statusType', 'requestCount'], async storage => {
        const {
            isEnabled,
            statusType,
            requestCount
        } = storage;
        count = requestCount;
        console.log("count: " + count);
        console.log("status: " + statusType);

        if (!statusType) {
            chrome.storage.sync.set({
                statusType: 'Available'
            }, () => {});
            statusType === 'Available';
        }

        if (isEnabled || isEnabled === undefined) {
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
                    count += 1;

                    chrome.storage.sync.set({
                        requestCount: count
                    }, () => {});
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