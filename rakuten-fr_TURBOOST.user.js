// ==UserScript==
// @name         rakuten (fr). TURBOOST
// @version      2023.9.3
// @description  Affiche toutes les annonces et totalement, sur le site Rakuten France (version Priceminister)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/rakuten-fr_TURBOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/rakuten-fr_TURBOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2023-08-22; 2022 as bookmarklet
// @match        *://fr.shopping.rakuten.com/mfp/*
// @match        *://fr.shopping.rakuten.com/offer/buy/*/*.html
// @run-at       document-idle
// ==/UserScript==
"use strict";
var interval_delay = 500;
var stop_after_x = 5 /* seconds */ * (1000 / interval_delay);
var i = setInterval(function() {
	var click_these = document.querySelectorAll(
		"a.dispMore:not(.uiHide)#advertPaginationBtn," // Charge toutes les annonces
		+ "div.linkCollaps > span.iconCollaps.svg-icon-chevron-down, " // Ouvre toutes les descriptions
		+ "div.sellerComment > div#advertDescriptionShowPartial.edito:not([style='display: none;']) > span" // Déplie toutes les descriptions longues
	);
	if (click_these.length > 0) {
		for (var c = 0; c < click_these.length; c++) {
			click_these[c].click();
		}
	} else {
		if (--stop_after_x < 1) {
			clearInterval(i);
		}
	}
}, interval_delay);
