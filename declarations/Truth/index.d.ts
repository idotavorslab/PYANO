declare class FileNew {
    constructor(absPathWithExt: string);
    private _absPath;
    get absPath(): string;
    set absPath(absPathWithExt: string);
    renameByOtherFile(other: FileNew): void;
    renameByCTime(): void;
    getBitrateAndHeight(): Promise<[string, string]>;
    exists(): boolean;
    remove(): void;
    size(): number;
}
declare class TxtNew {
    readonly base: FileNew;
    readonly on: FileNew;
    readonly off: FileNew;
    constructor(absPathNoExt: string);
    getAll(): [FileNew, FileNew, FileNew];
    getExisting(): {
        base?: FileNew;
        on?: FileNew;
        off?: FileNew;
    };
    getMissing(): string[];
    allExist(): boolean;
    anyExist(): boolean;
    removeAll(): void;
    renameByOtherTxt(other: TxtNew): void;
}
export interface ReadonlyTruth {
    name: string;
    txt: {
        base: {
            absPath: string;
        };
        on: {
            absPath: string;
        };
        off: {
            absPath: string;
        };
    };
    midi: {
        absPath: string;
    };
    mp4: {
        absPath: string;
    };
    onsets: {
        absPath: string;
    };
}
export declare class TruthNew implements ReadonlyTruth {
    readonly name: string;
    readonly txt: TxtNew;
    readonly midi: FileNew;
    readonly mp4: FileNew;
    readonly mov: FileNew;
    readonly onsets: FileNew;
    constructor(nameNoExt: string, dir?: string);
    toJSON(...include: ("txt" | "midi" | "mp4" | "onsets")[]): ReadonlyTruth;
    numOfNotes(): number;
}
declare class Txt {
    readonly base: File;
    readonly on: File;
    readonly off: File;
    constructor(absPathNoExt: string);
    getAll(): [File, File, File];
    getExisting(): {
        base?: File;
        on?: File;
        off?: File;
    };
    getMissing(): string[];
    allExist(): boolean;
    anyExist(): boolean;
    removeAll(): void;
    renameByOtherTxt(other: Txt): void;
}
export declare class File {
    path: string;
    name?: File;
    constructor(pathWithExt: any);
    get pathNoExt(): string;
    renameByOtherFile(other: File): void;
    renameByCTime(): void;
    getBitrateAndHeight(): [any, any];
    exists(): boolean;
    remove(): void;
    size(): number;
}
export declare class Truth {
    pathNoExt: string;
    name: string;
    txt: Txt;
    midi: File;
    mp4: File;
    mov: File;
    onsets: File;
    constructor(pathNoExt: string);
    numOfNotes(): number;
}
export {};
//# sourceMappingURL=index.d.ts.map