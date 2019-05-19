const { $MainContent, safeSwitchCss } = require("pyano_local_modules/document");
let { EStore } = require("pyano_local_modules/ext_libs");
const log = s => [`%c${s}`, 'color: #11D480'];
const examPage = {
	switch: async reload => {
		console.log(...log(`examPage.switch(${reload})`));
		EStore.last_page = 'exam';
		EStore.config().finished_trials_count = 0;
		// EStore.set({ 'current_exam.finished_trials_count': 0 });
		if (reload)
			return reloadPage();

		await asx.$fadeOut($MainContent, 100);
		$MainContent.empty();
		require("pyano_local_modules/sidebar").to_exam();
		safeSwitchCss("templates/css/exam.css");


		// $MainContent.append($bigMessage, $dropArea);
		await asx.$fadeIn($MainContent, 300);
	}
};

module.exports = examPage;
