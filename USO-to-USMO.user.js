// ==UserScript==
// @name         USO to USMO
// @version      2015.7.31.2222
// @changelog    https://github.com/jesus2099/konami-command/commits/master/USO-to-USMO.user.js
// @description  and userscripts.org links lead to userscripts-mirror.org — all kinds: http/https, www/no-www, short/long
// @inspiration  http://userscripts-mirror.org/scripts/show/487275
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/USO-to-USMO.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/USO-to-USMO.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-07-30
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @exclude      http://userscripts-mirror.org/*
// @run-at       document-start
// ==/UserScript==
"use strict";
document.addEventListener("mousedown", uso2usmo);
function uso2usmo(event) {
	var element = event.target || event.srcElement;
	if (element && element.tagName == "A") {
		var href = element.getAttribute("href");
		var hrefMatch = href && href.match(/^(https?:)?(\/\/)?(www\.)?(userscripts\.org)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/);
		if (hrefMatch) {
			/* an USO link was (left/middle/right) mouse clicked */
			/* expand short path (uso/123456 → uso/scripts/show/123456) */
			var shortPath = hrefMatch[6];
			if (shortPath && (shortPath = shortPath.match(/^\/(\d+)\/?$/))) {
				href = href.replace(shortPath[0], "/scripts/show/" + shortPath[1]);
			}
			/* USO to USMO */
			element.setAttribute("href", href.replace((hrefMatch[1] ? hrefMatch[1] : "") + (hrefMatch[2] ? hrefMatch[2] : "") + (hrefMatch[3] ? hrefMatch[3] : "") + hrefMatch[4], "http://userscripts-mirror.org"));
		}
	}
}
