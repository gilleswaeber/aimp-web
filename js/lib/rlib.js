/* global _ */

var RLib = (function(){
	var rlib = {};
	
	rlib.hslider = function(el, callback, printfx, def){
		printfx = printfx || function(n){return Math.round(n);};
		def = typeof def === "undefined" ? false : def;
		var slider = {};
		el = $(el);
		var ed = el.get(0);
		el.bind("contextmenu",function(){return false;});
		$(document.body).keyup(function(){el.mouseleave(); return true;});
		el.addClass("rlib_slider").addClass("detach");
		var fill = $("<div>").addClass("rlib_hfilled").appendTo(el);
		var limit = $("<div>").addClass("rlib_limit").appendTo(el).css("width", el.height()+"px").css("margin-left", "-"+el.height()/2+"px");
		var tip = $("<div>").addClass("rlib_tip").appendTo(document.body);
		var total = 0;
		var position = 0;
		var noupdate = false;
		var last = def;
		
		function move(e, d){
			if(!noupdate)return;
			last = Math.max(0,Math.min(1,(e.pageX - el.offset().left)/el.get(0).offsetWidth));
			fill.css("width",100*last+"%");
			tip.text(printfx(last*total));
			tip.css("top", (e.pageY-tip.get(0).offsetHeight-(d || 5))+"px");
			tip.css("left", (e.pageX-tip.get(0).offsetWidth/2)+"px");
		};
		function over(e){
			if(total<=0 || !callback)return;
			noupdate = true;
			fill.css("opacity",".8");
			tip.css("display","block");
			move(e);
		}
		function end(e){
			if(total<=0 || !callback || !noupdate)return;
			if(e && e.button === 2 && def !== false){
				callback(def);
			}
			else if(e) callback(Math.max(0,Math.min(total,(e.pageX - el.offset().left)/el.get(0).offsetWidth*total)));
			else callback(last*total);
			cancel();
			
		}
		function cancel(){
			noupdate = false;
			fill.css("opacity","1");
			tip.css("display","none");
			update();
		}
		el.mouseover(over);
		el.mousemove(move);
		el.mouseleave(cancel);
		el.mouseup(end);
		
		ed.addEventListener("touchstart",function(e){
			e.preventDefault();
			over(e.touches[0]);
		}, false);
		ed.addEventListener("touchmove",function(e){
			e.preventDefault();
			move(e.touches[0], 30);
		}, false);
		ed.addEventListener("touchend",function(e){
			e.preventDefault();
			end();
		}, false);
		ed.addEventListener("touchleave",function(e){
			e.preventDefault();
			end();
		}, false);
		ed.addEventListener("touchcancel",function(e){
			e.preventDefault();
			cancel();
		}, false);
		
		slider.setTotal = function(t){
			if(t!==total){
				total = t;
				update();
			}
		};
		
		slider.setPosition = function(p){
			if(p!==position){
				position = p;
				update();
			}
		};
		
		function update(){
			if(noupdate)return;
			if(total<=0){
				fill.css("width","100%");
				limit.css("left","200%");
			}else{
				var r = (100*position/total)+"%";
				fill.css("width",r);
				limit.css("left",r);
			}
		};
		
		return slider;
	};
	
	rlib.vmslider = function(el, values, max, def, dotSize, vfx, cfx, callback, dotColor, lineColor){
		var cw = 1, ch = 1;
		var vmslider = {};
		el = $(el);
		el.addClass("rlib_mslider").addClass("detach");
		var canvas = $("<canvas>").appendTo(el).attr("height",max*ch).attr("width",values.length*cw).get(0);
		var ctx = canvas.getContext("2d");
		var changing = false, keep = false, cv = [];
		var tip = $("<div>").addClass("rlib_tip").appendTo(document.body).css("opacity",.8);
		var zone = $("<div>").appendTo(el).addClass("zone");
		var zd = zone.get(0);
		
		zone.bind("contextmenu",function(){return false;});
		$(document.body).keyup(function(){leave(); return true;});
		
		function over(e){
			changing = true;
			tip.css("display","block");
			move(e);			
		}
		function move(e, d){
			if(!changing){
				zone.mouseover();
				return;
			}
			var v = e.buttons&2 ? .5 : Math.max(0,Math.min(1,1-(e.pageY - el.offset().top)/el.get(0).offsetHeight));
			var c = Math.max(0,Math.min(values.length-1,Math.floor((e.pageX - el.offset().left)/el.get(0).offsetWidth*values.length)));
			tip.html(cfx(c)+"<br/>"+vfx(v*max));
			tip.css("top", (e.pageY-tip.get(0).offsetHeight-(d || 10))+"px");
			tip.css("left", (e.pageX-tip.get(0).offsetWidth/2)+"px");
			if(!keep) cloneVals();
			cv[c] = v*max;
			update();
		};
		function leave(){
			changing = false;
			keep = false;
			tip.css("display","none");
			cloneVals();
			update();
		};
		function drag(){
			keep = true;
			return true;
		};
		function drop(e){
			if(e){
				e.buttons = e.button;
				move(e);
			}
			var todo = [];
			cv.forEach(function(v, i){
				var lv = v, li = i;
				if(v !== values[i]) todo.push(function(){
					callback(li, lv);
				});
			});
			todo.forEach(function(f){
				f();
			});
			leave();
		}
		
		zone.mouseover(over);
		zone.mousemove(move);
		zone.mouseleave(leave);
		zone.mousedown(drag);
		zone.mouseup(drop);
		
		zd.addEventListener("touchstart",function(e){
			e.preventDefault();
			drag();
			over(e.touches[0]);
		}, false);
		zd.addEventListener("touchmove",function(e){
			e.preventDefault();
			move(e.touches[0], 30);
		}, false);
		zd.addEventListener("touchend",function(e){
			e.preventDefault();
			drop();
		}, false);
		zd.addEventListener("touchleave",function(e){
			e.preventDefault();
			drop();
		}, false);
		zd.addEventListener("touchcancel",function(e){
			e.preventDefault();
			leave();
		}, false);
		
		function cloneVals(){
			var i = values.length;
			while (i--) cv[i] = values[i];
		}
		
		function update(){
			if(Math.abs(el.get(0).offsetWidth - values.length*cw/2) > 2 || Math.abs(el.get(0).offsetHeight - max*ch/2) > 2){
				cw = el.get(0).offsetWidth/values.length*2;
				ch = el.get(0).offsetHeight/max*2;
				canvas.width = cw*values.length;
				canvas.height = ch*max;
				ctx = canvas.getContext("2d");
			}
			
			ctx.clearRect(0, 0, values.length*cw, max*ch);
			
			ctx.globalAlpha = .8;
			ctx.strokeStyle = dotColor;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(0, ch*(max-def));
			ctx.lineTo(values.length*cw, ch*(max-def));
			ctx.stroke();
			
			ctx.globalAlpha = changing ? .6 : 1;
			ctx.strokeStyle = lineColor;
			ctx.lineWidth = dotSize-1;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(cw/2, ch*(max-cv[0]));
			_.forEach(cv, function(v,i){
				ctx.lineTo(
					(i+.5)*cw,
					ch*(max-v)
				);
			});
			ctx.stroke();
			
			ctx.globalAlpha = 1;
			ctx.fillStyle = dotColor;
			_.forEach(values, function(v,i){
				ctx.fillRect(
					(i+.5)*cw-dotSize,
					ch*(max-v)-dotSize,
					dotSize*2,
					dotSize*2
				);
			});
		}
		
		vmslider.set = function(c, v){
			values[c] = v;
			cloneVals();
			update();
		};
		
		vmslider.setAll = function(v){
			_.each(v, function(v, c){
				callback(c, v);
				vmslider.set(c, v);
			});
		};
		
		vmslider.setColors = function(dot, line){
			dotColor = dot;
			lineColor = line;
			update();
		};
		
		vmslider.preview = function(v){
			var i = values.length;
			while (i--) cv[i] = v[i];
			changing = true;
			update();			
		};
		
		vmslider.cancelPreview = leave;
		
		cloneVals();
		update();
		
		vmslider.update = update;
		
		return vmslider;
	};
	
	rlib.rating = function(el, def, value, callback){
		el = $(el).addClass("rlib_rating");
		el.get(0).addEventListener("contextmenu", function(e){e.preventDefault(); rating.setValue(0); callback(0); return false;}, true);
		
		if(value === 0) value = -1;
		else value = Math.round(value);
		def = Math.round(def)||0;
		
		var rating = {};
		
		el.get(0).innerHTML = '<div data-star="54321" class="star">starBlack</div><div data-star="5432" class="star">starBlack</div><div data-star="543" class="star">starBlack</div><div data-star="54" class="star">starBlack</div><div data-star="5" class="star">starBlack</div>';
				
		function update(){
			el.find(".star").removeClass("active");
			if(value === -1){
				el.removeClass("set");
				el.find(".star[data-star*="+def+"]").addClass("active");
			}else{
				el.addClass("set");
				el.find(".star[data-star*="+value+"]").addClass("active");
			}
		}
		
		rating.setValue = function(v){
			if(v===0)v = -1;
			else v = Math.round(v);
			if(v !== value){
				value = v;
				update();
			}
		};
		
		rating.setDefault = function(d){
			d = Math.round(d)||0;
			if(d !== def){
				def = d;
				update();
			}			
		};
		
		update();
		
		return rating;
	};
	
	return rlib;
})();
