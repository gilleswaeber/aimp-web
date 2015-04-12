
NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 * Generic JS Toolkit containing generic functions and polyfills.
 */
var toolkit = function(){
	var toolkit = {};
	
	/**
	 * Does nothing
	 */
	toolkit.noop = function(){};
	
	/**
	 * Toogle fullscreen mode.
	 * @param {DOMElement} element [opt] the element which to apply the fullscreen
	 * @param {function} errorCallback [opt] function to call if Fullscreen API is not supported
	 * @see https://developer.mozilla.org/fr/docs/Web/Guide/DOM/Using_full_screen_mode
	 */
	toolkit.toggleFullScreen = function(element, errorCallback){
		element = element || document.documentElement;
		errorCallback = errorCallback || toolkit.noop;
		if (!document.fullscreenElement && // alternative standard method
				!document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
			if (document.documentElement.requestFullscreen) {
				element.requestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			} else {
				errorCallback();
			}
		} else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}
	};
	
	return toolkit;
}();