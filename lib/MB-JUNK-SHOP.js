// ==UserScript==
// @name         MB JUNK SHOP
// @version      2022.8.7
// @description  MB stuff bits — FOR MY OWN USE — Frequent API changes. Let me know if you need a stable API. Use https://github.com/jesus2099/konami-command/raw/(specific-commit)/lib/SUPER.js to prevent updates.
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-08-06; https://github.com/jesus2099/konami-command/commit/52d5fac8ea1c9eba550e340ad6c87f7b242e8caf / https://github.com/jesus2099/konami-command/commit/afec6da99f590f80ce8b0489f1c9ef789b55d656
// @grant        none
// ==/UserScript==
"use strict";

var MBJS = {id: "MBJunkShop"};

MBJS.css = document.createElement("style");
MBJS.css.setAttribute("type", "text/css");
document.head.appendChild(MBJS.css);
MBJS.css = MBJS.css.sheet;

function MB_collapsible_list(list, type, toShowBefore, toShowAfter) {
	if (!MBJS.collapsible_list_init) {
		MBJS.css.insertRule("." + MBJS.id + "-collapse > ." + MBJS.id + "-collapsible { display: none; }", 0);
		MBJS.css.insertRule("." + MBJS.id + "-collapse > ." + MBJS.id + "-show-less { display: none; }", 0);
		MBJS.css.insertRule("." + MBJS.id + "-collapsible:not(." + MBJS.id + "-collapse) > ." + MBJS.id + "-show-all { display: none; }", 0);
		MBJS.collapsible_list_init = true;
	}
	// same MBS defaults as https://github.com/metabrainz/musicbrainz-server/blob/f2d7d9e635353f87f69cf3dc7f2cd0c3e58f4b0e/root/static/scripts/common/components/CollapsibleList.js
	var TO_SHOW_BEFORE = toShowBefore ? toShowBefore : 2;
	var TO_SHOW_AFTER = toShowAfter ? toShowAfter : 1;
	var TO_TRIGGER_COLLAPSE = TO_SHOW_BEFORE + TO_SHOW_AFTER + 2;
	var TYPE = type ? type : list.querySelector("a").getAttribute("href").match(/^\/([^/]+)\/.+/)[1].replace(/[-_]/g, " ");
	TYPE = TYPE.replace(/[^s]$/, "$&s");
	if (list.children.length >= TO_TRIGGER_COLLAPSE) {
		list.classList.add(MBJS.id + "-collapsible", MBJS.id + "-collapse");
		list.addEventListener("click", function(event) {
			if (event.target.closest("." + MBJS.id + "-show-all, ." + MBJS.id + "-show-less")) {
				event.target.closest("." + MBJS.id + "-collapsible").classList.toggle(MBJS.id + "-collapse");
			}
		});
		for (var i = TO_SHOW_BEFORE; i < list.children.length - TO_SHOW_AFTER; i++) {
			list.children[i].classList.add(MBJS.id + "-collapsible");
		}
		var collapse_link = createTag("a", {a: {title: "Show less " + TYPE}}, "Show less");
		var expand_link = createTag("a", {a: {title: "Show all " + TYPE}}, ["Show ", list.children.length - TO_SHOW_BEFORE - TO_SHOW_AFTER, " more"]);
		switch (list.tagName) {
			case "TABLE":
				collapse_link = createTag("tr", {a: {class: MBJS.id + "-show-less"}}, createTag("td", {a: {colspan: list.firstChild.children.length}}, ["(", collapse_link, ")"]));
				expand_link = createTag("tr", {a: {class: MBJS.id + "-show-all"}}, createTag("td", {a: {colspan: list.firstChild.children.length}}, ["(", expand_link, ")"]));
				break;
			case "OL":
			case "UL":
				collapse_link = createTag("li", {a: {class: MBJS.id + "-show-less"}}, ["(", collapse_link, ")"]);
				expand_link = createTag("li", {a: {class: MBJS.id + "-show-all"}}, ["(", expand_link, ")"]);
				break;
		}
		list.insertBefore(expand_link, list.children[list.children.length - TO_SHOW_AFTER]);
		list.appendChild(collapse_link);
	}
}
// Blocked by https://tickets.musicbrainz.org/browse/MBS-12154
// function MB_load_stuff(url, page_callback, conclusion_callback, _offset) {
// 	var offset = _offset || 0;
// }
