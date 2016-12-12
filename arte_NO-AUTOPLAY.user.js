// ==UserScript==
// @name         arte. NO AUTOPLAY
// @version      2016.12.12-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/arte_NO-AUTOPLAY.user.js
// @description  ☠ OBSOLETE ☠ arte.tv: Used to remove autoplay property from video page links
// @inspiration  http://userscripts-mirror.org/scripts/show/487275
// @supportURL   https://github.com/jesus2099/konami-command/labels/arte_NO-AUTOPLAY
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey         quickly tested
// @compatible   chromium(46)+tampermonkey        quickly tested
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/arte_NO-AUTOPLAY.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/arte_NO-AUTOPLAY.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-03-18
// @grant        none
// @include      http://arte.tv/*
// @include      http://concert.arte.tv/*
// @include      http://www.arte.tv/*
// @run-at       document-start
// ==/UserScript==
"use strict";
if (!document.cookie.match(new RegExp("arte_NO-AUTOPLAY_obsolete=1"))) {
	alert("☠ OBSOLETE ☠ “arte. NO AUTOPLAY” ☠ OBSOLETE ☠\r\n\r\nPLEASE UNINSTALL IT to unclutter your userscript list. Thank you for having used this script.\r\n\r\nMerci de bien vouloir DÉSINSTALLER CE SCRIPT afin d’alléger votre navigation. Merci d’avoir utilisé ce script.");
}
document.cookie = "arte_NO-AUTOPLAY_obsolete=1; path=/";
