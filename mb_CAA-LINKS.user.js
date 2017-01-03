// ==UserScript==
// @name         mb. CAA LINKS
// @version      2017.1.3.1655
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_CAA-LINKS.user.js
// @description  musicbrainz.org: Linkifies cover art edit “Filenames” (as specified in http://musicbrainz.org/edit/42525958)
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_CAA-LINKS
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @compatible   firefox(45.0.2)+greasemonkey        quickly tested
// @compatible   chromium(46.0.2471.0)+tampermonkey  quickly tested
// @compatible   chrome+tampermonkey                 should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_CAA-LINKS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2017-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.mbsandbox.org/*/*/edits*
// @match        *://*.mbsandbox.org/*/*/open_edits*
// @match        *://*.mbsandbox.org/edit/*
// @match        *://*.mbsandbox.org/search/edits*
// @match        *://*.mbsandbox.org/user/*/edits/open*
// @match        *://*.musicbrainz.org/*/*/edits*
// @match        *://*.musicbrainz.org/*/*/open_edits*
// @match        *://*.musicbrainz.org/edit/*
// @match        *://*.musicbrainz.org/search/edits*
// @match        *://*.musicbrainz.org/user/*/edits/open*
// @run-at       document-end
// ==/UserScript==
"use strict";
var coverArtFilenames = document.querySelectorAll(".edit-header[class$='cover-art'] ~ * code");
for (var filename = 0; filename < coverArtFilenames.length; filename++) {
	var mbid = coverArtFilenames[filename].textContent.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
	if (mbid) {
		var a = document.createElement("a");
		a.setAttribute("href", "//archive.org/0/items/mbid-" + mbid[0] + "/" + coverArtFilenames[filename].textContent);
		a.classList.add("jesus2099CAALink");
		a.appendChild(coverArtFilenames[filename].parentNode.replaceChild(a, coverArtFilenames[filename]));
	}
}
if (document.getElementsByClassName("jesus2099CAALink").length > 0) {
	setInterval(showThumbnails, 2000);
}
function showThumbnails() {
	var failedCAAImages = document.querySelectorAll(".edit-header[class$='cover-art'] ~ * a[href$='/cover-art']");
	for (var image = 0; image < failedCAAImages.length; image++) {
		var associatedCAALink = failedCAAImages[image].parentNode.parentNode.parentNode.parentNode.querySelector("a.jesus2099CAALink");
		if (associatedCAALink) {
			var thumbnail = document.createElement("img");
			thumbnail.setAttribute("src", associatedCAALink.getAttribute("href").replace(/(\.\w+)$/, "_thumb$1"));
			failedCAAImages[image].parentNode.parentNode.replaceChild(thumbnail, failedCAAImages[image].parentNode);
		}
	}
}