// import { MyStore } from "./MyStore";
import { MyStore } from "./MyStore";

console.group(`ext_libs.ts`);


// import * as path from "path";
const path = require('path');
export const Python = require('python-shell');
// const path = require('path');
export const EStore = new MyStore();
// const Python = require("python-shell").PythonShell;
const enginePath = path.join(EStore.get('root_abs_path'), "engine");
const pyExecPath = path.join(enginePath, process.platform === 'win32' ? "env/Scripts/python.exe" : "env/bin/python");
Python.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};
// @ts-ignore
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


console.log('ext_libs.ts EOF');
console.groupEnd();