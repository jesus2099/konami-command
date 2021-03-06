// ==UserScript==
// @name         mb. CHATLOGS POWER-UP
// @version      2021.6.17
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_CHATLOGS-POWER-UP.user.js
// @description  chatlogs.metabrainz.org: swicth between #musicbrainz and #metabrainz channels; previous/next date log page (it was once a better script)
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_CHATLOGS-POWER-UP
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CHATLOGS-POWER-UP.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_CHATLOGS-POWER-UP.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-03-05; https://web.archive.org/web/20131103163408/userscripts.org/scripts/show/127580 / https://web.archive.org/web/20141011084021/userscripts-mirror.org/scripts/show/127580
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/chatlogs\.metabrainz\.org\/(brainzbot|libera)\//
// @run-at       document-start
// ==/UserScript==
"use strict";
var userjs = "j2userjs127580";
var date = self.location.pathname.match(/\/(\d{4})[-/](\d{2})[-/](\d{2})\b/);
if (date) date = date[1] + "-" + date[2] + "-" + date[3];
var loc = self.location.href.match(/https?:\/\/chatlogs\.metabrainz\.org\/(brainzbot|libera)\/([^/]+)\/|mbja/);
if (loc) {
	var cat = loc[2];
	var mbCHATLOGSPOWERUPinterval = setInterval(function() {
		if (document.head && document.body) {
			clearInterval(mbCHATLOGSPOWERUPinterval);
			var css = document.createElement("style");
			css.setAttribute("type", "text/css");
			document.head.appendChild(css);
			css = css.sheet;
			// remove top black bar which overlaps content with Opera 12
			css.insertRule("header#Site-Header { display: none; }", 0);
			css.insertRule("header#Log-Header { padding: 0px; }", 0);
			css.insertRule("header#Log-Header { top: 0px; }", 0);
			// remove sidebar which does some funky endless reloading with Opera 12
			css.insertRule(".timeline-navigation { display: none; }", 0);
			css.insertRule("#Log-Container { margin-top: 0px; }", 0);
			css.insertRule("#Log-Container article { margin-right: 0px; }", 0);
			// toolbar
			css.insertRule("div#" + userjs + "toolbar { position: fixed; bottom: 0; right: 0; background-color: #ccc; padding: 2px 0 0 4px; border: 2px solid #eee; border-width: 2px 0 0 2px; z-index: 50; }", 0);
			css.insertRule("body { padding-bottom: .5em; }", 0);
			var ctt = document.createElement("div");
			ctt.setAttribute("id", userjs + "toolbar");
			/* cross linking */
			separate(ctt);
			var tgt = (cat.match(/^musicbrainz$/) ? "meta" : "music") + "brainz";
			var tgtA = createA("#" + tgt, (self.location.pathname.match(/\/search\/$/) ? self.location.href : self.location.pathname).replace(/\/(meta|music)brainz\//, "/" + tgt + "/"));
			if (cat == "musicbrainz") {
				ctt.appendChild(document.createTextNode("#musicbrainz"));
			} else {
				ctt.appendChild(tgtA);
			}
			separate(ctt);
			if (cat == "metabrainz") {
				ctt.appendChild(document.createTextNode("#metabrainz"));
			} else {
				ctt.appendChild(tgtA);
			}
			/* prev./next day */
			if (date) {
				separate(ctt);
				ctt.appendChild(createA("« prev.", shiftDate(-1)));
				separate(ctt);
				ctt.appendChild(createA("next »", shiftDate(+1)));
			}
			if (document.body.firstChild) {
				document.body.insertBefore(ctt, document.body.firstChild);
			} else {
				document.body.appendChild(ctt);
			}
		}
	}, 123);
}
function shiftDate(shift) {
	var sdate = (new Date(date));
	sdate.setDate(sdate.getDate() + shift);
	var yyyy = zeroPad(sdate.getFullYear(), 4);
	var mm = zeroPad(sdate.getMonth() + 1, 2);
	var dd = zeroPad(sdate.getDate(), 2);
	return self.location.pathname.match(/[^\d]+/) + yyyy + "-" + mm + "-" + dd + "/";
}
function zeroPad(i, cols) {
	var str = "" + i;
	while (str.length < cols) {
		str = "0" + str;
	}
	return str;
}
function createA(text, link, title) {
	var a = document.createElement("a");
	if (link && typeof link == "string") {
		a.setAttribute("href", link);
	} else {
		if (link && typeof link == "function") {
			a.addEventListener("click", link, false);
		}
		a.style.setProperty("cursor", "pointer");
		a.style.setProperty("text-decoration", "underline");
	}
	if (title) { a.setAttribute("title", title); }
	a.appendChild(typeof text == "string" ? document.createTextNode(text) : text);
	return a;
}
function separate(cont, sep) {
	if (cont.firstChild) cont.appendChild(document.createTextNode(sep ? sep : " | "));
}
