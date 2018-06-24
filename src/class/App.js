import ModuleInstance from './ModuleInstance.js';
import { uri } from 'modapp-utils';

/**
 * Require callback
 * @callback App~requireCallback
 * @param {Object.<string,AppModule>} modules A key/value object with keys being the module names and the value being the app module instance.
 */

/**
 * Module class callback
 * @callback App~moduleClassCallback
 * @param {string} moduleName Name of the module
 * @returns {Promise.<Class,Error>} Returns promise of the {@link AppModule} class.
 */

/**
 * Load app module results
 * @typedef {object} App~loadResults
 * @property {Object.<string,AppModule>} modules A key/value object where the key is the module name and the value is the app module instance.
 * @property {?Object.<string,Error>} errors A key/value object where the key is the module name and the value is the error when trying to load the module. Null means there are no errors.
 */

/**
 * A modular app container loading, storing, and linking app modules together.
 */
class App {

	/**
	 * Creates an App instance.<br>
	 * The optional module configuration may be overridden using the url query.<br>
	 * Eg. "?login.auto=true" would pass {auto: "true"} as parameter to the login app module.
	 * If a module configuration has the property "active" set to the strings "false", "no",
	 * or "0", or has value false or 0, it will automatically be deactivated on load.
	 * @param {Object.<string,object>} [moduleConfig] App module configuration key-value object where the key is the name of the module and the value is the parameters passed to the module on creation.
	 * @param {object} [opt] App configuration
	 * @param {App~moduleClassCallback} [opt.moduleClass] Callback for fetching the {@link AppModule} class for a given module name.
	 * @param {string} [opt.queryNamespace] Namespace prefix for query params. Eg. 'mod' for ?mod.login.auto=true . Defaults to no namespace.
	 */
	constructor(moduleConfig, opt = {}) {
		// Module configuration
		this._moduleConfig = moduleConfig || {};
		this._query = uri.getQuery(opt.queryNamespace || null);
		this._moduleClassCallback = opt.moduleClass || null;

		// Module storage
		this._module = {}; // Holds all ModuleInstances
		this._moduleClass = {}; // Holds all AppModule classes

		// Require
		this._catchRequire = false; // Holds required modules
		this._require = null;
	}

	/**
	 * Loads an app module bundle, creating an explicit instance of each app module class.<br>
	 * If a moduleClass already exist for a given name, loadBundle will dispose the previously
	 * loaded version and replace it with a new instance.
	 * The returned promise will always resolve.
	 * @param {Object.<string, Class>} bundle A key/value object where the key is the module name and the value is the app module class.
	 * @returns {Promise.<App~loadResults>} Promise of the load results. Will always resolve.
	 */
	loadBundle(bundle) {
		var i, modName, modNames = Object.keys(bundle);

		// Put all module classes in _moduleClass cache
		for (i = 0; i < modNames.length; i++) {
			modName = modNames[i];
			if (this._moduleClass[modName]) {
				throw new Error(`Module ${modName} already in cache. Handling not implemented yet`);
			}

			this._moduleClass[modName] = bundle[modName];
		}

		return this.loadModules(modNames);
	}

	/**
	 * Loads a set of modules, creating an instance for each if there is none, fetching the module
	 * class from the server if needed.
	 * @param {Array.<string>} moduleNames An array of module names
	 * @returns {Promise.<App~loadResults>} Promise of the load results. Will always resolve.
	 */
	loadModules(moduleNames) {
		return this._loadInstances(moduleNames)
			.then(this._toLoadResults);
	}

	/**
	 * Gets a loaded and active module.
	 * @param {string} moduleName Name of the module
	 * @returns {object} Module instance, or undefined if it is not loaded and active.
	 */
	getModule(moduleName) {
		let modInst = this._module[moduleName];
		return modInst && modInst.state == 'ready'
			? modInst.instance
			: undefined;
	}

	/**
	 * Converts an array of ModuleInstance's to an {@link App~loadResults} object.
	 * @param {Array.<ModuleInstance>} modInsts Array of ModuleInstance objects.
	 * @returns {App~loadResults} Load results object.
	 * @private
	 */
	_toLoadResults(modInsts) {
		let modules = {}, errors = null;
		for (let i = 0, modInst; (modInst = modInsts[i]); i++) {
			if (modInst.error) {
				errors = errors || {};
				errors[modInst.name] = modInst.error;
			} else {
				modules[modInst.name] = modInst.instance;
			}
		}

		return { modules, errors };
	}

	/**
	 * Deactivates a previously loaded (explicitly or implicitly through require) module,
	 * and disposes its instance. Any recursivly dependant module will also be disposed along
	 * with any implicitly loaded module with all its dependants being disposed.
	 * @param {string} moduleName Name of module to deactivate
	 */
	deactivate(moduleName) {
		let modInst = this._module[moduleName];
		if (!modInst) {
			throw new Error(`Module ${moduleName} is not loaded.`);
		}

		this._disposeInstance(modInst, 'deactivated');
	}

	/**
	 * Activates a previously deactivated module by creating a new module instance.<br>
	 * Any other module that has been blocked loading due to being dependant upon the
	 * deactivated module, will also be loaded.
	 * @param {string} moduleName Name of module to activate.
	 * @returns {Promise.<AppModule, Error>} Promise of the app module.
	 */
	activate(moduleName) {
		let modInst = this._module[moduleName];
		if (!modInst || modInst.state !== 'deactivated') {
			throw new Error(`Module ${moduleName} is not deactivated.`);
		}

		return this._reloadInstance(modInst);
	}

	/**
	 * Reloads an instance and any module blocked by it.
	 * @param {ModuleInstance} modInst Module instance
	 * @returns {Promise.<AppModule, Error>} Promise of the app module.
	 * @private
	 */
	_reloadInstance(modInst) {
		if (modInst.state == 'ready') {
			return Promise.resolve(modInst.instance);
		}

		return this._getModuleClass(modInst.name)
			.catch(err => {
				modInst.setState('unavailable', err);
				return Promise.reject(modInst.error);
			})
			.then(modClass => {
				let params = this._getModuleParams(modInst.name);
				return this._createInstance(modInst, modClass, params, []);
			})
			.then(modInst => {
				if (modInst.error) {
					return Promise.reject(modInst.error);
				}

				// Take the blocked dependants and try to reload them
				let deps = modInst.dependants;
				let promises = [];
				modInst.dependants = [];
				for (var i = 0; i < deps.length; i++) {
					promises.push(this._reloadInstance(this._module[deps[i]]));
				}

				// Wait with resolving until all dependants have loaded.
				// Why? To allow proper testing that dependants did load.
				return Promise.all(promises)
					.then(() => modInst.instance)
					.catch(() => modInst.instance);
			});
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Checks if the provided module class is different from the one loaded, and if it is,
	 * disposes the previously loaded version and replace it with a new instance.<br>
	 * If no module class is provided, update will try fetching the module class from the server.
	 * @param {string} moduleName Name of the module to update
	 * @param {Class.<AppModule>} [moduleClass] Optional module class.
	 * returns {Promise.<AppModule, Error>} Promise of the app module instance.
	 */
	update(moduleName, moduleClass = null) {
		throw new Error("Not implemented");
	}

	/**
	 * Requires an app module or a set of app modules.<br>
	 * May only be called within an app module [constructor]{@link AppModule#constructor}.<br>
	 * If a required module has not yet been loaded, an instance of if will be created
	 . If any of the required modules cannot be created,
	 * the returned promise will be rejected, and the module that called the require will not
	 * be loaded.<br>
	 * If any modules that has been created during this call also calls {@link App#require}
	 * within their constructors, those require requests will be queued to be handled after
	 * all modules on the initial request has been loaded.
	 * @param {string|Array.<string>} moduleNames The name of a module, or an array of module names
	 * @param {App~requireCallback} callback Require callback on success
	 * @returns {this}
	 */
	require(moduleNames, callback) {
		// Check if call doesn't origin from module creation inside of App
		if (!this._catchRequire) {
			throw new Error("App.require may only be called from an AppModule's constructor when created by the App.");
		}

		if (moduleNames && moduleNames.length) {
			this._require = { moduleNames, callback };
		} else {
			callback({});
		}

		return this;
	}

	/**
	 * Loads a list of modules.
	 * @param {Array.<string>} modNames Array of module names to load
	 * @param {string} [loadedBy] Name of module loading the instances. Defaults to null.
	 * @returns {Promise.<Array.<ModuleInstance>>} Promise of the ModuleInstance array. Will always resolve.
	 * @private
	 */
	_loadInstances(modNames, loadedBy = null) {
		// Quick escape
		if (!modNames || !modNames.length) {
			return Promise.resolve([]);
		}

		let promises = [];
		for (let i = 0; i < modNames.length; i++) {
			promises.push(this._loadInstance(modNames[i], loadedBy));
		}

		return Promise.all(promises);
	}

	/**
	 * Loads a module instance. If the module has not been loaded previously, a new instance will
	 * be created.
	 * @param {string} modName Name of the module.
	 * @param {string} [loadedBy] Name of module loading the instance.
	 * @returns {Promise.<ModuleInstance>} A promise of the module instance. Will always resolve.
	 * @private
	 */
	_loadInstance(modName, loadedBy) {
		let checkActiveFlag = true;

		// Check if module is loading
		let modInst = this._module[modName];
		if (modInst) {
			if (modInst.state === 'passive') {
				modInst.setState('loading');
				checkActiveFlag = false;
			}
		} else {
			modInst = new ModuleInstance(modName);
			this._module[modName] = modInst;
		}

		if (loadedBy) {
			modInst.addDependant(loadedBy);
		} else {
			modInst.setExplicit();
		}

		if (!modInst.promise) {
			modInst.promise = this._getModuleClass(modName)
				.then(modClass => {
					let params = this._getModuleParams(modInst.name);

					// Check if module defaults to being deactivated
					if (checkActiveFlag && !this._isTrue(params.active)) {
						modInst.setState('deactivated');
						return modInst;
					}

					return this._createInstance(modInst, modClass, params);
				})
				.catch(err => {
					modInst.setState('unavailable', err);
					return modInst;
				});
		}

		return modInst.promise;
	}

	/**
	 * Gets a module class from the cache, or fetches it using
	 * @param {string} modName Name of the module.
	 * @returns {Promise.<Class, Error>} Promise of a AppModule class.
	 * @private
	 */
	_getModuleClass(modName) {
		// Check if module is already loaded
		let modClass = this._moduleClass[modName];
		if (modClass) {
			return Promise.resolve(modClass);
		}

		// Check if we have a callback to get it with
		if (this._moduleClassCallback) {
			// Get the class. We don't cache the promise
			// as we expect only one call per module instance
			return this._moduleClassCallback(modName)
				.then(modClass => {
					this._moduleClass[modName] = modClass;
					return modClass;
				});
		}

		return Promise.reject(new Error("No module class callback available."));
	}

	/**
	 * Tries to create an instance of a module
	 * @param {ModuleInstance} modInst Module instance object
	 * @param {Class.<AppModule>} modClass AppModule class
	 * @param {object} params Parameters to pass to modClass.
	 * @returns {Promise.<ModuleInstance>} A promise of the module instance. Will always resolve.
	 * @private
	 */
	_createInstance(modInst, modClass, params) {
		// Create new module instance
		this._catchRequire = true;
		try {
			modInst.instance = new modClass(this, params);
		} catch (ex) {
			modInst.setState('error', ex);
			return Promise.resolve(modInst);
		}
		this._catchRequire = false;

		// Quick escape if module had no dependencies
		if (!this._require) {
			modInst.setState('ready');
			return Promise.resolve(modInst);
		}

		// Store away the caught require
		let require = this._require;
		this._require = null;

		// Set requires
		modInst.setRequires(require.moduleNames);
		modInst.setState('require');

		// Check for circular dependencies
		try {
			this._checkCircularRef(modInst);
		} catch (ex) {
			modInst.setState('circularDependency', ex);
			return Promise.resolve(modInst);
		}

		// Load required modules
		return this._loadInstances(
			modInst.requires,
			modInst.name
		).then(modInsts => {
			let result = this._toLoadResults(modInsts);

			if (result.errors) {
				modInst.setState('blocked', result.errors);
				// Clean up any implicitly loaded module
				this._cleanImplicits(Object.keys(result.modules));
			} else {
				modInst.setState('ready');

				try {
					// Store error in a context that can be thrown later
					require.callback(result.modules);
				} catch (ex) {
					// Defer throwing the exception
					if (ex) {
						setTimeout(() => { throw ex; });
					}
				}
			}
			return modInst;
		});
	}

	/**
	 * Goes through a module instance's dependencies
	 * and removes itself. If a dependency is loaded implicitly
	 * and has no other dependants, it is disposed.
	 * @param {Array.<string>} modNames Module names to clean.
	 * @private
	 */
	_cleanImplicits(modNames) {
		for (let i = 0; i < modNames.length; i++) {
			var modInst = this._module[modNames[i]];
			this._cleanImplicit(modInst);
		}
	}

	/**
	 * Checks if a module instance is implicit and disposes it
	 * if it has no active dependants.
	 * @param {ModuleInstance} modInst Module instance
	 * @private
	 */
	_cleanImplicit(modInst) {
		if (modInst.explicit) return;

		let d = modInst.dependants;
		for (let i = 0; i < d.length; i++) {
			if (this._module[d[i]].isActive()) {
				return;
			}
		}

		this._disposeInstance(modInst, 'passive');
	}

	/**
	 * Disposes a module instance and all of its dependencies
	 * @param {ModuleInstance} modInst Module instance to dispose
	 * @param {string} state State reason for disposal. Must be 'blocked', 'passive', or 'deactivated'.
	 * @private
	 */
	_disposeInstance(modInst, state) {
		// Do nothing with instance if deactivated
		if (modInst.state === 'deactivated') return;

		let instance = modInst.instance;

		if (state === 'blocked') {
			let blockedBy = {};
			for (let i = 0; i < modInst.requires.length; i++) {
				let depInst = this._module[modInst.requires[i]];
				if (depInst.error) {
					blockedBy[depInst.name] = depInst.error;
				}
			}

			modInst.setState('blocked', blockedBy);
		} else {
			modInst.setState(state);
		}

		// Has the instance already been disposed?
		if (!instance) return;

		// Dispose any dependants
		for (let i = 0; i < modInst.dependants.length; i++) {
			var depName = modInst.dependants[i];
			this._disposeInstance(this._module[depName], 'blocked');
		}

		// Dispose instance
		if (instance.dispose) {
			instance.dispose();
		}

		this._cleanImplicits(modInst.requires);
	}


	/**
	 * Checks if value is true. Returns true unless the value is any of the following:<br>
	 * * A boolean false<br>
	 * * A string with the case-insensitive value of 'false', '0' or 'no'<br>
	 * * A number with the value of 0<br>
	 * @param {*} v Value
	 * @returns {boolean}
	 * @private
	 */
	_isTrue(v) {
		switch (typeof v) {
			case 'boolean': return v;
			case 'number': v = v.toString();
			case 'string':
				v = v.toLowerCase();
				if (v == 'false' || v == '0' || v == 'no') {
					return false;
				}
				break;
		}

		return true;
	}

	/**
	 * Returns module parameters based on configuration and query values for given module name
	 * @param {string} modName Name of module
	 * @returns {object} Configuration object
	 * @private
	 */
	_getModuleParams(modName) {
		// Query based params has priority over configuration provided on App creation
		return Object.assign({}, this._moduleConfig[modName], this._query[modName]);
	}

	/**
	 * Checks for circular references by traversing the require tree
	 * for all modules in 'require' state.
	 * @param {ModuleInstance} modInst Module instance to check
	 * @param {Array.<string>} [chain] Require chain
	 * @private
	 */
	_checkCircularRef(modInst, chain = []) {
		let m, req = modInst.requires;
		chain.push(modInst.name);

		if (req.indexOf(chain[0]) > -1) {
			throw chain;
		}

		for (let i = 0; i < req.length; i++) {
			m = this._module[req[i]];
			if (m && m.state === 'require') {
				this._checkCircularRef(m, chain);
			}
		}
	}
}

export default App;
