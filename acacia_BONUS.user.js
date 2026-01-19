// ==UserScript==
// @name            acacia. BONUS
// @version         2026.1.19
// @description:fr  Affiche si on est en prod ; Affiche une horloge UTC ; Alt+click pour copier le message ; Shift+click pour tout ouvrir/fermer
// @description     Show PRD banner; Show an UTC Clock; Alt+click to copy message; Shift+click to expand/collapse all
// @namespace       https://github.com/jesus2099/konami-command
// @supportURL      https://github.com/jesus2099/konami-command/labels/acacia_BONUS
// @downloadURL     https://github.com/jesus2099/konami-command/raw/master/acacia_BONUS.user.js
// @author          jesus2099
// @licence         CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @created         2024-07-25
// @grant           GM_setClipboard
// @include         /https?:\/\/[aci]{6}(-[cdertv]{3})?\.[fiancer]{9}\.fr/
// @run-at          document-idle
// ==/UserScript==
"use strict";

var acacia_BONUS = {
	script_name: GM_info.script.name + " version " + GM_info.script.version,
	is_production: !/-/.test(location.host),
	css: document.createElement("style"),
};
acacia_BONUS.css.setAttribute("type", "text/css");
document.head.appendChild(acacia_BONUS.css);
acacia_BONUS.css = acacia_BONUS.css.sheet;

/* // Hide footer
if (innerHeight < 1000) {
	acacia_BONUS.css.insertRule("body > app-root > app-footer { display: none; }", 0);
} */

// Alt+click to copy message body
if (location.pathname == "/administration/executions") {
	document.addEventListener("click", function(event) {
		if (event.altKey && event.target.matches("pre.message-body")) {
			var clip = event.target.innerText.match(/<STX>([\w\W]+)<ETX>/);
			if (clip) {
				clip = clip[1].replace(/(?<!\r)\n|\r(?!\n)/g, "\r\n").replace(/\r\n$/, "");
				GM_setClipboard(clip, "text/plain");
				console.log("Message copied to clipboard:\n" + clip);
			}
		}
	});
}

// Shift+click to expand/collapse all
document.addEventListener("click", function(event) {
	if (event.shiftKey) {
		var mat_card = event.target.closest("div mat-card");
		if (mat_card) {
			var mat_icon = mat_card.querySelector("mat-icon");
			if (mat_icon.textContent.match(/^expand_(less|more)$/)) {
				var other_mat_icons = mat_card.closest("div").querySelectorAll("mat-card mat-icon");
				for (var i = 0; i < other_mat_icons.length; i++) {
					if (
						other_mat_icons[i] != mat_icon
						&& other_mat_icons[i].textContent.match(/^expand_(less|more)$/)
						&& other_mat_icons[i].textContent != mat_icon.textContent
					)
						other_mat_icons[i].click();
				}
			}
		}
	}
});
