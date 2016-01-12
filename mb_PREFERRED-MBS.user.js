// ==UserScript==
// @name         mb. PREFERRED MBS
// @version      2016.1.12
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PREFERRED-MBS.user.js
// @description  choose your favourite MusicBrainz server (http/https, main/beta) and no link will ever send you to the others — bypass this script by holding CTRL+ALT+SHIFT
// @coming-soon  https://github.com/jesus2099/konami-command/labels/mb_PREFERRED-MBS
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PREFERRED-MBS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-01-12
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
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
	document.body.addEventListener("mousedown", function(event) {
		if (!event.altKey || !event.ctrlKey || !event.shiftKey) {
			var element = event.target || event.srcElement;
			if (element && element.nodeType == Node.ELEMENT_NODE) {
				if (element.tagName == "BDI") {
					element = element.parentNode;
				}
				if (element.tagName == "A") {
					var href = element.getAttribute("href");
					if (href) {
						var hrefMatch = href.match(/^(https?:)?(\/\/)?(beta\.)?(musicbrainz\.org)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/);
						if (hrefMatch) {
							element.setAttribute("href",
								preferredMBS
								+ (hrefMatch[5] ? hrefMatch[5] : "")
								+ (hrefMatch[6] ? hrefMatch[6] : "")
								+ (hrefMatch[7] ? hrefMatch[7] : "")
								+ (hrefMatch[8] ? hrefMatch[8] : "")
							);
						} else if (location.href.match(/^https?:\/\/(beta\.)?musicbrainz\.org/) && href.match(/^\/[^/]/)) {
							element.setAttribute("href", preferredMBS + href);
						}
					}
				}
			}
		}
	});
}
