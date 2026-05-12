const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
  const startMenuPaths = [
    path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];

  const apps = [];
  
  const scanDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.lnk')) {
        try {
          const details = shell.readShortcutLink(fullPath);
          apps.push({
            name: file.replace('.lnk', ''),
            target: details.target,
            icon: details.icon
          });
        } catch (e) {}
      }
    }
  };

  startMenuPaths.forEach(scanDir);
  console.log(`Found ${apps.length} shortcuts`);
  apps.slice(0, 10).forEach(a => console.log(a.name));
  app.quit();
});
