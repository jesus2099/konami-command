// ==UserScript==
// @name         cdj. TURBO DASH
// @version      2016.6.16
// @changelog    https://github.com/jesus2099/konami-command/commits/master/cdj_TURBO-DASH.user.js
// @description  CDJournal.com: adds quick links to artists’ CD and ビデオ. removes adcrap
// @homepage     http://userscripts-mirror.org/scripts/show/180523
// @supportURL   https://github.com/jesus2099/konami-command/labels/cdj_TURBO-DASH
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/cdj_TURBO-DASH.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/cdj_TURBO-DASH.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2013-10-23
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://artist.cdjournal.com/a/*/*
// @match        *://artist.cdjournal.com/d/*/*
// @match        *://cdjournal.com/search/do/?k=*&target=a*
// @match        *://www.cdjournal.com/search/do/?k=*&target=a*
// @run-at       document-start
// ==/UserScript==
"use strict";
var cdjTURBODASHinterval = setInterval(function() {
	if (document.querySelector("#right_body")) {
		clearInterval(cdjTURBODASHinterval);
		/*remove crap*/
		for (var ss = 0; ss < document.styleSheets.length; ss++) {
			if (document.styleSheets[ss].href.match(/\/\/[^/]+/) + "" == "//" + self.location.hostname) {
				document.styleSheets[ss].insertRule("div#aun_banner, div#banner_one, div#banner_two, div.banner, iframe, div#right_body a:not([href*='.cdjournal.com/']) { display: none; }", document.styleSheets[ss].cssRules.length);
				break;
			}
		}
		/*add quick links*/
		var artists = document.querySelectorAll("a:not(.border)[href^='http://artist.cdjournal.com/artist.php?ano='], h1 > a[href^='http://artist.cdjournal.com/a/']");
		var pages = {
			CD: "cd",
			ビデオ: "dvd"
		};
		for (var a = 0; a < artists.length; a++) {
			var url = "http://artist.cdjournal.com/a/-/" + artists[a].getAttribute("href").match(/\d+$/);
			artists[a].setAttribute("href", url);
			artists[a].style.setProperty("background-color", "#ff9");
			var quicklinks = artists[a].parentNode.appendChild(document.createElement("span"));
			for (var p in pages) if (pages.hasOwnProperty(p)) {
				quicklinks.appendChild(document.createTextNode(quicklinks.children.length > 0 ? "／" : "（"));
				var anc = quicklinks.appendChild(document.createElement("a")).appendChild(document.createTextNode(p)).parentNode;
				anc.setAttribute("href", url + "/" + pages[p] + "/");
				anc.style.setProperty("background-color", "#ff9");
			}
			quicklinks.appendChild(document.createTextNode("）"));
		}
	}
}, 1000);
