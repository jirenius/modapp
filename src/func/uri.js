/**
 * A module with uri helper functions
 * @module
 */

/**
 * Parses the current location query string of the uri and returns it as a nested
 * object using dot-separation for the namespace.
 * Eg. ?module.login.user=username => {module: {login: {user: "username"}}}
 */
export let getQuery = function() {
	if (typeof(window) === 'undefined' || !window.location) return {};

	var match,
		part,
		search = /([^&=]+)=?([^&]*)/g,
		query  = window.location.search.substring(1).replace(/\+/g, " "),
		params = {};

	while ((match = search.exec(query)) !== null) {
		var parts = decodeURIComponent(match[1]).split('.');
		var o = params;
		for (var i = 0; i < parts.length; i++) {
			part = parts[i];
			if (!part) continue;

			if (i == parts.length-1) {
				o[part] = decodeURIComponent(match[2]);
			} else {
				if (typeof o[part] !== 'object') o[part] = {};
				o = o[part];
			}
		}
	}

	return params;
};