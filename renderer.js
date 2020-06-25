console.group(`renderer.js`);
import * as util from "./src/util.js";
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
const fsx = (() => {
    const fs = require("fs");
    const mkdir = (pathLike, options) => new Promise(resolve => fs.mkdir(pathLike, options, err => resolve(!util.bool(err))));
    function path_exists(pathLike) {
        return new Promise(resolve => fs.access(pathLike, fs.constants.F_OK, err => resolve(!util.bool(err))));
    }
    const replace_ext = (pathLike, ext) => {
        if (ext.includes('.')) {
            alert(`ext included dot ".", ext: ${ext}`);
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
console.log('renderer.js EOF');
console.groupEnd();
