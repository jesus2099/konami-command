// ==UserScript==
// @name         greasyfork. APPLIES TO LINKS SEARCH BY SITES
// @version      2014.0618.0000
// @description  greasyfork.org. makes each site in applies to section of script page into a clickable link to search scripts by sites (and see other scripts for same site) (JasonBarnabe/greasyfork#146)
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014.6.6.
// @grant        none
// @include      https://greasyfork.org/scripts/*
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
		var applies2 = document.createDocumentFragment();
		if (at.match(/^all sites$/i)) {
			applies2.appendChild(a(at, "*"));
		}
		else {
			var sep, site, sites = /[^, ]+/g;
			while ((site = sites.exec(at)) !== null) {
				if (sep) { applies2.appendChild(document.createTextNode(sep)) }
				else { sep = ", "; }
				applies2.appendChild(a(site[0]));
			}
		}
		appliesto.replaceChild(applies2, appliesto.firstChild);
	}
	function a(t, l) {
		var a = document.createElement("a");
		a.setAttribute("href", "/scripts/by-site/"+(l?l:t));
		a.appendChild(document.createTextNode(t));
		return a;
	}
})();