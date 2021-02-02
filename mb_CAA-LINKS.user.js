// ==UserScript==
// @name         mb. CAA LINKS
// @version      2017.2.9.2099
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_CAA-LINKS.user.js
// @description  musicbrainz.org: Linkifies cover art edit “Filenames” (as specified in http://musicbrainz.org/edit/42525958)
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_CAA-LINKS
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2017-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        none
// @match        *://*.musicbrainz.org/*/*/edits*
// @match        *://*.musicbrainz.org/*/*/open_edits*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/search/edits*
// @match        *://*.musicbrainz.org/user/*/edits/open*
// @run-at       document-end
// ==/UserScript==
"use strict";
var coverArtFilenames = document.querySelectorAll("table.details[class$='cover-art'] > tbody code");
for (var filename = 0; filename < coverArtFilenames.length; filename++) {
	var mbid = coverArtFilenames[filename].textContent.match(/^mbid-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-\d+\.\w+$/);
	if (mbid) {
		var a = document.createElement("a");
		a.setAttribute("href", "//archive.org/0/items/mbid-" + mbid[1] + "/" + coverArtFilenames[filename].textContent);
		a.classList.add("jesus2099CAALink");
		a.appendChild(coverArtFilenames[filename].parentNode.replaceChild(a, coverArtFilenames[filename]));
		var linksRow = getParent(coverArtFilenames[filename], "tbody").insertRow(-1);
		linksRow.appendChild(createTag("th", {}, "Cool links:"));
		linksRow.appendChild(createTag("td", {}, [
			createTag("a", {a: {href: "/release/" + mbid[1] + "/cover-art", class: "jesus2099CAALink_skip"}}, "Cover Art tab"),
			" | ",
			createTag("a", {a: {href: "//archive.org/details/mbid-" + mbid[1]}}, "Archive release page"),
			" | ",
			createTag("a", {a: {href: "//archive.org/download/mbid-" + mbid[1]}}, "Archive file list")
		]));
	}
}
if (document.getElementsByClassName("jesus2099CAALink").length > 0) {
	setInterval(showThumbnails, 2000);
}
function showThumbnails() {
	var failedCAAImages = document.querySelectorAll("table.details[class$='cover-art'] > tbody a[href$='/cover-art']:not(.jesus2099CAALink_skip)");
	for (var image = 0; image < failedCAAImages.length; image++) {
		failedCAAImages[image].classList.add("jesus2099CAALink_skip");
		var associatedCAALink = failedCAAImages[image].parentNode.parentNode.parentNode.parentNode.querySelector("a.jesus2099CAALink");
		if (associatedCAALink) {
			var thumbnail = document.createElement("img");
			thumbnail.setAttribute("title", "unlinked image, still in CAA, cf. filename link above");
			thumbnail.style.setProperty("float", "left");
			thumbnail.style.setProperty("margin-right", "1em");
			thumbnail.style.setProperty("max-width", "600px");
			thumbnail.style.setProperty("border", "thick solid red");
			var CAAurls = [associatedCAALink.getAttribute("href")];
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb500$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb250$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_itemimage$1")); // same as _thumb below but less frequent
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb$1")); // will try this first then fallback to above
			failedCAAImages[image].parentNode.parentNode.insertBefore(thumbnail, failedCAAImages[image].parentNode);
			fallbackImageLoader(thumbnail, CAAurls);
		}
	}
}
function fallbackImageLoader(imgNode, srcs) {
	imgNode.addEventListener("error", function(event) {
		if (srcs.length > 1) {
			// removing event listener(s) with cloneNode
			var newImgNode = imgNode.cloneNode(false);
			newImgNode.removeAttribute("src");
			imgNode.parentNode.replaceChild(newImgNode, imgNode);
			fallbackImageLoader(newImgNode, srcs.slice(1));
		} else {
			imgNode.setAttribute("alt", "Error loading unlinked images.");
			imgNode.style.removeProperty("float");
			imgNode.style.setProperty("display", "block");
		}
	});
	imgNode.setAttribute("alt", srcs[0].match(/[^/]+\.\w+$/));
	imgNode.setAttribute("src", srcs[0]);
}
