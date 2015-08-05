// ==UserScript==
// @name         mb. PENDING EDITS
// @version      2015.8.5.1555
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PENDING-EDITS.user.js
// @description  musicbrainz.org: Adds/fixes links to entity (pending) edits (if any); optionally adds links to associated artist(s) (pending) edits
// @homepage     http://userscripts-mirror.org/scripts/show/42102
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own browsing setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
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
//               addAfter(newNode, existingNode)
//               createTag(tag, gadgets, children)
//               getParent(startingNode, searchedTag, searchedCssClass, searchedId)
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
/*START OF CONFIGURATION - --- - --- - --- - */
/*true: show additional artist "editing history" and "open edits" links on some non artist pages.
It will add other request(s) to MB server, this is why it is an option.*/
	var addArtistLinks = true;
/*END OF CONFIGURATION - --- - --- - --- - */
	var userjs = "jesus2099userjs42102";
	var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var loc, entity, checked = [], xhrPendingEdits = {};
	var MBS = location.protocol + "//" + location.host;
	var account = document.querySelector("div#header li.account a[href^='" + MBS + "/user/']");
/*EDITING HISTORY*/
	if (
		account &&
		(account = unescape(account.getAttribute("href").match(/[^/]+$/))) &&
		document.querySelector("div#sidebar") &&
		(loc = location.pathname.match(new RegExp("^/(area|artist|collection|event|label|place|release-group|release|recording|series|work|url)/(" + RE_GUID + ")"))) &&
		(entity = document.querySelector("div#content > div.tabs > ul.tabs > li > a")) &&
		(entity = a2obj(entity))
	) {
		entity.editinghistory = document.querySelector("div#sidebar ul.links a[href='" + MBS + entity.base + "/edits']");
		if (entity.editinghistory) {
			entity.ul = getParent(entity.editinghistory, "ul");
		} else {
			entity.ul = document.querySelector("div#sidebar ul.links");
			entity.editinghistory = createLink(entity, "edits"); /*reverts MBS-57 drawback*/
		}
		entity.li = getParent(entity.editinghistory, "li");
/*OPEN EDITS*/
		entity.openedits = document.querySelector("div#sidebar a[href='" + MBS + entity.base + "/open_edits']");
		if (entity.openedits) {
			entity.openedits = createLink(entity.openedits, "open_edits"); /*fixes MBS-2298*/
		} else {
			entity.openedits = createLink(entity, "open_edits"); /*fixes MBS-3386*/
		}
		checked.push(entity.base);
		checkOpenEdits(entity);
/*ARTIST LINKS*/
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
						art.editinghistory = createLink(entity, "edits", art);
						art.openedits = createLink(entity, "open_edits", art);
						addAfter(document.createElement("hr"), entity.li);
						checkOpenEdits(art);
					}
				}
			}
		}
	}
	function createLink(ent, typ, art) {
		if (ent == entity.openedits && typ == "open_edits" && art == null && ent.parentNode.tagName == "LI") {
			var smp = createTag("span", {a: {class: "mp"}});
			ent.parentNode.replaceChild(smp.appendChild(ent.cloneNode(true)).parentNode, ent);
			return smp.firstChild;
		} else {
			var obj = art || ent;
			var txt = (typ == "edits" ? "editing\u00a0history" : "open\u00a0edits");
			txt = (art ? obj.name + " " + txt : txt.substr(0, 1).toUpperCase() + txt.substr(1));
			var newLink = createTag("li", null, createTag("span", null, createTag("a", {a: {href: obj.base + "/" + typ}}, txt)));
			if (art) {
				addAfter(newLink, ent.li);
			} else if (!art && typ == "edits") {
				ent.ul.appendChild(document.createElement("hr"));
				ent.ul.appendChild(newLink);
			} else {
				ent.ul.insertBefore(newLink, ent.li);
			}
			return newLink;
		}
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
		var txt;
		var tit;
		var li = getParent(obj.openedits, "li");
		var count = li.querySelector("span." + userjs + "count");
		if (typeof pecount == "number") {
			txt = pecount;
			if (more) txt += "+";
			var countTitle = (txt != 0 ? txt : "no") + " pending edit" + (txt != 1 ? "s" : "");
			count.setAttribute("title", countTitle);
			if (pecount == 0) {
				mp(obj.openedits, false);
				tit = countTitle;
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
					tit = titarray.join("\r\n");
					if (pecount > 50) tit += "\r\n…";
				}
			}
		} else {
			txt = pecount.status;
			tit = pecount.responseText;
			count.style.setProperty("background-color", "pink");
		}
		count.replaceChild(document.createTextNode(txt), count.firstChild);
		if (tit) {
			obj.openedits.setAttribute("title", tit);
		}
	}
	function mp(o, set) {
		var li = getParent(o, "li");
		if (set == null) {
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
				break; /*TODO: fallback to live / instr / etc.*/
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
