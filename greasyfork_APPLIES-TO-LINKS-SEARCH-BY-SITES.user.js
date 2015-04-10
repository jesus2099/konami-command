// ==UserScript==
// @name         greasyfork. APPLIES TO LINKS SEARCH BY SITES
// @version      2014.11.24.1424
// @description  greasyfork.org. makes applies to “All site” link to the “*” by site search (JasonBarnabe/greasyfork#146)
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-06-06
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      https://greasyfork.org/*/scripts/*
// @include      https://greasyfork.org/scripts/*
// @exclude      *greasyfork.org/scripts/*/*
// @exclude      *greasyfork.org/scripts/?
// @exclude      *greasyfork.org/scripts/by*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var appliesto = document.querySelector("div#script-meta dd.script-show-applies-to");
	if (appliesto) {
		var at = appliesto.textContent.trim();
		if (at.match(/^(all sites|alle seiten|todos los sitios|tous les sites|semua situs|すべてのサイト|alle websites|wszystkie strony|todos sites|все сайты|所有站点|所有網站)$/i)) {
			appliesto.replaceChild(appliestoLink(at, "*"), appliesto.firstChild);
		}
	}
	function appliestoLink(t, l) {
		var a = document.createElement("a");
		a.setAttribute("href", "/scripts/by-site/"+(l?l:t));
		a.appendChild(document.createTextNode(t));
		return a;
	}
})();