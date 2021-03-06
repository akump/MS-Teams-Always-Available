const idToStatus = {
    'StatusCheck0': 'Available',
    'StatusCheck1': 'Away',
    'StatusCheck2': 'Busy'
};

const selectOnlyThis = function (e) {
    for (let i = 0; i <= 2; i++) {
        document.getElementById(`StatusCheck${i}`).checked = false;
    }
    document.getElementById(e.currentTarget.id).checked = true;
    chrome.storage.sync.set({
        statusType: idToStatus[e.currentTarget.id]
    }, () => {});
};

const resetCount = function () {
    chrome.storage.sync.set({
        requestCount: 0
    }, () => {
        updateRequestCount();
    });
}

const updateRequestCount = function () {
    chrome.storage.sync.get(['requestCount'], function (storage) {
        const {
            requestCount
        } = storage;
        const countElement = document.getElementById('count');
        if (requestCount) {
            countElement.innerHTML = requestCount;
        } else {
            countElement.innerHTML = 0;
        }
    });
};

setInterval(updateRequestCount, 10 * 1000);
updateRequestCount();

let queued = false;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("resetCount").addEventListener("click", resetCount);

    const checkbox = document.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', () => {
        const savedTextElement = document.getElementById('saved-text');
        if (savedTextElement.innerText === '') {
            savedTextElement.innerText = 'Saved!';
        }

        if (!queued) {
            setTimeout(() => {
                queued = false;
                savedTextElement.innerText = '';
            }, 5000);
        }

        queued = true;

        if (checkbox.checked) {
            chrome.storage.sync.set({
                isEnabled: true
            }, () => {});
        } else {
            chrome.storage.sync.set({
                isEnabled: false
            }, () => {});
        }
    });

    chrome.storage.sync.get(['isEnabled'], async storage => {
        const {
            isEnabled
        } = storage;

        // handle use case where extension was just installed
        if (isEnabled === undefined) {
            chrome.storage.sync.set({
                isEnabled: true
            }, () => {});
            checkbox.checked = true;
        } else {
            checkbox.checked = isEnabled;
        }
    });

    const availableStatusElement = document.getElementById("StatusCheck0");
    const awayStatusElement = document.getElementById("StatusCheck1");
    const busyStatusElement = document.getElementById("StatusCheck2");

    availableStatusElement.addEventListener("click", selectOnlyThis);
    awayStatusElement.addEventListener("click", selectOnlyThis);
    busyStatusElement.addEventListener("click", selectOnlyThis);

    chrome.storage.sync.get(['statusType'], async storage => {
        const {
            statusType
        } = storage;

        // handle use case where extension was just installed
        if (statusType === undefined) {
            chrome.storage.sync.set({
                statusType: 'Available'
            }, () => {});
            availableStatusElement.checked = true;
        } else {
            if (statusType === 'Available') {
                availableStatusElement.checked = true;
                awayStatusElement.checked = false;
                busyStatusElement.checked = false;
            } else if (statusType === 'Away') {
                awayStatusElement.checked = true;
                busyStatusElement.checked = false;
                availableStatusElement.checked = false;
            } else if (statusType === 'Busy') {
                busyStatusElement.checked = true;
                awayStatusElement.checked = false;
                availableStatusElement.checked = false;
            } else {
                availableStatusElement.checked = true;
                busyStatusElement.checked = false;
                awayStatusElement.checked = false;
            }
        }
    });
});