// ==UserScript==
// @name         mb. MASS ISRC
// @version      2016.2.5
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_MASS-ISRC.user.js
// @description  notlob.eu/isrc. BATCH SUBMIT ISRCs. Allows pasting all ISRCs at once (from Simonf’s mediatool on multi-disc releases or from 音楽の森/ongakunomori/minc) - does not work in Opera for AUTH bug reason :/
// @homepage     http://userscripts-mirror.org/scripts/show/151040
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_MASS-ISRC
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_MASS-ISRC.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_MASS-ISRC.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-10-26
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://beta.musicbrainz.org/ws/1/track/
// @include      http://mb.lmfao.org.uk/isrc/*
// @include      http://musicbrainz.org/ws/1/track/
// @include      http://notlob.eu/isrc/*
// @include      https://beta.musicbrainz.org/ws/1/track/
// @include      https://musicbrainz.org/ws/1/track/
// @run-at       document-end
// ==/UserScript==
"use strict";
var home = "http://notlob.eu/isrc/";
var dummySkip = "JESUS2099999";
var inputs, submit = document.querySelector("form > input[type='submit']");
if (location.href.match(/^https?:\/\/[^/]+\/ws\/1\//)) {
	var p = document.body.querySelector("pre, p");
	if (p && p.textContent.trim() == "") {
		document.body.appendChild(document.createTextNode("ISRC submission seems OK. "));
		document.body.appendChild(document.createElement("a")).appendChild(document.createTextNode("Going back to submission page (in 4 seconds).")).parentNode.setAttribute("href", home);
		setTimeout(function() { location=home; }, 4000);
	}
} else if (inputs = document.querySelector("form input[name='mbid']")) {
	inputs.addEventListener("focus", function(event) { this.select(); }, false);
	inputs.focus();
} else if ((inputs = document.querySelectorAll("form table input[type='text'][name^='track'][name$='-isrc']")) && inputs.length > 0) {
	for (var input = 0; input < inputs.length; input++) {
		inputs[input].style.setProperty("font-family", "monospace");
		inputs[input].setAttribute("maxlength", "12");
		inputs[input].setAttribute("size", "12");
	}
	var f = document.querySelector("form");
	f.appendChild(document.createElement("strong")).appendChild(document.createTextNode(" - Paste your batch of ISRCs below — dummy ISRC if you need to skip a track: " + dummySkip));
	f.appendChild(document.createElement("br"));
	var t = f.appendChild(document.createElement("textarea"));
	t.style.setProperty("width", "100%");
	t.style.setProperty("height", "400px");
	t.addEventListener("keyup", function(event) {
		var isrcs = this.value.match(/[a-z]{2}\-?[a-z0-9]{3}\-?[0-9]{2}\-?[0-9]{5}/gi);
		if (isrcs && isrcs.length > 0 && inputs.length > 0) {
			this.style.setProperty("background-color", arrHasDupes(isrcs) ? "pink" : "transparent");
			for (var isrc = 0, input = 0; input < inputs.length; input++) {
				inputs[input].value = (isrc < isrcs.length && isrcs[isrc] != dummySkip ? isrcs[isrc] : "");
				if (isrc > 0) {
					inputs[input].style.setProperty("background-color", inputs[input].value==inputs[input-1].value && inputs[input].value != "" ? "pink" : "transparent");
				}
				isrc++;
			}
		} else { this.style.setProperty("background-color", "transparent"); }
		if (submit && event.ctrlKey && event.keyCode == 86) { submit.focus(); }
	}, false);
	t.select();
} else if (submit && (inputs = document.querySelectorAll("form input:not([type='submit']):not([type='hidden'])")) && inputs.length == 0) {
	submit.focus();
}
/* http://www.groggyjava.tv/freebies/duplicates.html */
function arrHasDupes(arr) {
	var i, j, n;
	n = arr.length;
	for (i = 0; i < n; i++) {
		for (j = i + 1; j < n; j++) {
			if (arr[i] == arr[j] && arr[i] != dummySkip) return true;
		}
	}
	return false;
}
