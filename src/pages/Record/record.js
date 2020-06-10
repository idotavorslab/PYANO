let { safeSwitchCss, $MainContent } = require("pyano_local_modules/document");
let Gui = require("./Gui");

let { EStore } = require("pyano_local_modules/ext_libs");

let { Midi } = require("pyano_local_modules/gilad");
const $ = require("jquery");
let Piano = require("pyano_local_modules/gilad/Piano");
const truthsDirPath = EStore.truthsDirPath();
const log = s => [`%c${s}`, 'color: #a70334'];
const PyFns = () => require("pyano_local_modules/pages/InsideTest/PyFns");

/**@param {Midi} recordMidi*/
async function _startRecord(recordMidi) {
	console.log(...log('_startRecord(recordMidi)'));
	await asx.$fadeOut(Gui.$editableSpan, 300);
	try {
		await recordMidi.newOnOffTxtWriteStreams(_getRecordTruth());
		Gui.animateRecordBtn({ on: true });
		Alert.small.info('Record started');
	} catch (e) {
		console.error(e);
		Alert.small.error("Can't record", e.message);
	}
}

/**@param {Midi} recordMidi
 @param {Piano} animationPiano*/
async function _stopRecord(recordMidi, animationPiano) {
	console.log(...log('_stopRecord(recordMidi, animationPiano)'));
	const truth = _getRecordTruth();


	if ((await truth.txt.on.size()) == 0 || (await truth.txt.off.size()) == 0) {
		await truth.txt.removeAll();
		await Alert.small._warning({ title: 'Nothing was recorded', html: 'Page will reload in 2 seconds', timer: 2000 });
		return reloadPage();
	}

	/*await Python.runAsync('InsideTest/normalize_txt_file.py', { args: [truth.txt.on.path], mode: "json" });

	let msgs = await Python.runAsync('InsideTest/merge_on_off_txt_files.py', {
		args: truth.txt.getAll(),
		mode: "json"
	});
	let { on_off_pairs } = msgs[0];
	*/
	let { on_off_pairs } = await PyFns().merge_on_off_txt_files(truth);

	await recordMidi.endOnOffTxtStreamsAndWriteMidi(on_off_pairs, truth);
	Gui.animateRecordBtn({ on: false });
	Gui.setEditableSpanText(null);
	asx.$fadeIn(Gui.$editableSpan, 0);

	Gui.repopulateTruthFiles()
	   .map($f => $f.click(async e =>
		   await _playTruthFile(e, recordMidi, animationPiano)));
	try {
		EStore.truth_file_path = truth;
		// await EStore.currentConfig().setTruthFilePath(truth);
		Alert.small.success('Saved files', `${truth.txt.getAll().map(t => t.name)}, ${truth.midi.name}`);
	} catch (e) {
		console.warn(e);
		Alert.small.error('Error setting new truth file', e.message);
	}
	animationPiano.dispose();
}

/**@return {Truth}*/
function _getRecordTruth() {
	console.log(...log(`_getRecordTruth()`));
	const recordNameNoExt = Gui.getEditableSpanText();
	const recordPathNoExt = require('path').join(truthsDirPath, recordNameNoExt);
	return new Truth(recordPathNoExt);

}

/**@param e
 @param {Midi} recordMidi
 @param {Piano} animationPiano*/
async function _playTruthFile(e, recordMidi, animationPiano) {
	console.log(...log(`_playTruthFile(e, recordMidi, animationPiano)`));
	const id = e.currentTarget.id;
	const $currentTarget = $(e.currentTarget);
	$currentTarget
		.css('color', 'white')
		.text(id.replaceAll('_', ' ') + ' 🔊');

	const truth = new Truth(require('path').join(truthsDirPath, id));
	const Gilad = require("pyano_local_modules/gilad");
	// const { playMidiFile } = Gilad;
	try {
		await Gilad.playMidiFile({ truth, animationPiano });
		$currentTarget
			.css('color', 'rgba(255,255,255,0.65)')
			.text(id.replaceAll('_', ' ') + ' 🔈');
	} catch (e) {
		console.error(e);
		Alert.small.error("Can't play", e);
	}
}


const recordPage = {
	/**@param {boolean} reload*/
	switch: async reload => {
		EStore.last_page = 'record';
		if (reload)
			return reloadPage();

		await asx.$fadeOut($MainContent, 100);
		require("pyano_local_modules/sidebar/index.js").to_record();
		$MainContent.empty();
		safeSwitchCss("templates/css/record.css");

		$MainContent.append(
			Gui.$recordBtn,
			Gui.$inputDiv,
			Gui.$recordPath,
			Gui.truthFilesDiv
		);

		let recordMidi = new Midi({ name: 'record.recordMidi', muteUserPiano: true });

		let animationPiano = new Piano(`file:///${EStore.salamanderDirPath()}`, 'record.animationPiano').toMaster();
		animationPiano.load();
		await asx.$fadeInMany(150, $MainContent);
		let alreadyRecording = false;
		Gui.$getTruthFiles()
		   .map(async $f =>
			   $f.click(async e =>
				   await _playTruthFile(e, recordMidi, animationPiano)
			   )
		   );
		Gui.$recordBtn.click(async () => {
			if (!alreadyRecording) {

				await _startRecord(recordMidi);

			} else {
				try {
					await _stopRecord(recordMidi, animationPiano);
				} catch (e) {
					console.warn(e);
					await Alert.big.warning({
						title: 'Stopping record failed',
						html: e.message,
						confirmButtonText: 'Reload (recommended)',
					});
					const truth = _getRecordTruth();
					await truth.txt.removeAll();
					return reloadPage();

				}
			}
			alreadyRecording = !alreadyRecording;
		});
	}
};
module.exports = recordPage;