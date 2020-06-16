console.group(`ext_libs.ts`);
import { MyStore } from "./MyStore/index.js";
const path = require('path');
const Python = require('python-shell');
const EStore = new MyStore();
const enginePath = path.join(EStore.get('root_abs_path'), "engine");
const pyExecPath = path.join(enginePath, "env/Scripts/python.exe");
Python.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
};
Python.runAsync =
    (scriptPath, options) => new Promise((resolve, reject) => Python.run(scriptPath, options, (err, response) => {
        if (err) {
            reject(err);
        }
        resolve(response);
    }));
console.log('ext_libs.Ts EOF');
console.groupEnd();
