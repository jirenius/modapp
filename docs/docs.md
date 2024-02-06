## Classes

<dl>
<dt><a href="#App">App</a></dt>
<dd><p>A modular app container loading, storing, and linking app modules together.</p>
</dd>
<dt><a href="#AppExt">AppExt</a></dt>
<dd><p>A modular app container that extends <a href="#App">App</a> and adds an eventBus
in addition to implement the <a href="#Component">Component</a> interface.</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_EventBus">EventBus</a></dt>
<dd><p>EventBus is a bus for subscribing to and emitting events.</p>
</dd>
</dl>

## Interfaces

<dl>
<dt><a href="#AppModule">AppModule</a></dt>
<dd><p>An app module to be loaded by the <a href="#App">App</a>.<br>
A module may expose any number of public methods, using camelCase as naming convention.<br> 
All properties should be considered private, as well as any methods starting with an underscore (_).<br>
Any exposed method that allows other modules to register objects or callbacks, must come paired
with a method for unregisteration.</p>
</dd>
<dt><a href="#Component">Component</a></dt>
<dd><p>A UI component</p>
</dd>
<dt><a href="#Model">Model</a></dt>
<dd><p>A model object<br></p>
<ul>
<li>properties are to be considered read-only, and should not be mutated directly.<br></li>
<li>any property or method starting with underscore (_) is to be considered private.<br></li>
<li>may have public methods that may mutate properties.<br></li>
<li>mutation of one or more properties must trigger a &#39;change&#39; event.</li>
</ul>
</dd>
<dt><a href="#Collection">Collection</a></dt>
<dd><p>A collection object<br></p>
<ul>
<li>must be iterable.<br></li>
<li>any method starting with underscore (_) is to be considered private.<br></li>
<li>may have public methods.<br></li>
<li>mutation of the collection must trigger &#39;add&#39; or &#39;remove&#39; event to reflect the changes.</li>
</ul>
</dd>
<dt><a href="#Readyable">Readyable</a></dt>
<dd><p>An interface to tell if an object is initialized and ready.<br>
May be used in combination with <a href="#Component">Component</a> to tell if a component
is ready to render without showing a loading placeholder.</p>
</dd>
<dt><a href="#LocaleString">LocaleString</a></dt>
<dd><p>A locale string object that can be translated.</p>
</dd>
</dl>

<a name="AppModule"></a>

## AppModule
An app module to be loaded by the [App](#App).<br>
A module may expose any number of public methods, using camelCase as naming convention.<br> 
All properties should be considered private, as well as any methods starting with an underscore (_).<br>
Any exposed method that allows other modules to register objects or callbacks, must come paired
with a method for unregisteration.

**Kind**: global interface  

* [AppModule](#AppModule)
    * [.constructor(app, opt)](#AppModule+constructor)
    * [.dispose()](#AppModule+dispose)

<a name="AppModule+constructor"></a>

### appModule.constructor(app, opt)
The app module constructor.<br>
It is only in the constructor that the module may call [app.require(...)](#App+require).
If app.require is called, the module must postpone registering any objects or callbacks until
the require callback is called to prevent memory leaks in case the App cannot fulfill the requirements
and discards the app module.

**Kind**: instance method of [<code>AppModule</code>](#AppModule)  

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | The app instance |
| opt | <code>Object.&lt;string, \*&gt;</code> | Module options provided to the App constructor as from the url query |

<a name="AppModule+dispose"></a>

### appModule.dispose()
Disposes the app module, removing any items or callbacks previously registered within the constructor or
in the [app.require](#App+require) callback.<br>
Once disposed, no more calls will be done to the module instance.

**Kind**: instance method of [<code>AppModule</code>](#AppModule)  
<a name="Component"></a>

## Component
A UI component

**Kind**: global interface  

* [Component](#Component)
    * [.render(el)](#Component+render) ⇒ <code>this</code>
    * [.unrender()](#Component+unrender)

<a name="Component+render"></a>

### component.render(el) ⇒ <code>this</code>
Renders the component by appending its own element(s) to the provided parent element.<br>
The provided element is not required to be empty, and may therefor contain other child elements.<br>
The component is not required to append any element in case it has nothing to render.<br>
Render is never called two times in succession without a call to unrender in between.

**Kind**: instance method of [<code>Component</code>](#Component)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> \| <code>DocumentFragment</code> | Parent element in which to render the contents |

<a name="Component+unrender"></a>

### component.unrender()
Unrenders the component and removes its element(s) from the parent element.<br>
Only called after render and never called two times in succession without a call to render in between.

**Kind**: instance method of [<code>Component</code>](#Component)  
<a name="Model"></a>

## Model
A model object<br>
* properties are to be considered read-only, and should not be mutated directly.<br>
* any property or method starting with underscore (_) is to be considered private.<br>
* may have public methods that may mutate properties.<br>
* mutation of one or more properties must trigger a 'change' event.

**Kind**: global interface  

* [Model](#Model)
    * _instance_
        * [.on(event, handler)](#Model+on)
        * [.off(event, [handler])](#Model+off)
    * _inner_
        * [~changeCallback](#Model..changeCallback) : <code>function</code>

<a name="Model+on"></a>

### model.on(event, handler)
Adds a callback handler for change events.

**Kind**: instance method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined Model topic is 'change'. |
| handler | [<code>changeCallback</code>](#Model..changeCallback) | Change callback handler. |

<a name="Model+off"></a>

### model.off(event, [handler])
Removes a callback handler for change events.

**Kind**: instance method of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined Model topic is 'change'. |
| [handler] | [<code>changeCallback</code>](#Model..changeCallback) | Change callback handler used when calling on. |

<a name="Model..changeCallback"></a>

### Model~changeCallback : <code>function</code>
Change event emitted on any change to one or more public (non-underscore) properties.

**Kind**: inner typedef of [<code>Model</code>](#Model)  

| Param | Type | Description |
| --- | --- | --- |
| changed | <code>Object.&lt;string, \*&gt;</code> | Changed key/value object where key is the changed property, and value is the old property value. |
| model | [<code>Model</code>](#Model) | Model emitting the event |

<a name="Collection"></a>

## Collection
A collection object<br>
* must be iterable.<br>
* any method starting with underscore (_) is to be considered private.<br>
* may have public methods.<br>
* mutation of the collection must trigger 'add' or 'remove' event to reflect the changes.

**Kind**: global interface  
**See**: [Iteration protocols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| length | <code>number</code> | Number of items in the collection. |


* [Collection](#Collection)
    * _instance_
        * [.on(event, handler)](#Collection+on)
        * [.off(event, [handler])](#Collection+off)
        * [.atIndex(index)](#Collection+atIndex) ⇒ <code>\*</code>
    * _inner_
        * [~addEvent](#Collection..addEvent) : <code>object</code>
        * [~addCallback](#Collection..addCallback) : <code>function</code>
        * [~removeEvent](#Collection..removeEvent) : <code>object</code>
        * [~removeCallback](#Collection..removeCallback) : <code>function</code>

<a name="Collection+on"></a>

### collection.on(event, handler)
Adds a callback handler for add or remove events.

**Kind**: instance method of [<code>Collection</code>](#Collection)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined Collection topics are 'add' and 'remove'. |
| handler | [<code>addCallback</code>](#Collection..addCallback) \| [<code>removeCallback</code>](#Collection..removeCallback) | Callback handler. |

<a name="Collection+off"></a>

### collection.off(event, [handler])
Removes a callback handler for add or remove events.

**Kind**: instance method of [<code>Collection</code>](#Collection)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined Collection topics are 'add' and 'remove'. |
| [handler] | [<code>addCallback</code>](#Collection..addCallback) \| [<code>removeCallback</code>](#Collection..removeCallback) | Change callback handler used when calling on. |

<a name="Collection+atIndex"></a>

### collection.atIndex(index) ⇒ <code>\*</code>
Returns the value at the given index

**Kind**: instance method of [<code>Collection</code>](#Collection)  
**Returns**: <code>\*</code> - Value at the given index  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index number, zero-based. |

<a name="Collection..addEvent"></a>

### Collection~addEvent : <code>object</code>
Add event data

**Kind**: inner typedef of [<code>Collection</code>](#Collection)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| item | <code>\*</code> | Collection item being added. |
| idx | <code>number</code> | Index where item was added. |

<a name="Collection..addCallback"></a>

### Collection~addCallback : <code>function</code>
Add event emitted on any item being added to the collection.

**Kind**: inner typedef of [<code>Collection</code>](#Collection)  

| Param | Type | Description |
| --- | --- | --- |
| event | [<code>addEvent</code>](#Collection..addEvent) | Add event data. |
| collection | [<code>Collection</code>](#Collection) | Collection emitting event. |

<a name="Collection..removeEvent"></a>

### Collection~removeEvent : <code>object</code>
Remove event data

**Kind**: inner typedef of [<code>Collection</code>](#Collection)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| item | <code>\*</code> | Collection item being removed. |
| idx | <code>number</code> | Index from where the item was removed. |

<a name="Collection..removeCallback"></a>

### Collection~removeCallback : <code>function</code>
Remove event emitted on any item being added to the collection.

**Kind**: inner typedef of [<code>Collection</code>](#Collection)  

| Param | Type | Description |
| --- | --- | --- |
| event | [<code>removeEvent</code>](#Collection..removeEvent) | Remove event data. |
| collection | [<code>Collection</code>](#Collection) | Collection emitting event. |

<a name="Readyable"></a>

## Readyable
An interface to tell if an object is initialized and ready.<br>
May be used in combination with [Component](#Component) to tell if a component
is ready to render without showing a loading placeholder.

**Kind**: global interface  
<a name="Readyable+ready"></a>

### readyable.ready() ⇒ <code>Promise</code>
Returns a promise to when the object is initialized and ready.

**Kind**: instance method of [<code>Readyable</code>](#Readyable)  
**Returns**: <code>Promise</code> - A promise to when the object is initialized and ready.  
<a name="LocaleString"></a>

## LocaleString
A locale string object that can be translated.

**Kind**: global interface  

* [LocaleString](#LocaleString)
    * _instance_
        * [.translate(...var_args)](#LocaleString+translate) ⇒ <code>string</code>
        * [.getLocale()](#LocaleString+getLocale) ⇒ <code>string</code>
        * [.on(event, handler)](#LocaleString+on)
        * [.off(event, [handler])](#LocaleString+off)
    * _inner_
        * [~localeUpdateCallback](#LocaleString..localeUpdateCallback) : <code>function</code>

<a name="LocaleString+translate"></a>

### localeString.translate(...var_args) ⇒ <code>string</code>
Translates a callback handler for change events.

**Kind**: instance method of [<code>LocaleString</code>](#LocaleString)  
**Returns**: <code>string</code> - Translated string.  

| Param | Type | Description |
| --- | --- | --- |
| ...var_args | <code>\*</code> | Arguments for value placeholders. Defined by the implementation. |

<a name="LocaleString+getLocale"></a>

### localeString.getLocale() ⇒ <code>string</code>
Gets the current locale language tag. Eg. 'en', 'pt-BR', etc.

**Kind**: instance method of [<code>LocaleString</code>](#LocaleString)  
**Returns**: <code>string</code> - Locale language tag.  
<a name="LocaleString+on"></a>

### localeString.on(event, handler)
Adds a callback handler for change events.

**Kind**: instance method of [<code>LocaleString</code>](#LocaleString)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined LocaleString topic is 'localeUpdate'. |
| handler | [<code>localeUpdateCallback</code>](#LocaleString..localeUpdateCallback) | Locale update callback handler. |

<a name="LocaleString+off"></a>

### localeString.off(event, [handler])
Removes a callback handler for change events.

**Kind**: instance method of [<code>LocaleString</code>](#LocaleString)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event topic. Only defined LocaleString topic is 'localeUpdate'. |
| [handler] | [<code>localeUpdateCallback</code>](#LocaleString..localeUpdateCallback) | Locale update callback handler used when calling on. |

<a name="LocaleString..localeUpdateCallback"></a>

### LocaleString~localeUpdateCallback : <code>function</code>
Locale update event emitted on update of the locale.

**Kind**: inner typedef of [<code>LocaleString</code>](#LocaleString)  

| Param | Type | Description |
| --- | --- | --- |
| locale | <code>string</code> | Locale language tag of new locale. |

<a name="App"></a>

## App
A modular app container loading, storing, and linking app modules together.

**Kind**: global class  

* [App](#App)
    * [new App([moduleConfig], [opt])](#new_App_new)
    * _instance_
        * [.props](#App+props)
        * [.loadBundle(bundle)](#App+loadBundle) ⇒ [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults)
        * [.loadModules(moduleNames)](#App+loadModules) ⇒ [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults)
        * [.getModule(moduleName)](#App+getModule) ⇒ <code>object</code>
        * [.deactivate(moduleName)](#App+deactivate)
        * [.activate(moduleName)](#App+activate) ⇒ <code>Promise.&lt;AppModule, Error&gt;</code>
        * [.update(moduleName, [moduleClass])](#App+update)
        * [.require(moduleNames, callback)](#App+require) ⇒ <code>this</code>
    * _inner_
        * [~requireCallback](#App..requireCallback) : <code>function</code>
        * [~moduleClassCallback](#App..moduleClassCallback) ⇒ <code>Promise.&lt;Class, Error&gt;</code>
        * [~loadResults](#App..loadResults) : <code>object</code>

<a name="new_App_new"></a>

### new App([moduleConfig], [opt])
Creates an App instance.<br>
The optional module configuration may be overridden using the url query.<br>
Eg. "?login.auto=true" would pass {auto: "true"} as parameter to the login app module.
If a module configuration has the property "active" set to the strings "false", "no",
or "0", or has value false or 0, it will automatically be deactivated on load.


| Param | Type | Description |
| --- | --- | --- |
| [moduleConfig] | <code>Object.&lt;string, object&gt;</code> | App module configuration key-value object where the key is the name of the module and the value is the parameters passed to the module on creation. |
| [opt] | <code>object</code> | App configuration |
| [opt.moduleClass] | [<code>moduleClassCallback</code>](#App..moduleClassCallback) | Callback for fetching the [AppModule](#AppModule) class for a given module name. |
| [opt.queryNamespace] | <code>string</code> | Namespace prefix for query params. Eg. 'mod' for ?mod.login.auto=true . Defaults to no namespace. |
| [opt.props] | <code>object</code> | App properties available for all modules through the props property. |

<a name="App+props"></a>

### app.props
App properties.

**Kind**: instance property of [<code>App</code>](#App)  
<a name="App+loadBundle"></a>

### app.loadBundle(bundle) ⇒ [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults)
Loads an app module bundle, creating an explicit instance of each app module class.<br>
If a moduleClass already exist for a given name, loadBundle will dispose the previously
loaded version and replace it with a new instance.
The returned promise will always resolve.

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults) - Promise of the load results. Will always resolve.  

| Param | Type | Description |
| --- | --- | --- |
| bundle | <code>Object.&lt;string, Class&gt;</code> | A key/value object where the key is the module name and the value is the app module class. |

<a name="App+loadModules"></a>

### app.loadModules(moduleNames) ⇒ [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults)
Loads a set of modules, creating an instance for each if there is none, fetching the module
class from the server if needed.

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: [<code>Promise.&lt;loadResults&gt;</code>](#App..loadResults) - Promise of the load results. Will always resolve.  

| Param | Type | Description |
| --- | --- | --- |
| moduleNames | <code>Array.&lt;string&gt;</code> | An array of module names |

<a name="App+getModule"></a>

### app.getModule(moduleName) ⇒ <code>object</code>
Gets a loaded and active module.

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>object</code> - Module instance, or undefined if it is not loaded and active.  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>string</code> | Name of the module |

<a name="App+deactivate"></a>

### app.deactivate(moduleName)
Deactivates a previously loaded (explicitly or implicitly through require) module,
and disposes its instance. Any recursivly dependant module will also be disposed along
with any implicitly loaded module with all its dependants being disposed.

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>string</code> | Name of module to deactivate |

<a name="App+activate"></a>

### app.activate(moduleName) ⇒ <code>Promise.&lt;AppModule, Error&gt;</code>
Activates a previously deactivated module by creating a new module instance.<br>
Any other module that has been blocked loading due to being dependant upon the
deactivated module, will also be loaded.

**Kind**: instance method of [<code>App</code>](#App)  
**Returns**: <code>Promise.&lt;AppModule, Error&gt;</code> - Promise of the app module.  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>string</code> | Name of module to activate. |

<a name="App+update"></a>

### app.update(moduleName, [moduleClass])
Checks if the provided module class is different from the one loaded, and if it is,
disposes the previously loaded version and replace it with a new instance.<br>
If no module class is provided, update will try fetching the module class from the server.

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| moduleName | <code>string</code> |  | Name of the module to update |
| [moduleClass] | [<code>Class.&lt;AppModule&gt;</code>](#AppModule) | <code></code> | Optional module class. returns {Promise.<AppModule, Error>} Promise of the app module instance. |

<a name="App+require"></a>

### app.require(moduleNames, callback) ⇒ <code>this</code>
Requires an app module or a set of app modules.<br>
May only be called within an app module [constructor](#AppModule+constructor).<br>
If a required module has not yet been loaded, an instance of if will be created
	 . If any of the required modules cannot be created,
the returned promise will be rejected, and the module that called the require will not
be loaded.<br>
If any modules that has been created during this call also calls [require](#App+require)
within their constructors, those require requests will be queued to be handled after
all modules on the initial request has been loaded.

**Kind**: instance method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| moduleNames | <code>string</code> \| <code>Array.&lt;string&gt;</code> | The name of a module, or an array of module names |
| callback | [<code>requireCallback</code>](#App..requireCallback) | Require callback on success |

<a name="App..requireCallback"></a>

### App~requireCallback : <code>function</code>
Require callback

**Kind**: inner typedef of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| modules | <code>Object.&lt;string, AppModule&gt;</code> | A key/value object with keys being the module names and the value being the app module instance. |

<a name="App..moduleClassCallback"></a>

### App~moduleClassCallback ⇒ <code>Promise.&lt;Class, Error&gt;</code>
Module class callback

**Kind**: inner typedef of [<code>App</code>](#App)  
**Returns**: <code>Promise.&lt;Class, Error&gt;</code> - Returns promise of the [AppModule](#AppModule) class.  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>string</code> | Name of the module |

<a name="App..loadResults"></a>

### App~loadResults : <code>object</code>
Load app module results

**Kind**: inner typedef of [<code>App</code>](#App)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| modules | <code>Object.&lt;string, AppModule&gt;</code> | A key/value object where the key is the module name and the value is the app module instance. |
| errors | <code>Object.&lt;string, Error&gt;</code> | A key/value object where the key is the module name and the value is the error when trying to load the module. Null means there are no errors. |

<a name="AppExt"></a>

## AppExt
A modular app container that extends [App](#App) and adds an eventBus
in addition to implement the [Component](#Component) interface.

**Kind**: global class  
**Implements**: [<code>Component</code>](#Component)  

* [AppExt](#AppExt)
    * [new AppExt([moduleConfig], [opt])](#new_AppExt_new)
    * _instance_
        * [.eventBus](#AppExt+eventBus)
        * [.on(events, handler)](#AppExt+on)
        * [.off(events, [handler])](#AppExt+off)
        * [.setComponent(component)](#AppExt+setComponent)
        * [.unsetComponent(component)](#AppExt+unsetComponent)
        * [.hasComponent()](#AppExt+hasComponent) ⇒ <code>boolean</code>
        * [.render(el)](#AppExt+render) ⇒ <code>this</code>
        * [.unrender()](#AppExt+unrender)
    * _inner_
        * [~eventCallback](#AppExt..eventCallback) : <code>function</code>

<a name="new_AppExt_new"></a>

### new AppExt([moduleConfig], [opt])
Creates an extended App instance.<br>
The optional module configuration may be overridden using the url query.<br>
Eg. "?login.auto=true" would pass {auto: "true"} as parameter to the login app module.
If a module configuration has the property "active" set to the strings "false", "no",
or "0", or has value false or 0, it will automatically be deactivated on load.


| Param | Type | Description |
| --- | --- | --- |
| [moduleConfig] | <code>Object.&lt;string, object&gt;</code> | App module configuration key-value object where the key is the name of the module and the value is the parameters passed to the module on creation. |
| [opt] | <code>object</code> | App configuration |
| [opt.moduleClass] | [<code>moduleClassCallback</code>](#App..moduleClassCallback) | Callback for fetching the [AppModule](#AppModule) class for a given module name. |
| [opt.queryNamespace] | <code>string</code> | Namespace prefix for query params. Eg. 'mod' for ?mod.login.auto=true . Defaults to no namespace. |
| [opt.props] | <code>object</code> | App properties available for all modules through the props property. |
| [opt.eventBus] | <code>EventBus</code> | Event bus. |
| [opt.eventBusNamespace] | <code>string</code> | Namespace prefix for the event bus. Defaults to 'app'. |

<a name="AppExt+eventBus"></a>

### appExt.eventBus
The event bus used by the AppExt

**Kind**: instance property of [<code>AppExt</code>](#AppExt)  
<a name="AppExt+on"></a>

### appExt.on(events, handler)
Attach an event handler function for one or more app events.<br>

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>string</code> | One or more space-separated events. Null means any event. |
| handler | [<code>eventCallback</code>](#AppExt..eventCallback) | A function to execute when the event is emitted. |

<a name="AppExt+off"></a>

### appExt.off(events, [handler])
Remove an app event handler.

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  

| Param | Type | Description |
| --- | --- | --- |
| events | <code>string</code> | One or more space-separated events. Null means any event. |
| [handler] | [<code>eventCallback</code>](#AppExt..eventCallback) | An optional handler function. The handler will only be remove if it is the same handler. |

<a name="AppExt+setComponent"></a>

### appExt.setComponent(component)
Sets the screen component and renders it if the screen is rendered.<br>
Usually called by the app module responsible for displaying the initial
loading screen, the login screen, or the overall layout.

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  

| Param | Type | Description |
| --- | --- | --- |
| component | [<code>Component</code>](#Component) | Component to set. |

<a name="AppExt+unsetComponent"></a>

### appExt.unsetComponent(component)
Unsets a component if it matches the one set

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  

| Param | Type | Description |
| --- | --- | --- |
| component | [<code>Component</code>](#Component) | Component to unset |

<a name="AppExt+hasComponent"></a>

### appExt.hasComponent() ⇒ <code>boolean</code>
Check if a component has been set.

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  
**Returns**: <code>boolean</code> - True if a component has been set, otherwise false  
<a name="AppExt+render"></a>

### appExt.render(el) ⇒ <code>this</code>
Renders the component set with setComponent()

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  
**Implements**: [<code>render</code>](#Component+render)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> \| <code>DocumentFragment</code> | Parent element in which to render the contents. |

<a name="AppExt+unrender"></a>

### appExt.unrender()
Unrenders the app

**Kind**: instance method of [<code>AppExt</code>](#AppExt)  
**Implements**: [<code>unrender</code>](#Component+unrender)  
<a name="AppExt..eventCallback"></a>

### AppExt~eventCallback : <code>function</code>
Event callback

**Kind**: inner typedef of [<code>AppExt</code>](#AppExt)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Event data object |
| target | [<code>AppExt</code>](#AppExt) | Target AppExt object |
| event | <code>string</code> | Event name including namespace |

<a name="external_EventBus"></a>

## EventBus
EventBus is a bus for subscribing to and emitting events.

**Kind**: global external  
**See**: [modapp-eventbus](https://github.com/jirenius/modapp-eventbus/blob/master/docs/docs.md#EventBus)  
