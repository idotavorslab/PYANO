// **pages/NewTest/Parts/LevelsPart.js
const _$ = require('jquery');
/**@param elem
 * @param {'button','toggle','select'} type
 * @return {jQuery}*/
const $ = (elem, type = null) => {
    /**@type {jQuery}*/
    const $elem = _$(elem);
    let classes;
    if (type == null)
        return $elem;

    if (type == 'button') {
        classes = {
            off: 'inactive-btn',
            on: 'active-btn'
        };
    } else if (type == 'toggle') {
        classes = {
            off: 'off',
            on: 'on'
        };
        $elem.val = () => $elem.hasClass('on');
    } else if (type == 'select') {

        $elem._val = $elem.val;
        $elem.val = num => {
            // noinspection JSUnresolvedFunction
            let prevVal = $elem._val();
            prevVal = prevVal === null ? null : int(prevVal);
            if (num === undefined)  // GET
                return prevVal;

            // SET
            $elem.prevVal = prevVal;
            // noinspection JSUnresolvedFunction
            $elem._val(num);
            return $elem;

        };
    } else {
        throw new Error(`recevied type: "${type}", can be either button or toggle`);
    }
    if (type != "select") {
        $elem.activate = () => $elem.toggleClass(classes.off, false).toggleClass(classes.on, true);
        $elem.deactivate = () => $elem.toggleClass(classes.off, true).toggleClass(classes.on, false);
        /*** @param {boolean} on
         * @return {jQuery}*/
        $elem.toggle = (on = null) => {
            if (on == true) {
                // noinspection JSUnresolvedFunction
                return $elem.activate();
            } else if (on == false) {
                // noinspection JSUnresolvedFunction
                return $elem.deactivate();
            } else if (on == null) {
                return $elem.toggleClass(classes.off).toggleClass(classes.on);
            }
        };
    } else { // select
        /**@return {jQuery}*/
        $elem.toggle = () => {
            if (!$elem.prop('disabled')) {
                $elem.val(null);
            } else { // noinspection JSUnresolvedVariable
                $elem.val($elem.prevVal);
            }

            $elem[0].toggleAttribute('disabled');
            return $elem.toggleClass('disabled');
        };
    }
    return $elem;
};


const Gui = require("../Gui");
const {$midVertAlign} = require("pyano_local_modules/util");
const {EStore} = require("pyano_local_modules/ext_libs");

const LevelsPart = (() => {
    /**@class LevelsArray*/
    class LevelsArray {
        constructor() {
            /**@type {$Level[]}*/
            this.levels = [];
        }

        /** @param {number} levelIndex
         * @return {$Level} */
        get(levelIndex) {
            return this.levels[levelIndex];
        }

        /**@param {$Level} level*/
        push(level) {
            this.levels.push(level);
        }

        /**@return {$Level}*/
        pop(index = -1) {
            if (index == -1)
                return this.levels.pop();
            else
                return this.levels.splice(index, 1)[0];
        }


        get length() {
            return this.levels.length;
        }


        /** [ [3,4] , [7,2] ]
         @return {number[][]}
         @private*/
        _notesTrialsValuesList() {

            return this.levels.map(
                level => level.$notesTrialsTuple().map(
                    $selector => int($selector.val())
                )
            );
        }

        /**@return {TLevel[]}*/
        toTLevels() {
            return this.levels.map(level => level.toTLevel());
        }

        /**@return {boolean}*/
        isEmpty() {
            return !bool(this._notesTrialsValuesList());
        }

        /**@return {boolean}*/
        hasNoZeroes() {
            if (this.isEmpty())
                return false;
            return this._notesTrialsValuesList()
                .every(pair => pair
                    .every(value => bool(int(value))));
        }

        [Symbol.iterator]() {
            let index = -1;
            let levels = this.levels;
            return {
                next: () => ({value: levels[++index], done: !(index in levels)})
            };
        }
    }

    /**@class $Level*/
    class $Level {
        /**@param {number} row
         @param {number} levelIndex
         @param {number} right*/
        constructor(row, levelIndex, right = 0) {
            this.index = levelIndex;
            this.gridRow = `${row}/${row}`;
            const baseGridColumn = 5 + 5 * right;
            const prevLevel = levelsArr.get(levelIndex - 1);

            this.$div = $('<div class="level">');

            this.$i = this._$constructI(baseGridColumn, levelIndex);

            this.$notesSelect = this._$constructNotesSelect(baseGridColumn, prevLevel);


            this.$rhythmSwitch = this._$constructRhythmSwitch(baseGridColumn, prevLevel);


            this.$tempoSelect = this._$constructTempoSelect(baseGridColumn, prevLevel);

            this.$trialsSelect = this._$constructTrialsSelect(baseGridColumn);


            this.$trialsSelect.add(this.$notesSelect).change(() => {
                const noZeroes = levelsArr.hasNoZeroes();
                Gui.toggleButtons(noZeroes);

            });

            this.$div.append(this._$elements())
                .contextmenu(e => {
                    e.preventDefault();
                    const {remote} = require("electron");
                    const menu = new remote.Menu();
                    const removeItem = new remote.MenuItem({
                        label: `- Remove level #${this.index + 1}`,
                        click: item => {
                            console.log(`clicked remove real index: ${this.index}`, item);
                            _removeLevel(this.index);

                        }
                    });
                    const newItem = new remote.MenuItem({
                        label: `+ New level between #${this.index + 1} and #${this.index + 2}...`,
                        click: item => {
                            Alert.small.info('Still not implemented :\\');
                            console.log('clicked new', removeItem, item);
                        }
                    });
                    menu.append(removeItem);
                    menu.append(newItem);
                    menu.popup(remote.getCurrentWindow());
                });


        }

        /**@param {number} baseGridColumn
         * @param {number} levelIndex
         * @return {jQuery}
         * @private*/
        _$constructI(baseGridColumn, levelIndex) {
            return $midVertAlign(levelIndex + 1)
                .css({
                    textAlign: 'center',
                    gridColumn: `${baseGridColumn}/${baseGridColumn}`,
                    gridRow: this.gridRow
                });
        }

        /**@param {number} baseGridColumn
         * @param {$Level} prevLevel
         * @return {jQuery}
         * @private*/
        _$constructNotesSelect(baseGridColumn, prevLevel) {
            const _$notesSelect = $('<select>')
                .css({
                    gridColumn: `${baseGridColumn + 1}/${baseGridColumn + 1}`,
                    gridRow: this.gridRow
                });
            for (const i of range(0, EStore.truth().numOfNotes()))
                _$notesSelect.append(`<option value="${i}">${i}`);

            if (prevLevel)
                _$notesSelect.val(int(prevLevel.$notesSelect.val()));

            return _$notesSelect;
        }

        /**@param {number} baseGridColumn
         * @param {$Level} prevLevel
         * @return {jQuery}
         * @private*/
        _$constructRhythmSwitch(baseGridColumn, prevLevel) {
            let prevWasOn = false;
            if (prevLevel)
                prevWasOn = prevLevel.$rhythmSwitch.val();

            return $(`<button class="toggle-btn ${prevWasOn ? 'on' : 'off'}">`, "toggle")
                .css({
                    gridColumn: `${baseGridColumn + 2}/${baseGridColumn + 2}`,
                    gridRow: this.gridRow
                })
                .click(() => {
                    this.$rhythmSwitch.toggle();
                    this.$tempoSelect.toggle();
                });
        }

        /**@param {number} baseGridColumn
         * @param {$Level} prevLevel
         * @return {jQuery}
         * @private*/
        _$constructTempoSelect(baseGridColumn, prevLevel) {
            let prevWasDisabled = true;
            if (prevLevel)
                prevWasDisabled = !prevLevel.$tempoSelect.val();

            const _$tempoSelect = $('<select>', "select")
                .prop('disabled', prevWasDisabled)
                .toggleClass('disabled', prevWasDisabled)
                .css({
                    gridColumn: `${baseGridColumn + 3}/${baseGridColumn + 3}`,
                    gridRow: this.gridRow
                });

            for (const i of range(50, 150))
                _$tempoSelect.append(`<option value="${i}">${i}%`);

            _$tempoSelect.val(prevWasDisabled ? null : prevLevel.$tempoSelect.val());
            return _$tempoSelect;
        }

        /**@param {number} baseGridColumn
         * @return {jQuery}
         * @private*/
        _$constructTrialsSelect(baseGridColumn) {
            const _$trialsSelect = $('<select>')
                .css({
                    gridColumn: `${baseGridColumn + 4}/${baseGridColumn + 4}`,
                    gridRow: this.gridRow
                });
            for (const i of range(0, 15))
                _$trialsSelect.append(`<option value="${i}">${i}`);
            return _$trialsSelect;
        }


        /**@private
         * @return {jQuery[]}*/
        _$elements() {
            return [this.$i,
                this.$notesSelect,
                this.$rhythmSwitch,
                this.$tempoSelect,
                this.$trialsSelect];
        }

        moveDownCss() {
            const newGridRowStart = int(this.gridRow.upTo('/')) - 1;
            console.log(`moveDownCss #${this.index} (before --), this.gridRow: ${this.gridRow}, newGridRowStart: ${newGridRowStart}`);
            this.gridRow = `${newGridRowStart}/${newGridRowStart}`;
            this.$i.html(`<span class="mid-v-align">${this.index}</span>`);
            this.index -= 1;
            for (let $e of this._$elements()) {
                $e.css({gridRow: this.gridRow});
            }
        }

        $removeElements() {
            this._$elements().map($e => $e.remove());
            this.$div.remove();
        }

        /**@return {jQuery[]}*/
        $notesTrialsTuple() {
            return [this.$notesSelect, this.$trialsSelect];
        }


        /**@return {TLevel}*/
        toTLevel() {
            return {
                notes: int(this.$notesSelect.val()),
                trials: int(this.$trialsSelect.val()),
                rhythm: this.$rhythmSwitch.val(),
                tempo: this.$tempoSelect.val() ? int(this.$tempoSelect.val()) : null,
            };
        }
    }

    let levelsArr = new LevelsArray();

    const $Div = $('<div id="levels_div">');

    const $addLevelBtn = $('<button id="add_level">', "button")
        .addClass('active-btn')
        .html('Add Level')
        .click(addLevel);

    const $removeLevelBtn = $('<button id="remove_level">', "button")
        .addClass('inactive-btn')
        .html('Remove Last Level')
        .click(() => _removeLevel());


    const $selectorsContainer = $('<div id="selectors_container">');
    const $subtitlesContainer = $('<div id="subtitles_container">')
        .addClass('subtitle')
        .append(
            '<div id="level_subtitle">LEVEL',
            '<div id="notes_subtitle">NOTES',
            '<div id="rhythm_subtitle">RHYTHM',
            '<div id="tempo_subtitle">TEMPO',
            '<div id="trials_subtitle">TRIALS');

    $Div.append(
        $addLevelBtn,
        $subtitlesContainer,
        $selectorsContainer,
        $removeLevelBtn
    );

    /**@param {number} index
     * @return {$Level}*/
    function _removeLevel(index = -1) {
        if (levelsArr.length == 0)
            return Alert.small.info("No levels to remove", "No changes have been made");
        console.log(`_removeLevel(#${index})`);
        const $level = levelsArr.pop(index);
        // if (!$level) debugger;
        $level.$removeElements();
        if (index != -1) {
            for (let i = index; i < levelsArr.length; i++) {
                // starts with NEXT level (this levelIndex removed before loop)
                console.log(`_removeLevel #${i}, calling moveDownCss`);
                let _$l = levelsArr.get(i);
                _$l.moveDownCss();
            }
        }
        const noZeroes = levelsArr.hasNoZeroes();
        Gui.toggleButtons(noZeroes);
        if (levelsArr.isEmpty())
            $removeLevelBtn.deactivate();

        return $level;
    }

    /**@return {$Level}*/
    function addLevel() {
        let row = levelsArr.length + int($Div.css('grid-row-start')) + 1;
        if (row > 35)
            return Alert.small.warning(`Can't have move levels`);

        let right = 0;
        if (row > 18) {
            right = 1;
            row -= 17;
            if ($subtitlesContainer.children().length == 5) {
                const subsDivs = ['<div>LEVEL</div>', '<div>NOTES</div>',
                    '<div>RHYTHM</div>', '<div>TEMPO</div>', '<div>TRIALS</div>'];
                $subtitlesContainer.append(...subsDivs);
            }
        }

        const $level = new $Level(row, levelsArr.length, right);


        levelsArr.push($level);


        Gui.toggleButtons(false);
        $removeLevelBtn.activate();
        $selectorsContainer
            .append($level.$div);
        $level.$notesSelect.focus();
        return $level;
    }

    function _reset() {
        $selectorsContainer.empty();
        $removeLevelBtn.deactivate();
        levelsArr = new LevelsArray();
    }

    /**@return {LevelsArray}*/
    function getLevelsArr() {
        return levelsArr;
    }


    return {
        $Div,
        getLevelsArr,
        addLevel
    };
})();


module.exports = LevelsPart;
