/**
 * An app module to be loaded by the {@link App}.<br>
 * A module may expose any number of public methods, using camelCase as naming convention.<br> 
 * All properties should be considered private, as well as any methods starting with an underscore (_).<br>
 * Any exposed method that allows other modules to register objects or callbacks, must come paired
 * with a method for unregisteration.
 * @interface AppModule
 */

/**
 * The app module constructor.<br>
 * It is only in the constructor that the module may call [app.require(...)]{@link App#require}.
 * If app.require is called, the module must postpone registering any objects or callbacks until
 * the require callback is called to prevent memory leaks in case the App cannot fulfill the requirements
 * and discards the app module.
 * @function
 * @name AppModule#constructor
 * @param {App} app The app instance
 * @param {Object.<string,*>} opt Module options provided to the App constructor as from the url query
 */

 /**
 * Disposes the app module, removing any items or callbacks previously registered within the constructor or
 * in the [app.require]{@link App#require} callback.<br>
 * Once disposed, no more calls will be done to the module instance.
 * @function
 * @name AppModule#dispose
 */