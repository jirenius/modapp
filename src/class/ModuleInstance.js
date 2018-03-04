// Errors
import BlockedError from '../error/BlockedError.js';
import CircularDependencyError from '../error/CircularDependencyError.js';
import UnavailableError from '../error/UnavailableError.js';
import DeactivatedError from '../error/DeactivatedError.js';
import UnknownError from '../error/UnknownError.js';

/**
 * An app module instance
 * @private
 */
class ModuleInstance {

	constructor(name) {
		this.name = name;
		this.instance = null;
		this.requires = [];
		this.dependants = [];
		this.explicit = false;
		this.error = null;

		this.setState('loading');
	}

	setRequires(moduleNames) {
		this.requires = moduleNames;
	}

	addDependant(moduleName) {
		if (this.dependants.indexOf(moduleName) === -1) {
			this.dependants.push(moduleName);
		}
	}

	setState(state, param) {
		switch (state) {
		// Initial loading. Promise has not yet resolved
			case 'loading':
				this.promise = null;
				// Module is ready and this.instance is set
			case 'ready':
			case 'require':
				this.error = null;
				break;
				// Module is deactivated
			case 'deactivated':
				this.error = new DeactivatedError(this.name);
				break;
				// Module is blocked one or more modules. Param is a blockedBy object
			case 'blocked':
				this.error = new BlockedError(this.name, param);
				break;
				// Module class is unavailable. Param is the error reason.
			case 'unavailable':
				this.error = new UnavailableError(this.name, param);
				break;
				// Module has a circular dependency
			case 'circularDependency':
				this.error = new CircularDependencyError(this.name, param);
				break;
				// Module couldn't load due to an error (most likely in module constructor). Param is the error.
			case 'error':
				this.error = new UnknownError(this.name, param);
				break;
				// Module is implicit without any dependants.
			case 'passive':
				this.error = null;
				this.instance = null;
				break;
		}

		if (this.error) {
			this.instance = null;
		}

		this.state = state;
		return this;
	}

	isActive() {
		return this.state === 'loading' ||
			this.state === 'require' ||
			this.state === 'ready';
	}

	/**
	 * Sets module instance as explicitly loaded.<br>
	 * This prevents the module from being unloaded
	 * when it no longer has any dependants.
	 */
	setExplicit() {
		this.explicit = true;
	}
}

export default ModuleInstance;
