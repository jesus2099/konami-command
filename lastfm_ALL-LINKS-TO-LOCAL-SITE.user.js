(function(){"use strict";
var metadata=function(){/*
// ==UserScript==
// @name         last.fm. ALL LINKS TO LOCAL SITE
// @version      2014.0613.1809
// @description  Replaces any lastfm link by the desired language, like "www.lastfm.xx" or else
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_ALL-LINKS-TO-LOCAL-SITE.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_ALL-LINKS-TO-LOCAL-SITE.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @since        2011.5.23.
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @exclude      http://cn.last.fm/*
// @exclude      http://www.last.fm/*
// @exclude      http://www.lastfm.*
// @run-at       document-end
// ==/UserScript==
*/};
var preferred_lastfm = "last.fm";
/* In above setting, choose your favourite host :
"last.fm" for minimalistic auto-lang despatch links (often english)
"cn.last.fm" for 简体中文
"www.last.fm" for english
"www.lastfm.com.br" for português
"www.lastfm.com.tr" for türkçe
"www.lastfm.de" → for deutsch
"www.lastfm.es" → for español
"www.lastfm.fr" → for français
"www.lastfm.it" → for italiano
"www.lastfm.jp" → for 日本語
"www.lastfm.pl" → for polski
"www.lastfm.ru" → for руccкий
"www.lastfm.se" → for svenska */
var meta = metadata && metadata.toString && metadata.toString();
meta = meta.match(/@name\s+(.+)/i);
meta = meta?"” ("+meta[1]+")":"”";
var as = document.querySelectorAll("a[href*='.lastfm.'], a[href*='last.fm/']");
for (var i=0; i < as.length; i++) {
	var newhref, href = as[i].getAttribute("href");
	if (
		href &&
		(newhref = href.replace(/^(?:https?:)?\/\/(?:(?:cn|www)\.)?(?:last\.fm|lastfm\.(?:com\.)?[a-z][a-z])(\/.*)?$/i, "http://"+preferred_lastfm+"$1")) &&
		href != newhref
	) {
		as[i].setAttribute("href", newhref);
		var title = as[i].getAttribute("title");
		as[i].setAttribute("title", (title?title+"\n":"")+"was “"+href+meta);
	}
}
})();