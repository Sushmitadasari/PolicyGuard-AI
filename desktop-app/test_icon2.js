const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const lnkPath = path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Google Chrome.lnk');
  const regEditLnk = path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Administrative Tools', 'Registry Editor.lnk');
  
  if (fs.existsSync(lnkPath)) {
    const details = shell.readShortcutLink(lnkPath);
    console.log('Chrome Target:', details.target);
    const icon = await app.getFileIcon(details.target, { size: 'large' });
    console.log('Chrome Icon is empty?', icon.isEmpty());
  }
  
  if (fs.existsSync(regEditLnk)) {
    const details = shell.readShortcutLink(regEditLnk);
    console.log('RegEdit Target:', details.target);
  }
  
  app.quit();
});
