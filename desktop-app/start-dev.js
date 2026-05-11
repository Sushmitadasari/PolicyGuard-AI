#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.ELECTRON_DEV = 'true';
process.env.NODE_ENV = 'development';

console.log('🛡️  Starting PolicyGuard AI in development mode...\n');

// Start React dev server
console.log('📦 Starting React development server...');
const react = spawn('npm', ['run', 'react-start'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

// Wait a bit then start Electron
const electronDelay = setTimeout(() => {
  console.log('\n⚡ Starting Electron...');
  const electron = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, ELECTRON_DEV: 'true' },
  });

  electron.on('close', (code) => {
    console.log('\n❌ Electron closed with code', code);
    react.kill();
    process.exit(code);
  });
}, 5000);

react.on('error', (err) => {
  console.error('❌ React error:', err);
  clearTimeout(electronDelay);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  react.kill();
  clearTimeout(electronDelay);
  process.exit(0);
});
