
/* global Notification */
/* global _ */
/* global RLib */
/* global rpc */
/* global toolkit */

var DEBUG = {};

/**
 * Worker.<br>
 * About the Control Plugin :
 * the control plugin is a bit fucked up and some things wont work as expected. Always test before using. Some samples :
 * <ul><li>Playlists IDs will change on each AIMP restart.</li>
 * <li>Tracks IDs could swap between them on each playlist change.</li>
 * <li>A playlist change occurs when you fold or unfold tracks.</li>
 * <li>A playlist change occurs too when ratings change, which can happen when track reach 60%, because of the audio library plugin.</li>
 * <li>You can't sort a playlist with the IDs</li></ul>
 * @param {string} _url [opt] RPC_JSON server ip + port number
 * @param {function(result,params,method)} _defSuccessCallback [opt] default success callback
 * @param {function(error,params,method)} _defErrorCallback [opt] default error callback
 * @returns {Wrk.wrk}
 */
function Wrk(_url, _defSuccessCallback, _defErrorCallback){
	var wrk = {subscribe:{}, position:{}},
	url = _url || "",
	
	noop = function(){},
	
	defSuccessCallback = _defSuccessCallback || noop,
	defErrorCallback = _defErrorCallback || noop,
	
	aimp_service = new rpc.ServiceProxy(
		url+"/RPC_JSON",
		{
			protocol : 'JSON-RPC',
			// AIMP Control Plugin, build 1.0.13.1290
			methods: ['Play', 'Pause', 'Stop', 'PlayPrevious', 'PlayNext', 'Status', 'ShufflePlaybackMode', 'RepeatPlaybackMode', 'VolumeLevel', 'Mute', 'RadioCaptureMode', 'GetFormattedEntryTitle', 'GetPlaylistEntryInfo', 'EnqueueTrack', 'RemoveTrackFromPlayQueue', 'QueueTrackMove', 'GetPlaylists', 'GetPlaylistEntries', 'GetEntryPositionInDataTable', 'GetPlaylistEntriesCount', 'GetQueuedEntries', 'GetCover', 'GetPlayerControlPanelState', 'SubscribeOnAIMPStateUpdateEvent', 'SetTrackRating', 'Version', 'PluginCapabilities', 'AddURLToPlaylist', 'RemoveTrack', 'Scheduler', 'CreatePlaylist']
		}
    ),
	
	call = function(method, params, successCallback, errorCallback){
		aimp_service[method]({
			params:params,
			onSuccess:(successCallback ? function(r){successCallback(r, params, method);} : defSuccessCallback),
			onException:(errorCallback ? function(r){return errorCallback(r, params, method);} : function(r){return defErrorCallback(r, params);}),
			onComplete:noop
		});
	};
	
	/**
	 * Play/Resume/Replay.
	 * If no params is specified, starts playback of current track in current playlist.
	 * Result : {playback_state:"playing", playlist_id:(int)playlist_id, track_id:(int)track_id}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 */
	wrk.play = function(successCallback, errorCallback, playlist_id, track_id){
		call("Play",(typeof playlist_id !== 'undefined' ? {playlist_id:playlist_id, track_id:track_id} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Pause/Resume
	 * Result : {playback_state:"playing"|"paused"}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.pause = function(successCallback, errorCallback){
		call("Pause", {}, successCallback, errorCallback);
	};
	
	/**
	 * Stop
	 * Result : {playback_state:"stopped"}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.stop = function(successCallback, errorCallback){
		call("Stop", {}, successCallback, errorCallback);
	};
	
	/**
	 * Play previous track
	 * Result : {playlist_id:(int)playlist_id, track_id:(int)track_id}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.previous = function(successCallback, errorCallback){
		call("PlayPrevious", {}, successCallback, errorCallback);
	};
	
	/**
	 * Play next track
	 * Result : {playlist_id:(int)playlist_id, track_id:(int)track_id}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.next = function(successCallback, errorCallback){
		call("PlayNext", {}, successCallback, errorCallback);
	};
	
	/**
	 * Get/set AIMP status.<br>
	 * The following IDs are available(status ID, status value range):
	 * <table>
	 * <tr><td>1</td><td>Volume</td><td>[0,100]</td><td>0% to 100%</td></tr>
	 * <tr><td>2</td><td>Balance</td><td>[0,100]</td><td>0=left, 50=center, 100=right</td></tr>
	 * <tr><td>3</td><td>Speed</td><td>[0,100]</td><td>50% to 150%, 50 = 100%</td></tr>
	 * <tr><td>4</td><td>Player</td><td>0,1,2</td><td>stop, play, pause</td></tr>
	 * <tr><td>5</td><td>Mute</td><td>0,1</td><td>off/on</td></tr>
	 * <tr><td>6</td><td>Reverb</td><td>[0,100]</td><td>0% to 100%</td></tr>
	 * <tr><td>7</td><td>Echo</td><td>[0,100]</td><td>0% to 100%</td></tr>
	 * <tr><td>8</td><td>Chorus</td><td>[0,100]</td><td>0% to 100%</td></tr>
	 * <tr><td>9</td><td>Flanger</td><td>[0,100]</td><td>0% to 100%</td></tr>
	 * <tr><td>10</td><td>Equalizer</td><td>0,1</td><td>off/on</td></tr>
	 * <tr><td>11</td><td>Eq_31</td><td rowspan="18">[0,100]</td><td rowspan="18">-15db to +15db, 50=neutral</td></tr>
	 * <tr><td>12</td><td>Eq_63</td></tr>
	 * <tr><td>13</td><td>Eq_87</td></tr>
	 * <tr><td>14</td><td>Eq_125</td></tr>
	 * <tr><td>15</td><td>Eq_175</td></tr>
	 * <tr><td>16</td><td>Eq_250</td></tr>
	 * <tr><td>17</td><td>Eq_350</td></tr>
	 * <tr><td>18</td><td>Eq_500</td></tr>
	 * <tr><td>19</td><td>Eq_700</td></tr>
	 * <tr><td>20</td><td>Eq_1000</td></tr>
	 * <tr><td>21</td><td>Eq_1400</td></tr>
	 * <tr><td>22</td><td>Eq_2000</td></tr>
	 * <tr><td>23</td><td>Eq_2800</td></tr>
	 * <tr><td>24</td><td>Eq_4000</td></tr>
	 * <tr><td>25</td><td>Eq_5600</td></tr>
	 * <tr><td>26</td><td>Eq_8000</td></tr>
	 * <tr><td>27</td><td>Eq_11200</td></tr>
	 * <tr><td>28</td><td>Eq_16000</td></tr>
	 * <tr><td>29</td><td>Repeat</td><td>0,1</td><td>off/on</td></tr>
	 * <tr><td>30</td><td>ON_STOP</td><td>Not working</td></td></tr>
	 * <tr><td>31</td><td>Position</td><td></td><td>seconds</td></tr>
	 * <tr><td>32</td><td>Length</td><td></td><td>seconds</td></tr>
	 * <tr><td>33</td><td>RepeatPls</td><td>0,1,2</td><td>next playlist, repeat, stop</td></tr>
	 * <tr><td>34</td><td>RepeatPls1</td><td>0,1</td><td>off/on repeat with one file</td></tr>
	 * <tr><td>35</td><td>Bitrate</td><td></td><td>kb/s</td></tr>
	 * <tr><td>36</td><td>Sampling</td><td></td><td>Hz</td></tr>
	 * <tr><td>37</td><td>MODE</td><td></td><td>Not working</td></tr>
	 * <tr><td>38</td><td>RadioCapture</td><td>0,1</td><td>off/on</td></tr>
	 * <tr><td>39</td><td>StreamType</td><td>0,1,2</td><td>File, CD, Stream</td></tr>
	 * <tr><td>40</td><td>TIMER</td></td><td><td>Not working</td></tr>
	 * <tr><td>41</td><td>Shuffle</td><td>0,1</td></td>off/on</td></tr>
	 * </table><br>
	 * Result : {value:(int)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} id status id
	 * @param {int} value
	 */
	wrk.status = function(successCallback, errorCallback, id, value){
		call("Status", (typeof value !== 'undefined' ? {status_id:id, value:value} : {status_id:id}), successCallback, errorCallback);
	};
	
	/**
	 * Get/set the volume level<br>
	 * Result : {volume:(int)volume}
	 * @param {int} level 0 to 100
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.volume = function(successCallback, errorCallback, level){
		call("VolumeLevel", (typeof level !== 'undefined' ? {volume:level} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Get/set mute mode<br>
	 * Result : {mute_on:(boolean)mute_mode}
	 * @param {boolean} mute mute enabled
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.mute = function(successCallback, errorCallback, mute){
		call("Mute", (typeof mute !== 'undefined' ? {mute_on:mute} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Get/set shuffle playback mode<br>
	 * Result: {shuffle_mode_on:(boolean)shuffle_mode_on}
	 * @param {boolean} shuffle shuffle enabled
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.shuffle = function(successCallback, errorCallback, shuffle){
		call("ShufflePlaybackMode", (typeof shuffle !== 'undefined' ? {shuffle_on:shuffle} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Get/set repeat playback mode<br>
	 * Result: {repeat_mode_on:(boolean)repeat_mode_on}
	 * @param {boolean} repeat repeat enabled
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.repeat = function(successCallback, errorCallback, repeat){
		call("RepeatPlaybackMode", (typeof repeat !== 'undefined' ? {repeat_on:repeat} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Get/set radio capture mode<br>
	 * Result: {radio_capture_on:(boolean)radio_capture_on}
	 * @param {boolean} radioCapture radio capture enabled
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.radioCapture = function(successCallback, errorCallback, radioCapture){
		call("RepeatPlaybackMode", (typeof radioCapture !== 'undefined' ? {radio_capture_on:radioCapture} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Return formatted string for specified track.<br>
	 * Result: {formatted_string:(string)formatted_string}
	 * format_string can contain following format arguments:<br>%A - album<br>%a - artist (=%R)<br>%B - bitrate<br>%C - channels count<br>%D - file path<br>%E - extension<br>%F - file name<br>%G - genre<br>%H - sample rate<br>%L - duration<br>%R - artist<br>%S - filesize<br>%T - title<br>%Y - date<br>%M - rating ("*" to "*****")<br>%PD - parent folder<br>%DC - file creation date<br>%TC - file creation time<br>%DN - disc number<br>%TN - track number<br>%IF(A,B,C) - if A is empty use C else use B<br>%Up(A) - A uppercase<br>%Low(A) - A lowercase<br>%Caps(A) - A camel case<br>%Char(A) - character with code A<br>%Replace(A,B,C) - replace B by C in A<br>%RT - rating (1.00 to 5.00)<br>%DM - file modification date<br>%TM - file modification time<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {string} format_string
	 */
	wrk.format = function(successCallback, errorCallback, playlist_id, track_id, format_string){
		call("GetFormattedEntryTitle", {playlist_id:playlist_id, track_id:track_id, format_string:format_string}, successCallback, errorCallback);
	};
	
	/**
	 * Return specified track infos.<br>
	 * Similar to <i>loadTrack</i> but you don't have to choose the fields and there are less.<br>
	 * Result: {album:(string),artist:(string),bitrate:(int)kbps,channels_count:(int),date:(string),duration:(int)ms,filesize:(int)bytes,genre:(string),id:(int),playlist_id:(int),rating:(int)0-5,samplerate:(int)hertz,title:(string)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 */
	wrk.track = function(successCallback, errorCallback, playlist_id, track_id){
		call("GetPlaylistEntryInfo", {playlist_id:playlist_id, track_id:track_id}, successCallback, errorCallback);
	};
	
	/**
	 * Return specified track infos.<br>
	 * Similar to <i>track</i> but you can choose to get more fields.<br>
	 * Following fields are always provided: album, artist, bitrate, channels_count, date, duration, filesize, genre, id, playlist_id, rating, title<br>
	 * Additional fields are: channels, path, extension, filename, arating, folder, creationdate, creationtime, disc, track, modificationdate, modificationtime<br>
	 * Result: {field:value,}<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {string[]} fields additional fields
	 */
	wrk.loadTrack = function(successCallback, errorCallback, playlist_id, track_id, fields){
		var lfreq = "";
		//var lp = ["album", "artist", "bitrate", "channels_count", "date", "duration", "filesize", "genre", "id", "playlist_id", "rating", "samplerate", "title"];
		var lf = {channels:"%C", path:"%D", extension:"%E", filename:"%F", samplerate:"%H", folder:"%PD", creationdate:"%DC", creationtime:"%TC", disc:"%DN", track:"%TN", arating:"%RT", modificationdate:"%DM", modificationtime:"%TM"};
		
		for(var i=0;i<fields.length;i++){
			lfreq += lf[fields[i]]+"%Char(30)";
		}
		
		var ret = {};
		var r1 = true;
		successCallback = successCallback || defSuccessCallback;
				
		wrk.track(function(r,p,m){
			ret.album = r.album;
			ret.artist = r.artist;
			ret.bitrate = r.bitrate;
			ret.channels_count = r.channels_count;
			ret.date = r.date;
			ret.duration = r.duration;
			ret.filesize = r.filesize;
			ret.genre = r.genre;
			ret.id = r.id;
			ret.playlist_id = r.playlist_id;
			ret.rating = r.rating;
			ret.title = r.title;
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, playlist_id, track_id);
		
		wrk.format(function(r,p,m){
			r = r.formatted_string.split("\u001e");
				
			fields.forEach(function(n,i){
				ret[n] = r[i];
			});
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, playlist_id, track_id, lfreq);
	};
	
	/**
	 * Enqueue track for playing.
	 * Result : {}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {boolean} insert_at_queue_beginning [opt] If true enqueue at the beginning of queue.
	 */
	wrk.queue = function(successCallback, errorCallback, playlist_id, track_id, insert_at_queue_beginning){
		call("EnqueueTrack",{playlist_id:playlist_id, track_id:track_id, insert_at_queue_beginning:((insert_at_queue_beginning || false) && true)}, successCallback, errorCallback);
	};
	
	/**
	 * Removes track from AIMP play queue.<br>
	 * Result : {}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 */
	wrk.unqueue = function(successCallback, errorCallback, playlist_id, track_id){
		call("RemoveTrackFromPlayQueue",{playlist_id:playlist_id, track_id:track_id}, successCallback, errorCallback);
	};
	
	/**
	 * Move a track in queue.<br>
	 * Result : {}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} old_position
	 * @param {int} new_position
	 */
	wrk.queueMove = function(successCallback, errorCallback, old_position, new_position){
		call("QueueTrackMove",{old_queue_index:old_position, new_queue_index:new_position}, successCallback, errorCallback);
	};
	
	/**
	 * Returns list of playlists.
	 * Result : [{id:(int),title:(string),duration:(int)ms,entries_count:(int),size_of_entries:(int)bytes,crc32:(int)},] depends on asked fields
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {["id"?,"title"?,"duration"?,"entries_count"?,"size_of_entries"?,"crc32"?]} fields List of fields that need to be filled. Default is ["id","title"].
	 */
	wrk.playlists = function(successCallback, errorCallback, fields){
		call("GetPlaylists",(typeof fields !== 'undefined' ? {fields:fields} : {}), successCallback, errorCallback);
	};
	
	/**
	 * Returns list of playlist entries.<br>
	 * Param fields can contain either a list of field or a AIMP string format.<br>
	 * Fields are: id, title, artist, album, date, genre, bitrate, duration, filesize, rating, foldername<br>
	 * Format string can contain following format arguments:<br>%A - album<br>%a - artist (=%R)<br>%B - bitrate<br>%C - channels count<br>%D - file path<br>%E - extension<br>%F - file name<br>%G - genre<br>%H - sample rate<br>%L - duration<br>%R - artist<br>%S - filesize<br>%T - title<br>%Y - date<br>%M - rating ("*" to "*****")<br>%PD - parent folder<br>%DC - file creation date<br>%TC - file creation time<br>%DN - disc number<br>%TN - track number<br>%IF(A,B,C) - if A is empty use C else use B<br>%Up(A) - A uppercase<br>%Low(A) - A lowercase<br>%Caps(A) - A camel case<br>%Char(A) - character with code A<br>%Replace(A,B,C) - replace B by C in A<br>%RT - rating (1.00 to 5.00)<br>%DM - file modification date<br>%TM - file modification time<br>
	 * Result : {count_of_found_entries:(int),total_entries_count:(int),entries:[[(int)id?,title?,artist?,album?,(string)date?,genre?,(int,kb/s)bitrate?,(int,ms)duration?,(int,bytes)filesize?,rating?,foldername?]]}<br>
	 * <b>Fields order depends on the fields parameter</b><br>
	 * Result when field is a <b>format string</b> : {count_of_found_entries:(int),total_entries_count:(int),entries:[[(string)track],]}<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} id playlist id
	 * @param {string|string[]} fields [opt] default is ["id","title"]
	 * @param {[[field=(string),dir="asc"|"desc"],]} order [opt] sort by
	 * @param {int} start [opt] start at index
	 * @param {int} count [opt] entries count
	 * @param {string} search [opt] filter only tracks with specified string in one of these : title, artist, album, date, genre
	 */
	wrk.loadPlaylist = function(successCallback, errorCallback, id, fields, order, start, count, search){
		var params = {playlist_id:id};
		if(typeof fields === "string")params.format_string = fields;
		else if(typeof fields !== "undefined")params.fields = fields;
		if(typeof order !== "undefined")params.order_fields = order;
		if(typeof start !== "undefined")params.start_index = start;
		if(typeof count !== "undefined")params.entries_count = count;
		if(typeof search !== "undefined")params.search_string = search;
		call("GetPlaylistEntries", params, successCallback, errorCallback);
	};
	
	/**
	 * Returns list of playlist entries.<br>
	 * Similar to <i>loadPlaylist</i> but allows more fields and map the objects.<br>
	 * Fields are: album, artist, bitrate, channels, path, extension, filename, genre, samplerate, duration, filesize, title, date, folder, id, creationdate, creationtime, disc, track, arating (automatic rating), rating, modificationdate, modificationtime<br>
	 * Result : {count_of_found_entries:(int),total_entries_count:(int),entries:[{field:value,},]}<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} id playlist id
	 * @param {string[]} fields a list of fields
	 * @param {[[field=(string),dir="asc"|"desc"],]} order [opt] sort by
	 * @param {int} start [opt] start at index
	 * @param {int} count [opt] entries count
	 * @param {string} search [opt] filter only tracks with specified string in one of these : title, artist, album, date, genre 
	 */
	wrk.loadPlaylistMapped = function(successCallback, errorCallback, id, fields, order, start, count, search){
		var lffields = [], lfreq = "", lpfields = [];
		
		//var lp = ["id","title","artist","album","date","genre","bitrate","duration","filesize","rating","foldername"];
		var lf = {channels:"%C", path:"%D", extension:"%E", filename:"%F", samplerate:"%H", folder:"%PD", creationdate:"%DC", creationtime:"%TC", disc:"%DN", track:"%TN", arating:"%RT", modificationdate:"%DM", modificationtime:"%TM", title:"%IF(%T,%T,%F)"};
		
		for(var i=0;i<fields.length;i++){
			if(lf[fields[i]]){
				lffields.push(fields[i]);
				lfreq += lf[fields[i]]+"%Char(30)";
			}else{
				lpfields.push(fields[i]);
			}
		}
		
		var ret = {entries:[]};
		var r1 = true;
		successCallback = successCallback || defSuccessCallback;
				
		wrk.loadPlaylist(function(r,p,m){
			ret.count_of_found_entries = r.count_of_found_entries;
			ret.total_entries_count = r.total_entries_count;
			
			for(var ei=0;ei<r.entries.length;ei++){
				if(r1) ret.entries[ei] = {};
				
				var f = r.entries[ei][0].split("\u001e");
				lffields.forEach(function(n,i){
					ret.entries[ei][n] = f[i];
				});
			};
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, id, lfreq, order, start, count, search);
		
		wrk.loadPlaylist(function(r,p,m){
			for(var ei=0;ei<r.entries.length;ei++){
				if(r1) ret.entries[ei] = {};
				
				lpfields.forEach(function(n,i){
					ret.entries[ei][n] = r.entries[ei][i];
				});
			};
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, id, lpfields, order, start, count, search);
	};
	
	/**
	 * Returns list of queued entries.<br>
	 * Param fields can contain either a list of field or a AIMP string format.<br>
	 * Fields are : playlist_id, id, title, artist, album, date, genre, bitrate, duration, filesize, rating, foldername<br>
	 * Format string can contain following format arguments:<br>%A - album<br>%a - artist (=%R)<br>%B - bitrate<br>%C - channels count<br>%D - file path<br>%E - extension<br>%F - file name<br>%G - genre<br>%H - sample rate<br>%L - duration<br>%R - artist<br>%S - filesize<br>%T - title<br>%Y - date<br>%M - rating ("*" to "*****")<br>%PD - parent folder<br>%DC - file creation date<br>%TC - file creation time<br>%DN - disc number<br>%TN - track number<br>%IF(A,B,C) - if A is empty use C else use B<br>%Up(A) - A uppercase<br>%Low(A) - A lowercase<br>%Caps(A) - A camel case<br>%Char(A) - character with code A<br>%Replace(A,B,C) - replace B by C in A<br>%RT - rating (1.00 to 5.00)<br>%DM - file modification date<br>%TM - file modification time<br>
	 * Result : {count_of_found_entries:(int),total_entries_count:(int),entries:[[(int)id?,title?,artist?,album?,(string)date?,genre?,(int,kb/s)bitrate?,(int,ms)duration?,(int,bytes)filesize?,rating?,foldername?]]}<br>
	 * <b>Fields order depends on the fields parameter</b><br>
	 * Result when field is a <b>format string</b> : {count_of_found_entries:(int),total_entries_count:(int),entries:[(string)track],}<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {string|string[]} fields [opt] default is ["id","title"]
	 * @param {int} start [opt] start at index
	 * @param {int} count [opt] entries count
	 * @param {string} search [opt] filter only tracks with specified string in one of these : title, artist, album, date, genre
	 */
	wrk.loadQueue = function(successCallback, errorCallback, fields, start, count, search){
		var params = {};
		if(typeof fields === "string")params.format_string = fields;
		else if(typeof fields !== "undefined")params.fields = fields;
		if(typeof start !== "undefined")params.start_index = start;
		if(typeof count !== "undefined")params.entries_count = count;
		if(typeof search !== "undefined")params.search_string = search;
		call("GetQueuedEntries", params, successCallback, errorCallback);
	};
	
	
	/**
	 * Returns list of queued entries.<br>
	 * Similar to <i>loadQueue</i> but allows more fields and map the objects.<br>
	 * Fields are: album, artist, bitrate, channels, path, extension, filename, genre, samplerate, duration, filesize, title, date, folder, id, creationdate, creationtime, disc, track, arating (automatic rating), rating, modificationdate, modificationtime<br>
	 * Result : {count_of_found_entries:(int),total_entries_count:(int),entries:[{field:value,},]}<br>
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {string[]} fields
	 * @param {int} start [opt] start at index
	 * @param {int} count [opt] entries count
	 * @param {string} search [opt] filter only tracks with specified string in one of these : title, artist, album, date, genre
	 */
	wrk.loadQueueMapped = function(successCallback, errorCallback, fields, start, count, search){
		var lffields = [], lfreq = "", lpfields = [];
		
		//var lp = ["id","title","artist","album","date","genre","bitrate","duration","filesize","rating","foldername"];
		var lf = {channels:"%C", path:"%D", extension:"%E", filename:"%F", samplerate:"%H", folder:"%PD", creationdate:"%DC", creationtime:"%TC", disc:"%DN", track:"%TN", arating:"%RT", modificationdate:"%DM", modificationtime:"%TM", title:"%IF(%T,%T,%F)"};
		
		for(var i=0;i<fields.length;i++){
			if(lf[fields[i]]){
				lffields.push(fields[i]);
				lfreq += lf[fields[i]]+"%Char(30)";
			}else{
				lpfields.push(fields[i]);
			}
		}
		
		var ret = {entries:[]};
		var r1 = true;
		successCallback = successCallback || defSuccessCallback;
				
		wrk.loadQueue(function(r,p,m){
			ret.count_of_found_entries = r.count_of_found_entries;
			ret.total_entries_count = r.total_entries_count;
			
			for(var ei=0;ei<r.entries.length;ei++){
				if(r1) ret.entries[ei] = {};
				
				var f = r.entries[ei][0].split("\u001e");
				lffields.forEach(function(n,i){
					ret.entries[ei][n] = f[i];
				});
			};
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, lfreq, start, count, search);
		
		wrk.loadQueue(function(r,p,m){
			for(var ei=0;ei<r.entries.length;ei++){
				if(r1) ret.entries[ei] = {};
				
				lpfields.forEach(function(n,i){
					ret.entries[ei][n] = r.entries[ei][i];
				});
			};
			
			if(!r1){
				p.fields = fields;
				successCallback(ret, p, m);
			}
			r1 = false;
		}, errorCallback, lpfields, start, count, search);
	};
		
	/**
	 * Returns URI of album cover.
	 * Result : {album_cover_uri:(string)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {int} width [opt]
	 * @param {int} height [opt]
	 */
	wrk.cover = function(successCallback, errorCallback, playlist_id, track_id, width, height){
		var params = {playlist_id:playlist_id, track_id:track_id};
		if(typeof width !== "undefined") params.cover_width = width;
		if(typeof height !== "undefined") params.cover_height = height;
		call("GetCover", params, function(r,p,m){
			r.album_cover_uri = url+"/"+r.album_cover_uri;
			successCallback(r,p,m);		
		}, errorCallback);
	};
	
	/**
	 * Player switched to playing/paused/stopped state or changed track.
	 * Result : {playback_state:"playing"|"paused"|"stopped", track_length:(int), track_position:(int)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.subscribe.playState = function(successCallback, errorCallback){
		call("SubscribeOnAIMPStateUpdateEvent",{event:"play_state_change"}, successCallback, errorCallback);
	};
	
	/**
	 * One of the followings is changed : playback state, mute, shuffle, repeat, volume level, radio capture, exit
	 * Result : {current_track_source_radio:(bool), mute_mode_on:(bool), playback_state:"playing"|"paused"|"stopped", radio_capture_mode_on:(bool), repeat_mode_on:(bool), shuffle_mode_on:(bool), playlist_id:(int), track_id:(int), volume:(int)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.subscribe.controlPanelState = function(successCallback, errorCallback){
		call("SubscribeOnAIMPStateUpdateEvent",{event:"control_panel_state_change"}, successCallback, errorCallback);
	};
	
	/**
	 * Current track change. Happens when track details change during play (webradio, ...)
	 * Result : {playlist_id:(int), track_id:(int)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.subscribe.track = function(successCallback, errorCallback){
		call("SubscribeOnAIMPStateUpdateEvent",{event:"current_track_change"}, successCallback, errorCallback);
	};
	
	/**
	 * Playlists change : content or count.<br>
	 * Note : This event will be fired if the rating changes too, and as if a rating is unset it is changed automatically, this event could be fired when you're just listening to something. (CRC32 will change too)<br>
	 * Result : {playlists_changed:(boolean), playlists:[{crc32:(int),id:(int)},]}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.subscribe.playlists = function(successCallback, errorCallback){
		call("SubscribeOnAIMPStateUpdateEvent",{event:"playlists_content_change"}, successCallback, errorCallback);
	};
	
	/**
	 * Set track rating.<br>
	 * Result : {}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {int} rating 0,1..5 0 is not set
	 */
	wrk.setRating = function(successCallback, errorCallback, playlist_id, track_id, rating){
		call("SetTrackRating",{playlist_id:playlist_id, track_id:track_id, rating:rating}, successCallback, errorCallback);
	};
	
	/**
	 * Returns versions of plugin and AIMP player.<br>
	 * Result : {aimp_version:(string),plugin_version:(string)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */	
	wrk.version = function(successCallback, errorCallback){
		call("Version", successCallback, errorCallback);
	};
	
	/**
	 * Returns plugin capabilities.<br>
	 * Result : {physical_track_deletion:(bool),scheduler:(bool),upload_track:(bool)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.pluginCapabilities = function(successCallback, errorCallback){
		call("PluginCapabilities", successCallback, errorCallback);		
	};
	
	var position = {auto:false, listeners:[], tickInterval:200, checkInterval:30000, speed:1, lastTicker:-1, lastUpdater:-1, lastUpdate:-1, lastPos:0, state:"playing",
		ticker:function(){
			position.lastTicker = setTimeout(position.ticker, position.tickInterval);
			if(position.lastUpdate){
				var pos = 0;
				if(position.state === "playing")pos = ((new Date().getTime() - position.lastUpdate)*position.speed) + position.lastPos*1000;
				else if(position.state === "paused")pos = position.lastPos*1000;
				position.listeners.forEach(function(l){
					l(pos);
				});
			}
		},
		updater:function(){
			position.lastUpdater = setTimeout(position.updater, position.checkInterval);
			wrk.status(function(r){position.lastPos=r.value; position.lastUpdate=new Date().getTime();},null,31);
		}
	};
	
	/**
	 * Track position change, default is every 200ms
	 * @param {function(pos(ms))} callback
	 */
	wrk.position.subscribe = function(callback){
		position.listeners.push(callback);
		if(!position.auto){
			position.auto = true;
			position.updater();
			position.ticker();
		}
	};
	/**
	 * Retrieve position from server again. Should be called on track change.
	 */
	wrk.position.forceUpdate = function(){
		if(position.auto){
			clearTimeout(position.lastUpdater);
			position.updater();
			clearTimeout(position.lastTicker);
			position.ticker();
		}
	};
	/**
	 * Set player state for the position handler. Should be called on state change. Will call forceUpdate.
	 * @param {"playing"|"paused"|"stopped"} state
	 */
	wrk.position.setState = function(state){
		position.state=state;
		wrk.position.forceUpdate();
	};
		
	/**
	 * Get track download URL.
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @returns {String}
	 */
	wrk.getDownloadURL = function(playlist_id, track_id){
		return url + "/downloadTrack/playlist_id/" + playlist_id + "/track_id/" + track_id;
	};
	
	return wrk;
}

function Ihm(ctrl, configTables){
	
	var public = {};
	var ctrack = {id:0, pls:0, dur:0, title:"", artist:"", album:"", cover:""};
	var tab = 0; // 0 = home, 1 = playlists, 2 = queue, 3 = settings, 4 = equalizer, 5 = credits
	var tabpls = 0;
	var tabplstr;
	var playlists = {};
	var queue = {entries:[], map:{}};
	var timebar;
	var volumebar;
	var i18n;
	var conf;
	var equalizers = {balance:{}, speed:{}, reverb:{}, echo:{}, chorus:{}, flanger:{}, group:{enabled:false, values:[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50]}};
	var trackTemplate, buttonTemplates, groupTemplate;
	
	DEBUG.ctrack = ctrack;
	DEBUG.playlists = playlists;
	
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
	
	public.i18n = function(messages){
		i18n = messages;

		// DOM templates
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

			var controls = document.createElement("div"), btn;
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
			})()
		};

		groupTemplate = document.createElement("div");
		groupTemplate.className = "group";
		groupTemplate.appendChild(document.createElement("h2"));
		groupTemplate.firstChild.appendChild((function(){
			var df = document.createDocumentFragment();
			df.appendChild(document.createElement("span"));
			df.appendChild(document.createElement("div"));
			df.appendChild(document.createElement("div"));
			df.childNodes[0].appendChild(document.createTextNode(" "));
			df.childNodes[1].appendChild(document.createTextNode("left"));
			df.childNodes[2].appendChild(document.createTextNode("right"));
			return df;
		})());
	};
		
	public.init = function(){
		$("#bprev, #fbprev").click(ctrl.previous).attr("title",i18n.controls.prev);
		$("#bstop").click(ctrl.stop).attr("title",i18n.controls.stop);
		$("#bpause, #fbpause").click(ctrl.pause).attr("title",i18n.controls.pause);
		$("#bplay, #fbplay").click(function(){ctrl.play();}).attr("title",i18n.controls.play);
		$("#bnext, #fbnext").click(ctrl.next).attr("title",i18n.controls.next);
		$("#bshuffle").click(function(){ctrl.shuffle(!$("#bshuffle").hasClass("active"));}).attr("title",i18n.controls.shuffle);
		$("#brepeat").click(function(){ctrl.repeat(!$("#brepeat").hasClass("active"));}).attr("title",i18n.controls.repeat);
		$("#bvolume").mouseover(function(){setTimeout(function(){$("#controlbuttons").addClass("volume");},10);}).click(function(){if($("#controlbuttons").hasClass("volume"))ctrl.setStatus(5, 1*!$("#bvolume").hasClass("active"));});
		$("#controls").mouseleave(function(){$("#controlbuttons").removeClass("volume");});
		$('nav a[data-lnk="queue"]').click(showQueue).text(i18n.nav.queue);
		$('nav h2[data-h="playlists"]').text(i18n.nav.playlists);
		$('nav h2[data-h="settings"]').text(i18n.nav.settings);
		$('nav a[data-lnk="settings"]').click(showSettings).text(i18n.nav.settings);
		$('nav a[data-lnk="equalizer"]').click(showEqualizer).text(i18n.nav.equalizer);
		$('nav a[data-lnk="credits"]').click(showCredits).text(i18n.nav.credits);
		$('nav a[data-lnk="fullscreen"]').click(function(){toolkit.toggleFullScreen();}).text(i18n.generic.fullscreen);
		$("#title").click(function(){
			if(tabpls !== ctrack.pls || tab !== 1) showPlaylist(ctrack.pls, ctrack.id);
			else {
				scrollToTrack(ctrack.id);
			}
		});
		$("#fbmenu").click(function(){
			$.scrollTo("nav", {duration:500});
		});
		$("#fbsearch").click(function(){
			$.scrollTo("#main h1", {duration:500});
			setTimeout(function(){$("#searchbar input").focus();},500);
		});
		
		timebar = RLib.hslider("#timebar", function(pos){ctrl.setStatus(31, Math.round(pos/1000));}, time);
		volumebar = RLib.hslider("#volumebar", function(v){ctrl.setStatus(1, Math.round(v));}, function(v){return Math.round(v)+"%";});
		volumebar.setTotal(100);
		$("#controlbuttons").removeClass("volume");
		$("#fbup").click(function(){$.scrollTo(0,{duration:500});});
		
		
		conf = JSON.parse(localStorage.getItem("AimpWebConf") || "{}");
		if(!conf.sort)conf.sort = {};
				
		equalizers.balance.tfx = function(v){
			v = Math.round(v);
			if(v < 50) return i18n.equalizer.left()+" "+((100-v))+"%";
			else if(v === 50) return i18n.equalizer.center;
			else return i18n.equalizer.right()+" "+v+"%";
		};
		equalizers.balance.t = $("<div>").addClass("value");
		equalizers.balance.s = RLib.hslider(equalizers.balance.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(2, Math.round(v));
			equalizers.balance.s.setPosition(Math.round(v));
			equalizers.balance.t.text(equalizers.balance.tfx(v));
		}, equalizers.balance.tfx, 50); equalizers.balance.s.setTotal(100);
		
		equalizers.speed.tfx = function(v){return Math.round(v+50)+"%";};
		equalizers.speed.t = $("<div>").addClass("value");
		equalizers.speed.s = RLib.hslider(equalizers.speed.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(3, Math.round(v));
			equalizers.speed.s.setPosition(Math.round(v));
			equalizers.speed.t.text(equalizers.speed.tfx(v));
		}, equalizers.speed.tfx, 50); equalizers.speed.s.setTotal(100);
		
		equalizers.reverb.tfx = function(v){return Math.round(v)+"%";};
		equalizers.reverb.t = $("<div>").addClass("value");
		equalizers.reverb.s = RLib.hslider(equalizers.reverb.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(6, Math.round(v));
			equalizers.reverb.s.setPosition(Math.round(v));
			equalizers.reverb.t.text(equalizers.reverb.tfx(v));
		}, equalizers.reverb.tfx, 0); equalizers.reverb.s.setTotal(100);
		
		equalizers.echo.tfx = function(v){return Math.round(v)+"%";};
		equalizers.echo.t = $("<div>").addClass("value");
		equalizers.echo.s = RLib.hslider(equalizers.echo.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(7, Math.round(v));
			equalizers.echo.s.setPosition(Math.round(v));
			equalizers.echo.t.text(equalizers.echo.tfx(v));
		}, equalizers.echo.tfx, 0); equalizers.echo.s.setTotal(100);
		
		equalizers.chorus.tfx = function(v){return Math.round(v)+"%";};
		equalizers.chorus.t = $("<div>").addClass("value");
		equalizers.chorus.s = RLib.hslider(equalizers.chorus.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(8, Math.round(v));
			equalizers.chorus.s.setPosition(Math.round(v));
			equalizers.chorus.t.text(equalizers.chorus.tfx(v));
		}, equalizers.chorus.tfx, 0); equalizers.chorus.s.setTotal(100);
		
		equalizers.flanger.tfx = function(v){return Math.round(v)+"%";};
		equalizers.flanger.t = $("<div>").addClass("value");
		equalizers.flanger.s = RLib.hslider(equalizers.flanger.e = $("<div>").addClass("eqSlider"), function(v){
			ctrl.setStatus(9, Math.round(v));
			equalizers.flanger.s.setPosition(Math.round(v));
			equalizers.flanger.t.text(equalizers.flanger.tfx(v));
		}, equalizers.flanger.tfx, 0); equalizers.flanger.s.setTotal(100);
		
		equalizers.group.vfx = function(v){
			v = Math.round(v);
			if(v < 50) return "-"+Math.round(10*(50-v)/50*15)/10+"db";
			else return "+"+Math.round(10*(v-50)/50*15)/10+"db";
		};
		equalizers.group.cfx = function(c){
			return configTables.eqaulizers[c]+"Hz";
		};
		equalizers.group.s = RLib.vmslider(equalizers.group.e = $("<div>").addClass("eqMSlider"), equalizers.group.values, 100, 50, 10, equalizers.group.vfx, equalizers.group.cfx, function(c,v){ctrl.setStatus(11+c, Math.round(v));equalizers.group.s.set(c, Math.round(v));}, "#000", "#484");
		
		if(conf.skin && configTables.skins[conf.skin])applySkin(configTables.skins[conf.skin]);
	};
	
	function pad2(i){
		return (i<10?"0"+i:i);
	}
	function time(t){
		t=Math.floor(t/1000);
		if(t<3600)return Math.floor(t/60)+":"+pad2(t%60);
		else if(t<360000)return Math.floor(t/3600)+pad2(Math.floor(t/60))+":"+pad2(t%60);
		else return Math.floor(t/86400)+pad2(Math.floor(t/3600))+pad2(Math.floor(t/60))+":"+pad2(t%60);
	}
	function saveConfig(){
		localStorage.setItem("AimpWebConf", JSON.stringify(conf));
	}
	function scrollToTrack(id){
		var t = $("#main .track[data-id="+id+"]");
		if(t.parent().hasClass("group") && t.parent().hasClass("folded")){
			t.parent().children().first().click();
		};
		$.scrollTo(t, {offset:{ top:-200}, duration:500});
	}
	
	public.updateState = function(o, p){
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
				equalizers.balance.s.setPosition(o.value);
				equalizers.balance.t.text(equalizers.balance.tfx(o.value));
			}else if(p.status_id === 3){ // speed
				equalizers.speed.s.setPosition(o.value);
				equalizers.speed.t.text(equalizers.speed.tfx(o.value));
			}else if(p.status_id === 4){ // play state
				$("#bplay,#bstop,#bpause,#fbplay,#fbpause").removeClass("active");
				if(o.value === 0){$("#bstop").addClass("active");}
				else if(o.value === 1){$("#bplay,#fbplay").addClass("active");}
				else if(o.value === 2){$("#bpause,#fbpause").addClass("active");}
			}else if(p.status_id === 5){ // mute
				if(o.value)$("#bvolume").addClass("active");
				else $("#bvolume").removeClass("active");
			}else if(p.status_id === 6){ // reverb
				equalizers.reverb.s.setPosition(o.value);
				equalizers.reverb.t.text(equalizers.reverb.tfx(o.value));
			}else if(p.status_id === 7){ // echo
				equalizers.echo.s.setPosition(o.value);
				equalizers.echo.t.text(equalizers.echo.tfx(o.value));
			}else if(p.status_id === 8){ // chorus
				equalizers.chorus.s.setPosition(o.value);
				equalizers.chorus.t.text(equalizers.chorus.tfx(o.value));
			}else if(p.status_id === 9){ // flanger
				equalizers.flanger.s.setPosition(o.value);
				equalizers.flanger.t.text(equalizers.flanger.tfx(o.value));
			}else if(p.status_id === 10){ // equalizer status
				equalizers.group.enabled = (o.value && true) || false;
				if(tab === 4)showEqualizer();
			}else if(p.status_id > 10 && p.status_id < 29){ // equalizer value
				equalizers.group.s.set(p.status_id - 11, o.value);
			}else if(p.status_id === 29){ // repeat
				if(o.value)$("#brepeat").addClass("active");
				else $("#brepeat").removeClass("active");
			}else if(p.status_id === 41){ // shuffle
				if(o.value)$("#bshuffle").addClass("active");
				else $("#bshuffle").removeClass("active");
			}
		}
	};
	
	function showQueue(){
		$("#main .detach").detach();
		$("#fixedPanel").addClass("active");
		tab = 2;
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"queue\"]").addClass("active");
		$("#main").html($("<h1>").text(i18n.nav.queue));
		if(queue.entries.length === 0) $("<div>").appendTo("#main").addClass("message").addClass("fill").text(i18n.playlists.queueEmpty);
		else{
			queue.entries.forEach(function(v,k){
				var t = $("<div>").addClass("track").appendTo("#main");
				$("<div>").addClass("no").text((k+1)+".").appendTo(t);
				$("<div>").addClass("title").text(v.title).attr("title",v.title).appendTo(t).click(function(){showPlaylist(v.playlist_id, v.id);});
				$("<div>").addClass("control").text("remove").attr("title","remove from queue").appendTo(t).click(function(){ctrl.unqueue(v.playlist_id, v.id);});
				$("<div>").addClass("control").text("up").attr("title","move up").appendTo(t).click(function(){if(k!==0)ctrl.queuemove(k, k-1);});
				//$("<div>").addClass("control").text("down").attr("title","move down").appendTo(t).click(function(){if(k!==queue.entries.length-1)ctrl.queuemove(k, k+1);});
				$("<div>").addClass("album").text(v.album).attr("title",v.album).appendTo(t);
				$("<div>").addClass("artist").text(v.artist).attr("title",v.artist).appendTo(t);
				$("<div>").addClass("duration").text(time(v.duration)).appendTo(t);
			});
			$("<p>").appendTo("#main").text(" ");
			$("<p>").appendTo("#main").text(" ");
		}
		$.scrollTo("#main h1");
	}
	function showPlaylist(playlist_id, track_id){
		$("#main .detach").detach();
		$("#fixedPanel").addClass("active");
		var ot = tab;
		tab = 1;
		$("nav a").removeClass("active");
		$("#playlists a[data-id="+playlist_id+"]").addClass("active");
		if(!playlists[playlist_id].loaded){
			ctrl.loadPlaylist(playlist_id);
			if(playlist_id===tabpls)return;
			$("#main").html($("<h1>").text(playlists[playlist_id].title));
			$("#main").append($("<div>").addClass("message").addClass("fill").text(i18n.generic.loading));
		}else{
			var bench = [new Date().getTime()], m = $("#main"), dm = m.get(0), playlist_hash = playlists[playlist_id].title.hashCode();
			
			var tracks, tracksEl = [];
			
			var searchFx = (function(){
				var cache = {};
				var last = "";
				
				return function(e){
					if(!cache[""]) cache[""] = tracks.slice();
					if(e && e.keyCode === 27) this.value="";
					if (this.value.length > 0) {
						$("#main").addClass("search");
						if(!cache[this.value])cache[this.value] = searchTest(this.value, playlists[playlist_id].tracks, (last===this.value.substr(0,last.length)?cache[last]:tracks));
						
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
				$("<span>").text(playlists[playlist_id].title)
			).append(
				$('<div id="searchbar">').append(
					$("<input>").keyup(searchFx).change(searchFx).attr("placeholder", i18n.playlists.search()+"…")
				).append(
					$('<div>').text("no").click(function(){
						this.previousSibling.value = "";
						searchFx.call(this.previousSibling);
					})
				)
			));
			var group = $("<div>").appendTo(m).text(i18n.playlists.groupBy).addClass("groups");
			var sort = $("<div>").appendTo(m).text(i18n.playlists.sortBy).addClass("sorts");
			
			var grouped = (conf.globalSort ? conf.sort.gGroup : conf.sort["gp"+playlist_hash]) || [];
			var sorted = (conf.globalSort ? conf.sort.gSort : conf.sort["p"+playlist_hash]) || [];
			if(!conf.sort["g"+playlist_hash]) conf.sort["g"+playlist_hash] = {default:(conf.oneGroup&&true||false)};

			grouped.forEach(function(v){
				$("<span>").appendTo(group).text(i18n.playlists[v]()).addClass("active").append($("<span>").addClass("remove").text("no")).click(function(){
					if(conf.globalSort) conf.sort.gGroup = _.without(grouped, v);
					else conf.sort["gp"+playlist_hash] = _.without(grouped, v);
					saveConfig();
					showPlaylist(tabpls);
				});
			});
			["artist","album","folder"].forEach(function(v){
				if(grouped.indexOf(v) > -1) return;
				$("<span>").appendTo(group).text(i18n.playlists[v]()).click(function(){
					grouped.push(v);
					if(conf.globalSort) conf.sort.gGroup = grouped;
					else conf.sort["gp"+playlist_hash] = grouped;
					saveConfig();
					showPlaylist(tabpls);
				});
			});
			
			sorted.forEach(function(v){
				$("<span>").appendTo(sort).text(i18n.playlists[v]()).addClass("active").append($("<span>").addClass("remove").text("no")).click(function(){
					if(conf.globalSort) conf.sort.gSort = _.without(sorted, v);
					else conf.sort["p"+playlist_hash] = _.without(sorted, v);
					saveConfig();
					showPlaylist(tabpls);
				});
			});
			["artist","album","title","duration","track","path","rating"].forEach(function(v){
				if(grouped.indexOf(v) > -1 || sorted.indexOf(v) > -1) return;
				$("<span>").appendTo(sort).text(i18n.playlists[v]()+" ").click(function(){
					sorted.push(v);
					if(conf.globalSort) conf.sort.gSort = sorted;
					else conf.sort["p"+playlist_hash] = sorted;
					saveConfig();
					showPlaylist(tabpls);
				});
			});
			
			var psort = grouped;
			psort = psort.concat(sorted);
						
			if(psort.length === 0) tracks = _.range(playlists[playlist_id].tracks.length);
			else if(playlists[playlist_id].cache && playlists[playlist_id].cacheD === JSON.stringify(psort)) tracks = playlists[playlist_id].cache;
			else{
				playlists[playlist_id].cacheD = JSON.stringify(psort);
				playlists[playlist_id].cache = _.range(playlists[playlist_id].tracks.length);
				playlists[playlist_id].cache.sort(function(a, b){
					for(var  i=0;i<psort.length;i++){
						var av=playlists[playlist_id].tracks[a][psort[i]], bv = playlists[playlist_id].tracks[b][psort[i]];
						if(psort[i] === "track"){
							av = 1*(av||0)+1000*(playlists[playlist_id].tracks[a].disc || 0);
							bv = 1*(bv||0)+1000*(playlists[playlist_id].tracks[b].disc || 0);
						}else if(psort[i] === "rating"){
							if(av > 0) av = 5-av;
							else av = 15-playlists[playlist_id].tracks[a].arating || 15;
							if(bv > 0) bv = 5-bv;
							else bv = 15-playlists[playlist_id].tracks[b].arating || 15;
						}
						
						if(av !== bv)
							return av < bv ?
							-1 : 1;
					};
					return 0;
				});
				tracks = playlists[playlist_id].cache;
			}
			
			if(grouped.length > 0){
				m.append($("<button>").text(i18n.playlists.foldAll).click(function(){
					m.find(".group").addClass("folded");
					conf.sort["g"+playlist_hash] = {default:true};
					saveConfig();
				}));
				if(!conf.oneGroup) m.append($("<button>").text(i18n.playlists.unfoldAll).click(function(){
					m.find(".group").removeClass("folded");
					conf.sort["g"+playlist_hash] = {default:false};
					saveConfig();
				}));
			}
			
			var lastGroup = {};
			var altn = sorted.indexOf("track") >= 0;
			
			// group for track insertin
			var group = dm;
			
			bench.push(new Date().getTime());
						
			tracks.forEach(function(i,k){
				var v = playlists[playlist_id].tracks[i];
				
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
							if(conf.oneGroup){
								$("#main .group").addClass("folded");
								conf.sort["g"+playlist_hash] = {default:true};
								conf.sort["g"+playlist_hash][gid.hashCode()] = false;
							}else{
								conf.sort["g"+playlist_hash][gid.hashCode()] = status;
							}
							$(group).toggleClass("folded", status);
							saveConfig();
						};})(group, gid));
						group.firstChild.firstChild.firstChild.data = gid;
						if( conf.sort["g"+playlist_hash][gid.hashCode()] === true || (conf.sort["g"+playlist_hash][gid.hashCode()] !== false) && conf.sort["g"+playlist_hash].default){
							group.className += " folded";
						}
						group.firstChild.childNodes[1].addEventListener("click", function(e){
							e.stopPropagation();
							var offset = window.matchMedia("(max-width:799px)").matches ? 0 : -100;
							var prev = this.parentNode.parentNode.previousSibling;
							if(!$(prev).hasClass("group"))$.scrollTo("#main h1", {duration:200});
							else{
								if($(prev).hasClass("folded"))
									prev.firstChild.click();
								$.scrollTo(prev, {offset:{ top:offset}});
							}
						});
						group.firstChild.childNodes[2].addEventListener("click", function(e){
							e.stopPropagation();
							var offset = window.matchMedia("(max-width:799px)").matches ? 0 : -100;
							var next = this.parentNode.parentNode.nextSibling;
							if(!next)$.scrollTo(this.parentNode.parentNode.lastChild, {duration:200});
							else{
								if($(next).hasClass("folded"))
									next.firstChild.click();
								$.scrollTo(next, {offset:{ top:offset}});
							}
						});
						dm.appendChild(group);
					}
				}
				
				var track = trackTemplate.cloneNode(true);
				tracksEl[i] = track;
				
				if(playlist_id === ctrack.pls && v.id === ctrack.id) track.className += " active";
				if(queue.map[playlist_id] && queue.map[playlist_id][v.id]) track.className += " queued";
				track.dataset.id = v.id;
				
				// Track number
				if(altn && v.track) track.childNodes[0].firstChild.data = (v.disc?v.disc+"-":"")+1*v.track;
				else track.childNodes[0].firstChild.data = k+1+".";
				
				// Title
				track.childNodes[1].title = v.title;
				track.childNodes[1].firstChild.data = v.title;
				track.childNodes[1].addEventListener("click", function(){
					ctrl.play(playlist_id, v.id);
				});
				
				// Controls
				var btn;
				if(conf.downloadButton){
					btn = buttonTemplates.download.cloneNode(true);
					btn.addEventListener("click", function(){
						ctrl.download(playlist_id, v.id);
					});
					track.childNodes[2].appendChild(btn);
				}
				btn = buttonTemplates.queue.cloneNode(true);
				btn.addEventListener("click", function(){
					ctrl.queue(playlist_id, v.id);
				});
				track.childNodes[2].appendChild(btn);
				
				// Album
				track.childNodes[3].title = v.album;
				track.childNodes[3].firstChild.data = v.album;
				
				// Artist
				track.childNodes[4].title = v.artist;
				track.childNodes[4].firstChild.data = v.artist;
				
				// Duration
				track.childNodes[5].firstChild.data = time(v.duration);
				
				// Rating
				if(!conf.hideRatings){
					v.ratingEl = RLib.rating(v.arating, v.rating, function(r){
						ctrl.setRating(playlist_id, v.id, r);
						if(sorted.indexOf("rating")>=0)playlists[playlist_id].loaded = false;
					});
					v.ratingEl.el.className += " rating";
					track.appendChild(v.ratingEl.el);
				}
				
				group.appendChild(track);				
			});
			
			
						
			bench.push(new Date().getTime());
			
			//alert("It took "+(bench[1]-bench[0])+"ms to sort and "+(bench[2]-bench[1])+"ms to show.");
			
			$("<p>").appendTo("#main").text(" ");
			$("<p>").appendTo("#main").text(" ");
			if(track_id || tabplstr){
				scrollToTrack(track_id || tabplstr);
				track_id = null;
			}else{
				if(tabpls !== playlist_id || ot !== 1)$.scrollTo("#main h1");
			}
		}
		tabpls = playlist_id;
		tabplstr = track_id;
	};
	public.updatePlaylists = function(o){
		var npi = {};
		o.forEach(function(v){
			npi[v.id] = true;
			if(playlists[v.id]){
				$("#playlists a[data-id="+v.id+"]").text(v.title).get(0).dataset.title = v.title;
				playlists[v.id].title = v.title;
				if(playlists[v.id].crc32 !== v.crc32){
					playlists[v.id].loaded = false;
					if(tab === 1 && tabpls === v.id)showPlaylist(tabpls);
				}
			}else{
				playlists[v.id] = {title:v.title,crc32:v.crc32,tracks:[],loaded:false};
				var a = $("<a>").text(v.title).appendTo("#playlists").click(function(){
					$.scrollTo("#main h1", {duration:500});
					if(tab !== 1 || tabpls !== v.id) showPlaylist(v.id);}).get(0);
				a.dataset.id = v.id;
				a.dataset.title = v.title;
			}
		});
		_.each(playlists, function(v,k){
			if(!npi[k]) delete playlists[k];
			$("#playlists a[data-id="+v.id+"]").remove();
		});
		$("#playlists > a").sortElements(comparePlaylistsEl);
		$("#playlists > a:not([data-id="+ctrack.pls+"])").removeClass("playing");
		$("#playlists > a[data-id="+ctrack.pls+"]").addClass("playing");
	};
	public.loadPlaylist = function(o,p){
		var fullReload = tab !== 1 || tabpls !== p.playlist_id || !playlists[p.playlist_id].tracks;
		var c = ["title","artist","album","duration","track","disc","path","folder"];
		
		if(tab === 1 && tabpls === p.playlist_id){
			if(!playlists[p.playlist_id].loaded || o.entries.length !== playlists[p.playlist_id].tracks.length) fullReload = true;
			else{
				playlists[p.playlist_id].tmap = {};
				for(var i=0;i<o.entries.length;i++){
					var m=playlists[p.playlist_id].tracks[i], n=o.entries[i];
					
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
						//if(m.id !== n.id){
							//playlists[p.playlist_id].tmap[m.id] = playlists[p.playlist_id].tmap[n.id];
							playlists[p.playlist_id].tmap[n.id] = i;
							document.querySelector('#main .track[data-id="'+m.id+'"]').dataset.id = n.id*1000+999;
							if(ctrack.id === m.id && ctrack.title === m.title) ctrack.id = n.id;
							m.id = n.id;
						//}
					}else{
						break;
					}
				}
				if(!fullReload){
					playlists[p.playlist_id].loaded = true;
					_.each(document.querySelectorAll("#main .track[data-id]"),function(v){
						v.dataset.id = (v.dataset.id-999)/1000;
					});
				}
			}
		}
		
		if(fullReload){
			playlists[p.playlist_id].loaded = true;
			playlists[p.playlist_id].tracks = o.entries;
			playlists[p.playlist_id].tmap = {};
			playlists[p.playlist_id].cacheD = false;
			o.entries.forEach(function(v,k){
				playlists[p.playlist_id].tmap[v.id]=k;
				playlists[p.playlist_id].tracks[k].search = searchPrepare(v.title+" "+v.artist+" "+v.album);
				if(p.playlist_id === ctrack.pls && v.id === ctrack.id) public.showTrack(v);
			});
			if(tab === 1 && tabpls === p.playlist_id)showPlaylist(p.playlist_id);
		}
	};
	public.loadQueue = function(o){
		queue.entries = o.entries;
		queue.map = {};
		if(tab===1)$("#main .track").removeClass("queued");
		o.entries.forEach(function(t){
			if(!queue.map[t.playlist_id]) queue.map[t.playlist_id]={};
			queue.map[t.playlist_id][t.id] = true;
			if(tab===1 && tabpls===t.playlist_id)$("#main .track[data-id="+t.id+"]").addClass("queued");
		});
		if(tab===2) showQueue();
	};
	
	public.showTrack = function(t){
		$("#title").text(ctrack.title = t.title);
		if(!conf.showInfos){
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
	public.showCover = function(o){
		$("#cover").css("background-image","url("+o.album_cover_uri+")").removeClass("nocover");
		ctrack.cover = o.album_cover_uri;
		if(conf.notif){
			if(Notification.permission === "default") Notification.requestPermission(public.updateTrack);
			else new Notification(ctrack.title, {body:ctrack.artist+"\n"+ctrack.album, tag:"songPlaying", icon:ctrack.cover});
		}
	};
	public.hideCover = function(){
		$("#cover").css("background-image","none").addClass("nocover");
		if(conf.notif){
			if(Notification.permission === "default") Notification.requestPermission(public.updateTrack);
			else new Notification(ctrack.title, {body:ctrack.artist+"\n"+ctrack.album, tag:"songPlaying", icon:"css/img/beamed-note.png"});
		}
		return true;
	};
	public.updateTrack = function(o){
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
			if(tabpls === ctrack.pls && tab === 1){
				$("#main .track:not([data-id="+ctrack.id+"])").removeClass("active");
				var tr = $("#main .track[data-id="+ctrack.id+"]").addClass("active");
				if(conf.followTrack){
					tr.parent().removeClass("folded");
					$.scrollTo(tr, {offset:{ top:-200}, duration:500});
				}
			}
		}
		if(playlists[o.playlist_id] && playlists[o.playlist_id].loaded){
			var old = $.extend({}, ctrack);
			public.showTrack(playlists[o.playlist_id].tracks[playlists[o.playlist_id].tmap[o.track_id||o.id]]);
			if(!change && (ctrack.title !== old.title || ctrack.album !== old.album || ctrack.artist !== old.artist)){
				if(ctrack.cover)public.showCover({album_cover_uri:ctrack.cover});
				else public.hideCover();
			}
		}else if(o.title){
			var old = $.extend({}, ctrack);
			public.showTrack(o);
			if(!change && (ctrack.title !== old.title || ctrack.album !== old.album || ctrack.artist !== old.artist)){
				if(ctrack.cover)public.showCover({album_cover_uri:ctrack.cover});
				else public.hideCover();
			}
		}else{
			ctrl.loadCurrTrack();
		}
	};
	public.updatePos = function(p){
		if(p<1e12) $("#time").text(time(p));
		timebar.setPosition(p);
	};
    
    function showSettings(){
		$("#main .detach").detach();
		$("#fixedPanel").removeClass("active");
		//var conf = JSON.parse(localStorage.getItem("AimpWebConf") || "{}");
		
        tab = 3;
        $("nav a").removeClass("active");
        $("nav a[data-lnk=\"settings\"]").addClass("active");
        var m = $("#main").html($("<h1>").text(i18n.settings.h));
		$("<p>").appendTo(m).text(i18n.settings.saveT);
		
		$("<h2>").appendTo(m).text(i18n.settings.lang);
		$("<p>").appendTo(m).text(i18n.settings.langT()+" "+i18n.settings.reloadT());
		var clang = localStorage.getItem("lang") || "en";
		var ll = $("<div>").appendTo(m).addClass("langs");
		_.each(configTables.lang, function(v,k){
			var l = $("<div>").appendTo(ll);
			$("<div>").appendTo(l).text(v.l).addClass("name");
			$("<div>").appendTo(l).text(v.en).addClass("enname");
			$("<div>").appendTo(l).text(i18n.settings.completion({p:v.progress})).addClass("progress");
			if(k === clang)l.addClass("active");
			else l.click(function(){
				localStorage.setItem("lang", k);
				document.location = "./";
			});
		});
		
		$("<h2>").appendTo(m).text(i18n.settings.skins);
		$("<p>").appendTo(m).text(i18n.settings.skinsT);
		var cskin = conf.skin || "cleanGreen";
		var sl = $("<div>").appendTo(m).addClass("skins");
		_.each(configTables.skins, function(v,k){
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
				showSettings();
			});
		});
				
		$("<h2>").appendTo(m).text(i18n.settings.notifications);
		if(!window.Notification || !window.Notification.permission)$("<p>").appendTo(m).text(i18n.settings.notSupported()+" [").append($("<a>").text("caniuse.com/#feat=notifications").attr("href","http://caniuse.com/#feat=notifications")).append("]");
		else if(Notification.permission === "denied"){
			$("<div>").appendTo(m).addClass("checkbox").text(i18n.generic.blocked).addClass("blocked");
		}else if(conf.notif){
			$("<div>").appendTo(m).addClass("checkbox").text(i18n.generic.enabled).addClass("active").click(function(){
				conf.notif = false;
				saveConfig();
				showSettings();
			});
		}else{
			$("<div>").appendTo(m).addClass("checkbox").text(i18n.generic.disabled).click(function(){
				conf.notif = true;
				saveConfig();
				Notification.requestPermission(public.updateTrack);
				showSettings();
			});
		}
		$("<span>").appendTo(m).text(i18n.settings.notificationsT);
		
		$("<h2>").appendTo(m).text(i18n.settings.sorting);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.globalSort ? i18n.generic.enabled : i18n.generic.disabled).addClass(conf.globalSort ? "active" : "").click(function(){
			conf.globalSort = !(conf.globalSort && true || false);
			saveConfig();
			showSettings();
		});
		$("<span>").appendTo(m).text(i18n.settings.globalSort);
		$("<br>").appendTo(m);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.oneGroup ? i18n.generic.enabled : i18n.generic.disabled).addClass(conf.oneGroup ? "active" : "").click(function(){
			conf.oneGroup = !(conf.oneGroup && true || false);
			saveConfig();
			showSettings();
		});
		$("<span>").appendTo(m).text(i18n.settings.oneGroup);
		$("<br>").appendTo(m);
		$("<br>").appendTo(m);
		$("<button>").appendTo(m).text(i18n.settings.reset).click(function(){
			if(confirm(i18n.settings.resetSort()+"\n"+i18n.generic.confirm())){
				conf.sort = {};
				saveConfig();
			}
		});
		$("<span>").appendTo(m).text(" "+i18n.settings.resetSort());
		
		$("<h2>").appendTo(m).text(i18n.settings.display);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.downloadButton ? i18n.generic.enabled : i18n.generic.disabled).addClass(conf.downloadButton ? "active" : "").click(function(){
			conf.downloadButton = !(conf.downloadButton && true || false);
			saveConfig();
			showSettings();
		});
		$("<span>").appendTo(m).text(i18n.settings.downloadButton);
		$("<br>").appendTo(m);		
		$("<div>").appendTo(m).addClass("checkbox").text(!conf.hideRatings ? i18n.generic.enabled : i18n.generic.disabled).addClass(!conf.hideRatings ? "active" : "").click(function(){
			conf.hideRatings = !(conf.hideRatings && true || false);
			saveConfig();
			showSettings();
		});
		$("<span>").appendTo(m).text(i18n.settings.showRating);
		$("<br>").appendTo(m);		
		$("<div>").appendTo(m).addClass("checkbox").text(conf.showInfos ? i18n.generic.enabled : i18n.generic.disabled).addClass(conf.showInfos ? "active" : "").click(function(){
			conf.showInfos = !(conf.showInfos && true || false);
			saveConfig();
			showSettings();
			public.updateTrack({track_id:ctrack.id, playlist_id:ctrack.pls});
		});
		$("<span>").appendTo(m).text(i18n.settings.showInfos);
		$("<br>").appendTo(m);
		
		$("<h2>").appendTo(m).text(i18n.settings.misc);
		$("<div>").appendTo(m).addClass("checkbox").text(conf.followTrack ? i18n.generic.enabled : i18n.generic.disabled).addClass(conf.followTrack ? "active" : "").click(function(){
			conf.followTrack = !(conf.followTrack && true || false);
			saveConfig();
			showSettings();
		});
		$("<span>").appendTo(m).text(i18n.settings.followTrack);
		
		$("<p>").appendTo(m).text(" ");
		$.scrollTo("#main h1");
    }
	
	function showEqualizer(){
		$("#main .detach").detach();
		$("#fixedPanel").removeClass("active");
		tab = 4;
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"equalizer\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(i18n.equalizer.h));
		$("<p>").appendTo(m).text(i18n.equalizer.refreshT);
		$("<button>").appendTo(m).text(i18n.equalizer.refresh).click(ctrl.refreshEQ);
		
		$("<h2>").appendTo(m).text(i18n.equalizer.fx);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.balance))
			.append(equalizers.balance.t)
			.append(equalizers.balance.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.speed))
			.append(equalizers.speed.t)
			.append(equalizers.speed.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.reverb))
			.append(equalizers.reverb.t)
			.append(equalizers.reverb.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.echo))
			.append(equalizers.echo.t)
			.append(equalizers.echo.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.chorus))
			.append(equalizers.chorus.t)
			.append(equalizers.chorus.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(i18n.equalizer.flanger))
			.append(equalizers.flanger.t)
			.append(equalizers.flanger.e);
		
		$("<h2>").appendTo(m).text(i18n.equalizer.h);
		var enBtn = $("<div>").appendTo(m).addClass("checkbox").text(equalizers.group.enabled ? i18n.generic.enabled : i18n.generic.disabled).click(function(){
			ctrl.setStatus(10, 1*!equalizers.group.enabled);
			equalizers.group.enabled = !equalizers.group.enabled;
			showEqualizer();
		});
		if(equalizers.group.enabled) enBtn.addClass("active");
		$("<button>").appendTo(m).text(i18n.generic.fullscreen).click(function(){
			toolkit.toggleFullScreen(equalizers.group.e.get(0), function(){
				alert(i18n.settings.notSupported());
			});
		});
		equalizers.group.e.appendTo(m);
		equalizers.group.s.update();
		$("<h2>").appendTo(m).text(i18n.equalizer.presets);
		_.each(configTables.presets, function(v, k){
			var lv = v;
			$("<button>").appendTo(m).text(i18n.equalizer["p"+k]).click(function(){
				equalizers.group.s.setAll(lv);
			}).mouseover(function(){
				equalizers.group.s.preview(lv);
			}).mouseout(function(){
				equalizers.group.s.cancelPreview();
			});
		});
		
		$("<p>").appendTo(m).text(" ");
		$.scrollTo("#main h1");
	}
	
	function showCredits(){
		$("#main .detach").detach();
		$("#fixedPanel").removeClass("active");
		tab = 5;
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"credits\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(i18n.credits.h));
		$("<p>").appendTo(m).text(i18n.credits.dev({dev:"Gilles Waeber"})+" [").append($("<a>").attr("href","http://gilleswaeber.ch").text("gilleswaeber.ch")).append("]");
		$("<h2>").appendTo(m).text(i18n.credits.ressources);
		$("<p>").appendTo(m).text(i18n.credits.appUsing({what:"Entypo icons",who:"Daniel Bruce"})+" [").append($("<a>").attr("href","http://www.entypo.com").text("www.entypo.com")).append("]");
		$("<p>").appendTo(m).text(i18n.credits.aimp()+" [").append($("<a>").attr("href","http://www.aimp.ru").text("www.aimp.ru")).append("] [").append($("<a>").attr("href","https://github.com/a0ivanov/aimp-control-plugin").text("github.com/a0ivanov")).append("]");
		$("<h2>").appendTo(m).text(i18n.credits.translations);
		$("<p>").appendTo(m).text("French & english translations by Gilles Waeber");
		
		$("<p>").appendTo(m).text(" ");
		$.scrollTo("#main h1");
	}
	
	function applySkin(skin){
		$("<style>"+
			"header, nav, body, #main button, #fixedPanel, #main h2{ background:" +skin.background+";}"+
			"nav a.active.playing{ border-color:" +skin.background+";}"+
			"nav a.active, .checkbox.active, .rlib_tip{ color:" +skin.background+";}"+
			
			"#songblock, #timebar, #controlbuttons #volumebar, .rlib_slider, .checkbox, .eqMSlider, #searchbar{ background: "+skin.background2+";}"+
			"#main .group h2{ border-color: "+skin.background2+";}"+
			
			".skins > div, header, nav, #main button, #fixedPanel, .track .control{ border-color:"+skin.foreground+";}"+
			".rlib_limit, .rlib_tip{ background:"+skin.foreground+";}"+
			"body, #main button, #searchbar input{ color:"+skin.foreground+";}"+
			
			"nav a.active, .rlib_hfilled, .checkbox.active{ background:" +skin.accent+";}"+
			"#cover.nocover, #controlbuttons div.active, .track.queued .control.queue, a:link, a:visited, .groups .active, .sorts .active, #fixedPanel div.active, .rlib_rating.set .star{ color: "+skin.accent+";}"+
			"nav a.playing, .skins > div.active{ border-color:" +skin.accent+";}"+
		"</style>").appendTo("head");
		equalizers.group.s.setColors(skin.foreground, skin.accent);
	}
	
	return public;
}

function Ctrl(){
	var configTables = {
		lang:{
			en:{
				en:"English", l:"English", progress:100
			},
			fr:{
				en:"French", l:"Français", progress:100
			},
			ru:{
				en:"Russian", l:"Русский", progress:51
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
			
			geekGreen:{background:"#000", background2:"#222", foreground:"#0C0", accent:"#0F0"},
			geekGreen2:{background:"#000", background2:"#222", foreground:"#0C0", accent:"#060"},
			geekRed:{background:"#000", background2:"#222", foreground:"#C00", accent:"#F00"},
			geekRed2:{background:"#000", background2:"#222", foreground:"#F00", accent:"#600"},
			geekBlue:{background:"#000", background2:"#222", foreground:"#0CC", accent:"#0FF"},
			geekBlue2:{background:"#000", background2:"#222", foreground:"#0FF", accent:"#066"},
			geekYellow:{background:"#000", background2:"#222", foreground:"#CC0", accent:"#FF0"},
			geekYellow2:{background:"#000", background2:"#222", foreground:"#FF0", accent:"#660"},
			
			darkGreen:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#2B2"},
			darkOrange:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#F91"},
			darkRed:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#C22"},
			darkBlue:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#2CC"},
			darkBlue2:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#26C"},
			darkPurple:{background:"#000", background2:"#222", foreground:"#DDD", accent:"#C2C"},
			darkGrey:{background:"#000", background2:"#222", foreground:"#AAA", accent:"#DDD"},
			
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
	var itfIhm = {}, public = {};
	
	var TRACK_FIELDS = ["channels", "path", "extension", "filename", "arating", "folder", "creationdate", "creationtime", "disc", "track", "modificationdate", "modificationtime", "samplerate"],
		PLAYLIST_FIELDS = ["id", "title", "artist", "album", "duration", "track", "disc", "path", "rating", "arating", "folder", "channels", "filename", "extension", "bitrate", "channels", "samplerate"],
		QUEUE_FIELDS = ["id","title","artist","album","duration","playlist_id"];
	
	var wrk = Wrk("",function(r){console.log(r);},function(f){console.log(f);return true;});
	var ihm = Ihm(itfIhm, configTables);
	
	DEBUG.wrk = wrk;
	
	function noop(){}
	
	var i18nLoaded = false;
	public.i18n = function(messages){
		ihm.i18n(messages);
		i18nLoaded = true;
	};
	
	public.init = function(){
		var i;
		if(!i18nLoaded){
			localStorage.removeItem("lang");
			document.location = "./";
		}
		ihm.init();
		for(i=1;i<=29;i++)wrk.status(ihm.updateState, null, i); // volume, balance, speed, play state, mute, reverb, echo, chorus, flanger, equalizer_on, 11 = equalizer 1, ..., 28 = equalizer 18, repeat
		wrk.status(ihm.updateState, null, 41); // shuffle
		wrk.status(function(r){
			wrk.position.setState(["stopped", "playing", "paused"][r]);
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
	
	public.play = itfIhm.play = function(playlist_id, track_id){
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
	
	public.queue = itfIhm.queue = function(playlist_id, track_id){
		wrk.queue(reloadQueue, null, playlist_id, track_id);
	};
	public.unqueue = itfIhm.unqueue = function(playlist_id, track_id){
		wrk.unqueue(reloadQueue, null, playlist_id, track_id);
	};
	public.queuemove = itfIhm.queuemove = function(oldpos, newpos){
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
	
	itfIhm.download = function(p,t){
		document.location = wrk.getDownloadURL(p, t);
	};
	
	return public;
}

//var aimp = Wrk("",function(r){console.log(r);},function(f){console.error(f);});
var ctrl = Ctrl();
$(document).ready(ctrl.init);