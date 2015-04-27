// ==UserScript==
// @name         mb. PLAIN TEXT TRACKLIST
// @version      2015.4.27.1515
// @description  Get a quick copy of the tracklists in plain text (several formats) for quick re-use (in track parser, EAC, foobar2000 or mp3tag for instance)
// @homepage     http://userscripts-mirror.org/scripts/show/89036
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PLAIN-TEXT-TRACKLIST.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PLAIN-TEXT-TRACKLIST.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2010-10-28
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/release/*
// @include      http://*.mbsandbox.org/release/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @exclude      *.org/release/*/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - 
patterns	: tweak the result tracklist using \n for new lines [normal tracklist, various artists (VA) tracklist]
nextDisc	: used to show when going next medium/tracklist in multi-discs releases */
var patterns = {
	"MB": [
		"%tracknumber%. %title%\n",
		"%tracknumber%. %title% - %artist%\n"
	],
	"MB+times": [
		"%tracknumber%. %title% (%length%)\n", 
		"%tracknumber%. %title% - %artist% (%length%)\n"
	],
	"EAC": [
		"%title%\n", 
		"%title% / %artist%\n"
	],
};
var nextDisc = "\n";
/*☠☠DEAD CODE☠☠ -- following only applies to REtools in classic.musicbrainz.org --
colour		: just put "" for standard stylings
background	: 
border		: 
padding		: bla bla proutor
REtools		: add your catalogue number or bar code searches here */
var colour = "black";
var background = "#ff6";
var border = "";
var padding = "0 4px";
var REtools = {
	"jan with JOShinweb" : "http://joshinweb.jp/dp/%barcode%.html", 
	"catnum with JOShinweb" : "http://joshinweb.jp/cdshops/Dps?KEY=RECODE&FM=0&KEYWORD=%catnum%", 
	"catnum with CDJOurnal" : "http://search.cdjournal.com/disc/?t=2&na=%catnum1%&nb=%catnum2%", 
	"catnum with AMAzon Japan" : "http://amazon.jp/s/?url=search-alias%3Dpopular&field-keywords=%catnum%", 
	"jan with AMAzon Japan" : "http://amazon.jp/s/?url=search-alias%3Dpopular&field-keywords=%barcode%", 
	"catnum with Google" : "http://google.com/search?q=%catnum%", 
	"jan with Google" : "http://google.com/search?q=%barcode%", 
};/*☠☠DEAD CODE☠☠*/
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099plainTextTracklist";
var tracks = document.querySelectorAll("div#content > table.tbl > tbody > tr[id]");
var indexes = { "catnum" : 3, "barcode" : 4 };
/* ## PLAIN TEXT TRACKLIST ## */
function textTracklist(tracks, patt) {
	var pattern = patterns[patt][0];
	var replaces = [
	    [/%artist%/g, "artist"],
	    [/%length%/g, "length"],
	    [/%title%/g, "title"],
	    [/%tracknumber%/g, "tracknumber"],
	];
	var tracklist = "";
	for (var i=0 ; i < tracks.length ; i++) {
		var tracknumber = tracks[i].querySelector("td.pos").textContent.trim();
		if (tracknumber == "1" && i != 0) { tracklist += nextDisc; }
		var title = (tracks[i].querySelector("td:not(.pos):not(.video) a[href^='"+location.protocol+"//"+location.host+"/recording/']").textContent);
		var artist = tracks[i].querySelector("td:not([class]) + td:not([class])");
		if (artist) {
			artist = artist.textContent.trim();
			pattern = patterns[patt][1];
		}
		var length = tracks[i].querySelector("td.treleases").textContent.replace(/[^0-9:(?)]/g, "");
		var txt = pattern;
		for (var j=0; j < replaces.length; j++) {
			txt = txt.replace(replaces[j][0], eval(replaces[j][1]));
		}
		tracklist += txt.replace(" (?:??)", "");
	}
	return tracklist;
}
if (tracks.length > 0) {
	for (var p in patterns) if (patterns.hasOwnProperty(p)) {
		var fragment= document.createDocumentFragment();
		var a = document.createElement("a");
		a.style.cursor = "pointer";
		a.addEventListener("click", function(e) {
			function coolstuff(t,z,s,b,o) {
				var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
				truc.style.position = "fixed";
				truc.style.zIndex = z;
				truc.style.top = (100-s)/2+"%";
				truc.style.left = (100-s)/2+"%";
				truc.style.width = s+"%";
				truc.style.height = s+"%";
				if (b) { truc.style.background = b; }
				if (o) { truc.style.opacity = o; }
				return truc;
			}
			coolstuff("div", "50", 100, "black", ".6").addEventListener("click", function(e) {
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this);
			});
			var thisisit = coolstuff("textarea", "55", 80);
			thisisit.style.setProperty("font-family", "sans-serif");
			thisisit.addEventListener("keypress", function(e) {
				if (e.keyCode == 27) { this.previousSibling.click(); }
			});
			thisisit.appendChild(document.createTextNode(textTracklist(tracks, this.getAttribute("rel"))));
			thisisit.setAttribute("title", "press ESC to close");
			thisisit.select();
		});
		a.appendChild(document.createTextNode(p));
		a.setAttribute("rel", p);
		var relprop = sidebar.querySelector("div#sidebar dl.properties");
		if (relprop) {
			var tlddid = userjs+"tracklists";
			var tldd = relprop.querySelector("dd#"+tlddid);
			var sep = ", ";
			if (!tldd) {
				relprop.appendChild(document.createElement("dt")).appendChild(document.createTextNode("Tracklist:"));
				tldd = relprop.appendChild(document.createElement("dd"));
				tldd.setAttribute("id", tlddid);
				sep = "";
			}
			tldd.appendChild(document.createTextNode(sep));
			tldd.appendChild(a);
		}
	}
}
/*☠☠DEAD CODE☠☠ ## RELEASE EVENT TOOLS ## classic.mb only*/
if (false && REtools) {
	var REfound = document.evaluate("//table[@class='eventslist']//tr", content, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for (var ire=1; ire < REfound.snapshotLength; ire++) {
		var tmp;
		var catnum = null;
		var catnum1 = null;
		var catnum2 = null;
		tmp = REfound.snapshotItem(ire).getElementsByTagName("td")[indexes.catnum].firstChild.nodeValue;
		if (tmp != "-") {
			catnum = tmp;
			tmp = catnum.split("-", 2);
			if (tmp.length == 2) {
				catnum1 = tmp[0];
				catnum2 = tmp[1];
			}
		}
		var barcode = null;
		tmp = REfound.snapshotItem(ire).getElementsByTagName("td")[indexes.barcode].firstChild.nodeValue;
		if (tmp != "-") {
			barcode = tmp;
		}
		debug("release event\ncatnum  : "+catnum+"\ncatnum1 : "+catnum1+"\ncatnum2 : "+catnum2+"\nbarcode : "+barcode);
		for (var tool in REtools) if (REtools.hasOwnProperty(tool)) {
			addTool(REfound.snapshotItem(ire), tool, REtools[tool], catnum, catnum1, catnum2, barcode);
		}
	}
}
function addTool(pRE, pLABEL, pURL, pCATNUM, pCATNUM1, pCATNUM2, pBARCODE) {
	var linkPos = null;
	var isBC = (pURL.indexOf("%barcode%") >= 0 && pBARCODE);
	var isCN = (pURL.indexOf("%catnum%") >= 0 && pCATNUM);
	var isCN1 = (pURL.indexOf("%catnum1%") >= 0 && pCATNUM1);
	var isCN2 = (pURL.indexOf("%catnum2%") >= 0 && pCATNUM2);
	if (isBC) { linkPos = "barcode"; }
	else if (isCN || (isCN1 && isCN2)) { linkPos = "catnum"; }
	debug(pLABEL+"\n"+pURL+(isBC?"\nisBC":"")+(isCN?"\nisCN":"")+(isCN1?"\nisCN1":"")+(isCN2?"\nisCN2":""));
	if (linkPos) {
		var prevTR = getPreviousTR(pRE);
		if (prevTR.className != j2ujsID) {
			prevTR = document.createElement("tr");
			prevTR.className = j2ujsID;
			for (var iactd=0; iactd < 6; iactd++) { prevTR.appendChild(document.createElement("td")); }
			pRE.parentNode.insertBefore(prevTR, pRE);
		}
		var REcell = prevTR.getElementsByTagName("td")[indexes[linkPos]];
		REcell.appendChild(document.createTextNode(" "));
		var a = document.createElement("a");
		a.setAttribute("title", pLABEL.toLowerCase());
		a.setAttribute("href", pURL.replace(/%catnum%/g, pCATNUM).replace(/%catnum1%/g, pCATNUM1).replace(/%catnum2%/g, pCATNUM2).replace(/%barcode%/g, pBARCODE));
		a.style.color = colour;
		a.style.background = background;
		a.style.border = border;
		a.style.padding = padding;
		a.appendChild(document.createTextNode(pLABEL.replace(/[^A-Z0-9]/g, "")));
		REcell.appendChild(a);
	}
}
function getPreviousTR(thisTR) {
	var prevTR = thisTR.previousSibling;
	while (prevTR.tagName != "TR") {/*infinite loop hazard*/ prevTR = prevTR.previousSibling; }
	return prevTR;
}
function debug(coucou) {
	if (debugging) {
		var dbgtxt = "89036: " + coucou;
		try { console.log(dbgtxt);
		} catch(e) {alert(dbgtxt);}
	}
}/*☠☠DEAD CODE☠☠*/
})();