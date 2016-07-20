// ==UserScript==
// @name         itunes. FULL SIZE COVER IMAGE DOWNLOAD LINK
// @version      2016.4.21.1924
// @changelog    https://github.com/jesus2099/konami-command/commits/master/itunes_FULL-SIZE-COVER-IMAGE-DOWNLOAD-LINK.user.js
// @description  iTunes.com: Adds a small link to download full size cover image of an album
// @supportURL   https://github.com/jesus2099/konami-command/labels/itunes_FULL-SIZE-COVER-IMAGE-DOWNLOAD-LINK
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @compatible   firefox(45.0.2)+greasemonkey        quickly tested
// @compatible   chromium(46.0.2471.0)+tampermonkey  quickly tested
// @compatible   chrome+tampermonkey                 should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/itunes_FULL-SIZE-COVER-IMAGE-DOWNLOAD-LINK.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/itunes_FULL-SIZE-COVER-IMAGE-DOWNLOAD-LINK.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-04-21
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @match        *://itunes.apple.com/*/album/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var album = document.querySelector("h1");
var canonical = document.querySelector("head link[rel='canonical']");
var cover = document.querySelector("div.lockup.product a > div.artwork > img.artwork");
if (cover) {
	cover.parentNode.parentNode.setAttribute("href", cover.getAttribute("src-swap").replace(
		/^(.*\/\/)\w+(\d+.mzstatic.com)\/\w+\/\w+\/(\w+\/\w+\/\w+\/\w+\/\w+\/[\w-]+)\/cover\d+x\d+.jpeg$/,
		"$1is$2/image/thumb/$3/source/99999999x99999999bb-100.jpg"
	));
	cover.parentNode.parentNode.setAttribute("target", "_blank");
	cover.parentNode.parentNode.style.setProperty("cursor", "zoom-in");
}
if (album && canonical) {
	var a = document.createElement("a");
	a.appendChild(document.createTextNode(album.textContent));
	a.setAttribute("href", canonical.getAttribute("href"));
	album.replaceChild(a, album.firstChild);
}
