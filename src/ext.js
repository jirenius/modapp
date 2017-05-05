/**
 * A thin framework for building completely modular web applications.
 * @module modapp/ext
 */

import appExt from './class/AppExt.js';

// Interface
import './interface/AppModule.js';
import './interface/Component.js';
import './interface/Readyable.js';

/**
 * App class.
 * @type {AppExt}
 */
let AppExt = appExt;

export {AppExt};