/* global Notification */
/* global _ */
/* global RLib */
/* global toolkit */
/* global Sortable */
var DEBUG = DEBUG || {};

/**
 * @param {Ctrl} ctrl
 * @returns {Ihm}
 */
function Ihm(ctrl, configTables){
	
	var ihm = {};
	var ctrack = {id:0, pls:0, dur:0, title:"", artist:"", album:"", cover:""};
	
	var tab = 0; // 0 = home, 1 = playlists, 2 = queue, 3 = settings, 4 = equalizer, 5 = credits, 6 = scheduler, 7 = errors
	function setTab(t){tab = t;}
	function getTab(){return tab;}
	
	var timebar;
	var volumebar;
	var i18n;
	var system = {};
	var buttonTemplates;
	var popup;
	
	// Modules
	var settings, equalizer, playlists, queue;
	
	// DEBUG
	DEBUG.ctrack = ctrack;
	DEBUG.playlists = playlists;
	DEBUG.system = system;
	
	ihm.i18n = function(messages){
		i18n = messages;

		// DOM templates
		buttonTemplates = {
			download:(function(){
				var btn = document.createElement("div");
				btn.appendChild(document.createTextNode("download"));
				btn.className = "control";
				return btn;
			})(),
			queue:(function(){
				var btn = document.createElement("div");
				btn.appendChild(document.createTextNode("queue"));
				btn.className = "control queue";
				btn.title = i18n.playlists.queueAdd();
				return btn;
			})(),
			remove:(function(){
				var btn = document.createElement("div");
				btn.appendChild(document.createTextNode("remove"));
				btn.className = "control queue";
				btn.title = i18n.playlists.queueAdd();
				return btn;
			})(),
			up:(function(){
				var btn = document.createElement("div");
				btn.appendChild(document.createTextNode("up"));
				btn.className = "control queue";
				btn.title = i18n.playlists.queueAdd();
				return btn;
			})()
		};
	};
		
	ihm.init = function(){
		equalizer = Ihm.equalizer({i18n:i18n, setStatus:ctrl.setStatus, refreshEQ:ctrl.refreshEQ, configTables:configTables, setTab:setTab, getTab:getTab});
		equalizer.init();
		settings = Ihm.settings({i18n:i18n, configTables:configTables, setEqColors:equalizer.setColors, setTab:setTab, getTab:getTab, refreshTrack:function(){ihm.updateTrack({track_id:ctrack.id, playlist_id:ctrack.pls});}});
		settings.init();
		queue = Ihm.queue({i18n:i18n, queueMove:ctrl.queuemove, unqueue:ctrl.unqueue, unqueueGroup:ctrl.unqueueGroup, setRating:ctrl.setRating, conf:settings.conf, buttonTemplates:buttonTemplates, setTab:setTab, getTab:getTab, getTabPls:function(){return playlists.tab;}});
		queue.init();
		ihm.loadQueue = queue.load;
		playlists = Ihm.playlists({i18n:i18n, ctrack:ctrack, loadPlaylist:ctrl.loadPlaylist, queue:ctrl.queue, queueGroup:ctrl.queueGroup, unqueue:ctrl.unqueue, unqueueGroup:ctrl.unqueueGroup, play:ctrl.play, download:ctrl.download, setRating:ctrl.setRating, conf:settings.conf, saveConfig:settings.saveConfig, buttonTemplates:buttonTemplates, showTrack:ihm.showTrack, showPopup:showPopup, inQueue:queue.in, setTab:setTab, getTab:getTab});
		playlists.init();
		ihm.updatePlaylists = playlists.update;
		ihm.loadPlaylist = playlists.load;
		
		$("#bprev, #fbprev").click(ctrl.previous).attr("title",i18n.controls.prev);
		$("#bstop").click(ctrl.stop).attr("title",i18n.controls.stop);
		$("#bpause, #fbpause").click(ctrl.pause).attr("title",i18n.controls.pause);
		$("#bplay, #fbplay").click(function(){ctrl.play();}).attr("title",i18n.controls.play);
		$("#bnext, #fbnext").click(ctrl.next).attr("title",i18n.controls.next);
		$("#bshuffle").click(function(){ctrl.shuffle(!$("#bshuffle").hasClass("active"));}).attr("title",i18n.controls.shuffle);
		$("#brepeat").click(function(){ctrl.repeat(!$("#brepeat").hasClass("active"));}).attr("title",i18n.controls.repeat);
		$("#bvolume").mouseover(function(){setTimeout(function(){$("#controlbuttons").addClass("volume");},10);}).click(function(){if($("#controlbuttons").hasClass("volume"))ctrl.setStatus(5, 1*!$("#bvolume").hasClass("active"));});
		$("#controls").mouseleave(function(){$("#controlbuttons").removeClass("volume");});
		$('nav a[data-lnk="queue"]').click(queue.show).text(i18n.nav.queue);
		$('nav a[data-lnk="errors"]').click(showErrors).text(i18n.nav.errors);
		$('nav h2[data-h="playlists"]').text(i18n.nav.playlists);
		$('nav h2[data-h="settings"]').text(i18n.nav.settings);
		$('nav a[data-lnk="settings"]').click(settings.show).text(i18n.nav.settings);
		$('nav a[data-lnk="equalizer"]').click(equalizer.show).text(i18n.nav.equalizer);
		$('nav a[data-lnk="scheduler"]').click(showScheduler).text(i18n.nav.scheduler);
		$('nav a[data-lnk="credits"]').click(showCredits).text(i18n.nav.credits);
		$('nav a[data-lnk="fullscreen"]').click(function(){toolkit.toggleFullScreen();}).text(i18n.generic.fullscreen);
		$("#title").click(function(){
			if(playlists.tab !== ctrack.pls || tab !== 1) playlists.show(ctrack.pls, ctrack.id);
			else {
				playlists.scrollToTrack(ctrack.id);
			}
		});
		$('#cover').click(function(e){
			showPopup(ctrack.t, ctrack.pls, e);
		});
		$("#fbmenu").click(function(){
			$.scrollTo("nav", {duration:500});
		});
		$("#fbsearch").click(function(){
			$.scrollTo("#main h1", {duration:500});
			setTimeout(function(){$("#searchbar input").focus();},500);
		});
		
		timebar = RLib.hslider("#timebar", function(pos){ctrl.setStatus(31, Math.round(pos/1000));}, toolkit.time);
		volumebar = RLib.hslider("#volumebar", function(v){ctrl.setStatus(1, Math.round(v));}, function(v){return Math.round(v)+"%";});
		volumebar.setTotal(100);
		$("#controlbuttons").removeClass("volume");
		$("#fbup").click(function(){$.scrollTo(0,{duration:500});});
		
		popup = $('<div id="popup">').appendTo(document.body);
		document.body.addEventListener("click",function(e){
			if(!$(e.target).parents("#popup").length && $("#popup").css("display") === "block"){
				hidePopup();
				if(window.matchMedia("(max-width:799px)").matches){
					e.preventDefault();
					e.stopPropagation();
				}
			}
		},true);
	};
	
	ihm.updateState = function(o, p){
		if(o.playback_state){
		$("#bplay,#bstop,#bpause,#fbplay,#fbpause").removeClass("active");
			$("#brepeat,#bshuffle,#bvolume").removeClass("active");
			
			if(o.playback_state === "stopped"){$("#bstop").addClass("active");}
			else if(o.playback_state === "playing"){$("#bplay,#fbplay").addClass("active");}
			else if(o.playback_state === "paused"){$("#bpause,#fbpause").addClass("active");}
			
			if(o.repeat_mode_on)$("#brepeat").addClass("active");
			if(o.shuffle_mode_on)$("#bshuffle").addClass("active");
			if(o.mute_mode_on)$("#bvolume").addClass("active");
			
			volumebar.setPosition(o.volume);
			$("#volume").text(o.volume+"%");
		}else if(typeof o.value !== "undefined" && p){
			if(p.status_id === 1){ // volume
				volumebar.setPosition(o.value);
				$("#volume").text(o.value+"%");
			}else if(p.status_id === 2){ // balance
				equalizer.loadBalance(o.value);
			}else if(p.status_id === 3){ // speed
				equalizer.loadSpeed(o.value);
			}else if(p.status_id === 4){ // play state
				$("#bplay,#bstop,#bpause,#fbplay,#fbpause").removeClass("active");
				if(o.value === 0){$("#bstop").addClass("active");}
				else if(o.value === 1){$("#bplay,#fbplay").addClass("active");}
				else if(o.value === 2){$("#bpause,#fbpause").addClass("active");}
			}else if(p.status_id === 5){ // mute
				if(o.value)$("#bvolume").addClass("active");
				else $("#bvolume").removeClass("active");
			}else if(p.status_id === 6){ // reverb
				equalizer.loadReverb(o.value);
			}else if(p.status_id === 7){ // echo
				equalizer.loadEcho(o.value);
			}else if(p.status_id === 8){ // chorus
				equalizer.loadChorus(o.value);
			}else if(p.status_id === 9){ // flanger
				equalizer.loadFlanger(o.value);
			}else if(p.status_id === 10){ // equalizer status
				equalizer.loadEnabled((o.value && true) || false);
			}else if(p.status_id > 10 && p.status_id < 29){ // equalizer value
				equalizer.loadGroup(p.status_id - 11, o.value);
			}else if(p.status_id === 29){ // repeat
				if(o.value)$("#brepeat").addClass("active");
				else $("#brepeat").removeClass("active");
			}else if(p.status_id === 41){ // shuffle
				if(o.value)$("#bshuffle").addClass("active");
				else $("#bshuffle").removeClass("active");
			}
		}
	};
	
	ihm.showTrack = function(t){
		ctrack.t = t;
		$("#title").text(ctrack.title = t.title);
		if(!settings.conf.showInfos){
			$("#infos1").text(ctrack.artist = t.artist);
			$("#infos2").text(ctrack.album = t.album);			
		}else{
			$("#infos1").text((ctrack.artist = t.artist)+(t.artist&&t.album?" - ":"")+(ctrack.album = t.album));
			//console.log(t);
			var i=$("#infos2").empty();
			$("<div>").appendTo(i).text(t.filename.indexOf("http")===0?"HTTP":t.extension);
			$("<div>").appendTo(i).text(t.bitrate+"kbps");
			$("<div>").appendTo(i).text(t.channels);
			$("<div>").appendTo(i).text(t.samplerate);
			var rating = RLib.rating(t.arating, t.rating, function(r){
				ctrl.setRating(ctrack.pls, ctrack.id, r);
			});
			$(rating.el).addClass("rating").appendTo(i);
		}
	};
	ihm.showCover = function(o){
		$("#cover").css("background-image","url("+o.album_cover_uri+")").removeClass("nocover");
		ctrack.cover = o.album_cover_uri;
		if(settings.conf.notif){
			if(Notification.permission === "default") Notification.requestPermission(ihm.updateTrack);
			else new Notification(ctrack.title, {body:ctrack.artist+"\n"+ctrack.album, tag:"songPlaying", icon:ctrack.cover});
		}
	};
	ihm.hideCover = function(){
		$("#cover").css("background-image","none").addClass("nocover");
		if(settings.conf.notif){
			if(Notification.permission === "default") Notification.requestPermission(ihm.updateTrack);
			else new Notification(ctrack.title, {body:ctrack.artist+"\n"+ctrack.album, tag:"songPlaying", icon:"css/img/beamed-note.png"});
		}
		return true;
	};
	ihm.updateTrack = function(o){
		var change = false;
		if(o.track_id !== ctrack.id && o.id !== ctrack.id || o.playlist_id !== ctrack.pls){
			change = true;
			if(o.playlist_id !== ctrack.pls){
				$("#playlists > a").removeClass("playing");
				$("#playlists > a[data-id="+o.playlist_id+"]").addClass("playing");
			}
			ctrack.id = o.track_id || o.id;
			ctrack.pls = o.playlist_id;
			ctrack.dur = o.duration;
			ctrack.cover = false;
			timebar.setTotal(ctrack.dur);
			ctrl.loadCover();
			if(playlists.tab === ctrack.pls && tab === 1){
				$("#main .track:not([data-id="+ctrack.id+"])").removeClass("active");
				$("#main .track[data-id="+ctrack.id+"]").addClass("active");
				if(settings.conf.followTrack){
					playlists.scrollToTrack(ctrack.id);
				}
			}
		}
		if(playlists[o.playlist_id] && playlists[o.playlist_id].loaded){
			var old = $.extend({}, ctrack);
			ihm.showTrack(playlists[o.playlist_id].tracks[playlists[o.playlist_id].tmap[o.track_id||o.id]]);
			if(!change && (ctrack.title !== old.title || ctrack.album !== old.album || ctrack.artist !== old.artist)){
				if(ctrack.cover)ihm.showCover({album_cover_uri:ctrack.cover});
				else ihm.hideCover();
			}
		}else if(o.title){
			var old = $.extend({}, ctrack);
			ihm.showTrack(o);
			if(!change && (ctrack.title !== old.title || ctrack.album !== old.album || ctrack.artist !== old.artist)){
				if(ctrack.cover)ihm.showCover({album_cover_uri:ctrack.cover});
				else ihm.hideCover();
			}
		}else{
			ctrl.loadCurrTrack();
		}
	};
	ihm.updatePos = function(p){
		if(p<1e12) $("#time").text(toolkit.time(p));
		timebar.setPosition(p);
	};
	
	function showScheduler(){
		if(!system.scheduler){
			alert(i18n.scheduler.na());
		}else{
			$("#main .detach").detach();
			document.getElementById("main").className = "";
			$("#fixedPanel").removeClass("active");
			tab = 6;
			$("nav a").removeClass("active");
			$("nav a[data-lnk=\"scheduler\"]").addClass("active");
			var m = $("#main").html($("<h1>").text(i18n.nav.scheduler));
		}
	}
	
	function showErrors(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").removeClass("active");
		tab = 7;
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"errors\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(i18n.nav.errors));
		
		$.scrollTo("#main h1");
	}
	
	function showCredits(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").removeClass("active");
		tab = 5;
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"credits\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(i18n.nav.credits));
		$("<p>").appendTo(m).text(i18n.credits.dev({dev:"Gilles Waeber"})+" [").append($("<a>").attr("href","http://gilleswaeber.ch").text("gilleswaeber.ch")).append("]");
		$("<h2>").appendTo(m).text(i18n.credits.ressources);
		$("<p>").appendTo(m).text(i18n.credits.appUsing({what:"Entypo icons",who:"Daniel Bruce"})+" [").append($("<a>").attr("href","http://www.entypo.com").text("www.entypo.com")).append("]");
		$("<p>").appendTo(m).text(i18n.credits.aimp()+" [").append($("<a>").attr("href","http://www.aimp.ru").text("www.aimp.ru")).append("] [").append($("<a>").attr("href","https://github.com/a0ivanov/aimp-control-plugin").text("github.com/a0ivanov")).append("]");
		$("<h2>").appendTo(m).text(i18n.credits.translations);
		$("<p>").appendTo(m).text("French & english translations by Gilles Waeber.");
		$("<p>").appendTo(m).text("Other translation using Aequalizer.shows when possible, completed by Bing Translator.");
		
		$("<p>").appendTo(m).text(" ");
		$.scrollTo("#main h1");
	}
	
	function showPopup(track, playlist, event){
		popup.children().remove();
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.title)).append($('<span>').text(track.title)));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.artist)).append($('<span>').text(track.artist||"-")));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.album)).append($('<span>').text((track.album||"-")+(track.date?" ("+toolkit.year(track.date)+")":"")+(track.disc?" ("+i18n.playlists.discN({n:track.disc})+")":""))));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.duration)).append($('<span>').text(toolkit.time(track.duration))));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.genre)).append($('<span>').text(track.genre||"-")));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.format)).append($('<span>').text(track.filename.indexOf("http")===0?"HTTP":track.extension)));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.quality)).append($('<span>').text(track.channels+"  "+track.bitrate+"kbps  "+track.samplerate)));
		popup.append($('<div>').append($('<span class="field">').text(i18n.playlists.rating)).append($(RLib.rating(track.arating, track.rating, function(r){ctrl.setRating(playlist, track.id, r);}).el).addClass("rating")));
		
		// Tools
		popup.append(function(){
			var copy = $('<select>').change(function(e){
				ctrl.copyTo(track, parseInt(e.target.value)); hidePopup();
			});
			copy.append($('<option value="0">').text(i18n.playlists.copyTo));
			var move = $('<select>').change(function(e){
				ctrl.moveTo(playlist, track, parseInt(e.target.value)); hidePopup();
			});
			move.append($('<option value="0">').text(i18n.playlists.moveTo));
			_.each(_.pairs(playlists.pl).sort(function(a,b){return a[1].title>b[1].title?1:-1;}),function(v){
				if(v[0]===playlist)return;
				copy.append($('<option value="'+v[0]+'">').text(v[1].title));
				move.append($('<option value="'+v[0]+'">').text(v[1].title));
			});
			var del = system.physical_track_deletion ? $('<span>').text(i18n.playlists.delete).click(function(){if(confirm(i18n.playlists.delete()+i18n.generic.colon()+track.title+"\n"+i18n.generic.confirm()))ctrl.deleteTrack(playlist, track.id); hidePopup();}) : null;
			return $('<div class="tools">').append($('<span class="field">').text(i18n.playlists.tools))
				.append($('<span>').text(i18n.playlists.download).click(function(){ctrl.download(playlist, track); hidePopup();}))
				.append($('<span>').text(i18n.playlists.remove).click(function(){ctrl.removeTrack(playlist, track.id); hidePopup();}))
				.append(del)
				.append($('<br>'))
				.append(copy)
				.append($('<br>'))
				.append(move);
		});
		
		popup.css("display","block");
		popup.css("top",Math.min(event.pageY+20, document.body.offsetHeight+window.scrollY-10-popup[0].offsetHeight)+"px");
		popup.css("left",Math.min(event.pageX+20, document.body.offsetWidth-10-popup[0].offsetWidth)+"px");
	}
	function hidePopup(){
		popup.css("display","none");		
	}
	
	ihm.loadVersion = function(v){
		system.aimp_version = v.aimp_version;
		system.plugin_version = v.plugin_version;
	};
	ihm.loadCapabilities = function(c){
		system.physical_track_deletion = c.physical_track_deletion;
		system.scheduler = c.scheduler;
		system.upload_track = c.upload_track;
	};
	
	return ihm;
}