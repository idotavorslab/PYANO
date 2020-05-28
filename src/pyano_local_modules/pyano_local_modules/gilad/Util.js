// ok
const Tone = require("tone");

// let Frequency = Tone.Frequency;
// let BufferSource = Tone.BufferSource;

function noteToMidi(note) {
    return Tone.Frequency(note).toMidi();
}

function midiToNote(midi) {
    return Tone.Frequency(midi, 'midi').toNote();
}

function midiToFrequencyRatio(midi) {
    let mod = midi % 3;
    if (mod === 1) {
        return [midi - 1, Tone.intervalToFrequencyRatio(1)];
    } else if (mod === 2) {
        return [midi + 1, Tone.intervalToFrequencyRatio(-1)];
    } else {
        return [midi, 1];
    }
}

function createSource(buffer) {
    return new Tone.ToneBufferSource(buffer);
}

function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}

module.exports = {midiToNote, noteToMidi, createSource, midiToFrequencyRatio, randomBetween};
