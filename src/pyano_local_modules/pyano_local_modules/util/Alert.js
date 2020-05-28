const Swal = require("sweetalert2");
let smallMixin = Swal.mixin({
	animation: false,
	customClass: 'animated fadeIn',
	position: "bottom-start",
	showConfirmButton: false,
	timer: 8000,
	toast: true,

});
const withConfirm = {
	cancelButtonText: "No",
	confirmButtonText: "Yes",
	showCancelButton: true,
	showConfirmButton: true,
	timer: null,

};
const blockingOptions = {
	allowEnterKey: false,
	allowEscapeKey: false,
	allowOutsideClick: false,
	animation: false,
	customClass: 'animated fadeIn',
	showCancelButton: false, // default false
	showCloseButton: false, // default false
	showConfirmButton: false,

};

const blockingSwalMixin = Swal.mixin(blockingOptions);
const Alert = (() => {

	const small = (() => {
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const _question = options => smallMixin.fire({ ...options, ...{ type: 'question' } });
		/**@param {string} title
		 * @param {?string} text
		 * @param {boolean} showConfirmBtns
		 * @return {Promise<SweetAlertResult>}*/
		const info = (title, text = null, showConfirmBtns = false) => {
			let infoOptions = {
				title,
				text,
				type: "info",
			};
			if (showConfirmBtns)
				infoOptions = { ...infoOptions, ...withConfirm };
			return smallMixin.fire(infoOptions);
		};
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const _info = options => smallMixin.fire({ ...options, ...{ type: 'info' } });
		/** @param {string} title
		 * @param {?string} text
		 * @param {number} timer
		 * @return {Promise<SweetAlertResult>}*/
		const success = (title, text = null, timer = 4000) =>
			smallMixin.fire({
				title,
				text,
				type: "success",
				timer
			});
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const _success = options => smallMixin.fire({ ...options, ...{ type: 'success' } });
		/**@param {string} title
		 * @param {?string} text
		 * @param {boolean} showConfirmBtns
		 * @return {Promise<SweetAlertResult>}*/
		const warning = (title, text = null, showConfirmBtns = false) => {
			let warningOptions = {
				title,
				text,
				type: "warning"
			};
			if (showConfirmBtns)
				warningOptions = { ...warningOptions, ...withConfirm };
			return smallMixin.fire(warningOptions);
		};
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const _warning = options => smallMixin.fire({
			...options,
			...{ showConfirmButton: true, type: 'warning' }
		});

		/** @param {string} title
		 * @param {string} text
		 * @return {Promise<SweetAlertResult>}*/
		const error = (title, text) =>
			smallMixin.fire({
				title,
				text,
				type: "error",

			});
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const _error = options => smallMixin.fire({ ...options, ...{ type: 'error' } });

		return { info, _info, success, _success, warning, _warning, error, _error, _question };
	})();

	const big = (() => {
		/** @param {SweetOptions} options
		 * @return {Promise<SweetAlertResult>}*/
		const warning = options => {
			if (options.animation === false)
				options = { customClass: null, ...options };
			return blockingSwalMixin.fire({ ...withConfirm, type: 'warning', ...options });
		};
		/**@param {SweetOptions} options
		 * @param {string[]} strings
		 * @param {function(jQuery)} clickFn
		 * @return {Promise<SweetAlertResult>}*/
		const blocking = (options, { strings, clickFn } = {}) => {

			if (strings && clickFn) {
				const $ = require("jquery");
				strings = strings
					.map(s => $(`<p class="clickable">${s}</p>`))
					.map($s => $s.click(() => clickFn($s)));
				options = {
					...options,
					onBeforeOpen: () => $('#swal2-content')
						.show()
						.append(strings)
				};
			} else { // force confirm and cancel buttons
				options = {
					showConfirmButton: true,
					showCancelButton: true,
					...options,
				};
			}
			if (options.showConfirmButton || options.showCancelButton || options.onOpen)
				return Swal.fire({ ...blockingOptions, ...options });
			else
				return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen: v => resolve(v) }));
		};
		return { warning, blocking };
	})();
	return {
		small,
		big,
		close: () => Swal.close(),
		isActive: () => Swal.isVisible()
	};
})();
module.exports = { Alert };

