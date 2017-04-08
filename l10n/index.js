'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _L10n = require('../class/L10n.js');

var _L10n2 = _interopRequireDefault(_L10n);

var _eventBus = require('../eventBus');

var _eventBus2 = _interopRequireDefault(_eventBus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * L10n instance using the {@link module:modapp/eventBus} to emit locale changes.
 * @type {L10n}
 */
/**
 * A module for localization
 * @module modapp/l10n
 */

var l10n = new _L10n2.default(_eventBus2.default);

exports.default = l10n;