const { execFile } = require('child_process');
const fs = require('fs');

const keys = [
  'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
];

const apps = [];

const fetchKey = (key) => {
  return new Promise((res) => {
    // Run reg query /s (subkeys) without specific values, so we get everything
    execFile('reg.exe', ['query', key, '/s'], { maxBuffer: 1024 * 1024 * 50 }, (error, stdout) => {
      if (stdout) {
        let currentApp = {};
        const lines = stdout.split(/\r?\n/);
        lines.forEach(line => {
          if (line.startsWith('HKEY_')) {
            if (currentApp.DisplayName) apps.push(currentApp);
            currentApp = {};
          } else if (line.trim().startsWith('DisplayName')) {
            const parts = line.split('REG_SZ');
            if (parts.length > 1) currentApp.DisplayName = parts[1].trim();
          } else if (line.trim().startsWith('DisplayIcon')) {
            const parts = line.split('REG_SZ');
            if (parts.length > 1) currentApp.DisplayIcon = parts[1].trim();
          } else if (line.trim().startsWith('Publisher')) {
            const parts = line.split('REG_SZ');
            if (parts.length > 1) currentApp.Publisher = parts[1].trim();
          }
        });
        if (currentApp.DisplayName) apps.push(currentApp);
      }
      res();
    });
  });
};

Promise.all(keys.map(fetchKey)).then(() => {
  console.log(`Total raw apps: ${apps.length}`);
  
  // Filtering logic
  const filteredApps = [];
  const uniqueNames = new Set();
  
  apps.forEach(app => {
    if (!app.DisplayName) return;
    const name = app.DisplayName;
    const lowerName = name.toLowerCase();
    const publisher = (app.Publisher || '').toLowerCase();
    
    // Ignore updates
    if (lowerName.includes('update') || lowerName.includes('kb') || name.startsWith('Security Update')) return;
    
    // System & SDK filter
    const systemKeywords = ['runtime', 'c++', 'redistributable', 'sdk', 'driver', 'service', 'library', 'framework', 'module', 'visual studio 20', 'sql server', 'windows desktop', 'management objects'];
    if (systemKeywords.some(kw => lowerName.includes(kw))) return;
    
    // Publisher filter
    const systemPublishers = ['intel', 'nvidia', 'amd', 'realtek', 'asustek'];
    if (systemPublishers.some(pub => publisher.includes(pub))) return;
    if (publisher.includes('microsoft') && !['edge', 'code', 'skype', 'teams', 'office', 'xbox'].some(kw => lowerName.includes(kw))) return;
    
    // Most real user apps have a DisplayIcon
    if (!app.DisplayIcon) return;
    
    // Remove icon index (e.g. ,0)
    let iconPath = app.DisplayIcon.replace(/,.*$/, '').replace(/"/g, '');
    
    if (!uniqueNames.has(name)) {
      uniqueNames.add(name);
      filteredApps.push({ name, publisher, iconPath });
    }
  });

  console.log(`Total filtered apps: ${filteredApps.length}`);
  console.log('Filtered apps list:');
  filteredApps.forEach(a => console.log(`- ${a.name} (Icon: ${a.iconPath})`));
});
