// ==UserScript==
// @name         mb. SHOW CAA COMMENTS IN REORDER PAGE
// @version      2016.6.15
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @description  Show cover art comments to ease reordering, especially when thumbnails have not been generated yet.
// @homepage     http://forums.musicbrainz.org/viewtopic.php?pid=31473#p31473
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-09-09
// @grant        none
// @match        *://*.mbsandbox.org/*/reorder-cover-art
// @match        *://*.musicbrainz.org/*/reorder-cover-art
// @run-at       document-end
// ==/UserScript==
"use strict";
var imageLoaders = document.querySelectorAll("div.thumb-position > a > span.cover-art-image[data-title]")
for (var i = 0; i < imageLoaders.length; i++) {
	imageLoaders[i].parentNode.parentNode.insertBefore(document.createElement("div").appendChild(document.createTextNode(imageLoaders[i].getAttribute("data-title"))).parentNode, imageLoaders[i].parentNode.parentNode.firstChild.nextSibling.nextSibling).style.setProperty("background-color", "#ff6");
	imageLoaders[i].parentNode.parentNode.style.setProperty("height", "165px");
}
