// ==UserScript==
// @name         mb. FUNKEY ILLUSTRATED RECORDS
// @version      2021.1.12
// @description  musicbrainz.org: CAA front cover art archive pictures/images (release groups and releases) Big illustrated discography and/or inline everywhere possible without cluttering the pages
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_FUNKEY-ILLUSTRATED-RECORDS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-12-19; https://web.archive.org/web/2013/userscripts.org/scripts/show/154481
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/(artist|cdtoc|collection|label|recording|series|tag)\//
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release[-_]group\/.+$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/merge(\?.*)?$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\/edits\?.+/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\?.*type=(annotation|release(_group)?).*$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/user\/[^/]+\/(ratings|tag\/)/
// @exclude      *.org/*/*/edit
// @exclude      *.org/*/*/edit?*
// @exclude      *.org/cdtoc/remove*
// @run-at       document-end
// ==/UserScript==
"use strict";

/*---CONFIG-START---*/
var bigpics = true; /*displays big pics illustrated discography in main artist page*/
var smallpics = true; /*displays small pics for every releases and release groups, everywhere*/
var colour = "yellow"; /*used for various mouse-over highlights*/
/*---CONFIG-STOPR---*/

let userjs = "jesus2099userjs154481";
let types = ["release-group", "release"];
let GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";

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
					// https://tickets.metabrainz.org/browse/MBS-11059
					// For the moment, release group CAA icons have to be added by userscript
					var CAALoader = new XMLHttpRequest();
					CAALoader.addEventListener("load", function(event) {
						var RGCAAThumbnailFound = false;
						if (this.status == 200) {
							var RGCAA = JSON.parse(this.responseText);
							if (RGCAA.images.length > 0) {
								loadCaaIcon(this.releaseGroup.parentNode.insertBefore(
									createTag("a", {a: {
											href: RGCAA.release + "/cover-art",
											ref: this.releaseGroup.getAttribute("href"),
											title: RGCAA.images.length + " image" + (RGCAA.images.length != 1 ? "s" : "") + " found in this release"
										}},
										createTag("span", {a: {class: "caa-icon " + userjs}})
									)
								, this.releaseGroup).firstChild);
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
				} else if (types[t] == "release" && location.pathname.match(/\/search/)) {
					// https://tickets.metabrainz.org/browse/MBS-11327
					// For the moment, release search CAA icons have to be added by userscript
					as[a].parentNode.insertBefore(
						createTag("a", {a: {
								href: as[a].getAttribute("href") + "/cover-art",
								class: userjs + "searchThumb"
							}},
							createTag("span", {a: {class: "caa-icon " + userjs}, s:{backgroundSize: "contain", backgroundImage: "url(//coverartarchive.org" + as[a].getAttribute("href") + "/front-250)"}})
						),
						as[a]
					);
				}
			}
			var tr = getParent(as[a], "tr") || getParent(as[a], "li");
			tr.addEventListener("mouseover", updateBig, false);
			tr.addEventListener("mouseout", updateBig, false);
			// I don’t know if this box does still exist sometimes afer server update 2019-06-03 https://blog.musicbrainz.org/?p=7439 https://tickets.metabrainz.org/browse/MBS-9849
			var box = getParent(as[a], "table") || getParent(as[a], "ul");
// BIG PICS
// --------
			if (bigpics && imgurls.indexOf(imgurl) < 0 && (box = box.previousSibling && box.previousSibling.tagName == "DIV" && box.previousSibling.classList.contains(userjs + "bigbox") ? box.previousSibling : box.parentNode.insertBefore(createTag("div", {a: {class: userjs + "bigbox"}}), box))) {
				var artisttd = artistcol && getSibling(getParent(as[a], "td"), "td");
				box.appendChild(createTag("a", {a: {href: as[a].getAttribute("href"), title: as[a].textContent + (artisttd ? "\n" + artisttd.textContent.trim() : "")}, s: {display: "inline-block", height: "100%", margin: "8px 8px 4px 4px"}}, [
					"⌛",
					createTag("img", {
						a: {src: imgurl + "-250", alt: as[a].textContent},
						s: {verticalAlign: "middle", display: "none", maxHeight: "125px", boxShadow: "1px 1px 4px black"},
						e: {
							load: function(event) { removeNode(this.parentNode.firstChild); this.style.setProperty("display", "inline"); },
							error: function(event) {
								removeNode(this.parentNode);
								// Remove useless matching release searchThumb (blank) SMALL PICS (MBS-11327)
								var searchThumb = document.querySelector("a." + userjs + "searchThumb[href='" + this.getAttribute("src").match(new RegExp("/release/" + GUID)) + "/cover-art']");
								if (searchThumb) {
									removeNode(searchThumb);
								}
							},
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
	var img = this.querySelector("a[href^='/release']");
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
