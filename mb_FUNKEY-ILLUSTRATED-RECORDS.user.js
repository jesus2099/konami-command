"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         mb. FUNKEY ILLUSTRATED RECORDS
// @version      2015.10.16
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @description  musicbrainz.org: CAA front cover art archive pictures/images (release groups and releases) Big illustrated discography and/or inline everywhere possible without cluttering the pages
// @homepage     http://userscripts-mirror.org/scripts/show/154481
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-12-19
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=70394&v=2015.8.27
// @grant        none
// @include      http*://*.mbsandbox.org/
// @include      http*://*.mbsandbox.org/artist/*
// @include      http*://*.mbsandbox.org/cdtoc/*
// @include      http*://*.mbsandbox.org/collection/*
// @include      http*://*.mbsandbox.org/label/*
// @include      http*://*.mbsandbox.org/recording/*
// @include      http*://*.mbsandbox.org/release/*
// @include      http*://*.mbsandbox.org/release-group/*
// @include      http*://*.mbsandbox.org/search?*type=annotation*
// @include      http*://*.mbsandbox.org/search?*type=release*
// @include      http*://*.mbsandbox.org/series/*
// @include      http*://*.mbsandbox.org/tag/*
// @include      http*://*.mbsandbox.org/user/*/ratings*
// @include      http*://*.mbsandbox.org/user/*/tag/*
// @include      http*://*musicbrainz.org/
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/cdtoc/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/search?*type=annotation*
// @include      http*://*musicbrainz.org/search?*type=release*
// @include      http*://*musicbrainz.org/series/*
// @include      http*://*musicbrainz.org/tag/*
// @include      http*://*musicbrainz.org/user/*/ratings*
// @include      http*://*musicbrainz.org/user/*/tag/*
// @exclude      *.org/cdtoc/remove*
// @exclude      *.org/release/*/*edit*
// @exclude      *.org/series/*/*edit*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
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
/*---CONFIG-START---*/
var bigpics = true; /*displays big pics illustrated discography in main artist page*/
var smallpics = true; /*displays small pics for every releases and release groups, everywhere*/
var forceHTTP = true; /*as long as HTTP is being faster on CAA (less latency), you can force it for CAA images even if when you are using HTTPS for musicbrainz*/
var colour = "yellow"; /*used for various mouse-over highlights*/
/*---CONFIG-STOPR---*/
var chrome = "Please run “" + meta.name + "” with Tampermonkey instead of plain Chrome.";
var userjs = "jesus2099userjs154481";
var CAA_URL = (forceHTTP ? "http:" : "") + "//coverartarchive.org/%type%/%mbid%/front";
var SMALL_SIZE = "42px";
var BIG_SIZE = "125px";
var types = ["release-group", "release"];
var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var imgurls = [];
if (forceHTTP && location.protocol == "https:") {
	var caa = document.querySelectorAll("img[src^='//coverartarchive.org/release']");
	for (var c = 0; c < caa.length; c++) caa[c].setAttribute("src", "http:"+caa[c].getAttribute("src"));
}
if (!location.pathname.match(/^\/$|^\/release\//)) for (var t=0; t<types.length; t++) {
	var as = document.querySelectorAll("tr > td a[href*='musicbrainz.org/" + types[t] + "/'], div#page.fullwidth ul > li a[href*='musicbrainz.org/" + types[t] + "/']");
	var istable, istablechecked, artistcol;
	for (var a = 0; a < as.length; a++) if (as[a].getAttribute("href").match(new RegExp("musicbrainz.org/" + types[t] + "/" + RE_GUID + "$"))) {
		if (!istablechecked) {
			istable = getParent(as[0], "table");
			if (istable) { artistcol = document.evaluate(".//thead/tr/th[contains(./text(), 'Artist') or contains(./a/text(), 'Artist')]", istable, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength == 1; }
			istablechecked = true;
		}
		var imgurl = CAA_URL.replace(/%type%/, types[t]).replace(/%mbid%/,as[a].getAttribute("href").match(new RegExp(RE_GUID)));
		if (smallpics) {
			var margin = "-12px 0px -14px 0px";
			as[a].parentNode.insertBefore(
				createTag("div", {s: {float: "right", marginRight: ".5em"}}, [
					"⌛",
					createTag("a", {a: {href: imgurl}, s: {display: "none"}}, [
						createTag("img", {
							a: {alt: as[a].textContent, class: userjs, title: "click to enlarge", src: imgurl + "-250", "_size": "_", "_margin": margin, "_istable": istable ? "1" : "0"},
							s: {cursor: "pointer", boxShadow: "1px 1px 4px black", margin: margin, padding: "none", position: "relative", zIndex: "1"},
							e: {
								click: function(event) { big(event, this, SMALL_SIZE); },
								load: function(event) { this.setAttribute("_height", this.height + "px"); this.setAttribute("_width", this.width+"px"); this.style.setProperty("height", "0"); removeNode(this.parentNode.parentNode.firstChild); this.parentNode.style.setProperty("display", "inline"); big(event, this, SMALL_SIZE) },
								error: function(event) { removeNode(this.parentNode.parentNode); },
								mouseover: function(event) { this.style.setProperty("z-index", "2"); this.parentNode.parentNode.nextSibling.style.setProperty("background-color", colour); },
								mouseout: function(event) { if(this.getAttribute("_size") != "full") this.style.setProperty("z-index", "1"); this.parentNode.parentNode.nextSibling.style.removeProperty("background-color"); }
							}
						})
					])
				])
			, as[a]);
		}
		document.body.addEventListener("click", function(event) {
			for (var imgs = document.querySelectorAll("img[_size='full']." + userjs), i = 0; i < imgs.length; i++) {
				big(event, imgs[i], SMALL_SIZE);
			}
		});
		var tr = getParent(as[a], "tr") || getParent(as[a], "li");
		tr.addEventListener("mouseover", updateBig, false);
		tr.addEventListener("mouseout", updateBig, false);
		var box = getParent(as[a], "table") || getParent(as[a], "ul");
		if (bigpics && imgurls.indexOf(imgurl) < 0 && (box = box.previousSibling.tagName == "DIV" && box.previousSibling.classList.contains(userjs + "bigbox") ? box.previousSibling : box.parentNode.insertBefore(createTag("div", {a: {class: userjs + "bigbox"}}), box))) {
			var artisttd = artistcol && getSibling(getParent(as[a], "td"), "td");
			box.appendChild(createTag("a", {a: {href: as[a].getAttribute("href"), title: as[a].textContent + (artisttd ? "\r\n" + artisttd.textContent.trim() : "")}, s: {display: "inline-block", height: "100%", margin: "8px 8px 4px 4px"}}, [
				"⌛",
				createTag("img", {
					a: {src: imgurl + "-250", alt: as[a].textContent},
					s: {verticalAlign: "middle", display: "none", maxHeight: "20px", boxShadow: "1px 1px 4px black"},
					e: {
						load: function(event) { removeNode(this.parentNode.firstChild); this.style.setProperty("display", "inline"); try{jQuery(this).animate({"max-height": BIG_SIZE}, 200); } catch(error) { this.style.setProperty("max-height", BIG_SIZE); console.log(error.message + "!\n" + chrome); } },
						error: function(event) { removeNode(this.parentNode); },
						mouseover: updateA,
						mouseout: updateA
					}
				})
			]));
		}
		imgurls.push(imgurl);
	}
}
function updateA(event) {
	var ah = this.parentNode.getAttribute("href");
	var rels = document.querySelectorAll("tr > td a[href='" + ah + "'], div#page.fullwidth ul > li a[href='" + ah + "']");
	for (var r = 0; r < rels.length; r++) {
		if (event.type == "mouseover") { rels[r].style.setProperty("background-color", colour); }
		else { rels[r].style.removeProperty("background-color"); }
	}
}
function updateBig(event) {
	var img = this.querySelector("img[_height]");
	if (img) {
		img = document.querySelector("div." + userjs + "bigbox > a > img[src='" + img.getAttribute("src") + "']");
		if (img) {
			if (event.type == "mouseover") {
				img.parentNode.style.setProperty("border", "4px solid " + colour);
				img.parentNode.style.setProperty("margin", img.parentNode.style.getPropertyValue("margin").replace(/\.\d*/g, "").replace(/-?\d+/g, function(number) { return +number - 4; }));
			} else {
				img.parentNode.style.removeProperty("border");
				img.parentNode.style.setProperty("margin", img.parentNode.style.getPropertyValue("margin").replace(/\.\d*/g, "").replace(/-?\d+/g, function(number) { return +number + 4; }));
			}
		}
	}
}
function big(event, img, smallSize) {
	if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
		if (event.target.classList.contains(userjs)) stop(event);
		var enlarge = (img.getAttribute("_size") == "small");
		var height = enlarge ? (img.getAttribute("_height") || "250px") : smallSize;
		var margin = enlarge ? ("-" + (parseInt(img.getAttribute("_height"), 10) / 2) + "px -" + (parseInt(img.getAttribute("_width"), 10) / 2) + "px") : img.getAttribute("_margin");
		if (enlarge) {
			img.style.setProperty("z-index", "2");
		}
		img.setAttribute("_size", enlarge ? "full" : "small");
		try {
			jQuery(img).animate({height: height, margin: margin}, event.type == "load" ? 100 : 200, complete);
		} catch(error) {
			img.style.setProperty("height", height);
			img.style.setProperty("margin", margin);
			complete(img);
			console.log(error.message + "!\n" + chrome);
		}
	}
}
function complete(fallback) {
	var node = (this || fallback);
	var enlarge = (node.getAttribute("_size") == "full");
	node.setAttribute("title", node.getAttribute("title").replace(/\w+$/, enlarge ? "shrink" : "enlarge"));
	node.style.setProperty("z-index", enlarge ? "2" : "1");
}
