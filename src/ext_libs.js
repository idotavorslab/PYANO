console.group(`ext_libs.js`);
import {MyStore} from "./mystore.js";

const path = require('path');
/**@type {MyStore}*/
const EStore = new MyStore();
const Python = require("python-shell").PythonShell;
const enginePath = path.join(EStore.get('root_abs_path'), "engine");
const pyExecPath = path.join(enginePath, "env/Scripts/python.exe");
Python.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};
Python.runAsync =
    /**@param {string} scriptPath
     @param {Options?} options*/
        (scriptPath, options) =>
        new Promise((resolve, reject) =>
            Python.run(scriptPath, options, (err, response) => {
                if (err) {
                    reject(err);
                }
                resolve(response);
            }));

/**
 * @type {{path: module:path, EStore: MyStore, Python: PythonShell}}
 */
module.exports = {EStore, Python};
console.log('ext_libs.js EOF');
console.groupEnd();