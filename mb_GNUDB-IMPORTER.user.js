// ==UserScript==
// @name         mb. GNUDB IMPORTER
// @version      2025.12.12
// @description  GnuDB.org: EXPERIMENTAL! Import GnuDB/FreeDB/CDDB entries to MusicBrainz, thanks to murdos mbimport.js library
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_GNUDB-IMPORTER
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_GNUDB-IMPORTER.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2021-11-12
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/murdos/musicbrainz-userscripts/raw/9fc80f796e361554f1f477a999dcdc8c45534a31/lib/mbimport.js
// @grant        none
// @include      /^https://gnudb.org/cd/([a-z]{2})?[0-9a-f]{2}[0-9a-f]{4}[0-9a-f]{2}$/
// @run-at       document-idle
// ==/UserScript==
"use strict";

/* global MBImport */ // eslint no-undef exception

// http://libcddb.sourceforge.net/API/cddb__disc_8h.html
// https://www.jwz.org/doc/cddb.html
// https://en.wikipedia.org/wiki/CDDB
// https://fr.wikipedia.org/wiki/DiscId
var releaseArtist = document.querySelector("h1");
if (releaseArtist) {
	releaseArtist = releaseArtist.textContent;
} else {
	releaseArtist = "Various";
}
var tracklist = document.querySelector("div#content > table > tbody");
// Handle "Various Artists" releases
var va = false;
var vaSeparator = "";
var r;
if (releaseArtist.match(/\bdivers(es)?\b|\bcompil(ation\b)?|^nhi[ềe]u\s|^オムニバス$|^various\b|^v\.?a\.?$|^o\.?s\.?t\.?$|\bfilm\b|\bjeux?\b|\bgames?\b/i)) {
	for (var s = 0, separators = [" / ", "／", " - ", "/"]; !va && s < separators.length; s++) {
		for (r = 1; r < tracklist.rows.length; r++) {
			var checkSeparator = tracklist.rows[r].cells[2].textContent.match(new RegExp(separators[s]));
			if (checkSeparator === null || checkSeparator.length !== 1) {
				// if each track has exactly one occurrence of separator, this is it, otherwise try next separator
				continue;
			} else {
				if (r === tracklist.rows.length - 1) {
					va = true;
					vaSeparator = separators[s];
				}
			}
		}
		// TODO: many オムニバス have tracks as "title(artist)"
	}
}
// read main release data
var parsedRelease = {
	title: document.querySelector("h2").textContent,
	artist_credit: [{
		artist_name: va ? "Various Artists" : releaseArtist,
		mbid: va ? "89ad4ac3-39f7-470e-963a-56509c546377" : null
	}],
	discs: [{
		format: "CD",
		tracks: []
	}]
};
// read tracklist
for (r = 1; r < tracklist.rows.length; r++) {
	var trackTitle = tracklist.rows[r].cells[2].textContent;
	var trackArtistCredit = parsedRelease.artist_credit;
	if (va) {
		trackTitle = trackTitle.split(vaSeparator);
		trackArtistCredit = [{ artist_name: trackTitle[0] }];
		trackTitle = trackTitle[1];
	}
	parsedRelease.discs[0].tracks.push({
		title: trackTitle,
		duration: tracklist.rows[r].cells[1].textContent,
		artist_credit: trackArtistCredit
	});
}
// if last track is a data track, remove it and substract 2:32 from last audio track
// TODO: add manual data track and last audio track fix button (instead?)
var lastTrack = parsedRelease.discs[0].tracks.length - 1;
if (parsedRelease.discs[0].tracks[lastTrack].title.match(/^(data track|extra)$/i) && confirm("Do you confirm that the last track is a data track and that it should be removed?")) {
	parsedRelease.discs[0].format = "Enhanced CD";
	parsedRelease.discs[0].tracks.pop();
	parsedRelease.discs[0].tracks[lastTrack - 1].duration = msToDuration(durationToMs(parsedRelease.discs[0].tracks[lastTrack - 1].duration) - 152000);
	tracklist.rows[lastTrack + 1].style.setProperty("background", "pink");
	tracklist.rows[lastTrack].cells[1].style.setProperty("background", "pink");
	tracklist.rows[lastTrack].cells[1].appendChild(document.createTextNode("→" + parsedRelease.discs[0].tracks[lastTrack - 1].duration));
}
// insert murdos MB search and import buttons, with (cough) innerHTML
var MBStuff = document.createElement("span");
MBStuff.innerHTML = MBImport.buildSearchLink(parsedRelease).replace("tracks:", "tracksmedium:").replace("<a", "<a target=_blank") + MBImport.buildFormHTML(MBImport.buildFormParameters(parsedRelease, "\n\n—\n" + location.href + " imported by " + GM_info.script.downloadURL.replace("raw", "blob") + " (" + GM_info.script.version + ") "));
document.querySelector("div#content").insertBefore(MBStuff, document.querySelector("div#content > hr"));
// tools
function durationToMs(duration) {
	var durationItems = duration.split(":");
	var durationMs = 0;
	for (var i = durationItems.length - 1, multiplicator = 1000; i >= 0; i--) {
		durationMs += durationItems[i] * multiplicator;
		multiplicator *= 60;
	}
	return durationMs;
}
function msToDuration(durationMs) {
	var d = new Date(durationMs);
	// https://github.com/jesus2099/konami-command/blob/d6a3ea448a2445e05f974671dce80a4316549383/mb_INLINE-STUFF.user.js#L628
	return (d.getUTCHours() > 0 ? d.getUTCHours() + ":" + (d.getUTCMinutes() / 100).toFixed(2).slice(2) : d.getUTCMinutes()) + ":" + (d.getUTCSeconds() / 100).toFixed(2).slice(2) + (d.getUTCMilliseconds() > 0 ? "." + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2) : "");
}
