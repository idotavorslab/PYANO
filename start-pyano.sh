#!/env/bin/bash
if [[ -z "$VIRTUAL_ENV" ]]; then
	cd /c/PYANO/src/engine || return 1
	if [[ ! -d "$PWD"/env ]]; then
		echo "virtual env in $PWD/env does not exist. Refer to Pyano installation manual to rebuild it."
		return 1
	fi
	if ! . env/Scripts/activate; then
		echo "virtual env is currupt. Remove it and rebuild it with the help of Pyano installation manual."
		return 1
	fi
fi
cd /c/PYANO || return 1
if git status | grep -q deleted; then
	git checkout node_modules
fi
if ! command -v nvm &>/dev/null; then
	echo "nvm is either not installed or unavailable; Refer to Pyano installation manual to activate it."
	return 1
fi
if ! nvm list 2>&1 | grep Currently | grep -oq 12.14.1; then
	if ! nvm use 12.14.1; then
		echo "nvm failed to load node v12.14.1; Refer to Pyano installation manual to reinstall it."
		return 1
	fi
fi
npm start "$@"