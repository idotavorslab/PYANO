/**import Alert from 'MyAlert' (or any other name)*/

console.group('src/MyAlert/index.ts');
import Swal, { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';

console.log(`Swal:`, Swal);
import { paragraph, elem, BetterHTMLElement, button } from "../bhe/index.js";
import * as path from "path";
import { wait } from "../util";

const smallMixin = Swal.mixin({
    animation: false,
    // customClass: 'animated fadeIn',
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
const blockingOptions: SweetAlertOptions = {
    allowEnterKey: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    // customClass: 'animated fadeIn',
    showCancelButton: false, // default false
    showCloseButton: false, // default false
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
        return smallMixin.fire({ ...options, type: 'question' })
    },
    _info(options) {
        return smallMixin.fire({ ...options, type: 'info' })
    },
    _success(options) {
        return smallMixin.fire({ ...options, type: 'success' })
    },
    _error(options) {
        return smallMixin.fire({ ...options, type: 'error' })
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            showConfirmButton: true, type: 'warning'
        })
    },
    error(title, text) {
        return smallMixin.fire({
            title,
            text,
            icon: "error",

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
        // @ts-ignore
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null, timer = 6000) {

        return smallMixin.fire({
            title,
            text,
            icon: "success",
            timer
        })
    },
    warning(title, text = null) {
        let warningOptions = {
            title,
            text,
            showConfirmButton: true,
            timer: null,
            type: "warning"
        };

        // @ts-ignore
        return smallMixin.fire(warningOptions);
    },

};


const big = {
    async error(options) {

        if (options?.html instanceof Error) {
            const error = options.html;


            const { what, where, cleanstack } = error.toObj();
            console.warn('Error!', error, { cleanstack });
            options.html = `${what}<p>${where}</p>`
        }
        const dirname = new Date().human();
        const { default: Glob } = require('../Glob');
        /*if (LOG || !Glob.BigConfig.get('dev')) {
            options.onOpen = async () => {
                await takeScreenshot(dirname);

            };
            options.onAfterClose = async () => {
                await wait(500);
                await takeScreenshot(dirname);

            };
            options.html += `<p>Logs and screenshot saved to errors/${path.basename(SESSION_PATH_ABS)}/${dirname}</p>`
        }*/

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
                // .map(s => $(`<p class="clickable">${s}</p>`))
                .map(s => paragraph({ cls: 'clickable', text: s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));

            options = {
                ...options,
                onBeforeOpen(modalElement) {
                    console.log('modalElement:', modalElement);
                    return elem({ id: 'swal2-content' })
                        // .show()
                        .append(...paragraphs);
                }
            };
        } else { // force confirm and cancel buttons
            options = {
                showConfirmButton: true,
                showCancelButton: true,
                ...options,
            };
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen) {
            // / Happens when not or bad moreOptions
            return Swal.fire({ ...blockingOptions, ...options });
        } else { // TODO: onOpen : resolve?

            // @ts-ignore
            return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen: v => resolve(v) }));
        }
    },

    oneButton(title, options) {
        /*console.log({ title, options });
         const typeoftitle = typeof title;
         if ( typeoftitle === "object" ) {
         if ( options ) {
         if ( options.html ) {
         options.html += '<br>';
         } else {
         options.html = '';
         }
         } else {
         options = { html : '' };
         }
         if ( title instanceof Error ) {
         title = 'An error has occurred';
         options.html += title.message;
         console.log({ title, options });
         } else {
         let html = `<style>
         span {
         font-family: monospace;
         margin-left: 40px;
         }
         </style>
         <div style="text-align: left">

         `;
         for ( let key of Object.keys(title) ) {
         html += `<p><b>${key}:</b> <span>${title[key]}</span></p>`
         }
         html += `</div>`;
         options.html += html;
         title = 'Something happened';

         }
         } else if ( Array.isArray(title) ) {
         title = 'This is weird';
         options.html += title.join('</br>')
         }*/
        return blockingSwalMixin.fire({
            title: title as string,
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

        // const thirdButtonText = options.thirdButtonText ?? 'Overwrite';
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' }
        }

        console.log({ thirdButtonCss });
        let action;
        const onBeforeOpen = (modal) => {
            let el = elem({
                htmlElement: modal,
                children: { actions: '.swal2-actions' }
            }) as BetterHTMLElement & { actions: BetterHTMLElement };

            el.actions.append(
                button({ cls: `swal2-confirm swal2-styled`, html: options.thirdButtonText })

                    .css(thirdButtonCss)
                    .click((ev) => {
                        action = "third";
                        Swal.clickConfirm();
                    })
            )
        };
        options = { ...options, onBeforeOpen, showCancelButton: true };
        const { value } = await Swal.fire(options);
        if (value) {
            /// Either user clicked Confirm (action is undefined) or Swal.clickConfirm() (action is "third")
            if (action === undefined) {
                action = "confirm";
            }
        } else {
            action = "cancel";
        }

        return action;
    }
};

export default { small, big, ...Swal };
console.log('src/MyAlert/index.ts EOF');
console.groupEnd();

