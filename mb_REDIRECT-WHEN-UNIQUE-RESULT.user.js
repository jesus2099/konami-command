// ==UserScript==
// @name         mb. REDIRECT WHEN UNIQUE RESULT
// @version      2022.6.22
// @description  Redirect to entity (release, artist, etc.) when only 1 result and/or unique 100% scored result of your entity search
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_REDIRECT-WHEN-UNIQUE-RESULT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_REDIRECT-WHEN-UNIQUE-RESULT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-06-30; fork of nikki/stars script http://web.archive.org/web/20150915074449/chatlogs.musicbrainz.org/musicbrainz/2011/2011-06/2011-06-30.html#T15-59-01-950029 / https://web.archive.org/web/20131103163409/userscripts.org/scripts/show/106156 / https://web.archive.org/web/20141011084017/userscripts-mirror.org/scripts/show/106156
// @icon         data:image/gif;base64,R0lGODlhEAAQAOMMAAAAAP8A/wJR1MosEqGhBPyZUAD/APW1hQD///vPp///AP7++P///////////////yH5BAEKAA8ALAAAAAAQABAAAARbUMlJq0Ll6AN6z0liYNnWLV84FmUBLIsAAyqpuTEgA4VomzFUyMfaaDy9WhFw/PRoK6Zn2lFyqNio58DKSAEjQnczPtTEN+ww3AIMBrM1Qpxxud80VWDP7/sNEQA7
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search/
// @run-at       document-idle
// ==/UserScript==
"use strict";
if (document.getElementById("headerid-query")) {
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
	var onlyWhenNoReferrer = true; // for browser defined URL searches and duckduckgo MB !bangs like !mb !mbr !mblabel etc. only, for instance
	var redirOnUniqueMatch = true; // redirect when one result
	var redirOnUniqueExactMatch = true; // case insensitive, redirect when unique 100% scored result (both name and aliases) in several results
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	var userjs = {
		id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-")
	};
	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	document.head.appendChild(css);
	css = css.sheet;
	css.insertRule("tr." + userjs.id + " { text-shadow: 1px 2px 2px #cc6; }", 0);
	css.insertRule("tr." + userjs.id + ".odd > td { background: #ffc; }", 0);
	css.insertRule("tr." + userjs.id + ".even > td { background: #eeb !important; }", 0);
	var rows = document.querySelector("div#content tbody");
	if (rows) {
		onlyWhenNoReferrer = !onlyWhenNoReferrer || (onlyWhenNoReferrer && (document.referrer == "" || document.referrer.match(/^https?:\/\/duckduckgo\.com/)));
		rows = rows.getElementsByTagName("tr");
		if (rows.length == 1 && redirOnUniqueMatch) {
			rows[0].classList.add(userjs.id);
			if (onlyWhenNoReferrer) {
				go(rows[0].querySelector("a > bdi").parentNode.getAttribute("href"));
			}
		} else if (redirOnUniqueExactMatch) {
			var exactMatchURL;
			var exactMatchesCount = 0;
			for (var i = 0; i < rows.length; i++) {
				if (parseInt(rows[i].getAttribute("data-score"), 10) > 90) {
					rows[i].classList.add(userjs.id);
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
function go(url) {
	var cancel_banner = document.createElement("div");
	cancel_banner.classList.add(userjs.id, "banner");
	cancel_banner.style.setProperty("background-color", "#fcf")
	cancel_banner.appendChild(document.createTextNode("Press *Escape* to cancel redirection to best match!"));
	document.body.insertBefore(cancel_banner, document.querySelector("div#page"));
	document.body.addEventListener("keydown", function(event) {
		if (event.key.match(/^Esc(ape)?$/)) {
			clearTimeout(userjs.redirectTimeout);
			var cancel_banner = document.querySelector("div.banner." + userjs.id);
			if (cancel_banner) {
				cancel_banner.parentNode.removeChild(cancel_banner);
			}
			event.preventDefault();
			event.stopPropagation = true;
			return false;
		}
	});
	userjs.redirectTimeout = setTimeout(function() { self.location.assign(url); }, 2222);
}
