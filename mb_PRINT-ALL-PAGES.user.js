// ==UserScript==
// @name         mb. PRINT ALL PAGES
// @version      2021.3.20
// @description  musicbrainz.org: Print your complete collections to make your shopping lists or check lists. Maybe it will work on more than just collections, in the future.
// @namespace    https://github.com/jesus2099/konami-command
// @compatible   firefox(86.0)+violentmonkey(2.12.7)
// @compatible   vivaldi(3.6.2165.40)+violentmonkey(2.12.9)
// @compatible   chromium(88.0.4324.186)+violentmonkey(2.12.9) Vivaldi’s engine
// @compatible   opera(12.18.1872)+violentmonkey               my oldest setup
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PRINT-ALL-PAGES
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PRINT-ALL-PAGES.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-03-02; https://community.metabrainz.org/t/script-for-printing-collections/521437
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/fb2225a2146d1586b7f113ad13df476adf314ac7/lib/SUPER.js?v=2021.2.4
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/collection\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\?order=.*)?$/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-"),
};
var form = document.querySelector("div#content h2 + form[method='post']");
if (form) {
	var lastPage;
	// locate the pagination toolbar or create it if none
	var pagination = form.querySelector("nav ul.pagination");
	if (!pagination) {
		lastPage = 1;
		pagination = form.insertBefore(document.createElement("nav"), form.firstChild).appendChild(createTag("ul", {a: {class: "pagination"}}));
		pagination.appendChild(document.createElement("li"));
	} else {
		lastPage = pagination.querySelector("ul.pagination > li:nth-last-child(3) > a");
		if (lastPage) {
			lastPage = parseInt(lastPage.getAttribute("href").match(/\d+$/)[0], 10);
		}
	}
	// put the little button instead of the first page disabled Previous button
	replaceChildren(createTag("li", {}, createTag(
		"a",
		{
			a: {title: GM_info.script.name + " version " + GM_info.script.version},
			s: {background: "#FF6"},
			e: {click: preparePage}
		}, [
			createTag("img", {a: {alt: "loading", src: GM_info.script.icon}, s: {verticalAlign: "text-bottom"}}),
			" Load all pages for print"
		]
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
	css.print.insertRule("div#page, div#content { padding: 0; }", 0); // full width
	css.print.insertRule("body > div:not(#page) { display: none; }", 0); // hide all except #page (#content, #sidebar)
	css.print.insertRule("div#sidebar { display: none; }", 0); // hide #sidebar from #page
	css.print.insertRule("div#content > :not(.description):not(form):not(.collectionheader) { display: none; }", 0); // hide tabs and sub headers from #content
	css.print.insertRule(".subheader > .small { display: none; }", 0); // hide "See all your collections" link
	css.print.insertRule("div#content h2 ~ form[method='post'] > :not(table) { display: none; }", 0); // hide merge button from form
	css.print.insertRule("th > a > span { display: none !important; }", 0); // hide inactive sort icons inside table column headers
	css.print.insertRule("." + userjs.id + "toolbar { display: none; }", 0); // hide this script toolbar
	css.print.insertRule("td > span.mp { background-color: initial !important; }", 0); // disable highlighting for pending edits
	css.print.insertRule("a, a:visited { color: initial; }", 0); // display entity links without the usual blue highlighting
	// hide stuff from both screen and print
	// -------------------------------------
	// hide columns from print:
	// TODO: Add checkboxes in <thead> to let user say what columns to hide from print
	// hide checkboxes
	var checkboxColumnIndex = form.querySelector("table.tbl > thead > tr > th.checkbox-cell");
	if (checkboxColumnIndex) {
		checkboxColumnIndex = checkboxColumnIndex.cellIndex + 1;
		console.debug(checkboxColumnIndex);
		css.all.insertRule("thead th:nth-child(" + checkboxColumnIndex + "), tbody td:nth-child(" + checkboxColumnIndex + ") { display: none; }", 0);
	}
	// hide ratings
	var ratingColumnIndex = form.querySelector("table.tbl > thead > tr > th.rating");
	if (ratingColumnIndex) {
		ratingColumnIndex = ratingColumnIndex.cellIndex + 1;
		css.all.insertRule("thead th:nth-child(" + ratingColumnIndex + "), tbody td:nth-child(" + ratingColumnIndex + ") { display: none; }", 0);
	}
	// hide label comments (including mod pending, thus the :nth-child)
	var labelColumnIndex = form.querySelector("table.tbl > thead > tr > th a[href*='order='][href$='label']");
	if (labelColumnIndex) {
		labelColumnIndex = getParent(labelColumnIndex, "th").cellIndex + 1;
		css.all.insertRule("tbody td:nth-child(" + labelColumnIndex + ") span.comment { display: none; }", 0);
	}
	// hide caa icons (only)
	css.all.insertRule("a[href$='/cover-art'] { display: none; }", 0);
	// hide irrelevant pagination buttons
	css.all.insertRule("div#content > form > nav > ul { display: none; }", 0);
	// hide SPOT_AC
	css.all.insertRule(".name-variation { background: unset; border: unset; }", 0);
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
		appendPage(2, lastPage);
	} else {
		finalTouch();
	}
}
function appendPage(page, last) {
	var loading = document.getElementById(userjs.id + "loading");
	if (!loading) {
		loading = createTag("div", {a: {id: userjs.id + "loading"}, s: {textAlign: "center"}}, [
			createTag("img", {a: {alt: "loading", src: "/static/images/icons/loading.gif"}, s: {verticalAlign: "text-bottom"}}),
			" ",
			document.createElement("span")
		]);
		addAfter(loading, document.querySelector("div#content > h2"));
	}
	replaceChildren(document.createTextNode("Loading page " + page + "/" + last + "…"), loading.lastChild);

	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function() {
		if (this.status === 200) {
			var responseDOM = document.createElement("html");
			responseDOM.innerHTML = this.responseText;
			// append each page releases to expanding release table of page 1
			var releaseTable = document.querySelector("div#content table.tbl > tbody");
			var pageReleaseRows = responseDOM.querySelectorAll("div#content table.tbl > tbody > tr");
			for (var r = 0; r < pageReleaseRows.length; r++) {
				releaseTable.appendChild(pageReleaseRows[r].cloneNode(true));
			}
			// determine next page and last page
			var nextPage = responseDOM.querySelector("ul.pagination > li:last-of-type > a");
			if (
				nextPage
				&& (nextPage = parseInt(nextPage.getAttribute("href").match(/\d+$/)[0], 10))
				&& nextPage > page
				&& nextPage <= last
			) {
				appendPage(nextPage, last);
			} else {
				// last page loaded
				removeNode(loading);
				finalTouch();
			}
		} else {
			alert("Error " + this.status + "(" + this.statusText + ") while loading page " + page + ".");
		}
	});
	xhr.open("GET", self.location.href + (self.location.href.indexOf("?") > 1 ? "&" : "?") + "page=" + page, true);
	xhr.send(null);
}
function finalTouch() {
	// reveal main artist name
	var nameVariations = form.querySelectorAll("table.tbl > tbody > tr > td span.name-variation a");
	for (var n = 0; n < nameVariations.length; n++) {
		addAfter(createTag("span", {a: {class: "comment"}}, [" (", nameVariations[n].getAttribute("title").match(/(.+) – /)[1], ")"]), nameVariations[n]);
	}
}
