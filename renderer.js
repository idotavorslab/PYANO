console.group(`renderer.js`);
const util = require('./src/util.js');
Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value() {
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
Object.defineProperty(Array.prototype, "apply", {
    enumerable: false,
    *value(fn) {
        for (let x in this) {
            yield fn(x);
        }
    }
});
Object.defineProperty(Array.prototype, "last", {
    enumerable: false,
    value() {
        return this[this.length - 1];
    }
});
Object.defineProperty(Array.prototype, "lowerAll", {
    enumerable: false,
    value() {
        return this.map(s => s.lower());
    }
});
Object.defineProperty(Array.prototype, "rsort", {
    enumerable: false,
    value() {
        return this.sort((n, m) => n < m);
    }
});
Object.defineProperty(Array.prototype, "count", {
    enumerable: false,
    value(item, strict) {
        let _count = 0;
        if (util.isFunction(item)) {
            for (let x of this) {
                if (item(x)) {
                    _count++;
                }
            }
        }
        else {
            for (let x of this) {
                if (strict) {
                    if (x === item) {
                        _count++;
                    }
                }
                else if (x == item) {
                    _count++;
                }
            }
            return _count;
        }
    }
});
Object.defineProperty(String.prototype, "endsWithAny", {
    enumerable: false,
    value(...args) {
        for (let x of args) {
            if (this.endsWith(x)) {
                return true;
            }
        }
        return false;
    }
});
Object.defineProperty(String.prototype, "upTo", {
    enumerable: false,
    value(searchString, fromEnd = false) {
        let end = fromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if (end === -1) {
            console.warn(`${this.valueOf()}.upTo(${searchString},${fromEnd}) index is -1`);
        }
        return this.slice(0, end);
    }
});
Object.defineProperty(String.prototype, "in", {
    enumerable: false,
    value(arr) {
        return arr.includes(this.valueOf());
    }
});
Object.defineProperty(String.prototype, "lower", {
    enumerable: false,
    value() {
        return this.toLowerCase();
    }
});
Object.defineProperty(String.prototype, "upper", {
    enumerable: false,
    value() {
        return this.toUpperCase();
    }
});
Object.defineProperty(String.prototype, "title", {
    enumerable: false,
    value() {
        if (this.includes(' ')) {
            return this.split(' ').map(str => str.title()).join(' ');
        }
        else {
            if (this.match(/[_\-.]/)) {
                let temp = this.replaceAll(/[_\-.]/, ' ');
                return temp.title();
            }
            else {
                return this[0].upper() + this.slice(1, this.length).lower();
            }
        }
    }
});
Object.defineProperty(String.prototype, "isdigit", {
    enumerable: false,
    value() {
        return !isNaN(Math.floor(this));
    }
});
Object.defineProperty(String.prototype, "removeAll", {
    enumerable: false,
    value(removeValue, ...removeValues) {
        let temp = this;
        for (let value of [removeValue, ...removeValues]) {
            temp = temp.replaceAll(value, '');
        }
        return temp;
    }
});
Object.defineProperty(String.prototype, "replaceAll", {
    enumerable: false,
    value(searchValue, replaceValue) {
        const type = typeof searchValue;
        if (type === 'string' || type === 'number') {
            return this
                .split(searchValue)
                .join(replaceValue);
        }
        else if (type === 'object') {
            if (searchValue.compile()) {
                let temp = this;
                let replaced = temp.replace(searchValue, replaceValue);
                while (replaced !== temp) {
                    temp = replaced;
                    replaced = replaced.replace(searchValue, replaceValue);
                }
                return replaced;
            }
            else {
                let temp = this;
                for (let [sv, rv] of Object.entries(searchValue)) {
                    temp = temp.replaceAll(sv, rv);
                }
                return temp;
            }
        }
        else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
            return this;
        }
    }
});
Object.defineProperty(Number.prototype, "human", {
    enumerable: false,
    value(letters = false) {
        const floored = Math.floor(this);
        switch (floored) {
            case 0:
                return letters
                    ? "zeroth"
                    : "0th";
            case 1:
                return letters
                    ? "first"
                    : "1st";
            case 2:
                return letters
                    ? "second"
                    : "2nd";
            case 3:
                return letters
                    ? "third"
                    : "3rd";
            case 4:
                return letters
                    ? "fourth"
                    : "4th";
            case 5:
                return letters
                    ? "fifth"
                    : "5th";
            case 6:
                return letters
                    ? "sixth"
                    : "6th";
            case 7:
                return letters
                    ? "seventh"
                    : "7th";
            case 8:
                return letters
                    ? "eighth"
                    : "8th";
            case 9:
                return letters
                    ? "ninth"
                    : "9th";
            case 10:
                return letters
                    ? "tenth"
                    : "10th";
            case 11:
                return letters
                    ? "eleventh"
                    : "11th";
            case 12:
                return letters
                    ? "twelveth"
                    : "12th";
            case 13:
                return letters
                    ? "thirteenth"
                    : "13th";
            case 14:
                return letters
                    ? "fourteenth"
                    : "14th";
            case 15:
                return letters
                    ? "fifteenth"
                    : "15th";
            case 16:
                return letters
                    ? "sixteenth"
                    : "16th";
            case 17:
                return letters
                    ? "seventeenth"
                    : "17th";
            case 18:
                return letters
                    ? "eighteenth"
                    : "18th";
            case 19:
                return letters
                    ? "ninteenth"
                    : "19th";
            default:
                const stringed = floored.toString();
                const lastChar = stringed.slice(-1);
                let suffix;
                switch (lastChar) {
                    case "1":
                        suffix = "st";
                        break;
                    case "2":
                        suffix = "nd";
                        break;
                    case "3":
                        suffix = "rd";
                        break;
                    default:
                        suffix = "th";
                        break;
                }
                return `${floored}${suffix}`;
        }
    }
});
Object.defineProperty(Date.prototype, "human", {
    enumerable: false, value() {
        let d = this.getUTCDate();
        d = d < 10 ? `0${d}` : d;
        let m = this.getMonth() + 1;
        m = m < 10 ? `0${m}` : m;
        const y = this.getFullYear();
        const t = this.toTimeString().slice(0, 8).replaceAll(':', '-');
        return `${d}_${m}_${y}_${t}`;
    }
});
Object.defineProperty(Error.prototype, "toObj", {
    enumerable: false, value() {
        const where = this.stack.slice(this.stack.search(/(?<=\s)at/), this.stack.search(/(?<=at\s.*)\n/));
        const what = this.message;
        Error.captureStackTrace(this);
        const root_abs_path = store.get('root_abs_path', '');
        const cleanstack = this.stack.split('\n')
            .filter(s => s.includes(root_abs_path) && !s.includes('node_modules'))
            .map(s => {
            s = s.trim();
            let frame = s.slice(s.search(root_abs_path), s.length - 1);
            let [file, lineno, ...rest] = frame.split(':');
            file = path.relative(root_abs_path, file);
            return { file, lineno };
        });
        return { what, where, cleanstack };
    }
});
const path = require("path");
const Store = require("electron-store");
const store = new Store();
const any = (collection) => collection.some(item => util.bool(item));
const all = (collection) => collection.every(item => util.bool(item));
const fsx = (() => {
    const fs = require("fs");
    const mkdir = (pathLike, options) => new Promise(resolve => fs.mkdir(pathLike, options, err => resolve(!util.bool(err))));
    function path_exists(pathLike) {
        return new Promise(resolve => fs.access(pathLike, fs.constants.F_OK, err => resolve(!util.bool(err))));
    }
    const replace_ext = (pathLike, ext) => {
        if (ext.includes('.')) {
            throw new Error(`ext included dot ".", ext: ${ext}`);
        }
        return `${remove_ext(pathLike)}.${ext}`;
    };
    const remove_ext = pathLike => path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
    const push_before_ext = (pathLike, push) => {
        let ext = path.extname(pathLike);
        return `${remove_ext(pathLike)}${push}${ext}`;
    };
    function basename(pathLike, ext = null) {
        if (!ext) {
            return path.basename(pathLike);
        }
        return path.basename(pathLike, ext);
    }
    function basenames(...paths) {
        return [...paths.map(p => path.basename(p))];
    }
    function dirname(pathLike) {
        return path.dirname(pathLike);
    }
    function extname(pathLike) {
        return path.extname(pathLike);
    }
    function remove(pathLike) {
        fs.unlinkSync(pathLike);
    }
    return { basenames, basename, dirname, extname, mkdir, path_exists, replace_ext, remove_ext, remove, push_before_ext };
})();
const asx = (() => {
    async function wait(ms) {
        if (store.get('skipFade', false)) {
            ms = 0;
        }
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const $fadeOut = (jQuery, ms) => new Promise(resolve => jQuery.fade(ms, 0, resolve));
    const $fadeIn = (jQuery, ms) => new Promise(resolve => jQuery.fade(ms, 1, resolve));
    async function $fadeInMany(ms, ...jQueries) {
        let promises = [];
        for (let jQ of jQueries) {
            promises.push($fadeIn(jQ, ms));
        }
        return await Promise.all(promises);
    }
    async function $fadeOutMany(ms, ...jQueries) {
        let promises = [];
        for (let jQ of jQueries) {
            promises.push($fadeOut(jQ, ms));
        }
        return await Promise.all(promises);
    }
    async function concurrent(...promises) {
        return await Promise.all(promises);
    }
    async function waterfall(...fns) {
        for (let fn of fns) {
            await fn();
        }
    }
    const newVar = {
        $fadeIn,
        $fadeOut,
        $fadeOutMany,
        $fadeInMany,
        concurrent,
        wait,
        waterfall,
    };
    return newVar;
})();
export class _File {
    constructor(pathWithExt) {
        if (!util.bool(path.extname(pathWithExt))) {
            throw new Error(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        }
        this.path = pathWithExt;
        this.pathNoExt = fsx.remove_ext(this.path);
        if (path.isAbsolute(this.path)) {
            this.name = new _File(fsx.basename(this.path));
        }
    }
    toString() {
        return this.path;
    }
    async renameByOtherFile(other) {
        const fs = require("fs");
        await fs.renameSync(this.path, other.path);
    }
    async renameByCTime() {
        const fs = require("fs");
        const stats = await fs.lstatSync(this.path);
        const datestr = stats.ctime.human();
        const newPath = fsx.push_before_ext(this.path, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        await fs.renameSync(this.path, newPath);
    }
    async getBitrateAndHeight() {
        if (!this.path.endsWith('mp4') && !this.path.endsWith('mov')) {
            throw new Error(`_File: "${this.path}" isn't "mp4" or "mov"`);
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(await execSync(`${ffprobeCmd} "${this.path}"`, { encoding: 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] == "video");
        return [bit_rate, height];
    }
    async exists() {
        return await fsx.path_exists(this.path);
    }
    async remove() {
        return require('fs').unlinkSync(this.path);
    }
    async size() {
        let { size } = await require("fs").lstatSync(this.path);
        return size;
    }
}
export class Truth {
    constructor(pathNoExt) {
        if (!path.isAbsolute(pathNoExt)) {
            throw new Error(`Passed path is not absolute: ${pathNoExt}`);
        }
        if (util.bool(fsx.extname(pathNoExt))) {
            throw new Error(`Passed path is not extensionless: ${pathNoExt}`);
        }
        if (pathNoExt.endsWith('off') || pathNoExt.endsWith('on')) {
            throw new Error(`Passed path of "_on" or "_off" file and not base: ${pathNoExt}`);
        }
        this.pathNoExt = pathNoExt;
        this.name = fsx.basename(this.pathNoExt);
        this.txt = new class {
            constructor(pathNoExt) {
                this.base = new _File(`${pathNoExt}.txt`);
                this.on = new _File(`${pathNoExt}_on.txt`);
                this.off = new _File(`${pathNoExt}_off.txt`);
            }
            getAll() {
                return [this.base, this.on, this.off];
            }
            async getMissing() {
                let missing = [];
                if (!(await this.base.exists())) {
                    missing.push(this.base);
                }
                if (!(await this.on.exists())) {
                    missing.push(this.on);
                }
                if (!(await this.off.exists())) {
                    missing.push(this.off);
                }
                return missing;
            }
            async allExist() {
                return all(await asx.concurrent(this.base.exists(), this.on.exists(), this.off.exists()));
            }
            async anyExist() {
                return any(await asx.concurrent(this.base.exists(), this.on.exists(), this.off.exists()));
            }
            async removeAll() {
                if (await this.base.exists()) {
                    await this.base.remove();
                }
                if (await this.on.exists()) {
                    await this.on.remove();
                }
                if (await this.off.exists()) {
                    await this.off.remove();
                }
            }
            async renameByOtherTxt(other) {
                const fs = require("fs");
                return await asx.concurrent(fs.renameSync(this.base.path, other.base.path), fs.renameSync(this.on.path, other.on.path), fs.renameSync(this.off.path, other.off.path));
            }
        }(this.pathNoExt);
        this.midi = new _File(`${this.pathNoExt}.mid`);
        this.mp4 = new _File(`${this.pathNoExt}.mp4`);
        this.mov = new _File(`${this.pathNoExt}.mov`);
        this.onsets = new _File(`${this.pathNoExt}_onsets.json`);
    }
    numOfNotes() {
        return require("fs")
            .readFileSync(this.txt.on.path, { encoding: 'utf8' })
            .split('\n')
            .filter(line => util.bool(line)).length;
    }
}
export class Level {
    constructor(level, index, internalTrialIndex) {
        if (index == undefined) {
            throw new Error("index is undefined");
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
            throw new Error("internalTrialIndex is undefined");
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
        return max(...this._levels.map(lvl => lvl.notes));
    }
    [Symbol.iterator]() {
        return this._levels.values();
    }
}
console.log('renderer.js EOF');
console.groupEnd();
