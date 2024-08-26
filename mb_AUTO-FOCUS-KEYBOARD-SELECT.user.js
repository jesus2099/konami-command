// ==UserScript==
// @name         mb. AUTO-FOCUS + KEYBOARD-SELECT
// @version      2024.8.26.2058
// @description  musicbrainz.org: MOUSE-LESS EDITING! Cleverly focus and refocus fields in various MusicBrainz edit pages and tracklist Up Down key navigation
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_AUTO-FOCUS-KEYBOARD-SELECT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-06-08; https://web.archive.org/web/20131103163357/userscripts.org/scripts/show/135547 / https://web.archive.org/web/20141011084007/userscripts-mirror.org/scripts/show/135547
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/(recording|release)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/delete$/
// @match        *://*.musicbrainz.org/*/*/add-alias
// @match        *://*.musicbrainz.org/*/*/alias/*/delete
// @match        *://*.musicbrainz.org/*/*/alias/*/edit
// @match        *://*.musicbrainz.org/*/*/edit_annotation*
// @match        *://*.musicbrainz.org/*/*/tags*
// @match        *://*.musicbrainz.org/artist/*/edit
// @match        *://*.musicbrainz.org/artist/create
// @match        *://*.musicbrainz.org/cdtoc/*/set-durations?tracklist=*
// @match        *://*.musicbrainz.org/cdtoc/attach*
// @match        *://*.musicbrainz.org/cdtoc/move*
// @match        *://*.musicbrainz.org/cdtoc/remove*
// @match        *://*.musicbrainz.org/edit/*/cancel*
// @match        *://*.musicbrainz.org/edit-note/*/modify
// @match        *://*.musicbrainz.org/isrc/delete*
// @match        *://*.musicbrainz.org/label/*/edit
// @match        *://*.musicbrainz.org/label/create
// @match        *://*.musicbrainz.org/recording/*/add-isrc
// @match        *://*.musicbrainz.org/recording/*/edit
// @match        *://*.musicbrainz.org/recording/*/remove-puid*
// @match        *://*.musicbrainz.org/recording/create*
// @match        *://*.musicbrainz.org/release/*/add-cover-art
// @match        *://*.musicbrainz.org/release/*/edit
// @match        *://*.musicbrainz.org/release/*/edit-cover-art/*
// @match        *://*.musicbrainz.org/release/*/remove-cover-art/*
// @match        *://*.musicbrainz.org/release/*/reorder-cover-art
// @match        *://*.musicbrainz.org/release/add*
// @match        *://*.musicbrainz.org/release-group/*/edit
// @match        *://*.musicbrainz.org/release-group/create*
// @match        *://*.musicbrainz.org/url/*/edit
// @match        *://*.musicbrainz.org/work/*/add-iswc
// @match        *://*.musicbrainz.org/work/*/edit
// @match        *://*.musicbrainz.org/work/create*
// @run-at       document-end
// ==/UserScript==
"use strict";
// focus most clever field http://tickets.musicbrainz.org/browse/MBS-2213
var input = getMostCleverInputToFocus();
if (input) {
	input.focus();
	if (input.getAttribute("type") == "text") {
		// Put caret at the text end
		var value_length = input.value.length;
		if (value_length) {
			input.setSelectionRange(value_length, value_length);
		}
	}
	highlight(input);
}
// re‐focus input field after related tool click http://tickets.musicbrainz.org/browse/MBS-7321
// TODO: Maybe remove if bad good idea https://tickets.metabrainz.org/browse/MBS-7321?focusedId=67924&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-67924
var tools = document.querySelectorAll("input[class*='with-guesscase'] ~ button:not(.guesscase-options)");
for (var t = 0; t < tools.length; t++) {
	tools[t].addEventListener("click", function(event) {
		var related_input = this.parentNode.querySelector("input");
		related_input.focus();
		highlight(related_input);
	});
}
function addTracklistUpDownKeyNavigation() {
	// press UP↓/↑DOWN keys to navigate through track positions, names and lengths, auto clean‐up and format track length
	var tracklist = document.querySelector("#tracklist");
	if (tracklist) {
		tracklist.addEventListener("keydown", function(event) {
			// detect UP ↑ / DOWN ↓ to push cursor to upper or lower text field
			var class_name_match = event.target.className.match(/(?:\s|^)(pos|track-(name|length))(?:\s|$)/);
			if (class_name_match && (event.key == "ArrowUp" || event.key == "ArrowDown")) {
				event.preventDefault();
				var same_class_inputs = tracklist.querySelectorAll("input." + class_name_match[1]);
				var index;
				for (index = 0; index < same_class_inputs.length; index++) {
					if (same_class_inputs[index] == event.target) {
						break;
					}
				}
				index += event.key == "ArrowUp" ? -1 : 1;
				if (index >= 0 && index < same_class_inputs.length) {
					if (
						event.shiftKey && !event.target.className.match(/pos|track-length/)
						|| !event.shiftKey && event.target.className.match(/pos|track-length/)
						|| event.target.selectionStart === 0 && event.target.selectionEnd === event.target.value.length
					) {
						// select all
						same_class_inputs[index].select();
					} else {
						if (event.target.selectionStart == event.target.selectionEnd && event.target.selectionStart == event.target.value.length) {
							// place the caret at the end
							same_class_inputs[index].selectionStart = same_class_inputs[index].value.length;
							same_class_inputs[index].selectionEnd = same_class_inputs[index].value.length;
						} else {
							// keep same selection or caret position
							same_class_inputs[index].selectionStart = event.target.selectionStart;
							same_class_inputs[index].selectionEnd = event.target.selectionEnd;
						}
					}
					// activate the input
					same_class_inputs[index].focus();
				}
			}
		}, false);
	}
}
function getMostCleverInputToFocus() {
	var best_input;
	switch (location.pathname.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, "*").replace(/[0-9]+/, "*")) {
		case "/artist/*/add-alias":
		case "/work/*/add-alias":
		case "/label/*/add-alias":
		case "/artist/*/alias/*/edit":
		case "/label/*/alias/*/edit":
		case "/work/*/alias/*/edit":
			best_input = document.querySelector("input[id='id-edit-alias.name']");
			break;
		case "/artist/create":
		case "/artist/*/edit":
			best_input = document.querySelector("input[id='id-edit-artist.name']");
			break;
		case "/artist/*/edit_annotation":
		case "/label/*/edit_annotation":
		case "/recording/*/edit_annotation":
		case "/release/*/edit_annotation":
		case "/release-group/*/edit_annotation":
		case "/work/*/edit_annotation":
			best_input = document.querySelector("textarea[id='id-edit-annotation.text']");
			break;
		case "/cdtoc/attach":
		case "/cdtoc/move":
			best_input = (
				document.querySelector("input[id='id-filter-release.query']")
				|| document.querySelector("input[id='id-filter-artist.query']")
			);
			break;
		case "/label/create":
		case "/label/*/edit":
			best_input = document.querySelector("input[id='id-edit-label.name']");
			break;
		case "/recording/create":
		case "/recording/*/edit":
			best_input = document.querySelector("input[id='id-edit-recording.name']");
			break;
		case "/recording/*/add-isrc":
			best_input = document.querySelector("input[id='id-add-isrc.isrc']");
			break;
		case "/release/add":
		case "/release/*/edit":
			best_input = (
				document.querySelector("input#name")
			);
			addTracklistUpDownKeyNavigation();
			break;
		case "/release/*/add-cover-art":
			best_input = document.querySelector("input[id='id-add-cover-art.comment']");
			break;
		case "/release/*/edit-cover-art/*":
			best_input = document.querySelector("input[id='id-edit-cover-art.comment']");
			break;
		case "/artist/*/tags":
		case "/label/*/tags":
		case "/recording/*/tags":
		case "/release/*/tags":
		case "/release-group/*/tags":
		case "/work/*/tags":
			best_input = document.querySelector("textarea[id='id-tag.tags']");
			break;
		case "/url/*/edit":
			best_input = document.querySelector("input[id='id-edit-url.url']");
			break;
		case "/release-group/create":
		case "/release-group/*/edit":
			best_input = document.querySelector("input[id='id-edit-release-group.name']");
			break;
		case "/work/create":
		case "/work/*/edit":
			best_input = document.querySelector("input[id='id-edit-work.name']");
			break;
		case "/work/*/add-iswc":
			best_input = document.querySelector("input[id='id-add-iswc.iswc']");
			break;
	}
	return best_input ? best_input : document.querySelector("textarea[id*='edit_note'], textarea[id*='edit-note']");
}
// the focus animation
var interval, blue;
function highlight(input) {
	blue = 0;
	interval = setInterval(function() { hl(input); }, 50);
}
function hl(input) {
	input.style.setProperty("background-color", "rgb(255, 255, " + blue + ")");
	blue += 50;
	if (blue >= 255) {
		clearInterval(interval);
		input.style.removeProperty("background-color");
	}
}
