/**
 * A collection object<br>
 * * must be iterable.<br>
 * * any method starting with underscore (_) is to be considered private.<br>
 * * may have public methods.<br>
 * * mutation of the collection must trigger 'add' or 'remove' event to reflect the changes.
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols|Iteration protocols}
 * @interface Collection
 * @property {number} length Number of items in the collection.
 */

/**
 * Add event data
 * @typedef {object} Collection~addEvent
 * @property {*} item Collection item being added.
 * @property {number} idx Index where item was added.
 */

/**
 * Add event emitted on any item being added to the collection.
 * @callback Collection~addCallback
 * @param {Collection~addEvent} event Add event data.
 * @param {Collection} collection Collection emitting event.
 */

/**
 * Remove event data
 * @typedef {object} Collection~removeEvent
 * @property {*} item Collection item being removed.
 * @property {number} idx Index from where the item was removed.
 */

/**
 * Remove event emitted on any item being added to the collection.
 * @callback Collection~removeCallback
 * @param {Collection~removeEvent} event Remove event data.
 * @param {Collection} collection Collection emitting event.
 */

/**
 * Adds a callback handler for add or remove events.
 * @function
 * @name Collection#on
 * @param {string} event Event topic. Only defined Collection topics are 'add' and 'remove'.
 * @param {Collection~addCallback|Collection~removeCallback} handler Callback handler.
 */

/**
 * Removes a callback handler for add or remove events.
 * @function
 * @name Collection#off
 * @param {string} event Event topic. Only defined Collection topics are 'add' and 'remove'.
 * @param {Collection~addCallback|Collection~removeCallback} [handler] Change callback handler used when calling on.
 */

/**
 * Returns the value at the given index
 * @function
 * @name Collection#atIndex
 * @param {number} index Index number, zero-based.
 * @returns {*} Value at the given index
 */
