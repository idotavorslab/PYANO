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
 @prop {Animation?} animation
 @prop {Array<string|null>?} mistakes
 @prop {number?} numOfNotes
 @prop {number?} speed
 @prop {Piano} playbackPiano
 @prop {Truth} truth
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

