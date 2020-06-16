console.group(`util.js`);

// import * as myfs from "./myfs.js"
export interface TMap<T> {
    [s: string]: T;

    [s: number]: T;
}

export interface TRecMap<T> {
    [s: string]: T | TRecMap<T>;

    [s: number]: T | TRecMap<T>;
}

export type Returns<T> = (s: string) => T;

const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

export function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}

export function shallowProperty(key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}

export function getLength(collection) {
    return shallowProperty('length')(collection);
}

export function anyDefined(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length > 0;
}

export function equalsAny(obj, ...others) {
    if (!others) {
        throw new Error('Not even one other was passed');
    }
    let strict = !(isArrayLike(obj) && isObject(obj[obj.length - 1]) && obj[obj.length - 1].strict == false);
    const _isEq = (_obj, _other) => strict ? _obj === _other : _obj == _other;
    for (let other of others) {
        if (_isEq(obj, other)) {
            return true;
        }
    }
    return false;
}

export function anyTruthy(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => bool(x)).length > 0;
}

export function allUndefined(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length === 0;
}

export function isArrayLike(collection) {
    const length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

/*export type Enumerated<T> = T extends (infer U)[] ?
    [number, U][] :
    T extends TRecMap<(infer U)> ?
        [keyof T, U][] :
        never*/
export type PrimitiveVal = string | number | boolean;

export function enumerate<T>(obj: Array<T>): [number, T]
export function enumerate<T>(obj: TRecMap<T>): [keyof TRecMap<T>, T]
export function enumerate(obj: PrimitiveVal): []
export function enumerate(obj) {
    let typeofObj = typeof obj;
    if (obj === undefined
        || isEmptyObj(obj)
        || isEmptyArr(obj)
        || obj === "") {
        return [];
    }
    if (obj === null
        || typeofObj === "boolean"
        || typeofObj === "number"
        || typeofObj === "function") {
        throw new TypeError(`${typeofObj} object is not iterable`);
    }
    let array = [];
    if (isArray(obj)) {
        let i = 0;
        for (let x of obj) {
            array.push([i, x]);
            i++;
        }
    } else {
        for (let prop in obj) {
            array.push([prop, obj[prop]]);
        }
    }
    return array;
}

export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function bool(val) {
    if (!val) {
        return false;
    }
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function') {
            return true;
        } else {
            return !!val;
        }
    }
    let toStringed = {}.toString.call(val);
    if (toStringed === '[object Object]' || toStringed === '[object Array]') {
        return Object.keys(val).length !== 0;
    }
    return !!val.valueOf();
}

export function isArray(obj) {
    if (!obj) {
        return false;
    }
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}

export function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}

export function isEmptyObj(obj) {
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}

export function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}

export const str = (val) => val ? val.toString() : "";

export function sum(arr) {
    let sum = 0;
    let dirty = false;
    for (let v of arr) {
        let number = parseFloat(v);
        if (!isNaN(number)) {
            dirty = true;
            sum += number;
        }

    }
    return !dirty ? null : sum;
}

/**
 @param {string|number} num
 @return {number}
 */
export const int = (num) => Math.floor(num);
/**@param {...number} values*/
export const max = (...values) => Math.max(...values);
export const min = (...values) => Math.min(...values);

export function* range(start, stop) {
    for (let i = start; i <= stop; i++) {
        yield i;
    }

}

/**@param {number} n
 * @param {number} d
 * @return {number}*/
export function round(n, d = 0) {
    const fr = 10 ** d;
    return int(n * fr) / fr;
}

export const small = (...args) => [`%c${args.join(' ')}`, `font-size:10px`];


export function* zip(arr1, arr2) {
    for (let key in arr1) {
        yield [arr1[key], arr2[key]];
    }
}

export function getCurrentWindow() {
    const { remote } = require("electron");
    return remote.getCurrentWindow();
}

export function reloadPage() {
    getCurrentWindow().reload();
}

/*
export function isEqual(obja, objb) {
    if (any([Array.isArray(obja), Array.isArray(objb)])) {
        throw new Error("At least one object is an Array. Pass dict-like objects only");
    }
    const typeA = typeof obja;
    const typeB = typeof objb;
    if (typeA != 'object' || typeB != 'object') {
        throw new Error("At least one object is not `typeof ... == 'object'`. Pass dict-like objects only");
    }

    if (Object.keys(obja).length != Object.keys(objb).length) {
        return false;
    }
    for (let [objaK, objaV] of enumerate(obja)) {
        if (!(objaK in objb) || objaV != objb[objaK]) {
            return false;
        }
    }

    return true;

}
*/

/**Just the basename*/
/*
async function takeScreenshot(dirname) {
    const webContents = remote.getCurrentWebContents();
    const image = await webContents.capturePage();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const dirnameAbs = path.join(SESSION_PATH_ABS, dirname);
    myfs.createIfNotExists(dirnameAbs);
    const files = { png: undefined, html: undefined };
    if (fs.existsSync(path.join(dirnameAbs, 'page.png'))) {
        files.png = `${dirnameAbs}/page__${new Date().human()}.png`
    } else {
        files.png = path.join(dirnameAbs, 'page.png');
    }
    fs.writeFileSync(files.png, image.toPNG());
    if (fs.existsSync(path.join(dirnameAbs, 'screenshot.html'))) {
        files.html = `${dirnameAbs}/screenshot__${new Date().human()}.html`
    } else {
        files.html = path.join(dirnameAbs, 'screenshot.html');
    }
    return await webContents.savePage(files.html, "HTMLComplete");
}
*/

///////////////
/// OLD
////////////////////
// export const span = (s, cls = null) => cls
//     ? `<span class="${cls}">${s}</span>`
//     : `<span>${s}</span>`;
export const strong = (s) => `<strong>${s}</strong>`;
export const bold = s => `<b>${s}</b>`;


export function $midVertAlign(html) {
    const $ = require("jquery");
    return $('<div class="mid-v-align-container">')
        .append($('<span class="mid-v-align">').html(html));
}

console.log('util.js EOF');
console.groupEnd();