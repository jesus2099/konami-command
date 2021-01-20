// ==UserScript==
// @name         cdj. TURBO DASH
// @version      2021.1.19
// @description  CDJournal.com: adds quick links to artists’ CD and ビデオ. removes adcrap
// @compatible   vivaldi(3.4.2066.106)+violentmonkey  my setup
// @compatible   firefox(82.0.3)+violentmonkey        my other setup
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2013-10-23; https://web.archive.org/web/20131105122005/userscripts.org/scripts/show/180523
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/artist\.cdjournal\.com\/[ad]\/[^/]+\/.+/
// @include      /^https?:\/\/www\.cdjournal\.com\/search\/do\/\?k=.+&target=a/
// @run-at       document-start
// ==/UserScript==
"use strict";
var cdjTURBODASHinterval = setInterval(function() {
	if (document.querySelector("form[name='page'] /* for search */, div#data_request /* for artist and disc pages */")) {
		clearInterval(cdjTURBODASHinterval);
		/*remove crap*/
		var css = document.createElement("style");
		css.setAttribute("type", "text/css");
		document.head.appendChild(css);
		css = css.sheet;
		css.insertRule("div#aun_banner, div#banner_one, div#banner_two, div.banner, iframe, div#right_body a:not([href*='.cdjournal.com/']) { display: none; }", 0);
		/*add quick links*/
		var artists = document.querySelectorAll("a:not(.border)[href^='https://artist.cdjournal.com/artist.php?ano='], h1 > a[href^='https://artist.cdjournal.com/a/']");
		var pages = {
			レコード: "cd",
			ビデオ: "dvd"
		};
		for (var a = 0; a < artists.length; a++) {
			var url = "https://artist.cdjournal.com/a/-/" + artists[a].getAttribute("href").match(/\d+$/);
			artists[a].setAttribute("href", url);
			artists[a].style.setProperty("background-color", "#ff9");
			var quicklinks = artists[a].parentNode.appendChild(document.createElement("span"));
			for (var p in pages) if (Object.prototype.hasOwnProperty.call(pages, p)) {
				quicklinks.appendChild(document.createTextNode(quicklinks.children.length > 0 ? "／" : "（"));
				var anc = quicklinks.appendChild(document.createElement("a")).appendChild(document.createTextNode(p)).parentNode;
				anc.setAttribute("href", url + "/" + pages[p] + "/");
				anc.style.setProperty("background-color", "#ff9");
			}
			quicklinks.appendChild(document.createTextNode("）"));
		}
	}
}, 500);
