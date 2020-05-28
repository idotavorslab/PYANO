// **pages/pages.js
let newTestPage = require("./NewTest/newtest.js");
let insideTestPage = require("./InsideTest/insidetest.js");
let recordPage = require("./Record/record.js");
const fileToolsPage = require("./FileTools/filetools");

/**@param {TLastPage} page
 @param {boolean} reload*/
function toPage(page, reload) {
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

module.exports = { newTestPage, insideTestPage, recordPage, fileToolsPage, toPage };
