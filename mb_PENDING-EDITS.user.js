// ==UserScript==
// @name         mb. PENDING EDITS
// @version      2015.8.14.1040
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PENDING-EDITS.user.js
// @description  musicbrainz.org: Adds/fixes links to entity (pending) edits (if any); optionally adds links to associated artist(s) (pending) edits
// @homepage     http://userscripts-mirror.org/scripts/show/42102
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey    tested sometimes
// @compatible   chromium(46)+tampermonkey   tested sometimes
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PENDING-EDITS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PENDING-EDITS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2009-02-09
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=66008&v=2015.8.5.1555
// @include      http*://*musicbrainz.org/area/*
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/event/*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/place/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/series/*
// @include      http*://*musicbrainz.org/url/*
// @include      http*://*musicbrainz.org/work/*
// @include      http://*.mbsandbox.org/area/*
// @include      http://*.mbsandbox.org/artist/*
// @include      http://*.mbsandbox.org/collection/*
// @include      http://*.mbsandbox.org/event/*
// @include      http://*.mbsandbox.org/label/*
// @include      http://*.mbsandbox.org/place/*
// @include      http://*.mbsandbox.org/recording/*
// @include      http://*.mbsandbox.org/release/*
// @include      http://*.mbsandbox.org/release-group/*
// @include      http://*.mbsandbox.org/series/*
// @include      http://*.mbsandbox.org/url/*
// @include      http://*.mbsandbox.org/work/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
/* START OF CONFIGURATION - --- - --- - --- - */
/* true: show additional artist "editing history" and "open edits" links on some non artist pages.
         It will add other request(s) to MB server, this is why it is an option. */
	var addArtistLinks = true;
/* END OF CONFIGURATION - --- - --- - --- - */
	var userjs = "jesus2099userjs42102";
	var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var loc, pageEntity, checked = [], xhrPendingEdits = {};
	var MBS = location.protocol + "//" + location.host;
	var account = document.querySelector("div#header li.account a[href^='" + MBS + "/user/']");
//EDITING HISTORY
	if (
		account &&
		(account = unescape(account.getAttribute("href").match(/[^/]+$/))) &&
		document.querySelector("div#sidebar") &&
		(loc = location.pathname.match(new RegExp("^/(area|artist|collection|event|label|place|release-group|release|recording|series|work|url)/(" + RE_GUID + ")"))) &&
		(pageEntity = document.querySelector("div#content > div.tabs > ul.tabs > li > a")) &&
		(pageEntity = a2obj(pageEntity))
	) {
		pageEntity.editinghistory = document.querySelector("div#sidebar ul.links a[href='" + MBS + pageEntity.base + "/edits']");
		if (pageEntity.editinghistory) {
			pageEntity.ul = getParent(pageEntity.editinghistory, "ul");
		} else {
			pageEntity.ul = document.querySelector("div#sidebar ul.links");
			pageEntity.editinghistory = createLink(pageEntity, "edits");//reverts MBS-57 drawback
		}
		pageEntity.li = getParent(pageEntity.editinghistory, "li");
//OPEN EDITS
		pageEntity.openedits = document.querySelector("div#sidebar a[href='" + MBS + pageEntity.base + "/open_edits']");
		if (pageEntity.openedits) {
			pageEntity.openedits.removeAttribute("title");//removing useless tooltip (artist disambiguation or swapped sort name) that is masking our useful tooltip
			if (pageEntity.openedits.parentNode.tagName == "LI") {//fixes MBS-2298 (mark open_edits as having pending edits)
				var pendingEditsMarkedLink = createTag("span", {a: {class: "mp"}});
				pageEntity.openedits.parentNode.replaceChild(pendingEditsMarkedLink.appendChild(pageEntity.openedits.cloneNode(true)).parentNode, pageEntity.openedits);
				pageEntity.openedits = pendingEditsMarkedLink.firstChild;//restore node parental context
			}
		} else {
			pageEntity.openedits = createLink(pageEntity, "open_edits");//fixes MBS-3386
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
					artists = document.querySelectorAll("p.subheader a[href^='" + MBS + "/artist/']");
					break;
				case "url":
					artists = document.querySelectorAll("div#content a[href^='" + MBS + "/artist/'], div#content a[href^='" + MBS + "/label/']");
					break;
				case "work":
					artists = workMainPerformer();
					if (artists) artists = [artists];
					break;
			}
			if (artists && artists.length && artists.length > 0) {
				for (var arti = artists.length - 1; arti >= 0; arti--) {
					var art = a2obj(artists[arti]);
					if (checked.indexOf(art.base) < 0) {
						checked.push(art.base);
						art.editinghistory = createLink(pageEntity, "edits", art);
						art.openedits = createLink(pageEntity, "open_edits", art);
						addAfter(document.createElement("hr"), pageEntity.li);
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
		var newLink = createTag("li", null, createTag("span", null, createTag("a", {a: {href: currentEntity.base + "/" + historyType}}, linkLabel)));
		if (associatedArtist) {
			addAfter(newLink, entity.li);
		} else if (!associatedArtist && historyType == "edits") {
			entity.ul.appendChild(document.createElement("hr"));
			entity.ul.appendChild(newLink);
		} else {
			entity.ul.insertBefore(newLink, entity.li);
		}
		return newLink.firstChild.firstChild;
	}
	function checkOpenEdits(obj) {
		var smp = getParent(obj.openedits, "li").firstChild;
		var count = smp.querySelector("span." + userjs + "count");
		if (!count) {
			smp.appendChild(document.createTextNode("\u00a0("));
			smp.appendChild(createTag("span", {a: {class: userjs + "count"}}, "⌛"));
			smp.appendChild(document.createTextNode(")"));
		}
		xhrPendingEdits[obj.base] = {
			object: obj,
			xhr: new XMLHttpRequest()
		};
		xhrPendingEdits[obj.base].xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				var xhrpe;
				for (var x in xhrPendingEdits) if (xhrPendingEdits.hasOwnProperty(x) && xhrPendingEdits[x].xhr == this) {
					xhrpe = xhrPendingEdits[x];
					break;
				}
				if (this.status == 200) {
					var editc = this.responseText.match(/found (at least )?(\d+) edits?/i), editDetails;
					if (editc) {
						editc = [null, editc[1], parseInt(editc[2], 10)];
						editDetails = {
							types: this.responseText.match(/[^<>]+(?=<\/bdi><\/a><\/h2>)/g),
							editors: this.responseText.match(new RegExp("Edit by <a href=\"" + MBS + "/user/[^/]+\">", "g"))
						};
					} else {
						editc = [null, false, 0];
					}
					updateLink(xhrpe.object, editc[2], editDetails, editc[1]);
				} else {
					updateLink(xhrpe.object, this);
				}
			}
		};
		xhrPendingEdits[obj.base].xhr.open("get", obj.openedits.getAttribute("href"), true);
		xhrPendingEdits[obj.base].xhr.setRequestHeader("base", obj.base);
		xhrPendingEdits[obj.base].xhr.send(null);
	}
	function updateLink(obj, pecount, details, more) {
		var countText;
		var liTitle;
		var li = getParent(obj.openedits, "li");
		var count = li.querySelector("span." + userjs + "count");
		if (typeof pecount == "number") {
			countText = pecount;
			if (more) countText += "+";
			if (pecount == 0) {
				mp(obj.openedits, false);
				liTitle = "no pending edits";
			} else if (pecount > 0) {
				mp(obj.openedits, true);
				if (details.types.length > 0 && details.types.length == details.editors.length) {
					var titarray = [], dupcount = 0, dupreset;
					for (var d = 0; d < details.types.length; d++) {
						var thistit = details.types[d].replace(/^Edit #\d+ /, "");
						var editor = unescape(details.editors[d].replace(/^.+\/user\/|">$/g, ""));
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
					liTitle = titarray.join("\r\n");
					if (pecount == 1) {
						liTitle = liTitle.replace(/^- /, "");
					} else if (pecount > 1) {
						liTitle = "newest edit on top:\r\n \r\n" + liTitle;
						if (pecount > 50) {
							liTitle += "\r\n…";
						}
					}
				}
			}
		} else {
			countText = pecount.status;
			liTitle = pecount.responseText;
			count.style.setProperty("background-color", "pink");
		}
		count.replaceChild(document.createTextNode(countText), count.firstChild);
		if (liTitle) {
			li.setAttribute("title", liTitle);
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
				o.style.setProperty("text-decoration", "line-through");
				li.style.setProperty("opacity", ".5");
			}
		}
	}
	function a2obj(a) {
		return {
			a: a,
			name: a.textContent,
			base: a.getAttribute("href").match(new RegExp("^" + MBS + "(/[^/]+/" + RE_GUID + ")"))[1]
		};
	}
	function workMainPerformer() {
		var sections = document.querySelectorAll("div#content > table.details th");
		var found, fartists = {}, foundartist;
		for (var sec = 0; sec < sections.length; sec++) {
			var type = sections[sec].textContent.match(/^(.+):$/);
			if (type && type[1] == "recordings") {
				found = sections[sec];
				break;//TODO: fallback to live / instr / etc.
			}
		}
		if (found) {
			var perfs = getParent(found, "tr").querySelectorAll("td a[href^='" + MBS + "/artist/']");
			for (var perf = 0; perf < perfs.length; perf++) {
				var href = perfs[perf].getAttribute("href");
				if (!fartists[href]) {
					fartists[href] = [];
				}
				fartists[href].push(perfs[perf]);
			}
			var max = 0;
			for (var w in fartists) if (fartists.hasOwnProperty(w) && fartists[w].length > max) {
				max = fartists[w].length;
				foundartist = fartists[w][0];
			}
		}
		return foundartist;
	}
})();
