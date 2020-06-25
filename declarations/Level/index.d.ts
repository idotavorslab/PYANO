import { TLevel } from "../templates/js/types.js";
export interface ILevelNew {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}
export declare class LevelNew implements ILevelNew {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    internalTrialIndex: number;
    constructor(level: ILevelNew, index: number, internalTrialIndex?: number);
    toJSON(): ILevelNew;
    isFirstTrial(): boolean;
    isLastTrial(): boolean;
    hasZeroes(): boolean;
    valuesOk(): boolean;
}
export declare class LevelNewCollection {
    readonly current: LevelNew;
    private readonly _levels;
    constructor(levels: ILevelNew[], currentLevelIndex?: number, currentInternalTrialIndex?: number);
    get length(): number;
    get previous(): LevelNew;
    get(i: number): LevelNew;
    badLevels(): number[];
    someHaveZeroes(): boolean;
    slicesByNotes(): LevelNewCollection[];
    addLevel(level: LevelNew): void;
    getNextTempoOfThisNotes(): number;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<LevelNew>;
}
export declare class Level {
    notes: any;
    rhythm: any;
    tempo: any;
    trials: any;
    index: any;
    internalTrialIndex: any;
    constructor(level: TLevel, index: number, internalTrialIndex?: number);
    isFirstTrial(): boolean;
    isLastTrial(): boolean;
    hasZeroes(): boolean;
}
export declare class Levels {
    current: Level;
    private _levels;
    constructor(levels: TLevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number);
    get length(): number;
    get(i: any): Level;
    someHaveZeroes(): boolean;
    slicesByNotes(): unknown[];
    addLevel(level: any): void;
    getNextTempoOfThisNotes(): any;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<Level>;
}
//# sourceMappingURL=index.d.ts.map