<?php

define('AUTO_JS', './auto.js');
define('AIMP_LANG', 'D:\Applications\AIMP3\Langs');
$langs = [1078=>"af",1052=>"sq",1118=>"am",5121=>"ar",15361=>"ar",3073=>"ar",2049=>"ar",11265=>"ar",13313=>"ar",12289=>"ar",4097=>"ar",6145=>"ar",8193=>"ar",16385=>"ar",1025=>"ar",10241=>"ar",7169=>"ar",14337=>"ar",9217=>"ar",1067=>"hy",1101=>"as",2092=>"az",1068=>"az",1069=>"eu",1059=>"be",2117=>"bn",1093=>"bn",5146=>"bs",1026=>"bg",1109=>"my",1027=>"ca",2052=>"zh",3076=>"zh",5124=>"zh",4100=>"zh",1028=>"zh",1050=>"hr",1029=>"cs",1030=>"da",1125=>"dv",2067=>"nl",1043=>"nl",3081=>"en",10249=>"en",4105=>"en",9225=>"en",2057=>"en",16393=>"en",6153=>"en",8201=>"en",5129=>"en",13321=>"en",7177=>"en",11273=>"en",1033=>"en",12297=>"en",1061=>"et",1080=>"fo",1065=>"fa",1035=>"fi",2060=>"fr",11276=>"fr",3084=>"fr",9228=>"fr",12300=>"fr",1036=>"fr",5132=>"fr",13324=>"fr",6156=>"fr",14348=>"fr",10252=>"fr",4108=>"fr",7180=>"fr",1071=>"mk",2108=>"gd",1084=>"gd",1110=>"gl",1079=>"ka",3079=>"de",1031=>"de",5127=>"de",4103=>"de",2055=>"de",1032=>"el",1140=>"gn",1095=>"gu",1037=>"he",1081=>"hi",1038=>"hu",1039=>"is",1057=>"id",1040=>"it",2064=>"it",1041=>"ja",1099=>"kn",1120=>"ks",1087=>"kk",1107=>"km",1042=>"ko",1108=>"lo",1142=>"la",1062=>"lv",1063=>"lt",2110=>"ms",1086=>"ms",1100=>"ml",1082=>"mt",1153=>"mi",1102=>"mr",2128=>"mn",1104=>"mn",1121=>"ne",1044=>"nb",2068=>"nn",1096=>"or",1045=>"pl",1046=>"pt",2070=>"pt",1094=>"pa",1047=>"rm",2072=>"ro",1048=>"ro",1049=>"ru",2073=>"ru",1103=>"sa",3098=>"sr",2074=>"sr",1074=>"tn",1113=>"sd",1115=>"si",1051=>"sk",1060=>"sl",1143=>"so",1070=>"sb",11274=>"es",16394=>"es",13322=>"es",9226=>"es",5130=>"es",7178=>"es",12298=>"es",17418=>"es",4106=>"es",18442=>"es",2058=>"es",19466=>"es",6154=>"es",15370=>"es",10250=>"es",20490=>"es",1034=>"es",14346=>"es",8202=>"es",3082=>"es",1089=>"sw",2077=>"sv",1053=>"sv",1064=>"tg",1097=>"ta",1092=>"tt",1098=>"te",1054=>"th",1105=>"bo",1073=>"ts",1055=>"tr",1090=>"tk",1058=>"uk",1056=>"ur",2115=>"uz",1091=>"uz",1066=>"vi",1106=>"cy",1076=>"xh",1085=>"yi",1077=>"zu",
"arabic"=>"ar","armenian","lithuanian"=>"lt","simplified_chinese"=>"zh-CHS","serbian_cyrillic"=>"sr-Cyrl","serbian_latin"=>"sr-Latn","swedish"=>"sv"];

require_once './config.inc.php';
require_once './class/MicrosoftTranslator.class.php';

echo "Enter language file name: (e.g. english)\n";
$l = preg_replace("#[\r\n]#","",fgets(STDIN));
if(!in_array($l.'.lng', scandir(AIMP_LANG))){
	die("Unknown language");
};

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

echo "\nLoading file...\n";
$file = iconv('UCS-2LE', 'UTF-8', substr(file_get_contents(AIMP_LANG.'\\'.$l.'.lng'),2));
$lng = parse_ini($file);
echo "Loaded ".$l." (".(@$langs[$l]?"0000":$lng['FILE.LangId'])." - ".(@$langs[$l]?:$langs[$lng['FILE.LangId']]).")\n";

echo "\nLoading auto.js...\n";
$file = preg_replace("#^[\t ]*([a-zA-Z]+):#m",'"$1":',preg_replace("#^.+raw\W*=[\r\n\t ]*|,[\r\n\t ]*(?=})#s","",file_get_contents(AUTO_JS)));
$auto = json_decode($file, true);
echo "Loaded auto.js\n";

echo "\nConnecting to online translator...\n";
$translator = new MicrosoftTranslator(ACCOUNT_KEY);
$from = 'en';
$to = @$langs[$l]?:$langs[$lng['FILE.LangId']];
$translator->translate($from, $to, "Hello World!", 'json');
echo "> ".json_decode($translator->response->translation, true)['d']['results'][0]["Text"]."\n";
echo "Connected\n";

echo "\nTranslating...\n";
$result = [];
$lngc=0; $reg=0; $web=0;
foreach($auto as $section => $strings){
	$tr = [];
	foreach($strings as $key => $value){
		if(preg_match("#^LNG:(.+)$#", $value, $m)){
			$tr[$key] = $lng[$m[1]];
			echo "[LNG] ".$section.'.'.$key.'='.$tr[$key]."\n";
			$lngc++;
		}
		elseif(preg_match("#^REG:([^:]+):(.+)$#", $value, $m)){
			preg_match(":".$m[1].":", $lng[$m[2]], $n);
			$tr[$key] = $n[1];
			echo "[REG] ".$section.'.'.$key.'='.$tr[$key]."\n";
			$reg++;
		}
		else{
			$rep = [];
			$value = preg_replace_callback("#\{([a-zA-Z]+)}#", function($m) use (&$rep){$rep[]=$m[1]; return '{'.(count($rep)-1).'}';}, $value);
			$translator->translate($from, $to, $value, 'json');
			$value = json_decode($translator->response->translation, true)['d']['results'][0]["Text"];
			$value = preg_replace_callback("#\{([0-9]+)}#", function($m) use (&$rep){return '{'.$rep[$m[1]].'}';}, $value);
			$tr[$key] = $value;
			echo "[WEB] ".$section.'.'.$key.'='.$tr[$key]."\n";
			$web++;
		}
	}
	$result[$section] = $tr;
}
echo "\nTranslated\n";
echo "$lngc LNG - $reg REG - $web WEB\n";
echo "\nWriting $to.raw.js...\n";
file_put_contents('./'.$to.'.raw.js', "// ".strtoupper($l)." Translation\n// Automatically generated from AIMP language files and Bing Translator\n// AIMP translation realised by ".$lng['FILE.Author'].", version ".$lng['FILE.VersionID']."\nraw = ".json_encode($result, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo "Done !";

