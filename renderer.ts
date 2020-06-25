console.group(`renderer.js`);
import { TMap } from "./src/util.js";

import * as util from "./src/util.js"
// const util = require('./src/util.js');

// import { TMap } from "./src/util"

interface String {
    endsWithAny(...args: string[]): boolean

    human(): string

    isdigit(): boolean

    lower(): string

    upper(): string

    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: (string | number | RegExp | TMap<string>)[]): string

    replaceAll(searchValue: TMap<string>): string

    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string

    title(): string

    upTo(searchString: string, searchFromEnd?: boolean): string
}

interface Array<T> {
    _lowerAll: T[];

    /**Also caches _lowerAll*/
    lowerAll(): T[]

    count(item: T): number

    count(predicate: (arg: string) => T): number

    apply<T>(fn: (arg: string) => T): Generator<T, void>
}

interface Number {
    human(letters?: boolean): string
}

interface Error {
    toObj(): { what: string, where: string, cleanstack: { file: string, lineno: string }[] }
}

interface Date {
    human(): string
}

Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value() {
        // @ts-ignore
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
Object.defineProperty(Array.prototype, "apply", {
    enumerable: false,
    * value(fn) {
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
        } else {
            for (let x of this) {
                if (strict) {
                    if (x === item) {
                        _count++;
                    }
                } else if (x == item) {

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
        } else {
            if (this.match(/[_\-.]/)) {
                let temp = this.replaceAll(/[_\-.]/, ' ');
                return temp.title();
            } else {
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
        } else if (type === 'object') {
            if (searchValue.compile()) {
                let temp = this;
                let replaced = temp.replace(searchValue, replaceValue);
                while (replaced !== temp) {
                    temp = replaced;
                    replaced = replaced.replace(searchValue, replaceValue);
                }
                return replaced;
            } else {
                let temp = this;
                for (let [sv, rv] of Object.entries(searchValue)) {
                    temp = temp.replaceAll(sv, rv);
                }
                return temp;
            }
        } else {
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
// *** functions
// const {Alert} = require('pyano_local_modules/util/Alert');
const path = require("path");
// const $ = require("jquery");
const Store = require("electron-store");
const store = new Store();

// skipFade = false;

/*Object.defineProperties($.prototype, {
    fade: {
        async value(speed, to, callback) {
            let skipFade = store.get('skipFade', false);
            if (skipFade) {
                console.log('got skipFade = true start of fn, returning');
                return this.fadeTo(0, to, callback);
            }
            const element = this[0];
            if (element.tagName.toLowerCase() == "button") {
                element.classList.toggle('unclickable', to == 0);
            }
            let prevOpac = element.style.opacity;
            if (typeof prevOpac != 'number') {
                prevOpac = to ? 0 : 1; // opposite
                element.style.opacity = prevOpac;
                if (element.style.display == 'none') {
                    element.style.display = '';
                }

            }

            const diff = Math.abs(prevOpac - to);
            let step;
            if (to) {
                step = diff / 32;
            } else {
                step = -diff / 32;
            }
            const everyMs = util.round(speed / 32);
            for (let i of util.range(0, 31)) {
                if (skipFade) {
                    console.log('got skipFade = true in loop, returning');
                    return this.fadeTo(0, to, callback);
                }
                element.style.opacity = parseFloat(element.style.opacity) + step;
                await asx.wait(everyMs);
            }


            return this.fadeTo(0, to, callback);
        }
    },
    deactivate: {
        value() {
            this.toggleClass('inactive-btn', true)
                .toggleClass('active-btn', false);
        }
    },
    activate: {
        value() {
            this.toggleClass('inactive-btn', false)
                .toggleClass('active-btn', true);
        }
    },
    toggle: {
        value(activate) {
            activate ? this.activate() : this.deactivate();
        }
    },
    isActive: {
        value() {
            return this.hasClass('active-btn');
        }
    },
});*/

/**@return {boolean}*/
const any = (collection) => collection.some(item => util.bool(item));
/**@return {boolean}*/
const all = (collection) => collection.every(item => util.bool(item));


// *** fsx
const fsx = (() => {
    const fs = require("fs");
    /**@param {PathLike|string} pathLike
     * @param {{mode?:number, recursive?:boolean}} options
     * @return {Promise<boolean>}*/
    const mkdir = (pathLike, options) => new Promise(resolve =>
        fs.mkdir(pathLike, options, err => resolve(!util.bool(err))));


    /**@param {PathLike|string} pathLike
     * @return {Promise<boolean>}*/
    function path_exists(pathLike) {
        return new Promise(resolve =>
            fs.access(pathLike, fs.constants.F_OK, err => resolve(!util.bool(err))));
    }

    /**
     {@link remove_ext Uses remove_ext}
     @param {PathLike|string} pathLike
     @param {string} ext - Target extension without dot
     @return {string}*/
    const replace_ext = (pathLike, ext) => {
        if (ext.includes('.')) {
            throw new Error(`ext included dot ".", ext: ${ext}`);
        }
        return `${remove_ext(pathLike)}.${ext}`;
    };

    /**
     * @param {PathLike|string} pathLike
     * @return {string}
     * @example
     * remove_ext("experiments/truths/fur_elise_B.txt")
     * >>> experiments/truths/fur_elise_B
     * remove_ext("fur_elise_B.txt")
     * >>> fur_elise_B */
    const remove_ext = pathLike => path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));

    /**
     * {@link remove_ext Uses remove_ext}
     * @param {PathLike|string} pathLike
     * @param {string|number} push
     * @return {string}
     * */
    const push_before_ext = (pathLike, push) => {
        let ext = path.extname(pathLike);
        return `${remove_ext(pathLike)}${push}${ext}`;
    };

    /**@param {string|PathLike} pathLike
     * @param {?string} ext*/
    function basename(pathLike, ext = null) {
        if (!ext) {
            return path.basename(pathLike);
        }
        return path.basename(pathLike, ext);
    }

    /**@param {...string} paths
     * @return {string[]}
     * */
    function basenames(...paths) {
        return [...paths.map(p => path.basename(p))];
    }

    /**@param {string} pathLike
     * @return {string}*/
    function dirname(pathLike) {
        return path.dirname(pathLike);
    }

    /**@param {string} pathLike
     * @return {string}*/
    function extname(pathLike) {
        return path.extname(pathLike);
    }

    /**@param {string} pathLike*/
    function remove(pathLike) {
        fs.unlinkSync(pathLike);
    }

    /** @type {{
     * basename:(function(string|PathLike,?string):string),
     * basenames:(function(...string|PathLike):string[]),
     * dirname:(function(...string|PathLike):string),
     * extname:(function(...string|PathLike):string),
     * mkdir: (function((PathLike|string), (number|string|MakeDirectoryOptions|undefined|null)): Promise<boolean>),
     * path_exists: (function((PathLike|string)): Promise<boolean>),
     * push_before_ext: (function((PathLike|string), (string|number)): string),
     * remove_ext: (function((PathLike|string)): string),
     * replace_ext: (function((PathLike|string), string): string)}}
     * */
    return { basenames, basename, dirname, extname, mkdir, path_exists, replace_ext, remove_ext, remove, push_before_ext };
})();
// *** asx
const asx = (() => {
    /**@param {number} ms
     * @return {Promise}*/
    async function wait(ms) {

        if (store.get('skipFade', false)) {
            ms = 0;
        }
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**@param {jQuery} jQuery
     @param {number} ms
     @return {Promise<jQuery>}*/
    const $fadeOut = (jQuery, ms) => new Promise(resolve => jQuery.fade(ms, 0, resolve));

    /**@param {jQuery} jQuery
     @param {number} ms
     @reutrn {Promise<jQuery>}*/
    const $fadeIn = (jQuery, ms) => new Promise(resolve => jQuery.fade(ms, 1, resolve));

    /**@param {number} ms
     @param {...jQuery} jQueries
     @return {Promise<jQuery[]>}*/
    async function $fadeInMany(ms, ...jQueries) {
        let promises = [];
        for (let jQ of jQueries) {
            promises.push($fadeIn(jQ, ms));
        }

        return await Promise.all(promises);
    }

    /**@param {number} ms
     @param {...jQuery} jQueries
     @return {Promise<jQuery[]>}*/
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

    /**@template T
     * @param {...function():Promise<T>|T|void} fns
     * @return {Promise<T[]>}*/
    async function waterfall(...fns) {
        for (let fn of fns) {
            await fn();
        }
    }

    /**@type {
     *     {
     *         $fadeIn: (function(jQuery, number): Promise<jQuery>),
     *         $fadeInMany: (function(number, ...jQuery): jQuery[]),
     *         $fadeOut: (function(jQuery, number): Promise<jQuery>),
     *         $fadeOutMany: (function(number, ...jQuery): jQuery[]),
     *         concurrent: (function(...function(): T): T[])
     *         wait: (function(number): Promise<*>),
     *     }
     * }
     * @template T*/
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

