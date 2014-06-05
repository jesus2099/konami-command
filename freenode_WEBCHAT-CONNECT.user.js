// ==UserScript==
// @name         freenode. WEBCHAT CONNECT
// @version      2014.0605.1354
// @description  webchat.freenode.net: Remembers your last used nickname and channels. Reloads properly if problem. focus the captcha field.
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/freenode_WEBCHAT-CONNECT.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/freenode_WEBCHAT-CONNECT.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011.
// @grant        none
// @include      http://webchat.freenode.net/
// @include      https://webchat.freenode.net/
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var userjs = { name: "freenode. WEBCHAT CONNECT", key:"j2fwc" };
	var inputs, recaptchaParent, recaptcha;
	self.addEventListener("load", function(e) {
		inputs = document.getElementsByTagName("input");
		recaptchaParent = document.querySelector("div.qwebirc-qui table.qwebirc-loginbox div#recaptcha_image");
		recaptcha = document.querySelector("input#recaptcha_response_field");
		if (document.body.textContent.trim().match(/^412 - Precondition Failed$/) || !recaptchaParent) { location.reload(); }
		else if (document.getElementsByTagName("frameset").length == 0 && inputs && inputs[0] && inputs[1] && recaptcha) {
			setTimeout(function() {
				if (!recaptchaParent.querySelector("img#recaptcha_challenge_image")) { location.reload(); }
			}, 4000);
			self.addEventListener("focus", function(e) {
				cleverFocus();
			});
			storify(inputs[0], "nickname");
			storify(inputs[1], "channels");
			cleverFocus();
			inputs[1].style.setProperty("width", "100%");
			inputs[1].parentNode.style.setProperty("border-bottom", "1px dashed black");
			inputs[1].parentNode.parentNode.setAttribute("title", "example: « github,musicbrainz-devel,musicbrainz »");
		}
	});
	function cleverFocus() {
		for (var i=0; i<2; i++) {
			if (inputs[i].value.trim().length == 0) {
				inputs[i].focus();
				return inputs[i];
			}
		}
		recaptcha.focus();
		return recaptcha;
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