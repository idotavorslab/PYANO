export interface TConfig {
    finished_trials_count: number;
    levels: TLevel[];
    demo_type: DemoType;
    current_subject: string;
    errors_playingspeed: number;
    allowed_rhythm_deviation: string;
    allowed_tempo_deviation: string;
    save_path: string;
}
export interface TSavedConfig extends TConfig {
    truth_file_path: string;
}
export interface TLevel {
    notes: number;
    trials: number;
    rhythm: boolean;
    tempo: number;
}
export declare type ExperimentType = 'exam' | 'test';
export declare type DemoType = 'video' | 'animation';
export declare type LastPage = 'exam' | 'new_test' | 'inside_test' | 'record' | 'file_tools' | 'settings';
//# sourceMappingURL=types.d.ts.map