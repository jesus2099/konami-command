// ==UserScript==
// @name         mb. REDIRECT WHEN UNIQUE RESULT
// @version      2022.11.3
// @description  Redirect to entity (release, artist, etc.) when only 1 result and/or unique 100% scored result of your entity search
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_REDIRECT-WHEN-UNIQUE-RESULT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_REDIRECT-WHEN-UNIQUE-RESULT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-06-30; fork of nikki/stars script http://web.archive.org/web/20150915074449/chatlogs.musicbrainz.org/musicbrainz/2011/2011-06/2011-06-30.html#T15-59-01-950029 / https://web.archive.org/web/20131103163409/userscripts.org/scripts/show/106156 / https://web.archive.org/web/20141011084017/userscripts-mirror.org/scripts/show/106156
// @icon         data:image/gif;base64,R0lGODlhEAAQAOMMAAAAAP8A/wJR1MosEqGhBPyZUAD/APW1hQD///vPp///AP7++P///////////////yH5BAEKAA8ALAAAAAAQABAAAARbUMlJq0Ll6AN6z0liYNnWLV84FmUBLIsAAyqpuTEgA4VomzFUyMfaaDy9WhFw/PRoK6Zn2lFyqNio58DKSAEjQnczPtTEN+ww3AIMBrM1Qpxxud80VWDP7/sNEQA7
// @require      https://github.com/jesus2099/konami-command/raw/76a8dfa01250d728c120529dc51717ae2d4ab58e/lib/MB-JUNK-SHOP.js?version=2022.10.28
// @require      https://github.com/jesus2099/konami-command/raw/0263e65041a07664fc6f8169ca8861c3fdb81575/lib/SUPER.js?version=2022.10.28
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/[^/]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search/
// @run-at       document-end
// ==/UserScript==
"use strict";
var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-")
};
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var onlyWhenNoReferrer = true; // for browser defined URL searches and duckduckgo MB !bangs like !mb !mbr !mblabel etc. only, for instance
var redirOnUniqueMatch = true; // redirect when one result
var redirOnUniqueExactMatch = true; // case insensitive, redirect when unique 100% scored result (both name and aliases) in several results
var skip_to_unique_RG_release = true;
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("tr." + userjs.id + " { text-shadow: 1px 2px 2px #cc6; }", 0);
css.insertRule("tr." + userjs.id + ".odd > td { background: #ffc; }", 0);
css.insertRule("tr." + userjs.id + ".even > td { background: #eeb !important; }", 0);
if (location.pathname.match(/^\/search/)) {
	// search result page
	var rows = document.querySelector("div#content tbody");
	if (rows) {
		onlyWhenNoReferrer = !onlyWhenNoReferrer || (onlyWhenNoReferrer && (document.referrer == "" || document.referrer.match(/^https?:\/\/duckduckgo\.com/)));
		rows = rows.getElementsByTagName("tr");
		if (rows.length == 1 && redirOnUniqueMatch) {
			rows[0].classList.add(userjs.id);
			if (onlyWhenNoReferrer) {
				redirect(rows[0].querySelector("a > bdi").parentNode);
			}
		} else if (redirOnUniqueExactMatch) {
			var exactMatch;
			var exactMatchesCount = 0;
			for (var i = 0; i < rows.length; i++) {
				if (parseInt(rows[i].getAttribute("data-score"), 10) > 90) {
					rows[i].classList.add(userjs.id);
					if (exactMatchesCount++ == 0) {
						exactMatch = rows[i].querySelector("a > bdi").parentNode;
					}
				}
			}
			if (exactMatchesCount == 1 && onlyWhenNoReferrer) {
				redirect(exactMatch);
			}
		}
	}
} else {
	// entity overview page
	var cookie = read_cookie(userjs.id);
	if (cookie && (cookie = cookie.split("::")) && cookie[1] == location.pathname) {
		MB_banner(createTag("fragment", {}, ["You have been redirected to unique or best match. ", createTag("br"), createTag("a", {a: {href: cookie[0]}, s: {fontWeight: "bold"}}, "Click here to go back"), " to search results or release group page."]), userjs.id);
	}
	if (skip_to_unique_RG_release && location.pathname.match(/^\/release-group\//)) {
		var releases = document.querySelectorAll("table.tbl > tbody > tr > td > a[href^='/release/'] > bdi");
		if (releases.length === 1 && document.referrer.indexOf(releases[0].parentNode.getAttribute("href")) < 0) {
			redirect(releases[0].parentNode);
		}
	}
}

function redirect(entity) {
	var redirect_banner = MB_banner(createTag("fragment", {}, ["Press ", createTag("b", {}, "Escape"), " to cancel redirection to best match: ", entity.cloneNode(true)]), userjs.id, true);
	document.body.addEventListener("keydown", function(event) {
		if (event.key.match(/^Esc(ape)?$/)) {
			if (redirect_banner.parentNode) {
				redirect_banner.parentNode.removeChild(redirect_banner);
			}
			if (userjs.redirectTimeout) {
				clearTimeout(userjs.redirectTimeout);
				delete userjs.redirectTimeout;
				event.preventDefault();
				event.stopPropagation = true;
				return false;
			} else {
				delete_cookie(userjs.id);
			}
		}
	});
	userjs.redirectTimeout = setTimeout(function() {
		delete userjs.redirectTimeout;
		write_cookie(userjs.id, location.href.replace(new RegExp("^" + location.protocol + "//" + location.host), "") + "::" + entity.getAttribute("href"), 60);
		self.location.assign(entity.getAttribute("href"));
	}, 12);
}
