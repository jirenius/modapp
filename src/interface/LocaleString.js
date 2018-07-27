/**
 * A locale string object that can be translated.
 * @interface LocaleString
 */

/**
 * Locale update event emitted on update of the locale.
 * @callback LocaleString~localeUpdateCallback
 * @param {string} locale Locale language tag of new locale.
 */

/**
 * Translates a callback handler for change events.
 * @function
 * @name LocaleString#translate
 * @param {...*} var_args Arguments for value placeholders. Defined by the implementation.
 * @returns {string} Translated string.
 */

/**
 * Gets the current locale language tag. Eg. 'en', 'pt-BR', etc.
 * @function
 * @name LocaleString#getLocale
 * @returns {string} Locale language tag.
 */

/**
 * Adds a callback handler for change events.
 * @function
 * @name LocaleString#on
 * @param {string} event Event topic. Only defined LocaleString topic is 'localeUpdate'.
 * @param {LocaleString~localeUpdateCallback} handler Locale update callback handler.
 */

/**
 * Removes a callback handler for change events.
 * @function
 * @name LocaleString#off
 * @param {string} event Event topic. Only defined LocaleString topic is 'localeUpdate'.
 * @param {LocaleString~localeUpdateCallback} [handler] Locale update callback handler used when calling on.
 */
