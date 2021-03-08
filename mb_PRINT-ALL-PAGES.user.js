// ==UserScript==
// @name         mb. PRINT ALL PAGES
// @version      2021.3.2
// @description  musicbrainz.org: (VERY BASIC AT THE MOMENT) Print your complete collections to make your shopping lists or check lists. It will work on more than just collections.
// @namespace    https://github.com/jesus2099/konami-command
// @compatible   firefox(86.0)+violentmonkey(2.12.7)
// @compatible   vivaldi(3.6.2165.40)+violentmonkey(2.12.9)
// @compatible   chromium(88.0.4324.186)+violentmonkey(2.12.9) Vivaldi’s engine
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
const userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-"),
}
// TODO: find last page as soon as it is known
let lastPage;

var collectionBaseURL = self.location.protocol + "//" + self.location.host + self.location.pathname.match(/\/collection\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);

// locate the pagination toolbar or create it if none
let form = document.querySelector("div#content h2 + form[method='post']");
if (form) {
	let pagination = form.querySelector("nav ul.pagination");
	if (!pagination) {
		lastPage = 1;
		pagination = form.insertBefore(document.createElement("nav"), form.firstChild).appendChild(createTag("ul", {a: {class: "pagination"}}));
		pagination.appendChild(document.createElement("li"));
	}
	// put the little button instead of the first page disabled Previous button
	pagination.firstChild.replaceChildren(createTag("li", {}, createTag(
		"a",
		{
			a: {title: GM_info.script.name + " version " + GM_info.script.version},
			s: {background: "#FF6"},
			e: {click: preparePage}
		},
		"Load all pages for print"
	)));
}

function preparePage(event) {
	let css = {
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
	css.print.insertRule("div#content > :not(form):not(.collectionheader) { display: none; }", 0); // hide tabs and sub headers from #content
	css.print.insertRule("div#content h2 ~ form[method='post'] > :not(table) { display: none; }", 0); // hide merge button from form
	css.print.insertRule("." + userjs.id + "toolbar { display: none; }", 0); // hide this script toolbar
	// hide columns from print:
	// TODO: Add checkboxes in <thead> to let user say what columns to hide from print
	// hide checkboxes
	css.all.insertRule("thead th:nth-child(1), tbody td:nth-child(1) { display: none; }");
	// hide ratings
	css.all.insertRule("thead th:nth-child(10), tbody td:nth-child(10) { display: none; }");
	// hide label comments (including mod pending, thus the :nth-child)
	css.all.insertRule("tbody td:nth-child(7) span.comment { display: none; }");
	// hide stuff from both screen and print
	// -------------------------------------
	// hide caa icons (only )
	css.all.insertRule("a[href$='/cover-art'] { display: none; }", 0);
	// hide irrelevant pagination buttons
	css.all.insertRule("div#content > form > nav > ul { display: none; }");
	// hide mb_FUNKEY-ILLUSTRATED-RECORDS bigpics
	let bigpics = document.querySelector("div.jesus2099userjs154481bigbox");
	if (bigpics) {
		// remove bigpics to skip further image loadings
		removeNode(bigpics);
	}
	// disable collection highlighter
	let collectionHighlights = document.querySelectorAll("[class*='collectionHighlighter']");
	for (let i = 0; i < collectionHighlights.length; i++) {
		collectionHighlights[i].className = collectionHighlights[i].className.replace(/\bcollectionHighlighter(Box|Item|Row)\b/g);
	}
	if (lastPage !== 1) {
		appendPage(2, lastPage);
	}
}
function appendPage(page, last) {
	let loading = document.getElementById(userjs.id + "loading");
	if (!loading) {
		loading = createTag("div", {a: {id: userjs.id + "loading"}, s: {textAlign: "center"}}, [
			createTag("img", {a: {alt: "loading", src: "/static/images/icons/loading.gif"}}),
			" ",
			document.createElement("span")
		]);
		document.querySelector("div#content > h2").after(loading);
	}
	loading.lastChild.replaceChildren(document.createTextNode("Loading page " + page + (last ? "/" + last : "") + "…"));
	// WORK IN PROGRESS // adapted from mb_COLLECTION-HIGHLIGHTER
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
			// TODO: find last page as soon as it is known
			var lastPage = last;
			if (
				nextPage
				&& (nextPage = parseInt(nextPage.getAttribute("href").match(/\d+$/)[0], 10))
				&& nextPage > page
			) {
				appendPage(nextPage, last);
			} else {
				// last page loaded
				removeNode(loading);
			}
		} else {
			alert("Error " + this.status + "(" + this.statusText + ") while loading page " + page + ".");
		}
	});
	xhr.open("GET", collectionBaseURL + "?page=" + page, true);
	xhr.send(null);
}
