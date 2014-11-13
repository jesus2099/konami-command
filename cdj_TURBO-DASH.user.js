// ==UserScript==
// @name         cdj. TURBO DASH
// @version      2013.10.25.1727
// @description  CDJournal.com: adds quick links to artists’ CD and ビデオ. removes adcrap
// @homepage     http://userscripts-mirror.org/scripts/show/180523
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/cdj_TURBO-DASH.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/cdj_TURBO-DASH.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2013-10-23
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://artist.cdjournal.com/a/*/*
// @include      http://artist.cdjournal.com/d/*/*
// @include      http://cdjournal.com/search/do/?k=*&target=a*
// @include      http://www.cdjournal.com/search/do/?k=*&target=a*
// @include      https://artist.cdjournal.com/a/*/*
// @include      https://artist.cdjournal.com/d/*/*
// @include      https://cdjournal.com/search/do/?k=*&target=a*
// @include      https://www.cdjournal.com/search/do/?k=*&target=a*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	/*remove crap*/
	for (var ss=0; ss < document.styleSheets.length; ss++) {
		if (document.styleSheets[ss].href.match(/\/\/[^/]+/)+"" == "//"+location.hostname) {
			document.styleSheets[ss].insertRule("div#aun_banner, iframe, div#right_body a:not([href*='.cdjournal.com/']) { display: none; }", document.styleSheets[ss].cssRules.length);
			break;
		}
	}
	/*add quick links*/
	var artists = document.querySelectorAll("a:not(.border)[href^='http://artist.cdjournal.com/artist.php?ano='], h1 > a[href^='http://artist.cdjournal.com/a/']");
	var pages = {
		"CD": "cd",
		"ビデオ": "dvd",
	}
	for (var a=0; a < artists.length; a++) {
		var url = "http://artist.cdjournal.com/a/-/"+artists[a].getAttribute("href").match(/\d+$/);
		artists[a].setAttribute("href", url);
		artists[a].style.setProperty("background-color", "#ff9");
		var quicklinks = artists[a].parentNode.appendChild(document.createElement("span"));
		for (var p in pages) { if (pages.hasOwnProperty(p)) {
			quicklinks.appendChild(document.createTextNode(quicklinks.children.length>0?"／":"（"));
			var anc = quicklinks.appendChild(document.createElement("a")).appendChild(document.createTextNode(p)).parentNode;
			anc.setAttribute("href", url+"/"+pages[p]+"/");
			anc.style.setProperty("background-color", "#ff9");
		} }
		quicklinks.appendChild(document.createTextNode("）"));
	}
})();