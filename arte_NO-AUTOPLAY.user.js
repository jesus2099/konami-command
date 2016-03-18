// ==UserScript==
// @name         arte. NO AUTOPLAY
// @version      2016.3.18
// @changelog    https://github.com/jesus2099/konami-command/commits/master/arte_NO-AUTOPLAY.user.js
// @description  arte.tv: Removes autoplay property from video page links
// @coming-soon  https://github.com/jesus2099/konami-command/labels/arte_NO-AUTOPLAY
// @inspiration  http://userscripts-mirror.org/scripts/show/487275
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.18)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/arte_NO-AUTOPLAY.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/arte_NO-AUTOPLAY.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-03-18
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=84017&v=2015.11.2
// @grant        none
// @include      http://arte.tv/*
// @include      http://concert.arte.tv/*
// @include      http://www.arte.tv/*
// @run-at       document-start
// ==/UserScript==
"use strict";
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = getParent(element, "a");
		}
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-arte_NO-AUTOPLAY")) { // not linked yet
			var HREF = element.getAttribute("href");
			if (HREF && HREF.match(/[?&]autoplay=1\b/)) {
				var newHref = HREF.replace(/autoplay=1/g, "").replace(/([?&])&/g, "$1").replace(/[?&]$/, "");
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
});
