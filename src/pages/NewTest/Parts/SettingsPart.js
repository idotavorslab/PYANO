// **pages/NewTest/Parts/SettingsPart.js
// const $ = require('jquery');
let { EStore } = require("pyano_local_modules/ext_libs");

/**@typedef {'demo_type' | 'errors_playingspeed' | 'allowed_rhythm_deviation' | 'allowed_tempo_deviation' | 'experiment_type' } TFieldName*/

/**@typedef {{id:string,text:string}} TIdTextPair*/

/**@typedef {{id:string, text:string, storeVal:string}} TToggleOptionTDef*/

/**@typedef {{
	label: TIdTextPair,
	firstOpt: TToggleOptionTDef,
	secondOpt: TToggleOptionTDef
}} TToggleElementsTDef*/

/**@typedef {{
	label: TIdTextPair,
	select: {
		id: string,
		options: {
			rangeStop: number,
			valueFn: function (number): (number|string)
		}
	},
}} TSelectElementsTDef*/

/**@class ToggleSetting*/
class ToggleSetting {
	/**
	 @param {TFieldName} fieldName
	 @param {TToggleElementsTDef} elements
	 */
	constructor({ fieldName, elements }) {


		this.fieldName = fieldName;
		let { label, firstOpt, secondOpt } = elements;
		this.label = {
			...label, $jQ: $(`<div id=${label.id}>`)
				.addClass("mid-v-align-container")
				.append($('<span class="mid-v-align">')
					.text(label.text))
		};
		this.firstOpt = this._optionConstructor(firstOpt);
		this.secondOpt = this._optionConstructor(secondOpt);


		this._setButtonsByStore();

		this.jQueries({ withLabel: false })
		    .click(e => {
			    const firstOptClicked = e.currentTarget.id == this.firstOpt.id;
			    this._setStoreAndToggleGui(firstOptClicked);

		    });
	}

	/**@param {TToggleOptionTDef} option*/
	_optionConstructor(option) {
		const $jQ = $(`<button id=${option.id}>`)
			.html(option.text)
			.addClass('radio-option on');
		const toggle = on => $jQ
			.toggleClass('on', on)
			.toggleClass('off', !on);
		return {
			...option,
			$jQ,
			toggle,
		};

	}

	setClickFn(clickFn) {
		this.jQueries({ withLabel: false })
		    .click(clickFn);
	}


	/**@param {boolean} first*/
	_select({ first }) {

		this.firstOpt.toggle(first);
		this.secondOpt.toggle(!first);


	}

	_setButtonsByStore() {
		const config = EStore.config();
		const cfgIsSetToFirst = config[this.fieldName] == this.firstOpt.storeVal;
		this._select({ first: cfgIsSetToFirst });

	}

	/**@param {boolean} toFirst*/
	_setStoreAndToggleGui(toFirst) {

		const fieldValue = toFirst ? this.firstOpt.storeVal : this.secondOpt.storeVal;
		// EStore.set(`current_test.${this.fieldName}`, fieldValue);
		EStore.config()[this.fieldName] = fieldValue;

		this._select({ first: toFirst });

		Alert.small.success(`${this.fieldName.replaceAll('_', ' ').title()}`, `set to ${fieldValue}`);

	}

	/**
	 * @param {{withLabel:boolean}?} options
	 * @return {jQuery[]}
	 */
	jQueries(options) {
		const withLabel = options ? options.withLabel : true;

		const jQs = this.firstOpt.$jQ.add(this.secondOpt.$jQ);
		if (withLabel)
			return jQs.add(this.label.$jQ);
		else
			return jQs;


	}
}

class GlobalToggleSetting extends ToggleSetting {
	/**
	 @param {TFieldName} fieldName
	 @param {TToggleElementsTDef} elements
	 */
	constructor({ fieldName, elements }) {
		super({ fieldName, elements });
	}

	_setButtonsByStore() {
		const cfgIsSetToFirst = EStore[this.fieldName] == this.firstOpt.storeVal;
		this._select({ first: cfgIsSetToFirst });
	}

	/**@param {boolean} toFirst*/
	_setStoreAndToggleGui(toFirst) {
		const fieldValue = toFirst ? this.firstOpt.storeVal : this.secondOpt.storeVal;
		EStore[this.fieldName] = fieldValue;

		this._select({ first: toFirst });

		Alert.small._success({
			     title: `${this.fieldName.replaceAll('_', ' ').title()}`,
			     text: `set to ${fieldValue}`,
			     timer: 1000
		     },)
		     .then(reloadPage);
	}
}

/**@class SelectSetting
 * @abstract*/
class SelectSetting {
	/**
	 @param {TFieldName} fieldName
	 @param {TSelectElementsTDef} elements
	 */
	constructor({ fieldName, elements }) {
		this.fieldName = fieldName;
		let { label, select } = elements;
		this.label = {
			...label, $jQ: $(`<div id=${label.id}>`)
				.addClass("mid-v-align-container")
				.append($('<span class="mid-v-align">')
					.text(label.text))
		};
		this.select = {
			...select, $jQ: $(`<select id=${select.id}>`)
				.change(() => this._setStore())
		};

		this._previousValue = null;
		this._popuplateOptionsByStore(select.options);

	}

	/**@abstract*/
	_valFromString(s) {}

	/**@abstract*/
	_valToHuman(v) {}

	// Called in constructor on change. Don't manually "select" because .change() does this automatically

	_setStore() {
		let fieldValue = this._valFromString(this.select.$jQ.val());
		this._previousValue = fieldValue;
		// EStore.set(`current_test.${this.fieldName}`, fieldValue);
		EStore.config()[this.fieldName] = fieldValue;
		let msg = `${this.fieldName.replaceAll('_', ' ').title()} set to ${this._valToHuman(fieldValue)}`;

		Alert.small.success(msg);

	}

	// Instance method, called by instanciator
	/**
	 @param {number} rangeStop
	 @param {Function} valueFn
	 */
	_popuplateOptionsByStore({ rangeStop, valueFn }) {
		const config = EStore.config();
		// let currentTest = EStore.get('current_test');
		const valueInCfg = this._valFromString(config[this.fieldName]);

		this._previousValue = bool(valueInCfg) ? valueInCfg : 1;
		for (let i of range(0, rangeStop)) {
			const value = valueFn(i);


			const $option = $(`<option value="${value}">`)
				.attr('selected', value == valueInCfg)
				.text(this._valToHuman(value));
			this.select.$jQ.append($option);
		}
	}

	// SettingsPart, toggle(false) if in tempo
	toggle(on) {
		this.select.$jQ
		    .attr('disabled', on ? null : 'disabled')
		    .toggleClass('disabled', !on);
		let valueToSet = on ? this._previousValue : 1;
		this.select.$jQ.val(valueToSet);
		// EStore.set(`current_test.${this.fieldName}`, valueToSet);
		EStore.config()[this.fieldName] = valueToSet;
	}


	jQueries() {
		return [this.select.$jQ, this.label.$jQ];
	}
}

class PrecentSelectSetting extends SelectSetting {
	constructor({ fieldName, elements }) {
		super({ fieldName, elements });
	}

	_valFromString(s) {return s;}

	_valToHuman(v) {return v;}

}

class FloatSelectSetting extends SelectSetting {

	constructor({ fieldName, elements }) {
		super({ fieldName, elements });
	}

	_valToHuman(v) {
		return v + 'x';
	}

	_valFromString(s) {
		return float(s);
	}


}


const SettingsPart = (() => {

	const $Div = $('<div id="settings_div">');

	const experimentType = new GlobalToggleSetting({
		fieldName: "experiment_type",
		elements: {
			label: { id: "settings_experiment_type_label", text: 'Experiment Type' },
			firstOpt: { id: "settings_experiment_test_btn", text: 'Train', storeVal: 'test' },
			secondOpt: { id: "settings_experiment_exam_btn", text: 'Exam', storeVal: 'exam' },
		}

	});
	const demoType = new ToggleSetting({
		fieldName: 'demo_type',
		elements: {
			label: { id: "settings_video_animation_label", text: 'Demo Type' },
			firstOpt: { id: "settings_video_btn", text: 'Video', storeVal: 'video' },
			secondOpt: { id: "settings_animation_btn", text: 'Animation', storeVal: 'animation' }
		},
	});

	const errorsPlayingSpeed = new FloatSelectSetting({
		fieldName: 'errors_playingspeed',
		elements: {
			label: { id: "settings_errors_playingspeed_label", text: "Errors feedback playback rate" },
			select: {
				id: "settings_errors_playingspeed_select",
				options: {
					rangeStop: 30,
					valueFn: i => 0.5 + (i / 20),
				}
			}
		}
	});


	const allowedRhythmDeviation = new PrecentSelectSetting({
		fieldName: 'allowed_rhythm_deviation',
		elements: {
			label: { id: "settings_rhythm_deviation_label", text: "Allowed rhythm deviation" },
			select: {
				id: "settings_rhythm_deviation_select",
				options: {
					rangeStop: 40,
					valueFn: i => `${i}%`
				}
			}
		}
	});

	const allowedTempoDeviation = new PrecentSelectSetting({
		fieldName: 'allowed_tempo_deviation',
		elements: {
			label: { id: "settings_tempo_deviation_label", text: "Allowed tempo deviation" },
			select: {
				id: "settings_tempo_deviation_select",
				options: {
					rangeStop: 40,
					valueFn: i => `${i}%`
				}
			}
		}
	});


	$Div.append(
		...demoType.jQueries(),
		...errorsPlayingSpeed.jQueries(),
		...allowedRhythmDeviation.jQueries(),
		...allowedTempoDeviation.jQueries(),
		...experimentType.jQueries()
	);
	return { $Div };
})();
module.exports = SettingsPart;