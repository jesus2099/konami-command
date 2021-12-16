// ==UserScript==
// @name         odigo ivr designer. TURBO BOOST
// @version      2021.12.16
// @description  APPLICATION LIST: Click to select row, Double-click to open application; APPLICATION: Open List View tables by default, Auto stretch narrow tables and modals, Press Escape to close modals
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo-ivr-designer_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo-ivr-designer_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-04-23
// @grant        GM_info
// @include      /^https?:\/\/ivr-designer\d?\.prosodie\.com\/application\.html/
// @include      /^https?:\/\/ivr-designer\d?\.prosodie\.com\/appNservices\.html/
// @run-at       document-ready
// ==/UserScript==
"use strict";

var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
var lightBgColour = "#FCF";
var darkBgColour = "purple";

// Show script badge and help tooltip
css.insertRule("span.badge." + GM_info.script.author + " { background-color: " + lightBgColour + "; color: black; cursor: help; position: fixed; top: 3px; right: 3px; box-shadow: inset 1px 1px 3px " + darkBgColour + "; z-index: 1035; }", 0);
css.insertRule("span.badge." + GM_info.script.author + ":hover:after { background-color: " + lightBgColour + "; box-shadow: 1px 1px 3px " + darkBgColour + "; position: absolute; left: 2px; top: 20px; white-space: pre; padding: .5em; text-align: left; content: attr(data-title); }", 0);
var doc = document.createElement("span");
doc.classList.add("badge", GM_info.script.author);
doc.appendChild(document.createTextNode(GM_info.script.name + " "));
var supportLink = doc.appendChild(document.createElement("a")).appendChild(document.createTextNode("v" + GM_info.script.version)).parentNode;
supportLink.setAttribute("href", GM_info.script.supportURL);
supportLink.setAttribute("target", "_blank");
doc.setAttribute("data-title", GM_info.script.description.replace(/:/g, "\n\n‣").replace(/,/g, "\n‣").replace(/; /g, "\n\n"));
document.body.appendChild(doc);

switch (self.location.pathname) {
	case "/appNservices.html":

		// Custom highlight colour
		css.insertRule(".table-hover > tbody > tr:hover > td, .table > tbody > tr > td.rowselect { background-color: " + lightBgColour + " !important; }", 0);
		css.insertRule(".table > tbody > tr > td.rowselect * { color: black; }", 0);
		// Contextual help about click/dblclick actions
		css.insertRule(".table-hover > tbody > tr:hover:after, .table-hover > tbody > tr:hover:after { position: absolute; right: 40%; padding: 0 6px; margin-top: 4px; background-color: white; content: 'click to select / double-click to open'; cursor: pointer; }", 0);
		css.insertRule(".table-hover > tbody > tr:hover > td { cursor: pointer; }", 0);

		// Click to select row checkbox
		var container = document.querySelector("div#main-container");
		if (container) {
			container.addEventListener("click", function(event) {
				var row = parentRow(event.target);
				if (row) {
					var rowCheckbox = row.querySelector("input[type='checkbox']");
					if (rowCheckbox) {
						for (
							var rowCheckboxes = row.parentNode.querySelectorAll("input[type='checkbox']:checked"), c = 0;
							c < rowCheckboxes.length;
							c++
						) {
							rowCheckboxes[c].click();
						}
						rowCheckbox.click();
					}
				}
			});
		}

		// Double-click to View Tree
		var applicationTable = document.querySelector("div#main-container table#applications > tbody");
		var viewTree1 = document.querySelector("div#main-container a#viewOpenTree1");
		if (applicationTable && viewTree1) {
			viewTree1.style.setProperty("background-color", lightBgColour);
			applicationTable.addEventListener("dblclick", function(event) {
				viewTree1.click();
			});
		}

		break;
	case "/application.html":

		// Auto stretch modal dialogs
		css.insertRule("div#main-container div.modal-dialog { min-width: 600px; width: unset !important; }", 0);
		css.insertRule("div#main-container div#modBuilder-form-table-table, div#main-container div#modBuilder-form-table-table div.wtHolder { height: fit-content !important; }", 0);

		// highlight most important item in filter selection
		css.insertRule("div#main-content div#actions-bar select#arbo-type option[value='table'], div#main-content div#actions-bar select#arbo-type option[value='sound_set'] { background: " + lightBgColour + "; }", 0);

		// Keyboard shortcut handler
		document.body.addEventListener("keydown", function(event) {
			switch (event.key) {
				// Press Escape to close modal dialog
				case "Escape":
					var visibleModalCloseButton = document.querySelector("div#mod-properties-container[aria-hidden='false'] div.modal-header button[type='button'][data-dismiss='modal'].close");
					if (visibleModalCloseButton) {
						visibleModalCloseButton.click();
					}
					break;
			}
		});

		// Improvement daemon
		setInterval(function() {
			var treeViewButton = document.querySelector("div#arborescence a.tree-view");
			var listViewButton = document.querySelector("div#arborescence a.list-view");
			var filterSelect = document.querySelector("div#main-content div#actions-bar select#arbo-type");

			// Go to List View by default
			if (treeViewButton.classList.contains("selected") && !treeViewButton.classList.contains("jesus2099")) {
				treeViewButton.classList.add("jesus2099");
				listViewButton.click();
			}

			// Show only tables List View by default
			if (listViewButton.classList.contains("selected") && !listViewButton.classList.contains("jesus2099") && filterSelect) {
				listViewButton.classList.add("jesus2099");
				filterSelect.value = "table";
				var event = document.createEvent("HTMLEvents");
				event.initEvent("change", true, true);
				filterSelect.dispatchEvent(event);
			}

			// Auto stretch narrow tables
			var narrowTable = document.querySelector("div#modBuilder-form-table-table-container.col-sm-7");
			var expandButton = document.querySelector("img#modBuilder-form-table-stretch");
			if (narrowTable && expandButton) {
				expandButton.click();
			}
		}, 500);
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
