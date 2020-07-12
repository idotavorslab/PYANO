// ** pages/pages.js
console.group(`pages/pages.js`);
import newTestPage from "./NewTest/newtest.js";

import { LastPage } from "../templates/js/types";


// import * as insideTestPage from "./InsideTest/insidetest.js";
//
// import * as recordPage from "./Record/record.js";
//
// import * as fileToolsPage from "./FileTools/filetools.js";


export function toPage(page: LastPage, reload: boolean = false) {
    switch (page) {

        case 'new_test':
            return newTestPage.switch(reload);
        /*case 'inside_test':
            return insideTestPage.switch(reload);
        case 'record':
            return recordPage.switch(reload);
        case 'file_tools':
            return fileToolsPage.switch(reload);*/
        default:
            console.error(`pages default, got: ${page}`);
    }
}

console.log('pages/pages.js EOF');
console.groupEnd();
// module.exports = { newTestPage, insideTestPage, recordPage, fileToolsPage, toPage };
