// ==UserScript==
// @name         mb. SPOT DUPLICATE RECORDINGS
// @version      2025.8.30
// @description  musicbrainz.org: Spot recordings that are linked multiple times to the same work
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SPOT-DUPLICATE-RECORDINGS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-07-05; https://web.archive.org/web/20131103163405/userscripts.org/scripts/show/106145 / https://web.archive.org/web/20141011084009/userscripts-mirror.org/scripts/show/106145
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/work/*
// @match        *://musicbrainz.eu/recording/*
// @match        *://musicbrainz.eu/work/*
// @exclude      */recording/*/*
// @exclude      */work/*/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var userjs = "jesus2099userjs106145";
var count = 1;
for (var tables = document.querySelectorAll("div#content table > tbody"), it = 0; it < tables.length; it++) {
	for (var alllinks = tables[it].getElementsByTagName("a"), parsedlinks = [], i = 0; i < alllinks.length; i++) {
		var href = alllinks[i].getAttribute("href");
		var parent = alllinks[i].parentNode;
		if (parent.tagName == "SPAN" && parent.classList.contains("mp")) {
			parent = parent.parentNode;
		}
		if (
			href
			&& href.match(/\/recording|work\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)
			&& parent.tagName != "H1"
			&& !parent.parentNode.classList.contains("tabs")
			&& !parent.classList.contains("pageselector")
		) {
			if (parsedlinks[href]) { /* duplicate link */
				if (!parsedlinks[href].hasDupe) {
					parsedlinks[href].node.parentNode.insertBefore(dupetxt(parsedlinks[href].index), parsedlinks[href].node);
					parsedlinks[href].hasDupe = true;
				}
				alllinks[i].parentNode.insertBefore(dupetxt(parsedlinks[href].index), alllinks[i]);
			} else { /* new link */
				parsedlinks[href] = {node: alllinks[i], index: "#" + count++ + "/" + alllinks.length, hasDupe: false};
			}
		}
	}
}
function dupetxt(txt) {
	return createTag("span", {
		a: {class: userjs + txt.replace(/[#/]/g, "-")},
		s: {backgroundColor: "yellow", color: "red", padding: "0 4px"},
		e: {mouseover: dupeHighlight, mouseout: dupeHighlight}
	}, "duplicate " + txt);
}
function dupeHighlight(e) {
	for (var dupes = getParent(this, "tbody").getElementsByClassName(this.className), d = 0; d < dupes.length; d++) {
		dupes[d].style.setProperty("background-color", e.type == "mouseover" ? "red" : "yellow");
		dupes[d].style.setProperty("color", e.type == "mouseover" ? "yellow" : "red");
	}
}
