console.group(`foo.js`);
import {BetterHTMLElement} from "./bhe/index.js";

import * as sidebar from "./sidebar.js";

const {remote} = require('electron');
const Store = require("electron-store");
const store = new Store();

export const $PageCss = $('#page_css');
export const $Sidebar = $('#sidebar');
export const $Title = $('#title');
export const $MainContent = $('#main_content').hide();
$Sidebar._fadeTo = $Sidebar.fadeTo;
$Sidebar.fadeTo = (speed, to, easing, callback) => {
    // [...$Sidebar[0].children].forEach(item=>item.classList.add('unclickable'));
    $Sidebar[0].classList.toggle('unclickable', to == 0);
    return $Sidebar._fadeTo(speed, to, easing, callback);
};

function safeSwitchCss(href) {
    if ($PageCss.attr('href') != href) {
        $PageCss.attr('href', href);
    }
}

console.log(BetterHTMLElement);
console.log('store.path: ', store.path);

console.log('remote:', remote, remote.app.getPath('userData'));
console.groupEnd();