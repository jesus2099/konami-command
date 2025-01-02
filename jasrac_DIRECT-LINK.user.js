// ==UserScript==
// @name         JASRACへの直リンク
// @version      2025.1.2
// @description  J-WIDの作品データベース検索サービスへの自動接続で直リン（直接のリンク）が出来なる allow JASRAC direct links by auto-login
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/jasrac_DIRECT-LINK
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/jasrac_DIRECT-LINK.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-04-22; https://web.archive.org/web/20131104205642/userscripts.org/scripts/show/131591 / https://web.archive.org/web/20141011084006/userscripts-mirror.org/scripts/show/131591
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/www2\.jasrac\.or\.jp\/eJwid\//
// @run-at       document-end
// ==/UserScript==
"use strict";
var proceedButton;
var home_URL = "https://www2.jasrac.or.jp/eJwid/main?trxID=F00100";
var results_URL = "https://www2.jasrac.or.jp/eJwid/main?trxID=A00401-3";
/* mark visited links */
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
j2css.insertRule("a:visited { color: #800080; }", 0);
/* highlight current row */
var rows = document.querySelectorAll("table.contentsTable > tbody > tr");
if (rows.length > 0) {
	rows[0].parentNode.parentNode.addEventListener("mouseover", rowHighlight);
	rows[0].parentNode.parentNode.addEventListener("mouseout", rowHighlight);
}
/* use regular latin characters, etc. */
var cells = document.getElementsByTagName("td");
for (var c = 0; c < cells.length; c++) if (!cells[c].textContent.match(/\d[A-Z\d]\d-\d{4}-\d/)) {
	var text, textNode = cells[c];
	while (textNode && textNode.nodeType != Node.TEXT_NODE) {
		textNode = textNode.firstChild;
	}
	if (textNode) {
		text = formatText(textNode.textContent);
		if (text != textNode.textContent) {
			textNode.parentNode.replaceChild(document.createTextNode(text), textNode);
		}
	}
}
/* make connection, etc. */
if (self == top && document.body.textContent.match(/システムエラーが発生しました。（エラー番号021）/) && (proceedButton = document.querySelector("form > button[type='submit']")) && proceedButton.textContent.match(/J-WID トップページに進む/)) {
	removeChildren(document.body);
	var toto = document.body.appendChild(createTag("div", {}, {"background-color": "purple", border: ".5em solid black", color: "white", "font-size": "2em", "font-weight": "bold", margin: "1em", padding: "2em", "text-align": "center", "text-shadow": "1px 2px 2px black"}, {}, document.createTextNode("接続中")));
	document.title = toto.textContent;
	document.body.appendChild(createTag("iframe", {src: home_URL}, {border: "0", width: "0", height: "0"}, {load: function(event) {
		toto.appendChild(document.createTextNode("…"));
		document.title = toto.textContent;
		setTimeout(function() { self.location.reload(true); }, 1);
	}}));
} else if (self == top && self.location.pathname != "/eJwid/" && document.getElementsByTagName("frameset").length == 0) {
	/* try {
		if (!document.referer && self.opener && self.opener == self.opener.top && self.opener.location.host == self.location.host) {
			self.opener.close();
			if(self.opener) {
				var ajs = self.opener.document.querySelectorAll("table.contentsTable a[name='AUTO_JUMP']");
				if (ajs.length == 1) {
					self.opener.location.href = ajs[0].getAttribute("href");
					self.close();
					// self.opener.history.back(); // better?
				}
			}
		}
	} catch (error) {} */
	document.body.appendChild(createTag("a", {href: home_URL}, {"background-color": "#ff9", "font-weight": "bold", position: "fixed", top: "0", right: "49%", padding: "0 4px 4px 4px", border: "2px solid orange", "border-top": "none", "z-index": "666"}, {click: function(event) { hasHome(true); }, mouseover: function(event) { this.replaceChild(hasHome(), this.firstChild); }}, hasHome()));
	var works = document.querySelectorAll("table.contentsTable td > a[name='AUTO_JUMP'][target='_blank']");
	for (var a = 0; a < works.length; a++) {
		works[a].removeAttribute("target");
	}
} else if (self.location.pathname == "/eJwid/main") {
	var results = document.querySelector("select[name='IN_DEFAULT_WORKS_KOUHO_MAX']");
	if (results) { results.selectedIndex = results.options.length - 1; }
	var title = document.querySelector("input[type='text'][name='IN_WORKS_TITLE_NAME1']");
	if (title) { setTimeout(function() { title.focus(); }, 500); }
}
function hasHome(action) {
	var has = false;
	try {
		if (self.opener != null && self.opener.innerWidth > 0 && self.opener.top.location.href.indexOf(home_URL) + self.opener.top.location.href.indexOf(results_URL) > -2) {
			has = true;
		}
	} catch (error) {}
	if (action && has) {
		self.opener.top.focus();
		self.close();
	} else {
		return document.createTextNode(has ? "CLOSE" : "HOME");
	}
}
// Allow results page being referer of child work pages
document.addEventListener("mousedown", function(event) {
	if (event.target.matches("a[href^='main?trxID=F20101'][target='_blank']:not([rel='opener'])")) {
		event.target.setAttribute("rel", "opener");
	}
});
function rowHighlight(event) {
	var row;
	if (event.target.tagName == "TD") {
		row = event.target.parentNode;
	} else if (event.target.tagName == "A") {
		row = event.target.parentNode.parentNode;
	}
	if (row) {
		row.style.setProperty("background-color", event.type == "mouseover" ? "#ff9" : "inherit");
	}
}
function formatText(string) {
	return string.replace(/[＂＃＄％＇＊＋，－．０１２３４５６７８９＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ]/g, function(character) {
		return String.fromCharCode(character.charCodeAt(0) - 65248);
	}).replace(/\u3000/g, "\u0020").replace(/～/g, "〜").replace(/-/g, "‐").replace(/'/g, "’");
}
function removeChildren(p) {
	while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
}
function createTag(tag, attribs, styles, events, child) {
	var t = document.createElement(tag);
	for (var attr in attribs) { if (Object.prototype.hasOwnProperty.call(attribs, attr)) { t.setAttribute(attr, attribs[attr]); } }
	for (var styl in styles) { if (Object.prototype.hasOwnProperty.call(styles, styl)) { t.style.setProperty(styl, styles[styl]); } }
	for (var evt in events) { if (Object.prototype.hasOwnProperty.call(events, evt)) { t.addEventListener(evt, events[evt], false); } }
	if (child) { t.appendChild(child); }
	return t;
}
