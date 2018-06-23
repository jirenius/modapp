/**
 * A thin framework for building completely modular web applications.
 * @module modapp
 */
export { default as App } from './class/App.js';
export { default as AppExt } from './class/AppExt.js';
export { default as EventBus } from './class/EventBus.js';
export { default as eventBus } from './eventBus.js';

// Interfaces
import './interface/AppModule.js';
import './interface/Component.js';
import './interface/Model.js';
import './interface/Collection.js';
import './interface/Readyable.js';
