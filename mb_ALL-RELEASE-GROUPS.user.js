// ==UserScript==
// @name         mb. ALL RELEASE GROUPS
// @version      2019.9.13.3
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_ALL-RELEASE-GROUPS.user.js
// @description  Artist overview page (discography): Show all release groups by default, then you can filter out bootlegs to show only official release groups (instead of the opposite default)
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALL-RELEASE-GROUPS
// @compatible   vivaldi(2.6.1566.49)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(68.0.1)+violentmonkey       tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-RELEASE-GROUPS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_ALL-RELEASE-GROUPS.user.js
// @author       jesus2099
// @contributor  Naja Melan’s “Always show all releases on Musicbrainz v1.0” http://userscripts-mirror.org/scripts/show/9456
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2019-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        none
// @match        *://*/*
// @run-at       document-start
// @inject-into  auto
// "inject-into  auto" is specific to Firefox + Violentmonkey + GitHub https://github.com/violentmonkey/violentmonkey/issues/597
// ==/UserScript==
"use strict";
var str_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = getParent(element, "a");
		}
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_ALL-RELEASE-GROUPS")) {
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
				tooltip += "\n";
			}
			anchor.setAttribute("title", tooltip + "old: " + HREF + "\nnew: " + newHref);
		}
	}
}
function prefer(URL) {
	var newUrl = URL;
	var urlMatch = URL.trim().match(new RegExp("^(.*)?(/artist/" + str_GUID + ")(\\?.*)?(#.*)?$"));
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
