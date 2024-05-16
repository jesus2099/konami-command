// ==UserScript==
// @name         jira. TURBO BOOST
// @version      2024.5.16
// @description  Fast toggle/switch quick filters (Ctrl for native additive behaviour)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/jira_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/jira_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-09-04
// @grant        none
// @include      /^https?:\/\//
// @run-at       document-end
// ==/UserScript==
"use strict";
if (document.body.matches("body#jira")) {
	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	document.head.appendChild(css);
	css = css.sheet;
	css.insertRule("div#content main#main dl[id^='js-'][id$='-quickfilters']:after { content: ' (click to switch / Ctrl to add) '; background-color: #ffc; }", 0);
	css.insertRule("div#content main#main dl[id^='js-'][id$='-quickfilters']:not([aria-expanded='true']):hover { height: initial; padding-right: initial !important; background-color: #fef; }", 0);
	css.insertRule("div#content main#main dl[id^='js-'][id$='-quickfilters']:not([aria-expanded='true']):hover > dd.ghx-quickfilter-trigger { display: none; }", 0);
	document.body.addEventListener("click", function(event) {
		if (!event.ctrlKey && !event.shiftKey && event.target.matches("div#content main#main dl[id^='js-'][id$='-quickfilters'] > dd > a.js-quickfilter-button[data-filter-id].ghx-active")) {
			var active_quick_filters = document.querySelectorAll("div#content main#main dl[id^='js-'][id$='-quickfilters'] > dd > a.js-quickfilter-button[data-filter-id].ghx-active");
			if (active_quick_filters.length > 1) {
				for (var f = 0; f < active_quick_filters.length; f++) {
					if (active_quick_filters[f] != event.target) {
						active_quick_filters[f].click();
					}
				}
			}
		}
	});
}
