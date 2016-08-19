// ==UserScript==
// @name         mb. AUTO-FOCUS + KEYBOARD-SELECT
// @version      2016.8.19
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @description  musicbrainz.org: MOUSE-LESS EDITING ! Cleverly focuses fields in various musicbrainz edit pages and allows keyboard selection of relationship types as well as some release editor keyboard navigation performance features
// @homepage     http://userscripts-mirror.org/scripts/show/135547
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_AUTO-FOCUS-KEYBOARD-SELECT
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-06-08
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.mbsandbox.org/*/*/add-alias
// @match        *://*.mbsandbox.org/*/*/alias/*/delete
// @match        *://*.mbsandbox.org/*/*/alias/*/edit
// @match        *://*.mbsandbox.org/*/*/edit_annotation*
// @match        *://*.mbsandbox.org/*/*/tags*
// @match        *://*.mbsandbox.org/artist/*/edit
// @match        *://*.mbsandbox.org/artist/create
// @match        *://*.mbsandbox.org/cdtoc/*/set-durations?tracklist=*
// @match        *://*.mbsandbox.org/cdtoc/attach*
// @match        *://*.mbsandbox.org/cdtoc/move*
// @match        *://*.mbsandbox.org/cdtoc/remove*
// @match        *://*.mbsandbox.org/edit/*/cancel*
// @match        *://*.mbsandbox.org/edit/relationship/create*
// @match        *://*.mbsandbox.org/edit/relationship/create_url*
// @match        *://*.mbsandbox.org/edit/relationship/delete*
// @match        *://*.mbsandbox.org/edit/relationship/edit*
// @match        *://*.mbsandbox.org/isrc/delete*
// @match        *://*.mbsandbox.org/label/*/edit
// @match        *://*.mbsandbox.org/label/create
// @match        *://*.mbsandbox.org/recording/*/add-isrc
// @match        *://*.mbsandbox.org/recording/*/edit
// @match        *://*.mbsandbox.org/recording/*/remove-puid*
// @match        *://*.mbsandbox.org/recording/create*
// @match        *://*.mbsandbox.org/release/*/add-cover-art
// @match        *://*.mbsandbox.org/release/*/edit
// @match        *://*.mbsandbox.org/release/*/edit-cover-art/*
// @match        *://*.mbsandbox.org/release/*/remove-cover-art/*
// @match        *://*.mbsandbox.org/release/*/reorder-cover-art
// @match        *://*.mbsandbox.org/release/add*
// @match        *://*.mbsandbox.org/release-group/*/edit
// @match        *://*.mbsandbox.org/release-group/create*
// @match        *://*.mbsandbox.org/url/*/edit
// @match        *://*.mbsandbox.org/work/*/add-iswc
// @match        *://*.mbsandbox.org/work/*/edit
// @match        *://*.mbsandbox.org/work/create*
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
// @match        *://*.musicbrainz.org/edit/relationship/create*
// @match        *://*.musicbrainz.org/edit/relationship/create_url*
// @match        *://*.musicbrainz.org/edit/relationship/delete*
// @match        *://*.musicbrainz.org/edit/relationship/edit*
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
/* ---------- configuration below ---------- */
var autoFocus = true; /* focuses on most clever field http://tickets.musicbrainz.org/browse/MBS-2213 */
var selectText = false; /* selects the focused field’s text */
var keyboardSelect = true; /* allows relationship keyboard shortcuts */
var moreURLmatch = true; /* more URL patterns matching in add/edit links (blog, etc.) */
var tracklistEditorEnhancer = true; /* press UP↓/↑DOWN keys to navigate through track positions, names and lengths, auto clean‐up and format track length */
/* ---------- configuration above ---------- */
/*work in progress, don't refrain from requesting more pages and/or fields*/
function mostCleverInputToFocus() {
	var i;
	switch (self.location.pathname.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, "*").replace(/[0-9]+/, "*")) {
		case "/artist/*/add-alias":
		case "/work/*/add-alias":
		case "/label/*/add-alias":
		case "/artist/*/alias/*/edit":
		case "/label/*/alias/*/edit":
		case "/work/*/alias/*/edit":
			i = document.querySelector("input[id='id-edit-alias.name']");
			break;
		case "/artist/create":
		case "/artist/*/edit":
			i = document.querySelector("input[id='id-edit-artist.name']");
			break;
		case "/artist/*/edit_annotation":
		case "/label/*/edit_annotation":
		case "/recording/*/edit_annotation":
		case "/release/*/edit_annotation":
		case "/release-group/*/edit_annotation":
		case "/work/*/edit_annotation":
			i = document.querySelector("textarea[id='id-edit-annotation.text']");
			break;
		case "/cdtoc/attach":
		case "/cdtoc/move":
			i = (
				document.querySelector("input[id='id-filter-artist.query']")
				|| document.querySelector("input[id='id-filter-release.query']")
			);
			break;
		case "/edit/relationship/create":
		case "/edit/relationship/create-recordings":
		case "/edit/relationship/edit":
			i = document.querySelector("select[id='id-ar.link_type_id']");
			if (keyboardSelect && i) {
				var kbdsel = {
					/*artist-artist*/
						103: "m", //member
						106: ".", //(unblocking member)
						108: "a", //performs as
					/*artist-work*/
						165: "l", //lyrics
						167: "w", //write
						168: "c", //compose
						170: ".", //(unblocking compose)
					/*artist-recording*/
						148: "i", //instrument
						149: "v", //vocal
						150: "op", //orchestra perf
						151: "c", //conducted
						153: "r", //remix
						156: "p", //performs
						297: "a", //arrange
						300: "o", //orchestrate
					/*artist-release*/
						19: "ill", //illust(/design)
						20: "ph", //photo
						24: "l", //liner notes
						26: "mix", //mix
						27: "d", //design
						28: "e", //engineer
						30: "pr", //produce
						36: "rec", //record
						40: "o", //orchestrate
						42: "mas", //master
						44: "ins", //instrument
						45: "op", //orchestra perf
						46: "c", //conducted
						47: "rem", //remix
						51: "pe", //performs
						60: "v", //vocal
						295: "a", //arrange
					/*recording-work*/
						244: "m", //medley
						278: "r", //recording of
				};
				for (var relationshipType in kbdsel) if (kbdsel.hasOwnProperty(relationshipType)) {
					var option = i.querySelector("option[value='" + relationshipType + "']");
					if (option) {
						option.replaceChild(document.createTextNode(kbdsel[relationshipType].toUpperCase() + "." + option.textContent), option.firstChild);
					}
				}
			}
			break;
		case "/edit/relationship/create_url":
			i = document.querySelector("input[id='id-ar.url']");
			if (moreURLmatch) {
				var type = document.querySelector("select[id='id-ar.link_type_id']");
				if (type) {
					i.addEventListener("keyup", function(event) {
						var urlmatch = {
							199: /6109\.jp|ameblo|blog|cocolog|instagram\.com|jugem\.jp|plaza.rakuten\.co\.jp|tumblr\.com/i, //blog
							288: /sonymusic\.co\.jp|\/disco/i, //discography
						};
						for (var utype in urlmatch) if (urlmatch.hasOwnProperty(utype)) {
							var option = type.querySelector("option[value='" + utype + "']");
							if (option && i.value.match(urlmatch[utype])) {
								type.value = utype;
								break;
							}
						}
					}, false);
				}
			}
			break;
		case "/label/create":
		case "/label/*/edit":
			i = document.querySelector("input[id='id-edit-label.name']");
			break;
		case "/recording/create":
		case "/recording/*/edit":
			i = document.querySelector("input[id='id-edit-recording.name']");
			break;
		case "/recording/*/add-isrc":
			i = document.querySelector("input[id='id-add-isrc.isrc']");
			break;
		case "/release/add":
		case "/release/*/edit":
			if (tracklistEditorEnhancer) {
				var tracklist = document.querySelector("div#tracklist");
				if (tracklist) {
					tracklist.addEventListener("focus", function(event) {
						// track length automatic cleanup
						var currentCell = event.target;
						if (currentCell && currentCell.classList.contains("track-length") && currentCell.value.match(/^(NaN:aN|\?:\?\?)$/)) {
							currentCell.value = "";
						}
					}, true);
					tracklist.addEventListener("keyup", function(event) {
						// track length automatic format (MM:SS)
						var currentCell = event.target;
						var val;
						if (currentCell && currentCell.classList.contains("track-length") && (val = currentCell.value.match(/(\d+)[^\d]+(\d+)/))) {
							currentCell.value = val[1] + ":" + val[2];
						}
					}, true);
					tracklist.addEventListener("keydown", function(event) {
						// detect UP ↑ / DOWN ↓ to push cursor to upper or lower text field
						if (event.target.className.match(/pos|track-(name|length)/) && (event.keyCode == 38 || event.keyCode == 40)) {
							event.preventDefault();
							var its = tracklist.querySelectorAll("input." + event.target.className);
							var it;
							for (it = 0; it < its.length; it++) {
								if (its[it] == event.target) {
									break;
								}
							}
							it += event.keyCode == 38 ? -1 : 1;
							if (it >= 0 && it < its.length) {
								if (
									event.shiftKey && !event.target.className.match(/pos|track-length/)
									|| !event.shiftKey && event.target.className.match(/pos|track-length/)
									|| event.target.selectionStart == 0 && event.target.selectionEnd == event.target.value.length
								) {
									its[it].select();
								} else {
									if (event.target.selectionStart == event.target.selectionEnd && event.target.selectionStart == event.target.value.length) {
										its[it].selectionStart = its[it].value.length;
										its[it].selectionEnd = its[it].value.length;
									} else {
										its[it].selectionStart = event.target.selectionStart;
										its[it].selectionEnd = event.target.selectionEnd;
									}
								}
								its[it].focus();
							}
						}
					}, false);
				}
			}
			i = (
				document.querySelector("input#id-name")
				|| document.querySelector("select[id$='.format_id']")
			);
			break;
		case "/release/*/add-cover-art":
			i = document.querySelector("input[id='id-add-cover-art.comment']");
			break;
		case "/release/*/edit-cover-art/*":
			i = document.querySelector("input[id='id-edit-cover-art.comment']");
			break;
		case "/artist/*/tags":
		case "/label/*/tags":
		case "/recording/*/tags":
		case "/release/*/tags":
		case "/release-group/*/tags":
		case "/work/*/tags":
			i = document.querySelector("textarea[id='id-tag.tags']");
			break;
		case "/release-group/create":
		case "/url/*/edit":
			i = document.querySelector("input[id='id-edit-url.url']");
			break;
		case "/release-group/*/edit":
			i = document.querySelector("input[id='id-edit-release-group.name']");
			break;
		case "/work/create":
		case "/work/*/edit":
			i = document.querySelector("input[id='id-edit-work.name']");
			break;
		case "/work/*/add-iswc":
			i = document.querySelector("input[id='id-add-iswc.iswc']");
			break;
	}
	return i ? i : document.querySelector("textarea[id$='edit_note']");
}
if (autoFocus) {
	var input = mostCleverInputToFocus();
	if (input) {
		input.focus();
		if (input.getAttribute("type") == "text") {
			if (selectText) {
				input.select();
			} else {
				// leave cursor at the text end
				var valueLength = input.value.length;
				if (valueLength) {
					input.setSelectionRange(valueLength, valueLength);
				}
			}
		}
		highlight(input);
	}
}
var hli;
var rgbi = 0;
function highlight(input) {
	hli = setInterval(function() { hl(input); }, 50);
}
function hl(input) {
	input.style.setProperty("background-color", "rgb(255, 255, " + rgbi + ")");
	rgbi += 50;
	if (rgbi >= 255) {
		clearInterval(hli);
		input.style.removeProperty("background-color");
	}
}
