// ==UserScript==
// @name         confluence. PAGE HISTORY LAST CHANGE
// @version      2024.5.24
// @description  Atlassian Confluence Cloud wiki: pre-selects last change for one click comparison
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/confluence_PAGE-HISTORY-LAST-CHANGE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/confluence_PAGE-HISTORY-LAST-CHANGE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-04-08
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/7df89dd5adce162c1a6b133f9bc3f0dda4a82b33/lib/SUPER.js?version=2023.3.23
// @grant        none
// @match        *://*.atlassian.net/wiki/spaces/*/history/*/*
// @run-at       document-end
// ==/UserScript==
"use strict";

if (location.pathname.match(/^\/wiki\/spaces\/[^/]+\/history\/\d+\//)) {
	wait_for_elements([
		"tr:nth-of-type(1) > td input[type='checkbox']",
		"tr:nth-of-type(2) > td input[type='checkbox']"
	], function(checkboxes) {
		checkboxes[0].click();
		checkboxes[1].click();
	});
}

function wait_for_elements(elements, callback) {
	var ready_elements = [];
	for (var e = 0; e < elements.length; e++) {
		waitForElement(elements[e], function(element) {
			ready_elements.push(element);
		});
	}
	var wait_for_elements_interval_id = setInterval(function() {
		if (ready_elements.length === elements.length) {
			clearInterval(wait_for_elements_interval_id);
			callback(ready_elements);
		}
	}, 666);
}
