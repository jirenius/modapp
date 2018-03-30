/**
 * A model object<br>
 * * properties are to be considered read-only, and should not be mutated directly.<br>
 * * any property or method starting with underscore (_) is to be considered private.<br>
 * * may have public methods that may mutate properties.<br>
 * * mutation of one or more properties must trigger a 'change' event.
 * @interface Model
 */

/**
 * Change event emitted on any change to one or more public (non-underscore) properties.
 * @callback Model~changeCallback
 * @param {Object.<string,*>} changed Changed key/value object where key is the changed property, and value is the old property value.
 * @param {Model} model Model emitting the event
 */

/**
 * Adds a callback handler for change events.
 * @function
 * @name Model#on
 * @param {string} event Event topic. Only defined Model topic is 'change'.
 * @param {Model~changeCallback} handler Change callback handler.
 */

/**
 * Removes a callback handler for change events.
 * @function
 * @name Model#off
 * @param {string} event Event topic. Only defined Model topic is 'change'.
 * @param {Model~changeCallback} [handler] Change callback handler used when calling on.
 */
