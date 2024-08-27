// ==UserScript==
// @name            acacia. BONUS
// @version         2024.7.26
// @description:fr  Affiche une horloge UTC
// @description     Show an UTC Clock
// @namespace       https://github.com/jesus2099/konami-command
// @supportURL      https://github.com/jesus2099/konami-command/labels/acacia_BONUS
// @downloadURL     https://github.com/jesus2099/konami-command/raw/master/acacia_BONUS.user.js
// @author          jesus2099
// @licence         CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since           2024-07-25
// @grant           none
// @include         /https?:\/\/[aci]{6}(-[cdertv]{3})?\.[fiancer]{9}\.fr/
// @run-at          document-idle
// ==/UserScript==
"use strict";
var acacia_BONUS = {
	css: document.createElement("style"),
};
acacia_BONUS.css.setAttribute("type", "text/css");
document.head.appendChild(acacia_BONUS.css);
acacia_BONUS.css = acacia_BONUS.css.sheet;

// UTC Clock
acacia_BONUS.UTC_clock = document.createElement("div");
acacia_BONUS.UTC_clock.classList.add("j2-utc-clock");
acacia_BONUS.UTC_clock.setAttribute("title", GM_info.script.name + " version " + GM_info.script.version);
acacia_BONUS.css.insertRule("app-footer > footer > div.j2-utc-clock { padding: 2px 8px; font-family: monospace; margin-right: auto; background-color: " + (location.host.match(/-/) ? "green" : "red") + "; border-radius: .8em; color: white; font-weight: bold; text-shadow: 1px 1px 3px black; box-shadow: 2px 2px 4px grey; }", 0);

waitForElement("app-footer footer", function(footer) {
	acacia_BONUS.UTC_clock.appendChild(document.createTextNode(getUTCTimeString(getLocale())));
	footer.insertBefore(acacia_BONUS.UTC_clock, footer.firstChild);
	setInterval(function() {
		acacia_BONUS.UTC_clock.replaceChild(document.createTextNode(getUTCTimeString(getLocale())), acacia_BONUS.UTC_clock.firstChild);
	}, 5000);
});


function getUTCTimeString(locale) {
	return (new Date()).toLocaleString(
		locale,
		{
			timeZone: "UTC",
			timeZoneName: "short",
			/* year: "numeric",
			month: "long",
			day: "2-digit",
			weekday: "long", */
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
function waitForElement(selector, callback) {
	var waitForElementIntervalID = setInterval(function() {
		var element = document.querySelector(selector);
		if (element) {
			clearInterval(waitForElementIntervalID);
			callback(element);
		}
	}, 123);
}
