import L10n from '../class/L10n.js';
import eventBus from './eventBus.js';

/**
 * Global L10n instance using the global eventBus.
 * @type {L10n}
 */
const l10n = new L10n(eventBus);

export default l10n;