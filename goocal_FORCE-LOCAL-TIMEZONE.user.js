// ==UserScript==
// @name         goocal. FORCE LOCAL TIMEZONE
// @version      2016.12.12-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/goocal_FORCE-LOCAL-TIMEZONE.user.js
// @description  ☠ OBSOLETE ☠ google.com/calendar/ (gcal): Display times in your own local computed time zone (uses jsTimezoneDetect)
// @homepage     http://userscripts-mirror.org/scripts/show/159216
// @supportURL   https://github.com/jesus2099/konami-command/labels/goocal_FORCE-LOCAL-TIMEZONE
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/goocal_FORCE-LOCAL-TIMEZONE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/goocal_FORCE-LOCAL-TIMEZONE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2013-02-15
// @grant        none
// @match        *://*.google.com/calendar/*
// @exclude      *ctz=*
// @run-at       document-start
// ==/UserScript==
"use strict";
if (!document.cookie.match(new RegExp("goocal_FORCE-LOCAL-TIMEZONE_obsolete=1"))) {
	alert("☠ OBSOLETE ☠ “goocal. FORCE LOCAL TIMEZONE” ☠ OBSOLETE ☠\r\n\r\nPLEASE UNINSTALL IT to unclutter your userscript list. Thank you for having used this script.\r\n\r\nMerci de bien vouloir DÉSINSTALLER CE SCRIPT afin d’alléger votre navigation. Merci d’avoir utilisé ce script.");
}
document.cookie = "goocal_FORCE-LOCAL-TIMEZONE_obsolete=1; path=/";
