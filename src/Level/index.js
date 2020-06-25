import * as util from "../util";
export class LevelNew {
    constructor(level, index, internalTrialIndex) {
        if (index === undefined) {
            console.error(`LevelNew ctor, index is undefined. Continuing with index=0`);
            index = 0;
        }
        const { notes, rhythm, tempo, trials } = level;
        this.notes = notes;
        this.rhythm = rhythm;
        this.tempo = tempo;
        this.trials = trials;
        this.index = index;
        this.internalTrialIndex = internalTrialIndex;
    }
    toJSON() {
        const { notes, rhythm, tempo, trials } = this;
        return { notes, rhythm, tempo, trials };
    }
    isFirstTrial() {
        if (this.internalTrialIndex === undefined) {
            alert("internalTrialIndex is undefined");
        }
        return this.internalTrialIndex === 0;
    }
    isLastTrial() {
        return this.internalTrialIndex === this.trials - 1;
    }
    hasZeroes() {
        return !util.bool(this.notes) || !util.bool(this.trials);
    }
    valuesOk() {
        if (!util.bool(this.notes) || !util.bool(this.trials)) {
            return false;
        }
        if (this.rhythm) {
            if (!util.bool(this.tempo)) {
                return false;
            }
        }
        else {
            if (util.bool(this.tempo)) {
                return false;
            }
        }
        return true;
    }
}
export class LevelNewCollection {
    constructor(levels, currentLevelIndex, currentInternalTrialIndex) {
        this._levels = levels.map((level, index) => new LevelNew(level, index));
        if (currentLevelIndex !== undefined) {
            this.current = this._levels[currentLevelIndex];
            this.current.internalTrialIndex = currentInternalTrialIndex;
        }
    }
    get length() {
        return this._levels.length;
    }
    get previous() {
        return this.get(this.current.index - 1);
    }
    get(i) {
        return this._levels[i];
    }
    badLevels() {
        const badLevels = [];
        for (let [i, level] of util.enumerate(this._levels)) {
            if (!level.valuesOk()) {
                badLevels.push(`${i.human()} level `);
            }
        }
        return badLevels;
    }
    someHaveZeroes() {
        return this._levels.some(level => level.hasZeroes());
    }
    slicesByNotes() {
        let byNotes = {};
        for (let level of this._levels) {
            if (level.notes in byNotes) {
                byNotes[level.notes].addLevel(level);
            }
            else {
                byNotes[level.notes] = new LevelNewCollection([level]);
            }
        }
        return Object.values(byNotes);
    }
    addLevel(level) {
        this._levels.push(level);
    }
    getNextTempoOfThisNotes() {
        if (this.current.rhythm) {
            return this.current.tempo;
        }
        for (let i = this.current.index; i < this._levels.length; i++) {
            const lvl = this._levels[i];
            if (lvl.notes != this.current.notes) {
                return 100;
            }
            if (lvl.tempo != null) {
                return lvl.tempo;
            }
        }
        return 100;
    }
    isCurrentLastLevel() {
        return this.current.index == this.length - 1;
    }
    maxNotes() {
        return Math.max(...this._levels.map(lvl => lvl.notes));
    }
    [Symbol.iterator]() {
        return this._levels.values();
    }
}
export class Level {
    constructor(level, index, internalTrialIndex) {
        if (index == undefined) {
            alert("Level(level, index, internalTrialIndex) index is undefined");
        }
        const { notes, rhythm, tempo, trials } = level;
        this.notes = notes;
        this.rhythm = rhythm;
        this.tempo = tempo;
        this.trials = trials;
        this.index = index;
        this.internalTrialIndex = internalTrialIndex;
    }
    isFirstTrial() {
        if (this.internalTrialIndex == undefined) {
            alert("internalTrialIndex is undefined");
        }
        return this.internalTrialIndex == 0;
    }
    isLastTrial() {
        return this.internalTrialIndex == this.trials - 1;
    }
    hasZeroes() {
        return !util.bool(this.notes) || !util.bool(this.trials);
    }
}
export class Levels {
    constructor(levels, currentLevelIndex, currentInternalTrialIndex) {
        this._levels = levels.map((level, index) => new Level(level, index));
        if (currentLevelIndex != undefined) {
            this.current = this._levels[currentLevelIndex];
            this.current.internalTrialIndex = currentInternalTrialIndex;
        }
    }
    get length() {
        return this._levels.length;
    }
    get(i) {
        return this._levels[i];
    }
    someHaveZeroes() {
        return this._levels.some(level => level.hasZeroes());
    }
    slicesByNotes() {
        let byNotes = {};
        for (let level of this._levels) {
            if (level.notes in byNotes) {
                byNotes[level.notes].addLevel(level);
            }
            else {
                byNotes[level.notes] = new Levels([level]);
            }
        }
        return Object.values(byNotes);
    }
    addLevel(level) {
        this._levels.push(level);
    }
    getNextTempoOfThisNotes() {
        if (this.current.rhythm) {
            return this.current.tempo;
        }
        for (let i = this.current.index; i < this._levels.length; i++) {
            const lvl = this._levels[i];
            if (lvl.notes != this.current.notes) {
                return 100;
            }
            if (lvl.tempo != null) {
                return lvl.tempo;
            }
        }
        return 100;
    }
    isCurrentLastLevel() {
        return this.current.index == this.length - 1;
    }
    maxNotes() {
        return Math.max(...this._levels.map(lvl => lvl.notes));
    }
    [Symbol.iterator]() {
        return this._levels.values();
    }
}
