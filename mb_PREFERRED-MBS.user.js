// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2019.9.13
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PREFERRED-MBS.user.js
// @description  choose your favourite MusicBrainz server (main or beta) and no link will ever send you to the other
// @inspiration  http://userscripts-mirror.org/scripts/show/487275
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PREFERRED-MBS
// @compatible   vivaldi(2.6.1566.49)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(68.0.1)+violentmonkey       tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-01-12
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match        *://*/*
// @run-at       document-start
// @inject-into  auto
// "inject-into  auto" is specific to Firefox + Violentmonkey + GitHub https://github.com/violentmonkey/violentmonkey/issues/597
// ==/UserScript==
"use strict";
/*-----------------------------------------------*/
/* preferredMBS can be either (there is no more HTTP)
 * https://musicbrainz.org or https://beta.musicbrainz.org
 * it is not intended to work with any other values */
var preferredMBS = "https://musicbrainz.org";
/*-----------------------------------------------*/
/* Simple Discourse click tracker problem work-around ------------- */
var discourseURL;
if (discourseURL = self.location.href.match(/^https?:\/\/community\.metabrainz\.org\/clicks\/track\?url=([^?&]+)/)) {
	self.location.replace(decodeURIComponent(discourseURL[1]));
}
/* ---------------------------------------------------------------- */
preferredMBS = leftTrim(preferredMBS);
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
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_PREFERRED-MBS")) {//mb_SUPER-MIND-CONTROL-II-X-TURBO
			process(element);
		}
	}
});
/* for Snap Links extension v1.9.5 by Ayush and Mpkstroff http://addons.opera.com/extensions/details/snap-links */
document.addEventListener("mousedown", function(event) {
	document.addEventListener("DOMAttrModified", snapLinksDOMAttrModified);
});
document.addEventListener("mouseup", function(event) {
	document.removeEventListener("DOMAttrModified", snapLinksDOMAttrModified);
});
function snapLinksDOMAttrModified(event) {
	var element = event.target || event.srcElement;
	if (element && element.tagName == "A" && event.attrName == "style" && event.attrChange == 2 && event.newValue.match(/outline.+!important/)) {
		/*attrChange: 1 MODIFICATION, 2 ADDITION, 3 REMOVAL*/
		process(element);
	}
}
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
	var newUrl = preferredMBS;
	var urlMatch = URL.trim().match(/^(https?:)?(\/\/)?((?:beta\.)?musicbrainz\.org(?::\d+)?)(\/.*)?(\?.*)?(#.*)?$/);
	if (urlMatch) {
		newUrl += (urlMatch[4] ? urlMatch[4] : "") + (urlMatch[5] ? urlMatch[5] : "") + (urlMatch[6] ? urlMatch[6] : "");
	} else if (
		self.location.href.match(/^https?:\/\/(beta\.)?musicbrainz\.org/)
		&& URL.match(/^\/([^/]|$)/)
		&& preferredMBS.match(/^(https?:)?\/\//)
	) {
		newUrl += URL;
	}
	return (newUrl && newUrl != preferredMBS && newUrl != leftTrim(URL) ? newUrl : null);
}
function leftTrim(url) {
	var trimmedURL = url;
	if (trimmedURL.indexOf(self.location.protocol) === 0) {
		trimmedURL = trimmedURL.replace(/^https?:/, "");
	}
	if (trimmedURL.indexOf("//" + self.location.host) === 0) {
		trimmedURL = trimmedURL.replace(new RegExp("^//" + self.location.host), "");
	}
	return trimmedURL;
}
