"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../Truth/index.js");
const pathx = require("../pathx.js");
const Store = require('electron-store');
const path = require("path");
const fs = require('fs');
const index_js_2 = require("../MyAlert/index.js");
const util = require("../util");
const index_js_3 = require("../Level/index.js");
class MyStore extends Store {
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
        if (truth.txt.allExist()) {
            this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
        }
        else {
            alert(`Not all txt files of truth exist: ${truth.txt.base.name}`);
        }
    }
    get last_page() {
        return this.get('last_page');
    }
    set last_page(page) {
        const validpages = ['new_test', 'inside_test', 'record', 'file_tools', 'settings'];
        if (!validpages.includes(page)) {
            alert(`setLastPage(page = ${page}), must be one of ${validpages.join(', ')}`);
        }
        this.set('last_page', page);
    }
    get experiment_type() {
        return this.get('experiment_type');
    }
    set experiment_type(experimentType) {
        if (experimentType != 'test' && experimentType != 'exam') {
            alert(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'`);
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
    fromSavedConfig(savedConfig, experimentType) {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new index_js_1.Truth(path.join(truthsDirPath, truthFileName));
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
                this.set(K, Math.floor(V) + 1);
            }
            else {
                throw new TypeError("MyStore tried to increase a value that is not a number or string");
            }
        }
    }
    truth() {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(this.truth_file_path, '.txt');
        return new index_js_1.Truth(path.join(truthsDirPath, truthFileName));
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
                alert(`truthFilesList(extFilter = ${extFilter}), must be either ['txt','mid','mp4'] or not at all`);
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
    async _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        const truth = this.truth();
        if (truth.txt.allExist()) {
            return index_js_2.default.small.success(`All "${truth.name}" txt files exist.`);
        }
        else {
            const txtFilesList = this.truthFilesList('txt').map(pathx.remove_ext);
            const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
            if (!util.bool(filteredTxts)) {
                return index_js_2.default.big.warning({
                    title: 'No valid truth files found',
                    html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
                });
            }
            await index_js_2.default.big.blocking({
                title: `Truth file invalid: ${truth.name}`,
                html: '<b>Please choose one of the following valid truths:</b>',
            }, {
                strings: filteredTxts,
                clickFn: async ($s) => {
                    try {
                        const config = this.config();
                        config.finished_trials_count = 0;
                        config.levels = [];
                        this.truth_file_path = new index_js_1.Truth(path.join(this.truthsDirPath(), $s.text()));
                        util.reloadPage();
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
    }
}
exports.MyStore = MyStore;
class Config extends MyStore {
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
            alert(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
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
            alert(`config set got bad deviation, not % at the end. deviation: ${deviation}`);
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
        if (!['video', 'animation'].includes(type)) {
            alert(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
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
            alert(`config.set levels, received "levels" not isArray. levels: ${levels}`);
        }
        this._set('levels', levels);
    }
    toTSavedConfig() {
        const self = super.get(`current_${this.type}`);
        delete self.save_path;
        const TSavedConfig = Object.assign(Object.assign({}, self), { truth_file_path: super.truth_file_path });
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
    _get(key) {
        return super.get(`current_${this.type}.${key}`);
    }
    _set(key, value) {
        const type = typeof key;
        if (type === 'string') {
            if (!key.in(Config._KEYS)) {
                alert(`Config(${this.type})._set: "keyOrObj" is string, not in this._KEYS. keyOrObj: ${key}`);
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
        for (let [levelIndex, trialsNum] of util.enumerate(flatTrialsList)) {
            let trialSumSoFar = util.sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if (trialSumSoFar > finishedTrialsCount) {
                return [levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount)];
            }
        }
        alert("currentTrialCoords: out of index error");
    }
    isDemoVideo() {
        return this.demo_type == 'video';
    }
    isWholeTestOver() {
        return util.sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    getSubjectDirNames() {
        return fs.readdirSync(path.join(super.get('root_abs_path'), 'experiments', 'subjects'));
    }
    getCurrentLevel() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new index_js_3.Level(this.levels[level_index], level_index, trial_index);
    }
    getLevels() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new index_js_3.Levels(this.levels, level_index, trial_index);
    }
    trialTruth() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new index_js_1.Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
    }
    testOutPath() {
        const currSubjectDir = path.join(super.subjectsDirPath(), this.current_subject);
        return path.join(currSubjectDir, this.truth().name);
    }
    _updateSavedFile(key, value) {
        const conf = new (require('conf'))({
            cwd: path.dirname(path.join(super.root_abs_path, this.save_path)),
            configName: pathx.remove_ext(path.basename(this.save_path)),
            fileExtension: this.type,
            serialize: value => JSON.stringify(value, null, 4)
        });
        console.log('💾 _updateSavedFile(key,value)', { key, value, conf });
        conf.set(key, value);
    }
}
exports.Config = Config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLGdEQUEwQztBQUMxQyxxQ0FBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixrREFBdUM7QUFDdkMsZ0NBQWdDO0FBRWhDLGdEQUFrRDtBQUdsRCxNQUFhLE9BQVEsU0FBUSxLQUFLO0lBRTlCLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksaUJBQWlCLEVBQUU7WUFDbkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDNUI7SUFHTCxDQUFDO0lBR0QsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUlELElBQUksZUFBZSxDQUFDLEtBQVk7UUFDNUIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsc0JBQXNCLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDNUU7YUFBTTtZQUNILEtBQUssQ0FBQyxxQ0FBcUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUVMLENBQUM7SUFHRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdELElBQUksU0FBUyxDQUFDLElBQWM7UUFDeEIsTUFBTSxVQUFVLEdBQUcs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WUFDL0IsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzRCxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDeEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNyRCxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUM7Q0FHSjtBQTlPRCx3QkE4T0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi8uLi9yZW5kZXJlci5qc1wiO1xuXG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aC9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgcGF0aHggZnJvbSBcIi4uL3BhdGh4LmpzXCI7XG5cbmNvbnN0IFN0b3JlID0gcmVxdWlyZSgnZWxlY3Ryb24tc3RvcmUnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCBBbGVydCBmcm9tIFwiLi4vTXlBbGVydC9pbmRleC5qc1wiXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBEZW1vVHlwZSwgRXhwZXJpbWVudFR5cGUsIExhc3RQYWdlLCBUQ29uZmlnLCBUU2F2ZWRDb25maWcgfSBmcm9tIFwiLi4vdGVtcGxhdGVzL2pzL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBMZXZlbCwgTGV2ZWxzIH0gZnJvbSBcIi4uL0xldmVsL2luZGV4LmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIE15U3RvcmUgZXh0ZW5kcyBTdG9yZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKF9kb1RydXRoRmlsZUNoZWNrKSB7XG4gICAgICAgICAgICB0aGlzLl9kb1RydXRoRmlsZUNoZWNrKCk7XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGdldCB0cnV0aF9maWxlX3BhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZV9wYXRoJyk7XG4gICAgfVxuXG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgc2V0IHRydXRoX2ZpbGVfcGF0aCh0cnV0aDogVHJ1dGgpIHtcbiAgICAgICAgaWYgKHRydXRoLnR4dC5hbGxFeGlzdCgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZV9wYXRoYCwgYGV4cGVyaW1lbnRzL3RydXRocy8ke3RydXRoLnR4dC5iYXNlLm5hbWV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGVydChgTm90IGFsbCB0eHQgZmlsZXMgb2YgdHJ1dGggZXhpc3Q6ICR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICBnZXQgbGFzdF9wYWdlKCk6IExhc3RQYWdlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG5cblxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogTGFzdFBhZ2UpIHtcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsnbmV3X3Rlc3QnLCAnaW5zaWRlX3Rlc3QnLCAncmVjb3JkJywgJ2ZpbGVfdG9vbHMnLCAnc2V0dGluZ3MnXTtcbiAgICAgICAgaWYgKCF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpKSB7XG4gICAgICAgICAgICBhbGVydChgc2V0TGFzdFBhZ2UocGFnZSA9ICR7cGFnZX0pLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICB9XG5cbiAgICAvKipAcmV0dXJuIHtURXhwZXJpbWVudFR5cGV9Ki9cbiAgICBnZXQgZXhwZXJpbWVudF90eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgIH1cblxuICAgIC8qKkBwYXJhbSB7VEV4cGVyaW1lbnRUeXBlfSBleHBlcmltZW50VHlwZSovXG4gICAgc2V0IGV4cGVyaW1lbnRfdHlwZShleHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoZXhwZXJpbWVudFR5cGUgIT0gJ3Rlc3QnICYmIGV4cGVyaW1lbnRUeXBlICE9ICdleGFtJykge1xuICAgICAgICAgICAgYWxlcnQoYE15U3RvcmUgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsIGV4cGVyaW1lbnRUeXBlKTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG5cblxuICAgIH1cblxuICAgIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIGdldCByb290X2Fic19wYXRoKCkge1xuICAgICAgICBsZXQgcm9vdF9hYnNfcGF0aCA9IHRoaXMuZ2V0KCdyb290X2Fic19wYXRoJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyb290X2Fic19wYXRoOicsIHJvb3RfYWJzX3BhdGgpO1xuICAgICAgICByZXR1cm4gcm9vdF9hYnNfcGF0aDtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge3N0cmluZ1tdfSBzdWJqZWN0TGlzdCovXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0KSB7XG4gICAgICAgIGNvbnN0IHN1YmplY3RzID0gWy4uLm5ldyBTZXQoc3ViamVjdExpc3QpXTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IHN1YmplY3RzOicsIHN1YmplY3RzKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IGNvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIGlmIChjdXJyZW50U3ViamVjdCAmJiAhY3VycmVudFN1YmplY3QuaW4oc3ViamVjdHMpKSB7XG4gICAgICAgICAgICBjb25maWcuY3VycmVudF9zdWJqZWN0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIC8vIGdldCBzYXZlX3BhdGgoKSB7XG4gICAgLy8gXHRyZXR1cm4gdGhpcy5nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKkBwYXJhbSB7c3RyaW5nfSBzYXZlUGF0aCovXG4gICAgLy8gc2V0IHNhdmVfcGF0aChzYXZlUGF0aCkge1xuICAgIC8vIFx0dGhpcy5zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICAvLyB9XG5cblxuICAgIGdldCBkZXYoKToge1xuICAgICAgICBza2lwX3dob2xlX3RydXRoOiAoKCkgPT4gYm9vbGVhbik7XG4gICAgICAgIHNraXBfbGV2ZWxfaW50cm86ICgoKSA9PiBib29sZWFuKTtcbiAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6ICgoKSA9PiBib29sZWFuKTtcbiAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6ICgoKSA9PiBib29sZWFuKTtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGg6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMuc2tpcF93aG9sZV90cnV0aCcpLFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybzogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvJyksXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaycpLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2snKSxcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogVFNhdmVkQ29uZmlnLCBleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbih0cnV0aHNEaXJQYXRoLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIHRoaXMuY29uZmlnKCkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge1RFeHBlcmltZW50VHlwZT99IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtDb25maWd9Ki9cbiAgICBjb25maWcodHlwZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb25maWcodHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgQHBhcmFtIHtzdHJpbmd9IEtcbiAgICAgQHBhcmFtIGt2XG4gICAgIEByZXR1cm4geyp9ICovXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KFYpKSB7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBbLi4uViwga3ZdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cblxuICAgIC8qKiBAcGFyYW0ge3N0cmluZ30gSyovXG4gICAgaW5jcmVhc2UoSykge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuXG4gICAgICAgIGlmIChWID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpc05hTihNYXRoLmZsb29yKFYpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk15U3RvcmUgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBvciBzdHJpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKkByZXR1cm4ge1RydXRofSovXG4gICAgdHJ1dGgoKSB7XG4gICAgICAgIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRydXRoc0RpclBhdGgsIHRydXRoRmlsZU5hbWUpKTtcbiAgICB9XG5cbiAgICAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICBjb25maWdzUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdjb25maWdzJyk7XG4gICAgfVxuXG4gICAgLyoqXCJDOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFub1xccHlhbm9fMDFcXHNyY1xcZXhwZXJpbWVudHNcXHRydXRoc1wiXG4gICAgIEByZXR1cm4ge3N0cmluZ30qL1xuICAgIHRydXRoc0RpclBhdGgoKSB7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5yb290X2Fic19wYXRoLCAnZXhwZXJpbWVudHMnLCAndHJ1dGhzJyk7XG4gICAgfVxuXG4gICAgLyoqQHBhcmFtIHtTdHJpbmc/fSBleHRGaWx0ZXJcbiAgICAgQHJldHVybiB7c3RyaW5nW119IHRydXRoRmlsZXMqL1xuICAgIHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9IG51bGwpIHtcbiAgICAgICAgaWYgKGV4dEZpbHRlciAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoIWV4dEZpbHRlci5pbihbJ3R4dCcsICdtaWQnLCAnbXA0J10pKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoYHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9ICR7ZXh0RmlsdGVyfSksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuXG4gICAgICAgIGxldCB0cnV0aEZpbGVzID0gWy4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmModHJ1dGhzRGlyUGF0aCkpXTtcbiAgICAgICAgaWYgKGV4dEZpbHRlciAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcy5maWx0ZXIoZiA9PiBwYXRoLmV4dG5hbWUoZikgPT0gYC4ke2V4dEZpbHRlcn1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcztcbiAgICB9XG5cbiAgICAvKiogXCJDOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFub1xccHlhbm9fMDFcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXCJcbiAgICAgQHJldHVybiB7c3RyaW5nfSAqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdzdWJqZWN0cycpO1xuICAgIH1cblxuICAgIHNhbGFtYW5kZXJEaXJQYXRoKCkge1xuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMucm9vdF9hYnNfcGF0aCwgJ3RlbXBsYXRlcycsICdTYWxhbWFuZGVyLycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2RvVHJ1dGhGaWxlQ2hlY2soKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IE15U3RvcmUuX2RvVHJ1dGhGaWxlQ2hlY2soKScpO1xuXG4gICAgICAgIGNvbnN0IHRydXRoID0gdGhpcy50cnV0aCgpO1xuICAgICAgICBpZiAodHJ1dGgudHh0LmFsbEV4aXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGBBbGwgXCIke3RydXRoLm5hbWV9XCIgdHh0IGZpbGVzIGV4aXN0LmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHh0RmlsZXNMaXN0ID0gdGhpcy50cnV0aEZpbGVzTGlzdCgndHh0JykubWFwKHBhdGh4LnJlbW92ZV9leHQpO1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgICAgICBpZiAoIXV0aWwuYm9vbChmaWx0ZXJlZFR4dHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogYFRydXRoIGZpbGUgaW52YWxpZDogJHt0cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICAgICAgaHRtbDogJzxiPlBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsaWQgdHJ1dGhzOjwvYj4nLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHN0cmluZ3M6IGZpbHRlcmVkVHh0cyxcbiAgICAgICAgICAgICAgICBjbGlja0ZuOiBhc3luYyAkcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50cnV0aHNEaXJQYXRoKCksICRzLnRleHQoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLXRpdGxlJykuaW5uZXJUZXh0ID0gZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3dhbDItY29udGVudCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzd2FsMi1pY29uIHN3YWwyLXdhcm5pbmcnKVswXS5zdHlsZS5kaXNwbGF5ID0gJ2luaGVyaXQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgY2xhc3MgQ29uZmlnIGV4dGVuZHMgTXlTdG9yZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cblxuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgX0tFWVMoKSB7XG4gICAgICAgIHJldHVybiBbJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicsXG4gICAgICAgICAgICAnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nLFxuICAgICAgICAgICAgJ2N1cnJlbnRfc3ViamVjdCcsXG4gICAgICAgICAgICAnZGVtb190eXBlJyxcbiAgICAgICAgICAgICdlcnJvcnNfcGxheWluZ3NwZWVkJyxcbiAgICAgICAgICAgICdmaW5pc2hlZF90cmlhbHNfY291bnQnLFxuICAgICAgICAgICAgJ2xldmVscycsXG4gICAgICAgICAgICAnc2F2ZV9wYXRoJ107XG4gICAgfVxuXG4gICAgLyoqQHJldHVybiB7c3RyaW5nfSAqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge3N0cmluZ30gZGV2aWF0aW9uKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGV2aWF0aW9uICE9ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBjb25maWcgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBvZiB0eXBlIHN0cmluZy4gZGV2aWF0aW9uOiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBjb25maWcgc2V0IGdvdCBiYWQgZGV2aWF0aW9uLCBub3QgJSBhdCB0aGUgZW5kLiBkZXZpYXRpb246ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nLCBkZXZpYXRpb24pO1xuICAgIH1cblxuICAgIC8qKkByZXR1cm4ge3N0cmluZ30gKi9cbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge3N0cmluZ30gZGV2aWF0aW9uKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIGRldmlhdGlvbiAhPSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgY29uZmlnIHNldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IG9mIHR5cGUgc3RyaW5nLiBkZXZpYXRpb246ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSkge1xuICAgICAgICAgICAgYWxlcnQoYGNvbmZpZyBzZXQgZ290IGJhZCBkZXZpYXRpb24sIG5vdCAlIGF0IHRoZSBlbmQuIGRldmlhdGlvbjogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nLCBkZXZpYXRpb24pO1xuICAgIH1cblxuICAgIC8qKkByZXR1cm4ge3N0cmluZ30gKi9cbiAgICBnZXQgY3VycmVudF9zdWJqZWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdjdXJyZW50X3N1YmplY3QnKTtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge3N0cmluZ3xudWxsfSBuYW1lKi9cbiAgICBzZXQgY3VycmVudF9zdWJqZWN0KG5hbWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IGN1cnJlbnRfc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICB0aGlzLl9zZXQoJ2N1cnJlbnRfc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAge1xuICAgICAgICAgICAgc3VwZXIuc3ViamVjdHMgPSBbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkByZXR1cm4ge251bWJlcn0gKi9cbiAgICBnZXQgZXJyb3JzX3BsYXlpbmdzcGVlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZXJyb3JzX3BsYXlpbmdzcGVlZCcpO1xuICAgIH1cblxuICAgIC8qKkBwYXJhbSB7bnVtYmVyfSBzcGVlZCovXG4gICAgc2V0IGVycm9yc19wbGF5aW5nc3BlZWQoc3BlZWQpIHtcbiAgICAgICAgaWYgKGlzTmFOKHNwZWVkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgY29uZmlnIHNldCBlcnJvcnNfcGxheWluZ3NwZWVkLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXQoJ2Vycm9yc19wbGF5aW5nc3BlZWQnLCBzcGVlZCk7XG5cbiAgICB9XG5cbiAgICBnZXQgc2F2ZV9wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIH1cblxuICAgIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGg6IHN0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICB9XG5cbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZGVtb190eXBlJyk7XG4gICAgfVxuXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBpZiAoIVsndmlkZW8nLCAnYW5pbWF0aW9uJ10uaW5jbHVkZXModHlwZSkpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgfVxuXG4gICAgLyoqQHJldHVybiB7bnVtYmVyfSAqL1xuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cblxuICAgIC8qKkBwYXJhbSB7bnVtYmVyfSBjb3VudCovXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudCkge1xuICAgICAgICB0aGlzLl9zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICB9XG5cbiAgICAvKipAcmV0dXJuIHtUTGV2ZWxbXX0qL1xuICAgIGdldCBsZXZlbHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2xldmVscycpO1xuICAgIH1cblxuICAgIC8qKkBwYXJhbSB7VExldmVsW119IGxldmVscyovXG4gICAgc2V0IGxldmVscyhsZXZlbHMpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxldmVscykpIHtcbiAgICAgICAgICAgIGFsZXJ0KGBjb25maWcuc2V0IGxldmVscywgcmVjZWl2ZWQgXCJsZXZlbHNcIiBub3QgaXNBcnJheS4gbGV2ZWxzOiAke2xldmVsc31gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgfVxuXG4gICAgLyoqIEByZXR1cm4ge1RTYXZlZENvbmZpZ30qL1xuICAgIHRvVFNhdmVkQ29uZmlnKCkge1xuICAgICAgICAvKipAdHlwZSB7VENvbmZpZ30qL1xuICAgICAgICBjb25zdCBzZWxmID0gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfWApO1xuICAgICAgICBkZWxldGUgc2VsZi5zYXZlX3BhdGg7XG4gICAgICAgIGNvbnN0IFRTYXZlZENvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLnNlbGYsXG4gICAgICAgICAgICB0cnV0aF9maWxlX3BhdGg6IHN1cGVyLnRydXRoX2ZpbGVfcGF0aFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gVFNhdmVkQ29uZmlnO1xuICAgIH1cblxuICAgIC8qKkBwYXJhbSB7VFNhdmVkQ29uZmlnfSBzYXZlZENvbmZpZ1xuICAgICAqIEBwYXJhbSBhcmdzKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcsIC4uLmFyZ3MpIHtcbiAgICAgICAgdGhpcy5sZXZlbHMgPSBzYXZlZENvbmZpZy5sZXZlbHM7XG4gICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc2F2ZWRDb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICB0aGlzLmVycm9yc19wbGF5aW5nc3BlZWQgPSBzYXZlZENvbmZpZy5lcnJvcnNfcGxheWluZ3NwZWVkO1xuICAgICAgICB0aGlzLmRlbW9fdHlwZSA9IHNhdmVkQ29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgdGhpcy5jdXJyZW50X3N1YmplY3QgPSBzYXZlZENvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG5cbiAgICAvKipAcGFyYW0ge1RDb25maWdLZXl9IGtleSovXG4gICAgX2dldChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldChgY3VycmVudF8ke3RoaXMudHlwZX0uJHtrZXl9YCk7XG4gICAgfVxuXG4gICAgLyoqQHBhcmFtIHtUQ29uZmlnS2V5fSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWUqL1xuICAgIF9zZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCB0eXBlID0gdHlwZW9mIGtleTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoIWtleS5pbihDb25maWcuX0tFWVMpKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoYENvbmZpZygke3RoaXMudHlwZX0pLl9zZXQ6IFwia2V5T3JPYmpcIiBpcyBzdHJpbmcsIG5vdCBpbiB0aGlzLl9LRVlTLiBrZXlPck9iajogJHtrZXl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdXBlcmtleSA9IGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gO1xuICAgICAgICAgICAgc3VwZXIuc2V0KHN1cGVya2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoa2V5ICE9IFwic2F2ZV9wYXRoXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYXZlZEZpbGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDb25maWcoJHt0aGlzLnR5cGV9KS5fc2V0OiBhcmcgXCJrZXlPck9ialwiIGlzIG5vdCBzdHJpbmcuIHR5cGU6ICR7dHlwZX0uIGtleU9yT2JqOiAke2tleX1gKTtcbiAgICB9XG5cblxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdDogbnVtYmVyW10gPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yIChsZXQgW2xldmVsSW5kZXgsIHRyaWFsc051bV0gb2YgdXRpbC5lbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpKSB7XG5cbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gdXRpbC5zdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICh0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYWxlcnQoXCJjdXJyZW50VHJpYWxDb29yZHM6IG91dCBvZiBpbmRleCBlcnJvclwiKTtcbiAgICB9XG5cbiAgICBpc0RlbW9WaWRlbygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09ICd2aWRlbyc7XG4gICAgfVxuXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdXRpbC5zdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cblxuICAgIGdldFN1YmplY3REaXJOYW1lcygpIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihzdXBlci5nZXQoJ3Jvb3RfYWJzX3BhdGgnKSwgJ2V4cGVyaW1lbnRzJywgJ3N1YmplY3RzJykpO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG5cbiAgICAgICAgbGV0IFtsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXhdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuXG4gICAgZ2V0TGV2ZWxzKCk6IExldmVscyB7XG4gICAgICAgIGxldCBbbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4XSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxzKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cblxuICAgIC8qKkdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICB0cmlhbFRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgbGV0IFtsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXhdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cblxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgdGVzdE91dFBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oc3VwZXIuc3ViamVjdHNEaXJQYXRoKCksIHRoaXMuY3VycmVudF9zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoKCkubmFtZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgVFNhdmVkQ29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKHBhdGguam9pbihzdXBlci5yb290X2Fic19wYXRoLCB0aGlzLnNhdmVfcGF0aCkpLFxuICAgICAgICAgICAgY29uZmlnTmFtZTogcGF0aHgucmVtb3ZlX2V4dChwYXRoLmJhc2VuYW1lKHRoaXMuc2F2ZV9wYXRoKSksXG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBzZXJpYWxpemU6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gX3VwZGF0ZVNhdmVkRmlsZShrZXksdmFsdWUpJywgeyBrZXksIHZhbHVlLCBjb25mIH0pO1xuICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG5cblxufVxuXG5cbiJdfQ==