// ==UserScript==
// @name         confluence. PAGE HISTORY LAST CHANGE
// @version      2024.5.26
// @description  ☠ OBSOLETE ☠ This userscript is abandonned and will be removed soon ☠ Atlassian Confluence wiki (not atlassian.net cloud): pre-selects last change for one click comparison
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/confluence_PAGE-HISTORY-LAST-CHANGE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
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
