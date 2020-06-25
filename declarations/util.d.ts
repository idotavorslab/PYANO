/// <reference types="./node_modules/electron" />
export interface TMap<T> {
    [s: string]: T;
    [s: number]: T;
}
export interface TRecMap<T> {
    [s: string]: T | TRecMap<T>;
    [s: number]: T | TRecMap<T>;
}
export declare type Returns<T> = (s: string) => T;
export declare function isObject(obj: any): boolean;
export declare function shallowProperty(key: any): (obj: any) => any;
export declare function getLength(collection: any): any;
export declare function anyDefined(obj: any): boolean;
export declare function equalsAny(obj: any, ...others: any[]): boolean;
export declare function anyTruthy(obj: any): boolean;
export declare function allUndefined(obj: any): boolean;
export declare function isArrayLike(collection: any): boolean;
export declare type PrimitiveVal = string | number | boolean;
export declare function enumerate<T>(obj: Array<T>): Array<[number, T]>;
export declare function enumerate<T>(obj: TRecMap<T>): Array<[keyof TRecMap<T>, T]>;
export declare function enumerate(obj: PrimitiveVal): Array<any>;
export declare function wait(ms: any): Promise<unknown>;
export declare function bool(val: any): boolean;
export declare function isArray(obj: any): boolean;
export declare function isEmptyArr(collection: any): boolean;
export declare function isEmptyObj(obj: any): boolean;
export declare function isFunction(fn: any): boolean;
export declare const str: (val: any) => any;
export declare function sum(arr: any): number;
export declare function range(start: any, stop: any): Generator<any, void, unknown>;
export declare function round(n: number, d?: number): number;
export declare function small(...args: any[]): string[];
export declare function any(collection: any): boolean;
export declare function all(collection: any): boolean;
export declare function zip(arr1: any, arr2: any): Generator<any[], void, unknown>;
export declare function $fadeOut(jQuery: any, ms: number): Promise<any>;
export declare function $fadeIn(jQuery: any, ms: number): Promise<unknown>;
export declare function $fadeInMany(ms: number, ...jQueries: any[]): Promise<any>;
export declare function $fadeOutMany(ms: number, ...jQueries: any[]): Promise<any>;
export declare function concurrent(...promises: any[]): Promise<any[]>;
export declare function getCurrentWindow(): Electron.BrowserWindow;
export declare function reloadPage(): void;
export declare const strong: (s: any) => string;
export declare const bold: (s: any) => string;
export declare function $midVertAlign(html: any): any;
//# sourceMappingURL=util.d.ts.map