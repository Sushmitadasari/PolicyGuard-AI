const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const startMenuPaths = [
    path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];

  const uniqueApps = new Map();

  const scanDir = async (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Ignore administrative tools folders
          if (file.toLowerCase().includes('administrative tools') || file.toLowerCase().includes('windows system') || file.toLowerCase().includes('windows powershell')) continue;
          await scanDir(fullPath);
        } else if (file.endsWith('.lnk')) {
          const name = file.replace('.lnk', '');
          const lowerName = name.toLowerCase();

          // Filter out obvious junk by name
          if (lowerName.includes('uninstall') || lowerName.includes('remove') || lowerName.includes('readme') || lowerName.includes('help') || lowerName.includes('documentation') || lowerName.includes('manual') || lowerName.includes('setup') || lowerName.includes('config')) continue;

          // Read the shortcut target
          const details = shell.readShortcutLink(fullPath);
          const target = details.target ? details.target.toLowerCase() : '';

          // CORE FILTER: Ignore Windows Utilities and System apps
          if (target.includes('c:\\windows') || target.includes('system32') || target.includes('syswow64')) continue;
          if (target.includes('uninstall') || target.includes('unins000')) continue;
          if (target.endsWith('.chm') || target.endsWith('.txt') || target.endsWith('.pdf')) continue;
          
          if (!target) continue;

          if (!uniqueApps.has(name)) {
            uniqueApps.set(name, { name, target });
          }
        }
      } catch (err) {}
    }
  };

  for (const dir of startMenuPaths) {
    await scanDir(dir);
  }

  const apps = Array.from(uniqueApps.values());
  console.log(`Found ${apps.length} real apps`);
  apps.slice(0, 15).forEach(a => console.log(`${a.name} -> ${a.target}`));
  app.quit();
});
