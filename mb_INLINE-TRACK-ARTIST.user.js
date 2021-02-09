// ==UserScript==
// @name         mb. INLINE TRACK ARTIST
// @version      2021.2.9
// @description  musicbrainz.org: highlights track title, length and artist differences in recording page
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_INLINE-TRACK-ARTIST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_INLINE-TRACK-ARTIST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @requester    culinko
// @since        2013-05-07; https://web.archive.org/web/20131104205636/userscripts.org/scripts/show/166877 / https://web.archive.org/web/20141011084010/userscripts-mirror.org/scripts/show/166877
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@ab3d205ab8a9897ac3ef23075fda26bed07ca342/lib/COOL-BUBBLES.js?v=2016.6.1.1310
// @grant        none
// @match        *://*.musicbrainz.org/recording/*
// @exclude      *.org/recording/*/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var mbid = self.location.pathname.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
var tracks = document.querySelectorAll("div#content table.tbl > tbody > tr");
if (mbid && tracks.length > 0) {
	var releaseArtistColumnHeader = getParent(tracks[0], "table").querySelectorAll("thead > tr > th");
	var lengthColumnIndex;
	var trackTitleColumnIndex;
	/* locate length, track title and release artist columns */
	for (var columnIndex = 0; columnIndex < releaseArtistColumnHeader.length; columnIndex++) {
		if (releaseArtistColumnHeader[columnIndex].textContent.match(/^tit\w+$/i)) {
			trackTitleColumnIndex = columnIndex + 1;
		} else if (releaseArtistColumnHeader[columnIndex].classList.contains("treleases")) {
			lengthColumnIndex = columnIndex + 1;
		}
	}
	if (trackTitleColumnIndex && lengthColumnIndex) {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function(event) {
			var wsRecording = this.responseXML;
			if (
				this.status == 200
				&& (wsRecording = wsRecording.documentElement)
			) {
				var wsRecordingLength = wsRecording.querySelector("recording > length");
				wsRecordingLength = time(wsRecordingLength ? wsRecordingLength.textContent : 0);
				var trackLengthCell = document.querySelector("div#sidebar dl.properties dd.length");
				if (trackLengthCell) { trackLengthCell.replaceChild(document.createTextNode(wsRecordingLength), trackLengthCell.firstChild); }
				var wsTracks = wsRecording.querySelectorAll("recording[id='" + mbid + "'] > release-list > release > medium-list > medium > track-list > track");
				for (var wst = 0; wst < wsTracks.length; wst++) {
					var wsRelease = getParent(wsTracks[wst], "release");
					var wsReleaseMBID;
					var wsPosition = wsTracks[wst].parentNode.parentNode.querySelector("position");
					var wsTrackPosition = wsTracks[wst].querySelector("position");
					if (
						wsRelease
						&& (wsReleaseMBID = wsRelease.getAttribute("id"))
						&& wsPosition && (wsPosition = wsPosition.textContent)
						&& wsTrackPosition && (wsTrackPosition = wsTrackPosition.textContent)
					) {
						for (var t = 0; t < tracks.length; t++) {
							if (tracks[t].querySelector("a[href*='/release/']") && tracks[t].querySelector("a[href*='/release/']").getAttribute("href").indexOf(wsReleaseMBID) > 0 && tracks[t].querySelector("td:first-of-type").textContent.trim() == wsPosition + "." + wsTrackPosition) {
								/* display recording/track title discrepency */
								var trackTitleCell = tracks[t].querySelector("td:nth-child(" + trackTitleColumnIndex + ")");
								if (trackTitleCell) {
									var trackTitle = document.querySelector("h1 a");
									var wsTrackTitle = wsTracks[wst].querySelector("title");
									if (trackTitle && wsTrackTitle && trackTitle.textContent != wsTrackTitle.textContent) {
										trackTitleCell.firstChild.setAttribute("title", "≠ " + trackTitle.textContent);
										trackTitleCell.firstChild.classList.add("name-variation");
									}
								}
								/* display recording/track length discrepency */
								trackLengthCell = tracks[t].querySelector("td:nth-child(" + lengthColumnIndex + ")");
								if (trackLengthCell) {
									var wsTrackLength = wsTracks[wst].querySelector("length");
									if (wsTrackLength && (wsTrackLength = time(wsTrackLength.textContent))) {
										if (wsTrackLength != wsRecordingLength) {
											trackLengthCell.replaceChild(
												createTag(
													"span", {a: { class: "name-variation", title: "≠ " + wsRecordingLength,}},
													document.createTextNode(wsTrackLength)
												),
												trackLengthCell.firstChild
											);
										}
									}
								}
								break;
							}
						}
					}
				}
			} else {
				coolBubble.error("Error " + this.status + (this.statusText ? " “" + this.statusText + "”" : "") + " while fetching inline track stuff.");
			}
		});
		xhr.addEventListener("error", function(event) {
			coolBubble.error("Error " + this.status + (this.statusText ? " “" + this.statusText + "”" : "") + " while fetching inline track stuff.");
		});
		coolBubble.info("Loading “" + document.querySelector("h1").textContent + "” shadow recording…");
		xhr.open("get", self.location.protocol + "//" + self.location.host + "/ws/2/recording/" + mbid + "?inc=releases+artist-credits+mediums", true);
		xhr.overrideMimeType("text/xml");
		xhr.send(null);
	}
}
function time(_ms) {
	var ms = typeof _ms == "string" ? parseInt(_ms, 10) : _ms;
	if (ms > 0) {
		var d = new Date(ms);
		return (d.getUTCHours() > 0 ? d.getUTCHours() + ":" : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() / 100).toFixed(2).slice(2) + (d.getUTCMilliseconds() > 0 ? "." + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2) : "");
	}
	return "?:??";
}
