/**
 * A module with array helper functions
 * @module modapp/array
 */

/**
 * Makes a binary search for a item in an array using a compare function
 * @param {Array} arr Array to search in
 * @param {*} item Item to search for
 * @param {function} compare Compare function
 * @returns Index of a matching item in the array if one exists, otherwise the bitwise complement of the index where the item belongs
 */
export let binarySearch = function (arr, item, compare) {
	var l = 0,
		h = arr.length - 1,
		m, c;

	while (l <= h) {
		m = (l + h) >>> 1;
		c = compare(arr[m], item);
		if( c < 0 ) {
			l = m + 1;
		} else if( c > 0 ) {
			h = m - 1;
		} else {
			return m;
		}
	}
	return ~l;
};

/**
 * Inserts an item into an ordered array
 * @param {Array} arr Array to insert in
 * @param {*} item Item to insert
 * @param {function} compare Compare function
 * @param {boolean=} duplicate True if a duplicate value should be inserted, false if no insert should be made.
 * @return {number} The index of where in the array the item was insert, or the duplicate was found.
 */
export let binaryInsert = function (arr, item, compare, duplicate = false) {
	var i = this.binarySearch(arr, item, compare);
	if( i >= 0 ) { /* Matching object was found */
		if( !duplicate ) return i;
	} else { /* if the return value was negative, the bitwise complement of the return value is the correct index for this object */
		i = ~i;
	}
	arr.splice(i, 0, item);
	return i;
};