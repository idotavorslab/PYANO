const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const fs = require('fs');
console.log(`index.js. process.platform: ${process.platform} 
__dirname: ${__dirname}
process.argv: ${process.argv.join(", ")}
`);

const Store = require("electron-store");
const store = new Store();
console.log('store.path: ', store.path);
console.log(`app.getPath('userData'):`, app.getPath('userData'));
if (fs.existsSync(store.path)) {
    console.log('trying to get last page from store');
    let last_page = store.get('last_page');
    console.log('last_page: ', last_page);
    if (last_page == 'inside_test') {
        console.log('last page is inside_test, changing to new_test');
        store.set('last_page', 'new_test');
    }
} else {
    console.error('store.path not exists!')
}


const pyShell = require("python-shell").PythonShell;
const rootPath = __dirname.endsWith('src') ? __dirname : path.join(__dirname, '..');
const enginePath = path.join(rootPath, "engine");


const pyExecPath = path.join(enginePath, process.platform === 'win32' ? "env/Scripts/python.exe" : "env/bin/python");
console.log(`
rootPath: ${rootPath}
enginePath: ${enginePath}
pyExecPath: ${pyExecPath}
`);

// noinspection JSUnresolvedVariable
pyShell.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};


const configfilepath = path.join(app.getPath('userData'), 'config.json');
let pythonDone = false;
try {
    console.log(`running check_create_config_file.py, configfilepath: ${configfilepath}`);
    pyShell.run("check_create_config_file.py", {
        mode: "json",
        args: [configfilepath, rootPath]
    }, (err, output) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`check_create_config_file.py returned output: (output.first_level_modified = ${output.first_level_modified})`);
            output.map(console.log);
        }
        pythonDone = true;
    });
} catch (e) {
    console.error('Error running check_create_config_file:', e);
}

for (let d of ['configs', 'subjects', 'truths']) {
    let subdir = path.join(rootPath, 'experiments', d);
    if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
        console.warn(`created subdir: ${subdir}`)
    }

}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


const createWindow = () => {
    // require('devtron').install();
    // Create the browser window.
    mainWindow = new BrowserWindow({
        acceptFirstMouse: true,
        webPreferences: {
            navigateOnDragDrop: false,
            zoomFactor: 1,
            experimentalFeatures: true,
        }
    });

    mainWindow.setSize(1919, 1080, true);
    mainWindow.setPosition(0, 0, true);
    mainWindow.webContents.setZoomFactor(1);

    // mainWindow.setMaximumSize(1919, 1080);
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${rootPath}/index.html`);
    mainWindow.setResizable(true);
    mainWindow.setMenu(null);
    mainWindow.setBackgroundColor('#181818');
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.maximize();
    mainWindow.setMenuBarVisibility(true);
    mainWindow.setFullScreen(false);
    // mainWindow.setIcon()
    // mainWindow.setHasShadow(true);


    mainWindow.webContents.openDevTools();
    

    // Emitted when the window is closed.
    mainWindow.on('show', () => console.log('mainWindow SHOW'));
    mainWindow.on('ready-to-show', () => console.log('mainWindow READY-TO-SHOW'));
    mainWindow.on('closed', () => {
        console.log('mainWindow CLOSED');
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.on('hide', () => console.log('mainWindow HIDE'));
    /*mainWindow.on('blur', () => globalShortcut.unregisterAll());
    mainWindow.on('focus', () => {
        globalShortcut.register('CommandOrControl+R', () => {
            mainWindow.reload();
        });
        globalShortcut.register('CommandOrControl+Q', () => {
            console.log('Pressed ctrl+q, setting last page to new test and reloading');
            store.set('last_page', 'new_test');
            mainWindow.reload();
        });
        globalShortcut.register('CommandOrControl+Y', () => {
            console.log('Pressed ctrl+y, opening DevTools');
            mainWindow.webContents.openDevTools();
        });

        globalShortcut.register('CommandOrControl+U', () => {
            console.log('Pressed ctrl+u, unmaximizing');
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
            mainWindow.setMenuBarVisibility(mainWindow.isFullScreen());
        });
    });
    */
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    console.log(`app READY, pythonDone: ${pythonDone}`);
    createWindow();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    console.log('app ACTIVATE');
    if (mainWindow === null) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
