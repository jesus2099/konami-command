"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         kasi. PLAIN TEXT LYRICS 歌詞コピー 純文本歌詞
// @version      2020.6.19
// @description  j-lyric.net, joysound.com, kasi-time.com, lyric.kget.jp, lyrics.gyao.yahoo.co.jp, music.goo.ne.jp, petitlyrics.com, utamap.com, uta-net.com, utaten.com
// @compatible   vivaldi(3.1.1929.34)+violentmonkey  my setup
// @compatible   firefox(77.0.1)+greasemonkey        my setup
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2010-12-05; http://userscripts-mirror.org/scripts/show/91968
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.utamap.com/*.php?surl=*
// @match        *://*.uta-net.com/movie/*/
// @match        *://*.uta-net.com/song/*/
// @match        *://j-lyric.net/artist/*/*.html
// @match        *://joysound.com/ex/search/karaoke/_selSongNo_*_songwords.htm
// @match        *://lyrics.gyao.yahoo.co.jp/ly/*
// @match        *://music.goo.ne.jp/lyric/*
// @match        *://petitlyrics.com/lyrics/*
// @match        *://rio.yahooapis.jp/RioWebService/V2/*
// @match        *://utaten.com/lyric/*
// @match        *://www.kasi-time.com/item-*.html
// @match        *://www.kget.jp/lyric/*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
}};
if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
	var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
	while ((kv = row.exec(meta.rawmdb)) !== null) {
		if (meta[kv[1]]) {
			if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
			meta[kv[1]].push(kv[2]);
		} else meta[kv[1]] = kv[2];
	}
}
var DEBUG = false;
var kasimasin = {
	"j-lyric": {/*allow contextmenu*/
		"na": "J-Lyric.net",
		"kabe_css": "#lyricBody",
		"kabe_keep": true,
		"direct_machine": function(e) {
			if (kabe) {
				gogogo();
			}
		},
	},
	"joysound": {/*allow copy*/
		"na": "JOYSOUND",
		"kabe_css": ".songInfoWords",
		"kabe_keep": true,
		"direct_machine": function(e) {
			if (kabe) {
				var div = document.getElementById("songwordsFlash");
				if (div) {
					div.style.setProperty("min-width", "388px");
					div.style.setProperty("overflow-y", "inherit");
					div.style.setProperty("position", "inherit");
				}
				gogogo();
			}
		},
	},
	"kasi-time": {
		"na": "歌詞タイム",
		"kabe_css": "div.mainkashi",
		"kabe_keep": true,
		"init": function(start) {
			if (start) {
				machine();
			}
		},
		"direct_machine": function(e) {
			if (kabe) {
				gogogo();
			}
		},
	},
	"kget": {
		"na": "歌詞ＧＥＴ",
		"kabe_css": "div#lyric-trunk",
		"kabe_keep": true,
		"direct_machine": function(e) {
			if (kabe) {
				gogogo();
			}
		},
	},
	"lyrics.gyao.yahoo": {
		"na": "GyaO!歌詞",
		"clean_url": "http://lyrics.gyao.yahoo.co.jp/ly/%uta%",
		"kabe_css": "div.lyrics_detail > div.inner",
		"kabe_keep": true,
		"uta_re": /\/ly\/([^/]+)\/?$/,
		"kasi_url": "http://rio.yahooapis.jp/RioWebService/V2/getLyrics?appid=7vOgnk6xg64IDggn6YEl3IQxmbj1qqkQzTpAx5nGwl9HnfPX3tZksE.oYhEw3zA-&lyrics_id=%uta%&results=1&multi_htmlspecialchars_flag=1",
		"kasi_url_fix": [/(\?|&)multi_htmlspecialchars_flag=[01]/, ""],
		"direct_machine": function(e) {
			var iframe = document.createElement("iframe");
			iframe.setAttribute("src", kasimasin.kasi_url);
			iframe.style.setProperty("height", "600px");
			iframe.style.setProperty("width", "100%");
			gogogo(iframe);
			mati.appendChild(document.createTextNode(" ↓ PLEASE CLICK ↓"));
		},
	},
	"rio.yahooapis": {
		"na": "ギャオ歌詞API",
		"direct_machine": function(e) {
			var alrt = "";
			var tmp = document.querySelector("ResultSet > Result > Title"); if (tmp) { alrt += tmp.textContent+" / "; }
			tmp = document.querySelector("ResultSet > Result > ArtistName"); if (tmp) { alrt += tmp.textContent+"\n\n"; }
			tmp = document.querySelector("ResultSet > Result > WriterName"); if (tmp) { alrt += "作詞："+tmp.textContent+"\n"; }
			tmp = document.querySelector("ResultSet > Result > ComposerName"); if (tmp) { alrt += "作曲："+tmp.textContent+"\n"; }
			tmp = document.querySelector("ResultSet > Result > Lyrics"); if (tmp) { alrt += "\n"+tmp.textContent.replace(/<br>/gi, "\n"); }
			document.addEventListener("click", function(e) { alert(alrt); }, false);
			alert(alrt);
		},
	},
	"music.goo": {
		"na": "goo音楽",
		"init": function(start) {
			if (start) {
				var jsonurl = /\/sp\/lyric\/print_json\.php\?[^']+/;
				document.querySelector("head").addEventListener("DOMNodeInserted", function(e) {
					var src;
					if (this.lastChild.tagName == "SCRIPT" && (src = this.lastChild.getAttribute("src")) && src.match(jsonurl)) {
						this.removeChild(this.lastChild);
						db("json call prevented");
					}
				}, false);
				var scripts = document.querySelectorAll("div#main script[type='text/javascript']:not([src])");
				for (var s=0; s<scripts.length; s++) {
					var url = scripts[s].innerText.match(jsonurl);
					if (url) {
						kasimasin.kasi_url = ""+url;
						break;
					}
				}
				machine();
			}
		},
		"kabe_css": "div#lyric_canvas",
		"xhr_machine": function(xhr) {
			var json = xhr.responseText.match(/draw\((\[\".+\"\])\);/);
			if (json && (json = eval(json[1])) && typeof json == "object" && json != null && json.length > 0) {
				var kasi = "";
				for (var k=0; k < json.length; k++) {
					kasi += json[k];
				}
				gogogo(kasi);
			} else { gogogo(null, "json"); }
		},
	},
	"petitlyrics": {
		"na": "プチリリ",
		"clean_url": "https://petitlyrics.com/lyrics/%uta%",
		"uta_re": /\/lyrics\/(\d+)\/?$/,
		"direct_machine": function(e) {
			if (kabe) {
				gogogo(kabe.textContent);
			}
		},
		"kabe_css": "canvas#lyrics",
	},
	"utamap": {
		"na": "うたまっぷ",
		"clean_url": "https://www.utamap.com/showkasi.php?surl=%uta%",
		"init": function(start) {
			if (start) { machine(); }
		},
		"kabe_css": "object#showkasi,canvas#canvas2",
		"uta_re": /surl=(.+)&?.*$/,
		"kasi_url": "/phpflash/flashfalsephp.php?unum=%uta%",
		"xhr_overrideMimeType": "text/xml; charset=utf-8",
		"xhr_machine": function(xhr) {
			gogogo(xhr.responseText.replace(/^test1=[0-9]+&test2=/, ""));
		},
	},
	"uta-net": {
		"na": "歌ネット",
		"clean_url": "https://www.uta-net.com/song/%uta%/",
		"init": function(start) {
			if (start) { machine(); }
		},
		"kabe_css": "object#showkasi",
		"uta_re": /\/(\d+)\/$/,
		"kasi_css": ["object#showkasi > embed", "src"],
		"xhr_responseType": "arraybuffer",
		"xhr_machine": function(xhr) {
			var kara = abHexSearch(xhr.response, "FF0000");
			var made = abHexSearch(xhr.response, "00", kara+12);
			if (kara>-1 && made>-1) {
				ab2str(xhr.response, gogogo, kara+12, made);
			} else {
				gogogo(null, kara+"〜"+made);
			}
		},
	},
	"utaten": {
		"na": "UtaTen",
		"kabe_css": "div#lyric_frame",
		"uta_re": /lyric\/([^/?]+)(?:\?|$)/,
		"kasi_url": "/lyric/load_text.php?LID=%uta%",
		"xhr_overrideMimeType": "text/xml; charset=Shift_JIS",
		"xhr_machine": function(xhr) {
			gogogo(xhr.responseText.replace(/^(.|\n|\r)+\n\n|\t.+|(\s|\n)+$/g, ""));
		},
	},
};
var kabe, mati;
var matches = [];
for (var m = 0; m < meta.match.length; m++) {
	var key = meta.match[m].replace(/^\*:\/\/[\.\*]{0,2}(www\.)?|\.(com|co\.jp|ne\.jp|jp|net)\/{1}.*$/g, "");
	if (matches.indexOf(key) == -1) matches.push(key);
}
db("matches:\n" + matches.join("\n"));
var doko = self.location.host.match(new RegExp("(?:www\\.)?(" + matches.join("|") + ")"));
var iti = true;
if (document.head) {
	var j2ss = document.createElement("style");
	j2ss.setAttribute("type", "text/css");
	document.head.appendChild(j2ss);
	j2ss = j2ss.sheet;
	j2ss.insertRule("*{-moz-user-select:text!important;-webkit-user-select:text!important;}", 0);
}
if (doko) {
	doko = doko[1];
	kasimasin = kasimasin[doko];
	if (kasimasin.na) { meta.name = kasimasin.na + " " + meta.name; }
	db(meta.name + "\n" + self.location.href);
	var url;
	if (kasimasin.uta_re && (url = self.location.href.match(kasimasin.uta_re))) {
		kasimasin.uta = url[1];
	}
	if (kasimasin.clean_url && (url = kasimasin.clean_url.replace(/%uta%/g, kasimasin.uta)) && url != self.location.href) {
		self.location.href = url;
	} else {
		if (kasimasin.init) { kasimasin.init(true); }
		else { machine(); }
	}
}
function machine() {
	if (iti) {
		if (kasimasin.kabe_css) { kabe = document.querySelector(kasimasin.kabe_css); }
		if (kasimasin.init) { kasimasin.init(false); }
		if (kabe) {
			/*var kb = kabe.cloneNode(true);
			kabe.parentNode.replaceChild(kb, kabe);
			kabe = kb;*/
			kabe.style.setProperty("-moz-user-select", "text", "important");
			kabe.style.setProperty("-webkit-user-select", "text", "important");
			kabe.style.setProperty("cursor", "text", "important");
			var blocks = [
				"contextmenu",
				"copy",
				"drag",
				"dragend",
				"dragenter",
				"dragleave",
				"dragover",
				"dragstart",
				"drop",
				"keydown",
				"keypress",
				"keyup",
				"mousedown",
				"mouseup",
				"selectstart"
			];
			blocks.forEach(function(event) {
				document.body.addEventListener(event, function(e) {
					e.cancelBubble = true;
					if (e.stopPropagation) e.stopPropagation();
					return true;
				}, true);
			});
			mati = document.createElement("div");
			mati.appendChild(document.createTextNode(meta.name+" "));
			mati.appendChild(document.createElement("strong")).appendChild(document.createTextNode("PLEASE WAIT"));
			mati.style.setProperty("margin", "16px 0 0 0");
			kabe.parentNode.insertBefore(mati, kabe);
		}
		var url;
		if (kasimasin.kasi_url || kasimasin.kasi_css) {
			if (kasimasin.kasi_url) {
				if (kasimasin.kasi_url.match(/%uta%/) && kasimasin.uta) {
					url = kasimasin.kasi_url.replace(/%uta%/g, kasimasin.uta);
				} else { url = kasimasin.kasi_url; }
				iti = false;
			} else if (kasimasin.kasi_css && kasimasin.kasi_css.length == 2 && (url = document.querySelector(kasimasin.kasi_css[0]))) {
				url = url.getAttribute(kasimasin.kasi_css[1]);
				iti = false;
			}
			if (url) { iti = false; }
			else { return; }
			if (kasimasin.kasi_url_suffix) { url += kasimasin.kasi_url_suffix.replace(/%random%/, (""+Math.random()).substr(2)); }
			if (kasimasin.kasi_url_fix && kasimasin.kasi_url_fix.length == 2) { url = url.replace(kasimasin.kasi_url_fix[0], kasimasin.kasi_url_fix[1]); }
			if (url) {
				kasimasin.kasi_url = url;
			}
		}
		if (kasimasin.xhr_machine) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function(e) {
				db(xhr.response);
				if (this.status > 199 && this.status < 400) { kasimasin.xhr_machine(this); } else { this.onerror(e); }
			};
			xhr.onerror = function (e) {
				gogogo(null, this.status);
			};
			xhr.open("get", url, true);
			if (kasimasin.xhr_responseType) { xhr.responseType = kasimasin.xhr_responseType; }
			if (kasimasin.xhr_overrideMimeType) { xhr.overrideMimeType(kasimasin.xhr_overrideMimeType); }
			xhr.send(null);
			db(kasimasin.na+"\n"+url);
		} else if (kasimasin.direct_machine) {
			kasimasin.direct_machine();
		}
	}
}
function gogogo(kasi, err) {
	var ka = typeof kasi=="string"?document.createElement("pre").appendChild(document.createTextNode(kasi)).parentNode:kasi;
	mati.style.setProperty("color", err?"red":"green");
	mati.querySelector("strong").replaceChild(document.createTextNode(err?"ERROR エラー （"+err+"）":"OK"), mati.querySelector("strong").firstChild);
	if (DEBUG) {
		mati.style.setProperty("cursor", "pointer");
		mati.addEventListener("click", function(e) { iti = true; machine(); }, false);
	}
	if (err == null) {
		var div;
		if (ka) {
			div = document.createElement("div");
			div.appendChild(ka);
			kabe.parentNode.insertBefore(div, kabe);
		} else { div = kabe; }
		div.style.setProperty("text-align", "left");
		div.style.setProperty("color", "#030");
		div.style.setProperty("background-color", "#efe");
	}
	if (kasimasin.kabe_keep == null || kasimasin.kabe_keep == false || err) {
		kabe.style.setProperty("display", "none");
	}
}
/*BINARY MACHINE*/
function d2h(d) { return d.toString(16).toUpperCase(); }
function h2d(h) { return parseInt(h, 16); }
function abHexSearch(pAb, hq, pFrom, pTo) {
	var ab = new Uint8Array(pAb);
	var hqlen = hq.length/2;
	var from = (pFrom && pFrom > 0 && pFrom + hqlen < ab.byteLength)? pFrom : 0;
	var to = (pTo && pTo >= from && pTo <= ab.byteLength)? pTo : ab.byteLength;
	for (var i=from; i<to; i++) {
		for (var j=0; j<hqlen; j=j+2) {
			if (ab[i+j] != h2d(hq.substr(j,2))) { break; }
			if (j == hqlen - 1) { return i; }
		}
	}
	return -1;
}
function ab2str(ab, callback, from, to) {
	var offset = from?from:0;
	var length = to?to-offset:null;
	var b = new Blob([new Uint8Array(ab, offset, length)]);
	var f = new FileReader();
	f.onload = function(e) { callback(e.target.result); };
	f.readAsText(b);
}
function db(inf) {
	if (DEBUG) { console.log(inf); }
}
