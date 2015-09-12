
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
	
	toolkit.htmlSafe = function(t){
		return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	};
	
	toolkit.delayEach = function(array, callback, delay){
		var myarray = [];
		Array.forEach(array, function(v,k){myarray.push([v,k]);});
		var i = 0;
		function next(){
			if(i >= myarray.length)return;
			callback(myarray[i][0], myarray[i][1]);
			setTimeout(next, delay);
			i++;
		}
		next();
	};
	
	toolkit.pad2 = function(i){
		return (i<10?"0"+i:i);
	};
	
	toolkit.time = function(t){
		t=Math.floor(t/1000);
		if(t<3600)return Math.floor(t/60)+":"+toolkit.pad2(t%60);
		else if(t<360000)return Math.floor(t/3600)+toolkit.pad2(Math.floor(t/60))+":"+toolkit.pad2(t%60);
		else return Math.floor(t/86400)+toolkit.pad2(Math.floor(t/3600))+toolkit.pad2(Math.floor(t/60))+":"+toolkit.pad2(t%60);
	};
	
	toolkit.year = function(d){
		if(d.length <= 4) return d;
		else if(/^[0-9]{4}/.test(d))return d.substr(0,4);
		else return d;
	};
	
	return toolkit;
}();