// ==UserScript==
// @name         BISCUITS
// @version      2024.8.31
// @description  Cookie functions
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @grant        none
// ==/UserScript==
"use strict";

// adapted from https://www.quirksmode.org/js/cookies.html

function write_cookie(name, value, seconds) {
	var max_age = "";
	if (seconds) {
		max_age = "; max-age=" + seconds;
	}
	document.cookie = name + "=" + encodeURIComponent(value) + max_age + "; path=/";
}

function read_cookie(name) {
	var name_equals = name + "=";
	var cookie_array = document.cookie.split(";");
	for (var c = 0; c < cookie_array.length; c++) {
		var cookie = cookie_array[c];
		while (cookie.charAt(0) == " ") {
			cookie = cookie.substring(1, cookie.length);
		}
		if (cookie.indexOf(name_equals) == 0) {
			return decodeURIComponent(cookie.substring(name_equals.length, cookie.length));
		}
	}
	return null;
}

function delete_cookie(name) {
	write_cookie(name, "", -1);
}
