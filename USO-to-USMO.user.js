// ==UserScript==
// @name         USO to USMO
// @version      2021.3.17
// @changelog    https://github.com/jesus2099/konami-command/commits/master/USO-to-USMO.user.js
// @description  ☠ OBSOLETE ☠ and userscripts.org links lead to userscripts-mirror.org — all kinds: http/https, www/no-www, short/long — bypass this script by holding CTRL+ALT+SHIFT
// @supportURL   https://github.com/jesus2099/konami-command/labels/USO-to-USMO
// @compatible   vivaldi(2.6.1566.49)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(68.0.1)+violentmonkey       tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/USO-to-USMO.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/USO-to-USMO.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2015-07-30; inspiration by https://web.archive.org/web/20140712013355/userscripts-mirror.org/scripts/show/487275
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        none
// @match        *://*/*
// @exclude      *://userscripts-mirror.org/*
// @run-at       document-start
// @inject-into  auto
// "inject-into  auto" is specific to Firefox + Violentmonkey + GitHub https://github.com/violentmonkey/violentmonkey/issues/597
// ==/UserScript==
"use strict";
alert("Please uninstall my “USO to USMO” userscript and use web.archive.org instead. userscripts-mirror.org is not safe to use.\n\nThank you for having using my script.\njesus2099");
document.addEventListener("mousedown", function(event) {
	if (!event.altKey || !event.ctrlKey || !event.shiftKey) {
		var element = event.target || event.srcElement;
		if (element && element.nodeType == Node.ELEMENT_NODE) {
			if (element.tagName != "A") {
				element = getParent(element, "a");
			}
			if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-USO-to-USMO")) { // not linked yet
				var HREF = element.getAttribute("href");
				var hrefMatch = HREF && HREF.trim().match(/^(https?:)?(\/\/)?(www\.)?(userscripts\.org)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/);
				var newHref = HREF;
				if (hrefMatch) {
					/* an USO link was (left/middle/right) mouse clicked */
					/* expand short path (uso/123456 → uso/scripts/show/123456) */
					var shortPath = hrefMatch[6];
					if (shortPath && (shortPath = shortPath.match(/^\/(\d+)\/?$/))) {
						newHref = newHref.replace(shortPath[0], "/scripts/show/" + shortPath[1]);
					}
					/* USO to USMO */
					newHref = newHref.replace((hrefMatch[1] ? hrefMatch[1] : "") + (hrefMatch[2] ? hrefMatch[2] : "") + (hrefMatch[3] ? hrefMatch[3] : "") + hrefMatch[4], "http://userscripts-mirror.org");
					element.setAttribute("href", newHref);
					element.style.setProperty("background-color", "#cfc");
					element.style.setProperty("color", "#606");
					element.style.setProperty("text-decoration", "line-through");
					var tooltip = element.getAttribute("title") || "";
					if (tooltip) {
						tooltip += "\n";
					}
					element.setAttribute("title", tooltip + "old: " + HREF + "\nnew: " + newHref);
				}
			}
		}
	}
});
