const sidebar = require("pyano_local_modules/sidebar");
sidebar.build();
let Pages = require("pyano_local_modules/pages/pages");
let { EStore } = require("pyano_local_modules/ext_libs");
let last_page = EStore.get('last_page');
Pages.toPage(last_page, false);
