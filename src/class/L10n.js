import LocaleString from './LocaleString.js';

/**
 * L10n handles localization and translation
 */
class L10n {

	constructor(eventBus, namespace) {
		this._ns = namespace ? '' : namespace + '.';

		this._eventBus = eventBus;
		this._locale = 'en';
	}

	/**
	 * Currently set locale language tag
	 * @type {string}
	 */
	get locale() {
		return this._locale;
	}

	/**
	 * Translates a string and replaces tags with provided object.
	 * @param {string|LocaleString} key Key id of string to translate. It might also be a LocaleString object previously returned from the l method.
	 * @param {string} [defaultStr] Default string tranlation. Should not be provided if key is a LocaleString.
	 * @param {object} [params] Params to use on tag replacement
	 * @returns {string} Translated string.
	 */
	t(key, defaultStr, params) {
		let preParams = 2, defaultParams;

		if (key instanceof LocaleString) {
			defaultStr = key.defaultStr;
			defaultParams = key.defaultParams;
			key = key.key;
			preParams = 1;
		} else {
			if (typeof key !== 'string') {
				console.error(`Translation key is of type ${typeof key} instead of string:`, key);
				return defaultStr;
			}

			// If we only get one argument, we can assume
			// it is an already translated string.
			if (arguments.length <= 1) return key;

			key = this._ns + key;
		}

		let s = defaultStr;
		params = arguments[preParams];

		if (typeof params != "undefined" || defaultParams) {
			if (typeof params == "string") {
				params = Array.prototype.slice.call(arguments, preParams);
			}

			if (defaultParams) {
				params = Object.assign({}, defaultParams, params);
			}

			s = s.replace(/{([^}]+)}/g, function (match, idx) {
				return typeof params[idx] != 'undefined' ?
					params[idx] :
					'???';
			});
		}

		return s;
	}

	/**
	 * Returns a LocaleString that can be passed to the t method for translation.
	 * @param {string} key Key id of string to translate.
	 * @param {string} defaultStr Default string translation.
	 * @param {object} [defaultParams] Default parameters.
	 */
	l(key, defaultStr, defaultParams) {
		if (key instanceof LocaleString) {
			if (typeof defaultStr !== "undefined") {
				if (typeof defaultStr === "string") {
					defaultStr = Array.prototype.slice.call(arguments, 1);
				}
			}

			defaultParams = key.defaultParams && defaultStr
				? Object.assign({}, key.defaultParams, defaultStr)
				: key.defaultParams || defaultStr;
			defaultStr = key.defaultStr;
			key = key.key;
		} else if (typeof defaultParams !== "undefined") {
			if (typeof defaultParams === "string") {
				defaultParams = Array.prototype.slice.call(arguments, 2);
			}
		}

		return new LocaleString(this._ns + key, defaultStr, defaultParams);
	}

	/**
	 * Creates a new L10n instance for the given namespace
	 * @param {string} namespace Dot separated namespace to be added to the current namespace
	 * @returns {L10n} An L10n instance.
	 */
	namespace(namespace = '') {
		return new L10n(this._ns && namespace
			? this._ns + '.' + namespace
			: this._ns + namespace
		);
	}

	/**
	 * Attaches an event handler function for one or more l10n events.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {EventBus~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this._eventBus.on(this, events, handler, 'l10n');
	}

	/**
	 * Removes an l10n event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {function} [handler] An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this._eventBus.off(this, events, handler, 'l10n');
	}

	/**
	 * Sets locale
	 * @param {string} locale Locale language tag
	 * @fires "l10n.localeUpdate"
	 */
	setLocale(locale) {
		if (locale === this._locale) return;

		// TODO
		// Load the new locale language pack
		this._locale = locale;

		/**
		 * L10N locale update event with the new locale.
		 * @memberof L10n
		 * @event "l10n.localeUpdate"
		 * @type {object}
		 * @property {string} locale Locale language tag of new locale
		 */
		this._eventBus.emit(this, 'l10n.localeUpdate', {
			locale: this._locale
		});
	}

	/**
	 * Checks if a value is and instance of {@link LocaleString}.
	 * @param {*} str
	 */
	isLocaleString(str) {
		return str instanceof LocaleString;
	}
}

export default L10n;