// ==UserScript==
// @name         mb. ELEPHANT EDITOR
// @version      2025.8.29
// @description  musicbrainz.org + acoustid.org: Remember last edit notes
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ELEPHANT-EDITOR
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ELEPHANT-EDITOR.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-01-13; https://web.archive.org/web/20131103163403/userscripts.org/scripts/show/94629 / https://web.archive.org/web/20141011084017/userscripts-mirror.org/scripts/show/94629
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/c5fb7fe162530fdbd7e017170f24169272a729a0/lib/CONTROL-POMME.js?version=2024.3.14.1822
// @require      https://github.com/jesus2099/konami-command/raw/f1cbb2368209bc51a175062dc512f1a1eb7d25a7/lib/SUPER.js?version=2024.11.8
// @grant        none
// @match        *://*.musicbrainz.org/*/add-alias
// @match        *://*.musicbrainz.org/*/change-quality
// @match        *://*.musicbrainz.org/*/create*
// @match        *://*.musicbrainz.org/*/delete
// @match        *://*.musicbrainz.org/*/edit
// @match        *://*.musicbrainz.org/*/edit/?*
// @match        *://*.musicbrainz.org/*/edit_annotation
// @match        *://*.musicbrainz.org/*/merge
// @match        *://*.musicbrainz.org/*/merge?*
// @match        *://*.musicbrainz.org/*/move?dest=*
// @match        *://*.musicbrainz.org/*/remove*
// @match        *://*.musicbrainz.org/*edits*
// @match        *://*.musicbrainz.org/artist/*/split
// @match        *://*.musicbrainz.org/cdtoc/*
// @match        *://*.musicbrainz.org/dialog?path=%2F*%2Fcreate*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/edit/artist/add.html?*
// @match        *://*.musicbrainz.org/edit/subscribed*
// @match        *://*.musicbrainz.org/event/*/*-event-art*
// @match        *://*.musicbrainz.org/isrc/delete*
// @match        *://*.musicbrainz.org/mod/*
// @match        *://*.musicbrainz.org/recording/*/add-isrc
// @match        *://*.musicbrainz.org/release*/*/*-cover-art*
// @match        *://*.musicbrainz.org/release/*/edit*
// @match        *://*.musicbrainz.org/release/add*
// @match        *://*.musicbrainz.org/work/*/add-iswc
// @match        *://*.musicbrainz.eu/*/add-alias
// @match        *://*.musicbrainz.eu/*/change-quality
// @match        *://*.musicbrainz.eu/*/create*
// @match        *://*.musicbrainz.eu/*/delete
// @match        *://*.musicbrainz.eu/*/edit
// @match        *://*.musicbrainz.eu/*/edit/?*
// @match        *://*.musicbrainz.eu/*/edit_annotation
// @match        *://*.musicbrainz.eu/*/merge
// @match        *://*.musicbrainz.eu/*/merge?*
// @match        *://*.musicbrainz.eu/*/move?dest=*
// @match        *://*.musicbrainz.eu/*/remove*
// @match        *://*.musicbrainz.eu/*edits*
// @match        *://*.musicbrainz.eu/artist/*/split
// @match        *://*.musicbrainz.eu/cdtoc/*
// @match        *://*.musicbrainz.eu/dialog?path=%2F*%2Fcreate*
// @match        *://*.musicbrainz.eu/edit/*
// @match        *://*.musicbrainz.eu/edit/artist/add.html?*
// @match        *://*.musicbrainz.eu/edit/subscribed*
// @match        *://*.musicbrainz.eu/event/*/*-event-art*
// @match        *://*.musicbrainz.eu/isrc/delete*
// @match        *://*.musicbrainz.eu/mod/*
// @match        *://*.musicbrainz.eu/recording/*/add-isrc
// @match        *://*.musicbrainz.eu/release*/*/*-cover-art*
// @match        *://*.musicbrainz.eu/release/*/edit*
// @match        *://*.musicbrainz.eu/release/add*
// @match        *://*.musicbrainz.eu/work/*/add-iswc
// @match        *://acoustid.org/edit/*
// @run-at       document-idle
// ==/UserScript==
"use strict";
var IS_TOUCH_SCREEN = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
var IS_MOBILE_DEVICE = /Mobile/i.test(navigator.userAgent);
var ON_MB = location.host.match(/^((beta|test)\.)?musicbrainz\.(org|eu)/);
var ON_EDIT_PAGE = (ON_MB && location.pathname.match(/^\/edit\/\d+$/));
var ON_EDIT_SEARCH_PAGE = (ON_MB && location.pathname.match(/^\/.+(?:edits|subscribed)/));
var ON_RELEASE_EDITOR_PAGE = (ON_MB && document.querySelector("div#release-editor"));
var userjs = "jesus2099userjs94629";
var memories = 10;
var colours = {
	ok: "greenyellow",
	warning: "gold"
};
var notetextStorage = "jesus2099userjs::last_editnotetext";
var save = !localStorage.getItem(userjs + "forget") && (ON_EDIT_PAGE || !ON_EDIT_SEARCH_PAGE);
var content = document.querySelector(ON_MB ? "#page" : "div.content");
var saved_height = localStorage.getItem(userjs + "_savedHeight");
var notetext;
var submit_button;
waitForElements((ON_MB ? "#page" : "div.content") + " textarea" + (ON_MB ? ".edit-note, textarea#edit-note-text" : ""), init);
function init(edit_notes) {
	if (edit_notes.length === 1) {
		notetext = edit_notes[0];
		if (!ON_MB) {
			notetext.style.setProperty("height", "8em");
			notetext.style.setProperty("width", "100%");
		}
		if (saved_height) {
			notetext.style.setProperty("height", saved_height + "px");
			addAfter(createTag("div", {s: {textAlign: "right"}}, createTag("a", {e: {click: function(event) {
				localStorage.removeItem(userjs + "_savedHeight");
				this.parentNode.replaceChild(document.createTextNode("Size reset! It will take effect at next page load."), this);
			}}}, "↖Reset size")), notetext);
		}
		notetext.addEventListener("mouseup", function(event) {
			if (this.offsetHeight != saved_height) {
				localStorage.setItem(userjs + "_savedHeight", this.offsetHeight);
			}
		});
	} else {
		notetext = false;
	}
	submit_button = content.querySelector(ON_MB ? "form div.buttons button[type='submit'].submit.positive" : "input[type='submit']");
	if (submit_button === null && ON_RELEASE_EDITOR_PAGE) submit_button = document.querySelector("button.positive[type='button'][data-click='submitEdits']");
	if (submit_button === null && ON_EDIT_PAGE) submit_button = document.querySelector("form[action='/edit/enter_votes'] > span.buttons > button[type='submit']");
	if (submit_button === null && location.href.match(/edit-relationships$/)) submit_button = document.querySelector("div#content.rel-editor form > div.row.no-label.buttons > button.submit.positive[type='submit']");
	if (notetext) {
		if (ON_MB) {
			var carcan = getParent(notetext, "div", "half-width");
			if (carcan) {
				if (ON_RELEASE_EDITOR_PAGE) carcan.style.setProperty("width", "inherit");
				else notetext.parentNode.style.setProperty("width", carcan.parentNode.offsetWidth + "px");
			}
			notetext.style.setProperty("width", "98%");
			var removeLabels = ["label-id-ar.edit_note", "label-id-edit_note", "label-id-edit-artist.edit_note", "label-id-edit-label.edit_note", "label-id-edit-recording.edit_note", "label-id-edit-release-group.edit_note", "label-id-edit-url.edit_note", "label-id-edit-work.edit_note"];
			for (var l = 0; l < removeLabels.length; l++) {
				var label = document.getElementById(removeLabels[l]);
				if (label) label.parentNode.removeChild(label);
			}
		}
		var buttons = createTag("div", {a: {class: "buttons"}});
		var save_checkbox = buttons.appendChild(createTag("label", {
			a: {title: "save edit note"},
			s: {backgroundColor: (save ? colours.ok : colours.warning), minWidth: "0", margin: "0"},
			e: {
				click: function(event) {
					if (event[CONTROL_POMME.shift.key]) {
						sendEvent(submit_button, "click");
					}
				}
			}
		}));
		save_checkbox = save_checkbox.appendChild(createTag("input", {
			a: {type: "checkbox", class: "jesus2099remember", tabindex: "-1"},
			s: {display: "inline"},
			e: {
				change: function(event) {
					save = this.checked;
					this.parentNode.style.setProperty("background-color", save ? colours.ok : colours.warning);
					localStorage.setItem(userjs + "forget", save ? "" : "1");
				}
			}
		}));
		save_checkbox.checked = save;
		save_checkbox.parentNode.appendChild(document.createTextNode(" remember "));
		buttons.appendChild(createClearButton());
		for (var m = 0; m < memories; m++) {
			buttons.appendChild(document.createTextNode(" "));
			let butt = createButton("n-" + (+m + 1), "50px");
			let buttid = notetextStorage + "0" + m;
			butt.setAttribute("id", buttid);
			let lastnotetext = localStorage.getItem(buttid);
			if (!lastnotetext) {
				butt.setAttribute("disabled", "true");
				butt.style.setProperty("opacity", ".5");
			} else {
				butt.setAttribute("title", lastnotetext);
				butt.setAttribute("value", summarise(lastnotetext));
				if (IS_TOUCH_SCREEN) {
					onLongPress(butt, function(event) {
						if (confirm("Do you want to remove this memory?\n\n" + event.target.getAttribute("title"))) {
							forget(event.target.getAttribute("id").match(/(\d)$/)[1]);
						}
					});
				}
				butt.addEventListener("click", function(event) {
					if (event[CONTROL_POMME.ctrl.key]) {
						forget(event.target.getAttribute("id").match(/(\d)$/)[1]);
						notetext.focus();
					} else {
						forceValue(notetext, this.getAttribute("title"));
						if (!IS_TOUCH_SCREEN) {
							notetext.focus();
						}
						if (event[CONTROL_POMME.shift.key]) {
							sendEvent(submit_button, "click");
						}
					}
				}); // onclick
			}
			buttons.appendChild(butt);
		}
		if (IS_TOUCH_SCREEN) {
			buttons.appendChild(document.createElement("br"));
			buttons.appendChild(document.createTextNode("long touch: remove ↗"));
		}
		if (!IS_MOBILE_DEVICE || !IS_TOUCH_SCREEN) {
			buttons.appendChild(document.createTextNode(" ← " + CONTROL_POMME.shift.label + "click: submit / " + CONTROL_POMME.ctrl.label + "click: remove"));
		}
		notetext.parentNode.insertBefore(buttons, notetext);
		let lastnotetext = localStorage.getItem(notetextStorage + "00");
		if (save && !ON_EDIT_SEARCH_PAGE && !ON_EDIT_PAGE && lastnotetext && notetext.value == "") {
			forceValue(notetext, lastnotetext);
		}
	}
	if (submit_button !== null) {
		submit_button.addEventListener("click", saveNote);
		submit_button.insertBefore(document.createTextNode("🐘 "), submit_button.firstChild);
	} else if (!ON_EDIT_SEARCH_PAGE) {
		// alert("Error: ELEPHANT did not find submit button and cannot save edit note.");
	}
}
function saveNote() {
	if (notetext) {
		var thisnotetext = notetext.value.replace(/\u00a0—\u00a0[\r\n]{1,2}Merging into oldest \[MBID\] \(['\d,\s←+]+\)\./g, "").trim(); // linked in mb_MERGE-HELPOR-2.user.js
		var ls00 = localStorage.getItem(notetextStorage + "00");
		if (save && thisnotetext !== ls00) {
			if (ls00 !== "") {
				// remove earlier (rightwards) duplicates
				for (var idel = memories - 1; idel > 0; idel--) {
					if (thisnotetext === localStorage.getItem(notetextStorage + "0" + idel)) {
						forget(idel);
					}
				}
				// insert new note at the left and shift everything rightwards
				for (var isav = memories - 1; isav > 0; isav--) {
					var prev = localStorage.getItem(notetextStorage + "0" + (isav - 1));
					if (prev) {
						localStorage.setItem(notetextStorage + "0" + isav, prev);
					}
				}
			}
			localStorage.setItem(notetextStorage + "00", thisnotetext);
		}
	}
}
function forget(memory_index) {
	if (memory_index >= 0 && memory_index < memories) {
		for (var mi = memory_index; mi < memories; mi++) {
			var memory_button = document.querySelector("[id='" + notetextStorage + "0" + mi + "']");
			var next_memory = localStorage.getItem(notetextStorage + "0" + (+mi + 1));
			if (next_memory === null) {
				next_memory = "n-" + (+mi + 1);
				localStorage.removeItem(notetextStorage + "0" + mi);
				memory_button.removeAttribute("title");
				memory_button.setAttribute("disabled", "true");
				memory_button.style.setProperty("opacity", ".5");
			} else {
				localStorage.setItem(notetextStorage + "0" + mi, next_memory);
				memory_button.setAttribute("title", next_memory);
			}
			memory_button.setAttribute("value", summarise(next_memory));
		}
	} else {
		alert("Error while asked to forget memory n-" + (+memory_index + 1));
	}
}
function createButton(label, width) {
	let butt = createTag("input", {a: {type: "button", value: label, tabindex: "-1", class: "styled-button"}, s: {display: "inline", padding: "2px", float: "none"}});
	if (width) {
		butt.style.setProperty("width", width);
	}
	return butt;
}
function createClearButton() {
	let butt = createButton("×", "25px");
	butt.addEventListener("click", function(event) {
		forceValue(notetext, "");
		if (event[CONTROL_POMME.shift.key]) {
			sendEvent(submit_button, "click");
		} else {
			notetext.focus();
		}
	}); // onclick
	if (IS_TOUCH_SCREEN) {
		onLongPress(butt, function(event) {
			forceValue(notetext, "");
			sendEvent(submit_button, "click");
		});
	}
	butt.style.setProperty("color", "red");
	butt.style.setProperty("background-color", colours.warning);
	butt.setAttribute("title", "clear edit note");
	return butt;
}
function summarise(full_edit_note) {
	return full_edit_note.replace(/(http:\/\/|https:\/\/|www\.|[\n\r])/gi, "").substr(0, 6);
}
function waitForElements(selector, callback) {
	var waitForElements_interval_id = setInterval(function() {
		var elements = document.querySelectorAll(selector);
		if (elements.length > 0) {
			clearInterval(waitForElements_interval_id);
			callback(elements);
		}
	}, 123);
}
function onLongPress(element, callback) {
	// https://stackoverflow.com/a/60207895/2236179
	let timer;
	element.addEventListener("touchstart", function(event) {
		timer = setTimeout(function() {
			timer = null;
			callback(event);
		}, 500);
	});
	function cancel() {
		clearTimeout(timer);
	}
	element.addEventListener("touchend", cancel);
	element.addEventListener("touchcancel", cancel);
	element.addEventListener("touchmove", cancel);
}
