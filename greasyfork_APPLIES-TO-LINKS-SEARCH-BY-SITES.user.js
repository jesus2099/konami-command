// ==UserScript==
// @name         greasyfork. APPLIES TO LINKS SEARCH BY SITES
// @version      2014.0606.1111
// @description  greasyfork.org. makes each site in applies to section of script page into a clickable link to search scripts by sites (and see other scripts for same site) (JasonBarnabe/greasyfork#146)
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/greasyfork_APPLIES-TO-LINKS-SEARCH-BY-SITES.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014.6.6.
// @grant        none
// @include      https://greasyfork.org/scripts/*
// @exclude      *greasyfork.org/scripts/*/*
// @exclude      *greasyfork.org/scripts/?
// @exclude      *greasyfork.org/scripts/by*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var appliesto = document.querySelector("div#script-meta dd.script-show-applies-to");
	if (appliesto) {
		var applies2 = document.createDocumentFragment();
		var sep, site, sites = /[^, ]+/g;
		while ((site = sites.exec(appliesto.textContent)) !== null) {
			if (sep) { applies2.appendChild(document.createTextNode(sep)) }
			else { sep = ", "; }
			var a = document.createElement("a");
			a.setAttribute("href", "/scripts/by-site/"+site[0]);
			a.appendChild(document.createTextNode(site[0]));
			applies2.appendChild(a);
		}
		appliesto.replaceChild(applies2, appliesto.firstChild);
	}
})();