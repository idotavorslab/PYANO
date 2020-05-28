const { strong } = require("pyano_local_modules/util");
const { EStore } = require("pyano_local_modules/ext_libs");
const StoreFns = () => require("./StoreFns");
const LevelsPart = () => require("./Parts/LevelsPart");
const Path = require('path');

function setSubjectSubtitle(val) {
	val = bool(val) ? val : '--';
	$subjectSubtitle
		.html(`Subject: ${strong(val)}`);
}

/**@param {Truth} truth
 * @param {number} numOfNotes*/
function setTruthSubtitle(truth, numOfNotes = undefined) {
	if (numOfNotes === undefined)
		numOfNotes = truth.numOfNotes();
	$truthSubtitle
		.html(`Truth: ${strong(truth.name)} (${numOfNotes} notes)`);
}

/**@param {string} savePath*/
function setSavePathSubtitle(savePath) {
	$savePathSubtitle.html(`Config: ${strong(Path.basename(savePath))}`);
}

/** Warn user and return false if input missing */
function toggleInputDiv($inputDiv, { bad }) {
	if (bad) {
		$inputDiv.addClass('input-missing');
		Alert.small._warning({
			title: 'Fill subject Id',
			html: 'Marked in red',
			onAfterClose: () => $inputDiv.removeClass('input-missing')
		});

		return false;
	} else {
		$inputDiv.removeClass('input-missing');
		return true;
	}
}

/**@param {boolean} noZeroes*/
function toggleButtons(noZeroes) {
	$readyBtn.add($saveBtn).add($saveAsBtn).toggle(noZeroes);

}

/**@return {jQuery}*/
function $readySaveLoadSaveas() {
	return $loadConfigBtn.add($readyBtn).add($saveBtn).add($saveAsBtn);
}

async function _startTestIfReady() {
	const TLevels = LevelsPart().getLevelsArr().toTLevels();
	const config = EStore.config();
	if (!bool(config.current_subject))
		return await Alert.small.warning("Please specify current subject.");
	config.levels = TLevels;

	const truth = EStore.truth();
	const missingTxts = await truth.txt.getMissing();
	if (bool(missingTxts))
		return await Alert.small.warning(`Some text files are missing, namely: ${missingTxts.map(_f => _f.name)}`, "Use File Tools Page.");
	if (!(await truth.midi.exists()))
		return await Alert.small.warning(`Couldn't find midi file of truth: "${truth.name}"`, "Use File Tools Page.");

	if (config.isDemoVideo()) {
		const missingNames = [];
		if (!(await truth.mp4.exists()))
			missingNames.push(truth.mp4.name);

		if (!(await truth.onsets.exists()))
			missingNames.push(truth.onsets.name);

		if (bool(missingNames)) {
			const missing = missingNames.length > 1 ? missingNames : missingNames[0];
			console.warn('_startTestIfReady()', { missing });
			return await Alert.small.warning(`Demo type is set to video, I'm missing: ${missing}`, "Use File Tools Page.");
		}
	}


	require("pyano_local_modules/pages/pages").toPage('inside_test', true);
}


const _current_subject = EStore.config().current_subject;
const $subjectSubtitle = $('<div id="page_subtitle_current_subject">')
	.html(`Subject: ${bool(_current_subject) ? strong(_current_subject) : '--'}`);

const $truthSubtitle = $('<div>Truth:</div>');


const $savePathSubtitle = $(`<div>Config: ${strong(Path.basename(EStore.config().save_path))}</div>`);
const $subtitle = $('<div class="subtitle" id="page_subtitle">')
	.append($subjectSubtitle, $truthSubtitle, $savePathSubtitle);

const $readyBtn = $('<button id="page_ready_btn">')
	.html('Ready')
	.click(_startTestIfReady);

const $saveBtn = $('<button id="page_save_btn">')
	.html("Save")
	.click(async () => {
		$saveBtn.deactivate();
		await StoreFns().saveExperiment();
		$saveBtn.activate();
	});


const $saveAsBtn = $('<button id="page_save_as_btn">')
	.html("Save As...")
	.click(async () => {
		const storeFns = StoreFns();
		// storeFns.saveExperiment();
		storeFns.saveExperimentAs();
	});

const $loadConfigBtn = $('<button id="page_load_config_btn">')
	.html("Load Config...")
	.addClass('active-btn')
	.click(async () => StoreFns().loadExperiment());

$readyBtn.add($saveBtn).add($saveAsBtn)
         .addClass('inactive-btn');


module.exports = {
	toggleButtons,
	toggleInputDiv,
	setSubjectSubtitle,
	setTruthSubtitle,
	setSavePathSubtitle,
	$readySaveLoadSaveas,
	$subtitle,
};
