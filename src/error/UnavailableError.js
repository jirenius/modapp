/**
 * Error when a module class is unavailable
 */
class UnavailableError extends Error {

	/**
	 * Creates an UnavailableError
	 * @param {string} moduleName Name of the module.
	 * @param {Error|string} internalError Internal error as to why the module is unavailable.
	 */
	constructor(moduleName, internalError) {
		super();
		this.moduleName = moduleName;
		this.name = 'UnavailableError';
		this.internalError = internalError;
		this.message = `Module ${moduleName} is unavailable: ${internalError.message || internalError}`;
	}
}

export default UnavailableError;