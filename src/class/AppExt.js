// Classes
import App from './App.js';
import eventBus from 'modapp-eventbus';

/**
 * EventBus is a bus for subscribing to and emitting events.
 * @external EventBus
 * @see {@link https://github.com/jirenius/modapp-eventbus/blob/master/docs/docs.md#EventBus|modapp-eventbus}
 */

/**
 * Event callback
 * @callback AppExt~eventCallback
 * @param {?object} data Event data object
 * @param {AppExt} target Target AppExt object
 * @param {string} event Event name including namespace
 */

/**
 * A modular app container that extends {@link App} and adds an eventBus
 * in addition to implement the {@link Component} interface.
 * @implements {Component}
 */
class AppExt extends App {

	/**
	 * Creates an extended App instance.<br>
	 * The optional module configuration may be overridden using the url query.<br>
	 * Eg. "?login.auto=true" would pass {auto: "true"} as parameter to the login app module.
	 * If a module configuration has the property "active" set to the strings "false", "no",
	 * or "0", or has value false or 0, it will automatically be deactivated on load.
	 * @param {Object.<string,object>} [moduleConfig] App module configuration key-value object where the key is the name of the module and the value is the parameters passed to the module on creation.
	 * @param {object} [opt] App configuration
	 * @param {App~moduleClassCallback} [opt.moduleClass] Callback for fetching the {@link AppModule} class for a given module name.
	 * @param {string} [opt.queryNamespace] Namespace prefix for query params. Eg. 'mod' for ?mod.login.auto=true . Defaults to no namespace.
	  * @param {EventBus} [opt.eventBus] Event bus.
	 * @param {string} [opt.eventBusNamespace] Namespace prefix for the event bus. Defaults to 'app'.
	 */
	constructor(moduleConfig, opt = {}) {
		super(moduleConfig, opt);

		// Module configuration
		this._eventBus = opt.eventBus || eventBus;
		this._eventBusNamespace = opt.eventBusNamespace || 'app';
	}

	/**
	 * The event bus used by the AppExt
	 */
	get eventBus() {
		return this._eventBus;
	}

	/**
	 * Attach an event handler function for one or more app events.<br>
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {AppExt~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this._eventBus.on(this, events, handler, this._eventBusNamespace);
	}

	/**
	 * Remove an app event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {AppExt~eventCallback} [handler] An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this._eventBus.off(this, events, handler, this._eventBusNamespace);
	}

	/**
	 * Sets the screen component and renders it if the screen is rendered.<br>
	 * Usually called by the app module responsible for displaying the initial
	 * loading screen, the login screen, or the overall layout.
	 * @param {Component} component Component to set.
	 */
	setComponent(component) {
		component = component || null; // Ensure falsy values are cast to null

		// Has the component changed?
		if (component === this._component) return;

		if (!this._el) {
			this._component = component;
			return;
		}

		// Unrender if we have a component and it is rendered
		if (this._component) {
			this._component.unrender();
		}

		this._component = component;
		this._renderScreen();
	}

	/**
	 * Unsets a component if it matches the one set
	 * @param {Component} component Component to unset
	 */
	unsetComponent(component) {
		if (component === this._component) {
			this.setComponent(null);
		}
	}

	/**
	 * Check if a component has been set.
	 * @returns {boolean} True if a component has been set, otherwise false
	 */
	hasComponent() {
		return this._component ? true : false;
	}

	/**
	 * Renders the component set with setComponent()
	 * @param {HTMLElement|DocumentFragment} el Parent element in which to render the contents.
 	 * @returns {this}
 	 */
	render(el) {
		this._el = el;
		this._renderScreen();
		return this;
	}

	/**
	 * Unrenders the app
	 */
	unrender() {
		if (!this._el) return;
		if (this._component) {
			this._component.unrender();
		}

		this._el = null;
	}

	/**
	 * Renders the set component
	 * @private
	 */
	_renderScreen() {
		if (this._el && this._component) {
			this._component.render(this._el);
		}
	}
}

export default AppExt;
