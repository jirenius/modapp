/**
 * A module for localization
 * @module modapp/l10n
 */

import L10n from '../class/L10n.js';
import eventBus from '../eventBus';

/**
 * L10n instance using the {@link module:modapp/eventBus} to emit locale changes.
 * @type {L10n}
 */
let l10n = new L10n(eventBus);

export default l10n;