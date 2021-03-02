// ==UserScript==
// @name         mb. PRINT ALL PAGES
// @version      2021.3.2
// @description  musicbrainz.org: (VERY BASIC AT THE MOMENT) Print your complete collections to make your shopping lists or check lists. It will work on more than just collections.
// @namespace    https://github.com/jesus2099/konami-command
// @compatible   opera(12.18.1872)+violentmonkey     my oldest setup
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PRINT-ALL-PAGES
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PRINT-ALL-PAGES.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-03-02; https://community.metabrainz.org/t/script-for-printing-collections/521437
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/fb2225a2146d1586b7f113ad13df476adf314ac7/lib/SUPER.js?v=2021.2.4
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/collection\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\?page=1)?$/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-"),
};
var lastPage;

// locate the pagination toolbar or create it if none
var form = document.querySelector("div#content h2 + form[method='post']");
if (form) {
	var pagination = form.querySelector("nav ul.pagination");
	if (!pagination) {
		lastPage = 1;
		pagination = form.insertBefore(document.createElement("nav"), form.firstChild).appendChild(createTag("ul", {a: {class: "pagination"}}));
		pagination.appendChild(document.createElement("li"));
	}
	// put the little button instead of the first page disabled Previous button
	replaceChildren(createTag("li", {}, createTag(
		"a",
		{
			a: {title: GM_info.script.name + " version " + GM_info.script.version},
		 	s: {background: "#FF6"},
			e: {click: preparePage}
		},
		"Load all pages for print"
	)), pagination.firstChild);
}

function preparePage(event) {
	var css = {
		all: document.createElement("style"),
		print: document.createElement("style")
	};
	css.all.setAttribute("type", "text/css");
	css.print.setAttribute("type", "text/css");
	css.print.setAttribute("media", "print");
	document.head.appendChild(css.all);
	document.head.appendChild(css.print);
	css.all = css.all.sheet;
	css.print = css.print.sheet;
	// hide stuff from print
	// ---------------------
	css.print.insertRule("body > div:not(#page) { display: none; }", 0); // hide all except #page (#content, #sidebar)
	css.print.insertRule("div#sidebar { display: none; }", 0); // hide #sidebar from #page
	css.print.insertRule("div#content h2 + form[method='post'] > *:not(table) { display: none; }", 0); // keep only the table from #content
	css.print.insertRule("." + userjs.id + "toolbar { display: none; }", 0); // don't print this script toolbar
	// hide stuff from both screen and print
	// -------------------------------------
	css.all.insertRule("div#content > form > nav > ul { display: none; }", 0);
	// hide mb_FUNKEY-ILLUSTRATED-RECORDS bigpics
	var bigpics = document.querySelector("div.jesus2099userjs154481bigbox");
	if (bigpics) {
		// remove bigpics to skip further image loadings
		removeNode(bigpics);
	}
	// disable collection highlighter
	var collectionHighlights = document.querySelectorAll("[class*='collectionHighlighter']");
	for (var i = 0; i < collectionHighlights.length; i++) {
		collectionHighlights[i].className = collectionHighlights[i].className.replace(/\bcollectionHighlighter(Box|Item|Row)\b/g);
	}
	if (lastPage !== 1) {
		appendPage(2);
	}
}
function appendPage(page) {
	var loading = document.getElementById(userjs.id + "loading");
	if (!loading) {
		loading = createTag("div", {a: {id: userjs.id + "loading"}, s: {textAlign: "center"}}, [
			createTag("img", {a: {alt: "loading", src: "/static/images/icons/loading.gif"}}),
			" ",
			document.createElement("span")
		]);
		addAfter(loading, document.querySelector("div#content > h2"));
	}
	replaceChildren(document.createTextNode("Loading page " + page + "…"), loading.lastChild);
	// WORK IN PROGRESS
	if (page < 5) {
		setTimeout(function() { appendPage(page + 1)}, 1100);
	} else {
		setTimeout(function() {replaceChildren(document.createTextNode("Thanks for testing, I have yet to copy my page loader from mb_COLLECTION-HIGHLIGHTER. Stay tuned."), document.getElementById(userjs.id + "loading") ) ; }, 1000);
	}
}
