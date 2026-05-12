const { execFile } = require('child_process');
const keys = [
  'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
];
const appsSet = new Set();
const fetchKey = (key) => {
  return new Promise((res) => {
    execFile('reg.exe', ['query', key, '/s', '/f', 'DisplayName', '/v'], { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
      if (stdout) {
        // reg.exe output uses \r\n
        const lines = stdout.split(/\r?\n/);
        lines.forEach(line => {
          if (line.includes('DisplayName') && line.includes('REG_SZ')) {
            const parts = line.split('REG_SZ');
            if (parts.length === 2) {
              const appName = parts[1].trim();
              if (appName && !appsSet.has(appName)) {
                appsSet.add(appName);
              }
            }
          }
        });
      }
      res();
    });
  });
};
Promise.all(keys.map(fetchKey)).then(() => {
  console.log('Total unique apps found:', appsSet.size);
});
