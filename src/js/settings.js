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