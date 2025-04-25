// ==UserScript==
// @name         instagram. REDIRECT TO MIRROR
// @version      2025.3.1
// @description  instagram.com is blocked to non members, browse imginn.com instead
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/instagram_REDIRECT-TO-MIRROR
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/instagram_REDIRECT-TO-MIRROR.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2024
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.imginn.com/p/*
// @match        *://*.instagram.com/*
// @run-at       document-idle
// ==/UserScript==
"use strict";
if (location.host !== "imginn.com") {
	location.assign("https://imginn.com" + location.pathname);
} else {
	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	document.head.appendChild(css);
	css = css.sheet;
	css.insertRule("div.desc, div.con { word-break: unset !important; }", 0);
	var created = document.querySelector("div.page-post");
	var time = document.querySelector("div.time");
	if (
		created
		&& time
		&& (created = created.dataset.created)
		&& (created = parseInt(created))
	) {
		time.insertBefore(document.createElement("hr"), time.firstChild);
		time.insertBefore(document.createTextNode((new Date(created * 1000)).toLocaleString()), time.firstChild);
	}
}
