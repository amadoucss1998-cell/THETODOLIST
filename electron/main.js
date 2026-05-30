const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    title: 'TaskFlow',
    backgroundColor: '#0f0f1a',
    show: false,
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))

  win.once('ready-to-show', () => win.show())
}

// Native notification support for Windows
ipcMain.on('notify', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
