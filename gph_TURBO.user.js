// ==UserScript==
// @name         gph. TURBO
// @version      2022.8.26.127
// @description  Display menu, crashed by tracking blockers
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/gph_TURBO
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/gph_TURBO.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-08-26
// @grant        none
// @include      /^https?://gph?\.[acefinr]{9}\.fr//
// @run-at       document-ready
// ==/UserScript==
"use strict";

/* global LazyLoadingNavigation */ // eslint no-undef exception

if (!document.querySelector("nav > ul.menu_level_1")) {
	// Call menu if absent
	// When tracking blockers crash DOMContentLoaded handler
	if (typeof LazyLoadingNavigation === "function") {
		var myLazyLoadingNavigation = new LazyLoadingNavigation();
		myLazyLoadingNavigation.sendRequest("/FR/fr/local/include/menu_bar.jsp", myLazyLoadingNavigation.showNav);
	} else {
		console.warn("LazyLoadingNavigation impossible");
	}
}
