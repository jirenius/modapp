/**
 * Error when an error is encountered creating an instance
 */
class UnknownError extends Error {

	/**
	 * Creates an UnknownError
	 * @param {string} moduleName Name of the module.
	 * @param {Error} error Error that was encountered.
	 */
	constructor(moduleName, error) {
		super();
		this.moduleName = moduleName;
		this.name = 'UnknownError';
		this.error = error;
		this.message = `Module ${moduleName} encountered an error: ${error.message || error}`;
	}
}

export default UnknownError;