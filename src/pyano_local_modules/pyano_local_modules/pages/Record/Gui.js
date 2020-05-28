// **pages/Record/Gui.js
const $ = require('jquery');
let { EStore } = require("pyano_local_modules/ext_libs");
const fs = require("fs");


function animateRecordBtn({ on }) {
	const animationClass = 'animated infinite pulse slower';
	$recordBtn.toggleClass(animationClass, on);


}

function _maybeActivateRecBtn() {
	let recordName = getEditableSpanText();
	// illegal characters checked $inputDiv key down => _preventIfIllegalChar()
	let anyInput = bool(recordName);

	// $inputDiv.toggleClass('input-missing', !anyInput);
	$recordBtn
		.toggleClass('inactive-btn', !anyInput)
		.css({
			background: anyInput
			            ? 'red'
			            : 'grey'
		});
	$placeholderSpan
		.text(anyInput
		      ? ''
		      : 'Record File Name');

	let value = `File will be saved to: ${truthsDirPath}\\`;
	if (anyInput)
		value += `${recordName}.txt`;

	$recordPath.html(value);
}

/**@param {jQuery.Event} e*/
function _preventIfIllegalChar(e) {

	const k = e.originalEvent.key;
	if (!RegExp('[a-zA-Z0-9\_]$').test(k)) {
		e.preventDefault();
		let fancy = `<b style="color: #dc3545; padding: 0 10px">${k}</b>`;
		console.log("about to fire fancy");
		Alert.small.info(`Can't have "${fancy}" in file name.`, `Separate words with underscore. No extension.`);
	}

}

/**@param {?string} val
 * @return {string}*/
function setEditableSpanText(val) {
	let prevVal = getEditableSpanText();
	$editableSpan.text(bool(val)
	                   ? val
	                   : '');
	_maybeActivateRecBtn();
	return prevVal.lower();
}

/**@return {string}*/
function getEditableSpanText() {
	return $editableSpan.text().lower();
}


const truthsDirPath = EStore.truthsDirPath();

// **Record Button
let $recordBtn = $('<button class="inactive-btn" id="record_btn">')
	.html('REC');

// **Record Name Input
let $editableSpan = $('<span class="input-div-editable-span">')
	.attr({ contenteditable: true })
	.on('input', _maybeActivateRecBtn);

let $placeholderSpan = $('<span class="input-div-autocomplete-span">')
	.text('Record File Name');

// when clicked, $editableSpan is focused
let $inputDiv = $('<div class="input-div" id="record_name">')
	.click(() => $editableSpan.focus())
	.keydown(_preventIfIllegalChar)
	.append(
		$('<div class="input-div-inner-container">')
			.append($editableSpan, $placeholderSpan)
	);


// **Record Path
let $recordPath = $('<div id="record_path">')
	.html(`File will be saved to: ${truthsDirPath}\\`);


const truthFilesNoExt = fs.readdirSync(truthsDirPath)
                          .map(fsx.remove_ext);
let _$truthFiles = _$constructTruthFiles(truthFilesNoExt);
let truthFilesDiv = $('<div id="truth_files_div">')
	.append(
		'<p id="truth_files_title">Truth Files</p>',
		$('<div id="truth_files_items">').append(_$truthFiles)
	);

function _$constructTruthFiles(truthFilesNoExt) {
	return [...new Set(truthFilesNoExt)]
		.filter(f => truthFilesNoExt.count(f) >= 2)
		.map(f =>
			$(`<div id="${f}">${f}</div>`)
				.css({
					color: 'rgba(255, 255, 255, 0.65)',
					fontFamily: "Roboto Light",
					marginBottom: '0.5vh',
					cursor: 'pointer'
				})
				.text(f.replaceAll('_', ' ') + ' 🔈'));
}

function $getTruthFiles() {return _$truthFiles;}

function repopulateTruthFiles() {
	let truthFilesNoExt = EStore.truthFilesList().map(fsx.remove_ext);
	_$truthFiles = _$constructTruthFiles(truthFilesNoExt);
	$('#truth_files_items').empty().append(_$truthFiles);
	return _$truthFiles;
}

module.exports = {
	truthFilesDiv, $recordBtn, $editableSpan,
	$inputDiv, $recordPath, setEditableSpanText, repopulateTruthFiles,
	animateRecordBtn, getEditableSpanText, $getTruthFiles
};

