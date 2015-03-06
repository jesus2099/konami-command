// ==UserScript==
// @name         mb. PENDING EDITS
// @version      2015.3.6.16.6
// @description  musicbrainz.org: Adds/fixes links to entity (pending) edits (if any); optionally adds links to associated artist(s) (pending) edits
// @homepage     http://userscripts-mirror.org/scripts/show/42102
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_PENDING-EDITS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_PENDING-EDITS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2009-02-09
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/area/*
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/place/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/url/*
// @include      http*://*musicbrainz.org/work/*
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
	var MBS = self.location.protocol+"//"+self.location.host;
/*EDITING HISTORY*/
	if (
		document.querySelector("a[href='"+MBS+"/logout']") &&
		document.querySelector("div#sidebar") &&
		(loc = self.location.pathname.match(new RegExp("^/(area|artist|collection|label|place|release-group|release|recording|work|url)/("+RE_GUID+")"))) &&
		(entity = document.querySelector("div#content > div.tabs > ul.tabs > li > a")) &&
		(entity = a2obj(entity))
	) {
		entity.editinghistory = document.querySelector("div#sidebar ul.links a[href='"+MBS+entity.base+"/edits']");
		if (entity.editinghistory) {
			entity.ul = getParent(entity.editinghistory, "ul");
		}
		else {
			entity.ul = document.querySelector("div#sidebar ul.links");
			entity.editinghistory = createLink(entity, "edits");/*reverts MBS-57 drawback*/
		}
		entity.li = getParent(entity.editinghistory, "li");
/*OPEN EDITS*/
		entity.openedits = document.querySelector("div#sidebar a[href='"+MBS+entity.base+"/open_edits']");
		if (entity.openedits) { entity.openedits = createLink(entity.openedits, "open_edits"); }/*fixes MBS-2298*/
		else { entity.openedits = createLink(entity, "open_edits"); }/*fixes MBS-3386*/
		checked.push(entity.base);
		checkOpenEdits(entity);
/*ARTIST LINKS*/
		if (addArtistLinks && !/(area|artist|collection|label)/.test(loc[1])) {
			var artists;
			switch (loc[1]) {
				case "release-group":
				case "release":
				case "recording":
					artists = document.querySelectorAll("p.subheader a[href^='"+MBS+"/artist/']");
					break;
				case "url":
					artists = document.querySelectorAll("div#content a[href^='"+MBS+"/artist/'], div#content a[href^='"+MBS+"/label/']");
					break;
				case "work":
					artists = workMainPerformer();
					if (artists) artists = [artists];
					break;
			}
			if (artists && artists.length && artists.length > 0) {
				for (var arti=artists.length-1; arti>=0; arti--) {
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
			var smp = document.createElement("span");
			smp.className = "mp";
			ent.parentNode.replaceChild(smp.appendChild(ent.cloneNode(true)).parentNode, ent);
			return smp.firstChild;
		}
		else {
			var obj = art || ent;
			var txt = (typ=="edits"?"editing\u00a0history":"open\u00a0edits");
			txt = (art?obj.name+" "+txt:txt.substr(0, 1).toUpperCase()+txt.substr(1));
			var newLink = document.createElement("li").appendChild(document.createElement("span")).appendChild(document.createElement("a")).appendChild(document.createTextNode(txt)).parentNode;
			newLink.setAttribute("href", obj.base+"/"+typ);
			if (art) { addAfter(newLink.parentNode.parentNode, ent.li); }
			else if (!art && typ == "edits") {
				ent.ul.appendChild(document.createElement("hr"));
				ent.ul.appendChild(newLink.parentNode.parentNode);
			}
			else { ent.ul.insertBefore(newLink.parentNode.parentNode, ent.li); }
			return newLink;
		}
	}
	function checkOpenEdits(obj) {
		var smp = getParent(obj.openedits, "li").firstChild;
		var ret = smp.querySelector("span."+userjs+"ret");
		if (!ret) {
			smp.appendChild(document.createTextNode("\u00a0("));
			ret = smp.appendChild(document.createElement("span")).appendChild(document.createTextNode("⌛")).parentNode;
			ret.className = userjs+"ret";
			smp.appendChild(document.createTextNode(")"));
		}
		xhrPendingEdits[obj.base] = {
			"object": obj,
			"xhr": new XMLHttpRequest()
		};
		xhrPendingEdits[obj.base].xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				var xhrpe;
				for (var x in xhrPendingEdits) {
					if (xhrPendingEdits.hasOwnProperty(x) && xhrPendingEdits[x].xhr == this) {
						xhrpe = xhrPendingEdits[x];
						break;
					}
				}
				if (this.status == 200) {
					var editc = this.responseText.match(/found (at least )?(\d+) edits?/i);
					if (editc) { editc = [null, editc[1], parseInt(editc[2], 10)]; }
					else { editc = [null, false, 0] }
					updateLink(xhrpe.object, editc[2], editc[1]);
				} else { updateLink(xhrpe.object, this); }
			}
		};
		xhrPendingEdits[obj.base].xhr.open("get", obj.openedits.getAttribute("href"), true);
		xhrPendingEdits[obj.base].xhr.setRequestHeader("base", obj.base);
		xhrPendingEdits[obj.base].xhr.send(null);
	}
	function updateLink(obj, pecount, more) {
		var txt;
		var tit = "pending edit";
		var li = getParent(obj.openedits, "li");
		var ret = li.querySelector("span."+userjs+"ret");
		if (typeof pecount == "number") {
			txt = pecount;
			if (more) txt += "+";
			tit = txt+" "+tit+(pecount!=1?"s":"");
			if (pecount == 0) {
				mp(obj.openedits, false);
			}
			else if (pecount > 0) { mp(obj.openedits, true); }
		}
		else {
			txt = pecount.status;
			tit = pecount.responseText;
			ret.style.setProperty("background-color", "pink");
		}
		ret.replaceChild(document.createTextNode(txt), ret.firstChild);
		li.setAttribute("title", tit);
	}
	function mp(o, set) {
		var li = getParent(o, "li");
		if (set == null) {
			return li.firstChild.tagName == "SPAN" && li.firstChild.className == "mp";
		}
		else if (typeof set == "boolean" && li.firstChild.tagName == "SPAN") {
			if (set && !mp(o)) {
				li.firstChild.className = "mp";
			}
			else if (!set) {
				if (mp(o)) { li.firstChild.className = ""; }
				o.style.setProperty("text-decoration", "line-through");
				li.style.setProperty("opacity", ".5");
			}
		}
	}
	function a2obj(a) {
		return {
			"a": a,
			"name": a.textContent,
			"base": a.getAttribute("href").match(new RegExp("^"+MBS+"(/[^/]+/"+RE_GUID+")"))[1]
		};
	}
	function workMainPerformer() {
		var sections = document.querySelectorAll("div#content > table.details th");
		var found, fartists = {}, foundartist;
		for (var sec=0; sec < sections.length; sec++) {
			var type = sections[sec].textContent.match(/^(.+):$/);
			if (type && type[1] == "recordings") {
				found = sections[sec];
				break;/*TOTO: fallback to live / instr / etc.*/
			}
		}
		if (found) {
			var perfs = getParent(found, "tr").querySelectorAll("td a[href^='"+MBS+"/artist/']");
			for (var perf=0; perf<perfs.length; perf++) {
				var href = perfs[perf].getAttribute("href");
				if (!fartists[href]) {
					fartists[href] = [];
				}
				fartists[href].push(perfs[perf]);
			}
			var max = 0;
			for (var w in fartists) {
				if (fartists.hasOwnProperty(w) && fartists[w].length > max) {
					max = fartists[w].length;
					foundartist = fartists[w][0];
				}
			}
		}
		return foundartist;
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
	function addAfter(n, e) {
		if (n && e && e.parentNode) {
			if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
			else { return e.parentNode.appendChild(n); }
		} else { return null; }
	}
})();