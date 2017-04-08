import eventBus from '../func/eventBus.js';
import * as uri from '../func/uri.js';

/**
 * A modular app container loading, storing, and linking app modules together.
 * @implements {Component}
 */
class App {

	/**
	 * Creates an App instance.<br>
	 * The optional module configuration may be overridden using the url query.<br>
	 * Eg. "?login.auto=true" would pass {auto: "true"} as parameter to the login app module.
	 * @param {Object.<string,object>} [moduleConfig] App module configuration key-value object where the key is the name of the module and the value is the parameters passed to the module on creation.
	 */
	constructor(moduleConfig) {
		this._moduleConfig = moduleConfig || {};

		// TODO Allow custom eventBus to be passed as argument
		this._eventBus = eventBus;

		this._module = {};
		this._moduleClass = null;
		this._component = null;
		this._query = uri.getQuery();
		this._queue = null;
		this._el = null;
	}

	/**
	 * The event bus used by the App. By default it uses {@link eventBus}.
	 */
	get eventBus() {
		return this._eventBus;
	}

	/**
	 * Attach an event handler function for one or more app events.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {EventBus~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.event.on(this, events, handler, 'app');
	}

	/**
	 * Remove an app event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {function} [handler] An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.event.off(this, events, handler, 'app');
	}

	/**
	 * Renders the component set with {@link App#setComponent}
	 * @param {HTMLElement|DocumentFragment} el Parent element in which to render the contents.
 	 * @returns {this}
 	 */
	render(el) {
		this._el = el;
		this._renderScreen();
		return this;
	}

	/**
	 * Loads an app module bundle, creating an instance of each app module class.<br>
	 * @param {Object.<string,Class.<AppModule>>} modules A key/value object where the key is the module name and the value is the app module class.
	 * @returns {Promise.<Object.<string,AppModule>>} Promise of a key/value object where the key is the module name and the value is the app module instance.
	 */
	loadModules(modules) {
		this._moduleClass = {};

		for (let key in modules) {
			if (!modules.hasOwnProperty(key)) continue;

			if (this._module[key]) {
				console.warn("Module already loaded: ", key);
				continue;
			}

			this._moduleClass[key] = modules[key];
		}		

		let promise = this.require(Object.keys(this._moduleClass));
		
		this._moduleClass = null;

		return promise;
	}

	/**
	 * Requires an app module or a set of app modules.<br>
	 * May only be called within an app module [constructor]{@link AppModule#constructor}.<br>
	 * If a required module has not yet been loaded, an instance of if will be created
	 * as long as its class is available. If any of the required modules cannot be created,
	 * the returned promise will be rejected, and the module that called the require will not
	 * be loaded.<br>
	 * If any modules that has been created during this call also calls {@link App#require}
	 * within their constructors, those require requests will be queued to be handled after
	 * all modules on the initial request has been loaded.
	 * @param {string|Array.<string>} moduleNames The name of a module, or an array of module names
	 * @returns {Promise.<Object.<string,AppModule>>} Promise of a key/value object with keys being the module names and the value being the app module instances.
	 */
	require(moduleNames) {
		if( !moduleNames ) return Promise.resolve({});

		return new Promise(this._requireExec.bind(this, moduleNames));
	}

	/** @private */
	_requireExec(moduleNames, resolve, reject) {
		// Is a require call in progress of creating module instances?
		if( this._queue ) {
			// Queue this call for later
			this._queue.push([moduleNames, resolve, reject]);
			return;
		}
		this._queue = [];

		if( typeof moduleNames == 'string' ) {
			moduleNames = [moduleNames];
		}

		// TODO Implement ModApp option to use a namespace for query module config
		let modParams = this._query || {};

		let modules = {};

		moduleNames.forEach(modName => {
			let mod = this._module[modName];

			if( !mod ) {
				let modClass = this._moduleClass ? this._moduleClass[modName] : null;
				if( !modClass ) throw "Module " + modName + " not found";

				// Query based params has priority over configuration provided on ModApp creation
				let params = Object.assign({}, this._moduleConfig[modName], modParams[modName]);
				
				mod = new modClass(this, params);
				this._module[modName] = mod;
				console.log("[Module load] " + modName);
			}

			modules[modName] = mod;
		});

		// Call queued require requests
		let q = this._queue;
		this._queue = null;
		q.forEach( args => this._requireExec.apply(this, args) );

		resolve(modules);
	}

	/**
	 * Sets the app component and renders it if the app is rendered.<br>
	 * Usually called by the app module responsible for displaying the initial
	 * loading screen, the login screen, or the overall layout.
	 * @param {Component} component Component to set.
	 */
	setComponent(component) {
		if (!this._el) {
			this._component = component;
			return;
		}

		// Has the component changed?
		if (component === this._component) return;

		if (this._component) {
			this._component.unrender();
		}

		this._component = component;
		this._renderScreen();
	}

	/**
	 * Check if a component has been set.
	 * @returns {boolean} True if a component has been set, otherwise false
	 */
	hasComponent() {
		return this._component ? true : false;
	}

	/** @private */
	_renderScreen() {
		if( !this._el || !this._component ) return;

		this._component.render(this._el);
	}
}

export default App;