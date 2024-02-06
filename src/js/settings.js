const idToStatus = {
  StatusCheck0: 'Available',
  StatusCheck1: 'Away',
  StatusCheck2: 'Busy',
};

const selectOnlyThis = function(e) {
  for (let i = 0; i <= Object.keys(idToStatus).length - 1; i++) {
    document.getElementById(`StatusCheck${i}`).checked = false;
  }
  document.getElementById(e.currentTarget.id).checked = true;
  chrome.storage.sync.set({statusType: idToStatus[e.currentTarget.id]}, () => {});
};

const resetCount = function() {
  chrome.storage.sync.set({requestCount: 0, lastUpdatedDate: ''}, () => {
    updateRequestCount();
  });
};

const updateRequestCount = function() {
  chrome.storage.sync.get(['requestCount', 'lastUpdatedDate'], function(storage) {
    const {requestCount, lastUpdatedDate} = storage;
    const countElement = document.getElementById('count');
    if (requestCount) {
      countElement.innerHTML = requestCount;
    } else {
      countElement.innerHTML = 0;
    }
    const lastUpdatedDateElement = document.getElementById('lastUpdatedDate');
    if (lastUpdatedDate) {
      lastUpdatedDateElement.innerHTML = lastUpdatedDate;
    } else {
      lastUpdatedDateElement.innerHTML = '';
    }
  });
};

setInterval(updateRequestCount, 3 * 1000);

let queued = false;

document.addEventListener('DOMContentLoaded', () => {
  updateRequestCount();
  document.getElementById('resetCount').addEventListener('click', resetCount);

  const enabledCheckbox = document.getElementById('enabledCheckbox');
  enabledCheckbox.addEventListener('change', () => {
    const savedTextElement = document.getElementById('saved-text');
    if (savedTextElement.innerText === '') savedTextElement.innerText = 'Saved!';
    if (!queued) {
      setTimeout(() => {
        queued = false;
        savedTextElement.innerText = '';
      }, 3000);
    }
    queued = true;
    chrome.storage.sync.set({isEnabled: enabledCheckbox.checked}, () => {});
  });

  chrome.storage.sync.get(['isEnabled'], async storage => {
    const {isEnabled} = storage;
    if (isEnabled === undefined) {
      chrome.storage.sync.set({isEnabled: true}, () => {});
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
    const {statusType} = storage;
    // Handle use case where extension was just installed
    if (statusType === undefined) {
      chrome.storage.sync.set({statusType: 'Available'}, () => {});
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
    const {onlyRunInTimeWindow} = storage;
    if (onlyRunInTimeWindow === undefined) {
      chrome.storage.sync.set({onlyRunInTimeWindow: false}, () => {});
      timeWindowCheckbox.checked = false;
    } else {
      timeWindowCheckbox.checked = onlyRunInTimeWindow;
    }
  });
  timeWindowCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({onlyRunInTimeWindow: timeWindowCheckbox.checked}, () => {});
  });

  const startTimeInput = document.getElementById('startTimeInput');
  const endTimeInput = document.getElementById('endTimeInput');
  chrome.storage.sync.get(['startTime'], async storage => {
    const {startTime} = storage;
    if (startTime === undefined) {
      chrome.storage.sync.set({startTime: '08:00'}, () => {});
      startTimeInput.value = '08:00';
    } else {
      startTimeInput.value = startTime;
    }
  });
  chrome.storage.sync.get(['endTime'], async storage => {
    const {endTime} = storage;
    if (endTime === undefined) {
      chrome.storage.sync.set({endTime: '17:30'}, () => {});
      endTimeInput.value = '17:30';
    } else {
      endTimeInput.value = endTime;
    }
  });
  startTimeInput.addEventListener('change', () => {
    chrome.storage.sync.set({startTime: startTimeInput.value}, () => {});
  });
  endTimeInput.addEventListener('change', () => {
    chrome.storage.sync.set({endTime: endTimeInput.value}, () => {});
  });
});
