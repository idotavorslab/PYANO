console.log(`main.js`);
const { app, BrowserWindow } = require('electron');
const path = require('path');

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1600,
        height: 1200,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            experimentalFeatures: true,
            enableRemoteModule: true,
            allowRunningInsecureContent: true,
            autoplayPolicy: "no-user-gesture-required",
            webSecurity: false,


        },
        acceptFirstMouse: true,

        backgroundColor: '#181818'

    });

    // and load the index.html of the app.
    await win.loadFile('index.html');
    // win.maximize();
    // Open the DevTools.
    win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
console.log(`main.js EOF`);