// ==UserScript==
// @name         mb. REVIVE DELETED EDITORS
// @version      2025.3.17
// @description  musicbrainz.org: reveal deleted editors’ names and emphasizes your own name to standout in MB pages
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_REVIVE-DELETED-EDITORS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_REVIVE-DELETED-EDITORS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-11-16
// @icon         data:image/gif;base64,R0lGODlhEAAQAOMMAAAAAP8A/wJR1MosEqGhBPyZUAD/APW1hQD///vPp///AP7++P///////////////yH5BAEKAA8ALAAAAAAQABAAAARbUMlJq0Ll6AN6z0liYNnWLV84FmUBLIsAAyqpuTEgA4VomzFUyMfaaDy9WhFw/PRoK6Zn2lFyqNio58DKSAEjQnczPtTEN+ww3AIMBrM1Qpxxud80VWDP7/sNEQA7
// @grant        none
// @match        *://*.musicbrainz.org/*edits*
// @match        *://*.musicbrainz.org/area/*/users*
// @match        *://*.musicbrainz.org/artist/*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/election*
// @match        *://*.musicbrainz.org/label/*
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/release/*
// @match        *://*.musicbrainz.org/release-group/*
// @match        *://*.musicbrainz.org/search*type=editor*
// @match        *://*.musicbrainz.org/statistics/editors*
// @match        *://*.musicbrainz.org/user/*
// @match        *://*.musicbrainz.org/work/*
// @run-at       document-idle
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var editors = {
	      "208": ["2001-01-19", "2014-01-28", "bawjaws"],
	      "387": ["2001-05-22", "2010-10-29", "tturner"],
	    "10698": ["2002-07-01", "2020-12-29", "djce"],
	    "32978": ["2003-12-13", "2005-12-16", "tenebrous"],
	    "39883": ["2004-03-06", "2017-06-10", "HairMetalAddict"],
	    "49249": ["2004-05-15", "2017-04-21", "inhouseuk"],
	    "52273": ["2004-06-14", "2015-06-06", "DrMuller"],
	    "62590": ["2004-09-04", "2021-09-09", "Senax"],
	    "93418": ["2005-02-08", "2013-03-05", "Rhymeless"],
	    "95678": ["2005-02-18", "2012-09-24", "brianfreud"],
	   "112569": ["2005-04-24", "2014-05-30", "c777"],
	   "129671": ["2005-06-30", "2009-02-02", "Shlublu"],
	   "135888": ["2005-07-28", "2015-09-21", "artysmokes"],
	   "150844": ["2005-09-26", "2020-05-24", "insolite", "theless"],
	   "157767": ["2005-10-20", "2010-01-05", "michael"],
	   "161352": ["2005-11-01", "2006-07-08", "claiborne"],
	   "163497": ["2005-11-09", "2012-07-12", "RedHotHeat"],
	   "186010": ["2005-12-30", "2012-11-29", "robojock"],
	   "193948": ["2006-01-20", "2008-01-27", "syserror"],
	   "240330": ["2006-07-03", "2012-11-27", "theirfour"],
	   "273412": ["2006-10-28", "2011-02-25", "Sturla"],
	   "296720": ["2007-01-22", "2012-03-12", "radiopilote"],
	   "313128": ["2007-03-31", "2009-02-06", "mistoffeles"],
	   "339844": ["2007-07-31", "2022-01-05", "Hape40"],
	   "346478": ["2007-08-31", "2011-05-28", "neothe0ne"],
	   "373252": ["2007-12-28", "2012-01-09", "frhoo"],
	   "385667": ["2008-02-29", "2019-10-22", "abelcheung"],
	   "386354": ["2008-03-04", "2008-04-03", "grosnombril"],
	   "420821": ["2008-09-10", "2014-07-19", "kaik", "a.k.a. jozo"],
	   "448034": ["2009-02-07", "2012-03-05", "maviles"],
	   "450522": ["2009-02-21", "2011-05-24", "dr_zepsuj"],
	   "457889": ["2009-04-12", "2014-01-12", "deivsonscherzinger"],
	   "477405": ["2009-10-06", "2015-02-01", "asmodood"],
	   "503832": ["2010-05-04", "2014-09-02", "Arctic"],
	   "563581": ["2011-06-13", "2015-04-04", null, "Russian 39,274 edits"],
	   "619363": ["2012-01-02", "2013-01-15", "ra7h35m20s"],
	   "629372": ["2012-04-04", "2014-04-08", "nightspirit"],
	   "636638": ["2012-06-15", "2020-04-22", "ssri"],
	   "638936": ["2012-07-07", "2014-12-21", "betegouveia", "puppet master"],
	   "639228": ["2012-07-08", "2014-12-21", "ritaavenida", "betegouveia sockpuppet"],
	   "639229": ["2012-07-08", "2013-07-12", null, "betegouveia sockpuppet"],
	   "639231": ["2012-07-08", "2014-12-21", "harrystykes", "betegouveia sockpuppet"],
	   "639236": ["2012-07-08", "2014-12-21", "niallhoran", "betegouveia sockpuppet"],
	   "660026": ["2012-08-23", "2017-09-21", "Sami-Perkele"],
	   "667117": ["2012-10-16", "2015-01-02", "m___ah", "the 555,555 edits editor"],
	   "678525": ["2012-11-05", "2016-05-16", "hcm"],
	   "692638": ["2012-11-23", "2013-06-25", "macs0647-jd", "puppet master"],
	   "692651": ["2012-11-24", "2013-06-29", "devore_imperium / rama_3", "macs0647-jd sockpuppet"],
	   "692817": ["2012-11-25", "2013-06-30", "rama_3 / devore_imperium", "macs0647-jd sockpuppet"],
	   "696572": ["2012-12-17", "2013-07-02", "commander.atvar", "macs0647-jd sockpuppet"],
	   "701624": ["2013-01-06", "2014-07-12", "Honorable"],
	   "701715": ["2013-01-07", "2013-01-30", "remdia"],
	   "705720": ["2013-01-27", "2017-01-03", "j7n"],
	   "726919": ["2013-03-26", "2013-09-06", "dirkvd"],
	   "774387": ["2013-06-06", "2014-12-21", "Wanddis"],
	   "791672": ["2013-06-14", "2013-12-08", "georg187", "only some test edits"],
	   "800638": ["2013-06-19", "2014-12-21", "nicolebahls", "betegouveia sockpuppet"],
	   "809366": ["2013-06-23", "2014-12-21", "xoxtina", "betegouveia sockpuppet"],
	   "864612": ["2013-07-18", "2017-03-24", "rohfrane"],
	   "984246": ["2013-09-14", "2015-03-25", "♀girls"],
	  "1024627": ["2013-10-04", "2014-12-21", "bvlgari", "betegouveia sockpuppet"],
	  "1220077": ["2014-01-24", "2014-06-11", "DCEX"],
	  "1288668": ["2014-06-29", "2014-12-21", "khaleesi", "betegouveia sockpuppet"],
	  "1304704": ["2014-10-12", "2015-03-22", "superpoota"],
	  "1306704": ["2014-10-22", "2014-10-24", null, "betegouveia sockpuppet"], /* LOL https://musicbrainz.org/edit/29794898 */
	  "1481087": ["2015-12-22", "2016-11-13", "FEarBG"],
	  "1603482": ["2016-05-12", "2016-05-13", "kemecat"],
	  "1629393": ["2016-06-08", "2016-06-28", "Minaya69"],
	  "1642944": ["2016-06-23", "2016-10-21", "🖕"],
	  "1667628": ["2016-07-23", "2016-08-02", "gerff93"],
	  "1676087": ["2016-08-02", "2016-09-06", "itsgbitch", "1st, seung3panda"], /* https://musicbrainz.org/edit/40556089 */
	  "1687525": ["2016-08-17", "2016-09-14", "seung3panda", "itsgbitch"],
	  "1702177": ["2016-09-04", "2017-09-01", "Remix42"],
	  "1712953": ["2016-09-16", "2016-09-17", "itsgbitch", "2nd"],
	  "1713810": ["2016-09-18", "2017-02-12", "itsgbitch", "3rd"],
	  "1726052": ["2016-10-02", "2020-05-05", "Savonarolla (now PeteFr?)"],
	  "1732753": ["2016-10-10", "2016-10-11", "aidenpearce", "에이든"],
	  "1776918": ["2016-12-27", "2016-12-30", "psycosid08"],
	  "1801019": ["2017-02-07", "2020-10-13", "Jorgosch"],
	  "1807782": ["2017-02-17", "2022-10-11", "librious", "now wtfislibrious"],
	  "1821469": ["2017-03-08", "2017-03-10", "RiaTimkin", "now WhatsGoingOnHere"],
	  "1902982": ["2017-06-21", "2017-11-26", "lucascarvalho"],
	  "1985555": ["2018-02-16", "2020-01-11", "reianasmiley"],
	  "2015866": ["2018-06-16", "2019-12-27", "Ash_Kusanagi"],
	  "2033920": ["2018-10-09", "2019-01-17", "therealdero"],
	  "2040792": ["2018-11-22", "2019-08-07", "fhm0096"],
	  "2049662": ["2019-01-16", "2019-01-17", "therealdero", "2nd"],
	  "2057975": ["2019-03-11", "2021-03-31", "NeroA"],
	  "2071313": ["2019-06-04", "2024-06-20", "Echelon69", "Piotr Sakowski (PS123)"],
	  "2077726": ["2019-07-15", "2021-08-19", "Syknro"],
	  "2138248": ["2020-06-04", "2021-03-29", "theless", "insolite"],
	  "2179996": ["2021-01-01", "2021-05-16", "teichmaster2021"],
	  "2182152": ["2021-01-11", "2021-10-18", "Misty_Pond"],
	  "2513197": ["2024-08-15", "2024-09-22", "Echelon666", "Piotr Sakowski (PS123)"],
	  "2530114": ["2024-10-02", "2025-01-31", "Peter69", "Piotr Sakowski (PS123)"],
	  "2577447": ["2025-02-01", "", "PS123", "Piotr Sakowski (PS123)"],
	    "PS123": "Echelon69 / Echelon666 / Peter69",
	/* “funny” stuff */
	"jesus2099": "GOLD MASTER KING",
	    "%you%": "BEST MB EDITOR EVER",
};
var standout /* from the crowd */ = true;
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var MBS = self.location.protocol + "//" + self.location.host;
var you = document.querySelector("div.header ul.menu li.account a[href^='/user/']");
if (document.querySelector("div.header ul.menu li.account a[href$='/logout'], div#page") == null) { return; }
if (you) {
	if (editors["%you%"]) {
		you = unescape(you.getAttribute("href").match(/[^/]+$/));
		if (!editors[you]) { editors[you] = editors["%you%"]; }
		delete editors["%you%"];
	}
	if (standout) {
		var css = document.createElement("style");
		css.setAttribute("type", "text/css");
		document.head.appendChild(css);
		css = css.sheet;
		css.insertRule("div#page a[href='" + MBS + "/user/" + you + "'], div#page a[href='/user/" + you + "'] { background-color: yellow; color: purple; }", 0);
	}
}
for (var editor in editors) if (Object.prototype.hasOwnProperty.call(editors, editor)) {
	var deletedEditor = typeof editors[editor] != "string";
	var editorName = deletedEditor ? "Deleted Editor #" + editor : editor;
	var namewas = editors[editor][2] ? editors[editor][2] : "？";
	document.title = deletedEditor ? document.title.replace(new RegExp(editorName + "(”)?"), namewas + "$1") : document.title.replace(new RegExp("^Editor( “" + editorName + "”)"), editors[editor] + "$1");
	if (deletedEditor) {
		editors[editor] = {begin: editors[editor][0], end: editors[editor][1], namewas: namewas, comment: editors[editor][3]};
		if (document.title.match(/^editor not found/i) && self.location.pathname.match("^/user/" + editors[editor].namewas)) {
			var node = document.querySelector("div#page > h1");
			if (node) {
				node.replaceChild(document.createTextNode(" “" + editors[editor].namewas + "” → “" + editorName + "”"), node.firstChild);
				node.insertBefore(document.createElement("img"), node.firstChild).setAttribute("src", "/static/images/icons/loading.gif");
			}
			node = document.querySelector("div#page > p");
			if (node) {
				removeChildren(node);
				node.style.setProperty("color", "darkred");
				node.appendChild(document.createTextNode("Please wait while you are redirected to the editor page (" + editors[editor].namewas + " has been renamed to " + editorName + ")…"));
			}
			self.location.replace(MBS + "/user/" + encodeURIComponent(editorName));
			return;
		} else {
			editors[editor].fullspan = editors[editor].begin + " 〜 " + editors[editor].end;
			editors[editor].shortend = "until " + editors[editor].end.substring(0, 4);
			var dur = (new Date(editors[editor].end) - new Date(editors[editor].begin)) / 1000 / 60 / 60 / 24 + 1;
			var unit = "day";
			if (dur % 30  < dur) {
				if (dur % 365 < dur) {
					dur /= 365;
					unit = "year";
				} else {
					dur /= 30;
					unit = "month";
				}
			}
			dur = Math.round(dur);
			editors[editor].duration = "active " + dur + " " + unit + (dur == 1 ? "" : "s");
			editors[editor].title = editorName + "\n" + editors[editor].namewas + (editors[editor].comment ? " (" + editors[editor].comment + ")" : "") + "\n" + editors[editor].duration + " (" + editors[editor].fullspan + ")";
			var as = document.querySelectorAll("a[href='/user/" + encodeURIComponent(editorName) + "']");
			for (var a = 0; a < as.length; a++) {
				for (var n = 0; n < as[a].childNodes.length; n++) {
					if ((as[a].childNodes[n].nodeType == 3 || as[a].childNodes[n].tagName && as[a].childNodes[n].tagName == "BDI") && as[a].childNodes[n].textContent == editorName) {
						as[a].replaceChild(document.createTextNode(editors[editor].namewas), as[a].childNodes[n]);
						as[a].style.setProperty("color", "darkred", "important");
						as[a].style.setProperty("text-decoration", "line-through");
						as[a].setAttribute("title", editors[editor].title);
						as[a].classList.add("tooltip");
						var moreInfo = document.createDocumentFragment();
						moreInfo.appendChild(document.createTextNode("("));
						if (editors[editor].comment) {
							moreInfo.appendChild(document.createElement("b")).appendChild(document.createTextNode(editors[editor].comment));
							moreInfo.appendChild(document.createTextNode(", "));
						}
						moreInfo.appendChild(document.createTextNode(editors[editor].duration + " " + editors[editor].shortend + ")"));
						moreInfo.normalize();
						var comment = document.createElement("span");
						comment.classList.add("comment");
						comment.appendChild(moreInfo);
						addAfter(comment, as[a]);
						addAfter(document.createTextNode(" "), as[a]);
						break;
					}
				}
			}
			var inputs = document.querySelectorAll("form#edit-search li.condition span.field-editor > span.autocomplete.editor > input.name.ui-autocomplete-input.lookup-performed[value='" + editorName + "']");
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].setAttribute("_deletedEditor", inputs[i].value);
				inputs[i].value = editors[editor].namewas;
				inputs[i].setAttribute("title", editors[editor].title);
				inputs[i].style.setProperty("color", "darkred");
				inputs[i].addEventListener("focus", swapValues);
				inputs[i].addEventListener("blur", swapValues);
				document.querySelector("form#edit-search").addEventListener("submit", function() {
					var oldValues = document.querySelectorAll("input.name.ui-autocomplete-input.lookup-performed[_focus-value]");
					for (var v = 0; v < oldValues.length; v++) {
						oldValues[v].value = oldValues[v].getAttribute("_focus-value");
					}
				});
			}
		}
	}
	if (self.location.href.match(new RegExp("^" + MBS + "/user/" + escape(editorName) + "$"))) {
		var entryHeader = document.querySelectorAll("table.profileinfo > tbody > tr > th");
		for (var h = 0; h < entryHeader.length; h++) {
			if (entryHeader[h].textContent.match(/user type/i)) {
				var userType = getSibling(entryHeader[h], "td");
				if (userType) {
					userType.setAttribute("title", userType.textContent.trim());
					removeChildren(userType);
					userType.appendChild(document.createTextNode(deletedEditor ? editorName : editors[editor]));
					userType.style.setProperty("font-weight", "bold");
					userType.style.setProperty("text-shadow", "0 0 4px gold");
				}
			} else if (entryHeader[h].textContent.match(/member since/i)) {
				if (deletedEditor) {
					document.title = document.title.replace(new RegExp("(“" + editors[editor].namewas + "”)"), "$1 (" + editors[editor].shortend + ")");
					entryHeader[h].parentNode.parentNode.insertBefore(profileEntry("Membership", editors[editor].duration + " (" + editors[editor].fullspan + ")"), entryHeader[h].parentNode);
					if (editors[editor].comment) {
						entryHeader[h].parentNode.parentNode.insertBefore(profileEntry("Comment", editors[editor].comment), entryHeader[h].parentNode);
					}
				}
				break;
			}
		}
	}
}
function profileEntry(content, header) {
	var entry = document.createElement("tr");
	entry.appendChild(document.createElement("th")).appendChild(document.createTextNode(content + ":"));
	var dd = entry.appendChild(document.createElement("td"));
	dd.appendChild(document.createTextNode(header));
	dd.style.setProperty("font-weight", "bold");
	dd.style.setProperty("text-shadow", "0 0 4px gold");
	return entry;
}
function swapValues(event) {
	switch (event.type) {
		case "focus":
			var deletedEditorName = this.getAttribute("_deletedEditor");
			if (deletedEditorName) {
				this.value = deletedEditorName;
				this.removeAttribute("_deletedEditor");
			}
			break;
		case "blur":
			var deletedEditorID = this.value.match(/Deleted Editor #(\d+)/);
			if (deletedEditorID && editors[deletedEditorID[1]]) {
				this.setAttribute("_deletedEditor", this.value);
				this.value = editors[deletedEditorID[1]].namewas;
			}
			break;
	}
}
function removeChildren(p) {
	while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
}
function getSibling(obj, tag, cls, prev) {
	var cur = obj;
	if ((cur = prev ? cur.previousSibling : cur.nextSibling)) {
		if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.classList.contains(cls))) {
			return cur;
		} else {
			return getSibling(cur, tag, cls, prev);
		}
	} else {
		return null;
	}
}
function addAfter(n, e) {
	if (n && e && e.parentNode) {
		if (e.nextSibling) {
			return e.parentNode.insertBefore(n, e.nextSibling);
		} else {
			return e.parentNode.appendChild(n);
		}
	} else { return null; }
}
