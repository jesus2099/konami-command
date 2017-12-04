// ==UserScript==
// @name         mb. SHOW CAA COMMENTS IN REORDER PAGE
// @version      2017.11.21
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @description  Show cover art comments to ease reordering, especially when thumbnails have not been generated yet.
// @homepage     http://forums.musicbrainz.org/viewtopic.php?pid=31473#p31473
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-09-09
// @grant        none
// @match        *://*.mbsandbox.org/*/add-cover-art
// @match        *://*.mbsandbox.org/*/reorder-cover-art
// @match        *://*.musicbrainz.org/*/add-cover-art
// @match        *://*.musicbrainz.org/*/reorder-cover-art
// @run-at       document-end
// ==/UserScript==
"use strict";
var imageLoaders = document.querySelectorAll("div.thumb-position > a > span.cover-art-image[data-title]")
for (var i = 0; i < imageLoaders.length; i++) {
	var subtitle = document.createElement("div");
	var splitText = imageLoaders[i].getAttribute("data-title").match(/^([^(]+)?(?: \(([\w\W]+)\))?$/);
	if (splitText) {
		for (var j = 1; j < splitText.length; j++) {
			if (splitText[j]) {
				subtitle.appendChild(document.createElement("div").appendChild(document.createTextNode(splitText[j])).parentNode).style.setProperty("border-top", (j - 1) + "px dashed black");
			}
		}
	}
	imageLoaders[i].parentNode.parentNode.insertBefore(document.createElement("div").appendChild(subtitle).parentNode, imageLoaders[i].parentNode.parentNode.firstChild.nextSibling.nextSibling).style.setProperty("background-color", "#ff6");
	imageLoaders[i].parentNode.parentNode.style.setProperty("height", "165px");
}
