// ==UserScript==
// @name         odigo ivr designer. TURBO BOOST
// @version      2023.2.10
// @description  APPLICATION LIST: Focus search, Click to select row, Double-click to open application logs and versions, Show full release description and click for easy copy, Select first application and PROD, Select current version, Hide empty release user column, Show deploy status in tab title; APPLICATION: Focus search, Open List View tables by default, Auto stretch narrow tables and modals, Highlight modal table rows, Emphasise reset and upgrade buttons, Press Escape to close modals, Reveal secret JSON and copy to clipboard
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo-ivr-designer_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo-ivr-designer_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-04-23
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\/ivr-designer[^.]*\.(odigo\.cx|prosodie\.com)\/application\.html/
// @include      /^https?:\/\/ivr-designer[^.]*\.(odigo\.cx|prosodie\.com)\/appNservices\.html/
// @run-at       document-ready
// ==/UserScript==
"use strict";

/* global Header script */ // eslint no-undef exception

var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
var lightBgColour = "#fcf";
var darkBgColour = "purple";

// Show script badge and help tooltip
css.insertRule("span.badge." + GM_info.script.author + " { background-color: " + lightBgColour + "; color: black; cursor: help; position: fixed; top: 3px; right: 3px; box-shadow: inset 1px 1px 3px " + darkBgColour + "; z-index: 1035; }", 0);
css.insertRule("span.badge." + GM_info.script.author + ":hover:after { background-color: " + lightBgColour + "; box-shadow: 1px 1px 3px " + darkBgColour + "; position: absolute; left: 2px; top: 20px; white-space: pre; padding: .5em; text-align: left; content: attr(data-title); }", 0);
document.body.appendChild(
	createTag(
		"span",
		{a: {
			class: "badge " + GM_info.script.author,
			"data-title": GM_info.script.description.replace(/:/g, "\n\n‣").replace(/,/g, "\n‣").replace(/; /g, "\n\n")
		}},
		[
			GM_info.script.name,
			" ",
			createTag("a", {a: {href: GM_info.script.supportURL, target: "_blank"}}, "v" + GM_info.script.version)
		]
	)
);
waitForElement("input#keyword", function(element) { element.focus(); });

switch (self.location.pathname) {
	case "/appNservices.html":

		// Custom highlight colour
		css.insertRule(".table-hover > tbody > tr:hover > td, .table > tbody > tr > td.rowselect { background-color: " + lightBgColour + " !important; }", 0);
		css.insertRule(".table > tbody > tr > td.rowselect > * { color: black; }", 0);

		// Click to select row checkbox
		var container = document.querySelector("div#main-container");
		if (container) {
			container.addEventListener("click", function(event) {
				var row = event.target.closest("tbody > tr");
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

		// Loading percent in tab/window name/title
		setInterval(function() {
			var progress = document.querySelector("#progress");
			if (progress) {
				var my_separator = " ⌛ ";
				var percent = progress.textContent.replace(/\s/g, "");
				if (percent.match(/^\d?\d%$/)) {
					var progress_text = progress.textContent.replace(/\s/g, "") + " " + progress.parentNode.previousSibling.previousSibling.textContent;
					if (document.title.match(new RegExp(my_separator))) {
						document.title = document.title.replace(new RegExp("^.+" + my_separator), progress_text + my_separator);
					} else {
						document.title = progress_text + my_separator + document.title;
					}
				} else if (document.title.match(new RegExp(my_separator))) {
					document.title = document.title.replace(new RegExp("^.+" + my_separator), "");
				}
			}
		}, 1000);

		// Double-click to open application, logs and versions
		var DblClickTableActions = [
			{table: "div#main-container table#applications > tbody", action: "div#main-container a#viewOpenTree1"},
			{table: "div#main-container table#services > tbody", action: "div#main-container a#getLogs1"},
			{table: "div#main-container div[ng-show='showReleaseTable'] table > tbody", action: "div#main-container a#viewRelOpenTree1"}
		];
		for (var a = 0; a < DblClickTableActions.length; a++) {
			var table = document.querySelector(DblClickTableActions[a].table);
			var action = document.querySelector(DblClickTableActions[a].action);
			if (table && action) {
				table.setAttribute("_dblClickAction", DblClickTableActions[a].action);
				action.style.setProperty("background-color", lightBgColour);
				table.addEventListener("dblclick", function(event) {
					if (self.getSelection().isCollapsed) { // skip when selecting text
						document.querySelector(this.getAttribute("_dblClickAction")).click();
					}
				});
			}
		}

		// Select first application and PROD
		setInterval(function() {
			// Select first application (only once)
			var first_application = document.querySelector("div#main-container table#applications > tbody > tr > td:last-of-type > input[type='checkbox']");
			if (first_application && !first_application.classList.contains("jesus2099") && !first_application.checked) {
				first_application.classList.add("jesus2099");
				var active_element = document.activeElement;
				first_application.click();
				active_element.focus();
			}
			// Select PROD (only once)
			var service, services = document.querySelectorAll("div#main-container table#services > tbody > tr:not(.jesus2099) > td:first-of-type > a.ng-binding[ng-click^='getservice']");
			for (var s = 0; s < services.length; s++) {
				services[s].parentNode.parentNode.classList.add("jesus2099");
				if (services[s] && services[s].textContent.trim() == "PROD") {
					var service = services[s].parentNode.parentNode.querySelector("input[type='checkbox']");
					if (service && !service.checked) {
						var active_element = document.activeElement;
						service.click();
						active_element.focus();
					}
					break;
				}
			}
			// Select current version/release (only once)
			var current_service = document.querySelector("div#main-container table#services > tbody > tr > td:last-of-type > input[type='checkbox']:checked");
			if (current_service) {
				var current_release = current_service.parentNode.parentNode.querySelector("div#main-container table#services > tbody > tr > td:nth-of-type(7)");
				current_service = current_service.parentNode.parentNode.querySelector("td:first-of-type > a.ng-binding[ng-click^='getservice']");
				if (current_service && current_release) {
					current_release = current_service.textContent.trim() + "#" + current_release.textContent.trim();
					var release, releases = document.querySelectorAll("div#main-container div[ng-show='showReleaseTable'] table > tbody > tr:not(.jesus2099) > td:first-of-type > a.ng-binding[ng-click^='getReleaseDetails']");
					for (var r = 0; s < releases.length; r++) {
						releases[r].parentNode.parentNode.classList.add("jesus2099");
						if (releases[r] && releases[r].textContent.trim() == current_release) {
							var release = releases[r].parentNode.parentNode.querySelector("input[type='checkbox']");
							if (release && !release.checked) {
								var active_element = document.activeElement;
								release.click();
								active_element.focus();
							}
							break;
						}
					}
				}
			}
		}, 666);

		// Auto stretch Release table cells DESCRIPTION and select it for easy copy
		css.insertRule("div#main-container div[ng-show='showReleaseTable'] table > tbody > tr > td:nth-child(2) > p { white-space: unset; }", 0);
		// Then no need for the bubble tooltip
		css.insertRule("div#main-container div[ng-show='showReleaseTable'] table > tbody > tr > td:nth-child(2) > p ~ div { display: none !important; }", 0);

		// Hide Release table empty column UTILISATEUR / USER
		css.insertRule("div#main-container div[ng-show='showReleaseTable'] table > thead > tr > th:nth-child(3) { display: none; }", 0);
		css.insertRule("div#main-container div[ng-show='showReleaseTable'] table > tbody > tr > td:nth-child(3) { display: none; }", 0);

		break;
	case "/application.html":

		// Emphasise reset and upgrade buttons
		css.insertRule("button#mod-btn-reset, button#mod-btn-upgrade { background-color: #603; }", 0);

		// Auto stretch modal dialogs
		css.insertRule("div#main-container div.modal-dialog { min-width: 600px; width: unset !important; }", 0);
		css.insertRule("div#main-container div#modBuilder-form-table-table, div#main-container div#modBuilder-form-table-table div.wtHolder { height: fit-content !important; }", 0);

		// Highlight modal table rows
		css.insertRule("div#main-container div.modal-body table.htCore > tbody > tr:hover > td { background-color: " + lightBgColour + " !important; }", 0);

		// Highlight most important item in filter selection
		css.insertRule([
			"div#arborescence table#sortList > tbody > tr > td[module_name='SCR_INIT_CONSOLE_DATA'] > a",
			"div#arborescence table#sortList > tbody > tr > td[module_name='T_CONSOLE_ACTIVITY'] > a",
			"div#arborescence table#sortList > tbody > tr > td[module_name='T_DDI'] > a",
			"div#main-content div#actions-bar select#arbo-type option[value='script']",
			"div#main-content div#actions-bar select#arbo-type option[value='table']",
		].join(", ") + " { background: " + lightBgColour + "; }", 0);
		css.insertRule([
			"div#arborescence table#sortList > tbody > tr > td[module_name^='T_'][module_name$='_MSG'] > a",
			"div#arborescence table#sortList > tbody > tr > td[module_name='SNS_EN'] > a",
			"div#arborescence table#sortList > tbody > tr > td[module_name='SNS_FR'] > a",
			"div#main-content div#actions-bar select#arbo-type option[value='sound_set']",
		].join(", ") + " { background: #ffc; }", 0);
		// Copy secret JSON to clipboard
		css.insertRule("div#arborescence li#btn-json { display: block !important; background: " + lightBgColour + "; }", 0);
		css.insertRule("div#arborescence li#btn-json a::before { content: 'Copy secret '; }", 0);
		document.body.addEventListener("click", function(event) {
			if (script && event.target == document.querySelector("div#arborescence li#btn-json > a")) {
				navigator.clipboard.writeText(JSON.stringify(script, null, 2)).then(
					function() { Header._ShowNotification({level: "success", message: "Secret JSON succesfully copied to clipboard", close: "×", duration: 4000}); },
					function() { Header._ShowNotification({level: "error", message: "Error copying JSON to clipboard!"}); }
				);
				return stop(event);
			}
		}, true);

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
