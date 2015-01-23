// ==UserScript==
// @name         mb. REVIVE DELETED EDITORS
// @version      2015.1.23.15.0
// @description  musicbrainz.org: reveal deleted editors’ names and emphasizes your own name to standout in MB pages
// @homepage     http://userscripts-mirror.org/scripts/show/152545
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_REVIVE-DELETED-EDITORS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_REVIVE-DELETED-EDITORS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-11-16
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*edits*
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/edit/*
// @include      http*://*musicbrainz.org/election*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/search*type=editor*
// @include      http*://*musicbrainz.org/statistics/editors*
// @include      http*://*musicbrainz.org/user/*
// @include      http*://*musicbrainz.org/work/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	/* - --- - --- - --- - START OF CONFIGURATION - --- - --- http://musicbrainz.org/user/Deleted%20Editor%20%2332978- --- - */
	var regrets = {
		  "Deleted Editor #32978": "tenebrous",         /*2003-12-13 - 2005-12-16*/
		  "Deleted Editor #93418": "Rhymeless",         /*2005-02-08 - 2013-03-05*/
		  "Deleted Editor #95678": "brianfreud",        /*2005-02-18 - 2012-09-24*/
		 "Deleted Editor #129671": "Shlublu",           /*2005-06-30 - 2009-02-02*/
		 "Deleted Editor #157767": "michael",           /*2005-10-20 - 2010-01-05*/
		 "Deleted Editor #163497": "RedHotHeat",        /*2005-11-09 - 2012-07-12*/
		 "Deleted Editor #186010": "robojock",          /*2005-12-30 - 2012-11-29*/
		 "Deleted Editor #193948": "syserror",          /*2006-01-20 - 2008-01-27*/
		 "Deleted Editor #240330": "theirfour",         /*2006-07-03 - 2012-11-27*/
		 "Deleted Editor #313128": "mistoffeles",       /*2007-03-31 - 2009-02-06*/
		 "Deleted Editor #346478": "neothe0ne",         /*2007-08-31 - 2011-05-28*/
		 "Deleted Editor #386354": "grosnombril",       /*2008-03-04 - 2008-04-03*/
		 "Deleted Editor #420821": "kaik",              /*2008-09-10 - 2014-07-19 / jozo / 54b97c60-f768-42fa-a5ff-d4e7c173910e*/
		 "Deleted Editor #450522": "dr_zepsuj",         /*2009-02-21 - */
		 "Deleted Editor #457889": "deivsonscherzinger",/*2009-04-12 - 2014-01-12*/
		 "Deleted Editor #629372": "nightspirit",       /*2012-04-04 - 2014-04-08*/
		 "Deleted Editor #638936": "betegouveia",       /*2012-07-07 - 2014-12-21*/
		 "Deleted Editor #639228": "ritaavenida ",      /*2012-07-08 - 2014-12-21*/
		 "Deleted Editor #639231": "harrystykes",       /*2012-07-08 - 2014-12-21*/
		 "Deleted Editor #639236": "niallhoran",        /*2012-07-08 - 2014-12-21*/
		 "Deleted Editor #701715": "remdia",            /*2013-01-07 - 2013-01-30*/
		 "Deleted Editor #774387": "Wanddis",           /*2013-06-06 - 2014-12-21*/
		 "Deleted Editor #791672": "georg187",          /*2013-06-14 - */
		 "Deleted Editor #800638": "nicolebahls",       /*2013-06-19 - 2014-12-21*/
		 "Deleted Editor #809366": "xoxtina",           /*2013-06-23 - 2014-12-21*/
		"Deleted Editor #1024627": "bvlgari",           /*2013-10-04 - 2014-12-21*/
		"Deleted Editor #1288668": "khaleesi",          /*2014-06-29 - 2014-12-21*/
 		"jesus2099": "GOLD MASTER KING",
		"%you%": "PROPHET PRINCE CHAMPION",
	};
	var mark /*of the life again*/ = "★";
	var standout /*from the crowd*/ = true;
	/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	var MBS = self.location.protocol+"//"+self.location.host;
	var you = document.querySelector("div#header li.account a[href^='"+MBS+"/user/']");
	if (document.querySelector("div#header li.account a[href='"+MBS+"/logout'], div#page") == null) { return; }
	if (you) {
		if (regrets["%you%"]) {
			if (!regrets[you.textContent]) { regrets[you.textContent] = regrets["%you%"]; }
			delete regrets["%you%"];
		}
		if (standout) {
			var ys = document.querySelectorAll("div#page a[href='"+you.getAttribute("href")+"']");
			for (var y=0; y<ys.length; y++) {
				ys[y].style.setProperty("background-color", "yellow");
			}
		}
	}
	for (var user in regrets) { if (regrets.hasOwnProperty(user)) {
		var deled = user.match(/^deleted editor #[0-9]+$/i);
		document.title = deled?document.title.replace(new RegExp(user+"(”)?"), regrets[user]+"$1"+mark):document.title.replace(new RegExp("^Editor( “"+user+"”)"), regrets[user]+"$1");
		if (deled) {
			var as = document.querySelectorAll("a[href='"+MBS+"/user/"+escape(user)+"']");
			for (var a=0; a<as.length; a++) {
				for (var n=0; n<as[a].childNodes.length; n++) {
					if ((as[a].childNodes[n].nodeType == 3 || as[a].childNodes[n].tagName && as[a].childNodes[n].tagName == "BDI") && as[a].childNodes[n].textContent == user) {
						as[a].replaceChild(document.createTextNode(regrets[user]), as[a].childNodes[n]);
						as[a].style.setProperty("color", "darkred", "important");
						addAfter(document.createTextNode(mark), as[a]);
						as[a].setAttribute("title", user);
						as[a].className += "tooltip";
						break;
					}
				}
			}
		}
		if (self.location.href.match(new RegExp("^"+MBS+"/user/"+escape(user)+"$"))) {
			var dts = document.querySelectorAll("dl.profileinfo > dt");
			for (var dt=0; dt<dts.length; dt++) {
				if (dts[dt].textContent.match(/user type/i)) {
					var dd = getSibling(dts[dt], "dd");
					if (dd) {
						dd.setAttribute("title", dd.textContent.trim());
						removeChildren(dd);
						dd.appendChild(document.createTextNode(deled?user:regrets[user]));
						dd.style.setProperty("font-weight", "bold");
						dd.style.setProperty("text-shadow", "0 0 4px gold");
					}
					break;
				}
			}
		}
	} }
	if (localStorage && self.location.pathname == "/search" && self.location.search.match(/query=deleted.editor.type=editor/i) && document.querySelector("div#header-menu li.account a[href$='/user/jesus2099']")) {
		var lsmax = "jesus2099userjs152545debugmax";
		var max = localStorage.getItem(lsmax);
		max = max?parseInt(max, 10):0;max;
		var nmax = max;
		var editors = document.querySelectorAll("table a[href^='"+MBS+"/user/Deleted%20Editor%20%23']");
		for (var ed=0; ed<editors.length; ed++) {
			var id = editors[ed].getAttribute("href").match(/\d+$/);
			if (id > max) {
				if (id > nmax) { nmax = id; }
				editors[ed].style.setProperty("font-weight", "bold");
			}
		}
		if (nmax > max && confirm("store new max?")) { localStorage.setItem(lsmax, nmax); }
	}
	function removeChildren(p) {
		while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
	}
	function getSibling(obj, tag, cls, prev) {
		var cur = obj;
		if (cur = prev?cur.previousSibling:cur.nextSibling) {
			if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
				return cur;
			} else {
				return getSibling(cur, tag, cls, prev);
			}
		} else {
			return null;
		}
	}
	function addAfter(n, e) {
		if (n && e && e.parentNode) {
			if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
			else { return e.parentNode.appendChild(n); }
		} else { return null; }
	}
})();