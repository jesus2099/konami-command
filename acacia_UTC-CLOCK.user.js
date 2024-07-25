// ==UserScript==
// @name            acacia. UTC CLOCK
// @version         2024.7.25
// @description:fr  Affiche l‘heure TU
// @description     Show UTC Clock
// @namespace       https://github.com/jesus2099/konami-command
// @supportURL      https://github.com/jesus2099/konami-command/labels/acacia_UTC-CLOCK
// @downloadURL     https://github.com/jesus2099/konami-command/raw/master/acacia_UTC-CLOCK.user.js
// @author          jesus2099
// @licence         CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since           2024-07-25
// @grant           none
// @include         /https?:\/\/[aci]{6}\.[fiancer]{9}\.fr/
// @run-at          document-idle
// ==/UserScript==
"use strict";
var UTC_clock = {
	css: document.createElement("style"),
	display: document.createElement("div")
}
UTC_clock.display.classList.add("j2-utc-clock");
UTC_clock.css.setAttribute("type", "text/css");
document.head.appendChild(UTC_clock.css);
UTC_clock.css = UTC_clock.css.sheet;
UTC_clock.css.insertRule("app-footer footer > div.j2-utc-clock { opacity: .8; font-size: .8em; background-color: #fcf; margin-right: auto; padding: 2px 8px; border: solid #c9c 1px; color: #303; font-weight: bold; }", 0);

var footer = document.querySelector("app-footer footer");
if (footer) {
	UTC_clock.display.appendChild(document.createTextNode(getUTCTimeString(getLocale())));
	footer.insertBefore(UTC_clock.display, footer.firstChild);
}

setInterval(function() {
	UTC_clock.display.replaceChild(document.createTextNode(getUTCTimeString(getLocale())), UTC_clock.display.firstChild);
}, 5000);
function getUTCTimeString(locale) {
	return (new Date()).toLocaleString(
		locale,
		{
			timeZone: "UTC",
			timeZoneName: "short",
			year: "numeric",
			month: "long",
			day: "2-digit",
			weekday: "long",
			hour: "2-digit",
			minute: "2-digit"
		}
	);
}
function getLocale() {
	var locale = localStorage.getItem("lang");
	switch (locale) {
		default:
		case "fr":
			locale = "fr-FR";
			break;
		case "en":
			locale = "en-GB";
			break;
	}
	return locale;
}
