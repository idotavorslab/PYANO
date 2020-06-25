// ** pages/NewTest/newtest.js
console.group(`pages/NewTest/newtest.js.js`);
import * as EXTLIBS from "./../../ext_libs.js"

const { EStore } = EXTLIBS;
const { safeSwitchCss, $MainContent, $Sidebar } = require("pyano_local_modules/document");
const Gui = require("./Gui");
const { SubjectPart, LevelsPart, SettingsPart } = require("./Parts/parts");


const newTestPage = {

    /**@param {boolean} reload*/
    switch: async reload => {
        EStore.config().finished_trials_count = 0;
        EStore.last_page = 'new_test';
        if (reload) {
            return reloadPage();
        }

        await asx.$fadeOut($MainContent, 100);
        $MainContent.empty();
        $MainContent.on({
            'dragover dragenter': e => {
                e.preventDefault();
                e.stopPropagation();
            },
            'drop': async e => await require("./DragDrop").onDrop(e)
        });
        require("pyano_local_modules/sidebar").to_new_test();
        safeSwitchCss("templates/css/new_test.css");
        const config = EStore.config();
        const truth = EStore.truth();

        Gui.setTruthSubtitle(truth);

        let subjectsList = config.getSubjectDirNames();
        $MainContent.append(
            Gui.$subtitle,
            SubjectPart.$Div,
            SettingsPart.$Div,
            LevelsPart.$Div,
            Gui.$readySaveLoadSaveas(),
        );
        EStore.subjects = subjectsList;


        await asx.$fadeInMany(150, $Sidebar, $MainContent);
        const levels = config.getLevels();

        for (let lvl of levels) {
            const $lvl = LevelsPart.addLevel();
            $lvl.$notesSelect.val(lvl.notes);
            if (lvl.rhythm != $lvl.$rhythmSwitch.val())
                $lvl.$rhythmSwitch.click();

            if (lvl.rhythm)
                $lvl.$tempoSelect.val(lvl.tempo);

            $lvl.$trialsSelect.val(lvl.trials);
        }
        Gui.toggleButtons(!levels.someHaveZeroes());
        let triviaShown = false;
        setInterval(() =>
            require('electron').remote.powerMonitor.querySystemIdleTime(time => {
                if (!triviaShown && time == 20) {
                    triviaShown = true;

                    const trivias = [
                        'Pressing Alt+C while experiment is running shows the (usually hidden) mouse cursor.',
                        'Pressing Ctrl+R reloads current page. (Reloading mid-test starts it all over again. Data isn’t lost, though)',
                        'Pressing Ctrl+Q takes you back to New Experiment page. Useful when controls are hidden, or when something’s not right.',
                        'Pressing Ctrl+Y opens DevTools. Useful when you want precise details about what the app did, since current page started.',
                        'Pressing Ctrl+U shows or hides the window top menu. Useful should you want to resize it or move it around.',
                        'There is currently no way to stop "Did you know?" tips from appearing.',
                        'If missing, Pyano will automatically create a midi file upon starting an experiment.',
                        'Right now, you can drag drop a .txt / .exam / .test file and Pyano will load it.',
                    ];
                    Alert.small._question({
                        title: 'Did you know?',
                        text: trivias[round(Math.random() / (1 / trivias.length))],
                        timer: null,
                        showConfirmButton: true,
                        confirmButtonText: 'Cool, thanks'
                    });
                }
            }), 1000);

    }

};
module.exports = newTestPage;
console.groupEnd();