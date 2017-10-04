/**
 * Locale string storing the string key and the default string.<br>
 * Use {@link class/L10n#l} to create new instances instead as it will ensure
 * the LocaleString key is prefixed with the correct namespace.
 */
class LocaleString {

	/**
	 * Creates a LocaleString
	 *
	 * @param {string} key Key id of string to translate.
	 * @param {string} defaultStr Default string translation.
	 * @param {object} [defaultStr] Default string translation parameters.
	 */
	constructor(key, defaultStr, defaultParams) {
		this.key = key;
		this.defaultStr = defaultStr;
		this.defaultParams = defaultParams;
	}
}

export default LocaleString;