// ==UserScript==
// @name         odigo routing. TURBO BOOST
// @version      2022.3.21
// @description  ALL LISTS: Click to select text
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

// Double-click to select text
css.insertRule("tbody div[unselectable='on'] { cursor: pointer; }", 0);
document.body.addEventListener("click", function(event) {
	if (event.target.tagName == "DIV" && event.target.getAttribute("unselectable") == "on") {
		self.getSelection().selectAllChildren(event.target);
	}
});
