console.group(`index.js`);


const path = require('path');

const fs = require('fs');

import { Sidebar } from "./sidebar.js";
import * as pages from "./pages/pages.js"

const { remote } = require('electron');
const Store = require("electron-store");
const store = new Store();

console.table({
    "process.platform": process.platform,
    __dirname,
    "store.path": store.path,
    "remote.app.getPath('userData')": remote.app.getPath('userData'),
});
console.log(`process.argv:\n\t${process.argv.join("\n\t")}`);


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
console.table({ rootPath, enginePath, pyExecPath });

pyShell.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};
const configfilepath = path.join(remote.app.getPath('userData'), 'config.json');
let pythonDone = false;
if (fs.existsSync(path.join(enginePath, 'check_create_config_file.py'))) {
    try {
        console.log(`%crunning check_create_config_file.py, configfilepath: ${configfilepath}`, 'font-weight: 700');
        pyShell.run("check_create_config_file.py", {
            mode: "json",
            args: [ configfilepath, rootPath ]
        }, (err, output) => {
            if (err) {
                console.error(err);
            } else {
                console.group(`check_create_config_file.py output:`);
                output.map(console.log);
                console.groupEnd();
            }
            pythonDone = true;
        });
    } catch (e) {
        console.error('Error running check_create_config_file:', e);
    } finally {
        console.groupEnd();
    }
} else {
    console.warn(`'check_create_config_file.py' does not exist, skipped check_create_config_file.py`);
}
if (fs.existsSync(store.path)) {
    console.group(`trying to get last page from store.path (${store.path})...`);
    let last_page = store.get('last_page');
    console.log('last_page: ', last_page);
    if (last_page === 'inside_test') {
        console.log('last page is inside_test, changing to new_test');
        store.set('last_page', 'new_test');
    }
    console.groupEnd();
} else {
    alert(`store.path (${store.path}) does not exist! this shouldn't happen! see logs`)
}
for (let d of [ 'configs', 'subjects', 'truths' ]) {
    let subdir = path.join(rootPath, 'experiments', d);
    if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
        console.warn(`created subdir: ${subdir}`)
    }

}

export const $PageCss = $('#page_css');
// export const $Sidebar = $('#sidebar');
export const $Title = $('#title');
export const $MainContent = $('#main');

/*$Sidebar._fadeTo = $Sidebar.fadeTo;
$Sidebar.fadeTo = (speed, to, easing, callback) => {
    // [...$Sidebar[0].children].forEach(item=>item.classList.add('unclickable'));
    $Sidebar[0].classList.toggle('unclickable', to == 0);
    return $Sidebar._fadeTo(speed, to, easing, callback);
};*/

Sidebar.select(store.get('last_page'));

/*function safeSwitchCss(href) {
    if ($PageCss.attr('href') != href) {
        $PageCss.attr('href', href);
    }
}*/

// sidebar.build();

console.log('index.js EOF');
console.groupEnd();
