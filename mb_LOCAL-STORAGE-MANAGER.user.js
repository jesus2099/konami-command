"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         mb. LOCAL STORAGE MANAGER
// @version      2016.6.15
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_LOCAL-STORAGE-MANAGER.user.js
// @description  musicbrainz.org: Read, write, edit and delete key/values from your mb local storage (in About menu)
// @homepage     http://userscripts-mirror.org/scripts/show/126475
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_LOCAL-STORAGE-MANAGER
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_LOCAL-STORAGE-MANAGER.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_LOCAL-STORAGE-MANAGER.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-02-22
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.mbsandbox.org/*
// @match        *://*.musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
}};
if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
	var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
	while ((kv = row.exec(meta.rawmdb)) !== null) {
		if (meta[kv[1]]) {
			if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
			meta[kv[1]].push(kv[2]);
		} else meta[kv[1]] = kv[2];
	}
}
var userjs = "jesus2099userjs126475";
var lsm, lskeys;
var j2set = document.querySelector("div.header ul.menu li.about > ul > li.jesus2099");
if (!j2set && (j2set = document.querySelector("div.header ul.menu li.about > ul"))) {
	j2set.parentNode.querySelector("span.menu-header").style.setProperty("text-shadow", "0 0 8px purple");
	j2set = j2set.appendChild(createTag("li", {a: {class: "jesus2099 separator"}}));
}
if (j2set) {
	addAfter(createTag("li", {a: {class: "jesus2099"}},
	createTag("a", {a: {title: meta.description.replace(/^[^:]+: /, "")}, e: {click: function(event) {
			this.parentNode.parentNode.style.removeProperty("left");
			if (lsm) { unloadLS(); } else {
				lskeys = [];
				lsm = document.body.insertBefore(createTag("div", {a: {id: userjs + "lsm"}}, createTag("h2", {}, [
					meta.name + " (",
					createTag("a", {a: {title: "Add a new key"}, e:{click: function(event) {
						loadLS();
						var key = prompt("Type new key name");
						if (key) {
							if (lskeys.indexOf(key) == -1 || confirm("THIS KEY ALREADY EXISTS\r\nDo you want to replace it\u00a0?\r\n\r\n“" + key + "”\u00a0:\r\n" + localStorage.getItem(key))) {
								var newValue = prompt("Type value for key “" + key + "”");
								if (newValue) {
									localStorage.setItem(key, newValue);
									loadLS();
								}
							}
						}
					}}}, "new"),
					"/",
					createTag("a", {a: {title: "Browse all local storage keys"}, e: {click: function(event) { loadLS(); }}}, "reload"),
					"/",
					createTag("a", {a: {title: "Clear all local storage keys"}, e: {click: function(event) {
						loadLS();
						if (!event.shiftKey) { alert("SHIFT+CLICK\r\n\r\nIn order to avoid GROß MALHEUR,\r\nyou must hold down shift key\r\nif you really really want to erase\r\nall your local storage for this website."); return true; }
						if (confirm("Are you sure you want to clear all those keys\r\nfrom your local storage memory\r\nfor this website?\r\nYOU CANNOT UNDO THIS ACTION.")) {
							localStorage.clear();
							loadLS();
						} 
					}}}, "clear"),
					"/",
					createTag("a", {a: {title: "Close local storage manager"}, e: {click: function(event){unloadLS();}}}, "close"),
					")"
				])), document.getElementById("page"));
				if (self.opera) lsm.appendChild(createTag("p", {}, "☞ Opera 12 has its own local storage editor: CTRL+SHIFT+I (Dragon fly) > Storage > Local Storage."));
				else if (navigator.userAgent.match(/firefox/i)) lsm.appendChild(createTag("p", {}, "☞ Firefox’s Firebug has its own local storage editor: DOM > localStorage."));
				else if (navigator.userAgent.match(/chrom(ium|e)/i)) lsm.appendChild(createTag("p", {}, "☞ Chromium has its own local storage editor: F12 > Resources > Local Storage."));
				document.addEventListener("storage", function(event) { loadLS(); }, false);/*does never trigger btw*/
				loadLS();
				lsm.scrollIntoView();
			}
		}}}, meta.name)
	), j2set);
}
function unloadLS() {
	lsm.parentNode.removeChild(lsm);
	lsm = null;
	lskeys = null;
}
function loadLS() {
	var keylist = createTag("table", {a: {cellspacing: "0", cellpadding: "0"}, s: {border: "2px dashed red", "background-color": "#eee", padding: "8px", margin: "8px"}});
	lskeys = [];
	for (var ls = 0; ls < localStorage.length; ls++) {
		lskeys.push(localStorage.key(ls));
	}
	lskeys.sort();
	addRow(keylist, ["#", "Key", "Content", "\u00a0", "Size (characters)"], "th");
	var size = 0;
	for (var k = 0; k < lskeys.length; k++) {
		var key = lskeys[k];
		var content = localStorage.getItem(key);
		size += content.length;
		var tr = addRow(keylist, [
			(k+1) + ".\u00a0",
			createTag("code", {}, key),
			content.length > 64 || content.match(/(\n|\r)/) ? content.substr(0, 64) + (content.length > 64 ? "…" : "") : content,
			concat([
				" ",
				createA(
					"×",
					function(event) {
						stop(event);
						var item = this.getAttribute("title").match(/^remove (.+)$/)[1];
						if (confirm("Do you want to remove following item?\r\n" + item)) {
							localStorage.removeItem(item);
						}
						loadLS();
					},
					"remove " + key
				),
			]),
			content.length+""
		]);
		tr.setAttribute("title", "edit " + key);
		tr.addEventListener("click", function(event){
			function coolstuff(t,z,s,b,o) {
				var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
				truc.style.setProperty("position", "fixed");
				truc.style.setProperty("z-index", z);
				truc.style.setProperty("top", (100 - s) / 2 + "%");
				truc.style.setProperty("left", (100 - s ) / 2 + "%");
				truc.style.setProperty("width", s + "%");
				truc.style.setProperty("height", s + "%");
				if (b) { truc.style.setProperty("background-color", b); }
				if (o) { truc.style.setProperty("opacity", o); }
				return truc;
			}
			var bidule = coolstuff("div", "50", 100, "black", ".6");
			bidule.setAttribute("title", this.getAttribute("title").match(/^edit (.+)$/)[1]);
			bidule.addEventListener("click", function(event) {
				this.nextSibling.setAttribute("disabled", "disabled");
				var item = this.getAttribute("title");
				var oval = localStorage.getItem(item);
				var nval = this.nextSibling.value;
				if (oval != nval && confirm("Do you want to save following item?\r\n" + item)) {
					localStorage.setItem(item, nval);
				}
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this);
				loadLS();
			}, false);
			bidule = coolstuff("textarea", "55", 80);
			bidule.addEventListener("keypress", function(event) {
				if (event.keyCode == 27) { this.previousSibling.click(); }
			}, false);
			bidule.appendChild(document.createTextNode(localStorage.getItem(this.getAttribute("title").match(/^edit (.+)$/)[1])));
			bidule.setAttribute("title", "press ESC to close");
			bidule.select();
		}, false);
	}
	addRow(keylist, ["\u00a0", "\u00a0", "\u00a0", "\u00a0", size + ""]);
	var lsm = document.getElementById(userjs + "lsm");
	var lsmkeys = lsm.querySelector("table");
	if (lsmkeys) { lsm.replaceChild(keylist, lsmkeys); }
	else { lsm.appendChild(keylist); }
}
function decorate(event, tr, over) {
	tr.style.setProperty("text-shadow", over ? "1px 2px 2px #999" : "none");
	tr.style.setProperty("background-color", over ? "white" : "transparent");
}
function addRow(table, cells, type) {
	var tr = table.appendChild(document.createElement("tr"));
	if (type == "ev") { tr.className = "ev"; }
	tr.addEventListener("mouseover", function(event) { decorate(event, this, true); }, false);
	tr.addEventListener("mouseout", function(event) { decorate(event, this, false); }, false);
	tr.style.setProperty("cursor", type == "th" ? "default" : "pointer");
	for (var cell = 0; cell < cells.length; cell++) {
		var td = tr.appendChild(document.createElement(type == "th" ? "th" : "td"));
		td.style.setProperty("padding", "0 4px");
		td.appendChild(typeof cells[cell] == "string" ? document.createTextNode(cells[cell]) : cells[cell]);
	}
	return tr;
}
function concat(tstuff) {
	var concats = document.createDocumentFragment();
	var stuff = tstuff;
	if (typeof stuff != "object" || !stuff.length) {
		stuff = [stuff];
	}
	for (var thisStuff = 0; thisStuff < stuff.length; thisStuff++) {
		concats.appendChild(typeof stuff[thisStuff] == "string" ? document.createTextNode(stuff[thisStuff]) : stuff[thisStuff]);
	}
	return concats;
}
function createTag(tag, gadgets, children) {
	var t = (tag == "fragment" ? document.createDocumentFragment() : document.createElement(tag));
	if(t.tagName) {
		if (gadgets) {
			for (var attri in gadgets.a) if (gadgets.a.hasOwnProperty(attri)) { t.setAttribute(attri, gadgets.a[attri]); }
			for (var style in gadgets.s) if (gadgets.s.hasOwnProperty(style)) { t.style.setProperty(style.replace(/!/g, ""), gadgets.s[style].replace(/!/g, ""), style.match(/!/) || gadgets.s[style].match(/!/) ? "important" : ""); }
			for (var event in gadgets.e) if (gadgets.e.hasOwnProperty(event)) { t.addEventListener(event, gadgets.e[event], false); }
		}
		if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) t.style.setProperty("cursor", "pointer");
	}
	if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child = 0; child < chldrn.length; child++) { t.appendChild(typeof chldrn[child] == "string" ? document.createTextNode(chldrn[child]) : chldrn[child]); } t.normalize(); }
	return t;
}
function createA(text, link, title) {
	var a = document.createElement("a");
	if (link && typeof link == "string") {
		a.setAttribute("href", link);
	}
	else {
		if (link && typeof link == "function") {
			a.addEventListener("click", link, false);
		}
		a.style.setProperty("cursor", "pointer");
	}
	if (title){ a.setAttribute("title", title); }
	a.appendChild(document.createTextNode(text));
	return a;
}
function addAfter(n, e) {
	if (n && e && e.parentNode) {
		if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
		else { return e.parentNode.appendChild(n); }
	} else { return null; }
}
function stop(e) {
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	e.preventDefault();
	return false;
}
