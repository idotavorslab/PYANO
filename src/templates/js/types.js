/** @callback StoreIncrease
 @param {String} K*/

/** @callback StoreUpdate
 @param {String} K
 @param {Object} kv */

/** @callback StoreSet
 @param {String} key
 @param {*} value */

/** @callback StoreGet
 @param {String} key
 @param {*?} defaultValue */

// [*TStore]
/**
 @typedef {
 * {
 *    store: {
 *       current_subject: String,
 *       current_test: TCurrentTest,
 *       root_abs_path: String
 *    },
 *    size: Number,
 *    path: String,
 *    increase: StoreIncrease,
 *    update: StoreUpdate,
 *    set: StoreSet,
 *    get: StoreGet
 *
 * }
	} TStore*/

/** @callback PythonRunCallback
 @param {*} err
 @param {String[] | Number[] | Boolean[] | String} output*/

/** @callback PythonRun
 @param {String} scriptPath
 @param {*?} options
 @param {PythonRunCallback?} callback*/

// [*TPythonShell]
/**
 @typedef {
 * {
 *    scriptPath: String,
 *    command: String[],
 *    mode: String,
 *    terminated: Boolean,
 *    run: PythonRun,
 *    end:
 *
 * }
	} TPythonShell*/


// [*TCurrentTest]
/**@typedef {
 * {
 *    truth_file_path: String,
 *    finished_trials_count: Number,
 *    levels: TLevel[],
 *    learning_type: String,
 *    demo_type: String,
 *    current_subject: String,
 *    errors_playingspeed: Number,
 *    allowed_tempo_deviation_factor: Number,
 * }
} TCurrentTest */

// *TLevel
/**@typedef {
 * {
 *    notes: Number,
 *    trials: Number
 * }
} TLevel*/


// [*TMessage]
/**
 @typedef {{
      note: Number,
      time: Number,
      time_delta: Number,
      velocity: Number,
      time: Number,
      preceding_message_time: Number
   }} TMessage
 */

// [*TTonejsNote]
/**
 @typedef {{
      note: Number,
      time: Number,
      ts: Number,
      velocity: Number
   }} TTonejsNote
 */
