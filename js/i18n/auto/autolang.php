<?php

define('AUTO_JS', __DIR__.'/auto.js');
define('AIMP_LANG', 'D:\Applications\AIMP\Langs\\');
define('LANG_FILES', __DIR__.'/../');

// https://msdn.microsoft.com/en-us/library/hh456380.aspx
// Some languages are not supported by the v1 API
$langs = [
	"ar"=>["Arabic","arabic.lng"],
	//"bs-Latn"=>["Bosnian (Latin)"],
	"bg"=>["Bulgarian","bulgarian.lng"],
	"ca"=>["Catalan","catalan.lng"],
	"zh-CHS"=>["Chinese Simplified","simplified_chinese.lng"],
	"zh-CHT"=>["Chinese Traditional"],
	//"hr"=>["Croatian","croatian.lng"],
	"cs"=>["Czech","czech.lng"],
	"da"=>["Danish"],
	"nl"=>["Dutch","Nederlands.lng"], 
	"en"=>["English","english.lng"],
	"et"=>["Estonian","eesti.lng"],
	"fi"=>["Finnish","finnish.lng"],
	"fr"=>["French","french.lng"],
	"de"=>["German","german.lng"],
	"el"=>["Greek","greek.lng"],
	"ht"=>["Haitian Creole"],
	"he"=>["Hebrew","hebrew.lng"],
	"hi"=>["Hindi"],
	"mww"=>["Hmong Daw"],
	"hu"=>["Hungarian","hungarian.lng"],
	"id"=>["Indonesian","Indonesian.lng"],
	"it"=>["Italian","italian.lng"],
	"ja"=>["Japanese","japanese.lng"],
	//"tlh"=>["Klingon"],
	//"tlh-Qaak"=>["Klingon (pIqaD)"],
	"ko"=>["Korean","korean.lng"],
	"lv"=>["Latvian","latvian.lng"],
	"lt"=>["Lithuanian","lithuanian.lng"],
	"ms"=>["Malay"],
	//"mt"=>["Maltese"],
	"no"=>["Norwegian"],
	"fa"=>["Persian","farsi.lng"],
	"pl"=>["Polish","polish.lng"],
	"pt"=>["Portuguese"],
	//"otq"=>["Querétaro Otomi"],
	"ro"=>["Romanian","romanian.lng"],
	"ru"=>["Russian","russian.lng"],
	//"sr-Cyrl"=>["Serbian (Cyrillic)","serbian_cyrillic.lng"],
	//"sr-Latn"=>["Serbian (Latin)","serbian_latin.lng"],
	"sk"=>["Slovak","slovak.lng"],
	"sl"=>["Slovenian","slovenian.lng"],
	"es"=>["Spanish","espanol-ES.lng"],
	"sv"=>["Swedish","swedish.lng"],
	"th"=>["Thai","thai.lng"],
	"tr"=>["Turkish","turkish.lng"],
	"uk"=>["Ukrainian","ukrainian.lng"],
	"ur"=>["Urdu"],
	"vi"=>["Vietnamese"],
	//"cy"=>["Welsh"],
	//"yua"=>["Yucatec Maya"]
];

// if(is_file(__DIR__.'/config.inc.php')) require_once __DIR__.'/config.inc.php';
// else{
// 	echo <<<EOF
// Please create a confing.inc.php file with the following content

// <?php

// /**
//  * @var string Microsoft/Bing Primary Account Key
//  */
// if (!defined('ACCOUNT_KEY')) {
// 	// Generate an API KEY for Bing Translator here
// 	// https://datamarket.azure.com/dataset/1899a118-d202-492c-aa16-ba21c33c06cb
//     define('ACCOUNT_KEY', '********************************************');
// }
// if (!defined('CACHE_DIRECTORY')) {
//     define('CACHE_DIRECTORY', 'your_home_directory/translate/cache/');
// }
// if (!defined('LANG_CACHE_FILE')) {
//     define('LANG_CACHE_FILE', 'lang.cache');
// }
// if (!defined('ENABLE_CACHE')) {
//     define('ENABLE_CACHE', true);
// }
// if (!defined('UNEXPECTED_ERROR')) {
//     define('UNEXPECTED_ERROR', 'There is some un expected error . please check the code');
// }
// if (!defined('MISSING_ERROR')) {
//     define('MISSING_ERROR', 'Missing Required Parameters ( Language or Text) in Request');
// }
// EOF;
// die();
// }

// require_once __DIR__.'/class/MicrosoftTranslator.class.php';

function parse_ini($str){
	$lsection = "";
	$table = [];
	
	foreach(preg_split("#[\r\n]+#", $str) as $line){
		if(strlen($line)==0 || substr($line,0,1)==";");
		elseif(preg_match("#^\[(.+)]\W*$#", $line, $m)) $lsection = $m[1];
		elseif(preg_match("#^(.+)=(.+)$#", $line, $m)) $table[$lsection.'.'.$m[1]]=$m[2];
	}
	
	return $table;
}

function load_json($path){	
	return json_decode(
		preg_replace("#^[\t ]*([a-zA-Z]+):#m",'"$1":',
			preg_replace("#^.+raw\W*=[\r\n\t ]*|,[\r\n\t ]*(?=})#s","",
				file_get_contents($path)))
	, true);
}

function load_lang($path){
	return parse_ini(iconv('UCS-2LE', 'UTF-8', substr(file_get_contents($path),2)));
}

function compile($lng){
	$out = 'ctrl.i18n({';
	foreach($lng as $s => $ks){
		$out.= $s.':{';
		foreach($ks as $k => $v){
			$out.= $k.':function(';
			if(preg_match("#{[^}]+}#", $v)){
				$out.= 'p){return'.(substr($v, 0, 1) == '{' ? " " : "");
				$out.= preg_replace('#(?<=")""\+|\+""(?=")#', "", preg_replace("#{([^}]+)}#", '"+p.$1+"', json_encode($v, JSON_UNESCAPED_UNICODE)));
			}else{
				$out.= '){return'.json_encode($v, JSON_UNESCAPED_UNICODE);
			}			
			$out.= '},';
		}
		$out.= '},';
	}
	$out.= '});';
	return $out;
}

echo "\nLoading auto.js...\n";
$auto = load_json(AUTO_JS);
if(!is_array($auto) || count($auto)==0) die("FAILED !\n");
echo "Success\n";
// Keys count
$keys = 0;
foreach($auto as $s) foreach($s as $v) $keys++;
echo "$keys keys found\n";

/* The v1 Bing Translator API is not supported anymore. We rely on an human translator instead!
echo "\nConnecting to online translator...\n";
$translator = new MicrosoftTranslator(ACCOUNT_KEY);
@$translator->translate("fr", "en", "Réussite", 'json');
$r = json_decode($translator->response->translation, true)['d']['results'][0]["Text"]."\n";
if(stripos($r, "Success")===FALSE)die("FAILED ! ".$r."\n");
echo $r."\n";
*/

foreach($langs as $lang => $l){
	echo $l[0]." (".$lang.")\n";
	
	$old = [];
	if(is_file(LANG_FILES.$lang.".raw.js")) $old = load_json(LANG_FILES.$lang.".raw.js") ?: [];
	$new = [];
	
	$aimpl = [];
	if(isset($l[1]) && is_file(AIMP_LANG.$l[1])) $aimpl = @load_lang(AIMP_LANG.$l[1]) ?: [];
	if(count($aimpl) > 0) echo "AIMP lang file found\n";
	
	$comment = "";
	if(count($old) == 0){
		echo "File did not exist or is corrupt\n";
		$comment = "// ".strtoupper($l[0])." Translation\n// Automatically generated\n";
		if(count($aimpl) > 0) $comment .= "// Based on AIMP translation realised by ".(@$aimpl['FILE.Author'] ?: "(unknown)").(isset($aimpl['FILE.VersionID']) ? ", version ".$aimpl['FILE.VersionID'] : "")."\n";
	}else{
		// Unwanted sections
		$uws = 0;
		// Unwanted keys
		$uwk = 0;
		// Old keys
		$oldk = 0;
		foreach($old as $s => $ks){
			if(!isset($auto[$s])) $uws++;
			foreach($ks as $k => $v){
				if(!isset($auto[$s][$k])) $uwk++;
				else $oldk++;
			}
		}
		if($uws) echo "$uws unwanted section(s) found\n";
		if($uwk) echo "$uwk unwanted key(s) found\n";
		echo "Lang file contains $oldk/$keys keys\n";
		if($uws+$uwk == 0 && $oldk == $keys){
			if(!is_file(LANG_FILES.$lang.".js") || filemtime(LANG_FILES.$lang.".raw.js")-filemtime(LANG_FILES.$lang.".js")>1000){
				file_put_contents(LANG_FILES.$lang.".js", compile($old));
				echo "Compiled\n\n";
			}else{
				echo "Skipped\n\n";
			}
			continue;
		}
		$comment = preg_replace("#[\n]+#","\n",preg_replace("#^\s*(?!//)[^\n]*$#m","",  file_get_contents(LANG_FILES.$lang.".raw.js")));
	}
	
	$fromlng = 0; $fromlngreg = 0; $fromweb = 0; $fromauto = 0;
	foreach($auto as $s => $ks){
		$new [$s] = [];
		foreach($ks as $k => $v){			
			if(isset($old[$s], $old[$s][$k])){
				$new[$s][$k] = $old[$s][$k];
				continue;
			}
			if(preg_match("#^LNG:([^:]+):(.+)$#", $v, $m)){
				if(isset($aimpl[$m[1]])){
					$new[$s][$k] = $aimpl[$m[1]];
					echo "[LNG] ".$s.'.'.$k.'='.$new[$s][$k]."\n";
					$fromlng++;
					continue;
				}else{
					$v = $m[2];
				}
			}
			if(preg_match("#^REG:([^:]+):([^:]+):(.+)$#", $v, $m)){
				preg_match(":".$m[1].":", @$aimpl[$m[2]]?:"", $n);
				if(isset($n[1]) && strlen($n[1])>0 && json_encode($n[1]) !== FALSE){
					$new[$s][$k] = $n[1];
					echo "[REG] ".$s.'.'.$k.'='.$new[$s][$k]."\n";
					$fromlngreg++;
					continue;
				}else{
					$v = $m[3];
				}
			}
			
			if(preg_match("#\{([a-zA-Z]+)}#", $v)){
				$rep = [];
				$nv = preg_replace_callback("#\{([a-zA-Z]+)}#", function($m) use (&$rep){$rep[]=$m[1]; return '{'.(count($rep)-1).'}';}, $v);
				$nv = readline("Enter a translation for $nv: ");
				// $translator->translate("en", $lang, $nv, 'json');
				// $nv = json_decode(@$translator->response->translation ?: '', true)['d']['results'][0]["Text"];
				//if(strlen($nv) > 0 && preg_match_all("#\{([0-9]+)}#", $nv) >= count($rep)){
				if(preg_match("#\S+#", $nv)){
					// $nv = preg_replace_callback("#\{([0-9]+)}#", function($m) use (&$rep){return '{'.$rep[$m[1]].'}';}, $nv);
					$new[$s][$k] = preg_replace("#[\r\n\t]#", "", $nv);
					echo "[WEB] ".$s.'.'.$k.'='.$new[$s][$k]."\n";
					$fromweb++;
					continue;
				}else echo "Human translation failed!\n";
			}else{
				$nv = readline("Enter a translation for $v: ");
				// $translator->translate("en", $lang, $v, 'json');
				// $nv = json_decode(@$translator->response->translation ?: '', true)['d']['results'][0]["Text"];
				// if(strlen($nv) > 0){
				if(preg_match("#\S+#", $nv)){
					$new[$s][$k] = preg_replace("#[\r\n\t]#", "", $nv);
					echo "[WEB] ".$s.'.'.$k.'='.$new[$s][$k]."\n";
					$fromweb++;
					continue;
				}else echo "Human translation failed!\n";
			}
			
			echo "[!!!] $s.$k\n";
			echo "FAILED !\n";
			
			// Everything else failed...
			/*$new[$s][$k] = $v;
			echo "[!EN] ".$s.'.'.$k.'='.$new[$s][$k]."\n";
			$fromauto++;*/
		}
	}
	
	echo "Translation finished\n$fromlng+$fromlngreg keys from AIMP lang file, $fromweb keys from human translator\n";//, $fromauto keys kept as is \n";
	$ecd = json_encode($new, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
	if($ecd !== FALSE && file_put_contents(LANG_FILES.$lang.".raw.js", $comment."raw = ".$ecd) && file_put_contents(LANG_FILES.$lang.".js", compile($new))){ 
		echo "File written\n";
	}else{
		echo "File writing FAILED !\n";
		file_put_contents(LANG_FILES.$lang.".err", print_r($new, true));
		die();
	}
	
	echo "\n";
}