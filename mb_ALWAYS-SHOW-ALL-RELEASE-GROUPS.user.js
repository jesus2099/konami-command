// ==UserScript==
// @name         mb. ALWAYS SHOW ALL RELEASE GROUPS
// @version      2019.1.3.beta
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_ALWAYS-SHOW-ALL-RELEASE-GROUPS.user.js
// @description  Copy of mb_PREFERRED-MBS, beta test for the moment. cf. https://community.metabrainz.org/t/the-hidden-display-bootlegs-toggle/410173/2?u=jesus2099 and https://chatlogs.metabrainz.org/brainzbot/musicbrainz/msg/4303822/
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALWAYS-SHOW-ALL-RELEASE-GROUPS
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (ho.)
// @compatible   vivaldi(2.2.1388.37)+violentmonkey  my setup (of.)
// @compatible   firefox(64.0)+greasemonkey          tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALWAYS-SHOW-ALL-RELEASE-GROUPS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_ALWAYS-SHOW-ALL-RELEASE-GROUPS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2019-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==
"use strict";
var str_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = getParent(element, "a");
		}
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_ALWAYS-SHOW-ALL-RELEASE-GROUPS")) {
			process(element);
		}
	}
});
function process(anchor) {
	var HREF = anchor.getAttribute("href");
	if (HREF) {
		var newHref = prefer(HREF);
		if (newHref) {
			anchor.setAttribute("href", newHref);
			anchor.style.setProperty("background-color", "#cfc");
			anchor.style.setProperty("color", "#606");
			anchor.style.setProperty("text-decoration", "line-through");
			var tooltip = anchor.getAttribute("title") || "";
			if (tooltip) {
				tooltip += "\r\n";
			}
			anchor.setAttribute("title", tooltip + "old: " + HREF + "\r\nnew: " + newHref);
		}
	}
}
function prefer(URL) {
	var newUrl = URL;
	var urlMatch = URL.match(new RegExp("^(.*)?(/artist/" + str_GUID + ")(\\?.*)?(#.*)?$"));
	if (urlMatch) {
		var query = urlMatch[3] || "";
		if (!query.match(/all=/)) {
			query = addQueryParameters(query, "all=1");
		}
		newUrl = (urlMatch[1] ? urlMatch[1] : "") + urlMatch[2] + query + (urlMatch[4] ? urlMatch[4] : "");
	}
	return (newUrl && newUrl != URL ? newUrl : null);
}
function addQueryParameters(query, parameters) {
	return query + (query.match(/\?/) ? "&" : "?") + parameters;
}
