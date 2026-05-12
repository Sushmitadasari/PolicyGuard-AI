const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const lnkPath = path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Google Chrome.lnk');
  if (fs.existsSync(lnkPath)) {
    const icon = await app.getFileIcon(lnkPath, { size: 'large' });
    console.log('Chrome icon size:', icon.getSize());
    console.log('Is empty?', icon.isEmpty());
  } else {
    console.log('Chrome shortcut not found');
  }
  app.quit();
});
