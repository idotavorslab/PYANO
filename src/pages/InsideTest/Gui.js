const { strong, span } = require("pyano_local_modules/util");
const { EStore } = require("pyano_local_modules/ext_libs");
const Svg = require("./Svg");
const fs = require("fs");

const { $Sidebar } = require("pyano_local_modules/document");

const PyFns = require("./PyFns");
const log = (s, { b, sm } = {}) => [`🎨 %c${s}`,
                                    `color: #a147ad; ${b ? 'font-weight:900;' : ''} ${sm ? 'font-size:10px;' : ''}`];
const logmod = (s, { b, sm } = {}) => [`🎨 Gui.%c${s}`, `color: #a147ad; ${b ? 'font-weight:900;' : ''} ${sm ? 'font-size:10px;' : ''}`];

class Messages {
	/**@param {TMessage[]} msgs*/
	constructor(msgs) {
		/**@type {TMessage[]}*/
		this._msgs = msgs;
	}

	/**@return {Object<number,number[]>}*/
	// chords() {
	// 	const chords = {};
	// 	for (const [i, message] of enumerate(this._msgs)) {
	// 		if (message.time_delta == null) continue;
	// 		if (message.time_delta <= 0.05) {
	// 			if (!bool(chords)) {
	// 				chords[i - 1] = [i];
	// 				continue;
	// 			}
	// 			const last_key = chords.keys().last();
	// 			/**@type {number[]}*/
	// 			const last_value = chords[last_key];
	//
	// 			if (last_key == i - 1 || last_value.includes(i - 1))
	// 				chords[last_key].push(i);
	// 			else
	// 				chords[i - 1] = [i];
	//
	// 		}
	// 	}
	// 	return chords;
	// }

	/*_numofChordedNotes(upTo) {
		const numofChordedNotes = 0;
		const chords = this.chords();
		const roots = chords.keys();
		for (const root of roots) {
			if (root <= upTo) // yes lower equal
				numofChordedNotes += chords[root].length;
			else
				break; // OrderedDict;
		}
		return numofChordedNotes;
	}
	*/

	/**@param {number} numOfNotes
	 @return {number[]}*/
	time_deltas(numOfNotes) {
		/*const numofChordedNotes = this._numofChordedNotes(numOfNotes);
		const end = numOfNotes + 1 + numofChordedNotes;
		console.log(`\t\tMessages.time_deltas numofChordedNotes: `, numofChordedNotes, 'end: ', end);
		*/
		// const numofChordedNotes = this._numofChordedNotes(numOfNotes);
		const end = numOfNotes + 1;
		console.log(`\tMessages.time_deltas, numOfNotes:`, numOfNotes, 'end:', end);
		const time_deltas = this._msgs.slice(0, end).map(msg => msg.time_delta);
		if (numOfNotes >= this._msgs.length) {
			// if user specified as much notes as in txt file, add a fake "last note" lasting 1 second
			// this is to prevent cropping of last note (compensate for lack of "time_delta")
			time_deltas.push(1);
		} else {
			// user specified some notes, not all of them
			// shorten last note a bit so the beginning of the last one won't be heard
			// time_deltas[time_deltas.length - 1] -= 0.1; // same as audio fadeout dur
			time_deltas[time_deltas.length - 1] -= 0.10; // same as audio fadeout dur
		}
		return time_deltas;
	}
}

class Video {
	/**@param {jQuery} $video*/
	constructor($video) {
		this.$element = $video;
		this.firstOnset = null;
	}

	/**@param {Truth} truth*/
	async init(truth) {
		const vidsrcfile = `file:///${truth.mp4.path}`;
		const src = `<source src="${vidsrcfile}" type="video/mp4">`;
		this.$element.append(src);
		let data = await fs.readFileSync(truth.onsets.path);
		/**@type {{onsets:string[],first_onset_index:number}}*/
		data = JSON.parse(data);
		console.log('👓 Video.data from onsets.json', { data });
		this.firstOnset = float(data.onsets[data.first_onset_index]);
		this.lastOnset = float(data.onsets.last());

		const { on_msgs, off_msgs, on_off_pairs } = await PyFns.merge_on_off_txt_files(truth);
		/**@type {Messages}*/
		this.on_messages = new Messages(on_msgs);
		/**@type {Messages}*/
		this.off_messages = new Messages(off_msgs);
		/**@type {TOnOffPairs}*/
		this.on_off_pairs = on_off_pairs;

		const events = [
			'canplay',  // not enough data has been loaded to play the media up to its end
			'canplaythrough', // can play the media up to its end
			'emptied',
			'ended', // reached end
			'loadeddata', // first frame of media has finished loading
			'loadedmetadata',
			'play', // Playback has begun
			'playing', // Playback is ready to start after having been paused or delayed due to lack of data.
			'stalled', // trying to fetch media data, but is not coming
			'suspend', // Media data loading has been suspended.
			'waiting', // stopped because of a temporary lack of data
		];
		for (const ev of events) {
			const evFired = `${ev}Fired`;
			this[evFired] = false;
			this.vidElm[`on${ev}`] = () => this[evFired] = true;
		}
		// this.vidElm.addEventListener('mousedown', e => {
		// 	console.log('%cvideo mousedown', 'color:#de7d36', { isTrusted: e.isTrusted });
		// 	this.vidElm.play();
		// }, { once: true });
		// this.vidElm.onmousedown = e => {
		// 	console.log('%cvideo mousedown', 'color:#de7d36', { isTrusted: e.isTrusted });
		// 	this.vidElm.play();
		// };

	}

	// TODO: unused
	/*_promiseMousedown() {
		console.log(...small('👓 _promiseMousedown() started'));
		return new Promise(resolve =>
			this.vidElm.addEventListener('mousedown', e => {
				console.log('%cvideo mousedown', 'color:#de7d36', { isTrusted: e.isTrusted });
				console.log(...small('_promiseMousedown() resolving'));
				resolve();
			}, { once: true }));
	}*/

	// TODO: unused
	/*_promisePlaying() { // TODO: This is not really working
		console.log(...small('_promisePlaying() started'));
		return new Promise(resolve =>
			this.vidElm.onplaying = () => {
				console.log(...small('_promisePlaying() resolving'));
				this.vidElm.onplaying = null;
				resolve();
			});
	}*/

	// TODO: unused
	/*	_promiseEnded() { // on err
			console.log(...small('_promiseEnded() started'));
			return new Promise(resolve => this.vidElm.onended = () => {
				console.log(...small('_promiseEnded() resolving'));
				this.vidElm.onended = null;
				resolve();
			});
		}*/

	setCurrentTimeToFirstOnset() {
		console.log(...small('👓 setCurrentTimeToFirstOnset(): ', this.firstOnset - 0.1));
		this.vidElm.currentTime = this.firstOnset - 0.1;
	}

	async _fakeMousedown() {
		console.log(...small('👓 Faking mousedown...'));
		this.$element.css('z-index', 2000);
		// noinspection JSUnresolvedFunction
		getCurrentWindow().webContents.sendInputEvent({
			type: 'mouseDown',
			x: 1000,
			y: 500,
			button: 'left',
		});
		await asx.wait(100);
		this.$element.css('z-index', -1);

	}

	_promiseReady() {
		console.log('\t👓 _promiseReady() started');
		return new Promise(resolve => this.vidElm.onloadeddata = () => {
			console.log('_promiseReady() resolving');
			resolve();
		});
	}


	_promiseFadeIn() {
		console.log(...small('\t👓 _promiseFadeIn()'));
		if (this.vidElm.volume != 0)
			console.warn('👓 _promiseFadeIn volume not 0, it is: ', this.vidElm.volume);
		return new Promise(resolve => this.$element.animate({ volume: 1 }, 50, resolve));
	}

	_promiseFadeOut() {
		console.log(...small('\t👓 _promiseFadeOut()'));
		if (this.vidElm.volume != 1)
			console.warn('👓 _promiseFadeOut volume not 1, it is: ', this.vidElm.volume);
		return new Promise(resolve => this.$element.animate({ volume: 0 }, 0, resolve));
	}

	// TODO: unused
	/*_logEvents() {
		console.group(...small('_logEvents()'));
		for (const [evprop, val] of enumerate(this))
			if (evprop.endsWith('Fired')) {
				const strings = small(evprop.upTo('Fired'));
				if (val)
					console.log(...strings, val);
				else
					console.log(...strings);

				this.evprop = false;
			}
		console.groupEnd();
	}*/

	/**@return {HTMLMediaElement}*/
	get vidElm() {
		return this.$element[0];
	}

	/**@param {number} numOfNotes
	 @param {number} playbackRate*/
	async _getWaitValue(numOfNotes, playbackRate) {
		let waitValue;
		let logData = {};
		if (numOfNotes == null) {
			throw new TypeError("_getWaitValue got numOfNotes == null");
			if (this.lastOnset < this.vidElm.duration) {
				let diff = this.vidElm.duration - this.lastOnset;
				diff = min(1.5, diff);
				logData = { ...logData, diff };
				waitValue = 1000 * (this.lastOnset + diff - this.firstOnset);
			} else {
				waitValue = 1000 * (this.vidElm.duration - this.firstOnset);
			}


		} else {
			// const on_tdeltas = this.on_messages.time_deltas(numOfNotes);
			// const off_tdeltas = this.off_messages.time_deltas(numOfNotes);
			const relevant_pairs = this.on_off_pairs.slice(0, numOfNotes + 1);

			// waitValue = sum(on_tdeltas) * 1000;
			waitValue = (relevant_pairs.last()[0].time - relevant_pairs[0][0].time) * 1000;
			waitValue /= playbackRate;
			// this is equal to on_sliced = this.on_messages._msgs.slice(0,numOfNotes+1); on_sliced.last().time - on_sliced[0].time


			console.log(`👓 _getWaitValue`, {
				waitValue,
				'this.vidElm.currentTime': this.vidElm.currentTime,
				relevant_pairs
			});
		}
		return waitValue;
	}

	/**@param {number} numOfNotes
	 @param {number} playbackRate
	 @return {Promise<void>}*/
	async play(numOfNotes, playbackRate) {
		console.group(`👓 Video.play(numOfNotes =`, numOfNotes, 'playbackRate =', playbackRate, ')');
		if (playbackRate <= 0 || playbackRate > 3) {
			console.error(`Video.play() got playbackRate le 0 or gt 1: ${playbackRate}`);
			Alert.small.error(`Invalid playbackRate (${playbackRate})`, 'defaulting to 1');
			playbackRate = 1;
		}
		const { canplaythroughFired, loadeddataFired } = this;
		if (!canplaythroughFired || !loadeddataFired) {
			console.warn('\t!canplaythroughFired || !loadeddataFired, calling load()');
			EStore.increase('counters.pages.InsideTest.Video.play.no_playthrough_or_no_loadeddata');
			this.vidElm.load();
			await this._promiseReady();
		}
		this.vidElm.volume = 0;
		this.vidElm.playbackRate = playbackRate;
		const waitValue = await this._getWaitValue(numOfNotes, playbackRate);
		await this._fakeMousedown();
		console.log(`👓 concurrent play, promiseFadeIn, waitValue =`, waitValue);
		await asx.concurrent(this.vidElm.play(), this._promiseFadeIn(), asx.wait(waitValue));
		await this._promiseFadeOut();
		await this.vidElm.pause();


		console.groupEnd();
	}


}

class Animation {
	/**@param {jQuery} $animation*/
	constructor($animation) {
		/**@type {jQuery}*/
		this.$element = $animation;
		const svgs = [];
		for (const i of range(0, 51)) {
			if (i == 0) {
				svgs.push(Svg.blackRight);
				continue;
			} else if (i == 51) {
				svgs.push(Svg.base);
				continue;
			}
			const searchElement = i % 7;
			if ([2, 5].includes(searchElement))
				svgs.push(Svg.blackRight);
			else if ([1, 4, 8].includes(searchElement))
				svgs.push(Svg.blackLeft);
			else // [0, 3, 6, 7]
				svgs.push(Svg.blackBoth);
		}
		this.$element.append(svgs);

	}

	/**@param {number} note*/
	_note2svgIndex(note) {
		const scaleStart = int(note / 12) * 7 - 11;
		const indexInScale = note % 12;
		const index = scaleStart + [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][indexInScale];
		if (![0, 2, 4, 5, 7, 9, 11].includes(indexInScale))
			return [index, index + 1];
		return index;

	}

	/**
	 @param {number} note
	 @param {number} noteDuration
	 @param {string} fill
	 * */
	async markKey(note, noteDuration, fill) {
		return new Promise(async resolve => {
			const index = this._note2svgIndex(note);
			let $toMark, baseFill;
			const $children = this.$element.children();
			if (index.length != undefined) { // [3,4] for example
				const [indexLeft, indexRight] = index;
				const $keyLeft = $children.filter(`svg:nth-child(${indexRight})`).children(`.piano-black-left-rect`);
				const $keyRight = $children.filter(`svg:nth-child(${indexLeft})`).children(`.piano-black-right-rect`);
				$toMark = $keyLeft.add($keyRight);
				baseFill = 'black';
			} else { // 3
				$toMark = $children.filter(`svg:nth-child(${index})`).children(`.piano-white-rect`);
				baseFill = 'white';
			}
			$toMark.css({ fill });
			await asx.wait(noteDuration);
			$toMark.css({ fill: baseFill });
			resolve();


		});

	}


}

/**
 * Fades in [$big] $small [$secondary], fades out $big, $small, [$secondary]
 * @param {boolean} fadeSecondaryInOut
 * @param {boolean} fadeInBigMsg
 * @param {boolean} fadeInSmallMsg
 * @param {boolean} long
 * @return {Promise<void>}
 */
async function _$messagesInAndOut({ fadeSecondaryInOut = true, fadeInBigMsg = true, fadeInSmallMsg = true, long = false }) {
	console.log(...log('\t_$messagesInAndOut()'));
	if (fadeInBigMsg)
		await asx.$fadeIn($bigMessage, 700);
	if (fadeInSmallMsg)
		await asx.$fadeIn($smallMessage, 700);
	if (fadeSecondaryInOut) {
		await asx.wait(700);
		await asx.$fadeIn($smallMessageSecondary, 700);
	}
	await asx.wait(long ? 2000 : 1500);
	const $messages = [$smallMessage];
	if (fadeSecondaryInOut)
		$messages.push($smallMessageSecondary);
	$messages.push($bigMessage);

	await asx.$fadeOutMany(750, ...$messages);
	$bigMessage.removeClass('lightpink').removeClass('lightgreen');


}

/**
 * Called by showFailed and showPassed
 * Fades in $big, fades out $small, $bigButton, $Sidebar, $pageSubtitle
 * @return {Promise<void>}
 */
async function _show$bigMessageHideGreenPrompt() {
	console.log(...log('\t_show$bigMessageHideGreenPrompt()'));
	await asx.concurrent(
		asx.$fadeIn($bigMessage, 700),
		asx.$fadeOutMany(200, $bigButton, $smallMessage, $Sidebar, $pageSubtitle)
	);
	await asx.wait(700);
}

/**
 * Called by insidetest.js after awaiting playLevelIntro
 * Fades in $small, $bigButton, $Sidebar, $pageSubtitle
 * @param {Level} level
 * @return {Promise<void>}
 */
async function show$smallMessageAndGreenPrompt(level) {
	console.log(...log('\tshow$smallMessageAndGreenPrompt()'));
	document.getElementById('main').classList.remove('nocursor');
	let _smallmsg = `When you’re ready, please play <b>${level.notes}</b> notes.<br>`;
	if (level.rhythm) {
		_smallmsg += `Remember to keep rhythm`;
		if (level.tempo == 100)
			_smallmsg += " and regular speed";
		else
			_smallmsg += `, but don’t play any slower than ${level.tempo}% speed`;

	} else {
		_smallmsg += `Remember: just get the notes right. Don’t think about speed or rhythm`;
	}
	$smallMessage.html(_smallmsg);
	await asx.concurrent(
		asx.$fadeInMany(150, $bigButton, $smallMessage, $Sidebar, $pageSubtitle),
		asx.$fadeOut($skipButton, 150)
	);

}

/**@param {number} numOfNotes
 @param {number} playbackRate*/
async function _runVideo(numOfNotes, playbackRate = 1) {
	console.log(...log('\t_runVideo(numOfNotes,playbackRate)'));
	if (playbackRate > 3) {
		console.error(`_runVideo got playbackRate > 3: ${playbackRate}`);
		Alert.small.error(`Invalid playbackRate (${playbackRate})`, 'defaulting to 1');
		playbackRate = 1;
	}
	video.setCurrentTimeToFirstOnset();
	await asx.wait(500); // waits until starting frame is updated to new current time
	await asx.$fadeIn(video.$element, 700);
	await video.play(numOfNotes, playbackRate);
	await asx.wait(1500);
	await asx.$fadeOut(video.$element, 700);
}

/** @param {playMidiFileOptions} playOptions*/
async function _runAnimation(playOptions) {
	console.log(...log('\t_runAnimation(playOptions)'));
	if (bool(playOptions) && playOptions.playbackRate && playOptions.playbackRate > 3) {
		Alert.small.error(`Invalid playbackRate (${playOptions.playbackRate})`, 'defaulting to 1');
		console.error(`_runAnimation got playOptions.playbackRate > 3: ${playOptions.playbackRate}`);
		playOptions.playbackRate = 1;
	}
	await asx.$fadeIn(animation.$element, 700);
	const Gilad = require("pyano_local_modules/gilad");
	await Gilad.playMidiFile(playOptions);
	await asx.wait(1500);
	await asx.$fadeOut(animation.$element, 700);
}

/**@param {Piano} animationPiano
 @param {Truth} truth
 @param {number} maxNotesAmongLevels*/
async function playWholeTruth(animationPiano, truth, maxNotesAmongLevels) {
	console.log(...logmod('playWholeTruth(userMidi, animationPiano, truth)', { b: true }));
	const config = EStore.config();
	const shouldRunVideo = config.isDemoVideo();
	$bigMessage.text(`A tutorial`);
	$smallMessage.html(`Here’s ${shouldRunVideo ? "a video" : "an animation"} that shows everything you’ll be learning today`);


	await _$messagesInAndOut({ fadeSecondaryInOut: false });
	if (shouldRunVideo)
		await _runVideo(maxNotesAmongLevels);
	else
		await _runAnimation({
			animation,
			numOfNotes: maxNotesAmongLevels,
			truth,
			animationPiano
		});


}


/**@param {Piano} animationPiano
 @param {Levels} levels
 @param {Truth} truth
 @return {Promise<void>}*/
async function playLevelIntro({ animationPiano, levels, truth }) {
	console.log(...logmod('playLevelIntro(animationPiano, levels, truth)', { b: true }));


	const currentLevel = levels.current;
	console.log(...log(`\tcurrentLevel`), currentLevel);
	const config = EStore.config();
	let shouldAlsoRunVideo = config.isDemoVideo();
	if (currentLevel.rhythm) {
		const prevLevel = levels.get(levels.current.index - 1);
		if (prevLevel
		    && prevLevel.notes == currentLevel.notes
		    && prevLevel.rhythm == false) {
			shouldAlsoRunVideo = false;
		}
	}
	$bigMessage.text(`${currentLevel.index.human().title()} level, ${currentLevel.internalTrialIndex.human()} trial.`);
	$smallMessage.html(`You’ll now play <b>${currentLevel.notes}</b> notes.`);
	const playbackRate = levels.getNextTempoOfThisNotes() / 100;
	console.log(...log(`\tshouldAlsoRunVideo = ${shouldAlsoRunVideo}`, { sm: true }));
	let _smallsec = `Here’s ${shouldAlsoRunVideo ? "a video" : "an animation"} 
	                   showing only these <b>${currentLevel.notes}</b> notes 
	                   at <b>${playbackRate * 100}%</b> speed.<br>`;
	if (currentLevel.rhythm) {
		_smallsec += `<b>Try to keep rhythm`;
		if (currentLevel.tempo == 100)
			_smallsec += " and regular speed.</b>";
		else
			_smallsec += `. Don’t play any slower than the following demo.</b>`;

	} else {
		_smallsec += '<b>You can play as slow as you like.</b>';
	}
	$smallMessageSecondary.html(_smallsec);
	await asx.concurrent(
		_$messagesInAndOut({ fadeSecondaryInOut: true, long: true })
	);


	if (shouldAlsoRunVideo) {
		await _runVideo(currentLevel.notes, playbackRate);

		$smallMessage.html(`You’ll now watch the same <b>${currentLevel.notes}</b> notes played by an animation at <b>${playbackRate * 100}%</b> speed.<br>`);
		await _$messagesInAndOut({ fadeInBigMsg: false, fadeSecondaryInOut: false });
	}
	await _runAnimation({
		truth,
		animation,
		numOfNotes: currentLevel.notes,
		playbackRate,
		animationPiano
	});


}


/**@param {Piano} animationPiano
 @param {Levels} levels
 @param {DoneTrialResult} doneTrialResult
 @param {Truth} truth
 @return {Promise<void>}*/
async function showFailedTrialFeedback(animationPiano, levels, doneTrialResult, truth) {
	console.log(...logmod('showFailedTrialFeedback(animationPiano, levels, doneTrialResult, truth)', { b: true }));


	if (doneTrialResult.hasAccuracyMistakes()) // #0 : #3 (incl)
		$bigMessage.text("Hmm...").addClass('lightpink');
	else
		$bigMessage.text("Not perfect, but you got the notes right!"); // #4
	asx.$fadeIn($skipButton, 0);
	await _show$bigMessageHideGreenPrompt();
	if (skipFade) {
		asx.$fadeOutMany(0, $bigMessage, $skipButton);
		return;
	}

	const _hasMistakes = doneTrialResult.hasMistakes(); // TODO: when does it NOT have mistakes? maybe when bad tempo?
	const _msgsInOutOpts = { fadeInBigMsg: false, fadeSecondaryInOut: false, long: true };
	if (doneTrialResult.advance_trial) { // #1, #3 or #4
		let _smallmsg = `We’ll advance, but`;

		if (_hasMistakes) {
			_smallmsg += ` you had some ${doneTrialResult.mistakesDescription()} mistakes`;
			if (EStore.experiment_type == 'test') {
				$smallMessageSecondary.html("Here’s the animation again, showing any notes you got wrong");
				_msgsInOutOpts.fadeSecondaryInOut = true;
			}
		}

		if (doneTrialResult.isTempoBad()) {
			if (_hasMistakes)
				_smallmsg += `, and`;
			_smallmsg += ` you played too ${doneTrialResult.tempo_str}`;
		}
		$smallMessage.text(_smallmsg);

	} else { // dont advance. #0 or #2
		_msgsInOutOpts.fadeSecondaryInOut = true;

		let _secondary = "The animation will play, showing the notes you got wrong";
		if (doneTrialResult.isTempoBad())
			_secondary += `<br>Additionally, you played too ${doneTrialResult.tempo_str}`;

		$smallMessage.text(`You got some notes wrong. We’ll repeat this trial`);
		$smallMessageSecondary.html(_secondary);


	}

	await _$messagesInAndOut(_msgsInOutOpts);
	if (skipFade) {
		asx.$fadeOutMany(0, $smallMessage, $smallMessageSecondary, $skipButton);
		$bigMessage.removeClass('lightgreen').removeClass('lightpink');
		return;
	}

	if (!_hasMistakes || EStore.experiment_type == 'exam') {
		console.log(...log(`\tshowFailed: not running animation; either no mistakes or in exam`));
		return;
	}

	const playbackRate = min(levels.getNextTempoOfThisNotes() / 100, EStore.config().errors_playingspeed);
	if (doneTrialResult.hasAccuracyAndRhythmMistakes()) {// if has both rhythm and acc mistakes, show only acc mistakes (nullify rhythm mistakes)
		doneTrialResult.nullifyRhythmMistakes();
		console.log(...log(`\tnullified rhythm mistakes`));
	}
	const playOptions = {
		truth,
		animation,
		numOfNotes: levels.current.notes,
		mistakes: doneTrialResult.mistakes,
		animationPiano,
		playbackRate
	};

	console.log(...log(`\tshowFailedTrialFeedback, playbackRate: ${playOptions.playbackRate}`));

	await _runAnimation(playOptions);


}

/**@param {Piano} animationPiano
 @param {Levels} levels
 @param {DoneTrialResult} doneTrialResult
 @param {Truth} truth*/
async function showPassedTrialFeedback(animationPiano, levels, doneTrialResult, truth) {
	console.log(...logmod('showPassedTrialFeedback(animationPiano, levels, truth)', { b: true }));
	const currentLevel = levels.current;
	let _big;
	const isLastTrial = currentLevel.isLastTrial();
	if (isLastTrial)
		_big = `Way to go! You completed the ${currentLevel.index.human()} level`;
	else
		_big = `Good job! You passed the ${currentLevel.internalTrialIndex.human()} trial of the ${currentLevel.index.human()} level`;
	$bigMessage.text(_big).addClass('lightgreen');
	await _show$bigMessageHideGreenPrompt();
	if (!isLastTrial || !levels.isCurrentLastLevel()) {
		let _small = `Let’s move on to the `;
		if (isLastTrial)
			_small += `${(currentLevel.index + 1).human()} level`;
		else
			_small += `${(currentLevel.internalTrialIndex + 1).human()} trial`;
		$smallMessage.html(_small);
		await _$messagesInAndOut({ fadeSecondaryInOut: false, fadeInBigMsg: false });
	}
	/*$smallMessage.html(`Let's show you those same <b>${currentLevel.notes}</b> notes you just got correctly.`);
	$smallMessageSecondary.html(`This will make you even better.`);

	await _$messagesInAndOut({ fadeInBigMsg: false });

	await _runAnimation({
		truth,
		animation,
		numOfNotes: currentLevel.notes,
		animationPiano,
		playbackRate: levels.getNextTempoOfThisNotes() / 100
	});
	*/

}

async function showTestCompleteMessages() {
	console.log(...logmod('showTestCompleteMessages()'));
	document.getElementById('main').classList.remove('nocursor');
	$bigMessage.text(`Thank you ${EStore.config().current_subject.title()}!`);

	$smallMessage.text(`${EStore.experiment_type.title()} is over`);
	await asx.concurrent(
		asx.$fadeOut($skipButton, 150),
		asx.$fadeInMany(700, $bigMessage, $smallMessage, $Sidebar)
	);


}


/**@param {Levels} levels
 @param {Truth} truth*/
function updateLevelTrialSubtitles(levels, truth) {
	// const [levelIndex, trialIndex] = EStore.currentTrialCoords();
	const currentLevel = levels.current;
	$('#page_subtitle > div:nth-child(1) > strong')
		.text(truth.name);
	$('#page_subtitle > div:nth-child(2) > strong')
		.text(`${currentLevel.index + 1}/${levels.length}`);
	$('#page_subtitle > div:nth-child(3) > strong')
		.text(`${currentLevel.internalTrialIndex + 1}/${currentLevel.trials}`);

}

const $pageSubtitle = $('<div id="page_subtitle">')
	.append(
		`<div>Truth: ${strong(EStore.truth().name)}</div>`,
		`<div>Level: ${strong('1/1')}</div>`,
		`<div>Trial: ${strong('1/1')}</div>`,
	).hide();
const $bigMessage = $('<div id="big_message">').hide();
const $smallMessage = $('<div id="small_message" class="subtitle" >').hide();
const $smallMessageSecondary = $('<div id="small_message_secondary" class="subtitle">')
	.hide();
const $bigButton = $('<button id="big_button">')
	.addClass("active-btn")
	.append(span("I’m done playing"))
	.hide();
const $skipButton = $(`<button id="skip_button">SKIP</button>`)
	.click(() => {
		if (skipFade)
			return console.warn('$skipButton click but skipFade was already true');
		console.log('click, setting skipFade = true.');
		skipFade = true;
	});
const animation = new Animation($('<div id="animation">').hide());

const video = new Video($(`<video width="1750" preload="auto" id="video">`).hide());


module.exports = {
	$bigButton,
	$bigMessage,
	$pageSubtitle,
	$skipButton,
	$smallMessage,
	$smallMessageSecondary,
	animation,
	playLevelIntro,
	playWholeTruth,
	show$smallMessageAndGreenPrompt,
	showFailedTrialFeedback,
	showPassedTrialFeedback,
	showTestCompleteMessages,
	updateLevelTrialSubtitles,
	video
};
