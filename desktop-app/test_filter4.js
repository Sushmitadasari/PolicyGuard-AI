const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const startMenuPaths = [
    path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];

  const uniqueAppsByExe = new Map();

  const scanDir = async (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file.toLowerCase().includes('administrative tools') || file.toLowerCase().includes('windows system') || file.toLowerCase().includes('windows powershell')) continue;
          await scanDir(fullPath);
        } else if (file.endsWith('.lnk')) {
          let name = file.replace('.lnk', '');
          const lowerName = name.toLowerCase();

          const badWords = ['runtime', 'sdk', 'documentation', 'docs', 'update', 'updater', 'helper', 'launcher', 'service', 'add-in', 'webview', 'registry', 'installer', 'bootstrap', 'package', 'driver', 'redistributable', 'extension', 'component', 'configuration', 'shell', 'terminal', 'compiler', 'debugger', 'framework', 'library', 'plugin', 'repair', 'reset', 'cache', 'monitor', 'recorder', 'telemetry', 'utility', 'uninstall', 'remove', 'readme', 'manual', 'setup', 'config', 'safe mode', 'skinned'];
          
          if (badWords.some(word => lowerName.includes(word))) continue;

          const details = shell.readShortcutLink(fullPath);
          const targetPath = details.target ? details.target : '';
          const lowerTarget = targetPath.toLowerCase();

          // Ignore Windows internal and Chrome/Edge PWAs
          if (!targetPath || lowerTarget.includes('c:\\\\windows') || lowerTarget.includes('system32') || lowerTarget.includes('syswow64')) continue;
          if (lowerTarget.includes('chrome_proxy.exe') || lowerTarget.includes('msedge_proxy.exe')) continue; // Ignore PWAs like Gmail or specific websites
          if (lowerTarget.endsWith('.chm') || lowerTarget.endsWith('.txt') || lowerTarget.endsWith('.pdf') || lowerTarget.endsWith('.html') || lowerTarget.endsWith('.ini')) continue;

          // Deduplicate by the actual executable file path!
          if (uniqueAppsByExe.has(lowerTarget)) {
            const existingName = uniqueAppsByExe.get(lowerTarget).name;
            // If the new name is shorter, it's usually the main app (e.g. "VLC media player" vs "VLC media player skinned")
            if (name.length < existingName.length) {
              uniqueAppsByExe.set(lowerTarget, { name, targetPath, fullPath });
            }
          } else {
            uniqueAppsByExe.set(lowerTarget, { name, targetPath, fullPath });
          }
        }
      } catch (err) {}
    }
  };

  for (const dir of startMenuPaths) {
    await scanDir(dir);
  }

  const apps = Array.from(uniqueAppsByExe.values());
  console.log(`Found ${apps.length} real apps`);
  apps.slice(0, 30).forEach(a => console.log(`${a.name} -> ${a.targetPath}`));
  app.quit();
});
