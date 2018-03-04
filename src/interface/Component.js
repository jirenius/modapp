/**
 * A UI component
 * @interface Component
 */

/**
 * Renders the component by appending its own element(s) to the provided parent element.<br>
 * The provided element is not required to be empty, and may therefor contain other child elements.<br>
 * The component is not required to append any element in case it has nothing to render.<br>
 * Render is never called two times in succession without a call to unrender in between.
 * @function
 * @name Component#render
 * @param {HTMLElement|DocumentFragment} el Parent element in which to render the contents
 * @returns {this}
 */

/**
 * Unrenders the component and removes its element(s) from the parent element.<br>
 * Only called after render and never called two times in succession without a call to render in between.
 * @function
 * @name Component#unrender
 */
