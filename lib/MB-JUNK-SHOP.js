// ==UserScript==
// @name         MB JUNK SHOP
// @version      2024.10.13
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

MBJS.lang = document.querySelector("html[lang]");
MBJS.lang = MBJS.lang && MBJS.lang.getAttribute("lang") || "en";

MBJS.texts = {
	invalid_edit_note: {
		de: "Deine Bearbeitungsbemerkung scheint keinen tatsächlichen Inhalt zu haben. Bitte gib einen Bemerkung ab, die den anderen Bearbeitern helfen wird!",
		en: "Your edit note seems to have no actual content. Please provide a note that will be helpful to your fellow editors!",
		fr: "Votre note de modification semble n’avoir aucun contenu. Veuillez ajouter une note qui soit utile à vos pairs éditeurs !",
		it: "La tua nota di modifica sembra non avere nessun contenuto reale. Sei pregato di fornire una nota che sia di aiuto agli altri editor!",
		nl: "Je bewerkingsnotitie lijkt geen echte inhoud te hebben. Voeg een notitie toe waar je collegaredacteurs wat aan hebben!",
	},
};

MBJS.displayBanner = function(CONTENT, ADDITIONAL_CLASS, NO_DISMISS, ON_CLOSE_CALLBACK) {
	if (!MBJS.displayBanner_init) {
		MBJS.displayBanner_init = true;
	}
	var banner = document.createElement("div");
	banner.classList.add(MBJS.id, "banner");
	if (ADDITIONAL_CLASS) {
		banner.classList.add(ADDITIONAL_CLASS);
	}
	banner.style.setProperty("background-color", "#fef");
	if (typeof CONTENT == "string") {
		banner.appendChild(document.createElement("p").appendChild(document.createTextNode(CONTENT)));
	} else {
		banner.appendChild(CONTENT);
	}
	if (!NO_DISMISS) {
		var close_button = document.createElement("button");
		close_button.classList.add("icon", "remove-item", "dismiss-banner");
		close_button.addEventListener("click", function(event) {
			event.target.parentNode.parentNode.removeChild(event.target.parentNode);
		});
		if (ON_CLOSE_CALLBACK) {
			close_button.addEventListener("click", ON_CLOSE_CALLBACK);
		}
		banner.appendChild(close_button);
	}
	document.body.insertBefore(banner, document.body.querySelector("body > div#page"));
	return banner;
};

MBJS.collapseList = function (LIST, _TYPE, _TO_SHOW_BEFORE, _TO_SHOW_AFTER) {
	if (!MBJS.collapseList_init) {
		MBJS.css.insertRule("." + MBJS.id + "-collapse > ." + MBJS.id + "-collapsible { display: none; }", 0);
		MBJS.css.insertRule("." + MBJS.id + "-collapse > ." + MBJS.id + "-show-less { display: none; }", 0);
		MBJS.css.insertRule("." + MBJS.id + "-collapsible:not(." + MBJS.id + "-collapse) > ." + MBJS.id + "-show-all { display: none; }", 0);
		MBJS.collapseList_init = true;
	}
	// same MBS defaults as https://github.com/metabrainz/musicbrainz-server/blob/f2d7d9e635353f87f69cf3dc7f2cd0c3e58f4b0e/root/static/scripts/common/components/CollapsibleList.js
	var to_show_before = _TO_SHOW_BEFORE ? _TO_SHOW_BEFORE : 2;
	var to_show_after = _TO_SHOW_AFTER ? _TO_SHOW_AFTER : 1;
	var to_trigger_collapse = to_show_before + to_show_after + 2;
	var type = _TYPE ? _TYPE : LIST.querySelector("a").getAttribute("href").match(/^\/([^/]+)\/.+/)[1].replace(/[-_]/g, " ");
	type = type.replace(/[^s]$/, "$&s");
	if (LIST.children.length >= to_trigger_collapse) {
		LIST.classList.add(MBJS.id + "-collapsible", MBJS.id + "-collapse");
		LIST.addEventListener("click", function(event) {
			if (event.target.closest("." + MBJS.id + "-show-all, ." + MBJS.id + "-show-less")) {
				event.target.closest("." + MBJS.id + "-collapsible").classList.toggle(MBJS.id + "-collapse");
			}
		});
		for (var i = to_show_before; i < LIST.children.length - to_show_after; i++) {
			LIST.children[i].classList.add(MBJS.id + "-collapsible");
		}
		var collapse_link = createTag("a", {a: {title: "Show less " + type}}, "Show less");
		var expand_link = createTag("a", {a: {title: "Show all " + type}}, ["Show ", LIST.children.length - to_show_before - to_show_after, " more"]);
		switch (LIST.tagName) {
			case "TABLE":
				collapse_link = createTag("tr", {a: {class: MBJS.id + "-show-less"}}, createTag("td", {a: {colspan: LIST.firstChild.children.length}}, ["(", collapse_link, ")"]));
				expand_link = createTag("tr", {a: {class: MBJS.id + "-show-all"}}, createTag("td", {a: {colspan: LIST.firstChild.children.length}}, ["(", expand_link, ")"]));
				break;
			case "OL":
			case "UL":
				collapse_link = createTag("li", {a: {class: MBJS.id + "-show-less"}}, ["(", collapse_link, ")"]);
				expand_link = createTag("li", {a: {class: MBJS.id + "-show-all"}}, ["(", expand_link, ")"]);
				break;
		}
		LIST.insertBefore(expand_link, LIST.children[LIST.children.length - to_show_after]);
		LIST.appendChild(collapse_link);
	}
};

MBJS.isValidEditNote = function(EDIT_NOTE) {
	// Perl: https://github.com/metabrainz/musicbrainz-server/blob/769a6e36d30f7529ed836f83b3ce7e5615700a96/lib/MusicBrainz/Server/Validation.pm#L303-L316
	// JavaScript: https://github.com/metabrainz/musicbrainz-server/blob/769a6e36d30f7529ed836f83b3ce7e5615700a96/root/static/scripts/release-editor/init.js#L285-L291
	// MBS forbids ".." and "a" but not ".a.": I combine both rules to forbid ".a." as well
	// MBS JavaScript forgets to trim() to mimic MBS Perl behaviour: I add trim() to forbid " a " as well in JavaScript
	return !EDIT_NOTE.trim().match(/^[\p{White_Space}\p{Punctuation}]*\p{ASCII}{0,1}[\p{White_Space}\p{Punctuation}]*$/u);
};

// Blocked by https://tickets.musicbrainz.org/browse/MBS-12154
// MBJS.loadStuff = function(URL, PAGE_CALLBACK, CONCLUSION_CALLBACK, _OFFSET) {
//  var offset = _OFFSET || 0; // eslint bug that they don't want to fix: https://github.com/eslint/eslint #11562 #11563 #12438 #12999 #16224
// }

MBJS.getText = function(TEXT_ID) {
	if (MBJS.texts[TEXT_ID][MBJS.lang]) {
		return MBJS.texts[TEXT_ID][MBJS.lang];
	} else {
		return MBJS.texts[TEXT_ID].en;
	}
};
