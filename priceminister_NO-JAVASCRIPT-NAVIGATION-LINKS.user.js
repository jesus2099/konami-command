// ==UserScript==
// @name         priceminister. NO JAVASCRIPT NAVIGATION LINKS
// @version      2016.6.15
// @changelog    https://github.com/jesus2099/konami-command/commits/master/priceminister_NO-JAVASCRIPT-NAVIGATION-LINKS.user.js
// @description  Remplace la plupart des liens javascript par des liens href standards.
// @homepage     http://userscripts-mirror.org/scripts/show/95062
// @supportURL   https://github.com/jesus2099/konami-command/labels/priceminister_NO-JAVASCRIPT-NAVIGATION-LINKS
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/priceminister_NO-JAVASCRIPT-NAVIGATION-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/priceminister_NO-JAVASCRIPT-NAVIGATION-LINKS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-01-21
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.priceminister.com/*
// @run-at       document-end
// ==/UserScript==
/* lines you can add to your "blocked content", many advertisement systems used on priceminister that slow down the page display.
In Opera (FF ok): I've also noticed that some pages (like article pages) were not triggering userjs at once, you have to switch to another tab and come back.
You can also press ESC key if page is loaded but still waiting.
*addthis.com*
*adverline.com*
*apicit.net*
*avazudsp.net*
*criteo.com*
*googlesyndication*
*heias.com*
*mythings.com*
*nxtck.com*
*veoxa.com*
*view.atdmt.com*
start of settings ------ */
var colouring = { enabled: true, colours: { ok: "lime", ng: "red" }};
/* end of settings ------ */
var debug = false;
var jslink = /^javascript:/;
var ubslink = /^javascript:void PM\.BT\.ubs\((.+)\)/;
var scriptid = 95062;
if (debug) {
	colouring.enabled = true;
	debugg("debugging");
	var div = document.createElement("div");
	div.style.position = "fixed";
	div.style.top = 0;
	div.style.right = 0;
	div.style.background = "yellow";
	div.appendChild(document.createTextNode("debugging "+scriptid));
	document.getElementsByTagName("body")[0].appendChild(div);
}
/* type String(PM.BT.escape) in Dragonfly (Scripts > REPL) or Firebug to rebuild this then remove "starting and trailing quotes" */
PM_BT_escape = function(c){if(c.indexOf("?")==-1){var b=/([^:/]+:\/\/[^/]*)?([^#]*)(#.*)?/.exec(c);var e=b[1]||"";var d=b[2];var a=b[3]||"";d=unescape(d);d=escape(d);c=e+d+a}return c};
/* type String(PM.BT.ub) in Dragonfly (Scripts > REPL) or Firebug to rebuild this then remove "starting and trailing quotes" */
PM_BT_ub = function(){var a="";for(var b=0;b<arguments.length;b++){var c=arguments[b];if(typeof(c)=="string"){a=a+c}else{a=a+String.fromCharCode(c)}}return a};
function swapQuotes(s) {
	return s.replace(/(['"])/g, function(m){return m[1]=='"' ? "'" : '"'});
}
function secureEval(s) {
	if (s.match(/^'.*'$/)) {
		return swapQuotes(JSON.parse(swapQuotes(s))); /* XXX: will bug with '\x2d' */
	} else {
		return JSON.parse(s);
	}
}
var as = document.getElementsByTagName("a");
if (as) {
	for (var i = 0; i < as.length; i++) {
		var href = as[i].getAttribute("href");
		if (href) {
			if (colouring.enabled) { deco(as[i], !href.match(jslink)); }
			href = href.match(ubslink);
			if (href) { href = href[1]; }
			if (href) {
				var url = PM_BT_escape(PM_BT_ub.apply(null,href.split(",").map(secureEval)));
				as[i].setAttribute("href", url);
				if (colouring.enabled) { deco(as[i], true); }
				debugg(href+" → "+url);
			}
		}
	}
}
function debugg(txt) {
	if (debug) {
		var dtxt = scriptid+": "+txt;
		if (typeof opera != "undefined") {
			opera.postError(dtxt);
		}
		else if (typeof unsafeWindow != "undefined" && unsafeWindow.console) {
			unsafeWindow.console.log(dtxt);
		}
	}
}
function deco(obj, ok) {
	obj.style.textShadow = colouring.colours[ok?"ok":"ng"]+" 0 0 2px";
}
