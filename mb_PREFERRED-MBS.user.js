// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2016.1.18
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PREFERRED-MBS.user.js
// @description  choose your favourite MusicBrainz server (http/https, main/beta) and no link will ever send you to the others — bypass this script by holding CTRL+ALT+SHIFT
// @coming-soon  https://github.com/jesus2099/konami-command/labels/mb_PREFERRED-MBS
// @inspiration  http://userscripts-mirror.org/scripts/show/487275
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-01-12
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=84017&v=2015.11.2
// @grant        none
// @include      http://*
// @include      https://*
// @run-at       document-end
// ==/UserScript==
"use strict";
/*-----------------------------------------------*/
/* preferredMBS can be either
 * http://musicbrainz.org, https://musicbrainz.org, http://beta.musicbrainz.org or https://beta.musicbrainz.org
 * it is not intended to work with any other values */
var preferredMBS = "http://beta.musicbrainz.org";
/*-----------------------------------------------*/
if (document.body) {
	preferredMBS = leftTrim(preferredMBS);
	document.body.addEventListener("mousedown", function(event) {
		if (!event.altKey || !event.ctrlKey || !event.shiftKey) {
			var element = event.target || event.srcElement;
			if (element && element.nodeType == Node.ELEMENT_NODE) {
				if (element.tagName != "A") {
					element = getParent(element, "a");
				}
				if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_PREFERRED-MBS")) {//linked in mb_COOL-ENTITY-LINKS, mb_SUPER-MIND-CONTROL-II-X-TURBO
					var HREF = element.getAttribute("href");
					if (HREF) {
						var newHref = preferredMBS;
						var hrefMatch = HREF.match(/^(https?:)?(\/\/)?((?:beta\.)?musicbrainz\.org(?::\d+)?)(\/.*)?(\?.*)?(#.*)?$/);
						if (hrefMatch) {
							newHref += (hrefMatch[4] ? hrefMatch[4] : "") + (hrefMatch[5] ? hrefMatch[5] : "") + (hrefMatch[6] ? hrefMatch[6] : "");
						} else if (
							location.href.match(/^https?:\/\/(beta\.)?musicbrainz\.org/)
							&& HREF.match(/^\/([^/]|$)/)
							&& preferredMBS.match(/^(https?:)?\/\//)
						) {
							newHref += HREF;
						}
						if (newHref != preferredMBS && newHref != leftTrim(HREF)) {
							element.setAttribute("href", newHref);
							element.style.setProperty("background-color", "#cfc");
							element.style.setProperty("color", "#606");
							element.style.setProperty("text-decoration", "line-through");
							var tooltip = element.getAttribute("title") || "";
							if (tooltip) {
								tooltip += "\r\n";
							}
							element.setAttribute("title", tooltip + "old: " + HREF + "\r\nnew: " + newHref);
						}
					}
				}
			}
		}
	});
}
function leftTrim(url) {
	var trimmedURL = url;
	if (trimmedURL.indexOf(location.protocol) == 0) {
		trimmedURL = trimmedURL.replace(/^https?:/, "");
	}
	if (trimmedURL.indexOf("//" + location.host) == 0) {
		trimmedURL = trimmedURL.replace(new RegExp("^//" + location.host), "");
	}
	return trimmedURL;
}