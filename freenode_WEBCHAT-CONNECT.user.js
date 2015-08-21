// ==UserScript==
// @name         freenode. WEBCHAT CONNECT
// @version      2015.8.21.1111
// @changelog    https://github.com/jesus2099/konami-command/commits/master/freenode_WEBCHAT-CONNECT.user.js
// @description  webchat.freenode.net: Remembers your last used nickname and channels. Reloads properly if problem. cleverly focus first empty field.
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey    tested sometimes
// @compatible   chromium(46)+tampermonkey   tested sometimes
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/freenode_WEBCHAT-CONNECT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/freenode_WEBCHAT-CONNECT.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://webchat.freenode.net/
// @include      https://webchat.freenode.net/
// @run-at       document-end
// ==/UserScript==
setTimeout(function() {
	"use strict";
	var userjs = {name: "freenode. WEBCHAT CONNECT", key: "j2fwc"};
	var channels = "#github, #last.fm, ##musicbrainz-lol, #musicbrainz";
	var inputs = document.getElementsByTagName("input");
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	var css = document.styleSheets[document.styleSheets.length - 1];
	css.insertRule(".qwebirc-qui.topic { font-size: .8em; }", 0);
	if (document.body.textContent.trim().match(/^412 - Precondition Failed$/) || !document.body.textContent.match(/connect.+nickname.+channels/i)) {
		location.reload();
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
				if (key.match(/channels/)) { this.value = this.value.replace(/[\s:;]/g, ", ").replace(/(, ?){2,}/g, ", ").replace(/^,|,$/g, ""); }
				localStorage.setItem(key, this.value);
			}
		});
	}
}, 1000);
