// ==UserScript==
// @name         greasyfork. APPLIES TO LINKS SEARCH BY SITES
// @version      2014.9.30.1928
// @description  greasyfork.org. makes applies to “All site” link to the “*” by site search (JasonBarnabe/greasyfork#146)
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014.6.6.
// @grant        none
// @include      https://greasyfork.org/*/scripts/*
// @include      https://greasyfork.org/scripts/*
// @include      https://www.greasyfork.org/*/scripts/*
// @include      https://www.greasyfork.org/scripts/*
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
			appliesto.replaceChild(a(at, "*"), appliesto.firstChild);
		}
	}
	function a(t, l) {
		var a = document.createElement("a");
		a.setAttribute("href", "/scripts/by-site/"+(l?l:t));
		a.appendChild(document.createTextNode(t));
		return a;
	}
})();
