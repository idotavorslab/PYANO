import { Returns, TMap, TRecMap } from "../util.js";

declare function getArgsFullRepr(argsWithValues: TMap<any>): string;

declare function getArgsWithValues(passedArgs: TMap<any>): TMap<any>;

declare function summary(argset: TMap<any>): string;

declare class MutuallyExclusiveArgs extends Error {
    constructor(passedArgs: TMap<any> | TMap<any>[], details?: string);
}

declare class NotEnoughArgs extends Error {
    constructor(expected: number | number[], passedArgs: TMap<any> | TMap<any>[], relation?: 'each' | 'either');
}

declare const SVG_NS_URI = "http://www.w3.org/2000/svg";

declare class BetterHTMLElement<Generic extends HTMLElement = HTMLElement> {
    protected _htmlElement: Generic;
    private readonly _isSvg;
    private readonly _listeners;
    private _cachedChildren;
    private _cache;

    constructor({ tag, cls, setid }: {
        tag: Element2Tag<Generic>;
        cls?: string;
        setid?: string;
    });

    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });

    constructor({ query, children }: {
        query: QuerySelector;
        children?: ChildrenObj;
    });

    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });

    get e(): Generic;

    static wrapWithBHE(htmlElement: HTMLAnchorElement): Anchor;

    static wrapWithBHE<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = FormishHTMLElement>(htmlElement: Generic): Input<TInputType, Generic>;

    static wrapWithBHE(htmlElement: HTMLImageElement): Img;

    static wrapWithBHE(htmlElement: HTMLParagraphElement): Paragraph;

    static wrapWithBHE(htmlElement: HTMLSpanElement): Span;

    static wrapWithBHE(htmlElement: HTMLButtonElement): Button;

    static wrapWithBHE(htmlElement: HTMLDivElement): Div;

    static wrapWithBHE(htmlElement: HTMLSelectElement): Div;

    static wrapWithBHE(htmlElement: HTMLElement): BetterHTMLElement;

    toString(): any;

    wrapSomethingElse<T extends HTMLElement>(newHtmlElement: BetterHTMLElement<T>): this;

    wrapSomethingElse(newHtmlElement: Node): this;

    html(html: string): this;

    html(): string;

    text(txt: string | number): this;

    text(): string;

    id(id: string): this;

    id(): string;

    css(css: Partial<CssOptions>): this;

    css(css: string): string;

    uncss(...removeProps: (keyof CssOptions)[]): this;

    class(cls: string): this;

    class(cls: Returns<boolean>): string;

    class(): string[];

    addClass(cls: string, ...clses: string[]): this;

    removeClass(cls: Returns<boolean>, ...clses: Returns<boolean>[]): this;

    removeClass(cls: string, clses?: string[]): this;

    replaceClass(oldToken: Returns<boolean>, newToken: string): this;

    replaceClass(oldToken: string, newToken: string): this;

    toggleClass(cls: Returns<boolean>, force?: boolean): this;

    toggleClass(cls: string, force?: boolean): this;

    hasClass(cls: string): boolean;

    hasClass(cls: Returns<boolean>): boolean;

    after(...nodes: Array<BetterHTMLElement | Node>): this;

    insertAfter(node: BetterHTMLElement | HTMLElement): this;

    append(...nodes: Array<BetterHTMLElement | Node | TMap<BetterHTMLElement> | [string, BetterHTMLElement]>): this;

    appendTo(node: BetterHTMLElement | HTMLElement): this;

    before(...nodes: Array<BetterHTMLElement | Node>): this;

    insertBefore(node: BetterHTMLElement | HTMLElement): this;

    replaceChild(newChild: Node, oldChild: Node): this;

    replaceChild(newChild: BetterHTMLElement, oldChild: BetterHTMLElement): this;

    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this;

    cacheAppend(keyChildPairs: [string, BetterHTMLElement][]): this;

    _cls(): typeof BetterHTMLElement;

    child(selector: "img"): Img;

    child(selector: "a"): Anchor;

    child<TInputType extends InputType = InputType>(selector: "input"): Input<TInputType, HTMLInputElement>;

    child(selector: "select"): Input<undefined, HTMLSelectElement>;

    child(selector: "p"): Paragraph;

    child(selector: "span"): Span;

    child(selector: "button"): Button;

    child(selector: "div"): Div;

    child<T extends Tag>(selector: T): BetterHTMLElement<HTMLElementTagNameMap[T]>;

    child(selector: string): BetterHTMLElement;

    child<T extends typeof BetterHTMLElement>(selector: string, bheCls: T): T;

    children(): BetterHTMLElement[];

    children<K extends Tag>(selector: K): BetterHTMLElement[];

    children(selector: QuerySelector): BetterHTMLElement[];

    clone(deep?: boolean): BetterHTMLElement;

    cacheChildren(childrenObj: ChildrenObj): this;

    empty(): this;

    remove(): this;

    on(evTypeFnPairs: TMap<EventName2Function>, options?: AddEventListenerOptions): this;

    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this;

    pointerdown(fn: (event: PointerEvent | MouseEvent) => any, options?: AddEventListenerOptions): this;

    click(): this;

    click(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    blur(): this;

    blur(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;

    focus(): this;

    focus(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;

    change(fn: (event: Event) => any, options?: AddEventListenerOptions): this;

    contextmenu(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    dblclick(): this;

    dblclick(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    mouseenter(): this;

    mouseenter(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;

    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    mouseover(fn: (event: MouseEvent) => void, options?: AddEventListenerOptions): this;

    off(event: EventName): this;

    allOff(): this;

    attr(attrValPairs: TMap<string | boolean>): this;

    attr(attributeName: string): string;

    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this;

    getdata(key: string, parse?: boolean): string | TMap<string>;
}

declare class Div extends BetterHTMLElement<HTMLDivElement> {
    constructor(divOpts: any);
}

declare class Paragraph extends BetterHTMLElement<HTMLParagraphElement> {
    constructor(pOpts: any);
}

declare class Span extends BetterHTMLElement<HTMLSpanElement> {
    constructor({ cls, setid, text }: {
        cls?: string;
        setid?: string;
        text?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: string;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLSpanElement;
        children?: ChildrenObj;
    });
}

declare class Img<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLImageElement> {
    constructor({ cls, setid, src }: {
        cls?: string;
        setid?: string;
        src?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "img">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLImageElement;
        children?: ChildrenObj;
    });
    constructor();

    src(src: string): this;
    src(): string;
}

declare class Anchor extends BetterHTMLElement<HTMLAnchorElement> {
    constructor({ setid, cls, text, href, target, byid, query, htmlElement, children }: {
        setid: any;
        cls: any;
        text: any;
        href: any;
        target: any;
        byid: any;
        query: any;
        htmlElement: any;
        children: any;
    });

    href(): string;
    href(val: string): this;

    target(): string;
    target(val: string): this;
}

interface Flashable {
    flashBad(): Promise<void>;

    flashGood(): Promise<void>;
}

declare type FormishHTMLElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement;
declare type InputType = "checkbox" | "number" | "radio" | "text" | "time" | "datetime-local";

declare abstract class Form<Generic extends FormishHTMLElement> extends BetterHTMLElement<Generic> implements Flashable {
    get disabled(): boolean;

    disable(): this;

    enable(): this;

    toggleEnabled(on: boolean): this;

    value(): any;
    value(val: any): this;

    flashBad(): Promise<void>;

    flashGood(): Promise<void>;

    clear(): this;

    _preEvent(): void;

    _onEventSuccess(ret: any): Promise<void>;

    _onEventError(e: any): Promise<void>;

    _postEvent(): void;
}

declare class Button<Q extends QuerySelector = QuerySelector> extends Form<HTMLButtonElement> {
    constructor({ cls, setid, text }: {
        cls?: string;
        setid?: string;
        text?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "button">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLButtonElement;
        children?: ChildrenObj;
    });
    constructor();

    click(_fn?: (_event: MouseEvent) => Promise<any>): this;
}

declare class Input<TInputType extends InputType, Generic extends FormishHTMLElement = HTMLInputElement, Q extends QuerySelector = QuerySelector> extends Form<Generic> {
    type: TInputType;

    constructor({ cls, setid, type }: {
        cls?: string;
        setid?: string;
        type?: TInputType;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });
    constructor();
}

declare class TextInput<Q extends QuerySelector = QuerySelector> extends Input<"text"> {
    constructor({ cls, setid, placeholder }: {
        cls?: string;
        setid?: string;
        placeholder?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLInputElement;
        children?: ChildrenObj;
    });
    constructor();

    placeholder(val: string): this;
    placeholder(): string;

    keydown(_fn: (_event: KeyboardEvent) => Promise<any>): this;
}

declare class Changable<TInputType extends InputType, Generic extends FormishHTMLElement> extends Input<TInputType, Generic> {
    change(_fn: (_event: Event) => Promise<any>): this;
}

declare class CheckboxInput extends Changable<"checkbox", HTMLInputElement> {
    constructor(opts: any);

    get checked(): boolean;

    check(): this;

    uncheck(): this;

    toggleChecked(on: boolean): this;

    value(): boolean;
    value(val: any): this;

    clear(): this;

    _onEventError(e: any): Promise<void>;
}

declare class Select extends Changable<undefined, HTMLSelectElement> {
    constructor(selectOpts: any);

    get selectedIndex(): number;
    set selectedIndex(val: number);

    get selected(): HTMLOptionElement;
    set selected(val: HTMLOptionElement);

    get options(): HTMLOptionElement[];

    item(index: any): HTMLOptionElement;

    value(): string;
    value(val: any): this;

    clear(): this;
}

declare function elem<T extends Tag>({ tag, cls, setid }: {
    tag: T;
    cls?: string;
    setid?: string;
}): T extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[T]> : never;
declare function elem({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
declare function elem<Q extends QuerySelector>({ query, children }: {
    query: Q;
    children?: ChildrenObj;
}): Q extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[Q]> : BetterHTMLElement;
declare function elem<E extends HTMLElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj;
}): BetterHTMLElement<E>;

declare function span({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Span;
declare function span({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Span;
declare function span<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "span">;
    children?: ChildrenObj;
}): Span;
declare function span<E extends HTMLSpanElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj;
}): Span;
declare function span(): Span;

declare function div({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Div;
declare function div({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Div;
declare function div<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "div">;
    children?: ChildrenObj;
}): Div;
declare function div({ htmlElement, children }: {
    htmlElement: HTMLDivElement;
    children?: ChildrenObj;
}): Div;
declare function div(): Div;

declare function button({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Button;
declare function button({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Button;
declare function button<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "button">;
    children?: ChildrenObj;
}): Button;
declare function button({ htmlElement, children }: {
    htmlElement: HTMLButtonElement;
    children?: ChildrenObj;
}): Button;
declare function button(): Button;

declare function input<TInputType extends InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ cls, setid, type, placeholder }: {
    cls?: string;
    setid?: string;
    type?: TInputType;
    placeholder?: string;
}): Input<TInputType, Generic>;
declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
declare function input<Q extends QuerySelector, TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ query, children }: {
    query: QueryOrPreciseTag<Q, "input">;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ htmlElement, children }: {
    htmlElement: Generic;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>(): Input<TInputType, Generic>;

declare function select(selectOpts: any): Select;

declare function img({ cls, setid, src }: {
    cls?: string;
    setid?: string;
    src?: string;
}): Img;
declare function img({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Img;
declare function img<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "img">;
    children?: ChildrenObj;
}): Img;
declare function img({ htmlElement, children }: {
    htmlElement: HTMLImageElement;
    children?: ChildrenObj;
}): Img;
declare function img(): Img;

declare function paragraph({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Paragraph;
declare function paragraph({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Paragraph;
declare function paragraph<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "p">;
    children?: ChildrenObj;
}): Paragraph;
declare function paragraph({ htmlElement, children }: {
    htmlElement: HTMLParagraphElement;
    children?: ChildrenObj;
}): Paragraph;
declare function paragraph(): Paragraph;

declare function anchor({ cls, setid, href, target }: {
    cls?: string;
    setid?: string;
    href?: string;
    target?: string;
}): Anchor;
declare function anchor({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Anchor;
declare function anchor<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "a">;
    children?: ChildrenObj;
}): Anchor;
declare function anchor({ htmlElement, children }: {
    htmlElement: HTMLAnchorElement;
    children?: ChildrenObj;
}): Anchor;
declare function anchor(): Anchor;


declare type EventName = keyof HTMLElementEventMap;
declare type EventName2Function<E extends EventName = EventName> = {
    [P in EventName]?: (event: HTMLElementEventMap[P]) => void;
}[E];
declare type MapOfEventName2Function = Partial<Record<keyof HTMLElementEventMap, EventName2Function>>;
declare type Tag = Exclude<keyof HTMLElementTagNameMap, "object">;
declare type NotTag<T extends Tag> = Exclude<Tag, T>;
declare type QueryOrPreciseTag<Q, T extends Tag> = Exclude<Q, QuerySelector<NotTag<T>>>;
declare type TagOrString = Tag | string;
declare type QuerySelector<K extends TagOrString = TagOrString> = K extends Tag ? K : string;
declare type Element2Tag<T> = T extends HTMLInputElement ? "input" : T extends HTMLAnchorElement ? "a" : T extends HTMLImageElement ? "img" : Tag;
declare type ChildrenObj = TRecMap<QuerySelector | BetterHTMLElement | typeof BetterHTMLElement>;



declare type OmittedCssProps =
    "animationDirection"
    | "animationFillMode"
    | "animationIterationCount"
    | "animationPlayState"
    | "animationTimingFunction"
    | "opacity"
    | "padding"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "paddingTop"
    | "preload"
    | "width";
declare type PartialCssStyleDeclaration = Omit<Partial<CSSStyleDeclaration>, OmittedCssProps>;

interface CssOptions extends PartialCssStyleDeclaration {
    animationDirection?: AnimationDirection;
    animationFillMode?: AnimationFillMode;
    animationIterationCount?: number;
    animationPlayState?: AnimationPlayState;
    animationTimingFunction?: AnimationTimingFunction;
    opacity?: string | number;
    padding?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;
    paddingRight?: string | number;
    paddingTop?: string | number;
    preload?: "auto" | string;
    width?: string | number;
}

declare type CubicBezierFunction = [number, number, number, number];
declare type Jumpterm = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end';
declare type StepsFunction = [number, Jumpterm];
declare type AnimationTimingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step-start' | 'step-end' | StepsFunction | CubicBezierFunction;
declare type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
declare type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

interface TransformOptions {
    matrix?: [number, number, number, number, number, number];
    matrix3d?: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    perspective?: string;
    rotate?: string;
    rotate3d?: [number, number, number, string];
    rotateX?: string;
    rotateY?: string;
    rotateZ?: string;
    scale?: number;
    scale3d?: [number, number, number];
    scaleX?: [number, number, number];
    scaleY?: [number, number, number];
    skew?: [string, string];
    skewX?: string;
    skewY?: string;
    translate?: [string, string];
    translate3d?: [string, string, string];
    translateX?: string;
    translateY?: string;
    translateZ?: string;
}

interface AnimateOptions {
    delay?: string;
    direction?: AnimationDirection;
    duration: string;
    fillMode?: AnimationFillMode;
    iterationCount?: number;
    name: string;
    playState?: AnimationPlayState;
    timingFunction?: AnimationTimingFunction;
}

