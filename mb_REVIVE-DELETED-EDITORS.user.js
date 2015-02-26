// ==UserScript==
// @name         mb. REVIVE DELETED EDITORS
// @version      2015.2.26.12.12
// @description  musicbrainz.org: reveal deleted editors’ names and emphasizes your own name to standout in MB pages
// @homepage     http://userscripts-mirror.org/scripts/show/152545
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_REVIVE-DELETED-EDITORS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_REVIVE-DELETED-EDITORS.user.js
// @author       PATATE12
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
	/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
	var editors = {
		  "32978": ["2003-12-13", "2005-12-16", "tenebrous"],
		  "93418": ["2005-02-08", "2013-03-05", "Rhymeless"],
		  "95678": ["2005-02-18", "2012-09-24", "brianfreud"],
		 "129671": ["2005-06-30", "2009-02-02", "Shlublu"],
		 "157767": ["2005-10-20", "2010-01-05", "michael"],
		 "163497": ["2005-11-09", "2012-07-12", "RedHotHeat"],
		 "186010": ["2005-12-30", "2012-11-29", "robojock"],
		 "193948": ["2006-01-20", "2008-01-27", "syserror"],
		 "240330": ["2006-07-03", "2012-11-27", "theirfour"],
		 "273412": ["2006-10-28", "2011-02-25", "Sturla"],
		 "313128": ["2007-03-31", "2009-02-06", "mistoffeles"],
		 "346478": ["2007-08-31", "2011-05-28", "neothe0ne"],
		 "386354": ["2008-03-04", "2008-04-03", "grosnombril"],
		 "420821": ["2008-09-10", "2014-07-19", "kaik"], /*jozo / 54b97c60-f768-42fa-a5ff-d4e7c173910e*/
		 "450522": ["2009-02-21", "2011-05-24", "dr_zepsuj"],
		 "457889": ["2009-04-12", "2014-01-12", "deivsonscherzinger"],
		 "629372": ["2012-04-04", "2014-04-08", "nightspirit"],
		 "638936": ["2012-07-07", "2014-12-21", "betegouveia"],
		 "639228": ["2012-07-08", "2014-12-21", "ritaavenida"],
		 "639231": ["2012-07-08", "2014-12-21", "harrystykes"],
		 "639236": ["2012-07-08", "2014-12-21", "niallhoran"],
		 "701715": ["2013-01-07", "2013-01-30", "remdia"],
		 "774387": ["2013-06-06", "2014-12-21", "Wanddis"],
		 "791672": ["2013-06-14", "2013-12-08", "georg187"],
		 "800638": ["2013-06-19", "2014-12-21", "nicolebahls"],
		 "809366": ["2013-06-23", "2014-12-21", "xoxtina"],
		"1024627": ["2013-10-04", "2014-12-21", "bvlgari"],
		"1288668": ["2014-06-29", "2014-12-21", "khaleesi"],
 		"jesus2099": "GOLD MASTER KING",
		"%you%": "PROPHET PRINCE CHAMPION",
	};
	var standout /*from the crowd*/ = true;
	/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	var MBS = location.protocol+"//"+location.host;
	var you = document.querySelector("div#header li.account a[href^='"+MBS+"/user/']");
	if (document.querySelector("div#header li.account a[href='"+MBS+"/logout'], div#page") == null) { return; }
	if (you) {
		if (editors["%you%"]) {
			if (!editors[you.textContent]) { editors[you.textContent] = editors["%you%"]; }
			delete editors["%you%"];
		}
		if (standout) {
			var ys = document.querySelectorAll("div#page a[href='"+you.getAttribute("href")+"']");
			for (var y=0; y<ys.length; y++) {
				ys[y].style.setProperty("background-color", "yellow");
			}
		}
	}
	for (var editor in editors) if (editors.hasOwnProperty(editor)) {
		var deletedEditor = typeof editors[editor] != "string";
		var editorName = deletedEditor?"Deleted Editor #"+editor:editor;
		document.title = deletedEditor?document.title.replace(new RegExp(editorName+"(”)?"), editors[editor][2]+"$1"):document.title.replace(new RegExp("^Editor( “"+editorName+"”)"), editors[editor]+"$1");
		if (deletedEditor) {
			editors[editor].push(editors[editor][0]+"—"+editors[editor][1]);
			editors[editor].push("→"+editors[editor][1].substring(0, 4));
			var dur = (new Date(editors[editor][1]) - new Date(editors[editor][0])) / 1000 / 60 / 60 / 24;
			var unit = "day";
			if (dur % 30  < dur) {
				if (dur % 365 < dur) {
					dur /= 365;
					unit = "year";
				} else {
					dur /= 30;
					unit = "month";
				}
			}
			dur = Math.round(dur);
			editors[editor].push(dur+" "+unit+(dur==1?"":"s"));
			var as = document.querySelectorAll("a[href='"+MBS+"/user/"+escape(editorName)+"']");
			for (var a=0; a<as.length; a++) {
				for (var n=0; n<as[a].childNodes.length; n++) {
					if ((as[a].childNodes[n].nodeType == 3 || as[a].childNodes[n].tagName && as[a].childNodes[n].tagName == "BDI") && as[a].childNodes[n].textContent == editorName) {
						as[a].replaceChild(document.createTextNode(editors[editor][2]), as[a].childNodes[n]);
						as[a].style.setProperty("color", "darkred", "important");
						as[a].style.setProperty("text-decoration", "line-through");
						as[a].setAttribute("title", editorName+"\n"+editors[editor][5]+" ("+editors[editor][3]+")");
						as[a].className += "tooltip";
						addAfter(document.createTextNode(" ("+editors[editor][5]+" "+editors[editor][4]+")"), as[a]);
						break;
					}
				}
			}
		}
		if (location.href.match(new RegExp("^"+MBS+"/user/"+escape(editorName)+"$"))) {
			var dts = document.querySelectorAll("dl.profileinfo > dt");
			for (var dt=0; dt<dts.length; dt++) {
				if (dts[dt].textContent.match(/user type/i)) {
					var dd = getSibling(dts[dt], "dd");
					if (dd) {
						dd.setAttribute("title", dd.textContent.trim());
						removeChildren(dd);
						dd.appendChild(document.createTextNode(deletedEditor?editorName:editors[editor]));
						dd.style.setProperty("font-weight", "bold");
						dd.style.setProperty("text-shadow", "0 0 4px gold");
					}
				} else if (dts[dt].textContent.match(/member since/i)) {
					if (deletedEditor) {
						document.title = document.title.replace(new RegExp("(“"+editors[editor][2]+"”)"), "$1 ("+editors[editor][4]+")");
						var dd = getSibling(dts[dt], "dd");
						if (dd) {
							var membershipTerm = document.createElement("dt");
							membershipTerm.appendChild(document.createTextNode("Membership:"));
							var membershipDefinition = document.createElement("dd");
							membershipDefinition.appendChild(document.createTextNode(editors[editor][5]+" ("+editors[editor][3]+")"));
							membershipDefinition.style.setProperty("font-weight", "bold");
							membershipDefinition.style.setProperty("text-shadow", "0 0 4px gold");
							addAfter(membershipDefinition, addAfter(membershipTerm, dd));
						}
					}
					break;
				}
			}
		}
	}
	if (localStorage && location.pathname == "/search" && location.search.match(/query=deleted.editor.type=editor/i) && document.querySelector("div#header-menu li.account a[href$='/user/jesus2099']")) {
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