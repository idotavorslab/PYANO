console.group(`index.js`);
import {BetterHTMLElement} from "./bhe/index.js";

const path = require('path');

const fs = require('fs');
// import * as sidebar from "./sidebar.js";
// * hi
const {remote} = require('electron');
const Store = require("electron-store");
const store = new Store();
console.log(`index.js. process.platform: ${process.platform} 
__dirname: ${__dirname}
process.argv: ${process.argv.join(", ")}
store.path: ${store.path}
app.getPath('userData'): ${remote.app.getPath('userData')}
`);

if (fs.existsSync(store.path)) {
    console.log('trying to get last page from store');
    let last_page = store.get('last_page');
    console.log('last_page: ', last_page);
    if (last_page === 'inside_test') {
        console.log('last page is inside_test, changing to new_test');
        store.set('last_page', 'new_test');
    }
} else {
    alert('store.path not exists! see logs')
}

const pyShell = require("python-shell").PythonShell;
let rootPath; // PYANO/src
if (__dirname.endsWith('src')) {
    rootPath = __dirname;
} else {

    if (path.basename(__dirname).toLowerCase().includes('pyano')) {
        rootPath = path.join(__dirname, 'src')
    } else {
        alert(`bad __dirname: ${__dirname}`)
    }
}
const enginePath = path.join(rootPath, "engine");
const pyExecPath = path.join(enginePath, process.platform === 'win32' ? "env/Scripts/python.exe" : "env/bin/python");
console.log(`rootPath: ${rootPath}
enginePath: ${enginePath}
pyExecPath: ${pyExecPath}
`);

pyShell.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};
const configfilepath = path.join(remote.app.getPath('userData'), 'config.json');
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

export const $PageCss = $('#page_css');
export const $Sidebar = $('#sidebar');
export const $Title = $('#title');
export const $MainContent = $('#main_content').hide();
$Sidebar._fadeTo = $Sidebar.fadeTo;
$Sidebar.fadeTo = (speed, to, easing, callback) => {
    // [...$Sidebar[0].children].forEach(item=>item.classList.add('unclickable'));
    $Sidebar[0].classList.toggle('unclickable', to == 0);
    return $Sidebar._fadeTo(speed, to, easing, callback);
};

function safeSwitchCss(href) {
    if ($PageCss.attr('href') != href) {
        $PageCss.attr('href', href);
    }
}

console.log(BetterHTMLElement);
console.log('store.path: ', store.path);


console.log('index.js EOF');
console.groupEnd();
