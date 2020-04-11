const Tone = require("tone");


const Harmonics = require('./Harmonics'); // ok
const Keybed = require('./Keybed');
const Pedal = require('./Pedal'); 
const PianoStrings = require('./Strings');

class Piano extends Tone.ToneAudioNode {

    constructor() {
        super(Tone.optionsFromArguments(Piano.getDefaults(), arguments));

        const options = Tone.optionsFromArguments(Piano.getDefaults(), arguments);

        this._heldNotes = new Map();

        this._sustainedNotes = new Map();

        this._strings = new PianoStrings(Object.assign({}, options, {
            enabled: true,
            volume: options.volume.strings,
        })).connect(this.output);
        this.strings = this._strings.volume;

        this._pedal = new Pedal(Object.assign({}, options, {
            enabled: options.pedal,
            volume: options.volume.pedal,
        })).connect(this.output);
        this.pedal = this._pedal.volume;

        this._keybed = new Keybed(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.keybed,
        })).connect(this.output);
        this.keybed = this._keybed.volume;

        this._harmonics = new Harmonics(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.harmonics,
        })).connect(this.output);
        this.harmonics = this._harmonics.volume
    }

    static getDefaults() {
        const {EStore} = require("pyano_local_modules/ext_libs");
        return Object.assign(Tone.ToneAudioNode.getDefaults(), {
            maxNote: 108,
            minNote: 21,
            pedal: false,
            release: false,
            samples: `file:///${EStore.salamanderDirPath()}`,
            velocities: 1,
            volume: {
                harmonics: 0,
                keybed: 0,
                pedal: 0,
                strings: 0,
            },
        })
    }

    /**
     *  Load all the samples
     *  @return  {Promise}
     */
    async load() {
        await Promise.all([
            this._pedal.load(),
            this._keybed.load(),
            this._harmonics.load(),
        ]);
        this._loaded = true
    }

    /**
     * If all the samples are loaded or not
     @readOnly
     @type {boolean}
     */
    get loaded() {
        return this._loaded;
    }

    /**
     *  Put the pedal down at the given time. Causes subsequent
     *  notes and currently held notes to sustain.

     *  @returns {Piano} this
     */
    pedalDown(time = Tone.now()) {
        if (this.loaded) {
            if (this.toSeconds(time) != time) {
                throw Error(`pedalDown this.toSeconds(time)!=time. this.toSeconds(time): ${this.toSeconds(time)}, time: ${time}`);
            }
            if (!this._pedal.isDown(time)) {
                this._pedal.down(time);
            }
        }
        return this;
    }

    /**
     *  Put the pedal up. Dampens sustained notes

     *  @returns {Piano} this
     */
    pedalUp(time = Tone.now()) {
        if (this.loaded) {
            if (this.toSeconds(time) != time) {
                throw Error(`pedalUp this.toSeconds(time)!=time. this.toSeconds(time): ${this.toSeconds(time)}, time: ${time}`);
            }
            if (this._pedal.isDown(time)) {
                this._pedal.up(time);
                // dampen each of the notes
                this._sustainedNotes.forEach((t, note) => {
                    if (!this._heldNotes.has(note)) {
                        this._notes.stop(note, time);
                    }
                });
                this._sustainedNotes.clear();
            }
        }
        return this;
    }

    /**
     *  Play a note.
     *  @param  {string|number}  note      The note to play. If it is a number, it is assumed
     *                                     to be MIDI
     *  @param  {NormalRange}  velocity  The velocity to play the note
     *  @return  {Piano}  this
     */
    keyDown(note, time = Tone.now(), velocity = 0.8) {
        if (!this.loaded) {
            console.error('🎹 Piano.keyDown() not this.loaded');
            return this;
        }
        if (this.toSeconds(time) != time) {
            throw Error(`keyDown this.toSeconds(time)!=time. this.toSeconds(time): ${this.toSeconds(time)}, time: ${time}`);
        }

        if (Tone.isString(note)) {
            note = Math.round(Tone.Frequency(note).toMidi());
        }

        if (!this._heldNotes.has(note)) {
            //record the start time and velocity
            this._heldNotes.set(note, {time, velocity});
            this._notes.start(note, time, velocity);
        }

        // console.log(`[${this.name}] keyDown`, { note, time, velocity });
        return this;
    }

    /**
     *  Release a held note.
     *  @param  {string|number}  note      The note to stop
     *  @param {number} time
     *  @param {number} velocity
     *  @return  {Piano}  this
     */
    keyUp(note, time = Tone.now(), velocity = 0.8) {
        if (!this.loaded) {
            console.log('🎹 Piano.keyUp() not this.loaded');
            return this;
        }
        if (this.toSeconds(time) != time) {
            throw Error(`keyUp this.toSeconds(time)!=time. this.toSeconds(time): ${this.toSeconds(time)}, time: ${time}`);
        }
        if (Tone.isString(note)) {
            note = Math.round(Tone.Frequency(note).toMidi());
        }


        if (this._heldNotes.has(note)) {

            const prevNote = this._heldNotes.get(note);
            this._heldNotes.delete(note);

            if (this._release) {
                this._release.start(note, time, velocity);
                // this._release.start(note, time, 0);
            }

            //compute the release velocity
            const holdTime = time - prevNote.time;
            const prevVel = prevNote.velocity;
            let dampenGain = (0.5 / Math.max(holdTime, 0.1)) + prevVel + velocity;
            dampenGain = Math.pow(Math.log(Math.max(dampenGain, 1)), 2) / 2;

            if (this._pedal.isDown(time)) {

                if (!this._sustainedNotes.has(note)) {
                    this._sustainedNotes.set(note, time);
                }
            } else {
                this._notes.stop(note, time, velocity);

                if (this._harmonics) {
                    this._harmonics.start(note, time, dampenGain);
                    // this._harmonics.start(note, time, 0);
                }
            }
        }
        // console.log(`[${this.name}] keyUp`, { note, time, velocity });
        return this;

    }

    /**
     Set the volumes of each of the components
     @param {string} param
     @param {Decibels|number} vol
     @return {Piano} this
     @example
     //either as an String
     piano.setVolume('release', -10)
     */
    setVolume(param, vol) {
        switch (param) {
            case 'note':
                this._notes.volume = vol;
                break;
            case 'pedal':
                this._pedal.volume = vol;
                break;
            case 'release':
                if (this._release) {
                    this._release.volume = vol;
                }
                break;
            case 'harmonics':
                if (this._harmonics) {
                    this._harmonics.volume = vol;
                }
                break;
        }
        return this;
    }


    stopAll() {
        this.pedalUp();
        this._heldNotes.forEach((value, note) => {
            this.keyUp(note);
        });
        return this;
    }

    /**
     Callback to invoke with normalized progress
     @param  {Function} cb
     */
    progress(cb) {
        Tone.Buffer.on('progress', cb);
        return this;
    }
}

/**
 * @type {Piano}
 */
module.exports = Piano;
