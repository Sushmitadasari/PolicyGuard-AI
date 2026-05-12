const { exec } = require('child_process');

const psCommand = `Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -ne $null } | Select-Object DisplayName, Publisher, DisplayVersion | ConvertTo-Json -Compress`;

const base64Cmd = Buffer.from(psCommand, 'utf16le').toString('base64');

exec(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${base64Cmd}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
  if (error) {
    console.error('Error fetching apps:', error);
    return;
  }
  try {
    let apps = JSON.parse(stdout);
    if (!Array.isArray(apps)) apps = [apps];
    console.log(`Successfully parsed ${apps.length} apps. First app:`, apps[0]);
  } catch (err) {
    console.error('JSON parse error:', err.message);
  }
});
