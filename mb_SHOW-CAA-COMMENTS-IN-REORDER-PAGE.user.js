// ==UserScript==
// @name         mb. SHOW CAA COMMENTS IN REORDER PAGE
// @version      2020.11.17
// @description  Show cover art comments to ease reordering, especially when thumbnails have not been generated yet.
// @compatible   vivaldi(3.4.2066.106)+violentmonkey  my setup
// @compatible   firefox(82.0.3)+violentmonkey        my other setup
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2015-09-09; http://forums.musicbrainz.org/viewtopic.php?pid=31473#p31473
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(add|reorder)-cover-art/
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
