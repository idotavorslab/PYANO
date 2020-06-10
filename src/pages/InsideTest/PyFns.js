let { Python, EStore } = require("pyano_local_modules/ext_libs");
const log = s => [`🐍 PyFns.%c${s}`, 'color:#698651'];

class DoneTrialResult {
	/**@param {TDoneTrialResult} doneTrialResult*/
	constructor(doneTrialResult) {
		const { advance_trial, mistakes, passed, played_too_many_notes, played_enough_notes, tempo_str } = doneTrialResult;
		this.advance_trial = advance_trial;
		this.mistakes = mistakes;
		this.passed = passed;
		this.played_too_many_notes = played_too_many_notes;
		this.played_enough_notes = played_enough_notes;
		this.tempo_str = tempo_str;
	}

	/**@return {boolean}*/
	hasMistakes() {
		return any(this.mistakes);
	}

	/**@return {boolean}*/
	hasAccuracyMistakes() {
		return 'accuracy'.in(this.mistakes);
	}

	/**@return {boolean}*/
	hasAccuracyAndRhythmMistakes() {
		return 'accuracy'.in(this.mistakes) && 'rhythm'.in(this.mistakes);
	}

	/**@return {?string}*/
	mistakesDescription() {
		if (this.hasAccuracyAndRhythmMistakes())
			return 'accuracy and rhythm';
		if (this.hasAccuracyMistakes())
			return 'accuracy';
		if ('rhythm'.in(this.mistakes))
			return 'rhythm';
		const errmsg = `DoneTrialResult.mistakesDescription() reached end (shouldn't): 
		this means not accuracy nor rhythm are found in mistakes. 
		Probably you didn't call hasMistakes() first. mistakes: ${this.mistakes}`;
		throw new Error(errmsg);
	}

	nullifyRhythmMistakes() {
		this.mistakes = this.mistakes.map(m => m == 'rhythm' ? null : m);
	}

	/**@return {boolean}*/
	isTempoBad() {
		return this.tempo_str && this.tempo_str != 'ok';
	}
}


/**@param {Truth} truth
 * @param {Truth} trialTruth
 * @return {Promise<DoneTrialResult>}*/
function check_done_trial(truth, trialTruth) {
	console.log(...log('check_done_trial(truth, trialTruth)'));
	return new Promise((resolve, reject) => {
		const experiment_type = EStore.experiment_type;
		const config = EStore.config();
		const current_level = config.getCurrentLevel();

		const args = [config.allowed_rhythm_deviation, config.allowed_tempo_deviation,
		              trialTruth.txt.on.path, truth.txt.on.path,
		              JSON.stringify(current_level), experiment_type];
		console.log(...log('\tcheck_done_trial, sending args in json mode: '), args);
		Python.run('InsideTest/check_done_trial.py', {
				args,
				mode: "json"
			},
			async (err, output) => {
				if (err) {
					reject(err);
				}
				const doneTrialResult = new DoneTrialResult(output[0]);
				console.log(...log('\tcheck_done_trial resolving'), doneTrialResult);
				resolve(doneTrialResult);

			});


	});
}

/**Also chord-normalizes txt on path.
 @param {Truth} truth
 @return {Promise<{on_msgs:TMessage[], off_msgs:TMessage[], on_off_pairs:TOnOffPairs, all_msgs:TMessage[]}>}*/
async function merge_on_off_txt_files(truth) {
	console.log(...log('merge_on_off_txt_files(truth)'));
	let msgs = await Python.runAsync('InsideTest/merge_on_off_txt_files.py', {
		args: [truth.txt.base.path, truth.txt.on.path, truth.txt.off.path],
		mode: "json"
	});
	let { all_msgs, on_msgs, off_msgs, on_off_pairs } = msgs[0];
	return { all_msgs, on_msgs, off_msgs, on_off_pairs };
}

module.exports = {
	check_done_trial,
	merge_on_off_txt_files
};