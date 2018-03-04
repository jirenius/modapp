/**
 * Error when a module has a circular dependency.
 */
class CircularDependencyError extends Error {

	/**
	 * Creates a CircularDependencyError
	 * @param {string} moduleName Name of the module.
	 * @param {Array.<string>} chain Dependency chain
	 */
	constructor(moduleName, chain) {
		super();
		this.moduleName = moduleName;
		this.chain = chain;
		this.name = 'CircularDependencyError';
		this.message = `Circular dependency: ${chain.join(" > ")} > ${moduleName}.`;
	}
}

export default CircularDependencyError;
