// *** Store Types


// * TSavedConfig
/**
 * @typedef {TConfig & {truth_file_path: string}} TSavedConfig
 */

// * TSavedConfigKey
/**@typedef {
 * 'finished_trials_count'
 * |'levels'
 * |'demo_type'
 * |'current_subject'
 * |'errors_playingspeed'
 * |'allowed_rhythm_deviation'
 * |'allowed_tempo_deviation'
 * |'truth_file_path'
 * } TSavedConfigKey*/


// * TConfig
/**
 * @typedef TConfig
 * @prop {number} finished_trials_count
 * @prop {TLevel[]} levels
 * @prop {TDemoType} demo_type
 * @prop {string} current_subject
 * @prop {number} errors_playingspeed
 * @prop {string} allowed_rhythm_deviation
 * @prop {string} allowed_tempo_deviation
 * @prop {string} save_path
 */
// * TConfigKey
/**@typedef {
 * 'finished_trials_count'
 * |'levels'
 * |'demo_type'
 * |'current_subject'
 * |'errors_playingspeed'
 * |'allowed_rhythm_deviation'
 * |'allowed_tempo_deviation'
 * |'save_path'
 * } TConfigKey*/

// * TDemoType
/** @typedef {'video' | 'animation'} TDemoType*/

// * TExperimentType
/** @typedef {'exam' | 'test'} TExperimentType*/

// * TLastPage
/**@typedef {'exam' | 'new_test' | 'inside_test' | 'record' | 'file_tools' | 'settings'} TLastPage*/

// *** InsideTest.Gui | gilad
// * TLevel
/**
 * @typedef TLevel
 * @prop {number} notes
 * @prop {number} trials
 * @prop {boolean} rhythm
 * @prop {number} tempo
 */

// * TMessage
/**
 * @typedef TMessage
 * @prop {number} note
 * @prop {number} time
 * @prop {number} time_delta
 * @prop {number} velocity
 * @prop {number} preceding_message_time
 * @prop {'off' | 'on'} kind
 */

// * TMistake
/**@typedef {'accuracy','rhythm'} TMistake*/
// * TOnOffPairs
/**@typedef {[TMessage[]]} TOnOffPairs*/
// * gilad.playMidiFile
/**
 @typedef playMidiFileOptions
 @prop {Animation?} animation
 @prop {Array<string|null>?} mistakes
 @prop {number?} numOfNotes
 @prop {number?} playbackRate
 @prop {Piano} animationPiano
 @prop {Truth} truth
 */

// * TDoneTrialResult
/**@typedef {{ passed: boolean,
               tempo_str: 'slow' | 'fast' | 'ok',
               mistakes: TMistake[],
               played_enough_notes: boolean,
               played_too_many_notes:boolean,
               advance_trial: boolean}} TDoneTrialResult*/

// *** Alert
// * SweetOptions
/**@typedef {{
        allowEnterKey?: boolean | function(*):boolean,
        allowEscapeKey?: boolean | function(*):boolean,
        allowOutsideClick?: boolean | function(*):boolean,
        animation?: boolean | function(*):boolean,
        backdrop?: boolean | string,
        background?: string,
        buttonsStyling?: boolean,
        cancelButtonAriaLabel?: string,
        cancelButtonClass?: string,
        cancelButtonColor?: string,
        cancelButtonText?: string,
        closeButtonAriaLabel?: string,
        confirmButtonAriaLabel?: string,
        confirmButtonClass?: string,
        confirmButtonColor?: string,
        confirmButtonText?: string,
        currentProgressStep?: string,
        customClass?: string,
        customContainerClass?: string,
        focusCancel?: boolean,
        focusConfirm?: boolean,
        footer?: string | jQuery,
        grow?: 'row' | 'column' | 'fullscreen' | boolean,
        heightAuto?: boolean,
        html?: string | HTMLElement | jQuery,
        imageAlt?: string,
        imageClass?: string,
        imageHeight?: number,
        imageUrl?: string,
        imageWidth?: number,
        input?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' |
            'file' | 'url',
        inputAttributes?: Object,
        inputAutoTrim?: boolean,
        inputClass?: string,
        inputOptions?: Object,
        inputPlaceholder?: string,
        inputValidator?: function (string): string | null,
        inputValue?: string,
        keydownListenerCapture?: boolean,
        onAfterClose?: Function,
        onBeforeOpen?: function (HTMLElement): void,
        onClose?: function (HTMLElement): void,
        onOpen?: function (HTMLElement): void,
        padding?: number | string,
        position?: 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' |
            'center' | 'center-start' | 'center-end' | 'center-left' | 'center-right' |
            'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right',
        preConfirm?: Function,
        progressSteps?: string[],
        progressStepsDistance?: string,
        reverseButtons?: boolean,
        scrollbarPadding?: boolean,
        showCancelButton?: boolean,
        showCloseButton?: boolean,
        showConfirmButton?: boolean,
        showLoaderOnConfirm?: boolean,
        stopKeydownPropagation?: boolean,
        target?: string,
        text?: string,
        timer?: ?number,
        title?: string,
        titleText?: string,
        toast?: boolean,
        type?: 'success' | 'error' | 'warning' | 'info' | 'question',
        validationMessage?: string,
        width?: number | string,
}
} SweetOptions*/


