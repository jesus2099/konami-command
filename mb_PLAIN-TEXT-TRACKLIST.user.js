// ==UserScript==
// @name         mb. PLAIN TEXT TRACKLIST
// @version      2022.9.26.1
// @description  Get a quick copy of the tracklists in plain text (several formats) for quick re-use (in track parser, EAC, foobar2000 or mp3tag for instance)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PLAIN-TEXT-TRACKLIST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PLAIN-TEXT-TRACKLIST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2010-10-28; https://web.archive.org/web/20131119110027/userscripts.org/scripts/show/89036 / https://web.archive.org/web/20141011084012/userscripts-mirror.org/scripts/show/89036
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/disc\/\d+#[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?/
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- -
patterns: tweak the result tracklist using \n for new lines
nextDisc: used to show when going next medium/tracklist in multi-discs releases */
var patterns = {
	"Track\u00A0parser": {
		withoutTrackArtists: "%tracknumber%. %title% (%length%)\n",
		withTrackArtists: "%tracknumber%. %title% - %artist% (%length%)\n"
	},
	"Always\u00A0artists": {
		withTrackArtists: "%tracknumber%. %title% - %artist% (%length%)\n"
	},
	"No\u00A0times": {
		withoutTrackArtists: "%tracknumber%. %title%\n",
		withTrackArtists: "%tracknumber%. %title% - %artist%\n"
	},
	"EAC": {
		withoutTrackArtists: "%title%\n",
		withTrackArtists: "%title% / %artist%\n"
	},
};
var nextDisc = "\n";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099plainTextTracklist";
var tracks = document.querySelectorAll("div#content > table.tbl > tbody > tr[id]");
/* ## PLAIN TEXT TRACKLIST ## */
function textTracklist(tracks, patt) {
	// link to mb_INLINE-STUFF (start)
	var inlineStuffedRecordingNames = document.querySelectorAll("a[jesus2099userjs81127recname]");
	for (var n = 0; n < inlineStuffedRecordingNames.length; n++) {
		replaceChildren(createTag("bdi", {}, inlineStuffedRecordingNames[n].getAttribute("jesus2099userjs81127recname")), inlineStuffedRecordingNames[n]);
		inlineStuffedRecordingNames[n].removeAttribute("jesus2099userjs81127recname");
	}
	var inlineStuffedRecordingComments = document.querySelectorAll("span.jesus2099userjs81127recdis");
	for (var c = 0; c < inlineStuffedRecordingComments.length; c++) {
		removeNode(inlineStuffedRecordingComments[c]);
	}
	// link to mb_INLINE-STUFF (end)
	var pattern = patterns[patt].withoutTrackArtists;
	var replaces = [
		[/%artist%/g, "artist"],
		[/%length%/g, "length"],
		[/%title%/g, "title"],
		[/%tracknumber%/g, "tracknumber"],
	];
	var tracklist = "";
	for (var i = 0; i < tracks.length; i++) {
		var tracknumber = tracks[i].querySelector("td.pos").textContent.trim();
		if (tracknumber == "1" && i != 0) { tracklist += nextDisc; }
		// eslint-disable-next-line no-unused-vars -- title sera utilisée par un eval(), plus loin
		var title = (tracks[i].querySelector("td:not(.pos):not(.video) a[href^='/recording/']").textContent);
		var artist = tracks[i].querySelector("td:not([class]) + td:not([class])");
		if (artist) {
			artist = artist.textContent.trim();
			pattern = patterns[patt].withTrackArtists || patterns[patt].withoutTrackArtists;
		} else if (!patterns[patt].withoutTrackArtists) {
			pattern = patterns[patt].withTrackArtists;
			artist = JSON.parse(document.querySelector("script[type='application/ld+json']").textContent).creditedTo;
		}
		// eslint-disable-next-line no-unused-vars -- length sera utilisée par un eval(), plus loin
		var length = tracks[i].querySelector("td.treleases").textContent.replace(/[^0-9:(?)]/g, "");
		var txt = pattern;
		for (var j = 0; j < replaces.length; j++) {
			txt = txt.replace(replaces[j][0], eval(replaces[j][1]));
		}
		tracklist += txt.replace(" (?:??)", "");
	}
	return tracklist;
}
if (tracks.length > 0) {
	for (var p in patterns) if (Object.prototype.hasOwnProperty.call(patterns, p)) {
		var a = document.createElement("a");
		a.style.setProperty("cursor", "pointer");
		a.addEventListener("click", function(event) {
			function coolstuff(tagName, zIndex, size, background, opacity) {
				var truc = document.body.appendChild(document.createElement(tagName));
				truc.style.setProperty("position", "fixed");
				truc.style.setProperty("z-index", zIndex);
				truc.style.setProperty("top", (100 - size) / 2 + "%");
				truc.style.setProperty("left", (100 - size) / 2 + "%");
				truc.style.setProperty("width", size + "%");
				truc.style.setProperty("height", size + "%");
				if (background) { truc.style.setProperty("background", background); }
				if (opacity) { truc.style.setProperty("opacity", opacity); }
				return truc;
			}
			coolstuff("div", "50", 100, "black", ".6").addEventListener("click", function(event) {
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this);
			});
			var thisisit = coolstuff("textarea", "55", 80);
			thisisit.style.setProperty("font-family", "sans-serif");
			thisisit.addEventListener("keydown", function(event) {
				if (event.key == "Escape") { this.previousSibling.click(); }
			});
			thisisit.appendChild(document.createTextNode(textTracklist(tracks, this.getAttribute("rel"))));
			thisisit.setAttribute("title", "press ESC to close");
			thisisit.select();
		});
		a.appendChild(document.createTextNode(p));
		a.setAttribute("rel", p);
		var relprop = document.querySelector("div#sidebar dl.properties");
		if (relprop) {
			var tlddid = userjs + "tracklists";
			var tldd = relprop.querySelector("dd#" + tlddid);
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
