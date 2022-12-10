// ==UserScript==
// @name         DEBUG
// @version      2022.12.10
// @description  Event and context info
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/DEBUG
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/DEBUG.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-12-10
// @grant        none
// @run-at       document-start
// ==/UserScript==
"use strict";
console.debug(GM_info.script.name + " - " + location.href);
console.debug(GM_info);
document.body.addEventListener("keydown", function(event) {
	console.debug(event.type + "\n" + (event.altKey ? "alt+" : "") + (event.ctrlKey ? "crtl+" : "") + (event.metatKey ? "shift+" : "") + (event.shiftKey ? "shift+" : "") + event.key);
});
document.body.addEventListener("click", function(event) {
	console.debug((event.altKey ? "alt+" : "") + (event.ctrlKey ? "crtl+" : "") + (event.metatKey ? "shift+" : "") + (event.shiftKey ? "shift+" : "") + event.type);
});
