// ==UserScript==
// @name         odigo routing. TURBO BOOST
// @version      2022.3.24
// @description  CLICK TO SELECT: click cell to select its text for copy; DOUBLE CLICK TO OPEN à la Mandora: dblclick row to view item, +alt to edit, +ctrl for background tab, +shift for new tab; PENCIL AND EYE ICONS: ctrl+click or middle-click for background tab, shift+click for new tab
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo-routing_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo-routing_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-03-21
// @grant        GM_info
// @include      /https?:\/\/[^.]+.odigo.cx\/[^/]+\/ui\/service/
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
		var row = parentRow(event.target);
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
				openInTab(parentRow(event.target), event.target.classList.contains("iconView") ? "view" : "edit");
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

function parentRow(node) {
	if (node.tagName && node.tagName === "TR") {
		return node;
	} else if (node.tagName && (node.tagName === "BODY" || node.tagName === "HTML")) {
		return null;
	} else {
		return parentRow(node.parentNode);
	}
}
function debug(text) {
	console.debug(GM_info.script.name + "\n" + (typeof text == "string" ? text : JSON.stringify(text)));
}
