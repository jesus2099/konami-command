// ==UserScript==
// @name         CONTROL POMME
// @version      2024.3.14.1822
// @description  Keyboard modifier key abstraction to handle Linux, Macintosh and Windows. Use https://github.com/jesus2099/konami-command/raw/(specific-commit)/lib/CONTROL-POMME.js to stick to a specific version.
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-12-12; https://github.com/jesus2099/konami-command/commit/02cb4880e109259bb41f22dde4d3ed058fd90023
// @grant        none
// ==/UserScript==
"use strict";
var CONTROL_POMME = {
	is_macintosh: /\bMac(intosh| OS)\b/.test(navigator.userAgent)
	// modifier_key: {key: javascript_event_attribute, label: modkey_prefix_for_gui_texts}
};
// ⌘ Control Pomme Command
CONTROL_POMME.ctrl = {
	key: CONTROL_POMME.is_macintosh ? "metaKey" : "ctrlKey",
	label: CONTROL_POMME.is_macintosh ? "\u2318\u00a0" : "Control+"
};
// ⇧ Shift
CONTROL_POMME.shift = {
	key: "shiftKey",
	label: CONTROL_POMME.is_macintosh ? "\u21E7\u00a0" : "Shift+"
};
// ⌥ Alt Option
CONTROL_POMME.alt = {
	key: "altKey",
	label: CONTROL_POMME.is_macintosh ? "\u2325\u00a0" : "Alt+"
};
CONTROL_POMME.new_tab_mod_keys = function(event) {
	return CONTROL_POMME.is_macintosh ? /* ⇧⌘click */ event.shiftKey && event.metaKey : /* Shift+click */ event.shiftKey;
};
CONTROL_POMME.new_bg_tab_mod_keys = function(event) {
	return CONTROL_POMME.is_macintosh ? /* ⌘click */ event.metaKey : /* Ctrl+click */ event.ctrlKey;
};
