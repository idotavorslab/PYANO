import { BetterHTMLElement } from "./bhe/index.js";

interface TMap<T> {
    [s: string]: T;

    [s: number]: T;
}

interface TRecMap<T> {
    [s: string]: T | TRecMap<T>;

    [s: number]: T | TRecMap<T>;
}

declare type AnyFunction = (...args: any[]) => any;
declare type Enumerated<T> = T extends (infer U)[] ? [number, U][] : T extends TRecMap<(infer U)> ? [keyof T, U][] : T extends boolean ? never : any;
declare type Returns<T> = (s: string) => T;

declare function enumerate<T>(obj: T): Enumerated<T>;

declare function wait(ms: number): Promise<any>;

declare function bool(val: any): boolean;

declare function isArray<T>(obj: any): obj is Array<T>;

declare function isEmptyArr(collection: any): boolean;

declare function isEmptyObj(obj: any): boolean;

declare function isFunction<T>(fn: T): fn is T;
declare function isFunction(fn: AnyFunction): fn is AnyFunction;

declare function anyDefined(obj: any): boolean;

declare function anyTruthy(obj: any): boolean;

declare function allUndefined(obj: any): boolean;

declare function isBHE<T extends BetterHTMLElement>(bhe: T, bheSubType: any): bhe is T;

declare function isType<T>(arg: T): arg is T;

declare function isObject(obj: any): boolean;

declare function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T];

declare function getLength(collection: any): number;