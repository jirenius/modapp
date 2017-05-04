/**
 * A module with HTMLElement helper functions
 * @module modapp/elem
 */

/**
 * Creates a new document element
 * @param {string} tagName Name of the tag. Eg. 'div'.
 * @param {string=} className Optional name of class or space separated classes.
 * @param {object=} opt Options
 * @param {Array.<HTMLElement>=} opt.children Optional array of child elements.
 * @param {string} opt.text Optional text content. Ignored if children is set.
 * @returns {HTMLElement} Created document element.
 */
export let create = function (tagName, className, opt) {
	let el = document.createElement(tagName);
	if( className ) {
		if( typeof className == 'object' ) {
			opt = className;
		} else {
			el.className = className;
		}
	}

	if( opt ) {
		if( opt.children ) {
			for( var i = 0; i < opt.children.length; i++ ) {
				el.appendChild(opt.children[i]);
			}
		} else if( opt.text ) {
			el.textContent = opt.text;
		}
	}

	return el;
};

/**
 * Appends a child to a parent element
 * @param {?HTMLElement} parent Parent element. If null or undefined, nothing will be performed.
 * @param {?HTMLElement} child Child element. If null or undefined, nothing will be performed.
 * @returns {?HTMLElement} The appended child.
 */
export let append = function(parent, child) {
	if( !parent || !child ) return child || null;
	return parent.appendChild(child);
};

/**
 * Removes an element from the parent element
 * @param {?HTMLElement} child Child element. If null or undefined, nothing will be performed.
 * @returns {?HTMLElement} Old child element.
 */
export let remove = function(child) {
	if( !child || !child.parentNode ) return child || null;
	return child.parentNode.removeChild(child);
};

/**
 * Empties an element of all child nodes.
 * @param {?HTMLElement} element Element
 * @returns {?HTMLElement} ELement.
 */
export let empty = function(element) {
	if( !element ) return element || null;
	while( element.firstChild ) {
		element.removeChild(element.firstChild);
	}
	return element;
};