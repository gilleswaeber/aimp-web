/* global _, Ihm */

/**
 * @param {Ihm} ihm
 * @returns {Ihm.errors}
 */
Ihm.errors = function(ihm){
	var errors = {}, e = [];
	
	errors.init = function(){
		
	};
	
	errors.show = function(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").removeClass("active");
		ihm.setTab(7);
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"errors\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(ihm.i18n.nav.errors));
		
		$.scrollTo("#main h1");
	};
	
	errors.defSuccess = function(r){
		
	};
	
	
	errors.defError = function(f){
		console.log(ihm.conf, f);
	};
	
	return errors;
};