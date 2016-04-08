// ==UserScript==
// @name         confluence. PAGE HISTORY LAST CHANGE
// @version      2016.4.8
// @changelog    https://github.com/jesus2099/konami-command/commits/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @description  confluence wiki: pre-selects last change for one click comparison
// @supportURL   https://github.com/jesus2099/konami-command/labels/confluence_PAGE-HISTORY-LAST-CHANGE
// @compatible   opera(12.18.1872)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey         quickly tested
// @compatible   chromium(46)+tampermonkey        quickly tested
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    jesus2099/shamo
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-04-08
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @include      */pages/viewpreviousversions.action?pageId=*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (location.pathname.match(/^\/pages\/viewpreviousversions.action$/) && location.search.match(/^\?pageId=\d+$/)) {
	var versions = document.querySelectorAll("table#page-history-container input[type='checkbox'][name='selectedPageVersions']");
	if (versions.length > 1) {
		versions[0].checked = true;
		versions[1].checked = true;
	}
}
