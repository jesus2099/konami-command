// ==UserScript==
// @name         mb. TAGGER LINKS NOW
// @version      2014.11.15.1248
// @description  musicbrainz.org: Quickly show or update "TAGGER" links with desired port
// @homepage     http://userscripts-mirror.org/scripts/show/88065
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_TAGGER-LINKS-NOW.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_TAGGER-LINKS-NOW.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2010-10-13
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/area/*/releases*
// @include      http*://*musicbrainz.org/artist/*/releases*
// @include      http*://*musicbrainz.org/cdtoc/attach?toc=*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release*
// @include      http*://*musicbrainz.org/search*type=release*
// @include      http://*.mbsandbox.org/area/*/releases*
// @include      http://*.mbsandbox.org/artist/*/releases*
// @include      http://*.mbsandbox.org/cdtoc/attach?toc=*
// @include      http://*.mbsandbox.org/label/*
// @include      http://*.mbsandbox.org/recording/*
// @include      http://*.mbsandbox.org/release*
// @include      http://*.mbsandbox.org/search*type=release*
// @exclude      *.org/cdtoc/attach?toc=*medium=*
// @exclude      *.org/cdtoc/search*type=release_group*
// @exclude      *.org/cdtoc/search*type=release-group*
// @exclude      *//*/*mbsandbox.org*
// @exclude      *//*/*musicbrainz.org*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var userjs = "jesus2099userjs88065";
	/* ----- - ----- CONFIG */
	var automatic = true; /*will background load tport (only when none) so TAGGER buttons do appear on next page browsing without bother triggering it manually*/
	var url = "/search?query=artist%3AAJICO+AND+release%3A%22AJICO+SHOW%22+AND+format%3AVHS&type=release&method=advanced&tport=%tagger-port%";
	var txt_notaggerlinks = "%tagger-img% (%tagger-port%)"; /* %tagger-port% variable shows the current port and %tagger-img% the tagger image */
	var txt_taggerlinksloaded = "%tagger-img% (%tagger-port%)";
	var txt_loading = "⌛ loading…";
	var bgcolour = "#6f9";
	var taggerImgUrl = "/static/images/icons/mblookup-tagger.png"; /*replaces %tagger-img% in txt and chgtxt*/
	/* ----- - END OF CONFIG */
	var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var portStorage = userjs+"_tport";
	var isOK = document.cookie.match(new RegExp(userjs+"_ok=1"));
	var shouldhavetaggerlink = location.pathname.match(new RegExp("^/(artist/"+RE_GUID+"/releases|label/"+RE_GUID+"|recording/"+RE_GUID+"|release[-_]group/"+RE_GUID+"|release/"+RE_GUID+"(/(relationships|discids|tags|details|((add|edit|remove|reorder)-)?cover-art(/\d+)?|edit))?)/?$")) && document.querySelector("a[href*='/release/']:not([href*='/release/add'])");
	var taggerlink = document.querySelector("a.tagger-icon");
	var con, a, menu;
	var savedport = localStorage.getItem(portStorage);
	var tagger_port = savedport?savedport:"8000";
	if (taggerlink) {
		document.cookie = userjs+"_ok=1; path=/";
		isOK = true;
		var tport = taggerlink.getAttribute("href");
		if (tport) {
			tport = tport.match(/^https?:\/\/[^/]+:([0-9]+)\//);
			if (tport) {
				tagger_port = tport[1];
				if (tagger_port != savedport) {
					localStorage.setItem(portStorage, tagger_port);
				}
			}
		}
	}
	if (menu = document.querySelector("table#mainmenu-table table tr, div#header-menu ul")) {
		a = document.createElement("a");
		var wtxt = (taggerlink?txt_taggerlinksloaded:txt_notaggerlinks).replace(/%tagger-port%/, tagger_port);
		var wfrg = document.createDocumentFragment();
		var warr = wtxt.split("%tagger-img%");
		if (warr.length > 1) {
			wfrg.appendChild(document.createTextNode(warr[0]));
			var img = document.createElement("img");
			img.setAttribute("src", taggerImgUrl);
			img.setAttribute("alt", "tagger");
			img.style.setProperty("vertical-align", "bottom");
			wfrg.appendChild(img);
			wfrg.appendChild(document.createTextNode(warr[1]));
		}
		else {
			wfrg.appendChild(document.createTextNode(wtxt));
		}
		a.appendChild(wfrg);
		a.style.setProperty("cursor", "pointer");
		a.setAttribute("title", (!taggerlink?"CTRL+":"")+"CLICK to change port (currently on port "+tagger_port+")");
		a.addEventListener("click", function(e) {
				if (e.ctrlKey || taggerlink) {
					var tport = window.prompt("CHANGE TAGGER PORT\n\nCurrent tagger port is "+tagger_port+".\nEnter new tagger port below:", tagger_port);
					if (!tport || (tport == tagger_port && taggerlink)) {
						return false;
					}
					else {
						tagger_port = tport;
						localStorage.setItem(portStorage, tport);
					}
				}
				loadu(e, false);
			}, false);
		con = document.createElement("li");
		con.appendChild(a);
		if (!taggerlink && shouldhavetaggerlink || !isOK) {
			con.style.setProperty("background-color", bgcolour);
			if (automatic) {
				loadu(null, shouldhavetaggerlink);
			}
		}
		menu.insertBefore(con, menu.firstChild);
	}
	function loadu(e, reload) {
		con.style.setProperty("opacity", ".5");
		if (reload) {
			removeChildren(a);
			a.appendChild(document.createTextNode(txt_loading));
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(e) {
			if (this.readyState == 4) {
				if (this.status < 400 && this.status > 199 && this.responseText.match(/class="tagger-icon"/)) {
					document.cookie = userjs+"_ok=1; path=/";
					isOK = true;
					if (reload) {
						top.location.reload(true);
					} else {
						con.style.setProperty("opacity", "1");
						con.style.removeProperty("background-color");
						a.setAttribute("title", a.getAttribute("title")+" \n ☞ AUTO-LOAD seems to have WORKED");
					}
				}
				else {
					con.style.setProperty("opacity", "1");
					con.style.setProperty("background-color", "gold");
					if (reload) {
						a.setAttribute("title", a.getAttribute("title")+" \n ☞ AUTO-LOAD seems to have FAILED");
					} else {
						removeChildren(a);
						a.appendChild(document.createTextNode("Error "+this.status+" (retry)"));
					}
				}
			}
		};
		xhr.open("get", url.replace(/%tagger-port%/, tagger_port), true);
		xhr.send(null);
	}
	function removeChildren(p) {
		while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
	}
})();