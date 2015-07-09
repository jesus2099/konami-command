// ==UserScript==
// @name         mb. AUTO-FOCUS + KEYBOARD-SELECT
// @version      2015.6.4.1626
// @description  musicbrainz.org: MOUSE-LESS EDITING ! Cleverly focuses fields in various musicbrainz edit pages and allows keyboard selection of relationship types as well as some release editor keyboard navigation performance features
// @homepage     http://userscripts-mirror.org/scripts/show/135547
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_AUTO-FOCUS-KEYBOARD-SELECT.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-06-08
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*/*/add-alias
// @include      http*://*musicbrainz.org/*/*/alias/*/delete
// @include      http*://*musicbrainz.org/*/*/alias/*/edit
// @include      http*://*musicbrainz.org/*/*/edit_annotation*
// @include      http*://*musicbrainz.org/*/*/tags*
// @include      http*://*musicbrainz.org/artist/*/edit
// @include      http*://*musicbrainz.org/artist/create
// @include      http*://*musicbrainz.org/cdtoc/*/set-durations?tracklist=*
// @include      http*://*musicbrainz.org/cdtoc/attach*
// @include      http*://*musicbrainz.org/cdtoc/move*
// @include      http*://*musicbrainz.org/cdtoc/remove*
// @include      http*://*musicbrainz.org/edit/*/cancel*
// @include      http*://*musicbrainz.org/edit/relationship/create*
// @include      http*://*musicbrainz.org/edit/relationship/create_url*
// @include      http*://*musicbrainz.org/edit/relationship/delete*
// @include      http*://*musicbrainz.org/edit/relationship/edit*
// @include      http*://*musicbrainz.org/isrc/delete*
// @include      http*://*musicbrainz.org/label/*/edit
// @include      http*://*musicbrainz.org/label/create
// @include      http*://*musicbrainz.org/recording/*/add-isrc
// @include      http*://*musicbrainz.org/recording/*/edit
// @include      http*://*musicbrainz.org/recording/*/remove-puid*
// @include      http*://*musicbrainz.org/recording/create*
// @include      http*://*musicbrainz.org/release/*/add-cover-art
// @include      http*://*musicbrainz.org/release/*/edit
// @include      http*://*musicbrainz.org/release/*/edit-cover-art/*
// @include      http*://*musicbrainz.org/release/*/remove-cover-art/*
// @include      http*://*musicbrainz.org/release/*/reorder-cover-art
// @include      http*://*musicbrainz.org/release/add*
// @include      http*://*musicbrainz.org/release-group/*/edit
// @include      http*://*musicbrainz.org/release-group/create*
// @include      http*://*musicbrainz.org/url/*/edit
// @include      http*://*musicbrainz.org/work/*/add-iswc
// @include      http*://*musicbrainz.org/work/*/edit
// @include      http*://*musicbrainz.org/work/create*
// @run-at       document-end
// ==/UserScript==
(function(){
/* ---------- configuration below ---------- */
const autoFocus = true; /* focuses on most clever field http://tickets.musicbrainz.org/browse/MBS-2213 */
const selectText = false; /* selects the focused field’s text */
const keyboardSelect = true; /* allows relationship keyboard shortcuts */
const moreURLmatch = true; /* more URL patterns matching in add/edit links (blog, etc.) */
const experimentalTracklistEditorKeyboardNavUpDown = true; /* press UP↓/↑DOWN keys to navigate through track positions, names and lengths */
/* ---------- configuration above ---------- */
	/*work in progress, don't refrain from requesting more pages and/or fields*/
	function what() {
		var w;
		switch (location.pathname.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, "*").replace(/[0-9]+/, "*")) {
			case "/artist/*/add-alias":
			case "/work/*/add-alias":
			case "/label/*/add-alias":
			case "/artist/*/alias/*/edit":
			case "/label/*/alias/*/edit":
			case "/work/*/alias/*/edit":
				w = document.querySelector("input[id='id-edit-alias.name']");
				break;
			case "/artist/create":
			case "/artist/*/edit":
				w = document.querySelector("input[id='id-edit-artist.name']");
				break;
			case "/artist/*/edit_annotation":
			case "/label/*/edit_annotation":
			case "/recording/*/edit_annotation":
			case "/release/*/edit_annotation":
			case "/release-group/*/edit_annotation":
			case "/work/*/edit_annotation":
				w = document.querySelector("textarea[id='id-edit-annotation.text']");
				break;
			case "/cdtoc/attach":
			case "/cdtoc/move":
				w = (
					document.querySelector("input[id='id-filter-artist.query']") ||
					document.querySelector("input[id='id-filter-release.query']")
				);
				break;
			case "/edit/relationship/create":
			case "/edit/relationship/create-recordings":
			case "/edit/relationship/edit":
				w = document.querySelector("select[id='id-ar.link_type_id']");
				if (keyboardSelect && w) {
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
					for (var rtype in kbdsel) {
						if (kbdsel.hasOwnProperty(rtype) && (opt = w.querySelector("option[value='"+rtype+"']"))) {
							opt.replaceChild(document.createTextNode(kbdsel[rtype].toUpperCase()+"."+opt.textContent), opt.firstChild);
						}
					}
				}
				break;
			case "/edit/relationship/create_url":
				w = document.querySelector("input[id='id-ar.url']");
				if (moreURLmatch && (type = document.querySelector("select[id='id-ar.link_type_id']"))) {
					w.addEventListener("keyup", function(e) {
						var urlmatch = {
							199: /6109\.jp|ameblo|blog|cocolog|instagram\.com|jugem\.jp|plaza.rakuten\.co\.jp|tumblr\.com/i, //blog
							288: /sonymusic\.co\.jp|\/disco/i, //discography
						};
						for (var utype in urlmatch) {
							if (urlmatch.hasOwnProperty(utype) && (opt = type.querySelector("option[value='"+utype+"']")) && w.value.match(urlmatch[utype])) {
								type.value = utype;
								break;
							}
						}
					}, false);
				}
				break;
			case "/label/create":
			case "/label/*/edit":
				w = document.querySelector("input[id='id-edit-label.name']");
				break;
			case "/recording/create":
			case "/recording/*/edit":
				w = document.querySelector("input[id='id-edit-recording.name']");
				break;
			case "/recording/*/add-isrc":
				w = document.querySelector("input[id='id-add-isrc.isrc']");
				break;
			case "/release/add":
			case "/release/*/edit":
				if (experimentalTracklistEditorKeyboardNavUpDown && (atl = document.querySelector("div#tracklist"))) {
					atl.addEventListener("focus", function(e) {
						var tgt = e.target;
						if (tgt && tgt.classList.contains("track-length") && tgt.value.match(/^(NaN:aN|\?:\?\?)$/)) {
							tgt.value = "";
						}
					}, true);
					atl.addEventListener("keyup", function(e) {
						var tgt = e.target;
						var val;
						if (tgt && tgt.classList.contains("track-length") && (val = tgt.value.match(/(\d+)[^\d]+(\d+)/))) {
							tgt.value = val[1]+":"+val[2];
						}
					}, true);
					atl.addEventListener("keydown", function(e) {
						if (e.target.className.match(/pos|track-(name|length)/) && (e.keyCode == 38 || e.keyCode == 40)) {
							e.preventDefault();
							var its = atl.querySelectorAll("input."+e.target.className);
							var it;
							for (it=0; it<its.length; it++) {
								if (its[it] == e.target) break;
							}
							it += e.keyCode==38?-1:1;
							if (it >= 0 && it < its.length) {
								if (
									e.shiftKey && !e.target.className.match(/pos|track-length/) ||
									!e.shiftKey && e.target.className.match(/pos|track-length/) ||
									e.target.selectionStart == 0 && e.target.selectionEnd == e.target.value.length
								) {
									its[it].select();
								}
								else {
									if (e.target.selectionStart == e.target.selectionEnd && e.target.selectionStart == e.target.value.length) {
										its[it].selectionStart = its[it].value.length;
										its[it].selectionEnd = its[it].value.length;
									}
									else {
										its[it].selectionStart = e.target.selectionStart;
										its[it].selectionEnd = e.target.selectionEnd;
									}
								}
								its[it].focus();
							}
						}
					}, false);
				}
				w = (
					document.querySelector("input#id-name") || 
					document.querySelector("select[id$='.format_id']")
				);
				break;
			case "/release/*/add-cover-art":
				w = document.querySelector("input[id='id-add-cover-art.comment']");
				break;
			case "/release/*/edit-cover-art/*":
				w = document.querySelector("input[id='id-edit-cover-art.comment']");
				break;
			case "/artist/*/tags":
			case "/label/*/tags":
			case "/recording/*/tags":
			case "/release/*/tags":
			case "/release-group/*/tags":
			case "/work/*/tags":
				w = document.querySelector("textarea[id='id-tag.tags']");
				break;
			case "/release-group/create":
			case "/url/*/edit":
				w = document.querySelector("input[id='id-edit-url.url']");
				break;
			case "/release-group/*/edit":
				w = document.querySelector("input[id='id-edit-release-group.name']");
				break;
			case "/work/create":
			case "/work/*/edit":
				w = document.querySelector("input[id='id-edit-work.name']");
				break;
			case "/work/*/add-iswc":
				w = document.querySelector("input[id='id-add-iswc.iswc']");
				break;
		}
		return w?w:document.querySelector("textarea[id$='edit_note']");
	}
	if (w = what()) {
		if (autoFocus) {
			w.focus();
			if (w.getAttribute("type") == "text" && (wlen = w.value.length)) {
				if (selectText) { w.select(); }
				else { w.setSelectionRange(wlen, wlen); }
			}
			highlight(w);
		}
	}
	var hli;
	var rgbi = 0;
	function highlight(f) {
		hli = setInterval(function(){hl(f)}, 50);
	}
	function hl(f) {
		f.style.setProperty("background-color", "rgb(255,255,"+rgbi+")");
		rgbi += 50;
		if (rgbi >= 255) {
			clearInterval(hli);
			f.style.removeProperty("background-color");
		}
	}
})();