// ==UserScript==
// @name         mb. PENDING EDITS
// @version      2018.3.14
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PENDING-EDITS.user.js
// @description  musicbrainz.org: Adds/fixes links to entity (pending) edits (if any); optionally adds links to associated artist(s) (pending) edits
// @homepage     http://userscripts-mirror.org/scripts/show/42102
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PENDING-EDITS
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PENDING-EDITS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PENDING-EDITS.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0+; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2009-02-09
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/5d722a32488ce7672bdc9a2486af1211ba25ff5f/lib/SUPER.js?version=2018.3.14
// @grant        none
// @match        *://*.mbsandbox.org/area/*
// @match        *://*.mbsandbox.org/artist/*
// @match        *://*.mbsandbox.org/collection/*
// @match        *://*.mbsandbox.org/event/*
// @match        *://*.mbsandbox.org/label/*
// @match        *://*.mbsandbox.org/place/*
// @match        *://*.mbsandbox.org/recording/*
// @match        *://*.mbsandbox.org/release/*
// @match        *://*.mbsandbox.org/release-group/*
// @match        *://*.mbsandbox.org/series/*
// @match        *://*.mbsandbox.org/url/*
// @match        *://*.mbsandbox.org/work/*
// @match        *://*.musicbrainz.org/area/*
// @match        *://*.musicbrainz.org/artist/*
// @match        *://*.musicbrainz.org/collection/*
// @match        *://*.musicbrainz.org/event/*
// @match        *://*.musicbrainz.org/label/*
// @match        *://*.musicbrainz.org/place/*
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/release/*
// @match        *://*.musicbrainz.org/release-group/*
// @match        *://*.musicbrainz.org/series/*
// @match        *://*.musicbrainz.org/url/*
// @match        *://*.musicbrainz.org/work/*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* START OF CONFIGURATION - --- - --- - --- - */
/* true: show additional artist "editing history" and "open edits" links on some non artist pages.
     It will add other request(s) to MB server, this is why it is an option. */
var addArtistLinks = true;
/* END OF CONFIGURATION - --- - --- - --- - */
// “const” NG in Opera 12 at least
var SCRIPT_KEY = "jesus2099userjs42102";//linked in mb_MASS-MERGE-RECORDINGS.user.js
var EDITS_PER_PAGE = 100;
var MBS = self.location.protocol + "//" + self.location.host;
var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var loc, pageEntity, checked = [], xhrPendingEdits = {};
var account = document.querySelector("div.header li.account a[href^='" + MBS + "/user/']");
//EDITING HISTORY
if (
	account
	&& (account = decodeURIComponent(account.getAttribute("href").match(/[^/]+$/)))
	&& document.querySelector("div#sidebar")
	&& (loc = self.location.pathname.match(new RegExp("^/(area|artist|collection|event|label|place|release-group|release|recording|series|work|url)/(" + RE_GUID + ")")))
	&& (pageEntity = document.querySelector("div#content > div > h1 a"))
	&& (pageEntity = a2obj(pageEntity))
) {
	pageEntity.editinghistory = document.querySelector("div#sidebar ul.links a[href$='" + pageEntity.base + "/edits']");
	if (pageEntity.editinghistory) {
		pageEntity.ul = getParent(pageEntity.editinghistory, "ul");
	} else {
		pageEntity.ul = document.querySelector("div#sidebar ul.links");
		pageEntity.editinghistory = createLink(pageEntity, "edits");//reverts MBS-57 (Remove “normal artist” functionality from Various Artists) drawback
	}
	pageEntity.li = getParent(pageEntity.editinghistory, "li");
//OPEN EDITS
	pageEntity.openedits = document.querySelector("div#sidebar a[href$='" + pageEntity.base + "/open_edits']");
	if (pageEntity.openedits) {
		pageEntity.openedits.removeAttribute("title");//removes bogus tooltip (artist disambiguation or swapped sort name) that is masking our useful tooltip
		if (pageEntity.openedits.parentNode.tagName == "LI") {//fixes MBS-2298 (“Open edits” link should share same styling as pending edit items)
			var pendingEditsMarkedLink = createTag("span", {a: {class: "mp"}});
			pageEntity.openedits.parentNode.replaceChild(pendingEditsMarkedLink.appendChild(pageEntity.openedits.cloneNode(true)).parentNode, pageEntity.openedits);
			pageEntity.openedits = pendingEditsMarkedLink.firstChild;//restore node parental context
		}
	} else {
		pageEntity.openedits = createLink(pageEntity, "open_edits");//fixes MBS-3386 (“Open edits” link not always displayed)
	}
	checked.push(pageEntity.base);
	checkOpenEdits(pageEntity);
//ASSOCIATED ARTIST LINKS
	if (addArtistLinks && !/(area|artist|collection|label)/.test(loc[1])) {
		var artists;
		switch (loc[1]) {
			case "release-group":
			case "release":
			case "recording":
				artists = document.querySelectorAll("p.subheader a[href^='/artist/']");
				break;
			case "url":
				artists = document.querySelectorAll("div#content a[href^='/artist/'], div#content a[href^='/label/']");
				break;
			case "work":
				artists = workMainArtists();
				break;
		}
		if (artists && artists.length && artists.length > 0) {
			for (var arti = artists.length - 1; arti >= 0; arti--) {
				var art = a2obj(artists[arti]);
				if (checked.indexOf(art.base) < 0) {
					checked.push(art.base);
					art.editinghistory = createLink(pageEntity, "edits", art);
					art.openedits = createLink(pageEntity, "open_edits", art);
					getParent(art.openedits, "li").classList.add("separator");
					checkOpenEdits(art);
				}
			}
		}
	}
}
function createLink(entity, historyType, associatedArtist) {
	var currentEntity = associatedArtist || entity;
	var linkLabel = (historyType == "edits" ? "editing\u00a0history" : "open\u00a0edits");
	linkLabel = associatedArtist ? currentEntity.name + " " + linkLabel : linkLabel.replace(/(.)(.*)/, function(match, g1, g2, offset, string) { return g1.toUpperCase() + g2; });
	var newLink = createTag("li", null, createTag("span", null, createTag("a", {a: {href: currentEntity.base + "/" + historyType}}, linkLabel)));//“span.(""|"mp")” linked in mb_MASS-MERGE-RECORDINGS.user.js
	if (associatedArtist) {
		addAfter(newLink, entity.li);
	} else if (!associatedArtist && historyType == "edits") {
		newLink.classList.add("separator");
		entity.ul.appendChild(newLink);
	} else {
		entity.ul.insertBefore(newLink, entity.li);
	}
	return newLink.firstChild.firstChild;
}
function checkOpenEdits(obj) {
	var smp = getParent(obj.openedits, "li").firstChild;
	var count = smp.querySelector("span." + SCRIPT_KEY + "count");
	if (!count) {
		smp.appendChild(document.createTextNode("\u00a0("));
		smp.appendChild(createTag("span", {a: {class: SCRIPT_KEY + "count"}}, createTag("img", {a: {alt: "⌛ loading…", src: "/static/images/icons/loading.gif", height: self.getComputedStyle(smp).getPropertyValue("font-size")}})));//“SCRIPT_KEY + "count"” linked in mb_MASS-MERGE-RECORDINGS.user.js
		smp.appendChild(document.createTextNode(")"));
	}
	xhrPendingEdits[obj.base] = {
		object: obj,
		xhr: new XMLHttpRequest()
	};
	xhrPendingEdits[obj.base].xhr.addEventListener("load", function() {
		var xhrpe;
		for (var x in xhrPendingEdits) if (xhrPendingEdits.hasOwnProperty(x) && xhrPendingEdits[x].xhr == this) {
			xhrpe = xhrPendingEdits[x];
			break;
		}
		if (this.status == 200) {
			var responseDOM = document.createElement("html"); responseDOM.innerHTML = this.responseText;
			var editCount = responseDOM.querySelector("div.search-toggle");
			var editDetails;
			if (
				editCount
				&& (editCount = editCount.textContent.match(/\d+/))
				&& (editCount = parseInt(editCount[0], 10))
				&& !isNaN(editCount)
			) {
				editDetails = {
					types: this.responseText.match(/[^<>]+(?=<\/bdi><\/a><\/h2>)/g),
					editors: this.responseText.match(new RegExp("</h2><p class=\"subheader\">[\\S\\s]+?<a href=\"/user/[^/]+\">[\\S\\s]+?</p>", "g"))
				};
			} else {
				editCount = 0;
			}
			updateLink(xhrpe.object, editCount, editDetails, editCount == 500);
		} else {
			updateLink(xhrpe.object, this);
		}
	});
	xhrPendingEdits[obj.base].xhr.open("get", MBS + obj.openedits.getAttribute("href"), true);
	xhrPendingEdits[obj.base].xhr.setRequestHeader("base", obj.base);
	xhrPendingEdits[obj.base].xhr.send(null);
}
function updateLink(obj, pecount, details, more) {
	var countText;
	var tooltip;
	var li = getParent(obj.openedits, "li");
	var count = li.querySelector("span." + SCRIPT_KEY + "count");
	if (typeof pecount == "number") {
		countText = pecount;
		if (more) countText += "+";
		if (pecount == 0) {
			mp(obj.openedits, false);
			tooltip = "no pending edits";
		} else if (pecount > 0) {
			mp(obj.openedits, true);
			if (details.types.length > 0 && details.types.length == details.editors.length) {
				var titarray = [], dupcount = 0, dupreset;
				for (var d = 0; d < details.types.length; d++) {
					var thistit = details.types[d].replace(/^.+ - /, "- ");
					var editor = decodeURIComponent(details.editors[d].replace(/^[\S\s]+\/user\/|">[\S\s]+$/g, ""));
					if (editor != account) {
						thistit += " (" + editor + ")";
					}
					if (thistit != titarray[titarray.length - 1]) {
						titarray.push(thistit);
						if (d > 0) {
							dupreset = true;
						}
					} else {
						dupcount++;
					}
					var last = (d == details.types.length - 1);
					if (dupcount > 0 && (dupreset || last)) {
						titarray[titarray.length - 2 + (!dupreset && last ? 1 : 0)] += " ×" + (dupcount + 1);
						dupcount = 0;
					}
					dupreset = false;
				}
				tooltip = titarray.join("\r\n");
				var expanded = "▼";
				var collapsed = "◀";
				var expandEditLists = (localStorage.getItem(SCRIPT_KEY + "pendingEditLists") != collapsed);
				var ul = createTag("ul", {a: {class: SCRIPT_KEY + "editlist"}, s: {display: expandEditLists ? "block" : "none", opacity: ".5"}});
				for (var e = 0; e < titarray.length; e++) {
					var edit1type2editor3count = titarray[e].match(/^(?:- )?([^\(]+)(?: \(([^)]+)\))?(?: ×(\d+))?$/);
					var editLi = ul.appendChild(createTag("li", {}, createTag("span", {a: {class: "mp"}}, edit1type2editor3count[1] + (edit1type2editor3count[3] ? " ×" + edit1type2editor3count[3] : ""))));
					if (edit1type2editor3count[2]) {
						editLi.appendChild(document.createTextNode(" by "));
						editLi.appendChild(createTag("a", {a: {href: "/user/" + escape(edit1type2editor3count[2])}}, edit1type2editor3count[2]));
					} else {
						editLi.style.setProperty("font-weight", "bold");
					}
				}
				if (titarray.length < 2 && pecount <= EDITS_PER_PAGE) {
					tooltip = tooltip.replace(/^- /, "");
				}
				if (pecount > EDITS_PER_PAGE) {
					tooltip += "\r\n- …";
					ul.appendChild(createTag("li", {}, createTag("span", {a: {class: "mp"}}, "etc.")));
				}
				var help = createTag("span", {a: {class: SCRIPT_KEY + "help"}, s: {display: expandEditLists ? "inline" : "none"}});
				if (titarray.length > 1) {
					tooltip += "\r\n \r\n(oldest edit on bottom)";
					if (obj != pageEntity) {
						help.appendChild(document.createElement("br"));
					}
					help.appendChild(document.createTextNode(" newest edit on top"));
				}
				li.appendChild(help);
				li.appendChild(ul);
				li.insertBefore(createTag("a", {a: {class: SCRIPT_KEY + "toggle"}, s: {position: "absolute", right: "4px"}, e: {click: function(event) {
					var collapse = (this.textContent == expanded);
					for (var options = document.querySelectorAll("ul." + SCRIPT_KEY + "editlist, span." + SCRIPT_KEY + "help"), o = 0; o < options.length; o++) {
						options[o].style.setProperty("display", collapse ? "none" : (options[o].tagName == "UL" ? "block" : "inline"));
					}
					for (var toggles = document.querySelectorAll("a." + SCRIPT_KEY + "toggle"), t = 0; t < toggles.length; t++) {
						replaceChildren(document.createTextNode(collapse ? collapsed : expanded), toggles[t]);
					}
					localStorage.setItem(SCRIPT_KEY + "pendingEditLists", collapse ? collapsed : expanded);
				}}}, expandEditLists ? expanded : collapsed), li.firstChild);
			}
		}
	} else {
		countText = pecount.status;
		tooltip = pecount.responseText;
		count.style.setProperty("background-color", "pink");//“pink” linked in mb_MASS-MERGE-RECORDINGS.user.js
	}
	count.replaceChild(document.createTextNode(countText), count.firstChild);//“countText” linked in mb_MASS-MERGE-RECORDINGS.user.js
	if (tooltip) {
		obj.openedits.setAttribute("title", tooltip);//linked in mb_MASS-MERGE-RECORDINGS.user.js
	}
}
function mp(o, set) {
	var li = getParent(o, "li");
	if (typeof set == "undefined") {
		return li.firstChild.tagName == "SPAN" && li.firstChild.classList.contains("mp");
	} else if (typeof set == "boolean" && li.firstChild.tagName == "SPAN") {
		if (set && !mp(o)) {
			li.firstChild.className = "mp";
		} else if (!set) {
			if (mp(o)) {
				li.firstChild.classList.remove("mp");
			}
			o.style.setProperty("text-decoration", "line-through");//linked in mb_MASS-MERGE-RECORDINGS.user.js
			li.style.setProperty("opacity", ".5");//linked in mb_MASS-MERGE-RECORDINGS.user.js
		}
	}
}
function a2obj(a) {
	return {
		a: a,
		name: a.textContent,
		base: a.getAttribute("href").match(new RegExp("(/[^/]+/" + RE_GUID + ")$"))[1]
	};
}
function workMainArtists() {
	var writers = document.querySelectorAll("div#content > table.details > tbody td a[href^='/artist/']");
	var groupedWriters = {};
	for (var w = 0; w < writers.length; w++) {
		var href = writers[w].getAttribute("href");
		if (!groupedWriters[href]) {
			groupedWriters[href] = [];
		}
		groupedWriters[href].push(writers[w]);
	}
	var performers = document.querySelectorAll("div#content > table.tbl > tbody td a[href^='/artist/']");
	var groupedPerformers = {};
	for (var p = 0; p < performers.length; p++) {
		var href = performers[p].getAttribute("href");
		if (!groupedPerformers[href]) {
			groupedPerformers[href] = [];
		}
		groupedPerformers[href].push(performers[p]);
	}
	var mainArtists = [];
	var max = 0;
	//find most frequent performer(s)
	for (var href in groupedPerformers) if (groupedPerformers.hasOwnProperty(href)) {
		if (groupedPerformers[href].length > max) {
			max = groupedPerformers[href].length;
			mainArtists = [groupedPerformers[href][0]];
		} else if (groupedPerformers[href].length == max) {
			//take first ex‐æquo artist(s) too
			mainArtists.push(groupedPerformers[href][0]);
		}
	}
	//take all singer/song‐writers; take all writers if no performers
	for (var href in groupedWriters) if (groupedWriters.hasOwnProperty(href) && (groupedPerformers[href] || performers.length < 1)) {
		mainArtists.push(groupedWriters[href][0]);
	}
	//get artist main names whenever possible
	for (var f = 0; f < mainArtists.length; f++) {
		var noNameVariationArtist = document.querySelector(":not(.name-variation) > a[href='" + mainArtists[f].getAttribute("href") + "']");
		mainArtists[f] = noNameVariationArtist || mainArtists[f];
	}
	return mainArtists;
}
