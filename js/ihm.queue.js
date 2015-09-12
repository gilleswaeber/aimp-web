/* global Notification, _, Ihm, toolkit, RLib, Sortable */

/**
 * @param {Ihm} ihm
 * @returns {Ihm.queue}
 */
Ihm.queue = function(ihm){
	var queue = {};
	var q = {entries:[], map:{}}, queueMoving = false;
	var queueTemplate;
	
	queue.init = function(){
		queueTemplate = document.createElement("div");
		queueTemplate.className = "track found";
		(function(){
			var drag = document.createElement("div");
			drag.className = "drag";
			queueTemplate.appendChild(drag);
			
			var no = document.createElement("div");
			no.appendChild(document.createTextNode(" "));
			no.className = "no";
			queueTemplate.appendChild(no);

			var title = document.createElement("div");
			title.appendChild(document.createTextNode(" "));
			title.className = "title";
			queueTemplate.appendChild(title);

			var controls = document.createElement("div");
			controls.className = "controls";
			queueTemplate.appendChild(controls);

			var album = document.createElement("div");
			album.appendChild(document.createTextNode(" "));
			album.className = "album";
			queueTemplate.appendChild(album);

			var artist = document.createElement("div");
			artist.appendChild(document.createTextNode(" "));
			artist.className = "artist";
			queueTemplate.appendChild(artist);

			var duration = document.createElement("div");
			duration.appendChild(document.createTextNode(" "));
			duration.className = "duration";
			queueTemplate.appendChild(duration);
		})();
	};
	
	function queueMove(position){
		if(queueMoving === false){
			queueMoving = position;
			$("#main").addClass("queuemove");
			$($("#queue .track")[position]).addClass("moved");
		}else{
			if(position === queueMoving) ihm.queueMove(queueMoving, 0);
			else ihm.queueMove(queueMoving, position+(position < queueMoving ? 1 : 0));
		}
	}
	queue.show = function(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").addClass("active");
        ihm.setTab(2);
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"queue\"]").addClass("active");
		$("#main").html($("<h1>").text(ihm.i18n.nav.queue));
		
		queueMoving = false;
		if(q.entries.length === 0) $("<div>").appendTo("#main").addClass("message").addClass("fill").text(ihm.i18n.playlists.queueEmpty);
		else{
			$("#main").append($("<button>").text(ihm.i18n.playlists.queueClear).click(function(){
				var g = [];
				q.entries.forEach(function(v){g.push({playlist_id:v.playlist_id, track_id:v.id});});
				ihm.unqueueGroup(g);
			}));
			
			var tracks = document.createElement("div");
			tracks.id = "queue";
			var moving = false;
			
			q.entries.forEach(function(v,k){
				var track = queueTemplate.cloneNode(true);
				
				track.childNodes[0].addEventListener("click", function(){
					queueMove(k);
				});
				
				// Track number
				track.childNodes[1].firstChild.data = k+1+".";
				
				// Title
				track.childNodes[2].title = v.title;
				track.childNodes[2].firstChild.data = v.title;
				track.childNodes[2].addEventListener("click", function(){
					showPlaylist(v.playlist_id, v.id);
				});
				
				// Controls
				var btn;
				
				btn = ihm.buttonTemplates.remove.cloneNode(true);
				btn.addEventListener("click", function(){
					ihm.unqueue(v.playlist_id, v.id);
				});
				track.childNodes[3].appendChild(btn);
				
				// Album
				track.childNodes[4].title = v.album;
				track.childNodes[4].firstChild.data = v.album;
				
				// Artist
				track.childNodes[5].title = v.artist;
				track.childNodes[5].firstChild.data = v.artist;
				
				// Duration
				track.childNodes[6].firstChild.data = toolkit.time(v.duration);
				
				// Rating
				if(!ihm.conf.hideRatings){
					v.ratingEl = RLib.rating(v.arating, v.rating, function(r){
						ihm.setRating(v.playlist_id, v.id, r);
					});
					v.ratingEl.el.className += " rating";
					track.appendChild(v.ratingEl.el);
				}
				
				tracks.appendChild(track);
			});
			
			document.getElementById("main").appendChild(tracks);
			
			var dummyEl = document.createElement("div");
			Sortable.create(tracks, {
				handle:".drag",
				scroll:false,
				setData:function(dataTransfer, el){
					dataTransfer.setData("x-data", "");
					dataTransfer.setDragImage(dummyEl, 0, 0);
				},
				onEnd:function(e){
					if(typeof e.newIndex !== 'undefined') ihm.queueMove(e.oldIndex, e.newIndex);
				}
			});
		}
		$.scrollTo("#main h1");
	};
	
	queue.load = function(o){
		q.entries = o.entries;
		q.map = {};
		if(ihm.getTab()===1)$("#main .track").removeClass("queued");
		o.entries.forEach(function(t){
			if(!q.map[t.playlist_id]) q.map[t.playlist_id]={};
			q.map[t.playlist_id][t.id] = true;
			if(ihm.getTab()===1 && ihm.getTabPls()===t.playlist_id) $("#main .track[data-id="+t.id+"]").addClass("queued");
		});
		if(ihm.getTab()===2) queue.show();
	};
	
	queue.in = function(playlist_id, track_id){
		return q.map[playlist_id] && q.map[playlist_id][track_id];
	};
	
	return queue;
};