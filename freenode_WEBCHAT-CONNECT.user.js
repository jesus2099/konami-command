// ==UserScript==
// @name         freenode. WEBCHAT CONNECT
// @version      2019.9.12
// @description  webchat.freenode.net: Remembers your last used nickname and channels. Reloads properly if problem. cleverly focus first empty field.
// @compatible   vivaldi(2.4.1488.38)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(64.0)+greasemonkey          tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      https://webchat.freenode.net/
// @run-at       document-end
// ==/UserScript==
setTimeout(function() {
	"use strict";
	var userjs = {name: "freenode. WEBCHAT CONNECT", key: "j2fwc"};
	var defaultChannels = "#github,#last.fm,##musicbrainz-lol,#musicbrainz";
	var kiwiInputs = document.querySelectorAll("div.u-input-text-inputs > input");
	var nicknameField = kiwiInputs[0];
	var channelsField = kiwiInputs[kiwiInputs.length - 1];

//	var css = document.createElement("style");
//	css.setAttribute("type", "text/css");
//	document.head.appendChild(css);
//	css = css.sheet;
//	css.insertRule(".qwebirc-qui.topic { font-size: .8em; }", 0);

//	if (document.body.textContent.trim().match(/^412 - Precondition Failed$/) || !document.body.textContent.match(/connect.+nickname.+channels/i)) {
//		self.location.reload(); // je sais plus pourquoi il y avait ça
//	} else 

	if (nicknameField && channelsField) {
//		self.addEventListener("focus", focusFirstEmptyField); // je sais plus pourquoi il y avait ça
		storify(nicknameField, "nickname");
		storify(channelsField, "channels");
		focusFirstEmptyField();
		channelsField.setAttribute("placeholder", defaultChannels);
		channelsField.parentNode.style.setProperty("border-bottom", "1px dashed black");
		channelsField.parentNode.setAttribute("title", "example: « " + defaultChannels + " »");
	}
	function focusFirstEmptyField(event) {
		if (document.querySelector("form.kiwi-welcome-simple-form")) {
			for (var inputs = document.getElementsByTagName("input"), i = 0; i < 2; i++) {
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
		var event = document.createEvent("HTMLEvents");
		event.initEvent("input", true, true);
		field.dispatchEvent(event);
		field.addEventListener("change", function(event) {
			var key = this.getAttribute("ref");
			if (key && key.match(new RegExp("^" + userjs.key + "_\\w+"))) {
				if (key.match(/channels/)) { this.value = this.value.replace(/[\s:;,]+/g, ",").replace(/^,|,$/g, ""); }
				localStorage.setItem(key, this.value);
			}
		});
	}
}, 1000);
