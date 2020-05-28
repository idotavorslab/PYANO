// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
console.group('preload.js');
const {remote} = require('electron');
console.log('remote:', remote, remote.app.getPath('userData'));


console.groupEnd();
