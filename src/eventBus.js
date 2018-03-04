/**
 * A module for a global event bus
 * @module modapp/eventBus
 */

import EventBus from './class/EventBus.js';

/**
 * EventBus instance.
 * @type {EventBus}
 */
let eventBus = new EventBus();

export default eventBus;
