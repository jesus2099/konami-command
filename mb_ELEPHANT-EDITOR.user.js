// ==UserScript==
// @name         mb. ELEPHANT EDITOR
// @version      2023.3.3
// @description  musicbrainz.org + acoustid.org: Remember last edit notes
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ELEPHANT-EDITOR
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ELEPHANT-EDITOR.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-01-13; https://web.archive.org/web/20131103163403/userscripts.org/scripts/show/94629 / https://web.archive.org/web/20141011084017/userscripts-mirror.org/scripts/show/94629
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/0cbc1a2a5da75b123536b5451ed87f973c74a54a/lib/SUPER.js?version=2023.2.19
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
// @match        *://*.musicbrainz.org/isrc/delete*
// @match        *://*.musicbrainz.org/mod/*
// @match        *://*.musicbrainz.org/recording/*/add-isrc
// @match        *://*.musicbrainz.org/release*/*/*-cover-art*
// @match        *://*.musicbrainz.org/release/*/edit*
// @match        *://*.musicbrainz.org/release/add*
// @match        *://*.musicbrainz.org/work/*/add-iswc
// @match        *://acoustid.org/edit/*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var textLabels = ["n-1", "n-2", "n-3", "n-4", "n-5", "n-6", "n-7", "n-8", "n-9", "n-10"]; /* maximum 10 labels empty [] will skip buttons */
var delLabel = "×";
var setPrevNoteOnLoad = true; /* "true" will restore last edit note on load (user can choose text with buttons in either case) */
var setPrevNoteOnEditPageLoad = false; /* "true" can be troublesome if you just want to vote, believe me */
/* funky colours */
var cOK = "greenyellow";
// var cNG = "pink";
var cWARN = "gold";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099userjs94629";
var notetextStorage = "jesus2099userjs::last_editnotetext";
var acoustid = self.location.href.match(/acoustid\.org\/edit\//);
var mb = !acoustid;
var editpage = (mb && self.location.href.match(/musicbrainz\.org\/edit\/\d+($|[?#&])/));
var editsearchpage = (mb && self.location.href.match(/musicbrainz\.org\/.+(?:edits|subscribed)/));
var re = (mb && document.querySelector("div#release-editor"));
var save = !localStorage.getItem(userjs + "forget") && (editpage || !editsearchpage);
var content = document.querySelector(mb ? "#page" : "div.content");
var savedHeight = localStorage.getItem(userjs + "_savedHeight");
var notetext;
var submitbtn;
wait_for_elements((mb ? "#page" : "div.content") + " textarea" + (mb ? ".edit-note, textarea#edit-note-text" : ""), init);
function init(edit_notes) {
	if (edit_notes.length === 1) {
		notetext = edit_notes[0];
		if (acoustid) {
			notetext.style.setProperty("height", "8em");
			notetext.style.setProperty("width", "100%");
		}
		if (savedHeight) {
			notetext.style.setProperty("height", savedHeight + "px");
			addAfter(createTag("div", {s: {textAlign: "right"}}, createTag("a", {e: {click: function(event) {
				localStorage.removeItem(userjs + "_savedHeight");
				this.parentNode.replaceChild(document.createTextNode("Size reset! It will take effect at next page load."), this);
			}}}, "↖Reset size")), notetext);
		}
		notetext.addEventListener("mouseup", function(event) {
			if (this.offsetHeight != savedHeight) {
				localStorage.setItem(userjs + "_savedHeight", this.offsetHeight);
			}
		});
	} else { notetext = false; }
	submitbtn = content.querySelector(mb ? "form div.buttons button[type='submit'].submit.positive" : "input[type='submit']");
	if (re) submitbtn = document.querySelector("button.positive[type='button'][data-click='submitEdits']");
	if (notetext) {
		if (mb) {
			var carcan = getParent(notetext, "div", "half-width");
			if (carcan) {
				if (re) carcan.style.setProperty("width", "inherit");
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
		var savecb = buttons.appendChild(createTag("label", {a: {title: "saves edit note on page unload"}, s: {backgroundColor: (save ? cOK : cWARN), minWidth: "0", margin: "0"}, e: {click: function(event) { if (event.shiftKey) { sendEvent(submitbtn, "click"); } }}}));
		savecb = savecb.appendChild(createTag("input", {a: {type: "checkbox", class: "jesus2099remember", tabindex: "-1"}, s: {display: "inline"}, e: {change: function(event) { save = this.checked; this.parentNode.style.setProperty("background-color", save ? cOK : cWARN); localStorage.setItem(userjs + "forget", save ? "" : "1"); }}}));
		savecb.checked = save;
		savecb.parentNode.appendChild(document.createTextNode(" remember \u00a0"));
		for (var ni = 0; ni < textLabels.length; ni++) {
			let butt = createButtor(textLabels[ni], "50px");
			let buttid = notetextStorage + "0" + ni;
			butt.setAttribute("id", buttid);
			let lastnotetext = localStorage.getItem(buttid);
			if (!lastnotetext) {
				butt.setAttribute("disabled", "true");
				butt.style.setProperty("opacity", ".5");
			} else {
				butt.setAttribute("title", lastnotetext);
				butt.setAttribute("value", lastnotetext.replace(/(http:\/\/|https:\/\/|www\.|[\n\r])/gi, "").substr(0, 6));
				butt.addEventListener("click", function(event) {
					set_react_value(notetext, this.getAttribute("title"));
					notetext.focus();
					if (event.shiftKey) { sendEvent(submitbtn, "click"); }
				}, false); // onclick
			}
			buttons.appendChild(butt);
			buttons.appendChild(document.createTextNode(" "));
		}
		buttons.appendChild(createClearButtor());
		buttons.appendChild(document.createTextNode(" ← shift+click to submit right away"));
		notetext.parentNode.insertBefore(buttons, notetext);
		let lastnotetext = localStorage.getItem(notetextStorage + "00");
		if (save && !editsearchpage && (!editpage && setPrevNoteOnLoad || editpage && setPrevNoteOnEditPageLoad) && lastnotetext && notetext.value == "") {
			set_react_value(notetext, lastnotetext);
		}
	}
	if (self.location.href.match(/edit-relationships$/)) {
		var sub = document.querySelector("div#content.rel-editor > form > div.row.no-label.buttons > button.submit.positive[type='submit']");
		if (sub) {
			sub.addEventListener("click", saveNote, false);
		}
	} else if (re) {
		submitbtn.addEventListener("click", saveNote, false);
	}
}
function saveNote() {
	if (notetext) {
		if (textLabels.length > 0) {
			var thisnotetext = notetext.value.replace(/\u00a0—\u00a0[\r\n]{1,2}Merging into oldest \[MBID\] \(['\d,\s←+]+\)\./g, "").trim(); // linked in mb_MERGE-HELPOR-2.user.js
			var ls00 = localStorage.getItem(notetextStorage + "00");
			if (save && thisnotetext != ls00) {
				if (ls00 != "") {
					for (var isav = textLabels.length - 1; isav > 0; isav--) {
						var prev = localStorage.getItem(notetextStorage + "0" + (isav - 1));
						if (prev) {
							localStorage.setItem(notetextStorage + "0" + isav, localStorage.getItem(notetextStorage + "0" + (isav - 1)));
						}
					}
				}
				localStorage.setItem(notetextStorage + "00", thisnotetext);
			}
		}
	}
}
function createButtor(label, width) {
	let butt = createTag("input", {a: {type: "button", value: label, tabindex: "-1", class: "styled-button"}, s: {display: "inline", padding: "2px", float: "none"}});
	if (width) { butt.style.setProperty("width", width); }
	return butt;
}
function createClearButtor() {
	let butt = createButtor(delLabel, "25px");
	butt.addEventListener("click", function(event) {
		set_react_value(notetext, "");
		notetext.focus();
		if (event.shiftKey) { sendEvent(submitbtn, "click"); }
	}, false); // onclick
	butt.style.setProperty("color", "red");
	butt.style.setProperty("background-color", cWARN);
	return butt;
}
function wait_for_elements(selector, callback) {
	var wait_for_elements_interval_id = setInterval(function() {
		var elements = document.querySelectorAll(selector);
		if (elements.length > 0) {
			clearInterval(wait_for_elements_interval_id);
			callback(elements);
		}
	}, 123);
}
