const getAuthToken = function () {
  for (const key in localStorage) {
    if (key.startsWith('ts.') && key.endsWith('cache.token.https://presence.teams.microsoft.com/')) {
      return JSON.parse(localStorage[key]).token;
    }
  }
};

const startForceAvailability = async function () {
  const response = await fetch('https://presence.teams.microsoft.com/v1/me/forceavailability/', {
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    'body': '{"availability":"Available"}',
    'method': 'PUT'
  });
  console.group('MS Teams: Always Available');
  console.log(response);
  console.groupEnd();
};

setInterval(startForceAvailability, 30 * 1000);
startForceAvailability();