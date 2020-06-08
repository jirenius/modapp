/**
 * A thin framework for building completely modular web applications.
 * @module modapp
 */

import { default as eventBus, EventBus } from 'modapp-eventbus';

export { default as App } from './class/App.js';
export { default as AppExt } from './class/AppExt.js';
export { eventBus, EventBus };

// Interfaces
import './interface/AppModule.js';
import './interface/Component.js';
import './interface/Model.js';
import './interface/Collection.js';
import './interface/Readyable.js';
