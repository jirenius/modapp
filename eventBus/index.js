'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _EventBus = require('../class/EventBus.js');

var _EventBus2 = _interopRequireDefault(_EventBus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * EventBus instance.
 * @type {EventBus}
 */
var eventBus = new _EventBus2.default(); /**
                                          * A module for a global event bus
                                          * @module modapp/eventBus
                                          */

exports.default = eventBus;