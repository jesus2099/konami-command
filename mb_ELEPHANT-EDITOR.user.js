// ==UserScript==
// @name         mb. ELEPHANT EDITOR
// @version      2014.0325.1057
// @description  musicbrainz.org + acoustid.org: Remember last edit notes and dates
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_ELEPHANT-EDITOR.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_ELEPHANT-EDITOR.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
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
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @include      http*://*musicbrainz.org/release/add*
// @include      http*://*musicbrainz.org/work/*/add-iswc
// @include      http*://acoustid.org/edit/*
// @exclude      http*://classic.musicbrainz.org*
// @run-at       document-end
// ==/UserScript==
(function(){
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var textLabels = ["n-1", "n-2", "n-3", "n-4", "n-5", "n-6", "n-7", "n-8", "n-9", "n-10"]; /* maximum 10 labels empty [] will skip buttons */
var delLabel = "\u00d7";
var copyDateLabels = ["\u2193", "\u2191", "copy date"];
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
var acoustid = self.location.href.match(/acoustid\.org\/edit\//);
var mb = !acoustid;
var editpage = (mb && self.location.href.match(/musicbrainz\.org\/edit\/\d+($|[?#&])/));
var editsearchpage = (mb && self.location.href.match(/musicbrainz\.org\/.+(?:edits|subscribed)/));
var re = (mb && document.querySelector("div#release-editor"));
var save = editpage||editsearchpage?false:true;
var content = document.getElementById(mb?"page":"content");
if (content) {
	var notetext = content.querySelectorAll("textarea"+(acoustid?"":".edit-note, textarea#edit-note-text"));
	var reldates = [];
	if (notetext.length == 1) {
		notetext = notetext[0];
		if (acoustid) {
			notetext.style.height = "8em";
			notetext.style.width = "100%";
		} else {
			reldates = content.querySelectorAll("span.partial-date");
		}
	} else { notetext = false; }
	var xdate = [];
	var submitbtn = content.querySelector(mb?"form div.buttons button[type='submit'].submit.positive":"input[type='submit']");
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
			if (carcan = getParent(notetext, "div", "half-width")) {
				if (re) carcan.style.setProperty("width", "inherit");
				else notetext.parentNode.style.width = carcan.parentNode.offsetWidth+"px";
				if (xdate[0] && (fs = getParent(xdate[0][1], "fieldset"))) { fs.style.width = carcan.parentNode.offsetWidth+"px"; }
			}
			notetext.style.width = "98%";
			var debilos = ["label-id-ar.edit_note", "label-id-edit_note", "label-id-edit-artist.edit_note", "label-id-edit-label.edit_note", "label-id-edit-recording.edit_note", "label-id-edit-release-group.edit_note", "label-id-edit-url.edit_note", "label-id-edit-work.edit_note"];
			for (var neuneu=0; neuneu<debilos.length; neuneu++) {
				if (ducon = document.getElementById(debilos[neuneu])) { ducon.parentNode.removeChild(ducon); }
			}
		}
		var savecb = notetext.parentNode.insertBefore(createTag("label", {"title":"saves edit note on page unload"}, {"backgroundColor":(save?cOK:cWARN),"cssFloat":"none","margin":"0"}, {"click":function(e){if(e.shiftKey){sendEvent(submitbtn, "click");}}}), notetext);
		savecb = savecb.appendChild(createTag("input", {"type":"checkbox","tabindex":"-1"}, {"display":"inline"}, {"change":function(e){save=this.checked;this.parentNode.style.backgroundColor=save?cOK:cWARN;}}));
		savecb.checked = save;
		savecb.parentNode.appendChild(document.createTextNode("remember "));
		notetext.parentNode.insertBefore(document.createTextNode(" "), notetext);
		if (textLabels.length > 0) {
			for (var ni = 0; ni < textLabels.length; ni++) {
				var butt = createButtor(textLabels[ni], "50px");
				var buttid = notetextStorage+"0"+ni;
				butt.setAttribute("id", buttid);
				var lastnotetext = localStorage.getItem(buttid);
				if (!lastnotetext) {
					butt.setAttribute("disabled", "true");
					butt.style.opacity = ".5";
				}
				else {
					butt.setAttribute("title", lastnotetext);
					butt.setAttribute("value", lastnotetext.replace(/(http:\/\/|https:\/\/|www\.|[\n\r])/gi, "").substr(0, 6));
					butt.addEventListener("click", function(e) {
						notetext.value = this.getAttribute("title");
						sendEvent(notetext, "change");
						notetext.focus();
						if (e.shiftKey) { sendEvent(submitbtn, "click"); }
					}, false);/*onclick*/
				}
				notetext.parentNode.insertBefore(butt, notetext);
				notetext.parentNode.insertBefore(document.createTextNode(" "), notetext);
			}
			notetext.parentNode.insertBefore(document.createElement("br"), notetext);
			createClearButtor("notetext");
			notetext.parentNode.insertBefore(document.createTextNode(" \u2190 shift+click to submit right away"), notetext.previousSibling);
			var lastnotetext = localStorage.getItem(notetextStorage+"00");
			if (!editsearchpage && (!editpage && setPrevNoteOnLoad || editpage && setPrevNoteOnEditPageLoad) && lastnotetext && notetext.value == "") {
				notetext.value = lastnotetext;
				sendEvent(notetext, "change");
			}
		}
		if (reldates.length == 2) {
			createClearButtor("dates");
			/*date memories*/
			for (var ixd in xdate) {
				if (xdate.hasOwnProperty(ixd)) {
					var lastdatey = localStorage.getItem(xdate[ixd][0]+"_y");
					var lastdatem = localStorage.getItem(xdate[ixd][0]+"_m");
					var lastdated = localStorage.getItem(xdate[ixd][0]+"_d");
					var butt = createButtor(textLabels[0]);
					butt.setAttribute("id", xdate[ixd][0]);
					if (!lastdatey) {
						butt.setAttribute("disabled", "true");
						butt.style.opacity = ".5";
					}
					else {
						butt.setAttribute("title", lastdatey+"-"+lastdatem+"-"+lastdated);
						butt.setAttribute("value", butt.getAttribute("title").replace(/-null/g, ""));
						butt.addEventListener("click", function(e) {
							var xdymd =  this.getAttribute("title").match(/^(.*)-(.*)-(.*)$/);
							for (var iixd=0, acts=["YYYY","MM","DD"]; iixd<3; iixd++) {
								var input = this.parentNode.querySelector("input[placeholder='"+acts[iixd]+"']");
								input.value = xdymd[iixd+1].match(/^\d+$/);
								sendEvent(input, "change");
							}
							if (e.shiftKey) {
								sendEvent(this.parentNode.getElementsByTagName("input")[3], "click");
							}
							submitbtn.focus();
						}, false);/*onclick*/
					}
					xdate[ixd][1].parentNode.setAttribute("title", "shift+click to change both dates at once");
					addAfter(butt, xdate[ixd][3]);
					addAfter(document.createTextNode(" "), xdate[ixd][3]);
					if (setPrevDateOnLoad && localStorage.getItem(xdate[ixd][0]) == "1") {
						sendEvent(document.getElementById(xdate[ixd][0]), "click");
					}
				}
			}
			/*copy dates*/
			for (var icd=0; icd < 2; icd++) {
				var buttcd = createButtor(copyDateLabels[icd]);
				buttcd.setAttribute("title", copyDateLabels[2]);
				buttcd.addEventListener("click", function(e) {
					for (var icdymd=1; icdymd<4; icdymd++) {
						var src = copyDateLabels.indexOf(this.getAttribute("value"));
						xdate[src==1?0:1][icdymd].value = xdate[src][icdymd].value;
						sendEvent(xdate[src==1?0:1][icdymd], "change");
					}
					submitbtn.focus();
				}, false);/*onclick*/
				addAfter(buttcd, xdate[icd][3]);
				addAfter(document.createTextNode(" "), xdate[icd][3]);
			}
		}
	}
	if (self.location.href.match(/edit-relationships$/) && (sub = document.querySelector("div#content.rel-editor > form > div.row.no-label.buttons > button.submit.positive[type='submit']"))) {
		sub.addEventListener("click", saveNote, false);
	}
	self.addEventListener("unload", saveNote, false);
}
function saveNote() {
	if (notetext) {
		if (textLabels.length > 0) {
			var thisnotetext = notetext.value.replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/gi, "");
			var ls00 = localStorage.getItem(notetextStorage+"00");
			if (save && thisnotetext != ls00) {
				if (ls00 != "") {
					for (var isav=textLabels.length-1; isav > 0 ; isav--) {
						var prev = localStorage.getItem(notetextStorage+"0"+(isav-1));
						if (prev) {
							localStorage.setItem(notetextStorage+"0"+isav, localStorage.getItem(notetextStorage+"0"+(isav-1)));
						}
					}
				}
				localStorage.setItem(notetextStorage+"00", thisnotetext);
			}
		}
		if (reldates.length == 2) {
			for (var ixd in xdate) {
				if (xdate.hasOwnProperty(ixd)) {
					var ndy = xdate[ixd][1].value;
					var ndm = xdate[ixd][2].value;
					var ndd = xdate[ixd][3].value;
					if (ndy.match(/^\d{4}$/)) {
						localStorage.setItem(xdate[ixd][0], "1");
						localStorage.setItem(xdate[ixd][0]+"_y", ndy);
						if (ndm.match(/^\d{1,2}$/)) {
							localStorage.setItem(xdate[ixd][0]+"_m", ndm);
							if (ndd.match(/^\d{1,2}$/)) {
								localStorage.setItem(xdate[ixd][0]+"_d", ndd);
							}
							else {
								localStorage.removeItem(xdate[ixd][0]+"_d");
							}
						}
						else {
							localStorage.removeItem(xdate[ixd][0]+"_m");
							localStorage.removeItem(xdate[ixd][0]+"_d");
						}
					}
					else if (ndy.trim() == "") {
						localStorage.setItem(xdate[ixd][0], "0");
					}
				}
			}
		}
	}
}
function createTag(tag, attribs, styles, events) {
	var t = document.createElement(tag);
	for (var attr in attribs) { if (attribs.hasOwnProperty(attr)) { t.setAttribute(attr, attribs[attr]); } }
	for (var styl in styles) { if (styles.hasOwnProperty(styl)) { t.style[styl] = styles[styl]; } }
	for (var evt in events) { if (events.hasOwnProperty(evt)) { t.addEventListener(evt, events[evt], false); } }
	return t;
}
function createButtor(label, width) {
	var butt = createTag("input", {"type":"button","value":label,"tabindex":"-1"}, {"display":"inline","padding":"2px"});
	if (width) { butt.style.width = width; }
	return butt;
}
function createClearButtor(input) {
	switch (input) {
		case "notetext":
			var butt = createButtor(delLabel, "25px");
			butt.addEventListener("click", function(e) {
				notetext.value = "";
				sendEvent(notetext, "change");
				notetext.focus();
				if (e.shiftKey) { sendEvent(submitbtn, "click"); }
			}, false);/*onclick*/
			butt.style.color = "red";
			butt.style.backgroundColor = cWARN;
			notetext.parentNode.insertBefore(butt, notetext.previousSibling);
			break;
		case "dates":
			for (var i=0; i<2; i++) {
				var butt = createButtor(delLabel, "25px");
				butt.setAttribute("id", userjs+"deldate"+i);
				butt.addEventListener("click", function(e) {
					var id = this.getAttribute("id").charAt((userjs+"deldate").length);
					for (var nii=1; nii<4; nii++) {
						xdate[id][nii].value = "";
						sendEvent(xdate[id][nii], "change");
					}
					if (e.shiftKey) { sendEvent(document.getElementById(userjs+"deldate"+(id==0?1:0)), "click"); }
					submitbtn.focus();
					e.cancelBubble = true;
					if (e.stopPropagation) e.stopPropagation();
				}, false);/*onclick*/
				addAfter(butt, xdate[i][3]);
				addAfter(document.createTextNode(" "), xdate[i][3]);
			}
			break;
	}
}
function addAfter(n, e) {
	if (n && e && e.parentNode) {
		if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
		else { return e.parentNode.appendChild(n); }
	} else { return null; }
}
function getParent(obj, tag, cls) {
	var cur = obj;
	if (cur.parentNode) {
		cur = cur.parentNode;
		if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
			return cur;
		} else {
			return getParent(cur, tag, cls);
		}
	} else {
		return null;
	}
}
function sendEvent(n, _e){
	var e = _e.toLowerCase();
	var ev;
	if (e.match(/click|mouse/)) {
		var params = {};
		params.mods = [];
		if (e.match(/\+/)) {
			params.mods = e.split("+");
			e = params.mods.pop();
		}
		ev = document.createEvent("MouseEvents");
		ev.initMouseEvent(e, true, true, self, 0, 0, 0, 0, 0, params.mods.indexOf("ctrl")>-1, params.mods.indexOf("alt")>-1, params.mods.indexOf("shift")>-1, params.mods.indexOf("meta")>-1, 0, null);
	}
	else {
		ev = document.createEvent("HTMLEvents");
		ev.initEvent(e, true, true);
	}
	n.dispatchEvent(ev);
}
})();