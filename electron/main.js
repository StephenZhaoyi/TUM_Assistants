const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('allow-file-access-from-files');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'backend/main.exe');
  } else {
    backendPath = path.join(__dirname, '../backend/build/main.dist/main.exe');
  }
  pythonProcess = spawn(backendPath, [], { 
    stdio: 'pipe',
    windowsHide: true
  });

  pythonProcess.on('error', (err) => {
    console.error('backend error:', err);
  });
  pythonProcess.on('exit', (code, signal) => {
    console.error('backend process exited:', code, signal);
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 768,
    minWidth: 1200,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


  mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('frontend page failed to load:', errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (pythonProcess) {
      pythonProcess.kill();
    }
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());
