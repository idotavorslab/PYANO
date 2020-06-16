import { Truth } from "../../renderer.js";
const Store = require('electron-store');
const path = require("path");
const fs = require('fs');
import Alert from "../MyAlert/index.js";
export class MyStore extends Store {
    constructor(_doTruthFileCheck = true) {
        super();
        if (_doTruthFileCheck) {
            this._doTruthFileCheck();
        }
    }
    get truth_file_path() {
        return this.get('truth_file_path');
    }
    set truth_file_path(truth) {
        truth.txt.allExist()
            .then(exist => {
            if (exist) {
                this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
            }
            else {
                throw new Error(`Not all txt files of truth exist: ${truth.txt.base.name}`);
            }
        });
    }
    get last_page() {
        return this.get('last_page');
    }
    set last_page(page) {
        const validpages = ['new_test', 'inside_test', 'record', 'file_tools', 'settings'];
        if (!page.in(validpages)) {
            throw new Error(`setLastPage(page = ${page}), must be one of ${validpages.join(', ')}`);
        }
        this.set('last_page', page);
    }
    get experiment_type() {
        return this.get('experiment_type');
    }
    set experiment_type(experimentType) {
        if (experimentType != 'test' && experimentType != 'exam') {
            throw new Error(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'`);
        }
        this.set('experiment_type', experimentType);
    }
    get root_abs_path() {
        let root_abs_path = this.get('root_abs_path');
        console.log('root_abs_path:', root_abs_path);
        return root_abs_path;
    }
    set subjects(subjectList) {
        const subjects = [...new Set(subjectList)];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if (currentSubject && !currentSubject.in(subjects)) {
            config.current_subject = null;
        }
    }
    get dev() {
        const _dev = this.get('dev');
        return {
            skip_whole_truth: () => _dev && this.get('devoptions.skip_whole_truth'),
            skip_level_intro: () => _dev && this.get('devoptions.skip_level_intro'),
            skip_passed_trial_feedback: () => _dev && this.get('devoptions.skip_passed_trial_feedback'),
            skip_failed_trial_feedback: () => _dev && this.get('devoptions.skip_failed_trial_feedback'),
        };
    }
    _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        const truth = this.truth();
        truth.txt.allExist()
            .then(async (exist) => {
            if (exist) {
                return Alert.small.success(`All "${truth.name}" txt files exist.`);
            }
            else {
                const txtFilesList = this.truthFilesList('txt').map(fsx.remove_ext);
                const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
                if (!bool(filteredTxts)) {
                    return await Alert.big.warning({
                        title: 'No valid truth files found',
                        html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
                    });
                }
                await Alert.big.blocking({
                    title: `Truth file invalid: ${truth.name}`,
                    html: '<b>Please choose one of the following valid truths:</b>',
                }, {
                    strings: filteredTxts,
                    clickFn: async ($s) => {
                        try {
                            const config = this.config();
                            config.finished_trials_count = 0;
                            config.levels = [];
                            this.truth_file_path = new Truth(path.join(this.truthsDirPath(), $s.text()));
                            reloadPage();
                        }
                        catch (err) {
                            document.getElementById('swal2-title').innerText = err.message;
                            document.getElementById('swal2-content').style.display = 'none';
                            document.getElementsByClassName('swal2-icon swal2-warning')[0].style.display = 'inherit';
                            throw err;
                        }
                    }
                });
            }
        });
    }
    fromSavedConfig(savedConfig, experimentType) {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth(path.join(truthsDirPath, truthFileName));
        this.experiment_type = experimentType;
        this.config().fromSavedConfig(savedConfig);
    }
    config(type = undefined) {
        if (type) {
            return new Config(type);
        }
        else {
            return new Config(this.experiment_type);
        }
    }
    update(K, kv) {
        let V = this.get(K);
        if (Array.isArray(V)) {
            this.set(K, [...V, kv]);
        }
        else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }
    increase(K) {
        let V = this.get(K);
        if (V === undefined) {
            this.set(K, 1);
        }
        else {
            if (!isNaN(Math.floor(V))) {
                this.set(K, int(V) + 1);
            }
            else {
                throw new TypeError("MyStore tried to increase a value that is not a number or string");
            }
        }
    }
    truth() {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(this.truth_file_path, '.txt');
        return new Truth(path.join(truthsDirPath, truthFileName));
    }
    configsPath() {
        return path.join(this.root_abs_path, 'experiments', 'configs');
    }
    truthsDirPath() {
        return path.join(this.root_abs_path, 'experiments', 'truths');
    }
    truthFilesList(extFilter = null) {
        if (extFilter != null) {
            if (!extFilter.in(['txt', 'mid', 'mp4'])) {
                throw new Error(`truthFilesList(extFilter = ${extFilter}), must be either ['txt','mid','mp4'] or not at all`);
            }
        }
        const truthsDirPath = this.truthsDirPath();
        let truthFiles = [...new Set(fs.readdirSync(truthsDirPath))];
        if (extFilter != null) {
            return truthFiles.filter(f => path.extname(f) == `.${extFilter}`);
        }
        return truthFiles;
    }
    subjectsDirPath() {
        return path.join(this.root_abs_path, 'experiments', 'subjects');
    }
    salamanderDirPath() {
        return path.join(this.root_abs_path, 'templates', 'Salamander/');
    }
}
export class Config extends MyStore {
    constructor(type) {
        super(false);
        this.type = type;
    }
    static get _KEYS() {
        return ['allowed_rhythm_deviation',
            'allowed_tempo_deviation',
            'current_subject',
            'demo_type',
            'errors_playingspeed',
            'finished_trials_count',
            'levels',
            'save_path'];
    }
    get allowed_tempo_deviation() {
        return this._get('allowed_tempo_deviation');
    }
    set allowed_tempo_deviation(deviation) {
        if (typeof deviation != 'string') {
            throw new TypeError(`config set allowed_tempo_deviation, received "deviation" not of type string. deviation: ${deviation}`);
        }
        if (!deviation.endsWith("%")) {
            throw new Error(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
        }
        this._set('allowed_tempo_deviation', deviation);
    }
    get allowed_rhythm_deviation() {
        return this._get('allowed_rhythm_deviation');
    }
    set allowed_rhythm_deviation(deviation) {
        if (typeof deviation != 'string') {
            throw new TypeError(`config set allowed_rhythm_deviation, received "deviation" not of type string. deviation: ${deviation}`);
        }
        if (!deviation.endsWith("%")) {
            throw new Error(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
        }
        this._set('allowed_rhythm_deviation', deviation);
    }
    get current_subject() {
        return this._get('current_subject');
    }
    set current_subject(name) {
        console.log('💾 set current_subject(', name, ')');
        this._set('current_subject', name);
        if (name) {
            super.subjects = [...super.get('subjects'), name];
        }
    }
    get errors_playingspeed() {
        return this._get('errors_playingspeed');
    }
    set errors_playingspeed(speed) {
        if (isNaN(speed)) {
            throw new TypeError(`config set errors_playingspeed, received bad "speed" NaN: ${speed}`);
        }
        this._set('errors_playingspeed', speed);
    }
    get save_path() {
        return this._get('save_path');
    }
    set save_path(savePath) {
        return this._set('save_path', savePath);
    }
    get demo_type() {
        return this._get('demo_type');
    }
    set demo_type(type) {
        if (!type.in(['video', 'animation'])) {
            throw new Error(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        }
        return this._set('demo_type', type);
    }
    get finished_trials_count() {
        return this._get('finished_trials_count');
    }
    set finished_trials_count(count) {
        this._set('finished_trials_count', count);
    }
    get levels() {
        return this._get('levels');
    }
    set levels(levels) {
        if (!Array.isArray(levels)) {
            throw new Error(`config.set levels, received "levels" not isArray. levels: ${levels}`);
        }
        this._set('levels', levels);
    }
    toTSavedConfig() {
        const self = super.get(`current_${this.type}`);
        delete self.save_path;
        const TSavedConfig = {
            ...self,
            truth_file_path: super.truth_file_path
        };
        return TSavedConfig;
    }
    fromSavedConfig(savedConfig, ...args) {
        this.levels = savedConfig.levels;
        this.finished_trials_count = savedConfig.finished_trials_count;
        this.errors_playingspeed = savedConfig.errors_playingspeed;
        this.demo_type = savedConfig.demo_type;
        this.current_subject = savedConfig.current_subject;
        this.allowed_tempo_deviation = savedConfig.allowed_tempo_deviation;
        this.allowed_rhythm_deviation = savedConfig.allowed_rhythm_deviation;
        this._updateSavedFile('truth_file_path', savedConfig.truth_file_path);
    }
    _updateSavedFile(key, value) {
        const conf = new (require('conf'))({
            cwd: path.dirname(path.join(super.root_abs_path, this.save_path)),
            configName: fsx.remove_ext(path.basename(this.save_path)),
            fileExtension: this.type,
            serialize: value => JSON.stringify(value, null, 4)
        });
        console.log('💾 _updateSavedFile(key,value)', { key, value, conf });
        conf.set(key, value);
    }
    _get(key) {
        return super.get(`current_${this.type}.${key}`);
    }
    _set(key, value) {
        const type = typeof key;
        if (type === 'string') {
            if (!key.in(Config._KEYS)) {
                throw new Error(`Config(${this.type})._set: "keyOrObj" is string, not in this._KEYS. keyOrObj: ${key}`);
            }
            const superkey = `current_${this.type}.${key}`;
            super.set(superkey, value);
            if (key != "save_path") {
                this._updateSavedFile(key, value);
            }
            return;
        }
        throw new TypeError(`Config(${this.type})._set: arg "keyOrObj" is not string. type: ${type}. keyOrObj: ${key}`);
    }
    currentTrialCoords() {
        let flatTrialsList = this.levels.map(level => level.trials);
        for (let [levelIndex, trialsNum] of enumerate(flatTrialsList)) {
            let trialSumSoFar = sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if (trialSumSoFar > finishedTrialsCount) {
                return [levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount)];
            }
        }
        throw "currentTrialCoords: out of index error";
    }
    isDemoVideo() {
        return this.demo_type == 'video';
    }
    isWholeTestOver() {
        return sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    getSubjectDirNames() {
        return require("fs").readdirSync(path.join(super.get('root_abs_path'), 'experiments', 'subjects'));
    }
    getCurrentLevel() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Level(this.levels[level_index], level_index, trial_index);
    }
    getLevels() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Levels(this.levels, level_index, trial_index);
    }
    trialTruth() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
    }
    testOutPath() {
        const currSubjectDir = path.join(super.subjectsDirPath(), this.current_subject);
        return path.join(currSubjectDir, this.truth().name);
    }
}
