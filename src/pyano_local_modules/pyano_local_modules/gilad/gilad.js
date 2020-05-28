const Tone = require("tone");
const $ = require("jquery");
let {
    EStore
} = require("pyano_local_modules/ext_libs");
let Piano = require("./Piano");
let events = require("events");
const WebMidi = require("webmidi");

const MidiConvert = require("midiconvert");


let {Midi: TonejsMidi} = require("@tonejs/midi");

const fs = require('fs');
Tone.context.latencyHint = 'playback';


/**@param {Truth} truth
 * @return {Promise<Truth>}*/
async function toTxtFromMidi(truth) {


    let midiRead = await MidiConvert.load(truth.midi.path);

    let readTrack = midiRead.tracks.find(t => t.instrumentNumber == 0 &&
        !t.notes.isEmpty());


    let txtWriteStreamOn = await fs.createWriteStream(truth.txt.on.path, {
        flags: 'w',
        encoding: 'utf8',
    });
    let ts = new Date() / 1000;
    const noteOns = readTrack.notes;
    for (let noteOn of noteOns) {
        const on = `${round(ts + noteOn.time, 5)}\tnote=${noteOn.midi}\tvelocity=${round(noteOn.velocity * 127)}\ton\n`;
        txtWriteStreamOn.write(on);
    }

    txtWriteStreamOn.end();

    let txtWriteStreamOff = await fs.createWriteStream(truth.txt.off.path, {
        flags: 'w',
        encoding: 'utf8',
    });
    let noteOffs = readTrack.noteOffs;
    noteOffs = noteOffs.sort((a, b) => a.time - b.time);
    for (let noteOff of noteOffs) {
        const off = `${round(ts + noteOff.time, 5)}\tnote=${noteOff.midi}\tvelocity=999\toff\n`;
        txtWriteStreamOff.write(off);
    }
    txtWriteStreamOff.end();

    return truth;

}

/**
 @param {TOnOffPairs} on_off_pairs
 @param {Truth} truth
 */
async function toMidiFromMessages(on_off_pairs, truth) {


    if (await truth.midi.exists()) {
        return Promise.reject(`midi file exists: ${truth.midi}`);
    }
    if (!(await truth.txt.allExist())) {
        return Promise.reject(`not all txt file exist: ${truth.txt.base}`);
    }
    let midiWrite = new TonejsMidi();
    midiWrite.addTrack();


    const firstMsgTime = on_off_pairs[0][0].time - 0.01;


    for (let [on_msg, off_msg] of on_off_pairs) {


        const onProps = {
            midi: on_msg.note,
            time: on_msg.time - firstMsgTime,
            velocity: on_msg.velocity / 127,
            noteOffVelocity: 1,
            duration: off_msg.time - on_msg.time,
        };

        midiWrite.tracks[0].addNote(onProps);
    }


    await fs.writeFile(truth.midi.path, new Buffer(midiWrite.toArray()), err => {
        if (err) {
            throw err;
        }
    });
}

/**@param {playMidiFileOptions} options
 @return {Promise<Piano>}*/
async function playMidiFile(options) {
    let {
        truth,
        animation,
        numOfNotes,
        playbackRate,
        mistakes,
        animationPiano
    } = options;
    console.log(`🎹 playMidiFile(), using animationPiano: [${animationPiano.name}]`, options);

    if (!animationPiano) {
        return Promise.reject(`playMidiFile() didn't receive param animationPiano`);
    }
    if (!truth) {
        return Promise.reject(`playMidiFile() didn't receive param truth`);
    }
    if (!animationPiano._loaded) {
        console.log(`\tplayMidiFile() passed animationPiano was NOT loaded (shouldn't happen)`);
        await animationPiano.load();
        Alert.small.success('Piano loaded');

        console.log(`\tplayMidiFile() done loading passed (unloaded) animationPiano (shouldn't happen)`);
    }
    if (!(await truth.midi.exists())) {
        return Promise.reject(`playMidiFile() midi path doesn't exist: "${truth.midi.path}"`);
    }
    let midiRead = await MidiConvert.load(truth.midi.path);

    return new Promise(async resolve => {


        Tone.Transport.bpm.value = midiRead.bpm;
        Tone.Transport.timeSignature = midiRead.timeSignature;
        Tone.Transport.start();

        let readTrack = midiRead.tracks.find(t => t.instrumentNumber == 0 && !t.notes.isEmpty());


        const scheduleNoteOn = (onTime, onEvent) => {
            Tone.Draw.schedule(() => {
                if (!animation) {
                    return;
                }
                let fill = 'green';
                if (mistakes) {
                    const index = noteOns.indexOf(onEvent);
                    if (bool(mistakes[index])) {
                        fill = mistakes[index] == 'accuracy' ? 'red' : '#2252C1';
                    }
                }
                let noteDuration = duration * 1000;
                animation.markKey(note, noteDuration, fill);
            }, onTime);
            let {
                midi: note,
                time,
                velocity,
                duration
            } = onEvent;
            animationPiano.keyDown(note, time, velocity);


        };

        const scheduleNoteOff = (offTime, offEvent) => {

            let index = noteOffs.indexOf(offEvent);
            const {
                time,
                velocity,
                midi: note
            } = offEvent;
            animationPiano.keyUp(note, time, velocity);
            if (skipFade) {
                console.log('piano skipFade, returning');
                Tone.Transport.stop();
                offPart.dispose();
                onPart.dispose();
                animationPiano.stopAll();
                return resolve(animationPiano);
            }
            if (index == noteOffs.length - 1) {
                Tone.Transport.stop();
                offPart.dispose();
                onPart.dispose();
                animationPiano.stopAll();
                return resolve(animationPiano);

            }
        };

        // let sustain = new Tone.Part(schedulePedal, track.controlChanges[64]).start(0);

        let [noteOns, noteOffs] = _sliceNotes(readTrack, numOfNotes, playbackRate);

        // noinspection JSCheckFunctionSignatures
        let offPart = new Tone.Part(scheduleNoteOff, noteOffs).start(0);
        // noinspection JSCheckFunctionSignatures
        let onPart = new Tone.Part(scheduleNoteOn, noteOns).start(0);


    });

}

function _sliceNotes(readTrack, numOfNotes, playbackRate) {

    let noteOffs = readTrack.noteOffs;
    let noteOns = readTrack.notes;
    if (!numOfNotes && !playbackRate) {
        return [noteOns, noteOffs];
    }


    noteOffs = numOfNotes ?
        noteOffs.slice(0, numOfNotes) :
        noteOffs;
    noteOns = numOfNotes ?
        noteOns.slice(0, numOfNotes) :
        noteOns;

    console.log(...small('\t🎹 _sliceNotes()'), {
        noteOns,
        noteOffs
    });
    if (playbackRate) {
        for (let [i, note] of enumerate(noteOns)) {
            noteOns[i].duration = note.duration / playbackRate;
            noteOns[i].time = note.time / playbackRate;
        }
        for (let [i, note] of enumerate(noteOffs)) {
            noteOffs[i].duration = note.duration / playbackRate;
            noteOffs[i].time = note.time / playbackRate;
        }

    }
    return [noteOns, noteOffs];
}


class Midi extends events.EventEmitter {
    /**@param {string} name
     @param {boolean?} muteUserPiano*/
    constructor({name, muteUserPiano = true}) {
        super();
        this.name = name;
        this._shouldWrite = false;
        /**@type {WriteStream}*/
        this._onTxtWriteStream = undefined;
        /**@type {WriteStream}*/
        this._offTxtWriteStream = undefined;

        this._isInputConnected = false;
        this._isOutputConnected = false;

        /**@type {Piano}*/
        this._userPiano = new Piano(`file:///${EStore.salamanderDirPath()}`, name).toDestination();
        this._userPiano.load()
            .then(() => {
                // TODO: mute is ALWAYS true. record page, insidetest.
                let volume = muteUserPiano ? -Infinity : 0;
                console.log(`🎹 [${this.name}]`, {
                    volume,
                    name,
                    muteUserPiano
                });
                this._userPiano.setVolume('note', volume);
                this._enableWebMidi();
            });


        this.on('keyDown', (note, velocity) => {
            console.warn(`🎹 [${this.name}] this on keyDown`);
            this._playNoteAndMaybeWriteTxt(note, velocity);
        });

        this.on('keyUp', (note, velocity) => {
            console.warn(`🎹 [${this.name}] this on keyUp`);
            this._releaseNoteAndMaybeWriteTxt(note, velocity);
        });

        this.on('pedalDown', () => {
            this._userPiano.pedalDown();
        });

        this.on('pedalUp', () => {
            this._userPiano.pedalUp();
        });

    }

    isInOutConnected() {
        return this._isInputConnected && this._isOutputConnected;
    }

    /**@param {TOnOffPairs} on_off_pairs
     @param {Truth} truth*/
    async endOnOffTxtStreamsAndWriteMidi(on_off_pairs, truth) {
        console.log(`🎹 [${this.name}] %cendOnOffTxtStreamsAndWriteMidi(${truth.name})`, 'font-weight:900');
        // check private members and throw
        (() => {
            if (!this._shouldWrite) {
                console.error("endOnOffTxtStreamsAndWriteMidi() this._shouldWrite was NOT true");
            }

            if (this._onTxtWriteStream == undefined) {
                console.error("endOnOffTxtStreamsAndWriteMidi() this._onTxtWriteStream WAS undefined (should not have been)");
            }

            if (this._offTxtWriteStream == undefined) {
                console.error("endOnOffTxtStreamsAndWriteMidi() this._offTxtWriteStream WAS undefined (should not have been)");
            }

            if (!WebMidi.enabled) {
                console.error(`endOnOffTxtStreamsAndWriteMidi(), WebMidi.enabled == false`);
            }

        })();

        this._shouldWrite = false;
        this._onTxtWriteStream.end();
        this._onTxtWriteStream = undefined;
        this._offTxtWriteStream.end();
        this._offTxtWriteStream = undefined;
        await toMidiFromMessages(on_off_pairs, truth);

    }

    /**
     @param {Truth} truth
     @return {Promise<Truth>}
     */
    async newOnOffTxtWriteStreams(truth) {
        console.log(`🎹 [${this.name}] %cnewOnOffTxtWriteStreams(${truth.name})`, 'font-weight:900');

        // check and maybe error
        (() => {
            if (this._shouldWrite) {
                console.error("newOnOffTxtWriteStreams() was called but this._shouldWrite was already true");
            }
            if (this._onTxtWriteStream != undefined) {
                console.error("newOnOffTxtWriteStreams() was called but this._onTxtWriteStream was NOT undefined (should have been)");
            }
            if (this._offTxtWriteStream != undefined) {
                console.error("newOnOffTxtWriteStreams() was called but this._offTxtWriteStream was NOT undefined (should have been)");
            }

            if (!WebMidi.enabled) {
                console.error(`newOnOffTxtWriteStreams(), WebMidi.enabled == false`);
            }

        })();
        if (await truth.txt.anyExist()) {
            return Promise.reject(`some txt files exist of truth: "${truth.txt.base.name}"`);
        }

        this._shouldWrite = true;
        console.log(...small(`\t🎹 [${this.name}] this._userPiano is ${this._userPiano._loaded
            ? 'loaded (good)'
            : 'NOT loaded (not good, launching blockingMixin)'}`));
        if (!this._userPiano._loaded) {
            console.log("\nbig blocking piano loading mixin");
            await Alert.big.blocking({
                title: 'Loading piano',
                text: 'Please wait a few seconds...',
                onOpen: async modal => {
                    this._userPiano.progress(prog => console.log(`\t🎹 prog: ${prog}`));
                    await this._userPiano.load();
                    const $modal = $(modal);
                    $modal.find('#swal2-title').text('Load complete');
                    $modal.find('#swal2-content').text('Start playing!');
                    await asx.$fadeOut($modal.find('.swal2-loading'), 300);
                    await asx.wait(300);
                    modal.classList.add('fadeOutUp', 'faster');
                    await asx.wait(500);
                    Alert.close();
                },


            });

            console.log(`\t🎹 done loading _userPiano`);
        }

        this._onTxtWriteStream = await fs.createWriteStream(truth.txt.on.path, {
            flags: 'w',
            encoding: 'utf8',
        });
        this._offTxtWriteStream = await fs.createWriteStream(truth.txt.off.path, {
            flags: 'w',
            encoding: 'utf8',
        });

        return truth;

    }

    _playNoteAndMaybeWriteTxt(note, velocity) {


        if (!this._shouldWrite || !this._userPiano._loaded) {
            let error = '_playNoteAndMaybeWriteTxt()';

            if (!this._shouldWrite) {
                error += ', !this._shouldWrite';
            }
            if (!this._userPiano._loaded) {
                error += ', !this._userPiano._loaded';


            }
            console.warn(`\t🎹 ${error}. returning`);
            return;
        }
        if (this._shouldWrite) {
            let ts = new Date() / 1000;
            this._onTxtWriteStream.write(`${round(ts, 5)}\tnote=${note}\tvelocity=${round(velocity * 127)}\ton\n`);

        }
        let time = Tone.now();
        this._userPiano.keyDown(note, time, velocity);
    }

    _releaseNoteAndMaybeWriteTxt(note, velocity) {
        if (!this._shouldWrite || !this._userPiano._loaded) {
            let error = '_releaseNoteAndMaybeWriteTxt()';

            if (!this._shouldWrite) {
                error += ', !this._shouldWrite';
            }
            if (!this._userPiano._loaded) {
                error += ', !this._userPiano._loaded';


            }
            console.warn(`\t🎹 ${error}. returning`);
            return;
        }
        if (this._shouldWrite) {
            let ts = new Date() / 1000;
            this._offTxtWriteStream.write(`${round(ts, 5)}\tnote=${note}\tvelocity=999\toff\n`);

        }
        let time = Tone.now();
        this._userPiano.keyUp(note, time, velocity);
    }


    _enableWebMidi() {
        const _bindInput = inputDevice => {
            if (WebMidi.enabled) {
                WebMidi.addListener('disconnected', device => {
                    Alert.big.warning({
                        title: 'Keyboard disconnected! Please turn it on again',
                        text: 'Refresh after this popup disappears.'
                    });
                    console.error("🎹 DEVICE DISCONNECTED", device);
                    if (device.input) {
                        device.input.removeListener('noteOn');
                        device.input.removeListener('noteOff');
                        WebMidi.disable();
                    }
                });
                inputDevice.addListener('noteon', 'all', event => {
                    this._playNoteAndMaybeWriteTxt(event.note.number, event.velocity);
                });
                inputDevice.addListener('noteoff', 'all', event => {
                    this._releaseNoteAndMaybeWriteTxt(event.note.number, event.velocity);
                });

                inputDevice.addListener('controlchange', "all", event => {
                    if (event.controller.name === 'holdpedal') {
                        this.emit(event.value ?
                            'pedalDown' :
                            'pedalUp');
                    }
                });
            } else {
                console.error('🎹 _bindInput(inputDevice), WebMidi.enabled == false', {
                    inputDevice
                });
            }
        };
        if (WebMidi.enabled) {
            console.error('🎹 _enableWebMidi() called from constructor, but was already Webmidi.enabled!');
        } else {
            WebMidi.enable(err => {
                if (!err) {
                    if (WebMidi.inputs) {
                        for (const inputDevice of WebMidi.inputs) {
                            _bindInput(inputDevice);
                        }
                    }

                    WebMidi.addListener('connected', device => {
                        const deviceType = device.port.type;
                        console.log(`%c🎹 WebMidi connected ${deviceType}`, 'font-size: 10px');
                        if (deviceType == 'input') {
                            this._isInputConnected = true;
                        } else {
                            if (deviceType == 'output') {
                                this._isOutputConnected = true;
                            }
                        }
                        if (device.input) {
                            _bindInput(device.input);
                        }


                    });
                } else {
                    console.error('🎹 Webmidi.enable() err!', err);
                }

            });
        }
    }


}


module.exports = {
    Midi,
    toMidiFromMessages,
    toTxtFromMidi,
    playMidiFile
};
