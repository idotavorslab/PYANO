export const span = (s, cls = null) => cls
    ? `<span class="${cls}">${s}</span>`
    : `<span>${s}</span>`;
export const strong = (s) => `<strong>${s}</strong>`;
export const bold = s => `<b>${s}</b>`;

/**@param {string} html
 @return {jQuery}*/
export function $midVertAlign(html) {
    const $ = require("jquery");
    return $('<div class="mid-v-align-container">')
        .append($('<span class="mid-v-align">').html(html));
}

function AelseB(a, b) {
    return a ? a : b;
}


