const Tone = require("tone");


class PianoBase extends Tone.ToneAudioNode {
    constructor(vol = 0) {
        super();
        this.createInsOuts(0, 1);

        this.volume = vol;
    }

    get volume() {
        return Tone.gainToDb(this.output.gain.value);
    }

    set volume(vol) {
        this.output.gain.value = Tone.dbToGain(vol);
    }
}

module.exports = PianoBase;