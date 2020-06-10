let {safeSwitchCss, $MainContent, $Title, $Sidebar} = require("pyano_local_modules/document");
let {EStore} = require("pyano_local_modules/ext_libs");
let PyFns = require("./PyFns");
const Pages = () => require("pyano_local_modules/pages/pages");

let {$pageSubtitle, $bigMessage, $smallMessage, $smallMessageSecondary, $bigButton, $skipButton, animation, video} = require("./Gui");
const Gui = require("./Gui");
const Gilad = require("pyano_local_modules/gilad");
const Piano = require("pyano_local_modules/gilad/Piano");
const fs = require("fs");

function log(s, {b, u, sm} = {}) {
    b = b ? 'font-weight:900;' : '';
    sm = sm ? 'font-size:10px;' : '';
    u = u ? 'text-decoration:underline overline;' : '';
    return [`%cinsidetest.${s}`, `color: #007acc; ${b} ${sm} ${u}`];
}


/**@param {Midi} userMidi
 @param {Piano} animationPiano
 @param {Truth} truth
 @param {DoneTrialResult} doneTrialResult
 @return {Promise<Truth>}*/
async function _runTrial({userMidi, animationPiano, truth, doneTrialResult = undefined}) {
    const config = EStore.config();
    const levels = config.getLevels();
    console.log(...log(`[L${levels.current.index},T${levels.current.internalTrialIndex}]_runTrial(userMidi, animationPiano, truth, doneTrialResult = `, {
        b: true,
        u: true
    }), doneTrialResult);
    Gui.updateLevelTrialSubtitles(levels, truth);
    let playLevelIntro;
    if (EStore.dev.skip_level_intro()) {
        playLevelIntro = false;
        console.log(...log('skip_level_intro', {sm: true}));
    } else {
        if (doneTrialResult && doneTrialResult.advance_trial === false) {
            playLevelIntro = false;
        } else {
            playLevelIntro = levels.current.isFirstTrial();
        }
    }

    if (playLevelIntro) {
        await Gui.playLevelIntro({animationPiano, levels, truth});
    }
    await Gui.show$smallMessageAndGreenPrompt(levels.current);
    const trialTruth = config.trialTruth();

    return await userMidi.newOnOffTxtWriteStreams(trialTruth);

}


/**@param {Midi} userMidi
 @param {Piano} animationPiano
 @param {Truth} truth
 @param {Truth} trialTruth
 @return {Promise<DoneTrialResult>}*/
async function _handleDoneTrial(userMidi, animationPiano, truth, trialTruth) {
    console.log(...log('_handleDoneTrial(userMidi, animationPiano, trialTruth)', {b: true}));


    let {on_off_pairs} = await PyFns.merge_on_off_txt_files(trialTruth);
    const config = EStore.config();
    await userMidi.endOnOffTxtStreamsAndWriteMidi(on_off_pairs, trialTruth);
    // "played_enough_notes" can be false only if didn't pass, otherwise it's true
    // "played_too_many_notes" can be false even if user passed
    // let { passed, mistakes, is_tempo_correct, played_enough_notes, played_too_many_notes } = await PyFns.check_done_trial(truth, trialTruth);
    const doneTrialResult = await PyFns.check_done_trial(truth, trialTruth);

    const levels = config.getLevels();
    console.log(...log('devoptions', {sm: true}), EStore.get('devoptions'));
    if (doneTrialResult.passed && !EStore.dev.skip_passed_trial_feedback()) {
        await Gui.showPassedTrialFeedback(animationPiano, levels, doneTrialResult, truth);
    } else if (!EStore.dev.skip_failed_trial_feedback()) {// did not pass
        await Gui.showFailedTrialFeedback(animationPiano, levels, doneTrialResult, truth);
    }
    if (skipFade) {
        skipFade = false;
    }
    if (doneTrialResult.advance_trial == false) {
        // don't increase if got wrong accuracy when checking rhythm
        let failIndex = 0;
        console.log(`Trying to rename ${trialTruth.pathNoExt} with failIndex: ${failIndex}`);
        let newPath = `${trialTruth.pathNoExt}_ACCFAIL_${failIndex}`;
        let newPathExists = await fsx.path_exists(`${newPath}.txt`);
        while (newPathExists) {

            failIndex += 1;
            console.log(`\tFile exists, trying failIndex: ${failIndex}`);
            newPath = `${trialTruth.pathNoExt}_ACCFAIL_${failIndex}`;
            newPathExists = await fsx.path_exists(`${newPath}.txt`);
        }
        console.log(`\trenaming to: ${newPath}`);
        const newTruth = new Truth(newPath);
        await trialTruth.txt.renameByOtherTxt(newTruth.txt);
        await trialTruth.midi.renameByOtherFile(newTruth.midi);
    } else { // it's undefined when subject passed
        config.finished_trials_count++;

    }
    return doneTrialResult;


}

async function _maybeCreateOutputDir() {
    console.log(...log('_maybeCreateOutputDir()', {sm: true}));
    const outputDir = EStore.config().testOutPath();
    let exists = await fsx.path_exists(outputDir);

    if (!exists) {
        await fsx.mkdir(outputDir + '/', {recursive: true});
    } else {
        fs.stat(outputDir, async (err, stats) => {

            let datestr = stats.ctime.human();
            await fs.renameSync(outputDir, `${outputDir}_${datestr}`);
            await fsx.mkdir(outputDir + '/', {recursive: true});


        });
    }


}

/**@param {Midi} userMidi
 @param {Truth} truth*/
async function _maybeWriteMidiFileFromTxt(userMidi, truth) {
    console.log(...log('_maybeWriteMidiFileFromTxt(userMidi, truth)', {sm: true}));
    if (await !truth.txt.allExist()) {
        return Promise.reject(`_maybeWriteMidiFileFromTxt, not all txt files exist for truth: "${truth.name}"`);
    }


    if (await truth.midi.exists()) // good
    {
        return;
    }

    await PyFns().merge_on_off_txt_files(truth);
    const {on_off_pairs} = await PyFns().merge_on_off_txt_files(truth);
    await Gilad.toMidiFromMessages(on_off_pairs, truth);
}

async function _maybeAlertBadConfig() {
    console.log(...log('_maybeAlertBadConfig()', {sm: true}));
    const config = EStore.config();
    const levels = config.getLevels();
    if (levels.someHaveZeroes()) {
        await Alert.big.blocking({
            title: `I found at least one level with "zero" notes or trials`,
            html: 'You will be redirected to New Test page',
            showCancelButton: false,
        });
        return Pages().newTestPage.switch(true);
    }
    for (let slicedLevels of levels.slicesByNotes()) {
        for (let level of slicedLevels) {
            if (!level.rhythm && level.index != 0) {
                await Alert.big.blocking({
                    title: `One rhythm-less level (index: ${level.index}) is preceded by a rhythm level with the same number of notes`,
                    html: 'You will be redirected to New Test page',
                    showCancelButton: false,
                });
                return Pages().newTestPage.switch(true);
            }
        }
    }


}

/**@param {Truth} truth*/
async function _maybeAlertNoVideo(truth) {
    console.log(...log('_maybeAlertNoVideo(truth)', {sm: true}));
    const config = EStore.config();
    if (!config.isDemoVideo()) {
        return;
    }
    if (await truth.mp4.exists()) {
        return;
    } // good
    let movexists = await truth.mov.exists();
    let html = movexists
        ? `Looks like a .mov file exists though. Go to File Tools?`
        : `A .mov file doesn't exist either. Switch to Animation mode?`;
    let {value} = await Alert.big.warning({
        title: `Can't find a video file: ${truth.mp4.name}`,
        html,
        showCancelButton: false
    });

    if (value) {
        if (movexists) {
            return Pages().fileToolsPage.switch(true);
        } else {
            config.demo_type = 'animation';
            return reloadPage();
        }
    }

}

/**@param {Truth} truth*/
async function _maybeCreateOnsetsJson(truth) {
    console.log(...log('_maybeCreateOnsetsJson(truth)', {sm: true}));
    const config = EStore.config();
    if (!config.isDemoVideo()) {
        return;
    }

    if (!(await truth.onsets.exists())) {
        await Alert.big.blocking({
            title: `Can't find onsets file: ${truth.onsets.name}`,
            html: 'You will be redirected to File Tools page',
            showCancelButton: false,
        });
        return Pages().fileToolsPage.switch(true);

    } else {
        let data = JSON.parse(await fs.readFileSync(truth.onsets.path));
        if (("onsets" in data) && ("first_onset_index" in data)) {
            return;
        } // good

        console.log('\tonsets file doesnt have both "onsets" and "first_onset_index" keys');
        await Alert.big.blocking({
            title: `Onsets file seems currupt: ${truth.onsets.name}`,
            html: 'You will be redirected to File Tools page',
            showCancelButton: false
        });
        return Pages().fileToolsPage.switch(true);


    }


}

const insideTestPage = {
    switch: async reload => {
        console.group(`insideTestPage.switch(${reload})`);
        document.getElementById('main').classList.add('nocursor');
        await asx.$fadeOutMany(100, $MainContent, $Sidebar, $Title);
        EStore.last_page = 'inside_test';
        EStore.config().finished_trials_count = 0;
        if (reload) {
            return reloadPage();
        }


        Alert.small._info({
            title: 'Checking for missing files...',
            timer: 1000,
            onAfterClose: () => Alert.small._success({title: 'File check passed', timer: 1000})
        });

        // User plays it, does all the txt/mid writing
        const userMidi = new Gilad.Midi({name: 'insidetest.userMidi', muteUserPiano: true});
        // Passively plays the midi animation
        /**@type {Piano}*/
        const animationPiano = new Piano(`file:///${EStore.salamanderDirPath()}`, 'insidetest.animationPiano').toDestination();
        animationPiano.setVolume('note', 5);
        animationPiano.load();

        const truth = EStore.truth();
        await asx.concurrent(
            _maybeCreateOutputDir(),
            _maybeWriteMidiFileFromTxt(userMidi, truth),
            _maybeAlertBadConfig(),
            _maybeAlertNoVideo(truth),);

        // Video file exists for sure because of _maybeAlertNoVideo
        await _maybeCreateOnsetsJson(truth);

        $MainContent.empty();
        require("pyano_local_modules/sidebar").to_inside_test();
        safeSwitchCss("templates/css/inside_test.css");

        let config = EStore.config();
        if (config.isDemoVideo()) {
            await video.init(truth);
        }
        $MainContent.append(
            $pageSubtitle,
            $bigMessage,
            $smallMessage,
            $smallMessageSecondary,
            $bigButton,
            $skipButton,
            animation.$element,
            video.$element);

        $Title.text(`testing ${config.current_subject}`.title());
        const levels = config.getLevels();
        Gui.updateLevelTrialSubtitles(levels, truth);
        await asx.$fadeIn($MainContent, 300);
        console.groupEnd();

        // Don't play whole truth demo if we're in exam, or dev skips
        if (EStore.experiment_type != "exam" && !EStore.dev.skip_whole_truth()) {
            await Gui.playWholeTruth(animationPiano, truth, levels.maxNotes());
        } else {
            console.log(...log('skipping whole truth demo', {sm: true}));
        }

        let trialTruth = await _runTrial({userMidi, animationPiano, truth});
        Gui.$bigButton
            .click(async () => {

                console.log(...log('$bigButton clicked'));
                if ((await trialTruth.txt.on.size()) == 0 || (await trialTruth.txt.off.size()) == 0) {
                    return Alert.small.warning('Please play something');
                }
                document.getElementById('main').classList.add('nocursor');
                let doneTrialResult = await _handleDoneTrial(userMidi, animationPiano, truth, trialTruth);

                let config = EStore.config();
                if (!config.isWholeTestOver()) {
                    console.log(...log('Test aint over!'));
                    trialTruth = await _runTrial({
                        userMidi,
                        animationPiano,
                        truth,
                        doneTrialResult
                    });
                    // No more logic - user should click $bigButton

                } else {
                    animationPiano.dispose();
                    await Gui.showTestCompleteMessages();
                }
            });


    }
};
module.exports = insideTestPage;