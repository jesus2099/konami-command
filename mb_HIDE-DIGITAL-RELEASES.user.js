// ==UserScript==
// @name         mb. HIDE DIGITAL RELEASES
// @version      2021.7.24.1111
// @description  musicbrainz.org: Release group page: Hide digital releases
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_HIDE-DIGITAL-RELEASES
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_HIDE-DIGITAL-RELEASES.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-02-25; https://community.metabrainz.org/t/digital-releases/361875/125?u=jesus2099
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/artist\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/releases/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release-group\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-"),
};
var MBGlossary = {
	"medium-format": {
		12: {
			"de": "Digitales Medium",
			"el-gr": "Ψηφιακό μέσο",
			"en": "Digital Media",
			"es-es": "Digital",
			"et": "audiofailid",
			"fi": "Digitaalinen media",
			"fr": "Support numérique",
			"it": "Supporto digitale",
			"ja": "デジタルメディア",
			"nl": "digitale media",
		}
	}
};
var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
switch (location.pathname.match(/\/[^/]+\//)[0]) {
	case "/artist/": // /artist/*/releases
		// fall through
	case "/release-group/":
		// find download releases and apply style class
		var releaseRows = document.querySelectorAll("table.tbl > tbody > tr:not(.subh)");
		markDownloadReleases(releaseRows);
		var css = document.createElement("style");
		css.setAttribute("type", "text/css");
		document.head.appendChild(css);
		css = css.sheet;
		css.insertRule("body." + userjs.id + " tr." + userjs.id + " { display: none; }", 0);
		css.insertRule("tr." + userjs.id + " { opacity: .6; }", 0);
		css.insertRule("tr." + userjs.id + " td, tr." + userjs.id + " td * { color: #F66; }", 0);
		// hide only if there are physical releases
		var hiddenReleases = document.querySelectorAll("tr." + userjs.id);
		if (releaseRows.length > hiddenReleases.length) {
			document.body.classList.add(userjs.id);
			// toggle button
			var mergeButton = document.querySelector("div.row > span.buttons > button[type='submit']");
			var toggleButton = document.createElement("button");
			toggleButton.appendChild(document.createTextNode("Show/hide the " + hiddenReleases.length + " DL releases"));
			toggleButton.style.setProperty("background-color", "#FF6");
			toggleButton.setAttribute("title", userjs.id);
			toggleButton.setAttribute("type", "");
			toggleButton.addEventListener("click", function(event) {
				event.preventDefault();
				document.body.classList.toggle(userjs.id);
			});
			mergeButton.parentNode.appendChild(toggleButton);
		}
		break;
}
function markDownloadReleases(releaseRows) {
	var formatRowIndex = location.pathname.match(/\/releases$/) ? 3 : 2;
	for (var r = 0; r < releaseRows.length; r++) {
		if (
			// don’t match half physical releases
			!releaseRows[r].cells[formatRowIndex].textContent.match(/\+/)
			// match fully digital releases
			&& releaseRows[r].cells[formatRowIndex].textContent.match(new RegExp("([0-9]+×)?" + MBGlossary["medium-format"][12][lang], "iu"))
		) {
			releaseRows[r].classList.add(userjs.id);
		}
	}
}
