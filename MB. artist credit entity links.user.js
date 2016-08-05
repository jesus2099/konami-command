// ==UserScript==
// @name         MB. artist credit entity links
// @version      2016.6.15
// @changelog    https://github.com/jesus2099/konami-command/commits/master/MB.%20artist%20credit%20entity%20links.user.js
// @description  Adds links to filtered and searched release groups, releases and recordings  for each artist credit in artist aliases page’s artist credits section. Additionally spots duplicate aliases.
// @homepage     http://userscripts-mirror.org/scripts/show/131649
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ARTIST-CREDIT-ENTITY-LINKS
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    http://userscripts.org/scripts/show/131649
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/MB.%20artist%20credit%20entity%20links.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/MB.%20artist%20credit%20entity%20links.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-04-23
// @grant        none
// @match        *://*.mbsandbox.org/artist/*/aliases
// @match        *://*.musicbrainz.org/artist/*/aliases
// @run-at       document-end
// ==/UserScript==
"use strict";
var entities = {
	"filtered release groups": {url: "/artist/%aid%?filter.artist_credit_id=%acid%", img: "/static/images/entity/release_group.svg"},
	"release group search": {url: "/search?query=arid%3A%aid%+AND+artist%3A%22%acname%%22&type=release_group&limit=100&method=advanced", img: "/static/images/icons/search.png"},
	"filtered releases": {url: "/artist/%aid%/releases?filter.artist_credit_id=%acid%", img: "/static/images/entity/release.png"},
	"release search": {url: "/search?query=arid%3A%aid%+AND+artist%3A%22%acname%%22&type=release&limit=100&method=advanced", img: "/static/images/icons/search.png"},
	"filtered recordings": {url: "/artist/%aid%/recordings?filter.artist_credit_id=%acid%", img: "/static/images/entity/recording.png"},
	"recording search (tracks)": {url: "/search?query=arid%3A%aid%+AND+artist%3A%22%acname%%22&type=recording&limit=100&method=advanced", img: "/static/images/icons/search.png"},
};
var name = document.querySelector("body > div#page > div#content > div.artistheader > h1 a").textContent;
var tables = document.querySelectorAll("body > div#page > div#content > table.tbl");
for (var tab = 0; tab < tables.length; tab++) {
	var h2 = previousSibling(tables[tab], "h2")
	var type = h2.textContent.match(/artist credits/i) ? "ac" : "al";
	if (type == "ac") {
		tables[tab].querySelector("tr").insertBefore(createTag("th", {}, {}, {}, "Associated entities"), tables[tab].querySelector("tr > th:nth-last-of-type(1)"));
	}
	for (var trs = tables[tab].querySelectorAll("tr"), i = 1; i < trs.length; i++) {
		var aname = trs[i].querySelector("td").textContent.match(/^\s*(.+)\s*$/)[1];
		if (type == "ac") {
			var entd = trs[i].insertBefore(createTag("td"), trs[i].querySelector("td:nth-last-of-type(1)"));
			for (var ent in entities) if (entities.hasOwnProperty(ent)) {
				if (ent.match(/filtered/)) {
					entd.appendChild(createTag("img", {alt: "icon", src: entities[ent].img}, {maxHeight: "16px"}));
					entd.appendChild(document.createTextNode(" "));
				} else {
					entd.appendChild(document.createTextNode(" | "));
				}
				entd.appendChild(createTag("a", {title: ent, href: entities[ent].url.replace(/%acname%/, encodeURIComponent(aname)).replace(/%aid%/, location.href.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)).replace(/%acid%/, trs[i].querySelector("td:nth-last-of-type(1) > a").getAttribute("href").match(/credit\/([0-9]+)\/edit$/)[1])}, {}, {}, ent));
				if (ent.match(/search/)) {
					entd.appendChild(document.createElement("br"));
				}
			}
		}
		if (aname == name) {
			trs[i].querySelector("td").appendChild(createTag("span", {}, {}, {}, " (main)"));
			trs[i].className = trs[i].className.replace(/ev/, "");
			trs[i].style.setProperty("background-color", "#cfc", "important");
			if (type == "al") {
				for (var a = 0, as = trs[i].querySelectorAll("a"); a < as.length; a++) {
					as[a].setAttribute("href", as[a].getAttribute("href").replace(/(\/artist\/.+\/alias\/[0-9]+\/delete$)/, "$1?confirm.edit_note=" + encodeURIComponent("alias = artist name")));
				}
			}
		}
	}
}
function previousSibling(obj, tag, className) { return nextSibling(obj, tag, className, true); }
function nextSibling(obj, tag, className, prev) {
	var cur = obj;
	if (cur = prev?cur.previousSibling:cur.nextSibling) {
		if (cur.tagName == tag.toUpperCase() && (className == null || className && cur.classList.contains(className))) {
			return cur;
		} else {
			return nextSibling(cur, tag, className, prev);
		}
	} else {
		return null;
	}
}
function createTag(tag, attribs, styles, events, child) {
	var t = document.createElement(tag);
	for (var attr in attribs) { if (attribs.hasOwnProperty(attr)) { t.setAttribute(attr, attribs[attr]); } }
	for (var styl in styles) { if (styles.hasOwnProperty(styl)) { t.style[styl] = styles[styl]; } }
	for (var evt in events) { if (events.hasOwnProperty(evt)) { t.addEventListener(evt, events[evt], false); } }
	if (child) { t.appendChild(typeof child=="string"?document.createTextNode(child):child); }
	return t;
}
