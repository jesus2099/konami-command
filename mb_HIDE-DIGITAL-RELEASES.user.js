// ==UserScript==
// @name         mb. HIDE DIGITAL RELEASES
// @version      2025.7.24
// @description  musicbrainz.org: Release group page: Hide digital releases
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_HIDE-DIGITAL-RELEASES
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_HIDE-DIGITAL-RELEASES.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-02-25; https://community.metabrainz.org/t/digital-releases/361875/125?u=jesus2099
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/artist\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/releases($|\?)/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/collection\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}($|\?)/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/label\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}($|\?)/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release-group\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}($|\?)/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\?query=.+\btype=release\b/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-")
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
var account = document.querySelector("ul.menu li.account");
var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
// find download releases and apply style class
var releaseRows = document.querySelectorAll("table.tbl > tbody > tr:not(.subh)");
markDownloadReleases(releaseRows);
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("body." + userjs.id + " tr." + userjs.id + " { display: none; }", 0);
css.insertRule("body." + userjs.id + " div.jesus2099userjs154481bigbox > a." + userjs.id + " { display: none !important; }", 0); // link to mb_FUNKEY-ILLUSTRATED-RECORDS
css.insertRule("body." + userjs.id + " table.tbl > tbody > tr.even > td { background-color: #FEF; }", 0);
css.insertRule("tr." + userjs.id + " td, tr." + userjs.id + " td * { color: #F66; }", 0);
// hide only if there are physical releases
userjs.hiddenReleaseRows = document.querySelectorAll("tr." + userjs.id);
if (userjs.hiddenReleaseRows.length > 0 && releaseRows.length > userjs.hiddenReleaseRows.length) {
	toggleDLReleases();
	setInterval(function() {
		// keep reinserting toggle button if it gets removed by react-hydrate
		if (!document.querySelector("div.row > span.buttons > button[title='" + userjs.id + "'][type='']")) {
			userjs.mergeButton = document.querySelector("div.row > span.buttons > button[type='submit']");
			userjs.toggleButton = document.createElement("button");
			userjs.toggleButton.appendChild(document.createTextNode("Show/hide the " + userjs.hiddenReleaseRows.length + " DL releases"));
			userjs.toggleButton.style.setProperty("background-color", "#FEF");
			userjs.toggleButton.setAttribute("title", userjs.id);
			userjs.toggleButton.setAttribute("type", "");
			userjs.toggleButton.addEventListener("click", toggleDLReleases);
			userjs.mergeButton.parentNode.appendChild(userjs.toggleButton);
		}
	}, 2000);
}
// Hide associated mb_FUNKEY-ILLUSTRATED-RECORDS
setTimeout(function() {
	var hiddenReleases = document.querySelectorAll("tr." + userjs.id + " a[href^='/release/']");
	for (var r = 0; r < hiddenReleases.length; r++) {
		var hiddenReleaseCAA = document.querySelector("div.jesus2099userjs154481bigbox > a[href*='" + hiddenReleases[r].getAttribute("href") + "']");
		if (hiddenReleaseCAA) {
			hiddenReleaseCAA.classList.add(userjs.id);
		}
	}
}, 500);
function markDownloadReleases(releaseRows) {
	var formatRowIndex = !account || location.pathname.match(/\/search\b/) ? 2 : 3;
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
function toggleDLReleases(event) {
	// do not submit merge_queue form
	if (event) event.preventDefault();
	// toggle DL release visibility
	document.body.classList.toggle(userjs.id);
	// redistribute MBS odd/even style for visible rows
	var rows = document.querySelectorAll("table.tbl > tbody > tr");
	for (var r = 0, vr = 1; r < rows.length; r++) {
		if (rows[r].classList.contains("subh")) {
			vr = 1;
			continue;
		} else if (self.getComputedStyle(rows[r]).getPropertyValue("display") != "none") {
			var odd = (vr % 2);
			rows[r].classList.remove(odd ? "even" : "odd");
			rows[r].classList.add(odd ? "odd" : "even");
			vr += 1;
		}
	}
}
