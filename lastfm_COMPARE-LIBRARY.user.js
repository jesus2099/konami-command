// ==UserScript==
// @name         lastfm. COMPARE LIBRARY
// @version      2016.12.12-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/lastfm_COMPARE-LIBRARY.user.js
// @description  ☠ OBSOLETE ☠ last.fm: Used to provide basic side by side comparison of any library page with ours.
// @supportURL   https://github.com/jesus2099/konami-command/labels/lastfm_COMPARE-LIBRARY
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey         quickly tested
// @compatible   chromium(46)+tampermonkey        quickly tested
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/lastfm_COMPARE-LIBRARY.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/lastfm_COMPARE-LIBRARY.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-01-06
// @grant        none
// @match        *://*.last.fm/user/*/library*
// @match        *://www.lastfm.*/user/*/library*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (!document.cookie.match(new RegExp("lastfm_COMPARE-LIBRARY_obsolete=1"))) {
	alert("☠ OBSOLETE ☠ “lastfm. COMPARE LIBRARY” ☠ OBSOLETE ☠\r\n\r\nPLEASE UNINSTALL IT to unclutter your userscript list. Thank you for having used this script.\r\n\r\nMerci de bien vouloir DÉSINSTALLER CE SCRIPT afin d’alléger votre navigation. Merci d’avoir utilisé ce script.");
}
document.cookie = "lastfm_COMPARE-LIBRARY_obsolete=1; path=/";
