// ==UserScript==
// @name         mb. PLAIN TEXT TRACKLIST
// @version      2015.4.28.1748
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
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099plainTextTracklist";
var tracks = document.querySelectorAll("div#content > table.tbl > tbody > tr[id]");
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
		var relprop = document.querySelector("div#sidebar dl.properties");
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
})();