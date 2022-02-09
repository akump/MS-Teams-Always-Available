const idToStatus = {
    'StatusCheck0': 'Available',
    'StatusCheck1': 'Away',
    'StatusCheck2': 'Busy'
};

const openPayment = function () {
    const extpay = ExtPay('microsoft-teams-always-available');
    extpay.openPaymentPage();
};

const openTrial = function () {
    const extpay = ExtPay('microsoft-teams-always-available');
    extpay.openTrialPage('1-day');
};

const doesUserHaveAccess = function (user) {
    if (user.paid) return true;
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24 * 1;
    if (user.trialStartedAt && (now - user.trialStartedAt) < oneDay) {
        return true;
    }
    return false;
};

const runGetUserCallBack = function (user) {
    const access = doesUserHaveAccess(user);
    chrome.storage.sync.set({ paid: access }, () => { });
    const paymentStatusElement = document.getElementById('subHeader');
    if (access) {
        paymentStatusElement.innerHTML = 'Subscription ✅';
    } else {
        paymentStatusElement.innerHTML = 'Subscription ⛔︎';
    }
};

const updatePaidStatus = function () {
    const extpay = ExtPay('microsoft-teams-always-available');
    extpay.getUser().then(user => {
        runGetUserCallBack(user);
    }).catch(() => {
        document.getElementById('paymentStatus').innerHTML = 'No current user. Manage your subscription.';
    });
};

const selectOnlyThis = function (e) {
    for (let i = 0; i <= Object.keys(idToStatus).length - 1; i++) {
        document.getElementById(`StatusCheck${i}`).checked = false;
    }
    document.getElementById(e.currentTarget.id).checked = true;
    chrome.storage.sync.set({ statusType: idToStatus[e.currentTarget.id] }, () => { });
};

const resetCount = function () {
    chrome.storage.sync.set({ requestCount: 0 }, () => { updateRequestCount(); });
};

const updateRequestCount = function () {
    chrome.storage.sync.get(['requestCount'], function (storage) {
        const { requestCount } = storage;
        const countElement = document.getElementById('count');
        if (requestCount) {
            countElement.innerHTML = requestCount;
        } else {
            countElement.innerHTML = 0;
        }
    });
};

setInterval(updateRequestCount, 10 * 1000);

let queued = false;

document.addEventListener('DOMContentLoaded', () => {
    updateRequestCount();
    updatePaidStatus();
    document.getElementById('resetCount').addEventListener('click', resetCount);
    document.getElementById('openPayment').addEventListener('click', openPayment);
    document.getElementById('openTrial').addEventListener('click', openTrial);

    const enabledCheckbox = document.getElementById('enabledCheckbox');
    enabledCheckbox.addEventListener('change', () => {
        const savedTextElement = document.getElementById('saved-text');
        if (savedTextElement.innerText === '') savedTextElement.innerText = 'Saved!';
        if (!queued) {
            setTimeout(() => {
                queued = false;
                savedTextElement.innerText = '';
            }, 5000);
        }
        queued = true;
        chrome.storage.sync.set({ isEnabled: enabledCheckbox.checked }, () => { });
    });

    chrome.storage.sync.get(['isEnabled'], async storage => {
        const { isEnabled } = storage;
        // handle use case where extension was just installed
        if (isEnabled === undefined) {
            chrome.storage.sync.set({ isEnabled: true }, () => { });
            enabledCheckbox.checked = true;
        } else {
            enabledCheckbox.checked = isEnabled;
        }
    });

    const availableStatusElement = document.getElementById('StatusCheck0');
    const awayStatusElement = document.getElementById('StatusCheck1');
    const busyStatusElement = document.getElementById('StatusCheck2');
    availableStatusElement.addEventListener('click', selectOnlyThis);
    awayStatusElement.addEventListener('click', selectOnlyThis);
    busyStatusElement.addEventListener('click', selectOnlyThis);
    chrome.storage.sync.get(['statusType'], async storage => {
        const { statusType } = storage;
        // handle use case where extension was just installed
        if (statusType === undefined) {
            chrome.storage.sync.set({ statusType: 'Available' }, () => { });
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

    const timeWindowCheckbox = document.getElementById('timeWindowCheckbox');
    chrome.storage.sync.get(['onlyRunInTimeWindow'], async storage => {
        const { onlyRunInTimeWindow } = storage;
        // handle use case where extension was just installed
        if (onlyRunInTimeWindow === undefined) {
            chrome.storage.sync.set({ onlyRunInTimeWindow: false }, () => { });
            timeWindowCheckbox.checked = false;
        } else {
            timeWindowCheckbox.checked = onlyRunInTimeWindow;
        }
    });
    timeWindowCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ onlyRunInTimeWindow: timeWindowCheckbox.checked }, () => { });
    });

    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    chrome.storage.sync.get(['startTime'], async storage => {
        const { startTime } = storage;
        // handle use case where extension was just installed
        if (startTime === undefined) {
            chrome.storage.sync.set({ startTime: '08:00' }, () => { });
            startTimeInput.value = '08:00';
        } else {
            startTimeInput.value = startTime;
        }
    });
    chrome.storage.sync.get(['endTime'], async storage => {
        const { endTime } = storage;
        // handle use case where extension was just installed
        if (endTime === undefined) {
            chrome.storage.sync.set({ endTime: '17:30' }, () => { });
            endTimeInput.value = '17:30';
        } else {
            endTimeInput.value = endTime;
        }
    });
    startTimeInput.addEventListener('change', () => {
        chrome.storage.sync.set({ startTime: startTimeInput.value }, () => { });
    });
    endTimeInput.addEventListener('change', () => {
        chrome.storage.sync.set({ endTime: endTimeInput.value }, () => { });
    });
});