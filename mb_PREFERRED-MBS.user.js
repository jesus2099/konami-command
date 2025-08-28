// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2025.8.28.1822
// @description  Choose your favourite MusicBrainz server (MBS) (main/beta/test) and no link will ever send you to the others
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PREFERRED-MBS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-01-12; inspiration by https://web.archive.org/web/20140712013355/userscripts-mirror.org/scripts/show/487275
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @include      /^https?:\/\//
// @run-at       document-start
// ==/UserScript==
"use strict";
/* ----------------------------------------------- */
/* preferred_mbs can be either (there is no more HTTP)
 * https://musicbrainz.org or https://beta.musicbrainz.org or https://test.musicbrainz.org or https://musicbrainz.eu
 * it is not intended to work with any other values */
var preferred_mbs = "https://musicbrainz.org";
/* ----------------------------------------------- */
/* Simple Discourse click tracker problem work-around ------------- */
var discourse_url = location.href.match(/^https?:\/\/community\.metabrainz\.org\/clicks\/track\?url=([^?&]+)/);
if (discourse_url) {
	location.replace(decodeURIComponent(discourse_url[1]));
}
/* ---------------------------------------------------------------- */
var is_mbs = location.host.match(/^(musicbrainz\.eu|((beta|test)\.)?musicbrainz\.org)$/i);
preferred_mbs = leftTrim(preferred_mbs);
if (!is_mbs) {
	// Redirect importers to preferred MBS
	document.addEventListener("submit", function(event) {
		var element = event.target || event.srcElement;
		if (element && element.nodeType == Node.ELEMENT_NODE && element.tagName == "FORM") {
			var action = element.getAttribute("action");
			if (action && !action.match(/oauth/) && !element.querySelector("input[type='password']")) {
				var new_action = prefer(action);
				if (new_action) {
					var urlInput = element.querySelector("input[name='url']");
					if (urlInput) {
						var newUrl = prefer(urlInput.value);
						if (newUrl) {
							urlInput.value = newUrl;
						}
					}
					element.setAttribute("action", new_action);
					element.style.setProperty("background-color", "#cfc");
				}
			}
		}
	}, true);
}
// Redirect links to preferred MBS
// Non-MBS websites: All MBS links
// MBS websites: Edit note text links only https://tickets.metabrainz.org/browse/MBS-13728
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = element.closest("a");
		}
		if (
			element
			&& element.matches("a:not(.jesus2099-bypass-mb_PREFERRED-MBS)") // mb_SUPER-MIND-CONTROL-II-X-TURBO server switcher
			&& (
				!is_mbs
				|| element.closest(".edit-note-text")
			)
		) {
			process(element);
		}
	}
});
function process(anchor) {
	var href = anchor.getAttribute("href");
	if (href) {
		var new_href;
		if (anchor.closest(".edit-note-text")) {
			// Force stay on the same MBS when clicking edit note links (annotations are doing it natively OK)
			// Test at https://musicbrainz.org/edit/1736776
			new_href = prefer(href, location.protocol + "//" + location.host);
		} else {
			new_href = prefer(href);
		}
		if (new_href) {
			anchor.setAttribute("href", new_href);
			anchor.style.setProperty("background-color", "#cfc");
			anchor.style.setProperty("color", "#606");
			anchor.style.setProperty("text-decoration", "line-through");
			var tooltip = anchor.getAttribute("title") || "";
			if (tooltip) {
				tooltip += "\n";
			}
			anchor.setAttribute("title", tooltip + "old: " + href + "\nnew: " + new_href);
		}
	}
}
function prefer(url, forced_mbs) {
	var new_url = forced_mbs ? forced_mbs : preferred_mbs;
	var matched_url = url.trim().match(/^(https?:)?(\/\/)?(((beta|test)\.)?musicbrainz\.(org|eu)(:\d+)?)(?<path>\/.*)?(?<query>\?.*)?(?<hash>#.*)?$/);
	if (matched_url) {
		if (matched_url.groups.path) {
			new_url += matched_url.groups.path;
		}
		if (matched_url.groups.query) {
			new_url += matched_url.groups.query;
		}
		if (matched_url.groups.hash) {
			new_url += matched_url.groups.hash;
		}
		if (new_url && new_url != (forced_mbs ? forced_mbs : preferred_mbs) && leftTrim(new_url) != leftTrim(url)) {
			return new_url;
		}
	}
}
function leftTrim(url) {
	var trimmed_url = url;
	if (trimmed_url.indexOf(location.protocol) === 0) {
		trimmed_url = trimmed_url.replace(/^https?:/, "");
	}
	if (trimmed_url.indexOf("//" + location.host) === 0) {
		trimmed_url = trimmed_url.replace(new RegExp("^//" + location.host), "");
	}
	return trimmed_url;
}
