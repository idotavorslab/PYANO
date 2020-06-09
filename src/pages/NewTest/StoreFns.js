const { EStore } = require("pyano_local_modules/ext_libs");
const Gui = require("./Gui");
const LevelsPart = () => require("./Parts/parts").LevelsPart;

const { remote } = require("electron");
const fs = require("fs");
const Path = require('path');
const PyFns = () => require("./PyFns");

function saveExperiment() {
	console.log(...small(`NewTest.StoreFns.saveExperiment()`));
	const levels = LevelsPart().getLevelsArr().toTLevels();
	const config = EStore.config();
	config.levels = levels;
	_saveExperimentToFile(Path.join(EStore.root_abs_path, config.save_path));
	return Alert.small.success(`Saved ${EStore.experiment_type} to ${config.save_path}.`);


}

/**@param {string} configfilepath - abs path to config
 * @param {Truth?} truth
 * @return {string} savePath*/
function _saveExperimentToFile(configfilepath, truth = undefined) {
	const experimentType = Path.extname(configfilepath).slice(1);
	if (!experimentType.in(['exam', 'test']))
		throw new Error(`Bad configfilepath, legal extensions: exam or test. configfilepath: ${configfilepath}`);
	const config = EStore.config(experimentType);
	let data = config.toTSavedConfig();
	if (truth)
		data.truth_file_path = Path.join('experiments', 'truths', `${truth.name}.txt`);
	console.log('_saveExperimentToFile(), data:', data);
	data = JSON.stringify(data, null, 4);
	fs.writeFileSync(configfilepath, data);

	const savePath = Path.relative(EStore.root_abs_path, configfilepath);
	config.save_path = savePath;
	return savePath;

}

async function saveExperimentAs() {
	console.log(...small(`NewTest.StoreFns.saveExperimentAs()`));


	const experimentType = EStore.experiment_type;
	const dialogOptions = {
		defaultPath: EStore.configsPath(),
		// filters: [{ name: "JSON", extensions: ['json'] }],
		filters: [{ name: experimentType, extensions: [experimentType] }],
		title: `Save ${experimentType} to file...`
	};

	remote.dialog.showSaveDialog(getCurrentWindow(), dialogOptions, (configfilepath) => {
		console.log('saveExperimentAs()', { configfilepath });
		if (configfilepath === undefined)
			return Alert.small.info("Aborting", `No ${experimentType} file saved.`);
		try {
			const savePath = _saveExperimentToFile(configfilepath);
			Gui.setSavePathSubtitle(savePath);
			Alert.small.success(`Saved to ${savePath}`);
		} catch (e) {
			Alert.small.error(`Failed to save "${fsx.basename(configfilepath)}"`, e.message);
		}

	});
}

/**@param {string} configfilepath - abs path to config*/
async function loadExperimentFromFile(configfilepath) {
	try {
		await PyFns().validate_fix_saved_config_file(configfilepath);
	} catch (e) {
		console.error(e);
		return Alert.small.error(`Failed loading file`, e.message);
	}
	const savePath = Path.relative(EStore.root_abs_path, configfilepath);
	const experimentType = Path.extname(configfilepath).slice(1);
	const config = EStore.config(experimentType);
	config.save_path = savePath;
	/**@type {TSavedConfig}*/
	const data = JSON.parse(await fs.readFileSync(configfilepath));
	EStore.fromSavedConfig(data, experimentType);


	Gui.setSubjectSubtitle(config.current_subject);
	Gui.setTruthSubtitle(EStore.truth());
	Gui.setSavePathSubtitle(savePath);
	return reloadPage();
}

function loadExperiment() {
	console.log(...small(`NewTest.StoreFns.loadExperiment()`));

	const dialogOptions = {
		properties: ['openFile'],
		defaultPath: EStore.configsPath(),
		// filters: [{ name: 'JSON', extensions: ['json'] }],
		filters: [{ name: "exam", extensions: ['exam', 'test'] }],
		title: "Load config file..."
	};
	remote.dialog.showOpenDialog(getCurrentWindow(), dialogOptions, async files => {
		console.log('loadExperiment()', { files });
		if (!bool(files))
			return Alert.small.info("No files chosen", "Nothing changed.");

		const configfilepath = files[0];
		try {
			await loadExperimentFromFile(configfilepath);
		} catch (e) {
			console.error(e);
			Alert.small.error('Failed to load config', e.message);
		}


	});

}


/**@param {string} truthfilepath - abs path to txt*/
async function setNewTruth(truthfilepath) {
	console.log(...small(`NewTest.StoreFns.setNewTruth(${truthfilepath})`));
	const truthsDirPath = EStore.truthsDirPath();
	if (fsx.dirname(truthfilepath).lower() != truthsDirPath.lower())
		return Alert.small.warning(`File "${fsx.basename(truthfilepath)}" isn't in truths dir`, `Place it here: ${truthsDirPath}`);

	try {
		const truth = new Truth(fsx.remove_ext(truthfilepath));
		const { value: configname } = await Alert.big.blocking({
			input: 'text',
			title: 'Insert new config file name',
			inputPlaceholder: truth.name,
			inputValue: truth.name,
			inputValidator: async input => {
				if (!RegExp('[a-zA-Z0-9\_]$').test(input))
					return "Only letters, numbers or underscores";

			}
		});

		const configfilepath = Path.join(EStore.configsPath(), configname);
		const examExists = await fsx.path_exists(`${configfilepath}.exam`);
		const testExists = await fsx.path_exists(`${configfilepath}.test`);
		if (examExists || testExists) {
			const overwrite = await Alert.big.blocking({
				title: `${Path.basename(configfilepath)} already exists, overwrite?`,
				type: 'warning'
			});
			if (!overwrite.value) {
				return Alert.small.info('Aborted', 'Nothing changed');
			} else {
				if (examExists)
					fsx.remove(`${configfilepath}.exam`);
				if (testExists)
					fsx.remove(`${configfilepath}.test`);
			}
		}
		await _saveExperimentToFile(`${configfilepath}.exam`, truth);
		await _saveExperimentToFile(`${configfilepath}.test`, truth);
		Gui.setSavePathSubtitle(EStore.config().save_path);
		EStore.truth_file_path = truth;
		Gui.setTruthSubtitle(truth);
		Alert.small._success({
			title: `Set new truth to "${truth.name}", and created 2 config files`,
			text: `${Path.basename(configfilepath)}.exam, ${Path.basename(configfilepath)}.test`,
			timer: 6000
		});


	} catch (err) {
		console.warn(err);
		return Alert.small.error('Failed setting truth file', err.message);
	}


}

// TODO: unused before clicking truth subtitle no longer launches load dialog
/*function browseAndSetNewTruth() {


	const currentWindow = remote.getCurrentWindow();

	const dialogOptions = {
		properties: ['openFile'],
		defaultPath: EStore.truthsDirPath(),
		filters: [{ name: 'Text', extensions: ['txt'] }],
		title: "Load truth file..."
	};
	remote.dialog.showOpenDialog(currentWindow, dialogOptions, files => {
		console.log({ files });
		if (!bool(files))
			return Alert.small.info("No file chosen", "Nothing changed.");

		setNewTruth(files[0]);
	});
}
*/


module.exports = {
	// browseAndSetNewTruth,
	loadExperiment,
	loadExperimentFromFile,
	saveExperiment,
	saveExperimentAs,
	setNewTruth,
};