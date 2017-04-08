/**
 * A module with object helper functions
 * @module modapp/obj
 */

/**
 * Compares two values deeply using strict equal testing for non-objects (===).<br>
 * Two objects are considered equal if they contain the same set of properties with equal value.
 * @param {*} a Value to compare with b.
 * @param {*} b Value to compare with a.
 * @returns {boolean} True if the values are equal, otherwise false.
 */
let equal = function(a, b) {
	// Check if a is a non-object
	if (a === null || typeof a !== 'object') {
		return a === b;
	}

	// Make sure b is also an object
	if (b === null || typeof b !== 'object') {
		return false;
	}

	var ak = Object.keys(a).sort();
	var bk = Object.keys(b).sort();
	
	if (ak.length != bk.length) return false;
	for (let i = 0, k; (k = ak[i]); i++) {
		if (k !== bk[i]) return false;

		if (!equal(a[k], b[k])) {
			return false;
		}
	}

	return true;
};

/**
 * Property definition
 * @typedef {Object} func/obj~PropertyDefinition
 * @property {string} type Type of the property. May be 'string', '?string', 'number', '?number', 'boolean', '?boolean'
 * @property {*=} default Default value of the property.
 * @property {function=} assert Asserts the value. Throws an exception on failed assertion.
 */

const TYPES = {
	"string"  : {
		default: "",
		assert: v => {
			if (typeof v !== "string") {
				throw new Error("Not a string");
			}
		},
		fromString: v => String(v),
	},
	"?string" : {
		default: null,
		assert: v => {
			if (typeof v !== 'string' && v !== null) {
				throw new Error("Not a string or null");
			}
		},
		fromString: v => String(v) // Not possible to set null
	},
	"number"  : {
		default: 0,
		assert: v => {
			if (typeof v !== 'number') {
				throw new Error("Not a number");
			}
		},
		fromString: v => {
			v = Number(v);
			if (isNan(v)) {
				throw new Error("Not a number format");
			}
			return v;
		}
	},
	"?number" : {
		default: null,
		assert: v => {
			if (typeof v !== 'number' && v !== null) {
				throw new Error("Not a number or null");
			}
		},
		fromString: v => {
			v => v.toLowerCase() == 'null' ? null :  Number(v);
			if (isNan(v)) {
				throw new Error("Not a number format");
			}
			return v;
		}
	},
	"boolean" : {
		default: false,
		assert: v => {
			if (typeof v !== 'boolean') {
				throw new Error("Not a boolean");
			}
		},
		fromString: v => {
			v = v.toLowerCase();
			if (v == 'true' || v == '1' || v == 'yes') {
				v = true;
			} else if (v == 'false' || v == '0' || v == 'no') {
				v = false;
			} else {
				throw new Error("Not a boolean format");
			}
			return v;
		}
	},
	"?boolean": {
		default: null,
		assert: v => {
			if (typeof v !== 'boolean' && v !== null) {
				throw new Error("Not a boolean or null");
			}
		},
		fromString: v => {
			v = v.toLowerCase();
			if (v == 'true' || v == '1' || v == 'yes') {
				v = true;
			} else if (v == 'false' || v == '0' || v == 'no') {
				v = false;
			} else if (v == 'null') {
				v = null;
			} else {
				throw new Error("Not a nullable boolean format");
			}
			return v;
		}
	},
	"object": {
		default: null,
		assert: v => {
			if (typeof v !== 'object' || v === null) {
				throw new Error("Not an object");
			}
		},
		fromString: v => {
			return JSON.parse(v);
		}
	},
	"?object": {
		default: null,
		assert: v => {
			if (typeof v !== 'object') {
				throw new Error("Not an object or null");
			}
		},
		fromString: v => {
			return JSON.parse(v);
		}
	}
};

/**
 * Updates an target object from a source object based upon a definition
 * @param {object} target Target object
 * @param {object} source Source object
 * @param {Object.<string, string|func/obj~PropertyDefinition>} def Definition object which is a key/value object where the key is the property and the value is the property type or a property definition.
 * @param {boolean} strict Strict flag. If true, exceptions will be thrown on errors. If false, errors will be ignored. Default is true.
 * @returns {?Object.<string, *>} Key/value object where the key is the updated properties and the value is the old values.
 */
let update = function(target, source, def, strict = true) {
	if (!source || typeof source != 'object') return null;
	if (!def || typeof def != 'object') throw new Error("Invalid definition");

	let updated = false;
	let updateObj = {};

	for (let key in def) {
		let d = def[key];
		if (typeof d === 'string') {
			d = {type: d};
		}

		let t = TYPES[d.type];
		if (!t) {
			throw new Error("Invalid definition type: " + d.type);
		}

		// Check if target has any value set. If not, use default.
		if (!target.hasOwnProperty(key)) {
			updated = true;
			updateObj[key] = undefined;
			target[key] = d.hasOwnProperty('default') ? d.default : t.default;
		}

		// Check if source has value for the property. If not, continue to next property.
		if (!source.hasOwnProperty(key)) {
			continue;
		}

		let v = source[key];
		try {
			// Convert from string
			if (typeof v === "string") {
				v = t.fromString(v);
			}

			// Type assertion
			t.assert(v);

			// Definition assertion
			if (d.assert) {
				d.assert(v);
			}

			// Check if the property value differs and set it as updated
			if (target[key] !== v) {
				updated = true;
				updateObj[key] = target[key];
				target[key] = v;
			}
		} catch (ex) {
			if (strict) {
				throw ex;
			}
		}
	}

	if (!updated) return null;

	return updateObj;
};

/**
 * Copies a source object based upon a definition
 * @param {object} source Source object
 * @param {object} def Definition object which is a key/value object where the key is the property and the value is the value type.
 * @param {boolean} strict Strict flag. If true, exceptions will be thrown on errors. If false, errors will be ignored. Default is false.
 * @returns {object} Copy of the object
 */
let copy = function(source, def, strict = false) {
	let copy = {};
	update(copy, source, def, strict);
	return copy;
};

export {equal, update, copy};