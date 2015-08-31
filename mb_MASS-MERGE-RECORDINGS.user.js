"use strict";
var meta = function() {
// ==UserScript==
// @name         mb. MASS MERGE RECORDINGS
// @version      2015.8.31
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_MASS-MERGE-RECORDINGS.user.js
// @description  musicbrainz.org: Merges selected or all recordings from release A to release B
// @homepage     http://userscripts-mirror.org/scripts/show/120382
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey    tested sometimes
// @compatible   chromium(46)+tampermonkey   tested sometimes
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_MASS-MERGE-RECORDINGS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_MASS-MERGE-RECORDINGS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-12-13
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=70394&v=2015.8.27
// @grant        none
// @include      http*://*musicbrainz.org/release/*
// @include      http://*.mbsandbox.org/release/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @exclude      *.org/release/*/*
// @exclude      *.org/release/add
// @exclude      *.org/release/add?*
// @exclude      *.org/release/merge*
// @run-at       document-end
// ==/UserScript==
}; if (meta && meta.toString && (meta = meta.toString())) { meta = {n: meta.match(/@name\s+(.+)/)[1], v: meta.match(/@version\s+(.+)/)[1], ns: meta.match(/@namespace\s+(.+)/)[1]}; }
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
/* COLOURS */
var cOK = "greenyellow";
var cNG = "pink";
var cInfo = "gold";
var cWarning = "yellow";
var cMerge = "#fcc";
var cCancel = "#cfc";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
meta.n = meta.n.substr(4);
if (document.getElementsByClassName("account").length < 1) { return; }
var rythm = 1000;
var coolos = 2000;
var currentButt;
var KBD = {
	ENTER: 13,
	M:     77,
	O:     79,
	S:     83
};
var MMRid = "MMR2099userjs120382";
var MBS = location.protocol + "//" + location.host;
var sidebar = document.getElementById("sidebar");
var recid2trackIndex = {remote: {}, local: {}};/*recid:tracks index*/
var mergeQueue = [];/*contains next mergeButts*/
var sregex_MBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var regex_MBID = new RegExp(sregex_MBID, "i");
var css_track = "td:not(.pos):not(.video) > a[href^='" + MBS + "/recording/'], td:not(.pos):not(.video) > :not(div):not(.ars) a[href^='" + MBS + "/recording/']";
var css_track_ac = "td:not([class]) + td:not([class])";
var css_collapsed_medium = "div#content > table.tbl > thead > tr > th > a.expand-medium > span.expand-triangle";
var sregex_title = "[^“]+“(.+)” \\S+ (.+) - MusicBrainz";
var startpos, status, from, to, swap, editNote, queuetrack, queueAll;
var matchMode = {current: null, sequential: null, title: null, titleAndAC: null};
var rem2loc = "◀";
var loc2rem = "▶";
var retry = {count: 0};
document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
var css = document.styleSheets[document.styleSheets.length-1];
css.insertRule("body." + MMRid + " div#" + MMRid + " > .main-shortcut { display: none; }", 0);
css.insertRule("body." + MMRid + " div#content table.tbl > * > tr > .rating { display: none; }", 0);
css.insertRule("body." + MMRid + " div#content table.tbl > tbody > tr > td > div.ars { display: none; }", 0);
css.insertRule("body:not(." + MMRid + ") div#" + MMRid + " { margin-top: 12px; cursor: pointer; }", 0);
css.insertRule("body:not(." + MMRid + ") div#" + MMRid + " > :not(h2):not(.main-shortcut) { display: none; }", 0);
css.insertRule("body:not(." + MMRid + ") div#" + MMRid + " input[name='status'] { font-size: 9px!important; background-color: #fcf; }", 0);
css.insertRule("div#" + MMRid + " { background-color: #fcf; text-shadow: 1px 1px 2px #663; padding: 4px; margin: 0px -6px 12px; border: 2px dotted white; }", 0);
css.insertRule("div#" + MMRid + " > .main-shortcut { margin: 0px; }", 0);
css.insertRule("div#" + MMRid + " h2 { color: maroon; text-shadow: 2px 2px 4px #996; margin: 0px; }", 0);
css.insertRule("div#" + MMRid + " kbd { background-color: silver; border: 2px grey outset; padding: 0px 4px; font-size: .8em; }", 0);
var dtitle = document.title;
var ltitle = dtitle.match(new RegExp("^" + sregex_title + "$"));
var localRelease = {
	"release-group": document.querySelector("div.releaseheader > p.subheader a[href*='/release-group/']").getAttribute("href").match(regex_MBID)[0],
	title: ltitle[1],
	comment: document.querySelector("h1 > span.comment > bdi"),
	ac: ltitle[2],
	id: location.pathname.match(regex_MBID)[0],
	tracks: []
};
var safeLengthDelta = 4;
if (localRelease.comment) localRelease.comment = " (" + localRelease.comment.textContent + ")"; else localRelease.comment = "";
var remoteRelease = {tracks: []};
sidebar.insertBefore(massMergeGUI(), sidebar.querySelector("h2.collections"));
var collapsedMediums = document.querySelectorAll(css_collapsed_medium);
if (collapsedMediums.length > 1) {
	var tracklistHeader = document.querySelector("h2.tracklist");
	if (tracklistHeader) {
		tracklistHeader.appendChild(createTag("span", {a: {title: "by and for " + meta.n}, s: {color: "#999", opacity: ".5"}}, [" (", createTag("a", {a: {ref: "▶"}}, "expand"), "/", createTag("a", {a: {ref: "▼"}}, "collapse"), " all mediums)"]));
		tracklistHeader.addEventListener("click", function(event) { if (event.target.tagName == "A") expandCollapseAllMediums(event.target.getAttribute("ref")); });
	}
}
document.body.addEventListener("keydown", function(event) {
	if (event.ctrlKey && event.shiftKey && event.keyCode == KBD.M) {
		prepareLocalRelease();
		return stop(event);
	}
});
//	sidebar.querySelector("h2.editing + ul.links").insertBefore(createTag("li", {}, [createTag("a", {}, meta.n)]), sidebar.querySelector("h2.editing + ul.links li"));
/* TODO before step 1, check
<form action="MBS/recording/merge" method="post">
<input type="radio" name="merge.target" value="1ST-ID"
<input type="radio" name="merge.target" value="2ND-ID"
after step 1, check
on target recording page
optionnally has <a href="MBS/edit/(\d+)">edit</a> \(#(\d+)\)
	where $1 == $2 (otherwise, another page has taken this notice but NP) */
function mergeRecsStep(_step) {
	var step = _step || 0;
	var MMR = document.getElementById(MMRid);
	var statuses = ["adding recs. to merge", "applying merge edit"];
	var buttStatuses = ["Stacking…", "Merging…"];
	var urls = ["/recording/merge_queue", "/recording/merge"];
	var params = [
		"add-to-merge=" + to.value + "&add-to-merge=" + from.value,
		"merge.merging.0=" + to.value + "&merge.target=" + to.value + "&merge.merging.1=" + from.value
	];
	disableInputs([matchMode.sequential, matchMode.title, matchMode.titleAndAC, startpos, status]);
	if (step == 1) {
		disableInputs(editNote);
		params[step] += "&merge.edit_note=";
		var paramsup = MMR.getElementsByTagName("textarea")[0].value.trim();
		if (paramsup != "") paramsup += "\n —\n";
		paramsup += releaseInfoRow("source", swap.value == "no" ? remoteRelease : localRelease, swap.value == "no" ? recid2trackIndex.remote[from.value] : recid2trackIndex.local[from.value]);
		paramsup += releaseInfoRow("target", swap.value == "no" ? localRelease : remoteRelease, swap.value == "no" ? recid2trackIndex.local[to.value] : recid2trackIndex.remote[to.value]);
		paramsup += " —\n";
		var targetID = parseInt(to.value, 10);
		var sourceID = parseInt(from.value, 10);
		if (sourceID > targetID) {
			paramsup += "👍 '''Targetting oldest [MBID]''' (" + format(to.value) + " ← " + format(from.value) + ")" + "\n";
		}
		var locTrack = localRelease.tracks[recid2trackIndex.local[swap.value == "no" ? to.value : from.value]];
		var remTrack = remoteRelease.tracks[recid2trackIndex.remote[swap.value == "no" ? from.value : to.value]];
		if (locTrack.name == remTrack.name) paramsup += "👍 '''Same track title''' “" + protectEditNoteText(locTrack.name) + "”\n";
		else if (locTrack.name.toUpperCase() == remTrack.name.toUpperCase()) paramsup += "👍 '''Same track title''' (case insensitive)\n";
		else if (almostSame(locTrack.name, remTrack.name)) paramsup += "👍 '''Similar track title''' (loose comparison)\n";
		if (locTrack.artistCredit == remTrack.artistCredit) paramsup += "👍 '''Same track artist credit ([AC])''' “" + html2text(locTrack.artistCredit) + "”\n";
		else if (html2text(locTrack.artistCredit).toUpperCase() == html2text(remTrack.artistCredit).toUpperCase()) paramsup += "👍 '''Same track artist credit ([AC])''' (case insensitive)\n";
		else if (almostSame(html2text(locTrack.artistCredit), html2text(remTrack.artistCredit))) paramsup += "👍 '''Similar track artist credit ([AC])''' “" + html2text(locTrack.artistCredit) + "”\n";
		if (typeof locTrack.length == "number" && typeof remTrack.length == "number") {
			var delta = Math.abs(locTrack.length - remTrack.length);
			if (delta <= safeLengthDelta*1000) paramsup += "👍 '''" + (delta == 0 ? "Same" : "Very close") + " track times''' " + /*temporary hidden until milliseconds are back(delta == 0 ? "(in milliseconds)" : */ "(" + (time(locTrack.length) == time(remTrack.length) ? time(locTrack.length) : "within " + safeLengthDelta + " seconds: " + time((swap.value == "no" ? locTrack : remTrack).length) + " ← " + time((swap.value == "no" ? remTrack : locTrack).length)) + ")" /*)temporary*/ + "\n";
		}
		if (localRelease.ac == remoteRelease.ac) paramsup += "👍 '''Same release artist''' “" + protectEditNoteText(localRelease.ac) + "”\n";
		if (localRelease.title == remoteRelease.title) paramsup += "👍 '''Same release title''' “" + protectEditNoteText(localRelease.title) + "”\n";
		else if (localRelease.title.toUpperCase() == remoteRelease.title.toUpperCase()) paramsup += "👍 '''Same release title''' (case insensitive)\n";
		else if (almostSame(localRelease.title, remoteRelease.title)) paramsup += "👍 '''Almost same release title''' (loose comparison)\n";
		if (localRelease["release-group"] == remoteRelease["release-group"]) paramsup += "👍 '''Same release group''' (" + MBS + "/release-group/" + localRelease["release-group"] + ")\n";
		paramsup += " —\n" + meta.n + " (" + meta.v + ") in “" + matchMode.current.value.replace(/^Match unordered /i, "") + "” match mode";
		if (retry.count > 0) {
			paramsup += " — '''retry'''" + (retry.count > 1 ? " #" + retry.count : "") + " (" + protectEditNoteText(retry.message) + ")";
		}
		params[step] += encodeURIComponent(paramsup);
	}
	infoMerge("#" + from.value + " to #" + to.value + " " + statuses[step] + "…");
	currentButt.setAttribute("value", buttStatuses[step] + " " + (step + 1) + "/2");
	var xhr = new XMLHttpRequest();
	function releaseInfoRow(sourceOrTarget, rel, trackIndex) {
		return sourceOrTarget + ": " + MBS + "/release/" + rel.id + " #'''" + (trackIndex + 1) + "'''/" + rel.tracks.length + ". “'''" + protectEditNoteText(rel.title) + "'''”" + protectEditNoteText(rel.comment) + " by '''" + protectEditNoteText(rel.ac) + "'''\n";
	}
	xhr.onreadystatechange = function(event) {
		if (this.readyState == 4) {
			if (this.status == 200) {
				if (step < 1) {
					mergeRecsStep(step + 1);
				} else {
					var editID = this.responseText.match(new RegExp("<a href=\"" + MBS + "/edit/(\\d+)\">edit</a> \\(#(\\d+)\\)"));
					if (editID && editID[1] == editID[2]) {
						remoteRelease.tracks[recid2trackIndex.remote[swap.value == "no" ? from.value : to.value]].recording.editsPending++;
						cleanTrack(localRelease.tracks[recid2trackIndex.local[swap.value == "no" ? to.value : from.value]], editID[1], retry.count);
						infoMerge("#" + from.value + " to #" + to.value + " merged OK", true, true);
						retry.count = 0;
						currentButt = null;
						document.title = dtitle;
						updateMatchModeDisplay();
						enableInputs([status, editNote]);
						var nextButt = mergeQueue.shift();
						if (nextButt) {
							FireFoxWorkAround(nextButt);
						} else {
							var x = scrollX, y = scrollY;
							startpos.focus();
							scrollTo(x, y);
						}
					} else {
						retry.count++;
						retry.message = "Merge edit not found";
						tryAgain(retry.message);
					}
				}
			} else {
				retry.count++;
				retry.message = "Error " + this.status + ": " + this.statusText;
				tryAgain("Error " + this.status + ", step " + (step + 1) + "/2.");
			}
		}
	};
	xhr.open("POST", urls[step], true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", params[step].length);
	xhr.setRequestHeader("Connection", "close");
	setTimeout(function(){ xhr.send(params[step]); }, rythm);
}
function tryAgain(errorText) {
	var errormsg = errorText;
	if (currentButt) {
		errormsg += " Retry in " + Math.ceil(coolos / 1000) + " seconds.";
		setTimeout(function() {
			FireFoxWorkAround(currentButt);
		}, coolos);
	}
	infoMerge(errormsg, false, true);
}
function FireFoxWorkAround(butt) {
	enableInputs(butt);
	if (navigator.userAgent.match(/firefox/i)) {
		butt.setAttribute("value", "FF delay…");
		setTimeout(function() { butt.click(); }, 1000);
	} else { butt.click(); }
}
function infoMerge(msg, goodNews, reset) {
	status.value = msg;
	if (goodNews != null) { status.style.setProperty("background-color", goodNews ? cOK : cNG); }
	else { status.style.setProperty("background-color", cInfo); }
	if (reset) {
		from.value = "";
		to.value = "";
	}
}
function queueTrack() {
	queuetrack.replaceChild(document.createTextNode(mergeQueue.length + " queued merge" + (mergeQueue.length > 1 ? "s" : "")), queuetrack.firstChild);
	queuetrack.style.setProperty("display", mergeQueue.length > 0 ? "block" : "none");
	document.title = (mergeQueue.length + 1) + "⌛ " + dtitle;
}
function cleanTrack(track, editID, retryCount) {
	var rmForm = track.tr.querySelector("td:not(.pos):not(.video) form." + MMRid);
	if (rmForm) {
		if (editID) {
			mp(track.tr.querySelector(css_track), true);
			removeChildren(rmForm);
			var newEditLink = createA("edit:" + editID, "/edit/" + editID);
			addAfter(createTag("span", {s: {opacity: ".5"}}, [" (", newEditLink, ")"]), rmForm);
			if (typeof retryCount == "number" && retryCount > 0) {
				var retryLabel = "retr";
				if (retryCount > 1 ) {
					retryLabel = retryCount + " " + retryLabel + "ies";
				} else {
					retryLabel += "y";
				}
				addAfter(createA(retryLabel, track.a.getAttribute("href") + "/edits"), newEditLink);
			}
			mp(newEditLink, true);
			addAfter(document.createTextNode(" "), rmForm);
		} else {
			removeNode(rmForm);
		}
	} else {
		var lengthcell = track.tr.querySelector("td.treleases");
		if (track.length && lengthcell) {
			lengthcell.replaceChild(document.createTextNode(time(track.length, true)), lengthcell.firstChild);
			lengthcell.style.setProperty("font-family", "monospace");
		}
	}
}
function changeMatchMode(event) {
	matchMode.current = event.target;
	updateMatchModeDisplay();
	if (matchMode.current == matchMode.sequential) {
		spreadTracks(event);
	} else {
		var matchedRemoteTracks = [];
		for (var loc = 0; loc < localRelease.tracks.length; loc++) {
			cleanTrack(localRelease.tracks[loc]);
			var rem = bestStartPosition(loc, matchMode.current == matchMode.titleAndAC);
			if (rem !== null) {
				var rem = 0 - rem + loc;
				if (matchedRemoteTracks.indexOf(rem) < 0) {
					matchedRemoteTracks.push(rem);
					buildMergeForm(loc, rem);
				}
			}
		}
		var notMatched = remoteRelease.tracks.length - matchedRemoteTracks.length;
		infoMerge((notMatched == 0 ? "All" : "☞") + " " + matchedRemoteTracks.length + " remote track title" + (matchedRemoteTracks.length == 1 ? "" : "s") + " matched" + (notMatched > 0 ? " (" + notMatched + " left)" : ""), matchedRemoteTracks.length > 0);
		if (matchedRemoteTracks.length > 0) {
			queueAll.focus();
		}
	}
}
function updateMatchModeDisplay() {
	for (var mode in matchMode) if (matchMode.hasOwnProperty(mode)) {
		disableInputs(matchMode[mode], matchMode[mode] == matchMode.current);
	}
	enableInputs(startpos, matchMode.sequential == matchMode.current);
}
function massMergeGUI() {
	var MMRdiv = createTag("div", {a: {id: MMRid}, e: {
		keydown: function(event) {
			if (event.keyCode == KBD.ENTER && (event.target == startpos || event.target == editNote && event.ctrlKey)) {
				queueAll.click();
			} else if (event.target == editNote && event.ctrlKey) {
				switch (event.keyCode) {
					case KBD.S:
						return saveEditNote(event);
					case KBD.O:
						return loadEditNote(event);
				}
			}
		},
		click: prepareLocalRelease
	}}, [
		createTag("h2", {}, meta.n),
		createTag("p", {}, "version " + meta.v),
		createTag("p", {a: {"class": "main-shortcut"}}, ["☞ ", createTag("kbd", {}, "CTRL"), " + ", createTag("kbd", {}, "SHIFT"), "+", createTag("kbd", {}, "M")]),
		createTag("p", {s: {marginBottom: "0px!"}}, ["Remote release", createTag("span", {a: {"class": "remote-release-link"}}), ":"]),
	]);
	status = MMRdiv.appendChild(createInput("text", "status", "", meta.n + " remote release URL"));
	status.style.setProperty("width", "100%");
	status.addEventListener("input", function(event) {
		matchMode.current = matchMode.sequential;
		updateMatchModeDisplay();
		var mbid = this.value.match(new RegExp("/release/(" + sregex_MBID + ")(/disc/(\\d+))?"));
		if (mbid) {
			localRelease.tracks = [];
			recid2trackIndex.local = {};
			removeChildren(startpos);
			var trs = document.querySelectorAll("div#content > table.tbl > tbody > tr");
	//		var jsonRelease, scripts = document.querySelectorAll("script:not([src])");
	//		for (var s = 0; s < scripts.length && !jsonRelease; s++) {
	//			jsonRelease = scripts[s].textContent.match(/MB\.Release\.init\(([^<]+)\)/);
	//		}
	//		if (jsonRelease) jsonRelease = JSON.parse(jsonRelease[1]);
			for (var itrs = 0, t = 0, d = 0, dt = 0; itrs < trs.length; itrs++) {
				if (!trs[itrs].classList.contains("subh")) {
					var tracka = trs[itrs].querySelector(css_track);
					var recoid = trs[itrs].querySelector("td.rating a.set-rating").getAttribute("href").match(/id=([0-9]+)/)[1];
					var trackname = tracka.textContent;
					var trackLength = trs[itrs].querySelector("td.treleases").textContent.match(/(\d+:)?\d+:\d+/);
					if (trackLength) trackLength = strtime2ms(trackLength[0]);
					var trackAC = trs[itrs].querySelector(css_track_ac);
					localRelease.tracks.push({
						tr: trs[itrs],
						disc: d,
						track: dt,
						a: tracka,
						recid: recoid,
						name: trackname,
						artistCredit: trackAC ? trackAC.innerHTML.trim() : localRelease.ac,
						length: trackLength
					});
	//				if (jsonRelease) {
	////					localRelease.tracks[localRelease.tracks.length-1] = jsonRelease.mediums[d-1].tracks[dt];
	//					for (var key in jsonRelease.mediums[d-1].tracks[dt]) if (jsonRelease.mediums[d-1].tracks[dt].hasOwnProperty(key)) {
	//						localRelease.tracks[localRelease.tracks.length-1][key] = jsonRelease.mediums[d-1].tracks[dt][key];
	//					}
	//				}
					dt++;
					recid2trackIndex.local[recoid] = t;
					addOption(startpos, t, d + "." + (dt < 10 ? " " : "") + dt + ". " + trackname);
					t++;
				} else if (!trs[itrs].querySelector("div.data-track")) {
					d++; dt = 0;
				}
			}
			this.setAttribute("ref", this.value);
			remoteRelease.id = mbid[1];
			remoteRelease.disc = mbid[2] || "";
			infoMerge("Fetching recordings…");
			loadReleasePage();
			loadReleaseWS();
		}
	});
	MMRdiv.appendChild(createTag("p", {}, "Once you paste the remote release URL or MBID, all its recordings will be loaded and made available for merge with the local recordings in the left hand tracklist."));
	MMRdiv.appendChild(createTag("p", {}, "Herebelow, you can shift the alignement of local and remote tracklists."));
	MMRdiv.appendChild(createTag("p", {s: {marginBottom: "0px"}}, "Start position:"));
	/*track parsing*/
	startpos = MMRdiv.appendChild(createTag("select", {s: {fontSize: ".8em", width: "100%"}, e: {change: function(event) {
		/* hitting ENTER on a once changed <select> triggers onchange even if no recent change */
		if (this.getAttribute("previousValue") != this.value) {
			this.setAttribute("previousValue", this.value);
			if (remoteRelease.id && remoteRelease.tracks.length > 0) {
				spreadTracks(event);
			} else {
				status.focus();
			}
		}
	}}}));
	if (navigator.userAgent.match(/firefox/i)) startpos.addEventListener("keyup", function(event) {
		if (event.keyCode != KBD.ENTER) {
			this.blur();
			this.focus();
		}
	});
	MMRdiv.appendChild(createTag("p", {}, ["☞ ", createTag("kbd", {}, "↑"), " / ", createTag("kbd", {}, "→"), " / ", createTag("kbd", {}, "↓"), " / ", createTag("kbd", {}, "←"), ": shift up/down", document.createElement("br"), "☞ ", createTag("kbd", {}, "ENTER"), ": queue all"]));
	matchMode.sequential = createInput("button", "", "Sequential");
	matchMode.sequential.setAttribute("title", "Restore remote tracks order");
	matchMode.sequential.addEventListener("click", changeMatchMode);
	matchMode.title = createInput("button", "", "Match unordered track titles");
	matchMode.title.setAttribute("title", "Find matching local title for each remote title");
	matchMode.title.addEventListener("click", changeMatchMode);
	matchMode.titleAndAC = createInput("button", "", "Match unordered track titles and artist credits");
	matchMode.titleAndAC.setAttribute("title", "Find matching local title for each remote title with same artist credit");
	matchMode.titleAndAC.addEventListener("click", changeMatchMode);
	matchMode.current = matchMode.sequential;
	disableInputs(matchMode.sequential);
	MMRdiv.appendChild(createTag("p", {}, [matchMode.sequential, matchMode.title, matchMode.titleAndAC]));
	MMRdiv.appendChild(createTag("p", {s: {marginBottom: "0px"}}, "Merge edit notes:"));
	editNote = MMRdiv.appendChild(createInput("textarea", "merge.edit_note"));
	var lastEditNote = (localStorage && localStorage.getItem(MMRid));
	if (lastEditNote) {
		editNote.appendChild(document.createTextNode(lastEditNote));
		editNote.style.setProperty("background-color", cOK);
		editNote.selectionEnd = 0;
	}
	editNote.style.setProperty("width", "100%");
	editNote.setAttribute("rows", "5");
	editNote.addEventListener("input", function(event) {
		this.style.removeProperty("background-color");
		this.removeAttribute("title");
	});
	var saveEditNoteButt = createInput("button", "", "Save edit note");
	saveEditNoteButt.setAttribute("tabindex", "-1");
	saveEditNoteButt.setAttribute("title", "Save edit note text to local storage for next time");
	saveEditNoteButt.addEventListener("click", saveEditNote);
	var loadEditNoteButt = createInput("button", "", "Load edit note");
	loadEditNoteButt.setAttribute("tabindex", "-1");
	loadEditNoteButt.setAttribute("title", "Reload edit note text from local storage");
	loadEditNoteButt.addEventListener("click", loadEditNote);
	MMRdiv.appendChild(createTag("p", {}, ["☞ ", createTag("kbd", {}, "CTRL"), "+", createTag("kbd", {}, "ENTER"), ": queue all", document.createElement("br"), "☞ ", createTag("kbd", {}, "CTRL"), "+", createTag("kbd", {}, "S"), ": ", saveEditNoteButt, document.createElement("br"), "☞ ", createTag("kbd", {}, "CTRL"), "+", createTag("kbd", {}, "O"), ": ", loadEditNoteButt]));
	MMRdiv.appendChild(createTag("p", {}, "Each recording merge will automatically target the oldest, unless direction is manually changed by clicking each arrow button or below batch button."));
	from = MMRdiv.appendChild(createInput("hidden", "from", ""));
	to = MMRdiv.appendChild(createInput("hidden", "to", ""));
	swap = MMRdiv.appendChild(createInput("hidden", "swap", "yes"));
	var changeAllDirButt = createInput("button", "", "Change all merge targets to " + (swap.value == "no" ? "remote" : "local"));
	changeAllDirButt.style.setProperty("background-color", cOK);
	changeAllDirButt.addEventListener("click", function(event) {
		var allbutts = document.querySelectorAll("input." + MMRid + "dirbutt:not([disabled])");
		var direction = this.value.match(/local/) ? rem2loc : loc2rem;
		for (var iab = 0; iab < allbutts.length; iab++) if (allbutts[iab].value != direction) allbutts[iab].click();
		swap.value = direction == rem2loc ? "no" : "yes";
		this.value = this.value.replace(/\w+$/, swap.value == "no" ? "remote" : "local");
		this.style.setProperty("background-color", swap.value == "no" ? cInfo : cOK);
	});
	var resetAllDirButt = createInput("button", "", "Reset all merge directions to oldest");
	resetAllDirButt.addEventListener("click", function(event) {
		var allbutts = document.querySelectorAll("input." + MMRid + "dirbutt:not([disabled])");
		for (var iab = 0; iab < allbutts.length; iab++) {
			var remoteRowID = parseInt(allbutts[iab].parentNode.querySelector("input[name='merge.merging.1']").value, 10);
			var localRowID = parseInt(allbutts[iab].parentNode.querySelector("input[name='merge.merging.0']").value, 10);
			if (remoteRowID > localRowID && allbutts[iab].value == loc2rem || remoteRowID < localRowID && allbutts[iab].value == rem2loc) {
				allbutts[iab].click();
			}
		}
	});
	MMRdiv.appendChild(createTag("p", {}, [changeAllDirButt, resetAllDirButt]));
	MMRdiv.appendChild(createTag("p", {}, "You can add/remove recordings to/from the merge queue by clicking their merge buttons or add them all at once with the button below."));
	queueAll = createInput("button", "", "Merge all found recordings");
	queueAll.setAttribute("ref", queueAll.value);
	queueAll.style.setProperty("background-color", cMerge);
	queueAll.addEventListener("click", function(event) {
		var allbutts = document.getElementsByClassName(MMRid + "mergebutt");
		for (var iab = 0; iab < allbutts.length; iab++) {
			if (allbutts[iab].value == "Merge") allbutts[iab].click();
		}
	});
	var emptyQueueButt = createInput("button", "", "Empty merge queue");
	emptyQueueButt.style.setProperty("background-color", cCancel);
	emptyQueueButt.addEventListener("click", function(event) {
		if (mergeQueue.length > 0) {
			while (mergeQueue.length > 0) {
				var unqueuedbutt = mergeQueue.shift()
				unqueuedbutt.style.setProperty("background-color", cMerge);
				enableInputs(unqueuedbutt);
				unqueuedbutt.value = "Merge";
			}
			queueTrack();
		}
	});
	MMRdiv.appendChild(createTag("p", {}, [queueAll, emptyQueueButt]));
	queuetrack = MMRdiv.appendChild(createTag("div", {s: {textAlign: "center", backgroundColor: cInfo, display: "none"}}, "\u00A0"));
	return MMRdiv;
}
function loadReleasePage() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("error", function() { infoMerge("Error #" + this.status + ": " + this.statusText, false); });
	xhr.addEventListener("load", function(event) {
		if (this.status == 200) {
			var releaseWithoutARs = this.responseText.replace(/<dl class="ars">[\s\S]+?<\/dl>/g, "");
			var recIDx5 = releaseWithoutARs.match(/entity_id=\d+[^"]*entity_type=recording|entity_type=recording[^"]*entity_id=\d+/g);
			var trackRows = releaseWithoutARs.match(/<tr class="(even|odd)" id="[-\da-z]{36}">[\s\S]+?<td class="treleases">[\s\S]+?<\/tr>/g);
			var trackInfos = releaseWithoutARs.match(new RegExp("<a href=\"" + MBS + "/recording/" + sregex_MBID + "\"( title=\"[^\"]*\")?><bdi>[^<]*</bdi></a>", "g"));
			var trackTimes = releaseWithoutARs.match(/<td class="treleases">[^<]*<\/td>/g);
			var rtitle = releaseWithoutARs.match(new RegExp("<title>" + sregex_title + "</title>"));
			var releaseAC = releaseWithoutARs.match(/\s+Release by (<.+>)/);
			var discount = releaseWithoutARs.match(/<a class="expand-medium"/g).length;
			if (recIDx5 && trackInfos && trackTimes && rtitle) {
				var recIDs = [];
				for (var i5 = 0; i5 < recIDx5.length; i5 += 5) {
					recIDs.push(recIDx5[i5].match(/id=([0-9]+)/)[1]);
				}
				remoteRelease["release-group"] = releaseWithoutARs.match(/\((?:<span[^>]*>)?<a href=".*\/release-group\/([^"]+)">(?:<bdi>)?[^<]+(?:<\/bdi>)?<\/a>(?:<\/span>)?\)/)[1];
				remoteRelease.title = decodeHTMLEntities(rtitle[1]);
				remoteRelease.comment = releaseWithoutARs.match(/<h1>.+<span class="comment">\(<bdi>([^<]+)<\/bdi>\)<\/span><\/h1>/);
				if (remoteRelease.comment) remoteRelease.comment = " (" + decodeHTMLEntities(remoteRelease.comment[1]) + ")"; else remoteRelease.comment = "";
				remoteRelease.ac = rtitle[2];
				var mbidInfo = document.getElementById(MMRid).querySelector(".remote-release-link");
				removeChildren(mbidInfo);
				mbidInfo.setAttribute("title", remoteRelease.id + remoteRelease.disc);
				if (remoteRelease.id == localRelease.id) {
					mbidInfo.appendChild(document.createTextNode(" (same" + (remoteRelease.disc ? ", " + remoteRelease.disc.substr(1).replace(/\//, "\u00a0") + "/" + discount : "") + ")"));
				} else {
					mbidInfo.appendChild(document.createTextNode(" “"));
					mbidInfo.appendChild(createA(remoteRelease.id == localRelease.id ? "same" : remoteRelease.title, "/release/" + remoteRelease.id));
					mbidInfo.appendChild(document.createTextNode("”" + remoteRelease.comment));
					if (remoteRelease.disc) {
						mbidInfo.appendChild(createTag("fragment", null, [" (", createA(remoteRelease.disc.substr(1).replace(/\//, "\u00a0"), "/release/" + remoteRelease.id + remoteRelease.disc + "#" + remoteRelease.disc.replace(/\//g, "")),  "/" + discount + ")"]));
					}
				}
				remoteRelease.tracks = [];
				for (var t = 0; t < recIDs.length; t++) {
					var trackLength = trackTimes[t].match(/(\d+:)?\d+:\d+/);
					if (trackLength) trackLength = strtime2ms(trackLength[0]);
					remoteRelease.tracks.push({
						number: trackRows[t].match(new RegExp("<td class=\"pos[\\s\\S]+?<a href=\"" + MBS + "/track/" + sregex_MBID + "\">(.*?)</a>"))[1],
						name: decodeHTMLEntities(trackInfos[t].match(/<bdi>([^<]*)<\/bdi>/)[1]),
						artistCredit: trackRows[t].match(/<td>/g).length>1?trackRows[t].match(/[\s\S]*<td>([\s\S]+?)<\/td>/)[1].trim():releaseAC[1],
						length: trackLength,
						recording: {
							rowid: recIDs[t],
							id: trackInfos[t].match(/\/recording\/([^"]+)/)[1],
							video: trackRows[t].match(/<td[^>]+?is-video/),
							editsPending: 0
						},
						isDataTrack: false
					});
					recid2trackIndex.remote[recIDs[t]] = t;
				}
//									for (var rd = 0; rd < jsonRelease.mediums.length; rd++) {
//										for (var rt = 0; rt < jsonRelease.mediums[rd].tracks.length; rt++) {
//											remoteRelease.tracks.push(jsonRelease.mediums[rd].tracks[rt]);
//											recid2trackIndex.remote[jsonRelease.mediums[rd].tracks[rt].recording.rowid] = remoteRelease.tracks.length - 1;
//										}
//									}
//									jsonRelease = null;/*maybe it frees up memory*/
				/*(re)build negative startpos*/
				var negativeOptions = startpos.querySelectorAll("option[value^='-']");
				for (var nopt = 0; nopt < negativeOptions.length; nopt++) {
					removeNode(negativeOptions[nopt]);
				}
				for (var rtrack = 0; rtrack < remoteRelease.tracks.length-1; rtrack++) {
					addOption(startpos, 0-rtrack-1, 0-rtrack-1, true);
				}
				startpos.value = bestStartPosition() || 0;
				spreadTracks(event);
			} else if(discount > 10) {
				var disc = prompt("This release has " + discount + " discs.\n11+ disc releases can only be used as local release.\nDo you want to load one of its mediums?\n\nNext time you can directly paste the medium link (" + MBS + "/release/" + remoteRelease.id + "/disc/1).", "1");
				if (disc && disc.match(/^\d+$/) && disc > 0 && disc <= discount) {
					remoteRelease.disc = "/disc/" + disc;
					loadReleasePage();
				} else {
					infoMerge("Disc number out of bounds (1–" + discount + ") or unreadable.", false);
				}
			}
		} else {
			infoMerge("This is not a valid release", false);
		}
	});
	xhr.open("GET", "/release/" + remoteRelease.id + remoteRelease.disc, true);
	xhr.send(null);
}
function bestStartPosition(localTrack, matchAC) {
	var singleTrackMode = typeof localTrack != "undefined";
	for (var loc = singleTrackMode ? localTrack : 0; loc < (singleTrackMode ? localTrack + 1 : localRelease.tracks.length); loc++) {
		for (var rem = 0; rem < remoteRelease.tracks.length; rem++) {
			if (
				almostSame(localRelease.tracks[loc].name, remoteRelease.tracks[rem].name)
				&& (!matchAC || almostSame(html2text(localRelease.tracks[loc].artistCredit), html2text(remoteRelease.tracks[rem].artistCredit)))
			) {
				return loc - rem;
			}
		}
	}
	return null;
}
function loadReleaseWS(mbid) {
}
function spreadTracks(event) {
	var rtrack = startpos.value < 0 ? 0 - startpos.value : 0;
	for (var ltrack = 0; ltrack < localRelease.tracks.length; ltrack++) {
		cleanTrack(localRelease.tracks[ltrack]);
		if(ltrack >= startpos.value && rtrack < remoteRelease.tracks.length) {
			var ntitl = "local recording #" + format(localRelease.tracks[ltrack].recid);
			var ntit = localRelease.tracks[ltrack].a.getAttribute("title");
			if (!ntit || (ntit && !ntit.match(new RegExp(ntitl)))) {
				localRelease.tracks[ltrack].a.setAttribute("title", (ntit ? ntit + " — " : "") + ntitl);
			}
			buildMergeForm(ltrack, rtrack);
			rtrack++;
		}
	}
	var mergebutts = document.getElementsByClassName(MMRid + "mergebutt").length;
	var outOfView = Math.max(0, parseInt(startpos.value, 10) + remoteRelease.tracks.length - localRelease.tracks.length);
	if (startpos.value < 0) outOfView -= startpos.value;
	infoMerge("☞ " + mergebutts + " recording" + (mergebutts == 1 ? "" : "s") + " ready to merge" + (outOfView > 0 ? " (" + outOfView + " out of view)" : ""), mergebutts > 0);
	disableInputs(queueAll, mergebutts < 1);
	if (mergebutts > 0 || !event || !event.type || event.type != "load") startpos.focus();
}
function buildMergeForm(loc, rem) {
	var locTrack = localRelease.tracks[loc];
	var remTrack = remoteRelease.tracks[rem];
	var rmForm = document.createElement("form");
	rmForm.setAttribute("action", "/recording/merge");
	rmForm.setAttribute("method", "post");
//		rmForm.setAttribute("title", "AC: " + ac2str(remTrack.artistCredit) + "\nremote recording #" + remTrack.recording.rowid);
	rmForm.setAttribute("title", "remote recording #" + format(remTrack.recording.rowid));
	rmForm.setAttribute("class", MMRid);
	rmForm.style.setProperty("display", "inline");
	rmForm.appendChild(createInput("hidden", "merge.merging.0", locTrack.recid));
	rmForm.appendChild(createInput("hidden", "merge.target", locTrack.recid));
	rmForm.appendChild(createInput("hidden", "merge.merging.1", remTrack.recording.rowid));
	rmForm.appendChild(createInput("hidden", "merge.edit_note", "mass rec merger"));
	if (remTrack.recording.rowid != locTrack.recid) {
		rmForm.style.setProperty("background-color", cWarning);
		var dirButt = rmForm.appendChild(createInput("button", "direction", swap.value == "no" ? rem2loc : loc2rem));
		dirButt.setAttribute("class", MMRid + "dirbutt");
		dirButt.style.setProperty("background-color", swap.value == "no" ? cOK : cInfo);
		dirButt.style.setProperty("padding", "0 1em .5em 1em");
		dirButt.style.setProperty("margin", "0 4px");
		dirButt.addEventListener("click", function(event) {
			this.value = this.value == rem2loc ? loc2rem : rem2loc;
			this.style.setProperty("background-color", this.value == rem2loc ? cOK : cInfo);
		});
		var remrec = rmForm.appendChild(createA(remTrack.number + ". “", "/recording/" + remTrack.recording.id));
		if (remTrack.isDataTrack) {
			remrec.parentNode.insertBefore(MBicon("data-track icon img"), remrec);
		}
		if (remTrack.recording.video) {
			remrec.parentNode.insertBefore(MBicon("video is-video icon img"), remrec);
		}
		var rectitle = remrec.appendChild(document.createElement("span"));
		rectitle.appendChild(document.createTextNode(remTrack.name));
		remrec.appendChild(document.createTextNode("” "));
		if (almostSame(remTrack.name, locTrack.name)) {
			rectitle.style.setProperty("background-color", cOK);
			rectitle.setAttribute("title", "(almost) same title");
		}
		if (remTrack.recording.editsPending > 0) {
			remrec = mp(remrec, true);
		}
		var reclen = remrec.appendChild(document.createElement("span"));
		reclen.style.setProperty("float", "right");
		reclen.style.setProperty("font-family", "monospace");
		reclen.appendChild(document.createTextNode(" " + time(remTrack.length, true)));
		if (typeof locTrack.length == "number" && typeof remTrack.length == "number") {
			var delta = Math.abs(locTrack.length - remTrack.length);
			if (delta != false && delta > safeLengthDelta*1000) {
				if (delta >= 15*1000) {/*MBS-7417:MBS/lib/MusicBrainz/Server/Edit/Utils.pm*/
					reclen.style.setProperty("color", "red");
					reclen.style.setProperty("background-color", "black");
					reclen.setAttribute("title", "MORE THAN " + 15 + " SECONDS DIFFERENCE");
				} else {
					reclen.style.setProperty("background-color", cNG);
					reclen.setAttribute("title", "more than " + safeLengthDelta + " seconds difference");
				}
			} else {
				reclen.style.setProperty("background-color", delta&&delta > 500 ? cWarning : cOK);
			}
		}
		rmForm.appendChild(document.createTextNode(" by "));
//			rmForm.appendChild(ac2dom(remTrack.artistCredit));
		var AC = document.createElement("span");
		AC.innerHTML = remTrack.artistCredit;
		if (almostSame(html2text(locTrack.artistCredit), html2text(remTrack.artistCredit))) {
			for (var spanMp = AC.querySelectorAll("span.mp"), m = 0; m < spanMp.length; m++) {
				spanMp[m].classList.remove("mp");
			}
			AC.style.setProperty("background-color", cOK);
		}
		rmForm.appendChild(AC);
		var mergeButt = rmForm.appendChild(createInput("button", "", "Merge"));
		mergeButt.setAttribute("class", MMRid + "mergebutt");
		mergeButt.style.setProperty("background-color", cMerge);
		mergeButt.style.setProperty("float", "right");
		mergeButt.addEventListener("click", function(event) {
			disableInputs(this);
			var swapbutt = this.parentNode.getElementsByTagName("input")[4];
			disableInputs(swapbutt)
			this.style.setProperty("background-color", cInfo);
			var swapped = (swapbutt.value == loc2rem);
			var mergeFrom = this.parentNode.getElementsByTagName("input")[swapped ? 0 : 2].value;
			var mergeTo = this.parentNode.getElementsByTagName("input")[swapped ? 2 : 0].value;
			var queuedItem;
			if (from.value == "") {
				/* if no merge is ongoing, launch this merge */
				from.value = mergeFrom;
				to.value = mergeTo;
				swap.value = (swapped ? "yes" : "no");
				currentButt = this;
				mergeRecsStep();
			} else if (retry.count > 0 || mergeQueue.indexOf(this) == -1 && from.value != mergeFrom && to.value != mergeTo) {
				/* if a merge is ongoing or a retry is pending, queue this one */
				this.value = "Unqueue";
				enableInputs([this, swapbutt]);
				mergeQueue.push(this);
			} else if ((queuedItem = mergeQueue.indexOf(this)) > -1) {
				/* unqueue this one */
				mergeQueue.splice(queuedItem, 1);
				this.value = "Merge";
				enableInputs([this, swapbutt]);
				this.style.setProperty("background-color", cInfo);
			} else {
				/* shit happens */
				enableInputs([this, swapbutt]);
				this.style.setProperty("background-color", cWarning);
				this.value += " error?";
			}
			queueTrack();
		});
	} else {
		rmForm.style.setProperty("background-color", cCancel);
		rmForm.appendChild(document.createTextNode(" (same recording) "));
		rmForm.appendChild(createA(remTrack.name, locTrack.a.getAttribute("href")));
	}
	if (!locTrack.a.parentNode) {
		locTrack.a = locTrack.tr.querySelector(css_track);
	}
	var tracktd = getParent(locTrack.a, "td");
	var bestPos = tracktd.querySelector("td > span.mp");
	bestPos = bestPos ? bestPos : locTrack.a;
	var recdis = tracktd.querySelector("span.userjs81127recdis");
	if (recdis) { bestPos = recdis; }
	addAfter(rmForm, bestPos);
	if (remTrack.recording.rowid != locTrack.recid) {
		var remoteRowID = parseInt(remTrack.recording.rowid, 10);
		var localRowID = parseInt(locTrack.recid, 10);
		var dirbutt = rmForm.querySelector("input[type='button']." + MMRid + "dirbutt");
		if (remoteRowID > localRowID && dirbutt.value == loc2rem || remoteRowID < localRowID && dirbutt.value == rem2loc) {
			dirbutt.click();
		}
	}
}
function expandCollapseAllMediums(clickThis) {
	if (clickThis) for (var collapsedMediums = document.querySelectorAll(css_collapsed_medium), a = collapsedMediums.length-1; a >= 0; a--) {
		if (collapsedMediums[a].textContent.trim() == clickThis) {
			collapsedMediums[a].click();
		}
	}
}
function prepareLocalRelease() {
	expandCollapseAllMediums("▶");
	setTimeout(loadingAllMediums, 10);
}
function loadingAllMediums() {
	if (document.querySelector("table.tbl > tbody > tr > td > div.loading-message")) {
		setTimeout(loadingAllMediums, 200);
	} else {
		showGUI();
	}
}
function showGUI() {
	if (!document.body.classList.contains(MMRid)) {
		document.body.classList.add(MMRid);
		var MMRdiv = document.getElementById(MMRid);
		var tracklistTop = document.querySelector("h2.tracklist");
		if (tracklistTop && tracklistTop.offsetTop) {
			var margin = tracklistTop.offsetTop - startpos.offsetTop + MMRdiv.offsetTop;
			if (margin > 0) {
				MMRdiv.style.setProperty("margin-top", margin + "px");
			}
			tracklistTop.scrollIntoView();
		}
		MMRdiv.removeEventListener("click", prepareLocalRelease);
		var firstElements = [];
		for (var child = 0; sidebar.childNodes[child] != MMRdiv && child < sidebar.childNodes.length; child++) {
			firstElements.unshift(sidebar.childNodes[child]);
		}
		for (var elem = 0; elem < firstElements.length; elem++) {
			addAfter(sidebar.removeChild(firstElements[elem]), MMRdiv);
		}
	}
	status.focus();
}
function saveEditNote(event) {
	if (localStorage) {
		localStorage.setItem(MMRid, editNote.value);
		editNote.style.setProperty("background-color", cOK);
		editNote.setAttribute("title", "Saved to local storage");
	} else {
		editNote.style.setProperty("background-color", cInfo);
		editNote.setAttribute("title", "Could not save to local storage");
	}
	return stop(event);
}
function loadEditNote(event) {
	if (localStorage) {
		var savedEditNote = localStorage.getItem(MMRid);
		if (savedEditNote) {
			editNote.value = savedEditNote;
			editNote.style.setProperty("background-color", cOK);
			editNote.setAttribute("title", "Reloaded from local storage");
		}
	}
	return stop(event);
}
function createA(text, link) {
	var a = document.createElement("a");
	if (link) {
		a.setAttribute("href", link);
		a.setAttribute("target", "_blank");
	} else {
		a.style.setProperty("cursor", "pointer");
	}
	a.appendChild(document.createTextNode(text));
	return a;
}
function createInput(type, name, value, placeholder) {
	var input;
	if (type == "textarea") {
		input = createTag("textarea", {}, value);
	} else {
		input = createTag("input", {a: {type: type, value: value}});
	}
	if (placeholder) input.setAttribute("placeholder", placeholder);
	input.setAttribute("name", name);
	input.style.setProperty("font-size", ".8em");
	if (type == "text") {
		input.addEventListener("focus", function(event) {
			this.select();
		});
	}
	return input;
}
function addOption(select, value, text, insert) {
	var option = createTag("option", {a: {value: value}}, text);
	return insert&&select.firstChild ? select.insertBefore(option, select.firstChild) : select.appendChild(option);
}
function mp(o, set) {
	if (set == null || typeof set != "boolean") {
		return o.parentNode.tagName == "SPAN" && o.parentNode.classList.contains("mp");
	} else if (set && !mp(o)) {
		var smp = document.createElement("span");
		smp.className = "mp";
		o.parentNode.replaceChild(smp.appendChild(o.cloneNode(true)).parentNode, o);
		return smp.firstChild;
	} else if (!set && mp(o)) {
		o.parentNode.parentNode.replaceChild(o.cloneNode(true), o.parentNode)
	}
}
function strtime2ms(str) {/*temporary until WS available again*/
	var time = str.split(":");
	var ms = 0;
	for (var mult = 1; time.length > 0; ) {
		ms += time.pop() * mult * 1000;
		mult *= 60;
	}
	return ms;
}
function time(_ms, pad) {/*from 166877*/
	var ms = typeof _ms == "string" ? parseInt(_ms, 10) : _ms;
	if (ms > 0) {
		var d = new Date();
		d.setTime(ms);
		return /*milliseconds temporary hidden*/(d.getUTCHours() > 0 ? d.getUTCHours() + ":" : "") + (pad&&d.getMinutes() < 10 ? (d.getUTCHours() > 0 ? "0" : " ") : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()/* + (pad||d.getMilliseconds() > 0 ? "." + (d.getMilliseconds() < 100 ? "0" : "") + (d.getMilliseconds() < 10 ? "0" : "") + d.getMilliseconds() : "")*/;
	}
	return "?:??";
}
function format(number) {
	/* thanks to http://snipplr.com/view/72657/thousand-separator */
	return (number + "").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
}
function ac2str(ac) {
	var str = "";
	for (var c = 0; c < ac.length; c++) {
		str += ac[c].name + ac[c].joinPhrase;
	}
	return str;
}
function ac2dom(ac) {
	if (typeof ac == "string") return document.createTextNode(ac);
	var dom = document.createDocumentFragment();
	for (var c = 0; c < ac.length; c++) {
		var a = createA(ac[c].name, "/artist/" + ac[c].artist.id);
		if (ac[c].name != ac[c].artist.name) {
			a.setAttribute("title", ac[c].artist.name);
			a = document.createElement("span").appendChild(a).parentNode;
			a.className = "name-variation";
		}
		dom.appendChild(a);
		if (ac[c].joinPhrase != "") dom.appendChild(document.createTextNode(ac[c].joinPhrase));
	}
	return dom;
}
function html2text(html) {
	return html.replace(/<.+?>/g, "");
}
function protectEditNoteText(text) {
	return text.replace(/\'/g, "&#x0027;");
}
function MBicon(iconCss) {
	var icon = document.createElement("div");
	icon.className = iconCss;
	icon.style.setProperty("margin-right", "4px");
	return icon;
}
function almostSame(a, b) {
	return looseTitle(a) == looseTitle(b);
}
function looseTitle(title) {
	var genericTitle = fw2hw(title).toUpperCase();
	genericTitle = genericTitle.replace(/\b(AND|ET|VÀ)\b/g, "&");
	genericTitle = genericTitle.replace(/ⅰ/ig, "I").replace(/ⅱ/ig, "II").replace(/ⅲ/ig, "III").replace(/ⅳ/ig, "IV").replace(/ⅴ/ig, "V").replace(/ⅵ/ig, "VI").replace(/ⅶ/ig, "VII").replace(/ⅷ/ig, "VIII").replace(/ⅸ/ig, "IX").replace(/ⅹ/ig, "X").replace(/ⅺ/ig, "XI").replace(/ⅻ/ig, "XII");
	genericTitle = genericTitle.replace(/[\s\u0021-\u002f\u003a-\u003f\u005b-\u0060\u007b-\u00bf\u2000-\u2064\u2190-\u21ff\u2460-\u27ff\u2960-\u2b59\uff5e-\uff65]+|S\b|^(?:AN?|THE)\s+|,\s+(?:AN?|THE)$/g, "");
	return genericTitle;
}
function fw2hw(s) {
	return s.replace(/[\uff01-\uff5d]/g, function(a) {
		return String.fromCharCode(a.charCodeAt(0)-65248);
	}).replace(/\u3000/g, "\u0020").replace(/\uff5e/g, "\u301c");
}
var decoder = document.createElement("b");
function decodeHTMLEntities(str) {
	decoder.innerHTML = str;
	return decoder.textContent;
};
