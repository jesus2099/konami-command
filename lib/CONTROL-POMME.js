// ==UserScript==
// @name         CONTROL POMME
// @version      2024.10.25
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
// (1c) ⌘ Ctrl Pomme Command
CONTROL_POMME.ctrl = {
	key: CONTROL_POMME.is_macintosh ? "metaKey" : "ctrlKey",
	label: CONTROL_POMME.is_macintosh ? "\u2318" : "Ctrl+",
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["ctrl"]);
	}
};
// (2s) ⇧ Shift
CONTROL_POMME.shift = {
	key: "shiftKey",
	label: CONTROL_POMME.is_macintosh ? "\u21E7" : "Shift+",
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["shift"]);
	}
};
// (3a) ⌥ Alt Option
CONTROL_POMME.alt = {
	key: "altKey",
	label: CONTROL_POMME.is_macintosh ? "\u2325" : "Alt+",
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["alt"]);
	}
};
// Macintosh:     3a 2s 1c // ⌥⇧⌘
// Windows Linux: 1c 3a 2s // Ctrl+Alt+Shift+
CONTROL_POMME.ctrl_shift = { // 2s 1c / 1c 2s
	label: CONTROL_POMME.is_macintosh ? CONTROL_POMME.shift.label + CONTROL_POMME.ctrl.label : CONTROL_POMME.ctrl.label + CONTROL_POMME.shift.label,
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["ctrl", "shift"]);
	}
};
CONTROL_POMME.ctrl_alt = { // 3a 1c / 1c 3a
	label: CONTROL_POMME.is_macintosh ? CONTROL_POMME.alt.label + CONTROL_POMME.ctrl.label : CONTROL_POMME.ctrl.label + CONTROL_POMME.alt.label,
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["ctrl", "alt"]);
	}
};
CONTROL_POMME.alt_shift = { // 3a 2s / 3a 2s
	label: CONTROL_POMME.alt.label + CONTROL_POMME.shift.label,
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["alt", "shift"]);
	}
};
CONTROL_POMME.ctrl_alt_shift = { // 3a 2s 1c / 1c 3a 2s
	label: CONTROL_POMME.is_macintosh ? CONTROL_POMME.alt.label + CONTROL_POMME.shift.label + CONTROL_POMME.ctrl.label : CONTROL_POMME.ctrl.label + CONTROL_POMME.alt.label + CONTROL_POMME.shift.label,
	test: function(event) {
		return CONTROL_POMME.arePressed(event, ["ctrl", "alt", "shift"]);
	}
};
CONTROL_POMME.new_tab_mod_keys = function(event) {
	return CONTROL_POMME.is_macintosh ? /* ⇧⌘click */ event.shiftKey && event.metaKey : /* Shift+click */ event.shiftKey;
};
CONTROL_POMME.new_bg_tab_mod_keys = function(event) {
	return CONTROL_POMME.is_macintosh ? /* ⌘click */ event.metaKey : /* Ctrl+click */ event.ctrlKey;
};
// Check if mod_keys are pressed, and no others
CONTROL_POMME.arePressed = function(event, mod_keys) {
	var wanted_mod_keys = !(CONTROL_POMME.is_macintosh ? event.ctrlKey : event.metaKey); // “forbidden” keys
	for (var k = 0, mk = ["ctrl", "shift", "alt"]; wanted_mod_keys !== false && k < mk.length; k++) {
		wanted_mod_keys = wanted_mod_keys && mod_keys.indexOf(mk[k]) > -1 === event[CONTROL_POMME[mk[k]].key];
	}
	return wanted_mod_keys;
};
