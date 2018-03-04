/**
 * A thin framework for building completely modular web applications.
 * @module modapp
 */

import app from './class/App.js';

// Interface
import './interface/AppModule.js';
import './interface/Component.js';
import './interface/Model.js';
import './interface/Collection.js';
import './interface/Readyable.js';

/**
 * App class.
 * @type {App}
 */
let App = app;

export { App };
