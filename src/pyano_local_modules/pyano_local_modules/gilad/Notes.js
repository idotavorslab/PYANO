let Tone = require("tone");

// let Buffers = Tone.Buffers;
// noinspection JSUnusedLocalSymbols
// let MultiSampler = Tone.MultiSampler;
let Salamander = require("./Salamander");

let PianoBase = require("./PianoBase");

let Util = require("./Util");
// let noteToMidi = Util.noteToMidi;
// let createSource = Util.createSource;
// noinspection JSUnusedLocalSymbols
// let midiToNote = Util.midiToNote;
// let midiToFrequencyRatio = Util.midiToFrequencyRatio;

/**
 * Maps velocity depths to Salamander velocities
 */
const velocitiesMap = {
	1: [8],
	2: [6, 12],
	3: [1, 8, 15],
	4: [1, 5, 10, 15],
	5: [1, 4, 8, 12, 16],
	6: [1, 3, 7, 10, 13, 16],
	7: [1, 3, 6, 9, 11, 13, 16],
	8: [1, 3, 5, 7, 9, 11, 13, 15],
	9: [1, 3, 5, 7, 9, 11, 13, 15, 16],
	10: [1, 2, 3, 5, 7, 9, 11, 13, 15, 16],
	11: [1, 2, 3, 5, 7, 9, 11, 13, 14, 15, 16],
	12: [1, 2, 3, 4, 5, 7, 9, 11, 13, 14, 15, 16],
	13: [1, 2, 3, 4, 5, 7, 9, 11, 12, 13, 14, 15, 16],
	14: [1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 15, 16],
	15: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16],
	16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
};

const notes = [21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108];

/**
 *  Manages all of the hammered string sounds
 */
class Notes extends PianoBase {
	/**@param {number[]} range - Within [21,108]
	 * @param {number} velocities - Between 1 and 16 (incl). Dictates the number of samplers. */
	constructor(range, velocities) {
		super();
		console.log('🎹 new Notes(...)', { range, velocities });
		const lowerIndex = notes.findIndex(note => note >= range[0]);
		let upperIndex = notes.findIndex(note => note >= range[1]);
		upperIndex = upperIndex === -1 ? notes.length : upperIndex + 1;
		const slicedNotes = notes.slice(lowerIndex, upperIndex);
		this._samplers = velocitiesMap[velocities].slice();

		this._activeNotes = new Map();

		this._samplers.forEach((vel, i) => {
			this._samplers[i] = {};
			slicedNotes.forEach(note => {
				this._samplers[i][note] = Salamander.getNotesUrl(note, vel);
			});
		});
	}

	_hasNote(note, velocity) {
		return this._samplers.hasOwnProperty(velocity) && this._samplers[velocity].has(note);
	}

	_getNote(note, velocity) {
		return this._samplers[velocity].get(note);
	}

	_disposeSource(src) {
		src.dispose();
		src = null;
	}

	stop(note, time, velocity) {
		//stop all of the currently playing note
		if (this._activeNotes.has(note)) {
			for (const source of this._activeNotes.get(note)) {
				// const release = 1;
				source.onended = this._disposeSource;
				// source.fadeOut = 0.1;
				// source.stop(time + release, release);
				source.stop();
			}
			this._activeNotes.delete(note);
		}
	}

	start(note, time, velocity) {
		const velPos = velocity * (this._samplers.length - 1);
		const roundedVel = Math.round(velPos);
		const diff = roundedVel - velPos;
		let gain = 1 - diff * 0.5;

		if (this._samplers.length === 1) {
			gain = velocity;
		}

		let [midi, ratio] = Util.midiToFrequencyRatio(note);

		if (this._hasNote(midi, roundedVel)) {
			const source = Util.createSource(this._getNote(midi, roundedVel));

			source.playbackRate.value = ratio;
			source.connect(this.output);
			source.curve = 'exponential';
			source.fadeOut = 0.05;
			source.start(time, 0, undefined, gain);

			if (!this._activeNotes.has(note)) {
				this._activeNotes.set(note, []);
			}
			this._activeNotes.get(note).push(source);
		}
	}

	/**
	 *
	 * @param baseUrl
	 * @return {Promise<any[]>}
	 */
	load(baseUrl) {
		const promises = [];
		this._samplers.forEach((obj, i) => {
			let prom = new Promise(success => {
				this._samplers[i] = new Tone.Buffers(obj, success, baseUrl);
			});
			promises.push(prom);
		});
		return Promise.all(promises);
	}
}

module.exports = Notes;
