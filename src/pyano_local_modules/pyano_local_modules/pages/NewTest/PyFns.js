let {Python, EStore} = require("pyano_local_modules/ext_libs");


/**@param {string} configfilepath - abs path to json*/
async function validate_fix_saved_config_file(configfilepath) {
    await Python.runAsync('NewTest/validate_fix_saved_config_file.py', {
        mode: "json",
        args: [configfilepath, EStore.root_abs_path]
    });
}

module.exports = {validate_fix_saved_config_file};
