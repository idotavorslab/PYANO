"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group(`util.js`);
const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}
exports.isObject = isObject;
function shallowProperty(key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}
exports.shallowProperty = shallowProperty;
function getLength(collection) {
    return shallowProperty('length')(collection);
}
exports.getLength = getLength;
function anyDefined(obj) {
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
exports.anyDefined = anyDefined;
function equalsAny(obj, ...others) {
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
exports.equalsAny = equalsAny;
function anyTruthy(obj) {
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
exports.anyTruthy = anyTruthy;
function allUndefined(obj) {
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
exports.allUndefined = allUndefined;
function isArrayLike(collection) {
    const length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}
exports.isArrayLike = isArrayLike;
function enumerate(obj) {
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
exports.enumerate = enumerate;
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
function bool(val) {
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
exports.bool = bool;
function isArray(obj) {
    if (!obj) {
        return false;
    }
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
exports.isArray = isArray;
function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}
exports.isEmptyArr = isEmptyArr;
function isEmptyObj(obj) {
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}
exports.isEmptyObj = isEmptyObj;
function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
exports.isFunction = isFunction;
exports.str = (val) => val ? val.toString() : "";
function sum(arr) {
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
exports.sum = sum;
function* range(start, stop) {
    for (let i = start; i <= stop; i++) {
        yield i;
    }
}
exports.range = range;
function round(n, d = 0) {
    const fr = 10 ** d;
    return Math.floor(n * fr) / fr;
}
exports.round = round;
function small(...args) {
    return [`%c${args.join(' ')}`, `font-size:10px`];
}
exports.small = small;
function any(collection) {
    return collection.some(item => bool(item));
}
exports.any = any;
function all(collection) {
    return collection.every(item => bool(item));
}
exports.all = all;
function* zip(arr1, arr2) {
    for (let key in arr1) {
        yield [arr1[key], arr2[key]];
    }
}
exports.zip = zip;
function $fadeOut(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 0, resolve));
}
exports.$fadeOut = $fadeOut;
function $fadeIn(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 1, resolve));
}
exports.$fadeIn = $fadeIn;
async function $fadeInMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries) {
        promises.push($fadeIn(jQ, ms));
    }
    return await Promise.all(promises);
}
exports.$fadeInMany = $fadeInMany;
async function $fadeOutMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries) {
        promises.push($fadeOut(jQ, ms));
    }
    return await Promise.all(promises);
}
exports.$fadeOutMany = $fadeOutMany;
async function concurrent(...promises) {
    return await Promise.all(promises);
}
exports.concurrent = concurrent;
function getCurrentWindow() {
    const { remote } = require("electron");
    return remote.getCurrentWindow();
}
exports.getCurrentWindow = getCurrentWindow;
function reloadPage() {
    getCurrentWindow().reload();
}
exports.reloadPage = reloadPage;
exports.strong = (s) => `<strong>${s}</strong>`;
exports.bold = s => `<b>${s}</b>`;
function $midVertAlign(html) {
    const $ = require("jquery");
    return $('<div class="mid-v-align-container">')
        .append($('<span class="mid-v-align">').html(html));
}
exports.$midVertAlign = $midVertAlign;
console.log('util.js EOF');
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBaUJ6QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFNUMsU0FBZ0IsUUFBUSxDQUFDLEdBQUc7SUFDeEIsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM1QyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixlQUFlLENBQUMsR0FBRztJQUMvQixPQUFPLFVBQVUsR0FBRztRQUNoQixPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUpELDBDQUlDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLFVBQVU7SUFDaEMsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLEdBQUc7SUFDMUIsSUFBSSxLQUFLLENBQUM7SUFDVixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNmLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlCO1NBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDckIsS0FBSyxHQUFHLEdBQUcsQ0FBQztLQUNmO1NBQU07UUFDSCxNQUFNLElBQUksU0FBUyxDQUFDLCtCQUErQixPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDcEU7SUFDRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFD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R0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFHdkMsU0FBZ0IsYUFBYSxDQUFDLElBQUk7SUFDOUIsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxDQUFDLHFDQUFxQyxDQUFDO1NBQzFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBSkQsc0NBSUM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzNCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUuZ3JvdXAoYHV0aWwuanNgKTtcblxuLy8gaW1wb3J0ICogYXMgbXlmcyBmcm9tIFwiLi9teWZzLmpzXCJcbmV4cG9ydCBpbnRlcmZhY2UgVE1hcDxUPiB7XG4gICAgW3M6IHN0cmluZ106IFQ7XG5cbiAgICBbczogbnVtYmVyXTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUUmVjTWFwPFQ+IHtcbiAgICBbczogc3RyaW5nXTogVCB8IFRSZWNNYXA8VD47XG5cbiAgICBbczogbnVtYmVyXTogVCB8IFRSZWNNYXA8VD47XG59XG5cbmV4cG9ydCB0eXBlIFJldHVybnM8VD4gPSAoczogc3RyaW5nKSA9PiBUO1xuXG5jb25zdCBNQVhfQVJSQVlfSU5ERVggPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmICEhb2JqO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd1Byb3BlcnR5KGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMZW5ndGgoY29sbGVjdGlvbikge1xuICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkoJ2xlbmd0aCcpKGNvbGxlY3Rpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55RGVmaW5lZChvYmopIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iaik7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsc0FueShvYmosIC4uLm90aGVycykge1xuICAgIGlmICghb3RoZXJzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignTm90IGV2ZW4gb25lIG90aGVyIHdhcyBwYXNzZWQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGxldCBzdHJpY3QgPSAhKGlzQXJyYXlMaWtlKG9iaikgJiYgaXNPYmplY3Qob2JqW29iai5sZW5ndGggLSAxXSkgJiYgb2JqW29iai5sZW5ndGggLSAxXS5zdHJpY3QgPT0gZmFsc2UpO1xuICAgIGNvbnN0IF9pc0VxID0gKF9vYmosIF9vdGhlcikgPT4gc3RyaWN0ID8gX29iaiA9PT0gX290aGVyIDogX29iaiA9PSBfb3RoZXI7XG4gICAgZm9yIChsZXQgb3RoZXIgb2Ygb3RoZXJzKSB7XG4gICAgICAgIGlmIChfaXNFcShvYmosIG90aGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55VHJ1dGh5KG9iaikge1xuICAgIGxldCBhcnJheTtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBhcnJheSA9IE9iamVjdC52YWx1ZXMob2JqKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBhcnJheSA9IG9iajtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3RlZCBhcnJheSBvciBvYmosIGdvdDogJHt0eXBlb2Ygb2JqfWApO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZmlsdGVyKHggPT4gYm9vbCh4KSkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbFVuZGVmaW5lZChvYmopIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iaik7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID09PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheUxpa2UoY29sbGVjdGlvbikge1xuICAgIGNvbnN0IGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xufVxuXG4vKmV4cG9ydCB0eXBlIEVudW1lcmF0ZWQ8VD4gPSBUIGV4dGVuZHMgKGluZmVyIFUpW10gP1xuICAgIFtudW1iZXIsIFVdW10gOlxuICAgIFQgZXh0ZW5kcyBUUmVjTWFwPChpbmZlciBVKT4gP1xuICAgICAgICBba2V5b2YgVCwgVV1bXSA6XG4gICAgICAgIG5ldmVyKi9cbmV4cG9ydCB0eXBlIFByaW1pdGl2ZVZhbCA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBBcnJheTxUPik6IEFycmF5PFtudW1iZXIsIFRdPlxuZXhwb3J0IGZ1bmN0aW9uIGVudW1lcmF0ZTxUPihvYmo6IFRSZWNNYXA8VD4pOiBBcnJheTxba2V5b2YgVFJlY01hcDxUPiwgVF0+XG5leHBvcnQgZnVuY3Rpb24gZW51bWVyYXRlKG9iajogUHJpbWl0aXZlVmFsKTogQXJyYXk8YW55PlxuZXhwb3J0IGZ1bmN0aW9uIGVudW1lcmF0ZShvYmopIHtcbiAgICBsZXQgdHlwZW9mT2JqID0gdHlwZW9mIG9iajtcbiAgICBpZiAob2JqID09PSB1bmRlZmluZWRcbiAgICAgICAgfHwgaXNFbXB0eU9iaihvYmopXG4gICAgICAgIHx8IGlzRW1wdHlBcnIob2JqKVxuICAgICAgICB8fCBvYmogPT09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAob2JqID09PSBudWxsXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJib29sZWFuXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcIm51bWJlclwiXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dHlwZW9mT2JqfSBvYmplY3QgaXMgbm90IGl0ZXJhYmxlYCk7XG4gICAgfVxuICAgIGxldCBhcnJheSA9IFtdO1xuICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB4IG9mIG9iaikge1xuICAgICAgICAgICAgYXJyYXkucHVzaChbaSwgeF0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goW3Byb3AsIG9ialtwcm9wXV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXQobXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib29sKHZhbCkge1xuICAgIGlmICghdmFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdHlwZW9mdmFsID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodHlwZW9mdmFsICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAodHlwZW9mdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAhIXZhbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICBpZiAodG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5sZW5ndGggIT09IDA7XG4gICAgfVxuICAgIHJldHVybiAhIXZhbC52YWx1ZU9mKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgIGlmICghb2JqKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogIT09ICdzdHJpbmcnICYmIChBcnJheS5pc0FycmF5KG9iaikgfHwgdHlwZW9mIG9ialtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlBcnIoY29sbGVjdGlvbikge1xuICAgIHJldHVybiBpc0FycmF5KGNvbGxlY3Rpb24pICYmIGdldExlbmd0aChjb2xsZWN0aW9uKSA9PT0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlPYmoob2JqKSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iaikgJiYgIWlzQXJyYXkob2JqKSAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZm4pIHtcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwoZm4pO1xuICAgIHJldHVybiAhIWZuICYmIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbmV4cG9ydCBjb25zdCBzdHIgPSAodmFsKSA9PiB2YWwgPyB2YWwudG9TdHJpbmcoKSA6IFwiXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdW0oYXJyKSB7XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgbGV0IGRpcnR5ID0gZmFsc2U7XG4gICAgZm9yIChsZXQgdiBvZiBhcnIpIHtcbiAgICAgICAgbGV0IG51bWJlciA9IHBhcnNlRmxvYXQodik7XG4gICAgICAgIGlmICghaXNOYU4obnVtYmVyKSkge1xuICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgc3VtICs9IG51bWJlcjtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHJldHVybiAhZGlydHkgPyBudWxsIDogc3VtO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiogcmFuZ2Uoc3RhcnQsIHN0b3ApIHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gc3RvcDsgaSsrKSB7XG4gICAgICAgIHlpZWxkIGk7XG4gICAgfVxuXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG46IG51bWJlciwgZDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgY29uc3QgZnIgPSAxMCAqKiBkO1xuICAgIHJldHVybiBNYXRoLmZsb29yKG4gKiBmcikgLyBmcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNtYWxsKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gW2AlYyR7YXJncy5qb2luKCcgJyl9YCwgYGZvbnQtc2l6ZToxMHB4YF07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFueShjb2xsZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uc29tZShpdGVtID0+IGJvb2woaXRlbSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsKGNvbGxlY3Rpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29sbGVjdGlvbi5ldmVyeShpdGVtID0+IGJvb2woaXRlbSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIHppcChhcnIxLCBhcnIyKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGFycjEpIHtcbiAgICAgICAgeWllbGQgW2FycjFba2V5XSwgYXJyMltrZXldXTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uICRmYWRlT3V0KGpRdWVyeSwgbXM6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4galF1ZXJ5LmZhZGUobXMsIDAsIHJlc29sdmUpKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gJGZhZGVJbihqUXVlcnksIG1zOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBqUXVlcnkuZmFkZShtcywgMSwgcmVzb2x2ZSkpO1xufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiAkZmFkZUluTWFueShtczogbnVtYmVyLCAuLi5qUXVlcmllcyk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IHByb21pc2VzID0gW107XG4gICAgZm9yIChsZXQgalEgb2YgalF1ZXJpZXMpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaCgkZmFkZUluKGpRLCBtcykpO1xuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiAkZmFkZU91dE1hbnkobXM6IG51bWJlciwgLi4ualF1ZXJpZXMpOiBQcm9taXNlPGFueT4ge1xuICAgIGxldCBwcm9taXNlcyA9IFtdO1xuICAgIGZvciAobGV0IGpRIG9mIGpRdWVyaWVzKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2goJGZhZGVPdXQoalEsIG1zKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcbn1cblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uY3VycmVudCguLi5wcm9taXNlcykge1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRXaW5kb3coKSB7XG4gICAgY29uc3QgeyByZW1vdGUgfSA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTtcbiAgICByZXR1cm4gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbG9hZFBhZ2UoKSB7XG4gICAgZ2V0Q3VycmVudFdpbmRvdygpLnJlbG9hZCgpO1xufVxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGlzRXF1YWwob2JqYSwgb2JqYikge1xuICAgIGlmIChhbnkoW0FycmF5LmlzQXJyYXkob2JqYSksIEFycmF5LmlzQXJyYXkob2JqYildKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgb2JqZWN0IGlzIGFuIEFycmF5LiBQYXNzIGRpY3QtbGlrZSBvYmplY3RzIG9ubHlcIik7XG4gICAgfVxuICAgIGNvbnN0IHR5cGVBID0gdHlwZW9mIG9iamE7XG4gICAgY29uc3QgdHlwZUIgPSB0eXBlb2Ygb2JqYjtcbiAgICBpZiAodHlwZUEgIT0gJ29iamVjdCcgfHwgdHlwZUIgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXQgbGVhc3Qgb25lIG9iamVjdCBpcyBub3QgYHR5cGVvZiAuLi4gPT0gJ29iamVjdCdgLiBQYXNzIGRpY3QtbGlrZSBvYmplY3RzIG9ubHlcIik7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKG9iamEpLmxlbmd0aCAhPSBPYmplY3Qua2V5cyhvYmpiKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGxldCBbb2JqYUssIG9iamFWXSBvZiBlbnVtZXJhdGUob2JqYSkpIHtcbiAgICAgICAgaWYgKCEob2JqYUsgaW4gb2JqYikgfHwgb2JqYVYgIT0gb2JqYltvYmphS10pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG59XG4qL1xuXG4vKipKdXN0IHRoZSBiYXNlbmFtZSovXG4vKlxuYXN5bmMgZnVuY3Rpb24gdGFrZVNjcmVlbnNob3QoZGlybmFtZSkge1xuICAgIGNvbnN0IHdlYkNvbnRlbnRzID0gcmVtb3RlLmdldEN1cnJlbnRXZWJDb250ZW50cygpO1xuICAgIGNvbnN0IGltYWdlID0gYXdhaXQgd2ViQ29udGVudHMuY2FwdHVyZVBhZ2UoKTtcbiAgICBteWZzLmNyZWF0ZUlmTm90RXhpc3RzKFNFU1NJT05fUEFUSF9BQlMpO1xuICAgIGNvbnN0IGRpcm5hbWVBYnMgPSBwYXRoLmpvaW4oU0VTU0lPTl9QQVRIX0FCUywgZGlybmFtZSk7XG4gICAgbXlmcy5jcmVhdGVJZk5vdEV4aXN0cyhkaXJuYW1lQWJzKTtcbiAgICBjb25zdCBmaWxlcyA9IHsgcG5nOiB1bmRlZmluZWQsIGh0bWw6IHVuZGVmaW5lZCB9O1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihkaXJuYW1lQWJzLCAncGFnZS5wbmcnKSkpIHtcbiAgICAgICAgZmlsZXMucG5nID0gYCR7ZGlybmFtZUFic30vcGFnZV9fJHtuZXcgRGF0ZSgpLmh1bWFuKCl9LnBuZ2BcbiAgICB9IGVsc2Uge1xuICAgICAgICBmaWxlcy5wbmcgPSBwYXRoLmpvaW4oZGlybmFtZUFicywgJ3BhZ2UucG5nJyk7XG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZXMucG5nLCBpbWFnZS50b1BORygpKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oZGlybmFtZUFicywgJ3NjcmVlbnNob3QuaHRtbCcpKSkge1xuICAgICAgICBmaWxlcy5odG1sID0gYCR7ZGlybmFtZUFic30vc2NyZWVuc2hvdF9fJHtuZXcgRGF0ZSgpLmh1bWFuKCl9Lmh0bWxgXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZXMuaHRtbCA9IHBhdGguam9pbihkaXJuYW1lQWJzLCAnc2NyZWVuc2hvdC5odG1sJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB3ZWJDb250ZW50cy5zYXZlUGFnZShmaWxlcy5odG1sLCBcIkhUTUxDb21wbGV0ZVwiKTtcbn1cbiovXG5cbi8vLy8vLy8vLy8vLy8vL1xuLy8vIE9MRFxuLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGV4cG9ydCBjb25zdCBzcGFuID0gKHMsIGNscyA9IG51bGwpID0+IGNsc1xuLy8gICAgID8gYDxzcGFuIGNsYXNzPVwiJHtjbHN9XCI+JHtzfTwvc3Bhbj5gXG4vLyAgICAgOiBgPHNwYW4+JHtzfTwvc3Bhbj5gO1xuZXhwb3J0IGNvbnN0IHN0cm9uZyA9IChzKSA9PiBgPHN0cm9uZz4ke3N9PC9zdHJvbmc+YDtcbmV4cG9ydCBjb25zdCBib2xkID0gcyA9PiBgPGI+JHtzfTwvYj5gO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiAkbWlkVmVydEFsaWduKGh0bWwpIHtcbiAgICBjb25zdCAkID0gcmVxdWlyZShcImpxdWVyeVwiKTtcbiAgICByZXR1cm4gJCgnPGRpdiBjbGFzcz1cIm1pZC12LWFsaWduLWNvbnRhaW5lclwiPicpXG4gICAgICAgIC5hcHBlbmQoJCgnPHNwYW4gY2xhc3M9XCJtaWQtdi1hbGlnblwiPicpLmh0bWwoaHRtbCkpO1xufVxuXG5jb25zb2xlLmxvZygndXRpbC5qcyBFT0YnKTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTsiXX0=