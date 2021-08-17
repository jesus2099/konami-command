// ==UserScript==
// @name         mb. HIDE TOPICS BY USERS
// @version      2021.8.17
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
// @grant        GM_registerMenuCommand
// @include      https://community.metabrainz.org/*
// @run-at       document-ready
// ==/UserScript==
"use strict";
var DEBUG = false;
// load blacklist
var blacklist = localStorage.getItem(GM_info.script.name);
if (typeof blacklist === "string") {
	debug("Loaded: " + blacklist);
	blacklist = blacklist.split(" ");
} else {
	blacklist = [];
}
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("table.topic-list > tbody > tr.blacklisted-op:not(.temporary-whitelist) > td * { display: none; }", 0);
css.insertRule("table.topic-list > tbody > tr.blacklisted-op:not(.temporary-whitelist) > td { height: 8px; padding: 0; }", 0);
css.insertRule("table.topic-list > tbody > tr.blacklisted-op:not(.temporary-whitelist) { background: black; cursor: pointer; }", 0);
css.insertRule("table.topic-list > tbody > tr.blacklisted-op > td.posters a:first-child > img.avatar { box-shadow: 0 0 3px 2px red !important; }", 0);
css.insertRule("table.topic-list > tbody > tr.blacklisted-op > td:first-child a.title { text-shadow: 1px 2px 2px red; }", 0);
// blacklist editor
GM_registerMenuCommand("Edit blacklist", function() {
	var newBlacklist = prompt(GM_info.script.name + "\n\nList user IDs, separated by spaces\nExample: user1 user2 user3", blacklist.join(" "));
	if (newBlacklist !== null) {
		blacklist = newBlacklist.trim().replace(/\s+/g, " ").split(" ").sort();
		localStorage.setItem(GM_info.script.name, blacklist.join(" "));
		debug("Blacklist saved: " + blacklist.join(" "));
	}
});
// hide topics created by backlisted users
setInterval(function() {
	if (document.querySelector("table.topic-list")) {
		for (var p = 0; p < blacklist.length; p++) {
			var unwanted = document.querySelectorAll("table.topic-list > tbody > tr:not(.blacklisted-op) > td.posters > a:first-child[data-user-card='" + blacklist[p] + "']");
			for (var u = 0; u < unwanted.length; u++) {
				unwanted[u].parentNode.parentNode.classList.add("blacklisted-op");
				var topicTitle = unwanted[u].parentNode.parentNode.querySelector("a.title");
				debug(
					unwanted[u].getAttribute("data-user-card") + "’s topic hidden: " + topicTitle.textContent + "\n" +
					location.protocol + "//" + location.host + topicTitle.getAttribute("href")
				);
			}
		}
	}
}, 500);
// show blacklisted user topics on click
document.body.addEventListener("click", function(event) {
	debug(event.target.tagName + "\n" + event.target.parentNode.tagName + "\n" + event.target.parentNode.classList);
	if (
		event.target.tagName === "TD"
		&& event.target.parentNode.tagName === "TR"
		&& event.target.parentNode.classList.contains("blacklisted-op")
		&& !event.target.parentNode.classList.contains("temporary-whitelist")
	) {
		event.target.parentNode.classList.add("temporary-whitelist");
	}
});
function debug(text) {
	if (DEBUG) console.debug(
		GM_info.script.name + " " + GM_info.script.version + "\n" + text
	);
}
