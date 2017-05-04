/**
 * A module with uri helper functions
 * @module modapp/uri
 */

/**
 * Parses the current location query string of the uri and returns it as a nested
 * object using dot-separation for the namespace.<br>
 * Eg. ?module.login.user=username => {module: {login: {user: "username"}}}
 * @param {string} namespace Dot-separated namespace to use as root.
 */
let getQuery = function(namespace) {
	if (typeof(window) === 'undefined' || !window.location) return {};
	
	var match,
		part,
		search = /([^&=]+)=?([^&]*)/g,
		query  = window.location.search.substring(1).replace(/\+/g, " "),
		params = {};

	namespace = (namespace || "").replace(/([^\.])$/, '$1.');

	while ((match = search.exec(query)) !== null) {
		var key = decodeURIComponent(match[1]);
		if (!key.startsWith(namespace)) continue;
		key = key.substr(namespace.length);
		
		var parts = decodeURIComponent(key).split('.');
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

export {getQuery};