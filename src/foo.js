console.group(`foo.js`);
import {BetterHTMLElement} from "./bhe/index.js";

const {remote} = require('electron');
const Store = require("electron-store");
const store = new Store();
console.log(BetterHTMLElement);
console.log('store.path: ', store.path);

console.log('remote:', remote, remote.app.getPath('userData'));
const sidebar = require("pyano_local_modules/sidebar");
console.groupEnd();