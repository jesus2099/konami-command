// ==UserScript==
// @name         mb. ALL RELEASE GROUPS
// @version      2024.4.11.1750
// @description  Artist overview page (discography): Show all release groups by default, then you can filter out bootlegs to show only official release groups (instead of the opposite default)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALL-RELEASE-GROUPS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-RELEASE-GROUPS.user.js
// @author       jesus2099
// @contributor  Naja Melan’s “Always show all releases on Musicbrainz v1.0” https://web.archive.org/web/20131104205707/userscripts.org/scripts/show/9456
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2019-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @run-at       document-start
// ==/UserScript==
"use strict";
var regex_mb_host = "(?:(?:beta|test)\\.)?musicbrainz\\.(?:eu|org)";
document.addEventListener("mousedown", function(event) {
	var link = event.target || event.srcElement;
	if (link && link.nodeType === Node.ELEMENT_NODE) {
		link = link.closest("a[href]:not(.jesus2099-bypass-mb_ALL-RELEASE-GROUPS)");
		if (link) {
			var href = link.getAttribute("href").trim();
			if (href) {
				var href_match = href.match(new RegExp("^((?:(?:https?:)?//)?" + regex_mb_host + ")?(/artist/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(\\?.*)?(#.*)?$"));
				if (
					href_match
					&& (
						location.host.match(new RegExp("^" + regex_mb_host + "$")) && href_match[2]
						|| href_match[1] && href_match[2]
					)
				) {
					var search = href_match[3] || "";
					if (!search.match(/all=/)) {
						search = add_search_parameters(search, "all=1");
						if (search !== href_match[3]) {
							var new_href = (href_match[1] ? href_match[1] : "") + href_match[2] + search + (href_match[4] ? href_match[4] : "");
							link.setAttribute("href", new_href);
							link.style.setProperty("background-color", "#cfc");
							link.style.setProperty("color", "#606");
							link.style.setProperty("text-decoration", "line-through");
							var tooltip = link.getAttribute("title") || "";
							if (tooltip) {
								tooltip += "\n";
							}
							link.setAttribute("title", tooltip + "old: " + href + "\nnew: " + new_href);
						}
					}
				}
			}
		}
	}
});
function add_search_parameters(search, parameters) {
	return search + (search.match(/\?/) ? "&" : "?") + parameters;
}
