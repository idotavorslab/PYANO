console.group(`util.js`);
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
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length > 0;
}
export function equalsAny(obj, ...others) {
    if (!others) {
        console.warn('Not even one other was passed');
        return false;
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
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => bool(x)).length > 0;
}
export function allUndefined(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length === 0;
}
export function isArrayLike(collection) {
    const length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}
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
    }
    else {
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
        }
        else {
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
export function* range(start, stop) {
    for (let i = start; i <= stop; i++) {
        yield i;
    }
}
export function round(n, d = 0) {
    const fr = 10 ** d;
    return Math.floor(n * fr) / fr;
}
export function small(...args) {
    return [`%c${args.join(' ')}`, `font-size:10px`];
}
export function any(collection) {
    return collection.some(item => bool(item));
}
export function all(collection) {
    return collection.every(item => bool(item));
}
export function* zip(arr1, arr2) {
    for (let key in arr1) {
        yield [arr1[key], arr2[key]];
    }
}
export function $fadeOut(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 0, resolve));
}
export function $fadeIn(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 1, resolve));
}
export async function $fadeInMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries) {
        promises.push($fadeIn(jQ, ms));
    }
    return await Promise.all(promises);
}
export async function $fadeOutMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries) {
        promises.push($fadeOut(jQ, ms));
    }
    return await Promise.all(promises);
}
export async function concurrent(...promises) {
    return await Promise.all(promises);
}
export function getCurrentWindow() {
    const { remote } = require("electron");
    return remote.getCurrentWindow();
}
export function reloadPage() {
    getCurrentWindow().reload();
}
export const strong = (s) => `<strong>${s}</strong>`;
export const bold = s => `<b>${s}</b>`;
export function $midVertAlign(html) {
    const $ = require("jquery");
    return $('<div class="mid-v-align-container">')
        .append($('<span class="mid-v-align">').html(html));
}
console.log('util.js EOF');
console.groupEnd();
