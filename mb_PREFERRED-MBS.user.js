// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2025.8.23
// @description  Choose your favourite MusicBrainz server (MBS) (main/beta/test) and no link will ever send you to the others
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PREFERRED-MBS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-01-12; inspiration by https://web.archive.org/web/20140712013355/userscripts-mirror.org/scripts/show/487275
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\//
// @run-at       document-start
// ==/UserScript==
"use strict";
/* ----------------------------------------------- */
/* preferred_MBS can be either (there is no more HTTP)
 * https://musicbrainz.org or https://beta.musicbrainz.org or https://test.musicbrainz.org
 * it is not intended to work with any other values */
var preferred_MBS = "https://musicbrainz.org";
/* ----------------------------------------------- */
/* Simple Discourse click tracker problem work-around ------------- */
var discourseURL = location.href.match(/^https?:\/\/community\.metabrainz\.org\/clicks\/track\?url=([^?&]+)/);
if (discourseURL) {
	location.replace(decodeURIComponent(discourseURL[1]));
}
/* ---------------------------------------------------------------- */
preferred_MBS = leftTrim(preferred_MBS);
document.addEventListener("submit", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE && element.tagName == "FORM") {
		var ACTION = element.getAttribute("action");
		if (ACTION && !ACTION.match(/oauth/) && !element.querySelector("input[type='password']")) {
			var newAction = prefer(ACTION);
			if (newAction) {
				var urlInput = element.querySelector("input[name='url']");
				if (urlInput) {
					var newUrl = prefer(urlInput.value);
					if (newUrl) {
						urlInput.value = newUrl;
					}
				}
				element.setAttribute("action", newAction);
				element.style.setProperty("background-color", "#cfc");
				setTimeout(function() { element.submit(); }, 10);
				return stop(event);
			}
		}
	}
}, true);
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = getParent(element, "a");
		}
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_PREFERRED-MBS")) { // mb_SUPER-MIND-CONTROL-II-X-TURBO server switcher
			process(element);
		}
	}
});
function process(anchor) {
	var HREF = anchor.getAttribute("href");
	if (HREF) {
		var newHref;
		if (anchor.closest(".edit-note-text")) {
			// Force stay on the same MBS when clicking edit note links (annotations are doing it natively OK)
			// Test at https://musicbrainz.org/edit/1736776
			newHref = prefer(HREF, location.protocol + "//" + location.host);
		} else {
			newHref = prefer(HREF);
		}
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
function prefer(URL, forced_MBS) {
	var newUrl = forced_MBS ? forced_MBS : preferred_MBS;
	var urlMatch = URL.trim().match(/^(https?:)?(\/\/)?(((beta|test)\.)?musicbrainz\.org(:\d+)?)(?<path>\/.*)?(?<query>\?.*)?(?<hash>#.*)?$/);
	if (urlMatch) {
		if (urlMatch.groups.path) {
			newUrl += urlMatch.groups.path;
		}
		if (urlMatch.groups.query) {
			newUrl += urlMatch.groups.query;
		}
		if (urlMatch.groups.hash) {
			newUrl += urlMatch.groups.hash;
		}
		if (newUrl && newUrl != (forced_MBS ? forced_MBS : preferred_MBS) && leftTrim(newUrl) != leftTrim(URL)) {
			return newUrl;
		}
	}
}
function leftTrim(url) {
	var trimmedURL = url;
	if (trimmedURL.indexOf(location.protocol) === 0) {
		trimmedURL = trimmedURL.replace(/^https?:/, "");
	}
	if (trimmedURL.indexOf("//" + location.host) === 0) {
		trimmedURL = trimmedURL.replace(new RegExp("^//" + location.host), "");
	}
	return trimmedURL;
}
