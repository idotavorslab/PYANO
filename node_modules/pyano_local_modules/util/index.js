const span = (s, cls = null) => cls
                                ? `<span class="${cls}">${s}</span>`
                                : `<span>${s}</span>`;
const strong = (s) => `<strong>${s}</strong>`;
const bold = s => `<b>${s}</b>`;

/**@param {string} html
 @return {jQuery}*/
function $midVertAlign(html) {
	const $ = require("jquery");
	return $('<div class="mid-v-align-container">')
		.append($('<span class="mid-v-align">').html(html));
}

function AelseB(a, b) {
	return a ? a : b;
}

module.exports = {
	span,
	strong,
	bold,
	$midVertAlign
};
