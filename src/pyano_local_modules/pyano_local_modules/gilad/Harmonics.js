const Tone = require("tone");
const Component = require('./Component'); // ok

const Salamander = require('./Salamander'); // ok

const Util = require('./Util'); // ok


class Harmonics extends Component.PianoComponent {

    constructor(options) {
        super(options);

        this._urls = {};
        const notes = Salamander.getHarmonicsInRange(options.minNote, options.maxNote);
        for (const n of notes) {
            this._urls[n] = Salamander.getHarmonicsUrl(n)
        }
    }


    _internalLoad() {
        return new Promise(onload => {
            this._sampler = new Tone.Sampler({
                baseUrl: this.samples,
                onload,
                urls: this._urls,
            }).connect(this.output)
        })
    }

    triggerAttack(note, time, velocity) {
        if (this._enabled && Salamander.inHarmonicsRange(note)) {
            this._sampler.triggerAttack(Tone.Midi(note).toNote(), time, velocity * Util.randomBetween(0.5, 1))
        }
    }
}

module.exports = Harmonics;
