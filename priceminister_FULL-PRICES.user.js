// ==UserScript==
// @name         priceminister. FULL PRICES
// @version      2016.12.12-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/priceminister_FULL-PRICES.user.js
// @description  ☠ OBSOLETE ☠ Affichait les prix totaux (incl. frais de port)
// @supportURL   https://github.com/jesus2099/konami-command/labels/priceminister_FULL-PRICES
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/priceminister_FULL-PRICES.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/priceminister_FULL-PRICES.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-08-14
// @grant        none
// @match        *://*.priceminister.com/offer/buy/*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (!document.cookie.match(new RegExp("pm_FULL-PRICES_obsolete=1"))) {
	alert("☠ OBSOLETE ☠ “priceminister. FULL PRICES” ☠ OBSOLETE ☠\r\n\r\nPLEASE UNINSTALL IT to unclutter your userscript list. Thank you for having used this script.\r\n\r\nMerci de bien vouloir DÉSINSTALLER CE SCRIPT afin d’alléger votre navigation. Merci d’avoir utilisé ce script.");
}
document.cookie = "pm_FULL-PRICES_obsolete=1; path=/";
