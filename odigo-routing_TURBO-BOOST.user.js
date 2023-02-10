// ==UserScript==
// @name         odigo routing. TURBO BOOST
// @version      2023.2.10
// @description  ENABLE CELL TEXT SELECTION: click to select, middle-click to copy; SHOW CELL CROPPED TEXT TOOLTIPS: Show full text Odigo tooltips everywhere, not yet working in supervision; LINKIFY MENU ITEMS: to allow open in other tab; DOUBLE CLICK ROW TO VIEW ITEM: with Ctrl key for new background tab, with Shift key for new foreground tab, with Alt key to edit instead of view; PENCIL AND EYE ICONS: Ctrl + click for new background tab, middle-click for new background tab, Shift + click for new foreground tab; EDIT/VIEW PAGE TOGGLE
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/odigo-routing_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/odigo-routing_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-03-21
// @grant        none
// @include      /^https?:\/\/[^.]+.odigo.cx\/[^/]+\/ui\/service/
// @run-at       document-ready
// ==/UserScript==
"use strict";

var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
var lightBgColour = "#fcf";
var darkBgColour = "purple";
css.insertRule("a." + GM_info.script.author + " { background-color: " + lightBgColour + "; text-decoration: underline; }", 0);

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
function warning(text) {
		var div = document.createElement("div");
		div.appendChild(document.createElement("code")).appendChild(document.createTextNode(text));
		doc.appendChild(div);
}

// Increase contrast of unreadable menu headers
css.insertRule("div[role='menu'] h5 { color: #99c !important; }", 0);

// LINKIFY MENU ITEMS: to allow open in other tab
document.body.addEventListener("mousedown", function(event) {
	if (event.target.matches("a[href='#'][onclick^='Menu._OnMenuListItemClick']")) {
		var page = event.target.getAttribute("onclick").match(/^Menu\._OnMenuListItemClick\('1','([^']+)'\);$/);
		if (page && location.pathname.indexOf("/ama01/") == 0) {
			page = page[1];
			event.target.removeAttribute("onclick");
			event.target.setAttribute("href", page.match(/^https?:\/\//) ? page : "/ama01/ui/service/" + page);
			event.target.style.setProperty("color", lightBgColour);
		}
	}
});

// ENABLE CELL TEXT SELECTION: click to select, middle-click to copy
css.insertRule("tbody div[unselectable='on'] { cursor: pointer; }", 0);
css.insertRule(".x-unselectable { user-select: text; }", 0);
// Odigo achieved to even block CSS user-select: all, somehow, so we have to add a JavaScript
document.body.addEventListener("click", click_select_copy);
document.body.addEventListener("mousedown", click_select_copy);
function click_select_copy(event) {
	if (event.target.closest("div[unselectable='on']") && event.detail === 1) {
		if (event.type == "mousedown" && event.button === 1 && typeof Header != "undefined" && navigator.clipboard) {
			// middle click: copy to clipboard
			if (event.target.textContent.trim() !== "") {
				navigator.clipboard.writeText(event.target.textContent).then(
					function() { Header._ShowNotification({level: "success", message: "“" + event.target.textContent + "” copied to clipboard", close: "×", duration: 4000}); },
					function() {
						Header._ShowNotification({level: "error", message: "Error when copying to clipboard!"});
						self.getSelection().selectAllChildren(event.target);
					}
				);
				// prevent middle click scroll
				event.preventDefault();
			}
		} else if (event.type == "click" && event.button === 0) {
			// main (left) click: select
			self.getSelection().selectAllChildren(event.target);
		}
	}
}

if (location.pathname.match(/\b(gateTreeEdit|supervision)/)) {
	// SHOW CELL CROPPED TEXT TOOLTIPS
	document.body.addEventListener("mouseover", function(event) {
		if (
			event.target.closest("div[unselectable='on'], div.x-column-header-inner")
			&& (event.target.scrollHeight > event.target.clientHeight || event.target.scrollWidth > event.target.clientWidth) // text overflows (is cut)
			&& !event.target.parentNode.getAttribute("data-qtip") // no Odigo tooltip yet
		) {
			event.target.parentNode.setAttribute("data-qtip", event.target.textContent);
			css.insertRule(".x-tip { background-color: " + lightBgColour + "; }", 0);
		}
	});
} else {
	// EXPAND CELL TO SHOW CROPPED TEXT
	// breaks gate tree page and is super slow in supervision
	css.insertRule("tbody td:hover div[unselectable='on'] { white-space: unset; word-break: break-all; }", 0);
	css.insertRule("div:not([id^='tree']).x-panel-body-default { height: unset !important; }", 0);
}

// Double-click row to view (+Alt to edit) à la Mandora
document.body.addEventListener("dblclick", function(event) {
	if (event.target.matches("div[unselectable='on']")) {
		var row = event.target.closest("tr");
		if (event.ctrlKey || event.shiftKey) {
			// Use +Ctrl for background tab or +Shift for new tab
			openInTab(row, event.altKey ? "edit" : "view");
		} else {
			// Double-click row for current tab
			(
				row.querySelector("img.icon" + (event.altKey ? "Modify" : "View"))
				// agent group tree only has Modify, so fall back to any button
				|| row.querySelector("img.iconView, img.iconModify")
			).click();
		}
	}
});

// Pencil and eye icons open in background tab (ctrl or middle) or new tab (shift)
var openObjectURL = {
	agentGroup: {
		view: "agentGroupEdit?action=VIEW&idString=$key",
		edit: "agentGroupEdit?action=UPDATE&idString=$key"
	},
	agentGroupTree: {
		view: "agentGroupOrganizationEdit?id=$id&label=$key&isCreation=0",
		edit: "agentGroupOrganizationEdit?id=$id&label=$key&isCreation=0"
	},
	calendar: {
		view: "calendarEdit?action=VIEW&CalID=$key",
		edit: "calendarEdit?action=EDIT&CalID=$key"
	},
	callbackId: {
		view: "callbackIdEdit?action=VIEW&callerId=$id",
		edit: "callbackIdEdit?action=EDIT&callerId=$id",
		noKey: true // cannot find callerId in <tr>
	},
	case: {
		view: "caseEdit?action=VIEW&id=$id",
		edit: "caseEdit?action=EDIT&id=$id"
	},
	channel: {
		view: "channelEdit?action=VIEW&id=$id",
		edit: "channelEdit?action=EDIT&id=$id"
	},
	chatGroup: {
		view: "chatGroupEdit?action=VIEW&idString=$id",
		edit: "chatGroupEdit?action=UPDATE&idString=$id",
		noKey: true // cannot find idString in <tr>
	},
	codification: {
		view: "codificationEdit?action=VIEW&codificationId=$id",
		edit: "codificationEdit?action=EDIT&codificationId=$id",
		noKey: true // cannot find codificationId in <tr>
	},
	commonQueue: {
		view: "commonQueueEdit?action=VIEW&commonQueueId=$id",
		edit: "commonQueueEdit?action=UPDATE&commonQueueId=$id",
		noKey: true // cannot find commonQueueId in <tr> Odigo uses some private JavaScript that I didn't find how to call from userjs (store.data.getAt(0).commonQueueId linked to from tr.dataset.boundview + "-record-" + tr.dataset.recordid)
	},
	ddi: {
		view: "ddiEdit?action=VIEW&keyWord=$base64key",
		edit: "ddiEdit?action=EDIT&keyWord=$base64key"
	},
	gate: {
		view: "gateEdit?action=VIEW&keyWord=$key",
		edit: "gateEdit?action=EDIT&keyWord=$key",
		keyCellIndex: 2
	},
	gateSkillDispatch: {
		view: "gateSkillDispatchEdit?action=VIEW&dispatchId=$id",
		edit: "gateSkillDispatchEdit?action=EDIT&dispatchId=$id"
	},
	gateTree: {
		view: "gateTreeEdit?id=$id&label=$key&isCreation=0",
		edit: "gateTreeEdit?id=$id&label=$key&isCreation=0"
	},
	miniDirectory: {
		view: "miniDirectoryEdit?action=VIEW&annuaireId=$id",
		edit: "miniDirectoryEdit?action=EDIT&annuaireId=$id",
		noKey: true // cannot find annuaireId in <tr>
	},
	reasonForCall: {
		view: "reasonForCallListEdit?action=VIEW&rootId=$id",
		edit: "reasonForCallListEdit?action=EDIT&rootId=$id"
	},
	otherActivity: {
		view: "otherActivityEdit?activityId=$key",
		edit: "otherActivityEdit?activityId=$key"
	},
	skill: {
		view: "skillDisplay?action=VIEW&keyWord=$key",
		edit: "skillEdit?action=EDIT&keyWord=$key",
		keyCellIndex: 2
	},
	smsTemplate: {
		view: "smsTemplateEdit?action=VIEW&id=&id",
		edit: "smsTemplateEdit?action=EDIT&id=$id"
	},
	user: {
		view: "userEdit?action=VIEW&isTemplate=false&idUtilisateurAEditer=$key",
		edit: "userEdit?action=EDIT&isTemplate=false&userFromLdap=false&idUtilisateurAEditer=$key",
		keyCellIndex: 2
	},
	userTemplate: {
		view: "userEdit?action=VIEW&isTemplate=true&idUtilisateurAEditer=$key",
		edit: "userEdit?action=EDIT&isTemplate=true&idUtilisateurAEditer=$key",
		keyCellIndex: 3
	}
};
var listType = location.pathname.match(/\b(?!acd)(?!supervision)([^/]+)Search$/);
if (listType) {
	listType = listType[1];
	if (openObjectURL[listType].noKey) {
		warning("⚠️ Cannot open " + listType.replace(/([A-Z])/g, " $1").toLowerCase() + " in new or background tab!");
	} else {
		document.body.addEventListener("mousedown", backgroundTabIcons);
		document.body.addEventListener("mouseup", backgroundTabIcons);
		document.body.addEventListener("click", backgroundTabIcons, true);
		function backgroundTabIcons(event) {
			if (event.target.tagName == "IMG" && (event.target.classList.contains("iconModify") || event.target.classList.contains("iconView")) && event.detail === 1) {
				if (event.button === 1 || event.ctrlKey || event.shiftKey) {
					if (event.type == "mouseup") {
						openInTab(event.target.closest("tr"), event.target.classList.contains("iconView") ? "view" : "edit");
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
	}
} else if (location.pathname.match(/\bacdSearch$/)) {
	// home page, expand configuration menu
	var configuration_menu = document.querySelector("#header > #topbar div.rubriques > div.rub:nth-child(3) > button.dropdown-toggle");
	if (configuration_menu && configuration_menu.textContent.match(/^config/i)) {
		configuration_menu.click();
	}
}

// EDIT/VIEW PAGE TOGGLE
var shortPath = location.pathname.match(/[^/]+(?:Edit|Display)$/);
var shortQuery = location.search.match(/\baction=(?:EDIT|UPDATE|VIEW)\b/);
if (shortPath && shortQuery) {
	var toggle = null;
	var type = null;
	for (var searchType in openObjectURL) if (Object.prototype.hasOwnProperty.call(openObjectURL, searchType)) {
		if (openObjectURL[searchType].view.indexOf(shortPath) === 0 && openObjectURL[searchType].view.indexOf(shortQuery) > shortPath.length) {
			toggle = "edit";
			type = searchType;
			break;
		} else if (openObjectURL[searchType].edit.indexOf(shortPath) === 0 && openObjectURL[searchType].edit.indexOf(shortQuery) > shortPath.length) {
			toggle = "view";
			type = searchType;
			break;
		}
	}
	if (toggle !== null && type !== null && openObjectURL[type].edit != openObjectURL[type].view) {
		var toggleLink = document.createElement("img");
		toggleLink.setAttribute("class", toggle == "edit" ? "iconModify" : "iconView");
		toggleLink = document.createElement("a").appendChild(toggleLink).parentNode;
		toggleLink.setAttribute("href", (location.pathname + location.search).replace(shortPath, openObjectURL[type][toggle].match(/[^?]+/)).replace(shortQuery, openObjectURL[type][toggle].match(/action=(?:EDIT|UPDATE|VIEW)/)));
		toggleLink.setAttribute("title", "Click here to " + toggle + " this object");
		toggleLink.appendChild(document.createTextNode(" " + toggle));
		toggleLink.classList.add(GM_info.script.author);
		document.querySelector("div#body_page > h2").appendChild(toggleLink);
	}
}

if (listType && openObjectURL[listType] && !openObjectURL[listType].noKey || shortPath && shortQuery) {
	css.insertRule("img.iconModify, img.iconView, img.iconModify:hover, img.iconView:hover { height: 20px; width: 20px; background-size: contain; background-color: " + lightBgColour + "; box-shadow: 1px 1px 3px " + darkBgColour + "; }", 0);
}

function openInTab(row, action) {
	if (openObjectURL[listType] && !openObjectURL[listType].noKey) {
		var url = openObjectURL[listType][action];
		if (url.match(/\$id/)) {
			url = url.replace("$id", row.getAttribute("data-recordid"));
		}
		if (url.match(/\$(base64)?key/)) {
			var key = row.querySelector("td:nth-child(" + (openObjectURL[listType].keyCellIndex || 1) + ") > div[unselectable='on']").textContent;
			url = url.replace("$base64key", btoa(key));
			url = url.replace("$key", encodeURIComponent(key));
		}
		open(url);
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
