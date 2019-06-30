can pull right now:
	git checkout origin/unstable -- node_modules/pyano_local_modules/pages/InsideTest/PyFns.js
	pulled: YES

	git checkout origin/unstable -- node_modules/pyano_local_modules/pages/NewTest/StoreFns.js
	pulled: YES

filetools.js
	async function split_base_txt_file
		depends on FileTools/split_base_txt_file.py
		looks safe
		pulled: YES

insidetest.js
	try/catch around doneTrialResult = await _handleDoneTrial 
		depends on: --
		looks safe
		pulled: YES

newtest.js
	trivia more random and clear
		depends on: --
		looks safe
		pulled: YES

sass_compile.py
	added --no-source-map	!unwanted
	pushed: YES

FileTools/split_base_txt_file.py
	new file
	depends on FileTools/split_base_txt_file.py
	looks safe
	pulled: YES

check_done_trial.py
	truth chords change
	not looks safe
	pulled: no


merge_on_off_txt_files.py
	moved get_on_off_pairs to Message
		depends on classes.py
		looks kinda safe
		pulled: no

classes.py
	Message.set_time_props(preceding_message_time)
		looks kinda safe
		pulled: no
	Message._init()
		looks safe
		pulled: no
	Message.get_on_off_pairs
		depends on classes.py
		looks safe
		pulled: no
	Hit if truth_time_delta == 0 #ZeroDivisionError
		looks not safe
		pulled: no

setup.py
	added 'FileTools'
	looks safe
	pulled: no