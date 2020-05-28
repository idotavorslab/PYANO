const log = s => [`%c${s}`, 'color: #245ed1'];
let { EStore, Python } = require("pyano_local_modules/ext_libs");
let { safeSwitchCss, $MainContent } = require("pyano_local_modules/document");
const $ = require('jquery');
const PyFns = () => require("pyano_local_modules/pages/InsideTest/PyFns");
let { execSync } = require('child_process');

/**@param {Truth} truth
 * @param {boolean} [confirm=true]*/
async function mp4toJson(truth, confirm = true) {
	console.log(...log(`mp4toJson(${truth.name})`));
	if (confirm) {

		let { value: shouldContinue } = await Alert.big.blocking({
			title: 'Get onsets and write data to file?',
			html: `Data will be ${(await truth.onsets.exists()) ? "overwritten" : "written"} to: ${truth.onsets.name}`,
		});
		if (!shouldContinue)
			return Alert.small.info('Aborting.');

	}
	if (!(await truth.mp4.exists()))
		return Alert.small.warning(`Couldn't find mp4 file: ${truth.mp4.name}`, 'Drop a mov file first');
	Alert.big.blocking({
		title: 'Calculating onsets...',
		showCancelButton: false,
		onOpen: require("sweetalert2").showLoading
	});
	// Alert.small._info({ title: 'Calculating onsets...', timer: null });
	let onsets = await Python.runAsync("Record/get_and_write_onsets.py", { args: [truth.mp4.path] });
	return await Alert.big.blocking({ title: 'How long was it until you played the first note?' },
		{
			strings: onsets.map(o => round(o, 1)),
			clickFn: async $s => {
				let first_onset = $s.text();
				// Alert.small.info(`Working...`);
				try {
					let options = { args: [truth.mp4.path, first_onset] };
					await Python.runAsync("Record/update_onsets_json.py", options);
					Alert.small.success(`Done.`);
					return true;
				} catch (e) {
					await Alert.small.error(`Failed updating onsets of ${truth.mp4.name}`, e.message);
					console.error(e);
					return false;
				}
			}
		});


}


/**@param {Truth} truth*/
async function txt2midi(truth) {
	console.log(...log(`txt2midi(${truth.name})`));
	const shouldConvert = await Alert.big.blocking({
		title: `Create ${truth.midi.name}?`
	});
	if (!shouldConvert.value)
		return Alert.small.info('Aborting.', 'Nothing changed.');


	if (await truth.midi.exists()) {

		const overwrite = await Alert.big.blocking({
			title: `Midi file already exists. Rename old midi file?`,
		});
		if (!overwrite.value)
			return Alert.small.info('Aborting.', 'Nothing changed.');
		else
			await truth.midi.renameByCTime();

	}
	if (!(await truth.txt.allExist())) {
		let confirm = await Alert.big.blocking({
			title: `There seem to be some txt files missing`,
			html: `Press OK only if ${truth.txt.base.name.path} contains both "on" and "off" data`,
			showConfirmButton: true, showCancelButton: true
		});
		if (!confirm.value)
			return Alert.small.info('Aborting.');
	}
	let { on_off_pairs } = await PyFns().merge_on_off_txt_files(truth);


	console.log(...log('\ton_off_pairs'), { on_off_pairs });

	const Gilad = require("pyano_local_modules/gilad");
	try {
		await Gilad.toMidiFromMessages(on_off_pairs, truth);
		Alert.small.success(`Created ${truth.midi.name}.`);
	} catch (e) {
		Alert.small.error('Converting from txt to midi failed', e.message);
		console.error(e);
	}


}

/**@param {Truth} truth*/
async function midi2txt(truth) {
	console.log(...log(`midi2txt(${truth.name})`));
	let shouldConvert = await Alert.big.blocking({
		title: `Create 3 txt files from ${truth.name}?`
	});
	if (!shouldConvert.value)
		return Alert.small.info('Not converting');


	if (await truth.txt.anyExist()) {
		let shouldOverwrite = await Alert.big.blocking({
			title: `At least one txt file already exists, overwrite *all*?`
		});
		if (!shouldOverwrite.value)
			return Alert.small.info('Aborting.');

		await truth.txt.removeAll();

	}
	const Gilad = require("pyano_local_modules/gilad");
	try {
		await Gilad.toTxtFromMidi(truth);
		await PyFns().merge_on_off_txt_files(truth);
		/*await Python.runAsync('InsideTest/normalize_txt_file.py', {
			args: [truth.txt.on.path],
			mode: "json"
		});
		Python.runAsync('InsideTest/merge_on_off_txt_files.py', {
			args: [truth.txt.base.path, truth.txt.on.path, truth.txt.off.path],
			mode: "json"
		});
		*/

		Alert.small.success(`Created ${[truth.txt.base.name, truth.txt.on.name, truth.txt.off.name]}.`);
	} catch (e) {
		Alert.small.error(`Creating txt files failed`, e.message);
		console.error(e);
	}

}

/**@param {Truth} truth
 * @return {boolean}*/
async function mov2mp4(truth) {

	console.log(...log(`mov2mp4(${truth.name})`));
	// let mp4path = fsx.replace_ext(movpath, 'mp4');
	// let mp4name = fsx.basename(mp4path);


	// **Confirm
	let { value: shouldConvert } = await Alert.big.blocking({
		title: 'Crop and create an mp4? (may take a while)',
		html: `${truth.mov.name} => ${truth.mp4.name}`,
		showConfirmButton: true,
		showCancelButton: true,
	});
	if (!shouldConvert) {
		Alert.small.info('Aborting');
		return false;
	}

	// **Maybe Delete existing
	let overwrite = false;
	if (await truth.mp4.exists()) {
		let { value: doAnyway } = await Alert.big.blocking({
			title: "An mp4 at destination already exists. Overwrite?",
			html: `Here: ${truth.mp4.name}`
		});
		if (doAnyway) {
			overwrite = true;
		} else {
			Alert.small.info('Aborting');
			return false;
		}

	}

	// **Convert
	try {

		await Alert.big.blocking({
			title: "Working...", html: "Here's a hamster: 🐹", showConfirmButton: false,
			showCancelButton: false, onOpen: require('sweetalert2').showLoading

		});
		const yesflag = overwrite ? "-y" : "";
		const cropparams = '1900:400:10:360';
		let cmd = `ffmpeg ${yesflag} -i "${truth.mov.path}" -filter:v "crop=${cropparams}" -qp 18 -preset ultrafast -tune zerolatency -profile:v baseline -level 3.0 -movflags +faststart "${truth.mp4.path}"`;
		await execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });

		Alert.small.success('Success', `New file created: ${truth.mp4.name}`);
		return true;
	} catch (e) {
		console.error(e);
		Alert.small.error('Error', e.message);
		return false;
	}


}

/**@param {Truth} truth
 * @return {boolean}*/
async function maybeCropMp4(truth) {
	console.log(...log(`maybeCropMp4(${truth.name})`));
	if (!(await truth.mp4.exists())) {
		Alert.small.warning(`mp4 doesn't exist: ${truth.name}`, 'Drop mov file instead');
		return false;
	}

	let mp4bitrate, mp4height;
	try {
		[mp4bitrate, mp4height] = await truth.mp4.getBitrateAndHeight();
	} catch (e) {
		console.error(e);
		Alert.small.warning("Couldn't get bitrate and height", e.message);
		return false;
	}
	let compressed = int(mp4bitrate) / 1000000 < 20;
	let cropped = int(mp4height) < 600;
	if (!compressed || !cropped) {
		if (await truth.mov.exists()) {
			let movbitrate, movheight;
			try {
				[movbitrate, movheight] = await truth.mov.getBitrateAndHeight();
			} catch (e) {
				console.error(e);
				Alert.small.warning("Couldn't get bitrate and height", e.message);
				return false;
			}
			/*let [movcompressed, movcropped] = truth.mov.getIsCompressedIsCropped(
				movbitrate,
				movheight,
				br => br / mp4bitrate > 2,
				h => h / mp4height > 1.2
			);
			*/

			compressed |= int(movbitrate) / int(mp4bitrate) > 2;
			cropped |= int(movheight) / int(mp4height) > 1.2;
		}
	}
	if (!compressed || !cropped) {
		return await mov2mp4(truth);
	} else {
		Alert.small.success(`Mp4 file is compressed and neatly cropped already`);
		return true;
	}


}


async function onDrop(e) {
	getCurrentWindow().focus(); // TODO: may be redundant with "acceptFirstMouse: true"
	const { name, path, size, type } = e.originalEvent.dataTransfer.files[0];
	console.log(...log(`\tonDrop`), { name, path, size, type });
	let truth;
	if (path.endsWith('_off.txt') || path.endsWith('_on.txt')) {
		let { value: ok } = await Alert.big.blocking({
			title: 'You dropped an "off" or "on" file',
			html: `Should I use the base txt file instead?`
		});
		if (!ok)
			return Alert.small.info('Aborting', 'Nothing changed');
		else
			truth = new Truth(fsx.remove_ext(path).upTo('_', true));
	} else {
		truth = new Truth(fsx.remove_ext(path));
	}

	if (type == "audio/mid")
		return await midi2txt(truth);
	if (type == "application/json")
		return await mp4toJson(truth);

	if ("text".in(type))
		return await txt2midi(truth);

	if ("video".in(type)) {
		let ext = fsx.extname(name).lower();
		if (ext.endsWith('mov')) {
			let ok = await mov2mp4(truth);
			if (ok)
				return await mp4toJson(truth);
			else
				return;
		}
		if (ext.endsWith('mp4')) {
			let compressedAndCropped = await maybeCropMp4(truth);
			if (compressedAndCropped)
				return await mp4toJson(truth);
			else
				return;
		}
		return Alert.small.warning(`Can't handle this video format`, `Only 'mov' or 'mp4'`);
	}

	Alert.small.warning('Can only hanle mp4 / mov / txt / json / mid');
}

const fileToolsPage = {
	switch: async reload => {
		console.log(...log(`fileToolsPage.switch(${reload})`));
		EStore.last_page = 'file_tools';
		if (reload)
			return reloadPage();

		await asx.$fadeOut($MainContent, 100);
		$MainContent.empty();
		require("pyano_local_modules/sidebar").to_file_tools();
		safeSwitchCss("templates/css/file_tools.css");
		let $bigMessage = $('<div id="big_message">')
			.text('Drop a file');
		let $dropArea = $('<div id="drop_area">')
			.on({
				'dragover dragenter': e => {
					e.preventDefault();
					e.stopPropagation();
				}, 'drop': async e => await onDrop(e)
			});

		$MainContent.append($bigMessage, $dropArea);
		await asx.$fadeIn($MainContent, 150);
	}
};

module.exports = fileToolsPage;
