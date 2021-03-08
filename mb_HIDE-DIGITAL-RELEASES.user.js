// ==UserScript==
// @name         mb. HIDE DIGITAL RELEASES
// @version      2021.3.8
// @description  musicbrainz.org: (VERY BASIC AT THE MOMENT) Release group page: Hide digital releases
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_HIDE-DIGITAL-RELEASES
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_HIDE-DIGITAL-RELEASES.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-02-25; https://community.metabrainz.org/t/digital-releases/361875/125?u=jesus2099
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release-group\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/edit$/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var MBGlossary = JSON.parse(localStorage.getItem("MBGlossary"));
if (!MBGlossary) {
	MBGlossary = {
		"disc-format": {
			12: {
				de: "Digitales Medium",
				en: "Digital Media",
				fr: "Support numérique",
				it: "Supporto digitale",
				nl: "digitale media",
			}
		}
	};
	localStorage.setItem("MBGlossary", JSON.stringify(MBGlossary));
}
var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
switch (location.pathname.match(/\/[^/]+\//)[0]) {
	case "/release-group/":
		var releases = document.querySelectorAll("tbody > tr:not(.subh)");
		if (releases.length > 0) {
			for (var r = 0; r < releases.length; r++) {
				if (
					// don’t match half physical releases
					!releases[r].cells[2].textContent.match(/\+/)
					// match fully digital releases
					&& releases[r].cells[2].textContent.match(new RegExp("([0-9]+×)?" + MBGlossary["disc-format"][12][lang], "iu"))
				) {
					releases[r].style.setProperty("display", "none");
				}
			}
			// TODO: recompute odd/even rows
		}
		break;
	case "/release/": // release editor (see @include)
		// ARTIFICIAL INTELLIGENCE: Learn new localised digital media names
		var digitalMediaFormat = document.querySelector("#release-editor select[id^='disc-format'] option[value='12']");
		if (digitalMediaFormat) {
			digitalMediaFormat = digitalMediaFormat.textContent;
			if (MBGlossary["disc-format"][12][lang] !== digitalMediaFormat) {
				MBGlossary["disc-format"][12][lang] = digitalMediaFormat;
				localStorage.setItem("MBGlossary", JSON.stringify(MBGlossary));
			}
		}
		break;
}
