// ==UserScript==
// @name         odigo ivr designer. TURBO BOOST
// @version      2021.9.17
// @description  Various quality of life enhancements: Open application in one click; Auto expand narrow table editors
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
		setTimeout(function() {
			// Direct View tree buttons
			var viewTree1 = document.querySelector("div#main-container a#viewOpenTree1");
			var applications = document.querySelectorAll("div#main-container table#applications > tbody tr > td.action > input[type='checkbox']");
			for (var a = 0; a < applications.length; a++) {
				var viewTree = document.createElement("img");
				viewTree.setAttribute("src", "/img/icon/opentree.png");
				viewTree.classList.add("j2viewTree");
				viewTree.style.setProperty("cursor", "pointer");
				viewTree.addEventListener("click", function(event) {
					event.target.previousSibling.click();
					viewTree1.click();
				});
				applications[a].parentNode.appendChild(viewTree);
				applications[a].parentNode.parentNode.addEventListener("dblclick", function(event) {
					event.currentTarget.querySelector("img.j2viewTree").click();
				});
			}
		}, 1000);
		break;
}
