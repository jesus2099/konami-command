// ==UserScript==
// @name         mb. HIDE TOPICS BY USERS
// @version      2021.3.23
// @description  community.metabrainz.org: Hide topics created by a custom list of users (blacklist) in (MusicBrainz) MetaBrainz Discourse forum
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_HIDE-TOPICS-BY-USERS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_HIDE-TOPICS-BY-USERS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-03-23; https://meta.discourse.org/t/topics-created-by-ignored-users-showing-on-homepage/170366/12?u=jesus2099
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        GM_info
// @include      https://community.metabrainz.org/*
// @run-at       document-ready
// ==/UserScript==
"use strict";
// hide topics created by these users - see user profile URL end to find user ID (/u/userid)
// Example: originalPosterBlacklist = ["user1", "user-2", "user_3"];
var originalPosterBlacklist = [];
var debug = false;
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("table.topic-list > tbody > tr.blacklisted-op * { display: none; }", 0);
setInterval(function() {
	if (document.querySelector("table.topic-list")) {
		for (var p = 0; p < originalPosterBlacklist.length; p++) {
			var unwanted = document.querySelectorAll("table.topic-list > tbody > tr:not(.blacklisted-op) > td.posters > a:first-child[data-user-card='" + originalPosterBlacklist[p] + "']");
			for (var u = 0; u < unwanted.length; u++) {
				unwanted[u].parentNode.parentNode.classList.add("blacklisted-op");
				var topicTitle = unwanted[u].parentNode.parentNode.querySelector("a.title");
				if (debug) console.log(
					GM_info.script.name + " " + GM_info.script.version + "\n" +
					unwanted[u].getAttribute("data-user-card") + "’s topic hidden: " + topicTitle.textContent + "\n" +
					location.protocol + "//" + location.host + topicTitle.getAttribute("href")
				);
			}
		}
	}
}, 500);
