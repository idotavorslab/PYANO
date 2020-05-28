// **pages/NewTest/Parts/SubjectPart.js
// const $ = require('jquery');
let {EStore} = require("pyano_local_modules/ext_libs");
let PyFns = () => require("pyano_local_modules/pages/NewTest/PyFns");
// let StoreFns = () => require("pyano_local_modules/pages/NewTest/StoreFns");
let Gui = require("pyano_local_modules/pages/NewTest/Gui");
const fs = require('fs');
const path = require('path');

/**@param {boolean} inputMissing*/
function reset({inputMissing}) {
    if (inputMissing)
        $inputDiv.addClass('input-missing');


    $submitSubjectBtn
        .addClass('inactive-btn')
        .removeClass('active-btn')
        .html('Submit');

    $autocompleteSpan.text('Subject Id');
    $editableSpan.text('');
}

function autoComplete() {
    let subjectIdInputVal = $editableSpan.text().lower();


    if (!bool(subjectIdInputVal))
        return reset({inputMissing: true});

    // autocomplete

    const autocomplete = subjects.find(s => s.startsWith(subjectIdInputVal));
    $inputDiv.removeClass('input-missing');
    $submitSubjectBtn
        .removeClass('inactive-btn')
        .addClass('active-btn')
        .html(subjectIdInputVal);
    $autocompleteSpan
        .text(autocomplete ? autocomplete.substr(subjectIdInputVal.length) : '');
    Alert.close();

}

async function onSubmitSubjectClick() {
    const subjectIdInputVal = $editableSpan.text().lower();
    let ok = Gui.toggleInputDiv($inputDiv, {bad: !bool(subjectIdInputVal)});
    if (ok) {
        const subjectsDirPath = EStore.subjectsDirPath();
        if (!fs.existsSync(subjectsDirPath)) {
            fs.mkdirSync(subjectsDirPath)
        }
        const subject_path = path.join(subjectsDirPath, subjectIdInputVal);
        if (!fs.existsSync(subject_path)) {
            fs.mkdirSync(subject_path)
        }
    }
    reset({inputMissing: false});
    const config = EStore.config();
    config.current_subject = subjectIdInputVal;
    Gui.setSubjectSubtitle(subjectIdInputVal);

}

const subjects = EStore.get('subjects');
const $Div = $('<div id="subject_div">');
const $editableSpan = $('<span class="input-div-editable-span">')
    .attr('contenteditable', true)
    .on('input', autoComplete);

const $autocompleteSpan = $('<span class="input-div-autocomplete-span">')
    .text('Subject Id');

const $inputDiv = $('<div class="input-div" id="subject_id_input_div">')
    .click(() => $editableSpan.focus())
    .keydown(e => {
        // Tab
        if (e.which == 9) {
            const value = $editableSpan.text() + $autocompleteSpan.text();
            $editableSpan.text(value);
            $autocompleteSpan.text('');
            $submitSubjectBtn.html(value);
        } // Todo: if escape clear autocomplete
    })
    .append(
        $('<div class="input-div-inner-container">')
            .append($editableSpan, $autocompleteSpan)
    );

const $submitSubjectBtn = $('<button id="subject_submit_subject_btn">')
    .addClass('inactive-btn')
    .html('Submit')
    .click(onSubmitSubjectClick);


$Div.append(
    $submitSubjectBtn,
    $inputDiv
);

module.exports = {$Div};
