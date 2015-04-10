// ==UserScript==
// @name         JASRACへの直リンク
// @version      2014.4.23.1807
// @description  J-WIDの作品データベース検索サービスへの自動接続で直リン（直接のリンク）が出来なる allow JASRAC direct links by auto-login
// @homepage     http://userscripts-mirror.org/scripts/show/131591
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/jasrac_DIRECT-LINK.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/jasrac_DIRECT-LINK.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-04-22
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://www2.jasrac.or.jp/eJwid/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var as, home = "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=F00100";
	if (self == top && document.body.textContent.match(/接続が切断されました。再度、了承画面からお願い致します。|システムエラーです。(.+)/) && (as = document.querySelectorAll("body > a")).length == 1 && as[0].textContent.match(/作品データベース検索サービスへ/) && as[0].getAttribute("target").match(/_top/i)) {
		removeChildren(document.body);
		var toto = document.body.appendChild(createTag("div", {}, {"background-color":"purple", "border":".5em solid black", "color":"white", "font-size":"2em", "font-weight":"bold", "margin":"1em", "padding":"2em", "text-align":"center", "text-shadow":"1px 2px 2px black"}, {}, document.createTextNode("接続中")));
		document.title = toto.textContent;
		document.body.appendChild(createTag("iframe", {"src":home}, {"border":"0", "width":"0", "height":"0"}, {"load":function(e){
			toto.appendChild(document.createTextNode("…"));
			document.title = toto.textContent;
			setTimeout(function(){self.location.reload(true);}, 1);
		}}));
	} else if (self == top && self.location.pathname != "/eJwid/" && document.getElementsByTagName("frameset").length == 0) {
		try { if (!document.referer && self.opener && self.opener == self.opener.top && self.opener.location.host == self.location.host) {
			self.opener.close();
			if(self.opener) {
				var ajs = self.opener.document.querySelectorAll("table.contentsTable a[name='AUTO_JUMP']");
				if (ajs.length == 1) {
					self.opener.location.href = ajs[0].getAttribute("href");
					self.close();
				}
			}
		} } catch(e) {}
		document.body.appendChild(createTag("a", {"href":home}, {"background-color":"#ff6", "font-weight":"bold", "position":"fixed", "top":"0", "right":"49%", "padding":"0 4px 4px 4px", "border":"2px solid orange", "border-top":"none"}, {"click":function(e){hashome(true);}, "mouseover":function(e){this.replaceChild(hashome(), this.firstChild);}}, hashome()));
		var works = document.querySelectorAll("table.contentsTable td > a[name='AUTO_JUMP'][target='_blank']");
		for (var a=0; a < works.length; a++) {
			works[a].removeAttribute("target");
		}
	} else if (location.pathname == "/eJwid/main.jsp") {
		document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
		var j2css = document.styleSheets[document.styleSheets.length-1];
		j2css.insertRule("a:visited { color: #800080; }", j2css.cssRules.length);
		var results = document.querySelector("select[name='IN_DEFAULT_WORKS_KOUHO_MAX']");
		if (results) { results.selectedIndex = results.options.length-1; }
	}

	function hashome(action) {
		var has = false;
		try {
			if (self.opener != null && self.opener.innerWidth > 0 && self.opener.top.location.href == home) {
				has = true;
			}
		} catch(e) {}
		if (action && has) {
			self.opener.top.focus();
			self.close();
		} else {
			return document.createTextNode(has?"CLOSE":"HOME");
		}
	}
	function removeChildren(p) {
		while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
	}
	function createTag(tag, attribs, styles, events, child) {
		var t = document.createElement(tag);
		for (var attr in attribs) { if (attribs.hasOwnProperty(attr)) { t.setAttribute(attr, attribs[attr]); } }
		for (var styl in styles) { if (styles.hasOwnProperty(styl)) { t.style.setProperty(styl, styles[styl]); } }
		for (var evt in events) { if (events.hasOwnProperty(evt)) { t.addEventListener(evt, events[evt], false); } }
		if (child) { t.appendChild(child); }
		return t;
	}
})();