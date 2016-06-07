// ==UserScript==
// @name         mb. show CAA comments in reorder page
// @version      2015.9.9
// @homepage     http://forums.musicbrainz.org/viewtopic.php?pid=31473#p31473
// @compatible   opera(12.17)+violentmonkey  my setup
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-09-09
// @grant        none
// @include      http*://*musicbrainz.org/*/reorder-cover-art
// @include      http://*.mbsandbox.org/*/reorder-cover-art
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document.end
// ==/UserScript==
"use strict";
var imageLoaders = document.querySelectorAll("div.thumb-position > a > span.cover-art-image[data-title]")
for (var i = 0; i < imageLoaders.length; i++) {
	imageLoaders[i].parentNode.parentNode.insertBefore(document.createElement("div").appendChild(document.createTextNode(imageLoaders[i].getAttribute("data-title"))).parentNode, imageLoaders[i].parentNode.parentNode.firstChild.nextSibling.nextSibling).style.setProperty("background-color", "#ff6");
	imageLoaders[i].parentNode.parentNode.style.setProperty("height", "165px");
}
