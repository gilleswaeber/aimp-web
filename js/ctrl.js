/* global toolkit */
var DEBUG = DEBUG || {};

function Ctrl(){
	var configTables = {
		lang:{
			en:{
				en:"English", l:"English", credits:"Gilles Waeber"
			},
			fr:{
				en:"French", l:"Français", credits:"Gilles Waeber"
			},
			ru:{
				en:"Russian", l:"Русский", credits:"Automatic translation, using Artem Izmaylov AIMP translation"
			},
			de:{
				en:"German", l:"Deutsch", credits:"Automatic translation, using Martin Grunwald (martingrunwald@gmail.com) AIMP translation"
			},
			es:{
				en:"Spanish", l:"Español", credits:"Automatic translation, using Lino Sotomayor (ljsp1@hotmail.com) [www.ReactOS.org] & Mario Angel (marioangel70@gmail.com) [www.tatinweb.com.ar] AIMP translation"
			},
			ja:{
				en:"Japanese", l:"日本語", credits:"Automatic translation, using Tilt AIMP translation"
			},
			ko:{
				en:"Korean", l:"한국어", credits:"Automatic translation, using 松潭 권영관 [SongDam Ansgarius, 로보트킹] AIMP translation"				
			},
			th:{
				en:"Thai", l:"ไทย", credits:"Automatic translation, using VAMPIRE AND DC (Decepticons.p4@gmail.com) AIMP translation"
			},
			"zh-CHS":{
				en:"Simplified Chinese", l:"简体中文", credits:"Automatic translation, using nabarl (realnabarl@gmail.com) AIMP translation"
			}
		},
		skins:{
			cleanGreen:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#484"},
			cleanBlue:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#488"},
			cleanPurple:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#828"},
			cleanRed:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#A22"},
			cleanGrey:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#888"},
			
			brightGreen:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#0D0"},
			brightBlue:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#0DD"},
			brightPink:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#F06"},
			brightRed:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#F00"},
			brightOrange:{background:"#FFF", background2:"#EEE", foreground:"#000", accent:"#F72"},
			
			geekGreen:{background:"#000", background2:"#333", foreground:"#2A2", accent:"#0F0"},
			geekRed:{background:"#000", background2:"#333", foreground:"#A00", accent:"#F00"},
			geekBlue:{background:"#000", background2:"#333", foreground:"#2AA", accent:"#0FF"},
			geekYellow:{background:"#000", background2:"#333", foreground:"#AA2", accent:"#FF0"},
			
			darkGreen:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#2B2"},
			darkOrange:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#F91"},
			darkRed:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#C22"},
			darkBlue:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#2CC"},
			darkBlue2:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#26C"},
			darkPurple:{background:"#000", background2:"#333", foreground:"#DDD", accent:"#C2C"},
			darkGrey:{background:"#000", background2:"#333", foreground:"#AAA", accent:"#EEE"},
			
			fullGreen:{background:"#030", background2:"#050", foreground:"#DDD", accent:"#0D0"},
			fullBlue:{background:"#003", background2:"#005", foreground:"#DDD", accent:"#0DD"},
			fullRed:{background:"#311", background2:"#522", foreground:"#DDD", accent:"#D00"},
			fullYellow:{background:"#332", background2:"#553", foreground:"#DDD", accent:"#DD0"},
			fullPurple:{background:"#303", background2:"#505", foreground:"#DDD", accent:"#D0D"},
			
			aimp:{background:"#444", background2:"#333", foreground:"#EEE", accent:"#F91"},
			purpleYellow:{background:"#303", background2:"#505", foreground:"#DDD", accent:"#DD0"},
			blueYellow:{background:"#003", background2:"#005", foreground:"#DDD", accent:"#DD0"},
			blueOrange:{background:"#003", background2:"#005", foreground:"#DDD", accent:"#F62"},
			bluePink:{background:"#003", background2:"#005", foreground:"#DDD", accent:"#D08"},
			yellowPurple:{background:"#330", background2:"#550", foreground:"#DDD", accent:"#D0D"},
			greenRed:{background:"#030", background2:"#050", foreground:"#DDD", accent:"#D00"},
			redGreen:{background:"#300", background2:"#500", foreground:"#DDD", accent:"#5C0"}
		},
		presets:{
			def				:[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],
			ballad			:[34,39,50,55,60,63,65,63,60,57,50,44,39,39,39,36,55,34],
			classic			:[50,50,50,50,50,50,50,50,50,50,50,50,50,40,30,30,30,22],
			club			:[50,50,50,52,55,56,58,60,63,65,61,58,56,55,52,50,50,50],
			dance			:[80,71,66,56,51,50,50,45,43,40,36,36,36,36,35,36,50,50],
			fullBass		:[74,73,73,73,68,63,52,49,44,40,36,35,33,30,28,26,22,20],
			fullBassTreble	:[74,73,73,71,63,50,29,43,45,50,54,56,63,70,76,77,80,80],
			fullTreble		:[23,23,23,23,28,30,34,41,51,59,66,77,85,91,92,92,93,93],
			heavyMetal		:[43,57,63,60,50,36,33,33,33,33,41,47,51,59,68,71,72,58],
			jazz			:[60,70,67,61,55,36,33,33,43,54,65,80,60,44,35,41,48,58],
			live			:[68,68,68,50,50,50,50,50,50,50,50,50,50,50,50,50,68,68],
			pop				:[44,51,63,68,68,65,56,52,48,45,45,44,43,43,40,43,43,49],
			rap				:[50,63,67,59,50,36,35,39,50,55,44,31,48,59,65,66,58,50],
			rock			:[68,65,61,37,28,27,38,40,49,56,65,70,73,74,76,76,76,77],
			soft			:[63,58,52,51,44,40,43,45,51,56,65,70,73,74,77,77,77,77],
			softRock		:[55,56,56,56,52,49,45,40,35,36,35,36,36,43,50,58,68,77],
			vocal			:[33,35,36,43,49,54,55,61,71,80,73,65,58,50,47,43,40,40],
			sinus			:[44,54,63,69,72,73,66,55,39,31,25,27,31,42,54,65,72,78]
		},
		eqaulizers:[31, 63, 87, 125, 175, 250, 350, 500, 700, "1k", "1.4k", "2k", "2.8k", "4k", "5.6k", "8k", "11.2k", "16k"]
	};
	var itfIhm = {}, ctrl = {};
	
	var TRACK_FIELDS = ["channels","path","extension","filename","samplerate","arating","folder","creationdate","creationtime","disc","track","modificationdate","modificationtime"],
		PLAYLIST_FIELDS = ["album","artist","bitrate","channels","path","extension","filename","genre","samplerate","duration","filesize","title","date","folder","id","creationdate","creationtime","disc","track","arating","rating","modificationdate","modificationtime"],
		QUEUE_FIELDS = PLAYLIST_FIELDS.slice(); QUEUE_FIELDS.push("playlist_id");
	
	/**
	 * @type Wrk
	 */
	var wrk = Wrk("",function(r){console.log(r);},function(f){console.log(f);return true;});
	/**
	 * @type Ihm
	 */
	var ihm = Ihm(itfIhm, configTables);
		
	DEBUG.wrk = wrk;
	
	function noop(){}
	
	var i18nLoaded = false;
	ctrl.i18n = function(messages){
		ihm.i18n(messages);
		i18nLoaded = true;
	};
	
	ctrl.init = function(){
		var i;
		if(!i18nLoaded){
			localStorage.removeItem("lang");
			document.location = "./";
		}
		ihm.init();
		for(i=1;i<=29;i++)wrk.status(ihm.updateState, null, i); // volume, balance, speed, play state, mute, reverb, echo, chorus, flanger, equalizer_on, 11 = equalizer 1, ..., 28 = equalizer 18, repeat
		wrk.status(ihm.updateState, null, 41); // shuffle
		wrk.status(function(r){
			wrk.position.setState(["stopped", "playing", "paused"][r.value]);
		}, null, 4);
		wrk.playlists(ihm.updatePlaylists,null,["id","title","crc32"]);
		itfIhm.loadCurrTrack();
		itfIhm.loadCover();
		wrk.position.subscribe(ihm.updatePos);
		wrk.position.forceUpdate();
		wrk.loadQueueMapped(ihm.loadQueue,null,QUEUE_FIELDS);
		wrk.subscribe.controlPanelState(controlPanelEvent);
		wrk.subscribe.track(trackEvent);
		wrk.subscribe.playlists(playlistEvent);
		wrk.version(ihm.loadVersion);
		wrk.pluginCapabilities(ihm.loadCapabilities);
	};
	
	function controlPanelEvent(r){
		wrk.subscribe.controlPanelState(controlPanelEvent);
		ihm.updateState(r);
		itfIhm.loadCurrTrack();
		wrk.position.setState(r.playback_state);
		reloadQueue();
	}
	function trackEvent(r){
		wrk.subscribe.track(trackEvent);
		itfIhm.loadCurrTrack();
		wrk.position.forceUpdate();
		reloadQueue();
	}
	function playlistEvent(){
		wrk.subscribe.playlists(playlistEvent);
		itfIhm.loadCurrTrack();
		wrk.playlists(ihm.updatePlaylists,null,["id","title","crc32"]);
		reloadQueue();
	}
	
	function reloadQueue(){
		wrk.loadQueueMapped(ihm.loadQueue,null,QUEUE_FIELDS);
	}
	
	itfIhm.play = function(playlist_id, track_id){
		wrk.play(noop,null,playlist_id, track_id);
		wrk.position.forceUpdate();
	};
	itfIhm.pause = function(){
		wrk.pause(noop);
	};
	itfIhm.stop = function(){
		wrk.stop(noop);
	};
	itfIhm.shuffle = function(s){
		wrk.shuffle(noop, null, s);
	};
	itfIhm.repeat = function(r){
		wrk.repeat(noop, null, r);
	};
	
	itfIhm.next = function(){
		wrk.next(noop);
	};
	itfIhm.previous = function(){
		wrk.previous(noop);
	};
	
	itfIhm.setStatus = function(s, v){
		wrk.status(noop, null, s, v);
		wrk.position.forceUpdate();
	};
	
	itfIhm.queue = function(playlist_id, track_id){
		wrk.queue(reloadQueue, null, playlist_id, track_id);
	};
	itfIhm.queueGroup = function(entries){
		if(entries.length === 0) return;
		entries.n = entries.length;
		entries.i = 0;
		entries.forEach(function(v){
			wrk.queue(function(){
				entries.i++;
				if(entries.i >= entries.n) reloadQueue();
			}, null, v.playlist_id, v.track_id);
		});
	};
	itfIhm.unqueue = function(playlist_id, track_id){
		wrk.unqueue(reloadQueue, null, playlist_id, track_id);
	};
	itfIhm.unqueueGroup = function(entries){
		if(entries.length === 0) return;
		entries.n = entries.length;
		entries.i = 0;
		entries.forEach(function(v){
			wrk.unqueue(function(){
				entries.i++;
				if(entries.i >= entries.n) reloadQueue();
			}, null, v.playlist_id, v.track_id);
		});
	};
	ctrl.queuemove = itfIhm.queuemove = function(oldpos, newpos){
		wrk.queueMove(reloadQueue, null, oldpos, newpos);
	};
	
	itfIhm.setRating = function(p,t,r){
		wrk.setRating(noop, null, p, t, r);
	};
	
	itfIhm.loadPlaylist = function(id){
		wrk.loadPlaylistMapped(ihm.loadPlaylist, null, id, PLAYLIST_FIELDS);
	};
	
	itfIhm.loadCurrTrack = function(){
		wrk.loadTrack(ihm.updateTrack,null,-1,-1, TRACK_FIELDS);
	};
	
	itfIhm.loadCover = function(){
		wrk.cover(ihm.showCover, ihm.hideCover, -1, -1, 512, 512);
	};
	
	itfIhm.refreshEQ = function(){
		var i;
		wrk.status(ihm.updateState, null, 2);
		wrk.status(ihm.updateState, null, 3);
		for(i=6;i<=28;i++)wrk.status(ihm.updateState, null, i);
	};
	
	itfIhm.download = function(p, t){
		if(t.path==="Radio") window.open(t.filename, "_blank");
		else window.open(wrk.getDownloadURL(p, t.id), "_blank");
	};
	
	itfIhm.removeTrack = function(p, t){
		wrk.removeTrack(toolkit.noop, null, p, t);
	};
	
	itfIhm.deleteTrack = function(p, t){
		wrk.removeTrack(toolkit.noop, null, p, t, true);
	};
	
	itfIhm.copyTo = function(t, d){
		if(t.path==="Radio") wrk.addURLToPlaylist(null,null,d,t.filename);
		else wrk.addURLToPlaylist(toolkit.noop,null,d,t.path+"\\"+t.filename+"."+t.extension);
	};
	
	itfIhm.moveTo = function(p, t, d){
		if(t.path==="Radio") wrk.addURLToPlaylist(null,null,d,t.filename);
		else wrk.addURLToPlaylist(toolkit.noop,null,d,t.path+"\\"+t.filename+"."+t.extension);
		itfIhm.removeTrack(p, t.id);
	};
	
	return ctrl;
}

var ctrl = Ctrl();
$(document).ready(ctrl.init);