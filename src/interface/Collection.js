/**
 * A collection object<br>
 * * must be iterable.<br>
 * * any method starting with underscore (_) is to be considered private.<br>
 * * may have public methods.<br>
 * * mutation of the collection must trigger 'add' or 'remove' event to reflect the changes.
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols|Iteration protocols}
 * @interface interface/Collection
 * @property {number} length Number of items in the collection.
 */

/**
 * Add event data
 * @typedef {object} interface/Collection~addEvent
 * @property {*} item Collection item being added.
 * @property {number} idx Index where item was added.
 */

/**
 * Add event emitted on any item being added to the collection.
 * @callback interface/Collection~addCallback
 * @param {interface/Collection~addEvent} event Add event data.
 * @param {interface/Collection} collection Collection emitting event.
 */

/**
 * Remove event data
 * @typedef {object} interface/Collection~removeEvent
 * @property {*} item Collection item being removed.
 * @property {number} idx Index from where the item was removed.
 */

/**
 * Remove event emitted on any item being added to the collection.
 * @callback interface/Collection~removeCallback
 * @param {interface/Collection~removeEvent} event Remove event data.
 * @param {interface/Collection} collection Collection emitting event.
 */

/**
 * Adds a callback handler for add or remove events.
 * @function
 * @name interface/Collection#on
 * @param {string} event Event topic. Only defined Collection topics are 'add' and 'remove'.
 * @param {interface/Collection~addCallback|interface/Collection~removeCallback} handler Callback handler.
 */

/**
 * Removes a callback handler for add or remove events.
 * @function
 * @name interface/Collection#off
 * @param {string} event Event topic. Only defined Collection topics are 'add' and 'remove'.
 * @param {interface/Collection~addCallback|interface/Collection~removeCallback} [handler] Change callback handler used when calling on.
 */

/**
 * Returns the value at the given index
 * @function
 * @name interface/Collection#atIndex
 * @param {number} index Index number, zero-based.
 * @returns {*} Value at the given index
 */
