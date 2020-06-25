import { Truth } from "../Truth/index.js";
declare const Store: any;
import { DemoType, ExperimentType, LastPage, TSavedConfig } from "../templates/js/types.js";
import { Level, Levels } from "../Level/index.js";
export declare class MyStore extends Store {
    constructor(_doTruthFileCheck?: boolean);
    get truth_file_path(): Truth;
    set truth_file_path(truth: Truth);
    get last_page(): LastPage;
    set last_page(page: LastPage);
    get experiment_type(): any;
    set experiment_type(experimentType: any);
    get root_abs_path(): any;
    set subjects(subjectList: any);
    get dev(): {
        skip_whole_truth: (() => boolean);
        skip_level_intro: (() => boolean);
        skip_failed_trial_feedback: (() => boolean);
        skip_passed_trial_feedback: (() => boolean);
    };
    fromSavedConfig(savedConfig: TSavedConfig, experimentType: ExperimentType): void;
    config(type?: any): Config;
    update(K: any, kv: any): any;
    increase(K: any): void;
    truth(): Truth;
    configsPath(): any;
    truthsDirPath(): any;
    truthFilesList(extFilter?: any): unknown[];
    subjectsDirPath(): any;
    salamanderDirPath(): any;
    private _doTruthFileCheck;
}
export declare class Config extends MyStore {
    constructor(type: ExperimentType);
    static get _KEYS(): string[];
    get allowed_tempo_deviation(): any;
    set allowed_tempo_deviation(deviation: any);
    get allowed_rhythm_deviation(): any;
    set allowed_rhythm_deviation(deviation: any);
    get current_subject(): any;
    set current_subject(name: any);
    get errors_playingspeed(): any;
    set errors_playingspeed(speed: any);
    get save_path(): string;
    set save_path(savePath: string);
    get demo_type(): DemoType;
    set demo_type(type: DemoType);
    get finished_trials_count(): any;
    set finished_trials_count(count: any);
    get levels(): any;
    set levels(levels: any);
    toTSavedConfig(): any;
    fromSavedConfig(savedConfig: any, ...args: any[]): void;
    _get(key: any): any;
    _set(key: any, value: any): void;
    currentTrialCoords(): [number, number];
    isDemoVideo(): boolean;
    isWholeTestOver(): boolean;
    getSubjectDirNames(): any;
    getCurrentLevel(): Level;
    getLevels(): Levels;
    trialTruth(): Truth;
    testOutPath(): string;
    private _updateSavedFile;
}
export {};
//# sourceMappingURL=index.d.ts.map