// let createSource = Util.createSource;
// let randomBetween = Util.randomBetween;
let Tone = require("tone");

let Util = require("./Util");
let PianoBase = require("./PianoBase");
let Salamander = require("./Salamander");

// let Buffers = Tone.Buffers;

class Release extends PianoBase {

	constructor(range) {
		super();

		this._buffers = {};
		for (let i = range[0]; i <= range[1]; i++) {
			this._buffers[i] = Salamander.getReleasesUrl(i);
		}
	}

	load(baseUrl) {
		return new Promise((success) => {
			this._buffers = new Tone.Buffers(this._buffers, success, baseUrl);
		});
	}

	start(note, time, velocity) {
		if (this._buffers.has(note)) {
			let source = Util.createSource(this._buffers.get(note)).connect(this.output);
			//randomize the velocity slightly
			velocity *= Util.randomBetween(0.5, 1);
			source.start(time, 0, undefined, 0.015 * velocity, 0);
		}
	}
}

module.exports = Release;
