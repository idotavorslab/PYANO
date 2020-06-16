import { bool, enumerate } from "../util";

export interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}

export class Level implements ILevel {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    internalTrialIndex: number;
    
    constructor(level: ILevel, index: number, internalTrialIndex?: number) {
        if ( index === undefined ) {
            console.error(`Level ctor, index is undefined. Continuing with index=0`);
            index = 0;
        }
        const { notes, rhythm, tempo, trials } = level;
        this.notes = notes;
        this.rhythm = rhythm;
        this.tempo = tempo;
        this.trials = trials;
        this.index = index;
        this.internalTrialIndex = internalTrialIndex;
    }
    
    toJSON(): ILevel {
        const { notes, rhythm, tempo, trials } = this;
        return { notes, rhythm, tempo, trials };
    }
    
    /**@deprecated*/
    isFirstTrial(): boolean {
        if ( this.internalTrialIndex === undefined )
            throw new Error("internalTrialIndex is undefined");
        return this.internalTrialIndex === 0;
    }
    
    /**@deprecated*/
    isLastTrial(): boolean {
        return this.internalTrialIndex === this.trials - 1;
    }
    
    /**@deprecated*/
    hasZeroes() {
        return !bool(this.notes) || !bool(this.trials);
    }
    
    valuesOk(): boolean {
        if ( !bool(this.notes) || !bool(this.trials) ) {
            return false
        }
        if ( this.rhythm ) {
            if ( !bool(this.tempo) ) {
                return false;
            }
        } else {
            if ( bool(this.tempo) ) {
                return false;
            }
        }
        return true;
    }
    
}

export class LevelCollection {
    private readonly _levels: Level[];
    readonly current: Level;
    
    constructor(levels: ILevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number) {
        
        this._levels = levels.map((level, index) => new Level(level, index));
        if ( currentLevelIndex !== undefined ) {
            this.current = this._levels[currentLevelIndex];
            this.current.internalTrialIndex = currentInternalTrialIndex;
        }
        
    }
    
    get length(): number {
        return this._levels.length;
    }
    
    get previous(): Level {
        return this.get(this.current.index - 1)
    }
    
    get(i: number): Level {
        return this._levels[i];
    }
    
    badLevels(): number[] {
        const badLevels = [];
        for ( let [ i, level ] of enumerate(this._levels) ) {
            if ( !level.valuesOk() ) {
                badLevels.push(`${i.human()} level `)
            }
        }
        return badLevels;
    }
    
    /**@deprecated*/
    someHaveZeroes(): boolean {
        return this._levels.some(level => level.hasZeroes());
    }
    
    slicesByNotes(): LevelCollection[] {
        let byNotes = {};
        for ( let level of this._levels ) {
            if ( level.notes in byNotes )
                byNotes[level.notes].addLevel(level);
            else
                byNotes[level.notes] = new LevelCollection([ level ]);
            
        }
        return Object.values(byNotes);
    }
    
    addLevel(level: Level) {
        this._levels.push(level);
    }
    
    getNextTempoOfThisNotes(): number {
        if ( this.current.rhythm )
            return this.current.tempo;
        for ( let i = this.current.index; i < this._levels.length; i++ ) {
            const lvl = this._levels[i];
            if ( lvl.notes != this.current.notes )
                return 100; // went over all level with same number of notes and didn't find anything
            if ( lvl.tempo != null )
                return lvl.tempo;
        }
        return 100;
    }
    
    isCurrentLastLevel(): boolean {
        return this.current.index == this.length - 1;
    }
    
    maxNotes(): number {
        return Math.max(...this._levels.map(lvl => lvl.notes));
    }
    
    [Symbol.iterator](): IterableIterator<Level> {
        return this._levels.values();
    }
}
