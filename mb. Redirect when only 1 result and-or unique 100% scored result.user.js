// ==UserScript==
// @name         mb: Redirect when only 1 result and/or unique 100% scored result
// @version      2016.5.17
// @description  In (test.)musicbrainz.org
// @namespace    http://userscripts.org/scripts/show/106156
// @author       N.(stars 2011-06-30) then Tristan DANIEL (PATATE12 aka. jesus2099/shamo)
// @licence      GPL (http://www.gnu.org/copyleft/gpl.html)
// @grant        none
// @include      http*://*musicbrainz.org/search*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var onlyWhenNoReferrer = true; /* for Opera URL searches only for instance */
var redirOnUniqueMatch = true; /*redirect when one result*/
var redirOnUniqueExactMatch = true/*false*/; /*case insensitive, redirect when unique 100% scored result (both name and aliases) in several results*/
var alwaysMarkCoolExactMatches = true; /*will mark rows even if you would not redirect*/
var backgroundMarking = ["#ffc", "#ff6"];/*odd, even*/
var textShadowMarking = "1px 2px 2px #cc6";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
if (document.getElementById("headerid-query")) {
	var rows = document.querySelector("div#content tbody");
	if (rows) { 
		rows = rows.getElementsByTagName("tr");
		if (rows.length == 1 && redirOnUniqueMatch) {
			mark(rows[0]);
			if (!onlyWhenNoReferrer || (onlyWhenNoReferrer && document.referrer=="")) {
				go(rows[0].querySelector("a").getAttribute("href"));
				
			}
		}
		else if (redirOnUniqueExactMatch) {
			var exactMatchURL;
			var exactMatchesCount = 0;
			for (var i=0; i < rows.length; i++) {
				if (rows[i].querySelector("td").textContent == "100") {
					mark(rows[i]);
					if (exactMatchesCount++ == 0) {
						exactMatchURL = rows[i].querySelector("a").getAttribute("href");
					}
				}
			}
			if (exactMatchesCount == 1 && (!onlyWhenNoReferrer || (onlyWhenNoReferrer && document.referrer==""))) {
				go(exactMatchURL);
			}
		}
	}
}
function mark(row) {
	if (row.className.indexOf("ev") != -1) {
		row.className = "";
		row.style.setProperty("background", backgroundMarking[1]);
	}
	else {
		row.style.setProperty("background", backgroundMarking[0]);
	}
	row.style.setProperty("text-shadow", textShadowMarking);
}
function go(url) {
	setTimeout(function() { self.location.href = url; }, 0);
}
