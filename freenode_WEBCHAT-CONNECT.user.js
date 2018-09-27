// ==UserScript==
// @name         freenode. WEBCHAT CONNECT
// @version      2017.6.16
// @changelog    https://github.com/jesus2099/konami-command/commits/master/freenode_WEBCHAT-CONNECT.user.js
// @description  webchat.freenode.net: Remembers your last used nickname and channels. Reloads properly if problem. cleverly focus first empty field.
// @supportURL   https://github.com/jesus2099/konami-command/labels/freenode_WEBCHAT-CONNECT
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/freenode_WEBCHAT-CONNECT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/freenode_WEBCHAT-CONNECT.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://webchat.freenode.net/
// @run-at       document-end
// ==/UserScript==
setTimeout(function() {
	"use strict";
	var userjs = {name: "freenode. WEBCHAT CONNECT", key: "j2fwc"};
	var channels = "#github,#last.fm,##musicbrainz-lol,#musicbrainz";
	var inputs = document.getElementsByTagName("input");
	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	document.head.appendChild(css);
	css = css.sheet;
	css.insertRule(".qwebirc-qui.topic { font-size: .8em; }", 0);
	if (document.body.textContent.trim().match(/^412 - Precondition Failed$/) || !document.body.textContent.match(/connect.+nickname.+channels/i)) {
		self.location.reload();
	} else if (document.getElementsByTagName("frameset").length == 0 && inputs && inputs[0] && inputs[1]) {
		self.addEventListener("focus", cleverFocus);
		storify(inputs[0], "nickname");
		storify(inputs[1], "channels");
		cleverFocus();
		inputs[1].style.setProperty("width", "100%");
		inputs[1].setAttribute("placeholder", channels);
		inputs[1].parentNode.style.setProperty("border-bottom", "1px dashed black");
		inputs[1].parentNode.parentNode.setAttribute("title", "example: « " + channels + " »");
	}
	function cleverFocus(event) {
		if (document.querySelector("table.qwebirc-loginbox")) {
			for (var i = 0; i < 2; i++) {
				if (inputs[i].value.trim().length == 0) {
					inputs[i].focus();
					return inputs[i];
				}
			}
		}
	}
	function storify(field, key) {
		var _key = userjs.key + "_" + key;
		field.setAttribute("ref", _key);
		field.value = localStorage.getItem(_key);
		field.addEventListener("change", function(event) {
			var key = this.getAttribute("ref");
			if (key && key.match(new RegExp("^" + userjs.key + "_\\w+"))) {
				if (key.match(/channels/)) { this.value = this.value.replace(/[\s:;,]+/g, ",").replace(/^,|,$/g, ""); }
				localStorage.setItem(key, this.value);
			}
		});
	}
}, 1000);
