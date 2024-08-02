// ==UserScript==
// @name         mb. CAA LINKS
// @version      2024.8.2
// @description  musicbrainz.org: Linkify cover art edit “Filenames” (as specified in https://musicbrainz.org/edit/42525958); Add cool links to cover art tab and archive pages
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_CAA-LINKS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2017-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*.musicbrainz.org/*/*/edits*
// @match        *://*.musicbrainz.org/*/*/open_edits*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/search/edits*
// @match        *://*.musicbrainz.org/user/*/edits/open*
// @run-at       document-end
// ==/UserScript==
"use strict";
var mbid;
// Linkify cover art file names
var coverArtFilenames = document.querySelectorAll("table.details[class$='cover-art'] > tbody code");
for (var filename = 0; filename < coverArtFilenames.length; filename++) {
	mbid = coverArtFilenames[filename].textContent.match(/^mbid-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-\d+\.\w+$/);
	if (mbid) {
		coverArtFilenames[filename].parentNode.replaceChild(createTag(
			"a", {
				a: {
					class: "jesus2099CAALink",
					href: "//archive.org/0/items/mbid-" + mbid[1] + "/" + coverArtFilenames[filename].textContent,
					title: GM_info.script.name
				},
				s: {
					textShadow: "0 0 4px #ff6"
				}
			},
			coverArtFilenames[filename].textContent
		), coverArtFilenames[filename]);
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
			var thumbnail = createTag(
				"img", {
					a: {
						title: GM_info.script.name + " \nunlinked image, still in CAA, cf. filename link above"
					},
					s: {
						border: "thick solid #ff6",
						float: "left",
						marginRight: "1em",
						maxWidth: "600px"
					}
				}
			);
			failedCAAImages[image].parentNode.parentNode.insertBefore(thumbnail, failedCAAImages[image].parentNode);
			var CAAurls = [associatedCAALink.getAttribute("href")];
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb500$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb250$1"));
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_itemimage$1")); // same as _thumb below but less frequent
			CAAurls.unshift(CAAurls[CAAurls.length - 1].replace(/(\.\w+)$/, "_thumb$1")); // will try this first then fallback to above
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
// Release cover art cool links
var cover_art_edits = document.querySelectorAll("table.details[class$='cover-art'] > tbody > tr > td a[href^='/release/']");
for (var caa_edit = 0; caa_edit < cover_art_edits.length; caa_edit++) {
	mbid = cover_art_edits[caa_edit].getAttribute("href").match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
	if (mbid) {
		mbid = mbid[0];
		cover_art_edits[caa_edit].closest("tbody").appendChild(createTag("tr", {a: {title: GM_info.script.name}, s: {textShadow: "0 0 4px #ff6"}}, [
			createTag("th", {}, "Cool links:"),
			createTag("td", {}, [
				createTag("a", {a: {href: "/release/" + mbid + "/cover-art", class: "jesus2099CAALink_skip"}}, "Cover Art tab"),
				" | ",
				createTag("a", {a: {href: "//archive.org/details/mbid-" + mbid}}, "Archive release page"),
				" | ",
				createTag("a", {a: {href: "//archive.org/download/mbid-" + mbid}}, "Archive file list")
			])
		]));
	}
}
