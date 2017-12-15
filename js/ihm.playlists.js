/* global Notification, _, Ihm, toolkit, RLib */

/**
 * @param {Ihm} ihm
 * @returns {Ihm.playlists}
 */
Ihm.playlists = function(ihm){
	var playlists = {};
	
	playlists.tab = 0;
	
	var pl = {}, groupTemplate, trackTemplate;
	playlists.pl = pl;
	
	playlists.init = function(){
		trackTemplate = document.createElement("div");
		trackTemplate.className = "track found";
		(function(){
			var no = document.createElement("div");
			no.appendChild(document.createTextNode(" "));
			no.className = "no";
			trackTemplate.appendChild(no);

			var title = document.createElement("div");
			title.appendChild(document.createTextNode(" "));
			title.className = "title";
			trackTemplate.appendChild(title);

			var controls = document.createElement("div");
			controls.className = "controls";
			trackTemplate.appendChild(controls);

			var album = document.createElement("div");
			album.appendChild(document.createTextNode(" "));
			album.className = "album";
			trackTemplate.appendChild(album);

			var artist = document.createElement("div");
			artist.appendChild(document.createTextNode(" "));
			artist.className = "artist";
			trackTemplate.appendChild(artist);

			var duration = document.createElement("div");
			duration.appendChild(document.createTextNode(" "));
			duration.className = "duration";
			trackTemplate.appendChild(duration);
		})();
		
		groupTemplate = document.createElement("div");
		groupTemplate.className = "group";
		groupTemplate.appendChild(document.createElement("h2"));
		groupTemplate.firstChild.appendChild((function(){
			var df = document.createDocumentFragment();
			df.appendChild(document.createElement("span"));
			df.appendChild(document.createElement("div"));
			df.childNodes[0].appendChild(document.createTextNode(" "));
			df.childNodes[1].appendChild(document.createTextNode("queue"));
			df.childNodes[1].className = "control";
			return df;
		})());
	};
	
	playlists.show = function(playlist_id, track_id){
		$("#main .detach").detach();
		document.getElementById("main").className = ""+(ihm.conf.oneGroup ? 'folders' : '');
		$("#fixedPanel").addClass("active");
		var ot = ihm.getTab();
		ihm.setTab(1);
		$("nav a").removeClass("active");
		$("#playlists a[data-id="+playlist_id+"]").addClass("active");
		if(!pl[playlist_id].loaded){
			ihm.loadPlaylist(playlist_id);
			if(playlist_id === playlists.tab)return;
			$("#main").html($("<h1>").text(pl[playlist_id].title));
			$("#main").append($("<div>").addClass("message").addClass("fill").text(ihm.i18n.generic.loading));
		}else{
			var m = $("#main"), dm = m.get(0), playlist_hash = pl[playlist_id].title.hashCode();
			
			var tracks, tracksEl = [];
			
			var searchFx = (function(){
				var cache = {};
				var last = "";
				
				return function(e){
					if(!cache[""]) cache[""] = tracks.slice();
					if(e && e.keyCode === 27) this.value="";
					if (this.value.length > 0) {
						$("#main").addClass("search");
						if(!cache[this.value])cache[this.value] = searchTest(this.value, pl[playlist_id].tracks, (last===this.value.substr(0,last.length)?cache[last]:tracks));
						
						_.difference(cache[this.value], cache[last]).forEach(function(i){ // new search results
							tracksEl[i].classList.add("found");
						});
						_.difference(cache[last], cache[this.value]).forEach(function(i){ // old search results
							tracksEl[i].classList.remove("found");
						});
						
						last = this.value;
					} else {
						$("#main").removeClass("search");
						_.difference(cache[this.value], cache[last]).forEach(function(i){ // new search results
							tracksEl[i].classList.add("found");
						});
						last = this.value;
					}
				};
			})();
			m.html($("<h1>").append(
				$("<span>").text(pl[playlist_id].title)
			).append(
				$('<div id="searchbar">').append(
					$("<input>").keyup(searchFx).change(searchFx).attr("placeholder", ihm.i18n.playlists.search()+"…")
				).append(
					$('<div>').text("no").click(function(){
						this.previousSibling.value = "";
						searchFx.call(this.previousSibling);
					})
				)
			));
	
			var group = $("<div>").appendTo(m).text(ihm.i18n.playlists.groupBy).addClass("groups");
			var sort = $("<div>").appendTo(m).text(ihm.i18n.playlists.sortBy).addClass("sorts");
			
			var grouped = (ihm.conf.globalSort ? ihm.conf.sort.gGroup : ihm.conf.sort["gp"+playlist_hash]) || [];
			var sorted = (ihm.conf.globalSort ? ihm.conf.sort.gSort : ihm.conf.sort["p"+playlist_hash]) || [];
			if(!ihm.conf.sort["g"+playlist_hash]) ihm.conf.sort["g"+playlist_hash] = {default:(ihm.conf.oneGroup&&true||false)};

			grouped.forEach(function(v){
				$("<span>").appendTo(group).text(ihm.i18n.playlists[v]()).addClass("active").append($("<span>").addClass("remove").text("no")).click(function(){
					if(ihm.conf.globalSort) ihm.conf.sort.gGroup = _.without(grouped, v);
					else ihm.conf.sort["gp"+playlist_hash] = _.without(grouped, v);
					ihm.saveConfig();
					playlists.show(playlists.tab);
				});
			});
			["artist","album","folder","albumartist"].forEach(function(v){
				if(grouped.indexOf(v) > -1) return;
				$("<span>").appendTo(group).text(ihm.i18n.playlists[v]()).click(function(){
					grouped.push(v);
					if(ihm.conf.globalSort) ihm.conf.sort.gGroup = grouped;
					else ihm.conf.sort["gp"+playlist_hash] = grouped;
					ihm.saveConfig();
					playlists.show(playlists.tab);
				});
			});
			
			sorted.forEach(function(v){
				$("<span>").appendTo(sort).text(ihm.i18n.playlists[v]()).addClass("active").append($("<span>").addClass("remove").text("no")).click(function(){
					if(ihm.conf.globalSort) ihm.conf.sort.gSort = _.without(sorted, v);
					else ihm.conf.sort["p"+playlist_hash] = _.without(sorted, v);
					ihm.saveConfig();
					playlists.show(playlists.tab);
				});
			});
			["artist","album","title","duration","track","path","rating"].forEach(function(v){
				if(grouped.indexOf(v) > -1 || sorted.indexOf(v) > -1) return;
				$("<span>").appendTo(sort).text(ihm.i18n.playlists[v]()+" ").click(function(){
					sorted.push(v);
					if(ihm.conf.globalSort) ihm.conf.sort.gSort = sorted;
					else ihm.conf.sort["p"+playlist_hash] = sorted;
					ihm.saveConfig();
					playlists.show(playlists.tab);
				});
			});
			
			var psort = grouped;
			psort = psort.concat(sorted);
						
			if(psort.length === 0) tracks = _.range(pl[playlist_id].tracks.length);
			else if(pl[playlist_id].cache && pl[playlist_id].cacheD === JSON.stringify(psort)) tracks = pl[playlist_id].cache;
			else{
				pl[playlist_id].cacheD = JSON.stringify(psort);
				pl[playlist_id].cache = _.range(pl[playlist_id].tracks.length);
				pl[playlist_id].cache.sort(function(a, b){
					for(var  i=0;i<psort.length;i++){
						var av=pl[playlist_id].tracks[a][psort[i]], bv = pl[playlist_id].tracks[b][psort[i]];
						
						if(psort[i] === "track"){
							av = 1*(av||0)+1000*(pl[playlist_id].tracks[a].disc || 0);
							bv = 1*(bv||0)+1000*(pl[playlist_id].tracks[b].disc || 0);
						}else if(psort[i] === "rating"){
							if(av > 0) av = 5-av;
							else av = 15-pl[playlist_id].tracks[a].arating || 15;
							if(bv > 0) bv = 5-bv;
							else bv = 15-pl[playlist_id].tracks[b].arating || 15;
						}
						
						if(av !== bv)
							return av < bv ?
							-1 : 1;
					};
					return 0;
				});
				tracks = pl[playlist_id].cache;
			}
			
			if(grouped.length > 0 && !ihm.conf.oneGroup){
				m.append($("<button>").text(ihm.i18n.playlists.foldAll).click(function(){
					m.find(".group").addClass("folded");
					ihm.conf.sort["g"+playlist_hash] = {default:true};
					ihm.saveConfig();
				}));
				m.append($("<button>").text(ihm.i18n.playlists.unfoldAll).click(function(){
					m.find(".group").removeClass("folded");
					ihm.conf.sort["g"+playlist_hash] = {default:false};
					ihm.saveConfig();
				}));
			}
			
			var lastGroup = {};
			var altn = sorted.indexOf("track") >= 0;
			
			// group for track insertin
			var group = dm;
						
			tracks.forEach(function(i,k){
				var v = pl[playlist_id].tracks[i];
				
				if(grouped.length>0){
					var newGroup = false;
					for(var ri=0;ri<grouped.length;ri++){
						if(v[grouped[ri]] !== lastGroup[grouped[ri]]){
							newGroup = true;
							lastGroup = v;
							break;
						}
					};
					if(newGroup){
						var gid = "";
						grouped.forEach(function(v,k){
							gid += (k!==0?" - ":"") + lastGroup[v];
						});
						
						group = groupTemplate.cloneNode(true);
						group.firstChild.addEventListener("click", (function(group, gid){return function(){
							var status = !$(group).hasClass("folded");
							if(ihm.conf.oneGroup){
								$("#main .group").addClass("folded");
								ihm.conf.sort["g"+playlist_hash] = {default:true};
								ihm.conf.sort["g"+playlist_hash][gid.hashCode()] = false;
								$("#main").toggleClass("open", !status);								
							}else{
								ihm.conf.sort["g"+playlist_hash][gid.hashCode()] = status;
							}
							$(group).toggleClass("folded", status);
							ihm.saveConfig();
						};})(group, gid));
						group.firstChild.firstChild.firstChild.data = gid;
						if( ihm.conf.sort["g"+playlist_hash][gid.hashCode()] === true || (ihm.conf.sort["g"+playlist_hash][gid.hashCode()] !== false && ihm.conf.sort["g"+playlist_hash].default)){
							group.className += " folded";
						}
						group.firstChild.childNodes[1].addEventListener("click", function(e){
							e.stopPropagation();
							var g = [];
							this.parentNode.parentNode.querySelectorAll('.track').forEach(function(v){
								g.push({playlist_id:playlist_id, track_id:parseInt(v.dataset.id)});
							});
							ihm.queueGroup(g);
						});
						group.firstChild.childNodes[1].addEventListener("contextmenu", function(e){
							e.stopPropagation();
							e.preventDefault();
							var g = [];
							this.parentNode.parentNode.querySelectorAll('.track').forEach(function(v){
								g.push({playlist_id:playlist_id, track_id:parseInt(v.dataset.id)});
							});
							ihm.unqueueGroup(g);
						});
						dm.appendChild(group);
					}
				}
				
				var track = trackTemplate.cloneNode(true);
				tracksEl[i] = track;
				
				if(playlist_id === ihm.ctrack.pls && v.id === ihm.ctrack.id) track.className += " active";
				if(ihm.inQueue(playlist_id, v.id)) track.className += " queued";
				track.dataset.id = v.id;
				
				// Track number
				if(altn && v.track) track.childNodes[0].firstChild.data = (v.disc?v.disc+"-":"")+1*v.track;
				else track.childNodes[0].firstChild.data = k+1+".";
				
				// Title
				track.childNodes[1].title = v.title;
				track.childNodes[1].firstChild.data = v.title;
				track.childNodes[1].addEventListener("click", function(){
					ihm.play(playlist_id, v.id);
				});
				track.childNodes[1].addEventListener("contextmenu", function(e){
					ihm.showPopup(v, playlist_id, e);
					e.preventDefault();
				});
				
				// Controls
				var btn;
				if(ihm.conf.downloadButton){
					btn = ihm.buttonTemplates.download.cloneNode(true);
					btn.addEventListener("click", function(){
						ihm.download(playlist_id, v);
					});
					track.childNodes[2].appendChild(btn);
				}
				btn = ihm.buttonTemplates.queue.cloneNode(true);
				btn.addEventListener("click", function(){
					ihm.queue(playlist_id, v.id);
				});
				btn.addEventListener("contextmenu", function(e){
					ihm.unqueue(playlist_id, v.id);
					e.preventDefault();
				});
				track.childNodes[2].appendChild(btn);
				
				// Album
				track.childNodes[3].title = v.album;
				track.childNodes[3].firstChild.data = v.album;
				
				// Artist
				track.childNodes[4].title = v.artist;
				track.childNodes[4].firstChild.data = v.artist;
				
				// Duration
				track.childNodes[5].firstChild.data = toolkit.time(v.duration);
				
				// Rating
				if(!ihm.conf.hideRatings){
					v.ratingEl = RLib.rating(v.arating, v.rating, function(r){
						ihm.setRating(playlist_id, v.id, r);
						if(sorted.indexOf("rating")>=0)pl[playlist_id].loaded = false;
					});
					v.ratingEl.el.className += " rating";
					track.appendChild(v.ratingEl.el);
				}
				
				group.appendChild(track);			
			});
			
			var filler = $("<p>").appendTo("#main").text(" ");
			if(grouped.length > 0) filler.addClass("fill");
			
			if(track_id || playlists.tr){
				playlists.scrollToTrack(track_id || playlists.tr);
				track_id = null;
			}else{
				if(playlists.tab !== playlist_id || ot !== 1)$.scrollTo("#main h1");
			}
		}
		playlists.tab = playlist_id;
		playlists.tr = track_id;
	};
	
	function searchPrepare(t){
		return " "+_.uniq(_.without(t.toLowerCase().split(/[ .,:?!()]+/).sort(), ""), true).join(" ");
	}
	/**
	 * 
	 * @param {string} needle
	 * @param {[[search:(string)],]} haystack contains prepared search key
	 * @param {[(int),]} prefilter [opt] search only in specified keys
	 * @returns {undefined}
	 */
	function searchTest(needle, haystack, prefilter){
		var results = prefilter ? prefilter.slice() : _.range(0, haystack.length-1);
		needle = _.uniq(_.without(needle.toLowerCase().split(/[ .,:?!()]+/).sort(), ""), true);
		if(needle.length === 0)return results;
		needle = new RegExp(" "+needle.join(".* "));
		for(var i=0; i<results.length; i++){
			if(!needle.test(haystack[results[i]].search))results[i]=null;
		}
		return _.without(results, null);
	}
	
	function comparePlaylistsEl(a,b){
		return (a.dataset.title > b.dataset.title) ? 1 : -1;
	}
	
	playlists.update = function(o){
		var npi = {};
		o.forEach(function(v){
			npi[v.id] = true;
			if(pl[v.id]){
				$("#playlists a[data-id="+v.id+"]").text(v.title).get(0).dataset.title = v.title;
				pl[v.id].title = v.title;
				if(pl[v.id].crc32 !== v.crc32){
					pl[v.id].loaded = false;
					if(ihm.getTab() === 1 && playlists.tab === v.id)playlists.show(playlists.tab);
				}
			}else{
				pl[v.id] = {title:v.title,crc32:v.crc32,tracks:[],loaded:false};
				var a = $("<a>").text(v.title).appendTo("#playlists").click(function(){
					$.scrollTo("#main h1", {duration:500});
					if(ihm.getTab() !== 1 || playlists.tab !== v.id) playlists.show(v.id);}).get(0);
				a.dataset.id = v.id;
				a.dataset.title = v.title;
			}
		});
		_.each(pl, function(v,k){
			if(!npi[k]) delete pl[k];
			$("#playlists a[data-id="+v.id+"]").remove();
		});
		$("#playlists > a").sortElements(comparePlaylistsEl);
		$("#playlists > a:not([data-id="+ihm.ctrack.pls+"])").removeClass("playing");
		$("#playlists > a[data-id="+ihm.ctrack.pls+"]").addClass("playing");
	};
	
	playlists.load = function(o,p){
		var fullReload = ihm.getTab() !== 1 || playlists.tab !== p.playlist_id || !pl[p.playlist_id].tracks;
		var c = ["title","artist","album","duration","track","disc","path","folder"];
		
		if(ihm.getTab() === 1 && playlists.tab === p.playlist_id){
			if(!pl[p.playlist_id].loaded || o.entries.length !== pl[p.playlist_id].tracks.length) fullReload = true;
			else{
				pl[p.playlist_id].tmap = {};
				for(var i=0;i<o.entries.length;i++){
					var m=pl[p.playlist_id].tracks[i], n=o.entries[i];
					
					for(var ci=0;ci<c.length;ci++){
						if(m[c[ci]] !== n[c[ci]]){
							fullReload = true;
							//console.log("FullReload : "+c[ci]+" mismatch ("+m[c[ci]]+" != "+n[c[ci]]+")",m,n);
							break;
						}
					}
					
					if(!fullReload){
						m.arating = n.arating;
						m.rating = n.rating;
						m.ratingEl.setDefault(n.arating);
						m.ratingEl.setValue(n.rating);
						pl[p.playlist_id].tmap[n.id] = i;
						document.querySelector('#main .track[data-id="'+m.id+'"]').dataset.id = n.id*1000+999;
						if(ihm.ctrack.id === m.id && ihm.ctrack.title === m.title) ihm.ctrack.id = n.id;
						m.id = n.id;
					}else{
						break;
					}
				}
				if(!fullReload){
					pl[p.playlist_id].loaded = true;
					_.each(document.querySelectorAll("#main .track[data-id]"),function(v){
						v.dataset.id = (v.dataset.id-999)/1000;
					});
				}
			}
		}
		
		if(fullReload){
			pl[p.playlist_id].loaded = true;
			pl[p.playlist_id].tracks = o.entries;
			pl[p.playlist_id].tmap = {};
			pl[p.playlist_id].cacheD = false;
			o.entries.forEach(function(v,k){
				pl[p.playlist_id].tmap[v.id]=k;
				pl[p.playlist_id].tracks[k].search = searchPrepare(v.title+" "+v.artist+" "+v.album);
				if(p.playlist_id === ihm.ctrack.pls && v.id === ihm.ctrack.id) ihm.showTrack(v);
			});
			if(ihm.getTab() === 1 && playlists.tab === p.playlist_id)playlists.show(p.playlist_id);
		}
	};
	
	playlists.scrollToTrack = function(id){
		var t = $("#main .track[data-id="+id+"]");
		if(t.parent().hasClass("group") && t.parent().hasClass("folded")){
			t.parent().children().first().click();
		};
		$.scrollTo(t, {offset:{ top:-200}, duration:500});
	};
	
	return playlists;
};