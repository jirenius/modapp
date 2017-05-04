/**
 * A module with animation helper functions
 * @module modapp/anim
 */

const FADE_DURATION = 200;
const SWIPE_DISTANCE = 64;

/**
 * Fades the opacity of an element with the duration based on the elements current opacity.
 * @param {HTMLElement} element HTML element to fade.
 * @param {number} opacity Opacity to fade to.
 * @param {object} [opt] Optional parameters
 * @param {number} [opt.duration] Optional fade duration in milliseconds, measured when going from 0 to 1 opacity.
 * @param {function} [opt.callback] Optional callback function once the animation is complete.
 */
export let fade = function(element, opacity, opt = {}) {
	let callback = opt.callback || null;
	let startOpacity = element.style.opacity ? Number(element.style.opacity) : 1;
	if( startOpacity == opacity ) {
		if( callback ) callback();
		return null;
	}

	// Calculate start time relative to start opacity.
	let duration = (opt.duration || FADE_DURATION) * Math.abs(startOpacity - opacity);
	let start = null;
	let token = {};
	let step = function(timestamp) {
		if( !start ) start = timestamp;
		let progress = (timestamp - start) / duration;
		if( progress >= 1 ) {
			element.style.opacity = opacity;
			if( callback ) callback();
			return;
		}

		element.style.opacity = progress * opacity + (1-progress) * startOpacity;
		token.requestId = window.requestAnimationFrame(step);
	}.bind(this);

	token.requestId = window.requestAnimationFrame(step);
	return token;
};

/**
 * Swipes an element out to the side while fading it out.
 * @param {HTMLElement} element HTML element to swipe out.
 * @param {number} direction Direction to swipe. -1 for left, 0 for fade only, and 1 for right.
 * @param {object=} opt Optional parameters
 * @param {number=} opt.duration Optional fade duration in milliseconds.
 * @param {number=} opt.distance Optional swipe distance in pixels.
 * @param {number=} opt.reset Optional reset flag. If true, opacity and position will be reset. If false, animation will continue from current position and opacity. Default is true.
 * @param {function=} opt.callback Optional callback function once the animation is complete.
 */
export let swipeOut = function(element, direction, opt = {}) {
	let callback = opt.callback || null;
	let startProgress = 0;
	let basePos = 0;
	let dirDist = direction * (opt.distance || SWIPE_DISTANCE);
	if( opt.reset !== undefined ? opt.reset : true ) {
		element.style.opacity = '';
		element.style.left = '';
	} else {
		startProgress = element.style.opacity ? 1-parseFloat(element.style.opacity) : 0;
		if( startProgress == 1 ) {
			if( callback ) callback();
			return null;
		}
		// The assumed position from where the swipe animation started
		basePos = (element.style.left ? parseFloat(element.style.left) : 0) - dirDist * startProgress * startProgress;
	}

	let duration = opt.duration || FADE_DURATION;
	let start = null;
	let token = {};
	let step = function(timestamp) {
		// Calculate start time relative to start opacity. 
		if( !start ) start = timestamp - duration * startProgress;
		let progress = (timestamp - start) / duration;
		if( progress >= 1 ) {
			element.style.opacity = 0;
			if( callback ) callback();
			return;
		}

		element.style.opacity = 1-progress;
		element.style.left = (basePos + dirDist * progress * progress) + 'px';
		token.requestId = window.requestAnimationFrame(step);
	}.bind(this);

	token.requestId = window.requestAnimationFrame(step);
	return token;
};

/**
 * Swipes an element in from the side while fading it in.
 * @param {HTMLElement} element HTML element to swipe in.
 * @param {number} direction Direction to swipe. -1 for left, 0 for fade only, and 1 for right. Ignored if opt.reset is false.
 * @param {object=} opt Optional parameters
 * @param {number=} opt.duration Optional fade duration in milliseconds.
 * @param {number=} opt.distance Optional swipe distance in pixels.
 * @param {number=} opt.reset Optional reset flag. If true, opacity and position will be reset. If false, animation will continue from current position and opacity. Default is true.
 * @param {function=} opt.callback Optional callback function once the animation is complete.
 */
export let swipeIn = function(element, direction, opt = {}) {
	let callback = opt.callback || null;
	let startProgress = 0;
	let dirDist = direction * (opt.distance || SWIPE_DISTANCE);
	let basePos = -dirDist;
	
	if( opt.reset !== undefined ? opt.reset : true ) {
		element.style.opacity = 0;
	} else {
		startProgress = element.style.opacity ? parseFloat(element.style.opacity) : 1;
		if( startProgress == 1 ) {
			if( callback ) callback();
			return null;
		}
		// Set direction distance to the negative of current position
		dirDist = (element.style.left ? -parseFloat(element.style.left) : 0);
		// The assumed position from where the swipe animation started
		basePos = dirDist * startProgress * (2 - startProgress) - dirDist;
	}

	let duration = opt.duration || FADE_DURATION;
	let start = null;
	let token = {};
	let step = function(timestamp) {
		// Calculate start time relative to start opacity.
		if( !start ) start = timestamp - duration * startProgress;
		let progress = (timestamp - start) / duration;
		if( progress >= 1 ) {
			element.style.opacity = '';
			element.style.left = '';
			if( callback ) callback();
			return;
		}

		element.style.opacity = progress;
		element.style.left = (basePos + dirDist * progress * (2 - progress)) + 'px';
		token.requestId = window.requestAnimationFrame(step);
	}.bind(this);

	token.requestId = window.requestAnimationFrame(step);
	return token;
};

export let stop = function(token) {
	if( token && token.requestId ) {
		window.cancelAnimationFrame(token.requestId);
		delete token.requestId;
	}
	return null;
};