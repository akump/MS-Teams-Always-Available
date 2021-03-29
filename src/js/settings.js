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

setInterval(updateRequestCount, 30 * 1000);
updateRequestCount();

let queued = false;

document.addEventListener('DOMContentLoaded', () => {
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
            }, function () { });
        } else {
            chrome.storage.sync.set({
                isEnabled: false
            }, function () { });
        }
    });
    chrome.storage.sync.get(['isEnabled'], async function (storage) {
        const {
            isEnabled
        } = storage;
        checkbox.checked = isEnabled;
    });
});