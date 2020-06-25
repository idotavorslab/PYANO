console.group('src/MyAlert/index.ts');
import Swal from 'sweetalert2';
console.log(`Swal:`, Swal);
import { paragraph, elem, button } from "../bhe/index.js";
const smallMixin = Swal.mixin({
    animation: false,
    customClass: 'animated fadeIn',
    position: "bottom-start",
    showConfirmButton: false,
    timer: 8000,
    toast: true,
});
const withConfirm = {
    cancelButtonText: "No",
    confirmButtonText: "Yes",
    showCancelButton: true,
    showConfirmButton: true,
    timer: null,
};
const blockingOptions = {
    allowEnterKey: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated fadeIn',
    showCancelButton: false,
    showCloseButton: false,
    showConfirmButton: false,
    width: "75vw",
};
const threeButtonsOptions = {
    ...blockingOptions,
    showConfirmButton: true,
    showCancelButton: true,
};
const blockingSwalMixin = Swal.mixin(blockingOptions);
const small = {
    _question(options) {
        return smallMixin.fire({ ...options, type: 'question' });
    },
    _info(options) {
        return smallMixin.fire({ ...options, type: 'info' });
    },
    _success(options) {
        return smallMixin.fire({ ...options, type: 'success' });
    },
    _error(options) {
        return smallMixin.fire({ ...options, type: 'error' });
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            showConfirmButton: true, type: 'warning'
        });
    },
    error(title, text) {
        return smallMixin.fire({
            title,
            text,
            type: "error",
        });
    },
    info(title, text = null, showConfirmBtns = false) {
        let infoOptions = {
            title,
            text,
            type: "info",
        };
        if (showConfirmBtns) {
            infoOptions = { ...infoOptions, ...withConfirm };
        }
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null, timer = 6000) {
        return smallMixin.fire({
            title,
            text,
            type: "success",
            timer
        });
    },
    warning(title, text = null) {
        let warningOptions = {
            title,
            text,
            showConfirmButton: true,
            timer: null,
            type: "warning"
        };
        return smallMixin.fire(warningOptions);
    },
};
const big = {
    async error(options) {
        if ((options === null || options === void 0 ? void 0 : options.html) instanceof Error) {
            const error = options.html;
            const { what, where, cleanstack } = error.toObj();
            console.warn('Error!', error, { cleanstack });
            options.html = `${what}<p>${where}</p>`;
        }
        const dirname = new Date().human();
        const { default: Glob } = require('../Glob');
        return blockingSwalMixin.fire({
            type: 'error',
            showConfirmButton: true,
            ...options
        });
    },
    warning(options) {
        if (options.animation === false) {
            options = { customClass: null, ...options };
        }
        return blockingSwalMixin.fire({ ...withConfirm, type: 'warning', ...options });
    },
    blocking(options, moreOptions) {
        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;
            let paragraphs = strings
                .map(s => paragraph({ cls: 'clickable', text: s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));
            options = {
                ...options,
                onBeforeOpen(modalElement) {
                    console.log('modalElement:', modalElement);
                    return elem({ id: 'swal2-content' })
                        .append(...paragraphs);
                }
            };
        }
        else {
            options = {
                showConfirmButton: true,
                showCancelButton: true,
                ...options,
            };
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen) {
            return Swal.fire({ ...blockingOptions, ...options });
        }
        else {
            return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen: v => resolve(v) }));
        }
    },
    oneButton(title, options) {
        return blockingSwalMixin.fire({
            title: title,
            showConfirmButton: true,
            customClass: 'animated fadeIn',
            ...options
        });
    },
    async twoButtons(options) {
        const { value } = await Swal.fire({
            showCancelButton: true,
            customClass: 'animated fadeIn',
            ...options
        });
        return value ? "confirm" : "second";
    },
    async threeButtons(options) {
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' };
        }
        console.log({ thirdButtonCss });
        let action;
        const onBeforeOpen = (modal) => {
            let el = elem({
                htmlElement: modal,
                children: { actions: '.swal2-actions' }
            });
            el.actions.append(button({ cls: `swal2-confirm swal2-styled`, html: options.thirdButtonText })
                .css(thirdButtonCss)
                .click((ev) => {
                action = "third";
                Swal.clickConfirm();
            }));
        };
        options = { ...options, onBeforeOpen, showCancelButton: true };
        const { value } = await Swal.fire(options);
        if (value) {
            if (action === undefined) {
                action = "confirm";
            }
        }
        else {
            action = "cancel";
        }
        return action;
    }
};
export default { small, big, ...Swal };
console.log('src/MyAlert/index.ts EOF');
console.groupEnd();
