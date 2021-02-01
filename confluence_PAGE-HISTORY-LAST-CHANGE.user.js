// ==UserScript==
// @name         confluence. PAGE HISTORY LAST CHANGE
// @version      2016.4.8.2099
// @changelog    https://github.com/jesus2099/konami-command/commits/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @description  Atlassian Confluence wiki: pre-selects last change for one click comparison
// @supportURL   https://github.com/jesus2099/konami-command/labels/confluence_PAGE-HISTORY-LAST-CHANGE
// @compatible   opera(12.18.1872)+violentmonkey     my own setup
// @compatible   firefox(45.0.1)+greasemonkey        quickly tested
// @compatible   chromium(37.0.2030.0)+tampermonkey  quickly tested
// @compatible   chrome+tampermonkey                 should be same as chromium
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-04-08
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @include      */pages/viewpreviousversions.action?pageId=*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (self.location.pathname.match(/^\/pages\/viewpreviousversions.action$/) && self.location.search.match(/^\?pageId=\d+$/)) {
	var versions = document.querySelectorAll("table#page-history-container input[type='checkbox'][name='selectedPageVersions']");
	if (versions.length > 1) {
		versions[0].checked = true;
		versions[1].checked = true;
	}
}
