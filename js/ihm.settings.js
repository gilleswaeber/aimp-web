/* global Notification, _, Ihm */

/**
 * @param {Ihm} ihm
 * @returns {Ihm.settings}
 */
Ihm.settings = function(ihm){
	var settings = {}, conf;
	
	settings.init = function(){
		conf = JSON.parse(localStorage.getItem("AimpWebConf") || "{}");
		if(!conf.sort)conf.sort = {};
		settings.conf = conf;
		
		if(conf.skin && ihm.configTables.skins[conf.skin]) applySkin(ihm.configTables.skins[conf.skin]);
	};
	
	var noScroll = false;
    settings.show = function(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").removeClass("active");
        ihm.setTab(3);
        $("nav a").removeClass("active");
        $("nav a[data-lnk=\"settings\"]").addClass("active");
        var m = $("#main").html($("<h1>").text(ihm.i18n.nav.settings));
		$("<p>").appendTo(m).text(ihm.i18n.settings.saveT);
		
		$("<h2>").appendTo(m).text(ihm.i18n.settings.lang);
		$("<p>").appendTo(m).text(ihm.i18n.settings.langT()+" "+ihm.i18n.settings.reloadT());
		var clang = localStorage.getItem("lang") || "en";
		var ll = $("<div>").appendTo(m).addClass("langs");
		_.each(ihm.configTables.lang, function(v,k){
			var l = $("<div>").appendTo(ll);
			$("<div>").appendTo(l).text(v.l).addClass("name");
			$("<div>").appendTo(l).text(v.en).addClass("enname");
			$("<div>").appendTo(l).text(v.credits).addClass("author");
			if(k === clang)l.addClass("active");
			else l.click(function(){
				localStorage.setItem("lang", k);
				document.location = "./";
			});
		});
		
		$("<h2>").appendTo(m).text(ihm.i18n.settings.skins);
		$("<p>").appendTo(m).text(ihm.i18n.settings.skinsT);
		var cskin = conf.skin || "cleanGreen";
		var sl = $("<div>").appendTo(m).addClass("skins");
		_.each(ihm.configTables.skins, function(v,k){
			var l = $("<div>").appendTo(sl);
			$("<div>").appendTo(l).css("background", v.background);
			$("<div>").appendTo(l).css("background", v.foreground);
			$("<div>").appendTo(l).css("background", v.accent);
			$("<div>").appendTo(l).css("background", v.background2);
			if(k === cskin)l.addClass("active");
			else l.click(function(){
				conf.skin = k;
				saveConfig();
				applySkin(v);
				noScroll=true;showSettings();
			});
		});
				
		$("<h2>").appendTo(m).text(ihm.i18n.settings.notifications);
		if(!window.Notification || !window.Notification.permission)$("<p>").appendTo(m).text(ihm.i18n.settings.notSupported()+" [").append($("<a>").text("caniuse.com/#feat=notifications").attr("href","http://caniuse.com/#feat=notifications")).append("]");
		else if(Notification.permission === "denied"){
			$("<div>").appendTo(m).addClass("checkbox").text(ihm.i18n.generic.blocked).addClass("blocked");
		}else if(conf.notif){
			$("<div>").appendTo(m).addClass("checkbox").text(ihm.i18n.generic.enabled).addClass("active").click(function(){
				conf.notif = false;
				saveConfig();
				noScroll=true;showSettings();
			});
		}else{
			$("<div>").appendTo(m).addClass("checkbox").text(ihm.i18n.generic.disabled).click(function(){
				conf.notif = true;
				saveConfig();
				Notification.requestPermission(ihm.updateTrack);
				noScroll=true;showSettings();
			});
		}
		$("<span>").appendTo(m).text(ihm.i18n.settings.notificationsT);
		
		$("<h2>").appendTo(m).text(ihm.i18n.settings.sorting);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.globalSort ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.globalSort ? "active" : "").click(function(){
			conf.globalSort = !(conf.globalSort && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.globalSort);
		$("<br>").appendTo(m);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.oneGroup ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.oneGroup ? "active" : "").click(function(){
			conf.oneGroup = !(conf.oneGroup && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.oneGroup);
		$("<br>").appendTo(m);
		$("<br>").appendTo(m);
		$("<button>").appendTo(m).text(ihm.i18n.settings.reset).click(function(){
			if(confirm(ihm.i18n.settings.resetSort()+"\n"+ihm.i18n.generic.confirm())){
				conf.sort = {};
				saveConfig();
			}
		});
		$("<span>").appendTo(m).text(" "+ihm.i18n.settings.resetSort());
		
		$("<h2>").appendTo(m).text(ihm.i18n.settings.display);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.downloadButton ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.downloadButton ? "active" : "").click(function(){
			conf.downloadButton = !(conf.downloadButton && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.downloadButton);
		$("<br>").appendTo(m);		
		$("<div>").appendTo(m).addClass("checkbox").text(!conf.hideRatings ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(!conf.hideRatings ? "active" : "").click(function(){
			conf.hideRatings = !(conf.hideRatings && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.showRating);
		$("<br>").appendTo(m);		
		$("<div>").appendTo(m).addClass("checkbox").text(conf.showInfos ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.showInfos ? "active" : "").click(function(){
			conf.showInfos = !(conf.showInfos && true || false);
			saveConfig();
			noScroll=true;showSettings();
			ihm.refreshTrack();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.showInfos);
		$("<br>").appendTo(m);
		
		$("<h2>").appendTo(m).text(ihm.i18n.settings.misc);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.followTrack ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.followTrack ? "active" : "").click(function(){
			conf.followTrack = !(conf.followTrack && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.settings.followTrack);
		$("<br>").appendTo(m);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.debug ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).addClass(conf.debug ? "active" : "").click(function(){
			conf.debug = !(conf.debug && true || false);
			saveConfig();
			noScroll=true;showSettings();
		});
		$("<span>").appendTo(m).text(ihm.i18n.errors.debugMode);
		
		$("<p>").appendTo(m).text(" ");
		if(!noScroll) $.scrollTo("#main h1");
		noScroll = false;
    };
	
	function saveConfig(){
		localStorage.setItem("AimpWebConf", JSON.stringify(conf));
	}
	settings.saveConfig = saveConfig;
	
	function applySkin(skin){
		$("<style>"+
			"header, nav, body, #main button, #fixedPanel, #main h2{ background:" +skin.background+";}"+
			"nav a.active.playing{ border-color:" +skin.background+";}"+
			"nav a.active, .checkbox.active, .rlib_tip{ color:" +skin.background+";}"+
			
			"#songblock, #timebar, #controlbuttons #volumebar, .rlib_slider, .checkbox, .eqMSlider, #searchbar{ background: "+skin.background2+";}"+
			"#main .group h2{ border-color: "+skin.background2+";}"+
			"#popup, #popup .tools select{ color: "+skin.background2+";}"+
			
			".skins > div, header, nav, #main button, #fixedPanel, .track .control{ border-color:"+skin.foreground+";}"+
			".rlib_limit, .rlib_tip, #popup{ background:"+skin.foreground+";}"+
			"body, #main button, #searchbar input{ color:"+skin.foreground+";}"+
			
			"nav a.active, .rlib_hfilled, .checkbox.active{ background:" +skin.accent+";}"+
			"#cover.nocover, #controlbuttons div.active, .track.queued .control.queue, a:link, a:visited, .groups .active, .sorts .active, #fixedPanel div.active, .rlib_rating.set .star{ color: "+skin.accent+";}"+
			"nav a.playing, .skins > div.active{ border-color:" +skin.accent+";}"+
		"</style>").appendTo("head");
		ihm.setEqColors(skin.foreground, skin.accent);
	}
	
	return settings;
};