// ==UserScript==
// @name         mb. ELEPHANT EDITOR
// @version      2015.10.9
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_ELEPHANT-EDITOR.user.js
// @description  musicbrainz.org + acoustid.org: Remember last edit notes and dates
// @homepage     http://userscripts-mirror.org/scripts/show/94629
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey    tested sometimes
// @compatible   chromium(46)+tampermonkey   tested sometimes
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ELEPHANT-EDITOR.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_ELEPHANT-EDITOR.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-01-13
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=70394&v=2015.8.27
// @grant        none
// @include      http*://*.mbsandbox.org/*/add-alias
// @include      http*://*.mbsandbox.org/*/change-quality
// @include      http*://*.mbsandbox.org/*/create*
// @include      http*://*.mbsandbox.org/*/delete
// @include      http*://*.mbsandbox.org/*/edit
// @include      http*://*.mbsandbox.org/*/edit_annotation
// @include      http*://*.mbsandbox.org/*/merge
// @include      http*://*.mbsandbox.org/*/merge?*
// @include      http*://*.mbsandbox.org/*/move?dest=*
// @include      http*://*.mbsandbox.org/*/remove*
// @include      http*://*.mbsandbox.org/*edits*
// @include      http*://*.mbsandbox.org/artist/*/split
// @include      http*://*.mbsandbox.org/cdtoc/*
// @include      http*://*.mbsandbox.org/edit/*
// @include      http*://*.mbsandbox.org/edit/artist/add.html?*
// @include      http*://*.mbsandbox.org/edit/subscribed*
// @include      http*://*.mbsandbox.org/isrc/delete*
// @include      http*://*.mbsandbox.org/mod/*
// @include      http*://*.mbsandbox.org/recording/*/add-isrc
// @include      http*://*.mbsandbox.org/release*/*/*-cover-art*
// @include      http*://*.mbsandbox.org/release/*/edit*
// @include      http*://*.mbsandbox.org/release/add*
// @include      http*://*.mbsandbox.org/work/*/add-iswc
// @include      http*://*musicbrainz.org/*/add-alias
// @include      http*://*musicbrainz.org/*/change-quality
// @include      http*://*musicbrainz.org/*/create*
// @include      http*://*musicbrainz.org/*/delete
// @include      http*://*musicbrainz.org/*/edit
// @include      http*://*musicbrainz.org/*/edit_annotation
// @include      http*://*musicbrainz.org/*/merge
// @include      http*://*musicbrainz.org/*/merge?*
// @include      http*://*musicbrainz.org/*/move?dest=*
// @include      http*://*musicbrainz.org/*/remove*
// @include      http*://*musicbrainz.org/*edits*
// @include      http*://*musicbrainz.org/artist/*/split
// @include      http*://*musicbrainz.org/cdtoc/*
// @include      http*://*musicbrainz.org/edit/*
// @include      http*://*musicbrainz.org/edit/artist/add.html?*
// @include      http*://*musicbrainz.org/edit/subscribed*
// @include      http*://*musicbrainz.org/isrc/delete*
// @include      http*://*musicbrainz.org/mod/*
// @include      http*://*musicbrainz.org/recording/*/add-isrc
// @include      http*://*musicbrainz.org/release*/*/*-cover-art*
// @include      http*://*musicbrainz.org/release/*/edit*
// @include      http*://*musicbrainz.org/release/add*
// @include      http*://*musicbrainz.org/work/*/add-iswc
// @include      http*://acoustid.org/edit/*
// @exclude      *//*/*acoustid.org/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var textLabels = ["n-1", "n-2", "n-3", "n-4", "n-5", "n-6", "n-7", "n-8", "n-9", "n-10"]; /* maximum 10 labels empty [] will skip buttons */
var delLabel = "×";
var copyDateLabels = ["↓", "↑", "copy date"];
var setPrevNoteOnLoad = true; /* "true" will restore last edit note on load (user can choose text with buttons in either case) */
var setPrevNoteOnEditPageLoad = false; /* "true" can be troublesome if you just want to vote, believe me */
var setPrevDateOnLoad = false; /* "true" can be troublesome when you don’t need date any more and you forget to clear it */
/*funky colours*/
var cOK = "greenyellow";
var cNG = "pink";
var cWARN = "gold";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099userjs94629";
var notetextStorage = "jesus2099userjs::last_editnotetext";
var acoustid = location.href.match(/acoustid\.org\/edit\//);
var mb = !acoustid;
var editpage = (mb && location.href.match(/(\.mbsandbox|musicbrainz)\.org\/edit\/\d+($|[?#&])/));
var editsearchpage = (mb && location.href.match(/(\.mbsandbox|musicbrainz)\.org\/.+(?:edits|subscribed)/));
var re = (mb && document.querySelector("div#release-editor"));
var save = !localStorage.getItem(userjs + "forget") && (editpage || !editsearchpage);
var content = document.getElementById(mb ? "page" : "content");
var savedHeight = localStorage.getItem(userjs + "_savedHeight");
if (content) {
	var notetext = content.querySelectorAll("textarea" + (acoustid ? "" : ".edit-note, textarea#edit-note-text"));
	var reldates = [];
	if (notetext.length == 1) {
		notetext = notetext[0];
		if (acoustid) {
			notetext.style.setProperty("height", "8em");
			notetext.style.setProperty("width", "100%");
		} else {
			reldates = content.querySelectorAll("span.partial-date");
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
	var xdate = [];
	var submitbtn = content.querySelector(mb ? "form div.buttons button[type='submit'].submit.positive" : "input[type='submit']");
	if (re) submitbtn = document.querySelector("button.positive[type='button'][data-click='submitEdits']");
	if (reldates.length == 2) {
		xdate = [
			[
				"jesus2099userjs::last_editbegindate",
				reldates[0].querySelector("input[placeholder='YYYY']"),
				reldates[0].querySelector("input[placeholder='MM']"),
				reldates[0].querySelector("input[placeholder='DD']")
			],
			[
				"jesus2099userjs::last_editenddate",
				reldates[1].querySelector("input[placeholder='YYYY']"),
				reldates[1].querySelector("input[placeholder='MM']"),
				reldates[1].querySelector("input[placeholder='DD']")
			]
		];
	}
	if (notetext) {
		if (mb) {
			var carcan = getParent(notetext, "div", "half-width");
			if (carcan) {
				if (re) carcan.style.setProperty("width", "inherit");
				else notetext.parentNode.style.setProperty("width", carcan.parentNode.offsetWidth + "px");
				if (xdate[0]) {
					var fs = getParent(xdate[0][1], "fieldset");
					if (fs) {
						fs.style.setProperty("width", carcan.parentNode.offsetWidth + "px");
					}
				} 
			}
			notetext.style.setProperty("width", "98%");
			var removeLabels = ["label-id-ar.edit_note", "label-id-edit_note", "label-id-edit-artist.edit_note", "label-id-edit-label.edit_note", "label-id-edit-recording.edit_note", "label-id-edit-release-group.edit_note", "label-id-edit-url.edit_note", "label-id-edit-work.edit_note"];
			for (var l = 0; l < removeLabels.length; l++) {
				var label = document.getElementById(removeLabels[l]);
				if (label) label.parentNode.removeChild(label);
			}
		}
		var buttons = createTag("div", {a: {class: "buttons"}});
		var savecb = buttons.appendChild(createTag("label", {a: {title: "saves edit note on page unload"}, s: {backgroundColor: (save ? cOK : cWARN), minWidth: "0", margin: "0"}, e: {click: function(event) { if(event.shiftKey) { sendEvent(submitbtn, "click"); } }}}));
		savecb = savecb.appendChild(createTag("input", {a: {type: "checkbox", class: "jesus2099remember", tabindex: "-1"}, s: {display: "inline"}, e: {change: function(event) { save = this.checked; this.parentNode.style.setProperty("background-color", save ? cOK : cWARN); localStorage.setItem(userjs + "forget", save ? "" : "1"); }}}));
		savecb.checked = save;
		savecb.parentNode.appendChild(document.createTextNode(" remember  "));
		for (var ni = 0; ni < textLabels.length; ni++) {
			var butt = createButtor(textLabels[ni], "50px");
			var buttid = notetextStorage+"0"+ni;
			butt.setAttribute("id", buttid);
			var lastnotetext = localStorage.getItem(buttid);
			if (!lastnotetext) {
				butt.setAttribute("disabled", "true");
				butt.style.setProperty("opacity", ".5");
			} else {
				butt.setAttribute("title", lastnotetext);
				butt.setAttribute("value", lastnotetext.replace(/(http:\/\/|https:\/\/|www\.|[\n\r])/gi, "").substr(0, 6));
				butt.addEventListener("click", function(event) {
					notetext.value = this.getAttribute("title");
					sendEvent(notetext, "change");
					notetext.focus();
					if (event.shiftKey) { sendEvent(submitbtn, "click"); }
				}, false);/*onclick*/
			}
			buttons.appendChild(butt);
			buttons.appendChild(document.createTextNode(" "));
		}
		buttons.appendChild(createClearButtor("notetext"));
		buttons.appendChild(document.createTextNode(" ← shift+click to submit right away"));
		notetext.parentNode.insertBefore(buttons, notetext);
		var lastnotetext = localStorage.getItem(notetextStorage + "00");
		if (save && !editsearchpage && (!editpage && setPrevNoteOnLoad || editpage && setPrevNoteOnEditPageLoad) && lastnotetext && notetext.value == "") {
			notetext.value = lastnotetext;
			sendEvent(notetext, "change");
		}
		if (reldates.length == 2) {
			createClearButtor("dates");
			/*date memories*/
			for (var ixd = 0; ixd < xdate.length; ixd++) {
				var lastdatey = localStorage.getItem(xdate[ixd][0] + "_y");
				var lastdatem = localStorage.getItem(xdate[ixd][0] + "_m");
				var lastdated = localStorage.getItem(xdate[ixd][0] + "_d");
				var butt = createButtor(textLabels[0]);
				butt.setAttribute("id", xdate[ixd][0]);
				if (!lastdatey) {
					butt.setAttribute("disabled", "true");
					butt.style.setProperty("opacity", ".5");
				} else {
					butt.setAttribute("title", lastdatey+"-"+lastdatem+"-"+lastdated);
					butt.setAttribute("value", butt.getAttribute("title").replace(/-null/g, ""));
					butt.addEventListener("click", function(event) {
						var xdymd = this.getAttribute("title").match(/^(.*)-(.*)-(.*)$/);
						for (var iixd = 0, acts = ["YYYY", "MM", "DD"]; iixd < 3; iixd++) {
							var input = this.parentNode.querySelector("input[placeholder='" + acts[iixd] + "']");
							input.value = xdymd[iixd + 1].match(/^\d+$/);
							sendEvent(input, "change");
							if (iixd == 0) focusYYYY(input);
						}
						if (event.shiftKey) {
							sendEvent(this.parentNode.getElementsByTagName("input")[3], "click");
						}
					}, false);/*onclick*/
				}
				xdate[ixd][1].parentNode.setAttribute("title", "shift+click to change both dates at once");
				addAfter(butt, xdate[ixd][3]);
				addAfter(document.createTextNode(" "), xdate[ixd][3]);
				if (setPrevDateOnLoad && localStorage.getItem(xdate[ixd][0]) == "1") {
					sendEvent(document.getElementById(xdate[ixd][0]), "click");
				}
			}
			/*copy dates*/
			for (var icd = 0; icd < 2; icd++) {
				var buttcd = createButtor(copyDateLabels[icd]);
				buttcd.setAttribute("title", copyDateLabels[2]);
				buttcd.addEventListener("click", function(event) {
					var src = copyDateLabels.indexOf(this.getAttribute("value"));
					for (var icdymd = 1; icdymd < 4; icdymd++) {
						xdate[src == 1 ? 0 : 1][icdymd].value = xdate[src][icdymd].value;
						sendEvent(xdate[src == 1 ? 0 : 1][icdymd], "change");
					}
					focusYYYY(xdate[src][1]);
				}, false);/*onclick*/
				addAfter(buttcd, xdate[icd][3]);
				addAfter(document.createTextNode(" "), xdate[icd][3]);
			}
		}
	}
	if (location.href.match(/edit-relationships$/)) {
		var sub = document.querySelector("div#content.rel-editor > form > div.row.no-label.buttons > button.submit.positive[type='submit']");
		if (sub) {
			sub.addEventListener("click", saveNote, false);
		}
	}
	self.addEventListener("unload", saveNote, false);
}
function saveNote() {
	if (notetext) {
		if (textLabels.length > 0) {
			var thisnotetext = notetext.value.replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "").replace(/\n?(\s*—[\s\S]+)?Merging\sinto\soldest\s\[MBID\]\s\([\'\d,\s←+]+\)\.(\n|$)/g, "").replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "");
			var ls00 = localStorage.getItem(notetextStorage + "00");
			if (save && thisnotetext != ls00) {
				if (ls00 != "") {
					for (var isav = textLabels.length - 1; isav > 0 ; isav--) {
						var prev = localStorage.getItem(notetextStorage + "0" + (isav - 1));
						if (prev) {
							localStorage.setItem(notetextStorage + "0" + isav, localStorage.getItem(notetextStorage + "0" + (isav - 1)));
						}
					}
				}
				localStorage.setItem(notetextStorage + "00", thisnotetext);
			}
		}
		if (reldates.length == 2) {
			for (var ixd = 0; ixd < xdate.length; ixd++) {
				var ndy = xdate[ixd][1].value;
				var ndm = xdate[ixd][2].value;
				var ndd = xdate[ixd][3].value;
				if (ndy.match(/^\d{4}$/)) {
					localStorage.setItem(xdate[ixd][0], "1");
					localStorage.setItem(xdate[ixd][0] + "_y", ndy);
					if (ndm.match(/^\d{1,2}$/)) {
						localStorage.setItem(xdate[ixd][0] + "_m", ndm);
						if (ndd.match(/^\d{1,2}$/)) {
							localStorage.setItem(xdate[ixd][0] + "_d", ndd);
						} else {
							localStorage.removeItem(xdate[ixd][0] + "_d");
						}
					} else {
						localStorage.removeItem(xdate[ixd][0] + "_m");
						localStorage.removeItem(xdate[ixd][0] + "_d");
					}
				}
				else if (ndy.trim() == "") {
					localStorage.setItem(xdate[ixd][0], "0");
				}
			}
		}
	}
}
function createButtor(label, width) {
	var butt = createTag("input", {a: {type: "button", value: label, tabindex: "-1", class: "styled-button"}, s: {display: "inline", padding: "2px", float: "none"}});
	if (width) { butt.style.setProperty("width", width); }
	return butt;
}
function createClearButtor(input) {
	switch (input) {
		case "notetext":
			var butt = createButtor(delLabel, "25px");
			butt.addEventListener("click", function(event) {
				notetext.value = "";
				sendEvent(notetext, "change");
				notetext.focus();
				if (event.shiftKey) { sendEvent(submitbtn, "click"); }
			}, false);/*onclick*/
			butt.style.setProperty("color", "red");
			butt.style.setProperty("background-color", cWARN);
			return butt;
			break;
		case "dates":
			for (var i = 0; i < 2; i++) {
				var butt = createButtor(delLabel, "25px");
				butt.setAttribute("id", userjs + "deldate" + i);
				butt.addEventListener("click", function(event) {
					var id = this.getAttribute("id").charAt((userjs + "deldate").length);
					for (var nii = 1; nii < 4; nii++) {
						xdate[id][nii].value = "";
						sendEvent(xdate[id][nii], "change");
					}
					if (event.shiftKey) { sendEvent(document.getElementById(userjs + "deldate" + (id == 0 ? 1 : 0)), "click"); }
					focusYYYY(xdate[id][1]);
					event.cancelBubble = true;
					if (event.stopPropagation) event.stopPropagation();
				}, false);/*onclick*/
				addAfter(butt, xdate[i][3]);
				addAfter(document.createTextNode(" "), xdate[i][3]);
			}
			break;
	}
}
function focusYYYY(input) {
	if(input.style.getPropertyValue("display") == "none" && input.nextSibling.getAttribute("placeholder") == "YYY+")/*EASY_DATE*/
		input.nextSibling.focus();
	else
		input.focus();
}
