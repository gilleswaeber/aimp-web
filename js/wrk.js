/* global rpc */
var DEBUG = DEBUG || {};

/**
 * Worker.<br>
 * About the Control Plugin :
 * the control plugin is a bit bugged and some things won't work as expected. Always test before using. Some samples :
 * <ul><li>Playlists IDs will change on each AIMP restart.</li>
 * <li>Tracks IDs could swap between them on each playlist change.</li>
 * <li>A playlist change occurs when you fold or unfold tracks in the player.</li>
 * <li>A playlist change occurs too when ratings change, which can happen when track reach 60%, because of the audio library plugin.</li>
 * <li>You can't sort a playlist with the IDs.</li></ul>
 * @param {string} _url [opt] RPC_JSON server ip + port number
 * @param {function(result,params,method)} _defSuccessCallback [opt] default success callback
 * @param {function(error,params,method)} _defErrorCallback [opt] default error callback
 * @returns {Wrk}
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
	 * Additional fields are: channels, path, extension, filename, samplerate, arating, folder, creationdate, creationtime, disc, track, modificationdate, modificationtime<br>
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
				if(!ret[n])ret[n] = r[i];
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
		successCallback = successCallback || defSuccessCallback;
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
	 * Send small requests to the server at regular interval to check if it is still there.<br>
	 * Will continue to ping until an error occurs.<br>
	 * <b>Note : </b> This method doesn't use the default callbacks.<br>
	 * If a timeout occurs, errorCallback is called with "TIMEOUT".
	 * @param {function((int)ping)} [opt] successCallback
	 * @param {function(error)} errorCallback (required)
	 * @param {int} interval [opt] (milliseconds) default is 5000
	 * @param {type} timeout [opt] (milliseconds) default is 15000
	 * @returns {undefined}
	 */
	wrk.subscribe.ping = function(successCallback, errorCallback, interval, timeout){
		
		successCallback = successCallback || noop;
		interval = interval || 5000;
		timeout = timeout || 15000;
		
		var gstate = 0; // 0 = OK, 1 = Timeout/Error
		
		var itv = setInterval(function(){
			var state = 0; // 0 = Sent, 1 = Timeout/Received
			var sentTime = Date.now();
			var tim = setTimeout(function(){
				if(state + gstate > 0) return;
				state = 1;
				gstate = 1;
				clearInterval(itv);
				errorCallback("TIMEOUT");
			}, timeout);
			
			wrk.status(function(){
				if(state + gstate > 0) return;
				state = 1;
				clearTimeout(tim);
				successCallback(Date.now() - sentTime);
			}, function(f){
				if(state + gstate > 0) return;
				state = 1;
				gstate = 1;
				clearTimeout(tim);
				clearInterval(itv);
				errorCallback(f);
			}, 1);
		}, interval);
	}
	
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
		call("Version", {}, successCallback, errorCallback);
	};
	
	/**
	 * Returns plugin capabilities.<br>
	 * Result : {physical_track_deletion:(bool),scheduler:(bool),upload_track:(bool)}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 */
	wrk.pluginCapabilities = function(successCallback, errorCallback){
		call("PluginCapabilities", {}, successCallback, errorCallback);		
	};
	
	/**
	 * Adds URL to specified playlist.<br>
	 * Result (success) : {}
	 * Result (error) : {error:{code:(int),message:(string)}}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {string} url
	 */
	wrk.addURLToPlaylist = function(successCallback, errorCallback, playlist_id, url){
		call("AddURLToPlaylist", {playlist_id:playlist_id, url:url}, successCallback, errorCallback);
	};
	
	/**
	 * Removes specified track from playlist.<br>
	 * Result (success) : {}
	 * Result (error) : {error:{code:(int),message:(string)}}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(error,params,method)} errorCallback
	 * @param {int} playlist_id
	 * @param {int} track_id
	 * @param {bool} physically [opt] remove the track physically from the disk, default is false. You should check if it is possible with <b>pluginCapabilities</b>.
	 */
	wrk.removeTrack = function(successCallback, errorCallback, playlist_id, track_id, physically){
		call("RemoveTrack", {playlist_id:playlist_id, track_id:track_id, physically:physically&&true||false}, successCallback, errorCallback);
	};
	
	/**
	 * Get Control Plugin scheduler datas.<br>
	 * Allows to schedule some action. Similar to scheduler of AIMP player.<br>
	 * <b>This is not the AIMP scheduler</b>
	 * Result : {supported_actions:["stop_playback","pause_playback","machine_shutdown","machine_sleep","machine_hibernate"?], current_timer:{action:(string), expires_at:(float), expires_in:(float)}?}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(result,params,method)} errorCallback
	 */
	wrk.getScheduler = function(successCallback, errorCallback){
		call("Scheduler", {}, successCallback, errorCallback);
	};
	/**
	 * Cancel Control Plugin scheduler.<br>
	 * Allows to schedule some action. Similar to scheduler of AIMP player.<br>
	 * <b>This is not the AIMP scheduler</b>
	 * Result : {supported_actions:["stop_playback","pause_playback","machine_shutdown","machine_sleep","machine_hibernate"?]}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(result,params,method)} errorCallback
	 */
	wrk.cancelScheduler = function(successCallback, errorCallback){
		call("Scheduler", {cancel:true}, successCallback, errorCallback);
	};
	/**
	 * Set Control Plugin scheduler.<br>
	 * Allows to schedule some action. Similar to scheduler of AIMP player.<br>
	 * <b>This is not the AIMP scheduler</b>
	 * Result : {supported_actions:["stop_playback","pause_playback","machine_shutdown","machine_sleep","machine_hibernate"?], current_timer:{action:(string), expires_at:(float), expires_in:(float)}}
	 * @param {function(result,params,method)} successCallback
	 * @param {function(result,params,method)} errorCallback
	 * @param {string} action "machine_shutdown"|"machine_sleep"|"machine_hibernate"?(If supported by machine.)|"stop_playback"|"pause_playback"
	 * @param {string} timeMode "time"(set expiration time in Unix time)|"delay"(set expiration time with a delay)
	 * @param {float} expiration expiration, in seconds
	 */
	wrk.setScheduler = function(successCallback, errorCallback, action, timeMode, expiration){
		var p = {action:action};
		p["expiration_"+timeMode] = expiration+1e-5;
		call("Scheduler", p, successCallback, errorCallback);
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