// ==UserScript==
// @name         mb. SPOT DUPLICATE RECORDINGS
// @version      2015.8.7.1642
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @description  musicbrainz.org: Spot recordings that are linked multiple times to the same work
// @homepage     http://userscripts-mirror.org/scripts/show/106145
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-07-05
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=66492&v=2015.8.7.1533
// @grant        none
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/work/*
// @include      http://*.mbsandbox.org/recording/*
// @include      http://*.mbsandbox.org/work/*
// @exclude      *//*.org/recording/*/*
// @exclude      *//*.org/work/*/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
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
			&& href.match(/\/recording\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)
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
			a: {class: userjs + "-" + txt},
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
