const MyStore = require("./store");

const Path = require('path');
/**@type {MyStore}*/
const EStore = new MyStore();
const Python = require("python-shell").PythonShell;
const enginePath = Path.join(EStore.get('root_abs_path'), "engine");
const pyExecPath = Path.join(enginePath, "env/Scripts/python.exe");
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
 * @type {{Path: module:path, EStore: MyStore, Python: PythonShell}}
 */
module.exports = {EStore, Path, Python};
