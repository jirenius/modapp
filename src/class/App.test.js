import App from './App.js';

describe('App', () => {

	let app;
	let mod;
	let insts;
	let ex;
	let modClass;
	let modClassQueue;
	let modClassPos;
	let resolveExplicitly = true;

	const setModuleClasses = function(arr, resolveExpl = true) {
		modClass = arr;
		resolveExplicitly = resolveExpl;
	};

	let resolveModuleClasses;
	resolveModuleClasses = function() {
		for (var i = 0; i <= modClassPos; i++) {
			var mc = modClass[i];
			for (var j = 0; j < modClassQueue.length; j++) {
				var mcq = modClassQueue[j];

				if (mcq.name === mc.name) {
					modClassQueue.splice(j, 1);
					setTimeout(() => {
						if (i === modClassPos) {
							modClassPos++;
						}

						if (mc.class) {
							mcq.resolve(mc.class);
						} else {
							mcq.reject(new Error('404 Module not found'));
						}
						resolveModuleClasses();
					}, 0);
					return;
				}
			}
		}
	};

	// Resolves a single module class by name
	const resolveModuleClass = function(name) {
		for (var j = 0; j < modClassQueue.length; j++) {
			var mcq = modClassQueue[j];
			if (mcq.name === name) {
				modClassQueue.splice(j, 1);

				if (mc.class) {
					mcq.resolve(mc.class);
				} else {
					mcq.reject(new Error('404 Module not found'));
				}
			}
		}
	};

	const getModuleClass = function(name) {
		return new Promise((resolve, reject) => {
			modClassQueue.push({name, resolve, reject});
			if (resolveExplicitly) {
	 			resolveModuleClasses();
			}
		});
	};

	const createModule = function(name, require, constructorEx = null, initEx = null) {
		mod[name] = null;

		return function(app, params) {
			if (mod[name] && mod[name].state !== 'disposed' && mod[name].state !== 'created') {
				let err = "instance ["+ name +"] is already created with state: " + mod[name].state;
				console.error(err);
				throw new Error(err);
			}

			mod[name] = this;
			insts.push(this);

			this.state = 'created';
			this.name = name;
			this.require = require;
			this.disposeCalled = false;
			this.initCalled = false;
			this.module = null;

			this.dispose = jest.fn(() => {
				this.disposeCalled = true;
				this.state = 'disposed';
			});

			this.init = jest.fn(module => {
				this.state = 'active';
				this.module = module;

				this.initCalled = true;

				if (initEx) {
					throw initEx;
				}
			});

			if (constructorEx) {
				throw constructorEx;
			}

			if (require) {
				app.require(require, module => this.init(module));
			} else {
				this.state = 'active';
			}
		}
	};

	const verifyModules = function(active) {
		// Check active count
		let activeCount = 0, m;

		for (let k in mod) {
			m = mod[k];

			if (m && m.state === 'active') {
				// Expect the active module to actually be active.
				expect(active).toContain(k);
				activeCount++;
			}
		}
		// Expect number of active modules to equal the ones sent to the module.
		expect(active.length).toBe(activeCount);

		for (let inst of insts) {
			if (m.state === 'created') continue;
			if (m.state === 'disposed') {
				// Expect module only to have been disposed once
				expect(m.dispose).toHaveBeenCalledTimes(1);
			}

			if (m.require) {
				// Expect init method to only have been called once
				expect(m.init).toHaveBeenCalledTimes(1);
				// Expect the number of modules equal the number of modules that was required.
				expect(Object.keys(m.module)).toHaveLength(m.require.length);
				// Expect the modules provided to the init method to equal the ones required.
				for (let r of m.require) {
					expect(m.module).toHaveProperty(r);
					expect(m.module[r].name).toBe(r);
				}
			}
		}
	};

	beforeEach(() => {
		mod = {};
		ex = null;
		insts = [];
		modClass = [];
		modClassQueue = [];
		modClassPos = 0;

		app = new App({
			active: {active: "true"},
			inactive: {active: false},
			inactive0: {active: 0},
			inactiveString0: {active: "0"},
			inactiveStringFalse: {active: "False"},
			inactiveStringNO: {active: "NO"},
		}, {
			moduleClass: getModuleClass
		});
	});

	describe('loadBundle', () => {

		it('loads a single module', () => {
			return app.loadBundle({
				a: createModule('a')
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');
			});
		});

		it('loads multiple modules', () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b'),
				c: createModule('c')
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');
				expect(result.modules.b.name).toBe('b');
				expect(result.modules.c.name).toBe('c');

				verifyModules(['a', 'b', 'c']);
			});
		});

		it('loads multiple modules in require chain', () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a']),
				c: createModule('c', ['b'])
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');
				expect(result.modules.b.name).toBe('b');
				expect(result.modules.c.name).toBe('c');
				verifyModules(['a', 'b', 'c']);
			});
		});

		it('loads a single module with empty require array', () => {
			return app.loadBundle({
				a: createModule('a', [])
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.module).toEqual({});
			});
		});

		it('loads multiple modules in reversed require chain', () => {
			return app.loadBundle({
				a: createModule('a', ['b']),
				b: createModule('b', ['c']),
				c: createModule('c')
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.c.name).toBe('c');
				expect(result.modules.b.name).toBe('b');
				expect(result.modules.a.name).toBe('a');
				verifyModules(['a', 'b', 'c']);
			});
		});

		it('loads multiple modules in require diamond', () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a']),
				c: createModule('c', ['a']),
				d: createModule('d', ['b', 'c'])
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');
				expect(result.modules.b.name).toBe('b');
				expect(result.modules.c.name).toBe('c');
				expect(result.modules.d.name).toBe('d');
				verifyModules(['a', 'b', 'c', 'd']);
			});
		});

		it("doesn't load module deactivated by active flag set to false in param", () => {
			return app.loadBundle({
				active: createModule('active'),
				inactive: createModule('inactive'),
				inactive0: createModule('inactive0'),
				inactiveString0: createModule('inactiveString0'),
				inactiveStringFalse: createModule('inactiveStringFalse'),
				inactiveStringNO: createModule('inactiveStringNO'),
				b: createModule('b')
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(5);
				expect(result.errors.inactive.name).toBe('DeactivatedError');
				expect(result.errors.inactive0.name).toBe('DeactivatedError');
				expect(result.errors.inactiveString0.name).toBe('DeactivatedError');
				expect(result.errors.inactiveStringFalse.name).toBe('DeactivatedError');
				expect(result.errors.inactiveStringNO.name).toBe('DeactivatedError');
				verifyModules(['active', 'b']);
			});
		});

		it("loads doesn't load module that throws exception, but loads the others", () => {
			return app.loadBundle({
				a: createModule('a', null, new Error("Constructor error")),
				b: createModule('b', null, "Constructor throw"),
				c: createModule('c')
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(2);
				expect(result.errors.a.name).toBe('UnknownError');
				expect(result.errors.b.name).toBe('UnknownError');
				verifyModules(['c']);
			});
		});

		it("loads loads modules that throws an exception in the require callback, deferring the exception", () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a'], null, new Error("Init error"))
			}).then(result => {
				expect(result.errors).toBe(null);
				verifyModules(['a', 'b']);
			});
		});

		it("doesn't load module blocked by deactivated module", () => {
			return app.loadBundle({
				inactive: createModule('inactive'),
				b: createModule('b', ['inactive'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(2);
				expect(result.errors.inactive.name).toBe('DeactivatedError');
				expect(result.errors.b.name).toBe('BlockedError');
				expect(Object.keys(result.errors.b.blockedBy)).toHaveLength(1);
				expect(result.errors.b.blockedBy).toHaveProperty('inactive');
				verifyModules([]);
			});
		});

		it("sets multiple blockedBy errors when blocked in require diamond", () => {
			return app.loadBundle({
				inactive: createModule('inactive'),
				b: createModule('b', ['inactive']),
				c: createModule('c', ['inactive']),
				d: createModule('d', ['b', 'c'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(4);
				expect(Object.keys(result.errors.d.blockedBy)).toHaveLength(2);
				expect(result.errors.d.blockedBy).toHaveProperty('b')
				expect(result.errors.d.blockedBy).toHaveProperty('c');
				verifyModules([]);
			});
		});

		it("gives error on circular dependencies", () => {
			return app.loadBundle({
				ca: createModule('ca', ['cc']),
				cb: createModule('cb', ['ca']),
				cc: createModule('cc', ['cb'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				verifyModules([]);
			});
		});

	});

	describe('moduleClassCallback', () => {

		it("loads implicit module", () => {
			setModuleClasses([
				{name: 'b', class: createModule('b')}
			]);

			return app.loadBundle({
				a: createModule('a', ['b'])
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');

				verifyModules(['a', 'b']);
			});
		});

		it("loads chained implicit modules", () => {
			setModuleClasses([
				{name: 'b', class: createModule('b', ['c'])},
				{name: 'c', class: createModule('c')}
			]);

			return app.loadBundle({
				a: createModule('a', ['b'])
			}).then(result => {
				expect(result.errors).toBe(null);
				expect(result.modules.a.name).toBe('a');

				verifyModules(['a', 'b', 'c']);
			});
		});

		it("blocks a module requiring an unavailable module class", () => {
			setModuleClasses([
				{name: 'b', class: null}
			]);

			return app.loadBundle({
				a: createModule('a', ['b'])
			}).then(result => {
				expect(Object.keys(result.errors)).toHaveLength(1);
				expect(result.errors.a.name).toBe('BlockedError');
				expect(result.errors.a.blockedBy).toHaveProperty('b');
				expect(result.errors.a.blockedBy.b.name).toBe('UnavailableError');

				verifyModules([]);
			});
		});

		it("unloads an implicitly loaded module without dependants", () => {
			setModuleClasses([
				{name: 'b', class: createModule('b')},
				{name: 'c', class: null}
			]);

			return app.loadBundle({
				a: createModule('a', ['b', 'c'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(1);
				expect(result.errors.a.name).toBe('BlockedError');
				expect(Object.keys(result.errors.a.blockedBy)).toHaveLength(1);
				expect(result.errors.a.blockedBy).toHaveProperty('c')
				expect(result.errors.a.blockedBy.c.name).toBe('UnavailableError');
				verifyModules([]);
			});
		});

		it("keeps an exlicitly loaded module without dependants", () => {
			setModuleClasses([
				{name: 'c', class: null}
			]);

			return app.loadBundle({
				a: createModule('a', ['b', 'c']),
				b: createModule('b')
			}).then(result => {
				expect(result.errors).not.toBe(null);
				expect(Object.keys(result.errors)).toHaveLength(1);
				expect(result.errors.a.name).toBe('BlockedError');
				verifyModules(['b']);
			});
		});

		it("loads complex require chains", () => {
			setModuleClasses([
				{name: 'd', class: createModule('d', ['c'])},
				{name: 'c', class: createModule('c')}
			]);

			return app.loadBundle({
				a: createModule('a', ['c']),
				b: createModule('b', ['d'])
			}).then(result => {
				expect(result.errors).toBe(null);
				verifyModules(['a', 'b', 'c', 'd']);
			});
		});

		it("gives error on circular dependencies with implicitly loaded module", () => {
			setModuleClasses([
				{name: 'cc', class: createModule('cc', ['ca', 'cb'])}
			]);

			return app.loadBundle({
				ca: createModule('ca', ['cb']),
				cb: createModule('cb', ['cc'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				verifyModules([]);
			});
		});

		it("loads bundle with dependency on delayed module class resolve", () => {
			setModuleClasses([
				{name: 'b', class: createModule('b')}
			], true);

			return app.loadBundle({
				a: createModule('a', ['b'])
			}).then(result => {
				expect(result.errors).toBe(null);
				verifyModules(['a', 'b']);
			});
		});

		it("loads bundle dependant on another bundle awaiting module class", () => {
			setModuleClasses([
				{name: 'c', class: createModule('c')}
			], true);

			let promises = [];
			promises.push(app.loadBundle({
				a: createModule('a', ['c'])
			}));
			promises.push(app.loadBundle({
				b: createModule('b', ['a'])
			}));

			resolveModuleClass('c');

			return Promise.all(promises)
			.then((result) => {
				expect(result[0].errors).toBe(null);
				expect(result[1].errors).toBe(null);
				verifyModules(['a', 'b', 'c']);
			});
		});

		it("loads two bundles with shared implicit dependencies in the order they resolve", () => {
			setModuleClasses([
				{name: 'c', class: createModule('c')},
				{name: 'd', class: createModule('d')}
			], true);

			let promises = [];
			promises.push(app.loadBundle({
				a: createModule('a', ['c', 'd'])
			}));
			promises.push(app.loadBundle({
				b: createModule('b', ['c'])
			}));

			resolveModuleClass('c');
			return promises[1].then((result) => {
				expect(result.errors).toBe(null);
				verifyModules(['b', 'c']);

				resolveModuleClass('d');
				return promises[0];
			}).then((result) => {
				expect(result.errors).toBe(null);
				verifyModules(['a', 'b', 'c', 'd']);
			});
		});

		it("doesn't clean implicit module when one of two dependants in separate bundles fails to load", () => {
			setModuleClasses([
				{name: 'c', class: createModule('c')},
				{name: 'd', class: null},
				{name: 'e', class: createModule('e')},
			], true);

			let promises = [];
			promises.push(app.loadBundle({
				a: createModule('a', ['c', 'd'])
			}));
			promises.push(app.loadBundle({
				b: createModule('b', ['c', 'e'])
			}));

			resolveModuleClass('c');
			resolveModuleClass('d');
			return promises[0].then(result => {
				expect(result.errors).not.toBe(null);
				verifyModules(['c']);

				resolveModuleClass('e');
				return promises[1];
			}).then(result => {
				expect(result.errors).toBe(null);
				verifyModules(['b', 'c', 'e']);
			});
		});

		it("reloads implicit module after having been previously cleaned up", () => {
			setModuleClasses([
				{name: 'c', class: createModule('c')},
				{name: 'd', class: null}
			]);

			return app.loadBundle({
				a: createModule('a', ['c', 'd'])
			}).then(result => {
				expect(result.errors).not.toBe(null);
				verifyModules([]);

				return app.loadBundle({
					b: createModule('b', ['c'])
				});
			}).then(result => {
				expect(result.errors).toBe(null);
				verifyModules(['b', 'c']);
			});
		});

	});

	describe('require', () => {

		it("throws an error when called directly", () => {
			setModuleClasses([
				{name: 'a', class: createModule('a')}
			]);
			let spy = jest.fn();
			expect(() => app.require(['a'], spy)).toThrow();
			expect(spy).not.toHaveBeenCalled();
		});

	});

	describe('activate', () => {

		it("reactivates deactivated module", () => {
			return app.loadBundle({
				inactive: createModule('inactive')
			}).then(result => app.activate('inactive')
				.then(module => {
					expect(module.name).toBe('inactive');
					verifyModules(['inactive']);
				})
			);
		});

		it("unblocks blocked modules in require chain when deactivated module is reactivated", () => {
			return app.loadBundle({
				inactive: createModule('inactive'),
				b: createModule('b', ['inactive']),
				c: createModule('c', ['b'])
			}).then(result => app.activate('inactive')
				.then(module => {
					expect(module.name).toBe('inactive');
					verifyModules(['inactive', 'b', 'c']);
				})
			);
		});

	});

	describe('deactivate', () => {

		it("unloads dependant module on deactivation", () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a'])
			}).then(result => {
				app.deactivate('a');

				verifyModules([]);
			});
		});

		it("unloads diamond chained dependant modules on deactivation", () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a']),
				c: createModule('c', ['a']),
				d: createModule('d', ['b', 'c'])
			}).then(result => {
				app.deactivate('a');

				verifyModules([]);
			});
		});

		it("unloads dependant module that has a loaded implicit", () => {
			setModuleClasses([
				{name: 'c', class: createModule('c')},
			]);
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a', 'c'])
			}).then(result => {
				app.deactivate('a');

				verifyModules([]);
			});
		});

		it("unloads dependant module on deactivation, reloading only a single instance", () => {
			return app.loadBundle({
				a: createModule('a'),
				b: createModule('b', ['a'])
			}).then(result => {
				app.deactivate('b');
				app.activate('b').then(result => {
					app.deactivate('a');
					app.activate('a').then(result => {
						verifyModules(['a', 'b']);
					})
				});
			});
		});

	});

});