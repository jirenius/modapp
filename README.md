[![view on npm](http://img.shields.io/npm/v/modapp.svg)](https://www.npmjs.org/package/modapp)

# ModApp
A thin framework for building modular web applications.

## Installation

With npm:
```sh
npm install modapp
```

With yarn:
```sh
yarn add modapp
```

## Example

```javascript
import { App } from 'modapp';

// A module keeping track of greetings
class Greetings {
	constructor(app, params) {
		this.app = app;
		this.greetings = {};
	}

	addGreeting(lang, greeting) {
		this.greetings[lang] = greeting;
	}

	removeGreeting(lang) {
		delete this.greetlings[lang];
	}

	greet(lang) {
		let greeting = this.greetings[lang];
		console.log(greeting || "Unknown language");
	}

	dispose() {} // Nothing to dispose
}

// A module for swedish greetings
class EnglishGreeting {
	constructor(app, params) {
		this.app = app;
		this.greeting = params.greeting || "Hello";
		this.app.require(['greetings'], this._init.bind(this));
	}

	_init(module)  {
		this.module = module;
		this.module.greetings.addGreeting('english', this.greeting);
	}

	dispose() {
		this.module.greetings.removeGreeting('english');
	}
}

// Creating the app with some module configuration. These parameters may be overwritten using url queries
let app = new App({ englishGreeting: { greeting: "Hi" }});

// Bundles are usually created dynamically using tools like webpacks require context.
let bundle = {
	greetings: Greetings,
	englishGreeting: EnglishGreeting
};

app.loadBundle(bundle)
	.then(result => {
		console.log("Modules loaded: ", result);
		app.getModule('greetings').greet('english');
	});
```

## Using modapp

While the example is useless, it gives an idea of what a module is and how they can interact with one another to create SOLID application.

Modules can be loaded, deactivate, and reactivated while the application is running, allowing hotloading of new features and functionality to the application. New modules will simply hook into the application using the register/unregister methods provided (`addGreeting` and `removeGreeting` in the example).

Try [resgate-test-app](https://github.com/jirenius/resgate-test-app) to see modapp in use.

## AppModule interface

For a class to be loaded by the app, it must follow the AppModule interface.  
A module may expose any number of public methods, using camelCase as naming convention.  
All properties should be considered private, as well as any methods starting with an underscore (`_`).  
Any exposed method that allows other modules to register objects or callbacks, must come paired
with a method for unregistering.

### appModule.constructor(app, params)
The app module constructor.  
It is only in the constructor that the module may call 
*app.require(...)*.
If *app.require* is called, the module must postpone registering any objects or callbacks until
the require callback is called to prevent memory leaks in case the App cannot fulfill the requirements
and discards the app module.
(#AppModule)  

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | The app instance |
| params | <code>Object.&lt;string, \*&gt;</code> | Module parameters from the app config |

### appModule.dispose()
Disposes the app module, removing any items or callbacks previously registered within the constructor or
in the *app.require* callback.  
Once disposed, no more calls will be done to the module instance.

## Documentation

[Markdown documentation](https://github.com/jirenius/modapp/blob/master/docs/docs.md)