// ==UserScript==
// @name         mb. FUNKEY ILLUSTRATED RECORDS
// @version      2020.9.24
// @description  musicbrainz.org: CAA front cover art archive pictures/images (release groups and releases) Big illustrated discography and/or inline everywhere possible without cluttering the pages
// @compatible   vivaldi(3.1.1929.34)+violentmonkey  my setup
// @compatible   firefox(77.0.1)+greasemonkey        my setup
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-12-19; http://userscripts-mirror.org/scripts/show/154481
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match        *://*.mbsandbox.org/artist/*
// @match        *://*.mbsandbox.org/cdtoc/*
// @match        *://*.mbsandbox.org/collection/*
// @match        *://*.mbsandbox.org/label/*
// @match        *://*.mbsandbox.org/recording/*
// @match        *://*.mbsandbox.org/series/*
// @match        *://*.mbsandbox.org/tag/*
// @match        *://*.mbsandbox.org/user/*/ratings*
// @match        *://*.mbsandbox.org/user/*/tag/*
// @match        *://*.musicbrainz.org/artist/*
// @match        *://*.musicbrainz.org/cdtoc/*
// @match        *://*.musicbrainz.org/collection/*
// @match        *://*.musicbrainz.org/label/*
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/series/*
// @match        *://*.musicbrainz.org/tag/*
// @match        *://*.musicbrainz.org/user/*/ratings*
// @match        *://*.musicbrainz.org/user/*/tag/*
// @include      /^https?:\/\/(\w+\.mbsandbox|(\w+\.)?musicbrainz)\.org\/release[-_]group\/.+$/
// @include      /^https?:\/\/(\w+\.mbsandbox|(\w+\.)?musicbrainz)\.org\/release\/merge(\?.*)?$/
// @include      /^https?:\/\/(\w+\.mbsandbox|(\w+\.)?musicbrainz)\.org\/search\/edits\?.+/
// @include      /^https?:\/\/(\w+\.mbsandbox|(\w+\.)?musicbrainz)\.org\/search\?.*type=(annotation|release(_group)?).*$/
// @exclude      *.org/*/*/edit
// @exclude      *.org/*/*/edit?*
// @exclude      *.org/cdtoc/remove*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
"use strict";

/*---CONFIG-START---*/
var bigpics = true; /*displays big pics illustrated discography in main artist page*/
var smallpics = true; /*displays small pics for every releases and release groups, everywhere*/
var colour = "yellow"; /*used for various mouse-over highlights*/
/*---CONFIG-STOPR---*/

var chrome = "Please run “mb. FUNKEY ILLUSTRATED RECORDS” with (Grease/Tamper/Violent)monkey instead of plain Chrome.";
var userjs = "jesus2099userjs154481";
var SMALL_SIZE = "42px";
var BIG_SIZE = "125px";
var types = ["release-group", "release"];

var caaIcons = document.querySelectorAll("a[href$='/cover-art'] > span.caa-icon");
if (caaIcons.length > 0) {
	smallpics = false;
	for (var ci = 0; ci < caaIcons.length; ci++) {
		loadCaaIcon(caaIcons[ci]);
	}
}
var imgurls = [];
for (var t = 0; t < types.length; t++) {
	var as = document.querySelectorAll("tr > td a[href^='/" + types[t] + "/'], div#page.fullwidth ul:not(.tabs) > li a[href^='/" + types[t] + "/']");
	var istable, istablechecked, artistcol;
	for (var a = 0; a < as.length; a++) {
		var imgurl = as[a].getAttribute("href").match(new RegExp("^/" + types[t] + "/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"));
		if (imgurl) {
			imgurl = "//coverartarchive.org/" + types[t] + "/" + imgurl[1] + "/front";
			if (!istablechecked) {
				istable = getParent(as[0], "table");
				if (istable) { artistcol = document.evaluate(".//thead/tr/th[contains(./text(), 'Artist') or contains(./a/text(), 'Artist')]", istable, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength == 1; }
				istablechecked = true;
			}
			if (smallpics && types[t] == "release-group" && !self.location.pathname.match(/(open_)?edits$/) && !self.location.pathname.match(/^\/search\/edits/)) {
				var margin = "-12px 0px -14px 0px";
				loadCaaIcon(as[a].parentNode.insertBefore(
					createTag("a", {a: {ref: as[a].getAttribute("href")}},
						createTag("span", {a: {class: "caa-icon " + userjs}})
					)
				, as[a]).firstChild);
			}
			document.body.addEventListener("click", function(event) {
				for (var imgs = document.querySelectorAll("img[_size='full']." + userjs), i = 0; i < imgs.length; i++) {
					big(event, imgs[i], SMALL_SIZE);
				}
			});
			var tr = getParent(as[a], "tr") || getParent(as[a], "li");
			tr.addEventListener("mouseover", updateBig, false);
			tr.addEventListener("mouseout", updateBig, false);
			// I don’t know if this box does still exist sometimes afer server update 2019-06-03 https://blog.musicbrainz.org/?p=7439 https://tickets.metabrainz.org/browse/MBS-9849
			var box = getParent(as[a], "table") || getParent(as[a], "ul");
			if (bigpics && imgurls.indexOf(imgurl) < 0 && (box = box.previousSibling && box.previousSibling.tagName == "DIV" && box.previousSibling.classList.contains(userjs + "bigbox") ? box.previousSibling : box.parentNode.insertBefore(createTag("div", {a: {class: userjs + "bigbox"}}), box))) {
				var artisttd = artistcol && getSibling(getParent(as[a], "td"), "td");
				box.appendChild(createTag("a", {a: {href: as[a].getAttribute("href"), title: as[a].textContent + (artisttd ? "\n" + artisttd.textContent.trim() : "")}, s: {display: "inline-block", height: "100%", margin: "8px 8px 4px 4px"}}, [
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
function loadCaaIcon(caaIcon) {
	if (caaIcon.classList.contains(userjs)) {
		// https://tickets.metabrainz.org/browse/MBS-11059
		// For the moment, release group CAA icons have to be added by userscript
		var CAALoader = new XMLHttpRequest();
		CAALoader.addEventListener("load", function(event) {
			var RGCAAThumbnailFound = false;
			if (this.status == 200) {
				var RGCAA = JSON.parse(this.responseText);
				for (var i = 0; i < RGCAA.images.length; i++) {
					if (RGCAA.images[i].approved && RGCAA.images[i].front) {
						caaIcon.parentNode.setAttribute("href", RGCAA.release + "/cover-art");
						caaIcon.style.setProperty("background-size", "contain");
						caaIcon.style.setProperty("background-image", "url(" + RGCAA.images[i].thumbnails.small.replace(/^https?:\/\//, "//") + ")");
						RGCAAThumbnailFound = true;
						break;
					}
				}
			}
			if (!RGCAAThumbnailFound) {
				console.log("Approved front cover art thumbnail not found for " + CAALoader.releaseGroup);
				removeNode(caaIcon.parentNode);
			}
		});
		CAALoader.addEventListener("error", function(event) {
			console.log("Error " + CAALoader.status + ": " + CAALoader.statustext + " for " + CAALoader.releaseGroup);
			removeNode(caaIcon.parentNode);
		});
		CAALoader.releaseGroup = caaIcon.parentNode.getAttribute("ref");
		CAALoader.open("GET", "https://coverartarchive.org/" + caaIcon.parentNode.getAttribute("ref").match(/release(?:-group)?\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/), true);
		CAALoader.send(null);
	} else {
		// Adding thumbnails to release CAA icons
		var imgurl = "//coverartarchive.org/" + caaIcon.parentNode.getAttribute("href").match(/release(?:-group)?\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/) + "/front-250";
		createTag("img", {
			a: { src: imgurl },
			e: {
				load: function(event) {
					caaIcon.style.setProperty("background-size", "contain");
					caaIcon.style.setProperty("background-image", "url(" + this.getAttribute("src") + ")");
				}
			}
		});
	}
}
