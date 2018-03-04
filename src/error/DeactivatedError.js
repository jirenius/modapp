/**
 * Error when a module is deactivated and is not loaded.
 */
class DeactivatedError extends Error {

	/**
	 * Creates a DeactivatedError
	 * @param {string} moduleName Name of the module.
	 */
	constructor(moduleName) {
		super();
		this.moduleName = moduleName;
		this.name = 'DeactivatedError';
		this.message = `Module ${moduleName} is deactivated.`;
	}
}

export default DeactivatedError;
