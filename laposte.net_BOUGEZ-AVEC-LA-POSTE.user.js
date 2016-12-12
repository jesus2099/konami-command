// ==UserScript==
// @name         laposte.net. BOUGEZ AVEC LA POSTE
// @version      2016.12.12-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/laposte.net_BOUGEZ-AVEC-LA-POSTE.user.js
// @description  ☠ OBSOLETE ☠ laposte.net webmail power ups: Déconnexion d’un seul clic, moins de pubs
// @homepage     http://userscripts-mirror.org/scripts/show/422068
// @supportURL   https://github.com/jesus2099/konami-command/labels/laposte.net_BOUGEZ-AVEC-LA-POSTE
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/laposte.net_BOUGEZ-AVEC-LA-POSTE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/laposte.net_BOUGEZ-AVEC-LA-POSTE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-03-21
// @grant        none
// @match        *://webmail.laposte.net/*
// @match        *://www.laposte.net/*
// @exclude      *advertisement*
// @exclude      *leftpub*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (!document.cookie.match(new RegExp("laposte.net_BOUGEZ-AVEC-LA-POSTE_obsolete=1"))) {
	alert("☠ OBSOLETE ☠ “laposte.net. BOUGEZ AVEC LA POSTE” ☠ OBSOLETE ☠\r\n\r\nPLEASE UNINSTALL IT to unclutter your userscript list. Thank you for having used this script.\r\n\r\nMerci de bien vouloir DÉSINSTALLER CE SCRIPT afin d’alléger votre navigation. Merci d’avoir utilisé ce script.");
}
document.cookie = "laposte.net_BOUGEZ-AVEC-LA-POSTE_obsolete=1; path=/";
