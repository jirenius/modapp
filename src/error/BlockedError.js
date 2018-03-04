/**
 * Error when a module is blocked by one or more required modules not being loaded.
 */
class BlockedError extends Error {

	/**
	 * Creates a BlockedError
	 * @param {string} moduleName Name of the module.
	 * @param {Object.<string,Error>} blockedBy Key-value object where the key is the module name and the value is the error loading that module
	 */
	constructor(moduleName, blockedBy) {
		super();
		this.moduleName = moduleName;
		this.blockedBy = blockedBy;
		this.name = 'BlockedError';
		this.message = `Module ${moduleName} is blocked by ${Object.keys(blockedBy).join(', ')}.`;
	}
}

export default BlockedError;
