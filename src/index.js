import { app, BrowserWindow, globalShortcut } from 'electron';

console.log('index.js');

const Store = require("electron-store");
const store = new Store();
try {
	console.log('trying to get last page from store');
	let last_page = store.get('last_page');
	if (last_page == 'inside_test') {
		console.log('last page is inside_test, changing to new_test');
		store.set('last_page', 'new_test');
	}
} catch (e) {
	console.log(`FAILED getting last page from store`, e);
}


// DEBUG ELECTRON WITH VS CODE:
// https://github.com/Microsoft/vscode-recipes/tree/master/Electron

// const debug = require('electron-debug');
//
// debug();
// try {
// 	require('electron-reloader')(module);
// } catch (err) {
// }

// check_create_experiments_folder_structure.py
// check_create_config_file.py
// check_create_local_modules_symlink.py
let pyShell = require("python-shell").PythonShell;
let path = require("path");
const enginePath = path.join(__dirname, "engine");
const pyExecPath = path.join(enginePath, "env/Scripts/python.exe");

// noinspection JSUnresolvedVariable
pyShell.defaultOptions = {
	pythonPath: pyExecPath,
	scriptPath: enginePath,
};

pyShell.run("check_create_experiments_folder_structure.py", {
	mode: "text",
	args: [__dirname]
}, (err, output) => {
	if (err) throw err;
});

pyShell.run("check_create_config_file.py", {
	mode: "json",
	args: [path.join(app.getPath('appData'), 'Electron'), __dirname]
}, (err, output) => {
	if (err) throw err;
});

/*pyShell.run("check_create_local_modules_symlink.py", {
	args: [__dirname]
}, (err, output) => {
	if (err) throw err;
});
*/


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


const createWindow = () => {
	// require('devtron').install();
	// Create the browser window.
	mainWindow = new BrowserWindow();

	mainWindow.setSize(1919, 1080, true);
	mainWindow.setPosition(0, 0, true);
	// mainWindow.setMaximumSize(1919, 1080);
	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	mainWindow.setResizable(true);
	mainWindow.setMenu(null);
	mainWindow.setBackgroundColor('#181818');
	mainWindow.setMenuBarVisibility(false);
	mainWindow.setAutoHideMenuBar(true);
	// mainWindow.maximize();
	// mainWindow.setFullScreen(true);
	// mainWindow.setSimpleFullScreen(true);
	// mainWindow.setIcon()
	// mainWindow.setHasShadow(true);
	mainWindow.setVibrancy("dark");


	// Open the DevTools.
	if (app.getPath('appData').includes("gbete"))
		mainWindow.webContents.openDevTools();
	globalShortcut.register('CommandOrControl+R', () => {

		mainWindow.reload();
	});
	// Emitted when the window is closed.
	mainWindow.on('show', () => console.log('mainWindow SHOW'));
	mainWindow.on('ready-to-show', () => console.log('mainWindow READY-TO-SHOW'));
	mainWindow.on('sheet-begin', () => console.log('mainWindow SHEET-BEGIN'));
	mainWindow.on('closed', () => {
		console.log('mainWindow CLOSED');
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	console.log('app READY');
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
