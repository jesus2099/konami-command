// ==UserScript==
// @name         sacem. DIRECT LINK
// @version      2021.1.19
// @changelog    https://github.com/jesus2099/konami-command/commits/master/sacem_DIRECT-LINK.user.js
// @description  Automatically clean up cookie to allow direct link to various works even when browsing occurs between them
// @supportURL   https://github.com/jesus2099/konami-command/labels/sacem_DIRECT-LINK
// @compatible   vivaldi(1.15.1147.64)+violentmonkey my o. setup (Chrome based)
// @compatible   firefox+greasemonkey                sometimes tested
// @compatible   chrome+tampermonkey                 should be same as Vivaldi
// @compatible   opera(12.18.1872)+violentmonkey     my former setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/sacem_DIRECT-LINK.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/sacem_DIRECT-LINK.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2018-09-26
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://sigried.sacem.fr/oeuvres/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var erreurprod = document.querySelector("tbody > tr.erreurprod > td + td");
if (erreurprod && erreurprod.textContent.match(/\s+500\s+/) && getCookie("LECATSESSIONID")) {
	deleteCookie("LECATSESSIONID");
	self.location.reload();
}

// corrigé grâce à http://www.quirksmode.org/js/cookies.html
/* dead code
function setCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	}
	else var expires = "";
	document.cookie = 	name + "=" + escape(value) +
						expires +
						"; path=/";
}
dead code */

function deleteCookie(name) {
	if( getCookie(name) ) {
		document.cookie = 	name + "=" +
							";path=/" + 
							"; expires=Thu, 24-Jun-77 00:00:01 GMT";
	}
}

function getCookie(name) {
	var dc = document.cookie;
	var prefix = name + "=";
	var begin = dc.indexOf("; " + prefix);
	if (begin == -1) {
		begin = dc.indexOf(prefix);
		if (begin != 0) return null;
	} else begin += 2;
	var end = document.cookie.indexOf(";", begin);
	if (end == -1) end = dc.length;
	return unescape(dc.substring(begin + prefix.length, end));
}
