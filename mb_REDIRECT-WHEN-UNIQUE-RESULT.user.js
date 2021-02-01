// ==UserScript==
// @name         mb. REDIRECT WHEN UNIQUE RESULT
// @version      2019.8.8.1707
// @description  Redirect to entity (release, artist, etc.) when only 1 result and/or unique 100% scored result of your entity search
// @homepage     http://userscripts-mirror.org/scripts/show/106156
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099 (fork of nikki/stars script)
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-06-30; http://web.archive.org/web/20150915074449/http://chatlogs.musicbrainz.org/musicbrainz/2011/2011-06/2011-06-30.html#T15-59-01-950029
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search/
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var onlyWhenNoReferrer = true; // for browser defined URL searches and duckduckgo MB !bangs like !mb !mbr !mblabel etc. only, for instance
var redirOnUniqueMatch = true; // redirect when one result
var redirOnUniqueExactMatch = true; // case insensitive, redirect when unique 100% scored result (both name and aliases) in several results
var backgroundMarking = ["#ffc", "#ff6"]; // odd rows, even rows
var textShadowMarking = "1px 2px 2px #cc6";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
if (document.getElementById("headerid-query")) {
	var rows = document.querySelector("div#content tbody");
	if (rows) {
		onlyWhenNoReferrer = !onlyWhenNoReferrer || (onlyWhenNoReferrer && (document.referrer == "" || document.referrer.match(/^https?:\/\/duckduckgo\.com/)));
		rows = rows.getElementsByTagName("tr");
		if (rows.length == 1 && redirOnUniqueMatch) {
			mark(rows[0]);
			if (onlyWhenNoReferrer) {
				go(rows[0].querySelector("a > bdi").parentNode.getAttribute("href"));
			}
		} else if (redirOnUniqueExactMatch) {
			var exactMatchURL;
			var exactMatchesCount = 0;
			for (var i = 0; i < rows.length; i++) {
				if (parseInt(rows[i].getAttribute("data-score"), 10) > 90) {
					mark(rows[i]);
					if (exactMatchesCount++ == 0) {
						exactMatchURL = rows[i].querySelector("a > bdi").parentNode.getAttribute("href");
					}
				}
			}
			if (exactMatchesCount == 1 && onlyWhenNoReferrer) {
				go(exactMatchURL);
			}
		}
	}
}
function mark(row) {
	if (row.className.indexOf("ev") != -1) {
		row.className = "";
		row.style.setProperty("background", backgroundMarking[1]);
	} else {
		row.style.setProperty("background", backgroundMarking[0]);
	}
	row.style.setProperty("text-shadow", textShadowMarking);
}
function go(url) {
	setTimeout(function() { self.location.href = url; }, 0);
}
