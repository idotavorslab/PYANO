/**
 * @typedef TCurrentTest
 * @prop {string} truth_file_path
 * @prop {number} finished_trials_count
 * @prop {TLevel[]} levels
 * @prop {string} learning_type
 * @prop {string} demo_type
 * @prop {string} current_subject
 * @prop {number} errors_playingspeed
 * @prop {number} allowed_tempo_deviation_factor
 */

/**
 * @typedef TLevel
 * @prop {number} notes
 * @prop {number} trials
 */


/**
 * @typedef TMessage
 * @prop {number} note
 * @prop {number} time
 * @prop {number} time_delta
 * @prop {number} velocity
 * @prop {number} preceding_message_time
 * @prop {string} kind
 */


/**
 @typedef playMidiFileOptions
 @prop {Truth} truth
 @prop {Piano} playbackPiano
 @prop {Animation?} animation
 @prop {number?} numOfNotes
 @prop {number?} speed
 @prop {Array<string|null>?} mistakes
 */

/**
 @typedef playPreTrialDemoOptions
 @prop {Midi} midi
 @prop {Piano} playbackPiano
 @prop {Truth} truth
 @prop {number} levelIndex
 @prop {number} trialIndex
 @prop {number} numOfNotes*/


/**
 @typedef showFailedTrialFeedbackOptions
 @prop {Midi} midi
 @prop {Piano} playbackPiano
 @prop {number} trialIndex
 @prop {string[]} mistakes
 @prop {Truth} truth*/
