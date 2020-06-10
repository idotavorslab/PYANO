// ** pages/pages.js
console.group(`pages/pages.js`);
import * as newTestPage from "./NewTest/newtest.js";

// import * as insideTestPage from "./InsideTest/insidetest.js";
//
// import * as recordPage from "./Record/record.js";
//
// import * as fileToolsPage from "./FileTools/filetools.js";

/**@param {TLastPage} page
 @param {boolean} reload*/
export function toPage(page, reload) {
    switch (page) {

        case 'new_test':
            return newTestPage.switch(reload);
        case 'inside_test':
            return insideTestPage.switch(reload);
        case 'record':
            return recordPage.switch(reload);
        case 'file_tools':
            return fileToolsPage.switch(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }
}

console.log('pages/pages.js EOF');
console.groupEnd();
// module.exports = { newTestPage, insideTestPage, recordPage, fileToolsPage, toPage };
