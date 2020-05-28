const Store = require('electron-store');
const Path = require("path");
const fs = require('fs');

/**@class*/
class MyStore extends Store {

    constructor(_doTruthFileCheck = true) {
        super();
        if (_doTruthFileCheck)
            this._doTruthFileCheck();


    }

    /**@return {string}*/
    get truth_file_path() {
        return this.get('truth_file_path');
    }

    /**@param {Truth} truth*/
    set truth_file_path(truth) {
        truth.txt.allExist()
            .then(exist => {
                if (exist) {
                    this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);

                } else {
                    throw new Error(`Not all txt files of truth exist: ${truth.txt.base.name}`);
                }
            });
    }

    /**@return {TLastPage}*/
    get last_page() {
        return this.get('last_page');
    }

    /**@param {TLastPage} page*/
    set last_page(page) {
        const validpages = ['new_test', 'inside_test', 'record', 'file_tools', 'settings'];
        if (!page.in(validpages))
            throw new Error(`setLastPage(page = ${page}), must be one of ${validpages.join(', ')}`);

        this.set('last_page', page);
    }

    /**@return {TExperimentType}*/
    get experiment_type() {
        return this.get('experiment_type');
    }

    /**@param {TExperimentType} experimentType*/
    set experiment_type(experimentType) {
        if (experimentType != 'test' && experimentType != 'exam')
            throw new Error(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'`);
        this.set('experiment_type', experimentType);
        // this._updateSavedFile('experiment_type', experimentType);


    }

    /**@return {string}*/
    get root_abs_path() {
        let root_abs_path = this.get('root_abs_path');
        console.log('root_abs_path:', root_abs_path);
        return root_abs_path;
    }

    /**@param {string[]} subjectList*/
    set subjects(subjectList) {
        const subjects = [...new Set(subjectList)];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if (currentSubject && !currentSubject.in(subjects))
            config.current_subject = null;
    }

    // /**@return {string}*/
    // get save_path() {
    // 	return this.get('save_path');
    // }
    //
    // /**@param {string} savePath*/
    // set save_path(savePath) {
    // 	this.set('save_path', savePath);
    // }

    /**
     * @return {{
     * skip_whole_truth: (function(): boolean),
     * skip_level_intro: (function(): boolean),
     * skip_failed_trial_feedback: (function(): boolean),
     * skip_passed_trial_feedback: (function(): boolean)
     * toObj}
     * }
     */
    get dev() {
        const _dev = this.get('dev');
        return {
            skip_whole_truth: () => _dev && this.get('devoptions.skip_whole_truth'),
            skip_level_intro: () => _dev && this.get('devoptions.skip_level_intro'),
            skip_passed_trial_feedback: () => _dev && this.get('devoptions.skip_passed_trial_feedback'),
            skip_failed_trial_feedback: () => _dev && this.get('devoptions.skip_failed_trial_feedback'),
        };
    }

    /**@private*/
    _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');

        const truth = this.truth();
        truth.txt.allExist()
            .then(async exist => {
                if (exist) {
                    return Alert.small.success(`All "${truth.name}" txt files exist.`);
                } else {
                    const txtFilesList = this.truthFilesList('txt').map(fsx.remove_ext);
                    const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
                    if (!bool(filteredTxts))
                        return await Alert.big.warning({
                            title: 'No valid truth files found',
                            html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
                        });


                    await Alert.big.blocking({
                        title: `Truth file invalid: ${truth.name}`,
                        html: '<b>Please choose one of the following valid truths:</b>',
                    }, {
                        strings: filteredTxts,
                        clickFn: async $s => {
                            try {
                                const config = this.config();
                                config.finished_trials_count = 0;
                                config.levels = [];
                                this.truth_file_path = new Truth(Path.join(this.truthsDirPath(), $s.text()));
                                reloadPage();
                            } catch (err) {
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

    /**@param {TSavedConfig} savedConfig
     * @param {TExperimentType} experimentType*/
    fromSavedConfig(savedConfig, experimentType) {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = Path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth(Path.join(truthsDirPath, truthFileName));
        this.experiment_type = experimentType;
        this.config().fromSavedConfig(savedConfig);
    }

    /**@param {TExperimentType?} type
     * @return {Config}*/
    config(type = undefined) {
        if (type)
            return new Config(type);
        else
            return new Config(this.experiment_type);
    }

    /**@example
     update('subjects', [names])
     @param {string} K
     @param kv
     @return {*} */
    update(K, kv) {
        let V = this.get(K);
        if (Array.isArray(V)) {
            this.set(K, [...V, kv]);
        } else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }

    /** @param {string} K*/
    increase(K) {
        let V = this.get(K);

        if (V === undefined)
            this.set(K, 1);
        else if (!isNaN(Math.floor(V)))
            this.set(K, int(V) + 1);
        else
            throw new TypeError("MyStore tried to increase a value that is not a number or string");

    }

    /**@return {Truth}*/
    truth() {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = Path.basename(this.truth_file_path, '.txt');
        return new Truth(Path.join(truthsDirPath, truthFileName));
    }

    /**@return {string}*/
    configsPath() {
        return Path.join(this.root_abs_path, 'experiments', 'configs');
    }

    /**"C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\truths"
     @return {string}*/
    truthsDirPath() {
        return Path.join(this.root_abs_path, 'experiments', 'truths');
    }

    /**@param {String?} extFilter
     @return {string[]} truthFiles*/
    truthFilesList(extFilter = null) {
        if (extFilter != null)
            if (!extFilter.in(['txt', 'mid', 'mp4']))
                throw new Error(`truthFilesList(extFilter = ${extFilter}), must be either ['txt','mid','mp4'] or not at all`);

        const truthsDirPath = this.truthsDirPath();

        let truthFiles = [...new Set(fs.readdirSync(truthsDirPath))];
        if (extFilter != null)
            return truthFiles.filter(f => Path.extname(f) == `.${extFilter}`);
        return truthFiles;
    }

    /** "C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\subjects"
     @return {string} */
    subjectsDirPath() {
        return Path.join(this.root_abs_path, 'experiments', 'subjects');
    }

    salamanderDirPath() {
        return Path.join(this.root_abs_path, 'templates', 'Salamander/');
    }


}

/**@class*/
class Config extends MyStore {
    /**@param {TExperimentType} type*/
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

    /**@return {string} */
    get allowed_tempo_deviation() {
        return this._get('allowed_tempo_deviation');
    }

    /**@param {string} deviation*/
    set allowed_tempo_deviation(deviation) {
        if (typeof deviation != 'string')
            throw new TypeError(`config set allowed_tempo_deviation, received "deviation" not of type string. deviation: ${deviation}`);
        if (!deviation.endsWith("%"))
            throw new Error(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
        this._set('allowed_tempo_deviation', deviation);
    }

    /**@return {string} */
    get allowed_rhythm_deviation() {
        return this._get('allowed_rhythm_deviation');
    }

    /**@param {string} deviation*/
    set allowed_rhythm_deviation(deviation) {
        if (typeof deviation != 'string')
            throw new TypeError(`config set allowed_rhythm_deviation, received "deviation" not of type string. deviation: ${deviation}`);
        if (!deviation.endsWith("%"))
            throw new Error(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
        this._set('allowed_rhythm_deviation', deviation);
    }

    /**@return {string} */
    get current_subject() {
        return this._get('current_subject');
    }

    /**@param {string|null} name*/
    set current_subject(name) {
        console.log('💾 set current_subject(', name, ')');
        this._set('current_subject', name);
        if (name)
            // super.set('subjects', [...new Set([...super.get('subjects'), name])]);
            super.subjects = [...super.get('subjects'), name];
    }

    /**@return {number} */
    get errors_playingspeed() {
        return this._get('errors_playingspeed');
    }

    /**@param {number} speed*/
    set errors_playingspeed(speed) {
        if (isNaN(speed))
            throw new TypeError(`config set errors_playingspeed, received bad "speed" NaN: ${speed}`);
        this._set('errors_playingspeed', speed);

    }

    /**@return {string}*/
    get save_path() {
        return this._get('save_path');
    }

    /**@param {string} savePath*/
    set save_path(savePath) {
        return this._set('save_path', savePath);
    }

    /**@return {TDemoType}*/
    get demo_type() {
        return this._get('demo_type');
    }

    /**@param {TDemoType} type*/
    set demo_type(type) {
        if (!type.in(['video', 'animation']))
            throw new Error(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        return this._set('demo_type', type);
    }

    /**@return {number} */
    get finished_trials_count() {
        return this._get('finished_trials_count');
    }

    /**@param {number} count*/
    set finished_trials_count(count) {
        this._set('finished_trials_count', count);
    }

    /**@return {TLevel[]}*/
    get levels() {
        return this._get('levels');
    }

    /**@param {TLevel[]} levels*/
    set levels(levels) {
        if (!Array.isArray(levels))
            throw new Error(`config.set levels, received "levels" not isArray. levels: ${levels}`);
        this._set('levels', levels);
    }

    /** @return {TSavedConfig}*/
    toTSavedConfig() {
        /**@type {TConfig}*/
        const self = super.get(`current_${this.type}`);
        delete self.save_path;
        const TSavedConfig = {
            ...self,
            truth_file_path: super.truth_file_path
        };
        return TSavedConfig;
    }

    /**@param {TSavedConfig} savedConfig
     * @param args*/
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

    /**@private
     * @param {TSavedConfigKey} key
     * @param value*/
    _updateSavedFile(key, value) {
        const conf = new (require('conf'))({
            cwd: Path.dirname(Path.join(super.root_abs_path, this.save_path)),
            configName: fsx.remove_ext(Path.basename(this.save_path)),
            fileExtension: this.type,
            serialize: value => JSON.stringify(value, null, 4)
        });
        console.log('💾 _updateSavedFile(key,value)', {key, value, conf});
        conf.set(key, value);
    }

    /**@param {TConfigKey} key*/
    _get(key) {
        return super.get(`current_${this.type}.${key}`);
    }

    /**@param {TConfigKey} key
     * @param value*/
    _set(key, value) {
        const type = typeof key;
        if (type === 'string') {
            if (!key.in(Config._KEYS))
                throw new Error(`Config(${this.type})._set: "keyOrObj" is string, not in this._KEYS. keyOrObj: ${key}`);
            const superkey = `current_${this.type}.${key}`;
            super.set(superkey, value);
            if (key != "save_path")
                this._updateSavedFile(key, value);
            return;
        }

        throw new TypeError(`Config(${this.type})._set: arg "keyOrObj" is not string. type: ${type}. keyOrObj: ${key}`);
    }

    /**@return {number[]}*/
    currentTrialCoords() {
        // let { levels, finished_trials_count } = this.config();
        let flatTrialsList = this.levels.map(level => level.trials);
        for (let [levelIndex, trialsNum] of enumerate(flatTrialsList)) {

            let trialSumSoFar = sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if (trialSumSoFar > finishedTrialsCount)
                return [levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount)];
        }
        throw "currentTrialCoords: out of index error";
    }

    isDemoVideo() {
        return this.demo_type == 'video';
    }

    /**@return {boolean}*/
    isWholeTestOver() {
        return sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }

    getSubjectDirNames() {
        return require("fs").readdirSync(Path.join(super.get('root_abs_path'), 'experiments', 'subjects'));
    }

    /**@return {Level}*/
    getCurrentLevel() {

        let [level_index, trial_index] = this.currentTrialCoords();
        return new Level(this.levels[level_index], level_index, trial_index);
    }

    /**@return {Levels}*/
    getLevels() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Levels(this.levels, level_index, trial_index);
    }


    /**Gets the current trial's path (join this.testOutPath() and level_${level_index}...), and returns a Truth of it
     @return {Truth}*/
    trialTruth() {
        let [level_index, trial_index] = this.currentTrialCoords();
        // return new Truth(Path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
        return new Truth(Path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
    }

    /**"c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\gilad\fur_elise"
     @return {string}*/
    testOutPath() {
        const currSubjectDir = Path.join(super.subjectsDirPath(), this.current_subject); // ".../subjects/gilad"
        return Path.join(currSubjectDir, this.truth().name);
    }


}

/**
 * @type {MyStore}
 */
module.exports = MyStore;
