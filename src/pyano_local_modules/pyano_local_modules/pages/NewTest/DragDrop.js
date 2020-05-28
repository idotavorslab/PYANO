const Path = require('path');

/**@param {string} configfilepath - abs path to config*/
async function configDropped(configfilepath) {
	const experimentType = Path.extname(configfilepath).slice(1);
	const loadExperiment = await Alert.big.blocking({
		title: `Load ${experimentType} from file?`,
		html: fsx.basename(configfilepath)
	});
	if (!loadExperiment.value)
		return Alert.small.info('Aborting', 'Nothing changed');

	try {
		require("./StoreFns").loadExperimentFromFile(configfilepath);
	} catch (e) {
		console.error(e);
		Alert.small.error('Failed loading config', e.message);
	}
}

/**@param {string} truthfilepath - abs path to txt*/
async function truthDropped(truthfilepath) {
	// fix path to base
	if (truthfilepath.endsWith('_off.txt') || truthfilepath.endsWith('_on.txt')) {
		const useBase = await Alert.big.blocking({
			title: 'You dropped an "off" or "on" truth file',
			html: `Should I use the base txt file instead?`
		});
		if (!useBase.value)
			return Alert.small.info('Aborting', 'Nothing changed');
		else
			truthfilepath = truthfilepath.removeAll('_on', '_off');
	} else { // truth path ok. prompt user to set new truth
		const setNewTruth = await Alert.big.blocking({
			title: 'Set new truth?',
			html: fsx.basename(truthfilepath)
		});
		if (!setNewTruth.value)
			return Alert.small.info('Aborting', 'Nothing changed');
	}
	require("./StoreFns").setNewTruth(truthfilepath);
}

async function onDrop(e) {
	getCurrentWindow().focus(); // TODO: may be redundant with "acceptFirstMouse: true"
	let { path, type } = e.originalEvent.dataTransfer.files[0];
	console.log('NewTest.DragDrop.onDrop()', { path, type });
	try {
		// dropped truth file
		if (type == 'text/plain')
			return await truthDropped(path);
		if (type === "" && (path.endsWith('exam') || path.endsWith('test')))
			return await configDropped(path);
		return Alert.small.warning(`Bad file type`, `Can drop either truth (.txt) or config (.exam / .test)`);
	} catch (e) {
		console.error(e);
		Alert.small.error('Failed loading file', e.message);
	}
}

module.exports = { onDrop };
