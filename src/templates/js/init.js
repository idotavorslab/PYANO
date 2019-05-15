const sidebar = require("pyano_local_modules/sidebar");
sidebar.build();
let Pages = require("pyano_local_modules/pages/pages");
let { EStore } = require("pyano_local_modules/ext_libs");
let last_page = EStore.get('last_page');
console.log('init.js', { last_page });
Pages.toPage(last_page, false);
document.getElementById('exit_btn')
        .addEventListener('click', async () => {
	        let { value: shouldExit } = await Alert.big.warning({
		        title: 'Are you sure you want to exit?',
		        confirmButtonColor: '#dc3545',
		        animation: false
	        });
	        if (shouldExit)
		        getCurrentWindow().close();
        });
document.getElementById('minimize_btn')
        .addEventListener('click', () => getCurrentWindow().minimize());
