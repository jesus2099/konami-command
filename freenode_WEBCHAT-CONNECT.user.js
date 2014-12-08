// ==UserScript==
// @name         freenode. WEBCHAT CONNECT
// @version      2014.12.8.1635
// @description  webchat.freenode.net: Remembers your last used nickname and channels. Reloads properly if problem. focus the captcha field.
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/freenode_WEBCHAT-CONNECT.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/freenode_WEBCHAT-CONNECT.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://webchat.freenode.net/
// @include      https://webchat.freenode.net/
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var userjs = { name: "freenode. WEBCHAT CONNECT", key:"j2fwc" };
	var channels = "github, last.fm, musicbrainz";
	var inputs = document.getElementsByTagName("input");
	var recaptchaParent = document.querySelector("div.qwebirc-qui table.qwebirc-loginbox div#recaptcha_image");
	var recaptcha = document.querySelector("input#recaptcha_response_field");
	if (document.body.textContent.trim().match(/^412 - Precondition Failed$/) || !recaptchaParent) { location.reload(); }
	else if (document.getElementsByTagName("frameset").length == 0 && inputs && inputs[0] && inputs[1] && recaptcha) {
		setTimeout(function() {
			if (
				!(document.querySelector("div.bottomboundpanel") && document.querySelector("div.bottomboundpanel").style.getPropertyValue("display") != "none") &&
				!recaptchaParent.querySelector("img#recaptcha_challenge_image")
			) {
				location.reload();
			}
		}, 4000);
		self.addEventListener("focus", cleverFocus);
		storify(inputs[0], "nickname");
		storify(inputs[1], "channels");
		cleverFocus();
		inputs[1].style.setProperty("width", "100%");
		inputs[1].setAttribute("placeholder", channels);
		inputs[1].parentNode.style.setProperty("border-bottom", "1px dashed black");
		inputs[1].parentNode.parentNode.setAttribute("title", "example: « "+channels+" »");
	}
	function cleverFocus(e) {
		if (document.querySelector("table.qwebirc-loginbox")) {
			for (var i=0; i<2; i++) {
				if (inputs[i].value.trim().length == 0) {
					inputs[i].focus();
					return inputs[i];
				}
			}
			recaptcha.focus();
			return recaptcha;
		}
	}
	function storify(field, key) {
		var _key = userjs.key+"_"+key;
		field.setAttribute("ref", _key);
		field.value = localStorage.getItem(_key);
		field.addEventListener("change", function(e) {
			var key = this.getAttribute("ref");
			if (key && key.match(new RegExp("^"+userjs.key+"_\\w+"))) {
				if (key.match(/channels/)) { this.value = this.value.replace(/[#  :;]/g, ",").replace(/,{2,}/g, ",").replace(/^,|,$/g, ""); }
				localStorage.setItem(key, this.value);
			}
		});
	}
})();