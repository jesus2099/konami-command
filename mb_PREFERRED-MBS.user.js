// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2016.1.14
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
var preferredMBS = "http://beta.musicbrainz.org";
/*-----------------------------------------------*/
if (document.body) {
	preferredMBS = stripProtocol(preferredMBS);
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
						var hrefMatch = HREF.match(/^(https?:)?(\/\/)?(beta\.)?(musicbrainz\.org)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/);
						var newHref = preferredMBS;
						if (hrefMatch) {
							newHref += (hrefMatch[5] ? hrefMatch[5] : "") + (hrefMatch[6] ? hrefMatch[6] : "") + (hrefMatch[7] ? hrefMatch[7] : "") + (hrefMatch[8] ? hrefMatch[8] : "");
						} else if (
							location.href.match(/^https?:\/\/(beta\.)?musicbrainz\.org/)
							&& (preferredMBS.indexOf("http") == 0 || "//" + location.host != preferredMBS.match(/\/\/(beta\.)?musicbrainz\.org/))
							&& HREF.match(/^\/[^/]/)
						) {
							newHref += HREF;
						}
						if (newHref != preferredMBS && newHref != stripProtocol(HREF)) {
							element.setAttribute("href", newHref);
							element.style.setProperty("border", "1px dashed gold");
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
function stripProtocol(url) {
	if (url.indexOf(location.protocol) == 0) {
		return url.replace(/^https?:/, "");
	} else {
		return url;
	}
}
