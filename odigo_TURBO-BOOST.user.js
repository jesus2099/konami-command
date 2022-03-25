// ==UserScript==
// @name         odigo. TURBO BOOST
// @version      2022.1.25
// @description  [ivr] APPLICATION LIST: Focus search, Click to select row, Double-click to open application logs and versions; [ivr] APPLICATION: Focus search, Open List View tables by default, Auto stretch narrow tables and modals, Press Escape to close modals, Reveal secret JSON and copy to clipboard; [routing] CLICK TO SELECT: click cell to select its text for copy; [routing] DOUBLE CLICK TO OPEN à la Mandora: dblclick row to view item, +alt to edit, +ctrl for background tab, +shift for new tab; [routing] PENCIL AND EYE ICONS: ctrl+click or middle-click for background tab, shift+click for new tab
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-04-23
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_info
// @include      /^https?:\/\/[^.]+.odigo.cx\/[^/]+\/ui\/service/
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

waitForElement("input#keyword", function(element) { element.focus(); });

switch (self.location.pathname) {
	case "/appNservices.html":

		// Custom highlight colour
		css.insertRule(".table-hover > tbody > tr:hover > td, .table > tbody > tr > td.rowselect { background-color: " + lightBgColour + " !important; }", 0);
		css.insertRule(".table > tbody > tr > td.rowselect > * { color: black; }", 0);
		// Contextual help about click/dblclick actions
		css.insertRule(".table-hover > tbody > tr:hover > td { cursor: default; }", 0);

		// Click to select row checkbox
		var container = document.querySelector("div#main-container");
		if (container) {
			container.addEventListener("click", function(event) {
				var row = getParent(event.target, "tr");
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
					document.querySelector(this.getAttribute("_dblClickAction")).click();
				});
			}
		}

		break;
	case "/application.html":

		// Auto stretch modal dialogs
		css.insertRule("div#main-container div.modal-dialog { min-width: 600px; width: unset !important; }", 0);
		css.insertRule("div#main-container div#modBuilder-form-table-table, div#main-container div#modBuilder-form-table-table div.wtHolder { height: fit-content !important; }", 0);

		// Highlight most important item in filter selection
		css.insertRule("div#main-content div#actions-bar select#arbo-type option[value='table'], div#main-content div#actions-bar select#arbo-type option[value='sound_set'] { background: " + lightBgColour + "; }", 0);

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

// click cell to select its text for copy
css.insertRule("tbody div[unselectable='on'] { cursor: pointer; }", 0);
document.body.addEventListener("click", function(event) {
	if (event.target.tagName == "DIV" && event.target.getAttribute("unselectable") == "on" && event.detail === 1) {
		self.getSelection().selectAllChildren(event.target);
	}
});

// Double-click row to view (+Alt to edit) à la Mandora
document.body.addEventListener("dblclick", function(event) {
	if (event.target.tagName == "DIV" && event.target.getAttribute("unselectable") == "on") {
		var row = getParent(event.target, "tr");
		if (event.ctrlKey || event.shiftKey) {
			// Use +Ctrl for background tab or +Shift for new tab
			openInTab(row, event.altKey ? "edit" : "view");
		} else {
			// Double-click row for current tab
			row.querySelector("img.icon" + (event.altKey ? "Modify" : "View")).click();
		}
	}
});

// Pencil and eye icons open in background tab (ctrl or middle) or new tab (shift)
document.body.addEventListener("mousedown", backgroundTabIcons);
document.body.addEventListener("mouseup", backgroundTabIcons);
document.body.addEventListener("click", backgroundTabIcons, true);
function backgroundTabIcons(event) {
	debug(event.type + " detail=" + event.detail + " button=" + event.button + " on " + event.target);
	if (event.target.tagName == "IMG" && (event.target.classList.contains("iconModify") || event.target.classList.contains("iconView")) && event.detail === 1) {
		if (event.button === 1 || event.ctrlKey || event.shiftKey) {
			if (event.type == "mouseup") {
				openInTab(getParent(event.target, "tr"), event.target.classList.contains("iconView") ? "view" : "edit");
			} else {
				// prevent scroll with middle-click on mousedown
				// prevent navigate in current tab with action icons on click
				event.cancelBubble = true;
				if (event.stopPropagation) event.stopPropagation();
				event.preventDefault();
				return false;
			}
		}
	}
}

function openInTab(row, action) {
	var openObjectURL = {
		agentGroupSearch: {
			view: "agentGroupEdit?action=VIEW&idString=$key",
			edit: "agentGroupEdit?action=UPDATE&idString=$key",
		},
		agentGroupTreeSearch: {
			view: "agentGroupOrganizationEdit?id=$id&label=$key&isCreation=0",
			edit: "agentGroupOrganizationEdit?id=$id&label=$key&isCreation=0",
		},
		calendarSearch: {
			view: "calendarEdit?action=VIEW&CalID=$key",
			edit: "calendarEdit?action=EDIT&CalID=$key",
		},
		/* callbackIdSearch: { // cannot find callerId in page
			view: "callbackIdEdit?action=VIEW&callerId=61",
			edit: "callbackIdEdit?action=EDIT&callerId=61",
		}, */
		/* caseSearch: { // unknown pattern, no examples
		}, */
		channelSearch: {
			view: "channelEdit?action=VIEW&id=$id",
			edit: "channelEdit?action=EDIT&id=$id",
		},
		/* chatGroupSearch: { // cannot find idString in page
			view: "chatGroupEdit?action=VIEW&idString=10",
			edit: "chatGroupEdit?action=UPDATE&idString=10",
		}, */
		/* codificationSearch: { // cannot find codificationId in page
			view: "codificationEdit?action=VIEW&codificationId=3",
			edit: "codificationEdit?action=EDIT&codificationId=3",
		}, */
		/* commonQueueSearch: { // unknown pattern, no examples
		}, */
		ddiSearch: {
			view: "ddiEdit?action=VIEW&keyWord=$base64key",
			edit: "ddiEdit?action=EDIT&keyWord=$base64key",
		},
		gateSearch: {
			view: "gateEdit?action=VIEW&keyWord=$key",
			edit: "gateEdit?action=EDIT&keyWord=$key",
			keyCellIndex: 2
		},
		gateSkillDispatchSearch: {
			view: "gateSkillDispatchEdit?action=VIEW&dispatchId=$id",
			edit: "gateSkillDispatchEdit?action=EDIT&dispatchId=$id",
		},
		gateTreeSearch: {
			view: "gateTreeEdit?id=$id&label=$key&isCreation=0",
			edit: "gateTreeEdit?id=$id&label=$key&isCreation=0",
		},
		/* miniDirectorySearch: { // cannot find annuaireId in page
			view: "miniDirectoryEdit?action=VIEW&annuaireId=8",
			edit: "miniDirectoryEdit?action=EDIT&annuaireId=3",
		}, */
		reasonForCallSearch: {
			view: "reasonForCallListEdit?action=VIEW&rootId=$id",
			edit: "reasonForCallListEdit?action=EDIT&rootId=$id",
		},
		/* smsTemplateSearch: { // unknown pattern, no examples
		}, */
		otherActivitySearch: {
			view: "otherActivityEdit?activityId=$key",
			edit: "otherActivityEdit?activityId=$key",
		},
		skillSearch: {
			view: "skillDisplay?action=VIEW&keyWord=$key",
			edit: "skillEdit?action=EDIT&keyWord=$key",
			keyCellIndex: 2
		},
		userSearch: {
			view: "userEdit?action=VIEW&isTemplate=false&idUtilisateurAEditer=$key",
			edit: "userEdit?action=EDIT&isTemplate=false&userFromLdap=false&idUtilisateurAEditer=$key",
			keyCellIndex: 2
		},
		userTemplateSearch: {
			view: "userEdit?action=VIEW&isTemplate=true&idUtilisateurAEditer=$key",
			edit: "userEdit?action=EDIT&isTemplate=true&idUtilisateurAEditer=$key",
			keyCellIndex: 3
		},
	};
	var listType = location.pathname.match(/[^/]+$/)[0];
	if (openObjectURL[listType]) {
		var url = openObjectURL[listType][action];
		if (url.match(/\$id/)) {
			url = url.replace("$id", row.getAttribute("data-recordid"));
		}
		if (url.match(/\$(base64)?key/)) {
			var key = row.querySelector("td:nth-child(" + (openObjectURL[listType].keyCellIndex || 1) + ") > div[unselectable='on']").textContent;
			url = url.replace("$base64key", btoa(row.querySelector("td:nth-child(" + (openObjectURL[listType].keyCellIndex || 1) + ") > div[unselectable='on']").textContent));
			url = url.replace("$key", encodeURIComponent(row.querySelector("td:nth-child(" + (openObjectURL[listType].keyCellIndex || 1) + ") > div[unselectable='on']").textContent));
		}
		open(url)
	} else {
		// fallback to native buttons, view or edit in current tab
		var actionIcons = {
			view: row.querySelector("img.iconView"),
			edit: row.querySelector("img.iconModify"),
		};
		if (action == "edit" && actionIcons.edit) {
			actionIcons.edit.click();
		} else if (actionIcons.view) {
			actionIcons.view.click();
		}
	}
}

function debug(text) {
	console.debug(GM_info.script.name + " ## " + (typeof text == "string" ? text : JSON.stringify(text)));
}
