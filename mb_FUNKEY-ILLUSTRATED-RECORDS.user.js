// ==UserScript==
// @name         mb. FUNKEY ILLUSTRATED RECORDS
// @version      2022.9.26.1
// @description  musicbrainz.org: CAA front cover art archive pictures/images (release groups and releases) Big illustrated discography and/or inline everywhere possible without cluttering the pages
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_FUNKEY-ILLUSTRATED-RECORDS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-12-19; https://web.archive.org/web/20131103163409/userscripts.org/scripts/show/154481 / https://web.archive.org/web/20141011084022/userscripts-mirror.org/scripts/show/154481
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/[^/]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(open_)?edits/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/(artist|cdtoc|collection|label|recording|series|tag)\//
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release[-_]group\/.+$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/merge(\?.*)?$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\/edits\?.+/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\?.*type=(annotation|release(_group)?).*$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/user\/[^/]+\/edits/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/user\/[^/]+\/(ratings|tag\/)/
// @exclude      *.org/*/*/edit
// @exclude      *.org/*/*/edit?*
// @exclude      *.org/cdtoc/remove*
// @run-at       document-end
// ==/UserScript==
"use strict";

/* ---CONFIG-START--- */
var bigpics = true; // displays big pics illustrated discography in main artist page
var smallpics = true; // displays small pics for every releases and release groups, everywhere
var colour = "yellow"; // used for various mouse-over highlights
/* ---CONFIG-STOPR--- */

let userjs = "jesus2099userjs154481"; // linked in mb. MERGE HELPOR 2, mb_HIDE-DIGITAL-RELEASES and mb_PRINT-ALL-PAGES
let types = ["release-group", "release"];
let GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";

// Hide MBS-11059 release group CAA icon, once my linked and thumbnailed CAA icon is loading
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("table.tbl.release-group-list > tbody > tr > td > a[href$='/cover-art'] ~ span.caa-icon { display: none; }", 0);
// Add thumbnail in MBS release CAA icons
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
		var imgurl = as[a].getAttribute("href").match(new RegExp("^/" + types[t] + "/(" + GUID + ")$"));
		if (imgurl) {
			imgurl = "//coverartarchive.org/" + types[t] + "/" + imgurl[1] + "/front";
			if (!istablechecked) {
				istable = getParent(as[0], "table");
				if (istable) { artistcol = document.evaluate(".//thead/tr/th[contains(./text(), 'Artist') or contains(./a/text(), 'Artist')]", istable, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength == 1; }
				istablechecked = true;
			}
// SMALL PICS
// ----------
			if (smallpics && !self.location.pathname.match(/(open_)?edits$/) && !self.location.pathname.match(/^\/search\/edits/)) {
				if (types[t] == "release-group") {
					var CAALoader = new XMLHttpRequest();
					CAALoader.addEventListener("load", function(event) {
						if (this.status == 200) {
							var RGCAA = JSON.parse(this.responseText);
							if (RGCAA.images.length > 0) {
								var releaseGroupOrSpanMp = this.releaseGroup;
								if (releaseGroupOrSpanMp.parentNode.tagName == "SPAN" && releaseGroupOrSpanMp.parentNode.classList.contains("mp")) {
									// release group has pending edits, thus, a span.mp parent
									releaseGroupOrSpanMp = releaseGroupOrSpanMp.parentNode;
								}
								loadCaaIcon(releaseGroupOrSpanMp.parentNode.insertBefore(
									createTag("a",
										{a: {
											href: RGCAA.release + "/cover-art",
											ref: this.releaseGroup.getAttribute("href"),
											title: RGCAA.images.length + " image" + (RGCAA.images.length != 1 ? "s" : "") + " found in this release"
										}},
										createTag("span", {a: {class: "caa-icon " + userjs}})
									),
									releaseGroupOrSpanMp.parentNode.firstChild).firstChild
								);
							}
						} else {
							console.log("Error " + this.status + " (" + this.statusText + ") for " + this.releaseGroup);
						}
					});
					CAALoader.addEventListener("error", function(event) {
						console.log("Error " + this.status + " (" + this.statusText + ") for " + this.releaseGroup);
					});
					CAALoader.releaseGroup = as[a];
					CAALoader.open("GET", "https://coverartarchive.org" + as[a].getAttribute("href").match(new RegExp("/release-group/" + GUID)), true);
					CAALoader.send(null);
				}
			}
			// TODO: I think there is no longer any UL LI, now only TABLE TR, I guess but not sure...
			var box = getParent(as[a], "table") || getParent(as[a], "ul");
			box.addEventListener("mouseover", updateBig);
			box.addEventListener("mouseout", updateBig);
// BIG PICS
// --------
			if (bigpics && (box = box.previousSibling && box.previousSibling.tagName == "DIV" && box.previousSibling.classList.contains(userjs + "bigbox") ? box.previousSibling : box.parentNode.insertBefore(createTag("div", {a: {class: userjs + "bigbox"}}), box))) {
				if (!self.location.pathname.match(/\/recordings/) || self.location.pathname.match(/\/recordings/) && imgurls.indexOf(imgurl) < 0) {
					var artisttd = artistcol && getSibling(getParent(as[a], "td"), "td");
					// textContent is faster but shows <script> content. artisttd contains React? <script> when pending AC edits. https://kellegous.com/j/2013/02/27/innertext-vs-textcontent/
					box.appendChild(createTag("a", {a: {href: as[a].getAttribute("href"), title: as[a].textContent + (artisttd ? "\n" + artisttd.innerText.trim() : "")}, s: {display: "inline-block", height: "100%", margin: "8px 8px 4px 4px"}}, [
						"⌛",
						createTag("img", {
							a: {src: imgurl + "-250", alt: as[a].textContent},
							s: {verticalAlign: "middle", display: "none", maxHeight: "125px", boxShadow: "1px 1px 4px black"},
							e: {
								load: function(event) { removeNode(this.parentNode.firstChild); this.style.setProperty("display", "inline"); },
								error: function(event) { removeNode(this.parentNode); },
								mouseover: updateA,
								mouseout: updateA
							}
						})
					]));
					imgurls.push(imgurl);
				}
			}
		}
	}
}

function updateA(event) {
	var ah = this.parentNode.getAttribute("href");
	var rels = document.querySelectorAll("tr > td a[href='" + ah + "'], div#page.fullwidth ul > li a[href='" + ah + "']");
	for (var r = 0; r < rels.length; r++) {
		if (event.type == "mouseover") {
			rels[r].style.setProperty("background-color", colour);
		} else {
			rels[r].style.removeProperty("background-color");
		}
	}
}
function updateBig(event) {
	var tr = getParent(event.target, "tr") || getParent(event.target, "li");
	if (tr) {
		var img = tr.querySelector("a[href^='/release']:not([href$='/cover-art'])");
		if (img) {
			img = document.querySelector("div." + userjs + "bigbox > a > img[src='//coverartarchive.org" + img.getAttribute("href") + "/front-250']");
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
}
function loadCaaIcon(caaIcon) {
	// Adding thumbnails to release CAA icons
	var imgurl = caaIcon.parentNode.getAttribute("ref") || caaIcon.parentNode.getAttribute("href").replace(/\/cover-art/, "");
	imgurl = "//coverartarchive.org" + imgurl + "/front-250";
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
