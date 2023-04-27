// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Badge = require('electron-windows-badge');

process.env.SOCKET_PORT = 18092;

// const io = require('socket.io-client');

// var socket = io("http://localhost:18091");

// socket.on('welcome', () => {
//   console.log('welcome received'); // displayed
//   socket.emit('test')
// });
// socket.on('error', (e) => {
//   console.log(e); // not displayed
// });
// socket.on('ok', () => {
//   console.log("OK received"); // not displayed
// });
// socket.on('connect', () => {
//   console.log("connected"); // displayed
//   socket.emit('test');
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow
// ipcMain.setIcon(path.join(__dirname, 'assets/icon.png'));
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 500,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.ico')
  })
  new Badge(mainWindow);
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

ipcMain.on('bringToFront', (event, msg) => {
  mainWindow.setAlwaysOnTop(true);
  mainWindow.show();
  mainWindow.setAlwaysOnTop(false);
})

ipcMain.on('alwaysTop', (event, msg) => {
  if(msg) {
    mainWindow.setAlwaysOnTop(true);
  } else {
    mainWindow.setAlwaysOnTop(false);
  }
  // mainWindow.setAlwaysOnTop(true);
  // mainWindow.show();
  // mainWindow.setAlwaysOnTop(false);
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.