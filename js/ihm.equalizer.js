/* global toolkit, RLib, _, Ihm */

/**
 * @param {Ihm} ihm
 * @returns {Ihm.equalizer}
 */
Ihm.equalizer = function(ihm){
	var eq = {balance:{}, speed:{}, reverb:{}, echo:{}, chorus:{}, flanger:{}, group:{enabled:false, values:[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50]}};
	
	var equalizer = {};
	
	equalizer.init = function(){
		eq.balance.tfx = function(v){
			v = Math.round(v);
			if(v < 50) return ihm.i18n.equalizer.left()+" "+((100-v))+"%";
			else if(v === 50) return ihm.i18n.equalizer.center;
			else return ihm.i18n.equalizer.right()+" "+v+"%";
		};
		eq.balance.t = $("<div>").addClass("value");
		eq.balance.s = RLib.hslider(eq.balance.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(2, Math.round(v));
			eq.balance.s.setPosition(Math.round(v));
			eq.balance.t.text(eq.balance.tfx(v));
		}, eq.balance.tfx, 50); eq.balance.s.setTotal(100);
		
		eq.speed.tfx = function(v){return Math.round(v+50)+"%";};
		eq.speed.t = $("<div>").addClass("value");
		eq.speed.s = RLib.hslider(eq.speed.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(3, Math.round(v));
			eq.speed.s.setPosition(Math.round(v));
			eq.speed.t.text(eq.speed.tfx(v));
		}, eq.speed.tfx, 50); eq.speed.s.setTotal(100);
		
		eq.reverb.tfx = function(v){return Math.round(v)+"%";};
		eq.reverb.t = $("<div>").addClass("value");
		eq.reverb.s = RLib.hslider(eq.reverb.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(6, Math.round(v));
			eq.reverb.s.setPosition(Math.round(v));
			eq.reverb.t.text(eq.reverb.tfx(v));
		}, eq.reverb.tfx, 0); eq.reverb.s.setTotal(100);
		
		eq.echo.tfx = function(v){return Math.round(v)+"%";};
		eq.echo.t = $("<div>").addClass("value");
		eq.echo.s = RLib.hslider(eq.echo.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(7, Math.round(v));
			eq.echo.s.setPosition(Math.round(v));
			eq.echo.t.text(eq.echo.tfx(v));
		}, eq.echo.tfx, 0); eq.echo.s.setTotal(100);
		
		eq.chorus.tfx = function(v){return Math.round(v)+"%";};
		eq.chorus.t = $("<div>").addClass("value");
		eq.chorus.s = RLib.hslider(eq.chorus.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(8, Math.round(v));
			eq.chorus.s.setPosition(Math.round(v));
			eq.chorus.t.text(eq.chorus.tfx(v));
		}, eq.chorus.tfx, 0); eq.chorus.s.setTotal(100);
		
		eq.flanger.tfx = function(v){return Math.round(v)+"%";};
		eq.flanger.t = $("<div>").addClass("value");
		eq.flanger.s = RLib.hslider(eq.flanger.e = $("<div>").addClass("eqSlider"), function(v){
			ihm.setStatus(9, Math.round(v));
			eq.flanger.s.setPosition(Math.round(v));
			eq.flanger.t.text(eq.flanger.tfx(v));
		}, eq.flanger.tfx, 0); eq.flanger.s.setTotal(100);
		
		eq.group.vfx = function(v){
			v = Math.round(v);
			if(v < 50) return "-"+Math.round(10*(50-v)/50*15)/10+"db";
			else return "+"+Math.round(10*(v-50)/50*15)/10+"db";
		};
		eq.group.cfx = function(c){
			return ihm.configTables.eqaulizers[c]+"Hz";
		};
		eq.group.s = RLib.vmslider(eq.group.e = $("<div>").addClass("eqMSlider"), eq.group.values, 100, 50, 10, eq.group.vfx, eq.group.cfx, function(c,v){ihm.setStatus(11+c, Math.round(v));eq.group.s.set(c, Math.round(v));}, "#000", "#484");
		
	};
	
	equalizer.show = function(){
		$("#main .detach").detach();
		document.getElementById("main").className = "";
		$("#fixedPanel").removeClass("active");
		ihm.setTab(4);
		$("nav a").removeClass("active");
		$("nav a[data-lnk=\"equalizer\"]").addClass("active");
		var m = $("#main").html($("<h1>").text(ihm.i18n.nav.equalizer));
		$("<p>").appendTo(m).text(ihm.i18n.equalizer.refreshT);
		$("<button>").appendTo(m).text(ihm.i18n.equalizer.refresh).click(ihm.refreshEQ);
		
		$("<h2>").appendTo(m).text(ihm.i18n.equalizer.fx);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.balance))
			.append(eq.balance.t)
			.append(eq.balance.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.speed))
			.append(eq.speed.t)
			.append(eq.speed.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.reverb))
			.append(eq.reverb.t)
			.append(eq.reverb.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.echo))
			.append(eq.echo.t)
			.append(eq.echo.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.chorus))
			.append(eq.chorus.t)
			.append(eq.chorus.e);
		$("<div>").appendTo(m).addClass("eqSliderBox")
			.append($("<div>").addClass("name").text(ihm.i18n.equalizer.flanger))
			.append(eq.flanger.t)
			.append(eq.flanger.e);
		
		$("<h2>").appendTo(m).text(ihm.i18n.nav.equalizer);
		var enBtn = $("<div>").appendTo(m).addClass("checkbox").text(eq.group.enabled ? ihm.i18n.generic.enabled : ihm.i18n.generic.disabled).click(function(){
			ihm.setStatus(10, 1*!eq.group.enabled);
			eq.group.enabled = !eq.group.enabled;
			equalizer.show();
		});
		if(eq.group.enabled) enBtn.addClass("active");
		$("<button>").appendTo(m).text(ihm.i18n.generic.fullscreen).click(function(){
			toolkit.toggleFullScreen(eq.group.e.get(0), function(){
				alert(ihm.i18n.settings.notSupported());
			});
		});
		eq.group.e.appendTo(m);
		eq.group.s.update();
		$("<h2>").appendTo(m).text(ihm.i18n.equalizer.presets);
		_.each(ihm.configTables.presets, function(v, k){
			var lv = v;
			$("<button>").appendTo(m).text(ihm.i18n.equalizer["p"+k]).click(function(){
				eq.group.s.setAll(lv);
			}).mouseover(function(){
				eq.group.s.preview(lv);
			}).mouseout(function(){
				eq.group.s.cancelPreview();
			});
		});
		
		$("<p>").appendTo(m).text(" ");
		$.scrollTo("#main h1");
	};
		
	equalizer.setColors = function(foreground, background){
		eq.group.s.setColors(foreground, background);
	};
	
	equalizer.loadBalance = function(value){
		eq.balance.s.setPosition(value);
		eq.balance.t.text(eq.balance.tfx(value));
	};
	equalizer.loadSpeed = function(value){
		eq.speed.s.setPosition(value);
		eq.speed.t.text(eq.speed.tfx(value));
	};
	equalizer.loadReverb = function(value){
		eq.reverb.s.setPosition(value);
		eq.reverb.t.text(eq.echo.tfx(value));
	};
	equalizer.loadEcho = function(value){
		eq.echo.s.setPosition(value);
		eq.echo.t.text(eq.echo.tfx(value));
	};
	equalizer.loadChorus = function(value){
		eq.chorus.s.setPosition(value);
		eq.chorus.t.text(eq.chorus.tfx(value));
	};
	equalizer.loadFlanger = function(value){
		eq.flanger.s.setPosition(value);
		eq.flanger.t.text(eq.flanger.tfx(value));
	};
	equalizer.loadEnabled = function(value){
		eq.group.enabled = value;
		if(ihm.getTab() === 4)equalizer.show();
	};
	equalizer.loadGroup = function(slider, value){
		eq.group.s.set(slider, value);
	};
	
	return equalizer;
};