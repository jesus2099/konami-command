// ==UserScript==
// @name         odigo ivr designer. TURBO BOOST
// @version      2021.9.17
// @description  Various quality of life enhancements: Auto expand narrow table editors; Double-click to View Tree
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo-ivr-designer_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo-ivr-designer_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-04-23
// @grant        none
// @include      /^https?:\/\/ivr-designer\d?\.prosodie\.com\/application\.html/
// @include      /^https?:\/\/ivr-designer\d?\.prosodie\.com\/appNservices\.html/
// @run-at       document-ready
// ==/UserScript==
"use strict";

switch (self.location.pathname) {
	case "/application.html":
		// Auto expand narrow table editors
		setInterval(function() {
			var narrowTable = document.querySelector("div#modBuilder-form-table-table-container.col-sm-7");
			var expandButton = document.querySelector("img#modBuilder-form-table-stretch");
			if (narrowTable && expandButton) {
				console.debug(narrowTable + " " + expandButton);
				expandButton.click();
			}
		}, 500);
		break;
	case "/appNservices.html":
		// Double-click to View Tree
		var applicationTable = document.querySelector("div#main-container table#applications > tbody");
		var viewTree1 = document.querySelector("div#main-container a#viewOpenTree1");
		if (applicationTable && viewTree1) {
			applicationTable.addEventListener("dblclick", function(event) {
				var selectedApplication = parentRow(event.target);
				if (selectedApplication) {
					selectedApplication = selectedApplication.querySelector("input[type='checkbox']#serviceID1");
					if (selectedApplication) {
						for (
							var allApplications = applicationTable.querySelectorAll("input[type='checkbox']#serviceID1:checked"), a = 0;
							a < allApplications.length;
							a++
						) {
							allApplications[a].click();
						}
						document.body.style.setProperty("opacity", ".3");
						selectedApplication.click();
						viewTree1.click();
					}
				}
			});
		}
		break;
}
function parentRow(node) {
	if (node.tagName && node.tagName === "TR") {
		return node;
	} else if (node.tagName && (node.tagName === "BODY" || node.tagName === "HTML")) {
		return null;
	} else {
		return parentRow(node.parentNode);
	}
}