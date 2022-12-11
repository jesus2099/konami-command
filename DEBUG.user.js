// ==UserScript==
// @name         DEBUG
// @version      2022.12.11
// @description  Event and context info
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/DEBUG
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/DEBUG.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-12-10
// @grant        none
// @run-at       document-end
// ==/UserScript==
"use strict";
console.debug(GM_info.script.name + " - " + location.href);
if (GM_info.platform) console.debug("GM_info.platform: " + JSON.stringify(GM_info.platform, null, "\t"));
console.debug(GM_info);
document.body.addEventListener("keydown", keyboardMouseEventDebug);
document.body.addEventListener("keypress", keyboardMouseEventDebug);
document.body.addEventListener("keyup", keyboardMouseEventDebug);
document.body.addEventListener("auxclick", keyboardMouseEventDebug);
document.body.addEventListener("click", keyboardMouseEventDebug);
document.body.addEventListener("dblclick", keyboardMouseEventDebug);
document.body.addEventListener("mousedown", keyboardMouseEventDebug);
document.body.addEventListener("mouseup", keyboardMouseEventDebug);
function keyboardMouseEventDebug(event) {
	console.debug(
		event.type.toUpperCase().padEnd(12)
		+ (event.altKey && event.key != "Alt" ? "Alt + " : "")
		+ (event.ctrlKey && event.key != "Control" ? "Control + " : "")
		+ (event.metatKey && event.key != "Meta" ? "Meta + " : "")
		+ (event.shiftKey && event.key != "Shift" ? "Shift + " : "")
		+ (event.key !== undefined ? event.key + " " : "")
		+ (event.location ? "(" + ["standard", "left", "right", "numpad", "mobile", "joystick"][event.location] + ") " : "")
		+ (event.repeat === true ? "(repeat) " : "")
		+ (event.button !== undefined ? ["left", "wheel", "right", "back", "forward"][event.button] + " " : "")
	);
}
