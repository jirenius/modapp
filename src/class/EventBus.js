const rm = function(hs, t, h) {
	if (!hs) {
		return;
	}

	var e, i = hs.length;
	while (i--) {
		e = hs[i];
		if ((t === null || e.t === t) && (h === null || h === e.h)) {
			hs.splice(i, 1);
		}
	}
};

/**
 * Event callback
 * @callback EventBus~eventCallback
 * @param {?object} data Event data object
 * @param {object} target Target object
 * @param {string} event Event name including namespace
 * @param {?string} action Event action. This is the suffix of the event being listened to, or null if listening to the actual event.
 */

/**
 * EventBus is a bus for subscribing to and emitting events.
 */
class EventBus {

	/**
	 * Creates an event bus.
	 */
	constructor() {
		this.evts = {};
		this._queuedHandler = null;
	}

	/**
	 * Attach an event handler function for one or more events.
	 * @param {object} [target] An optional target object. The handler will only be called if target matches the target of the emitted event.
	 * @param {?string} events One or more space-separated events (eg. 'disconnect'). Null or empty means any event.
	 * @param {EventBus~eventCallback} handler A function to execute when the event is emitted.
	 * @param {string} [namespace] Namespace string that will be added, separated with a dot, to every event name. If no events is null, only events with that namespace will be affected.
	 * @returns {this}
	 */
	on(target, events, handler, namespace) {
		var i, hs, name, h;

		// Detect optional parameters
		if (typeof events == 'function') {
			// (events, handler, namespace)
			namespace = handler;
			handler = events;
			events = target;
			target = null;
		}

		if (!handler) {
			return this;
		}

		h = {t: target || null, h: handler};

		if (!events) {
			name = namespace || "";

			hs = this.evts[name];
			if (!hs) {
				this.evts[name] = [h];
			} else {
				hs.push(h);
			}

		} else {
			namespace = namespace ? namespace + '.' : '';

			// Handle multiple events separated by a space
			events = events.match(/\S+/g) || [];

			for (i = 0; i < events.length; i++) {
				name = namespace + events[i];

				hs = this.evts[name];
				if (!hs) {
					this.evts[name] = [h];
				} else {
					hs.push(h);
				}
			}
		}

		return this;
	}

	/**
	 * Remove an event handler.
	 * @param {object} [target] An optional target object. The handler will only be removed if target matches the target of the handler.
	 * @param {?string} events One or more space-separated events (eg. 'disconnect'). Null or empty means any event.
	 * @param {function} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 * @param {string} [namespace] Namespace string that will be added, separated with a dot, to every event name.
	 * @returns {this}
	 */
	off(target, events, handler, namespace) {
		var i, hs, name;

		// Detect optional parameters
		if (target === null || typeof target == 'string') {
			// (events, handler, namespace)
			namespace = handler;
			handler = events;
			events = target;
			target = null;
		}

		if (!events) {
			name = namespace || "";

			hs = this.evts[name];
			// No event handlers for event
			if (!hs) {
				return this;
			}

			rm(hs, target, handler);
			// Delete array if empty
			if (!hs.length) {
				delete this.evts[name];
			}
		} else {
			namespace = namespace ? namespace + '.' : '';

			// Handle multiple events separated by a space.
			events = events.match(/\S+/g) || [];

			for (i = 0; i < events.length; i++) {
				name = namespace + events[i];

				hs = this.evts[name];
				// No event handlers for event
				if (!hs) {
					continue;
				}

				rm(hs, target, handler);
				// Delete array if empty
				if (!hs.length) {
					delete this.evts[name];
				}
			}
		}

		return this;
	}

	/**
	 * Emits an event and triggers the base handler to be called, followed by any other handler bound.
	 * @param {object} [target] Target object of the event
	 * @param {string} event Name of the event. May include the namespace, if the namespace parameter is not provided.
	 * @param {object} [data] Event data object. May be modified by the base handler, but shouldn't be changed any other handler.
	 * @param {string} [namespace] Namespace string that will be added, separated with a dot, before the event name.
	 * @returns {this}
	 */
	emit(target, event, data, namespace) {
		var i, hs, h, sub, action;

		// Detect optional parameters
		if (typeof target == 'string') {
			// (events, data, namespace)
			namespace = data;
			data = event;
			event = target;
			target = null;
		}

		event = (namespace ? namespace + '.' : '') + event;
		sub = event;

		while (true) {
			hs = this.evts[sub];

			if (hs) {
				action = (sub ? event.substr(sub.length + 1) : event) || null;
				i = hs.length;
				while (i--) {
					h = hs[i];
					if (h.t === null || h.t == target) {
						this._executeHandler([data, target, event, action, h.h]);
					}
				}
			}

			if (!sub) {
				break;
			}

			// Remove last namespace part
			i = sub.lastIndexOf('.');
			sub = i == -1 ?  "" : sub.substr(0, i);
		}

		return this;
	}

	_executeHandler(cb) {
		if (this._queuedHandler) {
			this._queuedHandler.push(cb);
			return;
		}

		this._queuedHandler = [cb];

		setTimeout(() => {
			let f;
			while (cb = this._queuedHandler.shift()) {
				f = cb.pop();
				f(...cb);
			}
			this._queuedHandler = null;
		}, 0);
	}
}

export default EventBus;