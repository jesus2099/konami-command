// ==UserScript==
// @name         mb. MASS MERGE RECORDINGS
// @version      2024.10.16
// @description  musicbrainz.org: Merges selected or all recordings from release A to release B – List all RG recordings
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://community.metabrainz.org/t/merge-duplicate-recordings-between-two-editions-of-the-same-album-with-mb-mass-merge-recordings/203168?u=jesus2099
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_MASS-MERGE-RECORDINGS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-12-13; https://web.archive.org/web/20131103163401/userscripts.org/scripts/show/120382 / https://web.archive.org/web/20141011084015/userscripts-mirror.org/scripts/show/120382
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/c3758667354d3ad62c5fc72fa179e2cead9bc917/lib/CONTROL-POMME.js?version=2024.10.10
// @require      https://github.com/jesus2099/konami-command/raw/89dce29b9cce6e92e552f7d8ce2f5cb0ed161f2a/lib/MB-JUNK-SHOP.js?version=2024.10.13
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\/(disc\/\d+)?)?(\?tport=\d+)?(#.*)?$/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/release-group\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\?|$)/
// @run-at       document-end
// ==/UserScript==
"use strict";
let userjs = {
	id: "MMR2099userjs120382", // linked to mb_INLINE-STUFF
	name: GM_info.script.name.substr(4).replace(/\s/g, "\u00a0"),
	version: GM_info.script.version
};
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
/* COLOURS */
var cOK = "greenyellow";
var cNG = "pink";
var cInfo = "gold";
var cWarning = "yellow";
var cMerge = "#fcc";
var cCancel = "#cfc";
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var safeLengthDelta = 4;
var largeSpread = 15; // MBS-7417 / https://github.com/metabrainz/musicbrainz-server/blob/217111e3a12b705b9499e7fdda6be93876d30fb0/lib/MusicBrainz/Server/Edit/Utils.pm#L467
var lastTick = new Date().getTime();
var MBSminimumDelay = 1000;
var retryDelay = 2000;
var currentButt;
var MBS = location.protocol + "//" + location.host;
var sidebar = document.getElementById("sidebar");
var recid2trackIndex = {remote: {}, local: {}}; // recid:tracks index
var mergeQueue = []; // contains next mergeButts
var sregex_MBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var regex_MBID = new RegExp(sregex_MBID, "i");
var css_track = "td:not(.pos):not(.video) > a[href^='/recording/'], td:not(.pos):not(.video) > :not(div):not(.ars) a[href^='/recording/']";
var css_track_ac = "td:not(.pos):not(.title):not(.rating):not(.treleases)";
var css_collapsed_medium = "div#content table.tbl.medium > thead > tr > th > a.expand-medium > span.expand-triangle";
var sregex_title = "(?:.+?[„“«‘] ?(.+) ?[“”»’] \\S+ (.+?)|(.+?)のリリース(?:グループ)?「(.+)」) - MusicBrainz";
var startpos, mergeStatus, from, to, swap, editNote, queuetrack, queueAll;
var localRelease, remoteRelease;
var matchMode = {current: null, sequential: null, title: null, titleAndAC: null};
var rem2loc = "◀";
var loc2rem = "▶";
var retry = {count: 0, checking: false};
var css = document.createElement("style");
css.setAttribute("type", "text/css");
document.head.appendChild(css);
css = css.sheet;
css.insertRule("body." + userjs.id + " div#" + userjs.id + " > .main-shortcut { display: none; }", 0);
css.insertRule("body." + userjs.id + " div#content table.tbl.medium > * > tr > .rating { display: none; }", 0);
css.insertRule("body." + userjs.id + " div#content table.tbl.medium > tbody > tr > td > div.ars { display: none !important; }", 0);
css.insertRule("body." + userjs.id + " div#content table.tbl.medium > tbody > tr > td a[href^='//acoustid.org/track/']{ display: none; }", 0); // link to Compare AcoustIDs easier! https://github.com/otringal/MB-userscripts/blob/master/Musicbrainz_acoustid.user.js
css.insertRule("body:not(." + userjs.id + ") div#" + userjs.id + " { margin-top: 12px; cursor: pointer; }", 0);
css.insertRule("body:not(." + userjs.id + ") div#" + userjs.id + " > :not(h2):not(.main-shortcut) { display: none; }", 0);
css.insertRule("body:not(." + userjs.id + ") div#" + userjs.id + " input[name='mergeStatus'] { font-size: 9px!important; background-color: #fcf; }", 0);
css.insertRule("div#" + userjs.id + " { background-color: #fcf; text-shadow: 1px 1px 2px #663; padding: 4px; margin: 0px -6px 12px; border: 2px dotted white; }", 0);
css.insertRule("div#" + userjs.id + " > .main-shortcut { margin: 0px; }", 0);
css.insertRule("div#" + userjs.id + " h2 { color: maroon; text-shadow: 2px 2px 4px #996; margin: 0px; }", 0);
css.insertRule("div#" + userjs.id + " kbd { background-color: silver; border: 2px grey outset; padding: 0px 4px; font-size: .8em; }", 0);
css.insertRule(".remoteRecordingLength.largeSpread { color: yellow; background-color: red; text-shadow: 2px 2px 4px black; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist > tbody > tr:nth-child(even) > td { background-color: #f2f2f2; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist { counter-reset: recording-index; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist > tbody > tr > td:first-child:before { counter-increment: recording-index; content: counter(recording-index); opacity: .6; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist > tbody > tr > td:first-child { text-align: center; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist > thead > tr > th:first-child { text-align: center; }", 0);
css.insertRule("/*body." + userjs.id + "*/ div#content > table.tbl." + userjs.id + "reclist > tbody > tr.sameName > td:nth-child(2) { border-left: 2px solid red; }", 0);
var dtitle = document.title;
var ltitle = dtitle.match(new RegExp("^" + sregex_title + "$"));
var release_group_MBID = location.pathname.match(new RegExp("^/release-group/(" + sregex_MBID + ")$"));
var releases = document.querySelectorAll("div#content table.tbl > tbody > tr > td > a[href^='/release/'] > bdi, div#content table.tbl > tbody > tr > td > span.mp > a[href^='/release/'] > bdi");
if (ltitle) {
	ltitle = {
		artists: ltitle[2] || ltitle[3],
		title: ltitle[1] || ltitle[4]
	};
	if (release_group_MBID) {
		if (document.getElementsByClassName("account").length > 0 && releases.length > 0) {
			releases = Array.prototype.slice.call(releases);
			sidebar.insertBefore(RGRecordingsMassMergeGUI(), sidebar.querySelector("h2.collections"));
			document.body.addEventListener("keydown", function(event) {
				if (!event[CONTROL_POMME.alt.key] && event[CONTROL_POMME.ctrl.key] && event[CONTROL_POMME.shift.key] && event.key.match(/^m$/i)) {
					loadRGRecordings(releases);
					return stop(event);
				}
			});
		}
	} else {
		localRelease = {
			"release-group": document.querySelector("div.releaseheader > p.subheader a[href*='/release-group/']").getAttribute("href").match(regex_MBID)[0],
			title: ltitle.title,
			looseTitle: looseTitle(ltitle.title),
			comment: document.querySelector("h1 > span.comment > bdi") || "",
			ac: ltitle.artists,
			id: location.pathname.match(regex_MBID)[0],
			tracks: []
		};
		if (localRelease.comment) {
			localRelease.comment = "(" + localRelease.comment.textContent + ")";
		}
		remoteRelease = {tracks: []};
		if (document.getElementsByClassName("account").length > 0) {
			sidebar.insertBefore(massMergeGUI(), sidebar.querySelector("h2.collections"));
			document.body.addEventListener("keydown", function(event) {
				if (!event[CONTROL_POMME.alt.key] && event[CONTROL_POMME.ctrl.key] && event[CONTROL_POMME.shift.key] && event.key.match(/^m$/i)) {
					prepareLocalRelease();
					return stop(event);
				} else if (
					startpos.children.length !== 0
					&& matchMode.current == matchMode.sequential
					&& event[CONTROL_POMME.ctrl.key] && event[CONTROL_POMME.shift.key] && event.key.match(/^Arrow(Up|Down|Left|Right)$/i)
				) {
					if (event.key.match(/^Arrow(Up|Left)$/i) && startpos.selectedIndex > 0) {
						startpos.selectedIndex -= 1;
					} else if (event.key.match(/^Arrow(Down|Right)$/i) && startpos.selectedIndex < startpos.length - 1) {
						startpos.selectedIndex += 1;
					}
					sendEvent(startpos, "change");
					return stop(event);
				}
			});
		}
		// sidebar.querySelector("h2.editing + ul.links").insertBefore(createTag("li", {}, [createTag("a", {}, userjs.name)]), sidebar.querySelector("h2.editing + ul.links li"));
	}
} else {
	console.error("Local title (/^" + sregex_title + "$/) not found in document.title (" + document.title + ").");
}
function mergeRecsStep(_step) {
	if (editNote.value && MBJS.isValidEditNote(editNote.value)) {
		editNote.style.removeProperty("background-color");
		if (editNote.nextSibling.matches("p.error." + userjs.id)) {
			editNote.parentNode.removeChild(editNote.nextSibling);
		}
		var step = _step || 0;
		var MMR = document.getElementById(userjs.id);
		var statuses = ["adding recs. to merge", "applying merge edit"];
		var buttStatuses = ["Stacking…", "Merging…"];
		var urls = ["/recording/merge_queue", "/recording/merge"];
		var params = [
			"add-to-merge=" + to.value + "&add-to-merge=" + from.value,
			"merge.merging.0=" + to.value + "&merge.target=" + to.value + "&merge.merging.1=" + from.value
		];
		disableInputs([matchMode.sequential, matchMode.title, matchMode.titleAndAC, startpos, mergeStatus]);
		if (step == 1) {
			disableInputs([editNote, currentButt, currentButt.parentNode.querySelector("input." + userjs.id + "dirbutt")]);
			params[step] += "&merge.edit_note=";
			var paramsup = MMR.getElementsByTagName("textarea")[0].value.trim();
			if (paramsup != "") paramsup += "\n —\n";
			paramsup += releaseInfoRow("source", swap.value == "no" ? remoteRelease : localRelease, swap.value == "no" ? recid2trackIndex.remote[from.value] : recid2trackIndex.local[from.value]);
			paramsup += releaseInfoRow("target", swap.value == "no" ? localRelease : remoteRelease, swap.value == "no" ? recid2trackIndex.local[to.value] : recid2trackIndex.remote[to.value]);
			paramsup += " —\n";
			var targetID = parseInt(to.value, 10);
			var sourceID = parseInt(from.value, 10);
			if (sourceID > targetID) {
				paramsup += "👍 '''Targeting oldest [MBID]''' (" + format(to.value) + " ← " + format(from.value) + ")" + "\n";
			}
			var locTrack = localRelease.tracks[recid2trackIndex.local[swap.value == "no" ? to.value : from.value]];
			var remTrack = remoteRelease.tracks[recid2trackIndex.remote[swap.value == "no" ? from.value : to.value]];
			if (locTrack.name == remTrack.name) paramsup += "👍 '''Same track title''' “" + protectEditNoteText(locTrack.name) + "”\n";
			else if (locTrack.name.toUpperCase() == remTrack.name.toUpperCase()) paramsup += "👍 '''Same track title''' (case insensitive)\n";
			else if (locTrack.looseName == remTrack.looseName) paramsup += "👍 '''Similar track title''' (loose comparison)\n";
			if (locTrack.artistCredit == remTrack.artistCreditAsPlainText) paramsup += "👍 '''Same track artist credit ([AC])''' “" + locTrack.artistCredit + "”\n";
			else if (locTrack.artistCredit.toUpperCase() == remTrack.artistCreditAsPlainText.toUpperCase()) paramsup += "👍 '''Same track artist credit ([AC])''' (case insensitive)\n";
			else if (locTrack.looseAC == remTrack.looseAC) paramsup += "👍 '''Similar track artist credit ([AC])''' “" + locTrack.artistCredit + "”\n";
			if (typeof locTrack.length == "number" && typeof remTrack.length == "number") {
				var delta = Math.abs(locTrack.length - remTrack.length);
				if (delta <= safeLengthDelta * 1000) paramsup += "👍 '''" + (delta === 0 ? "Same" : "Very close") + " track times''' " + /* temporary hidden until milliseconds are back (delta === 0 ? "(in milliseconds)" : */ "(" + (time(locTrack.length) == time(remTrack.length) ? time(locTrack.length) : "within " + safeLengthDelta + " seconds: " + time((swap.value == "no" ? locTrack : remTrack).length) + " ← " + time((swap.value == "no" ? remTrack : locTrack).length)) + ")" /* ) temporary */ + "\n";
			}
			if (localRelease.ac == remoteRelease.ac) paramsup += "👍 '''Same release artist''' “" + protectEditNoteText(localRelease.ac) + "”\n";
			if (localRelease.title == remoteRelease.title) paramsup += "👍 '''Same release title''' “" + protectEditNoteText(localRelease.title) + "”\n";
			else if (localRelease.title.toUpperCase() == remoteRelease.title.toUpperCase()) paramsup += "👍 '''Same release title''' (case insensitive)\n";
			else if (localRelease.looseTitle == remoteRelease.looseTitle) paramsup += "👍 '''Almost same release title''' (loose comparison)\n";
			// else if (leven(localRelease.looseTitle, remoteRelease.looseTitle)) paramsup += "👍 '''Almost same release title''' (loose comparison)\n";
			if (localRelease["release-group"] == remoteRelease["release-group"]) paramsup += "👍 '''Same release group''' (" + MBS + "/release-group/" + localRelease["release-group"] + ")\n";
			paramsup += " —\n" + userjs.name + " (" + userjs.version + ") in “" + matchMode.current.value.replace(/^Match unordered /i, "") + "” match mode";
			if (retry.count > 0) {
				paramsup += " — '''retry'''" + (retry.count > 1 ? " #" + retry.count : "") + " (" + protectEditNoteText(retry.message) + ")";
			}
			params[step] += encodeURIComponent(paramsup);
		}
		infoMerge("#" + from.value + " to #" + to.value + " " + statuses[step] + "…");
		currentButt.setAttribute("value", buttStatuses[step] + " " + (step + 1) + "/2");
		currentButt.setAttribute("ref", step);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event) {
			if (this.readyState == 4) {
				if (to.value === "") {
					nextButt(false);
				} else if (this.status == 200) {
					if (step === 0) {
						if (
							this.responseText.match(new RegExp('<form method="post">'))
							&& this.responseText.indexOf('value="' + from.value + '"') > -1
							&& this.responseText.indexOf('<a href="/recording/' + from.getAttribute("ref") + '">') > -1
							&& this.responseText.indexOf('value="' + to.value + '"') > -1
							&& this.responseText.indexOf('<a href="/recording/' + to.getAttribute("ref") + '">') > -1
						) {
							mergeRecsStep(1);
						} else {
							tryAgain("Did not queue");
						}
					} else if (step === 1) {
						if (
							this.responseText.indexOf('<h1><span class="mp"><a href="/recording/' + to.getAttribute("ref") + '">') > -1
							&& this.responseText.indexOf('href="/recording/merge_queue?add-to-merge=' + to.value) > -1
						) {
							nextButt(true);
						} else {
							checkMerge("Did not merge");
						}
					}
				} else {
					var errorText = "Error " + this.status + " “" + this.statusText + "” in step " + (step + 1) + "/2";
					if (step === 0) {
						tryAgain(errorText);
					} else {
						checkMerge(errorText);
					}
				}
			}
		};
		xhr.open("POST", MBS + urls[step], true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		setTimeout(function() { xhr.send(params[step]); }, chrono(MBSminimumDelay));
	} else {
		if (!editNote.nextSibling.matches("p.error." + userjs.id)) {
			editNote.parentNode.insertBefore(createTag("p", {a: {class: "error"}}, "Merging recordings is a destructive edit that is impossible to undo without losing ISRCs, AcoustIDs, edit histories, etc.\n\nPlease make sure your edit note makes it clear why you are sure that these recordings are exactly the same versions, mixes, cuts, etc."), editNote);
			addAfter(createTag("p", {a: {class: "error " + userjs.id}}, MBJS.texts("invalid_edit_note")), editNote);
		}
		editNote.style.setProperty("background-color", cNG);
		infoMerge("Invalid edit note.", false, true);
	}
}
function releaseInfoRow(sourceOrTarget, rel, trackIndex) {
	var spaced_comment = rel.comment ? " " + rel.comment : "";
	return sourceOrTarget + ": " + MBS + "/release/" + rel.id + " #'''" + (trackIndex + 1) + "'''/" + rel.tracks.length + ". “'''" + protectEditNoteText(rel.title) + "'''”" + protectEditNoteText(spaced_comment) + " by '''" + protectEditNoteText(rel.ac) + "'''\n";
}
function checkMerge(errorText) {
	retry.checking = true;
	infoMerge("Checking merge (" + errorText + ")…", false);
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("error", function(event) {
		setTimeout(function() {
			infoMerge("Retrying in 2s (error " + this. status + ": “" + this.statusText + "”)…", false);
			checkMerge(errorText);
		}, 2000);
	});
	xhr.addEventListener("load", function(event) {
		if (this.status < 200 || this.status >= 400) {
			sendEvent(this, "error");
		} else {
			if (typeof this.responseText == "string") {
				if (this.responseText.indexOf('class="edit-list"') > -1) {
					var editID = this.responseText.match(/>Edit #(\d+)/);
					nextButt(editID ? editID[1] : true);
				} else if (this.responseText.indexOf('id="remove.' + from.value + '"') > -1 && this.responseText.indexOf('id="remove.' + to.value + '"') > -1) {
					retry.count += 1;
					retry.message = errorText;
					mergeRecsStep(1);
				} else {
					tryAgain(errorText);
				}
			} else {
				sendEvent(this, "error");
			}
			retry.checking = false;
		}
	});
	xhr.open("GET", MBS + "/search/edits?negation=0&combinator=and&conditions.0.field=recording&conditions.0.operator=%3D&conditions.0.name=" + from.value + "&conditions.0.args.0=" + from.value + "&conditions.1.field=recording&conditions.1.operator=%3D&conditions.1.name=" + to.value + "&conditions.1.args.0=" + to.value + "&conditions.2.field=type&conditions.2.operator=%3D&conditions.2.args=74&conditions.3.field=status&conditions.3.operator=%3D&conditions.3.args=1", true);
	setTimeout(function() { xhr.send(null); }, chrono(retryDelay));
}
function nextButt(successOrEditID) {
	if (successOrEditID !== false) {
		remoteRelease.tracks[recid2trackIndex.remote[swap.value == "no" ? from.value : to.value]].recording.editsPending++;
		cleanTrack(localRelease.tracks[recid2trackIndex.local[swap.value == "no" ? to.value : from.value]], successOrEditID || true, retry.count);
		infoMerge("#" + from.value + " to #" + to.value + " merged OK", true, true);
	} else {
		infoMerge("Merge cancelled", true, true);
		currentButt.value = "Merge";
		enableInputs(currentButt);
	}
	retry.count = 0;
	currentButt = null;
	document.title = dtitle;
	updateMatchModeDisplay();
	enableInputs([mergeStatus, editNote]);
	var nextButtFromQueue = mergeQueue.shift();
	if (nextButtFromQueue) {
		enableAndClick(nextButtFromQueue);
	}
}
function tryAgain(errorText) {
	retry.count += 1;
	retry.message = errorText;
	var errormsg = errorText;
	if (currentButt) {
		errormsg = "Retry in " + Math.ceil(retryDelay / 1000) + " seconds (" + errormsg + ").";
		setTimeout(function() {
			enableAndClick(currentButt);
		}, retryDelay);
	}
	infoMerge(errormsg, false, true);
}
function enableAndClick(butt) {
	enableInputs(butt);
	butt.value = "Merge";
	butt.click();
}
function infoMerge(msg, goodNews, reset) {
	mergeStatus.value = msg;
	if (goodNews != null) {
		mergeStatus.style.setProperty("background-color", goodNews ? cOK : cNG);
	} else {
		mergeStatus.style.setProperty("background-color", cInfo);
	}
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
	var rmForm = track.tr.querySelector("td:not(.pos):not(.video) form." + userjs.id);
	if (rmForm) {
		if (editID) {
			mp(track.tr.querySelector(css_track), true);
			var noPendingOpenEdits = document.querySelector("div#sidebar :not(.mp) > a[href='/release/" + localRelease.id + "/open_edits']");
			var mb_PENDING_EDITS = document.querySelectorAll("div#sidebar .jesus2099PendingEditsCount");
			for (let counts = 0; counts < mb_PENDING_EDITS.length; counts++) {
				var currentCount = mb_PENDING_EDITS[counts].textContent.trim();
				if ((currentCount = currentCount.match(/^\d+$/)) && mb_PENDING_EDITS[counts].style.getPropertyValue("background-color") != "pink") {
					mb_PENDING_EDITS[counts].replaceChild(document.createTextNode(parseInt(currentCount, 10) + 1), mb_PENDING_EDITS[counts].firstChild);
				}
			}
			if (noPendingOpenEdits) {
				if (mb_PENDING_EDITS.length > 0) {
					noPendingOpenEdits.parentNode.classList.add("mp");
					noPendingOpenEdits.style.removeProperty("text-decoration");
					for (let counts = 0; counts < mb_PENDING_EDITS.length; counts++) {
						mb_PENDING_EDITS[counts].parentNode.parentNode.removeAttribute("title");
						mb_PENDING_EDITS[counts].parentNode.parentNode.style.removeProperty("opacity");
					}
				} else {
					mp(noPendingOpenEdits, true);
				}
			}
			removeChildren(rmForm);
			if (typeof editID == "number" || typeof retryCount == "number" && retryCount > 0) {
				var infoSpan = addAfter(createTag("span", {s: {opacity: ".5"}}, [" (", createTag("span"), ")"]), rmForm).querySelector("span > span");
				if (typeof editID == "number") {
					infoSpan.appendChild(createTag("span", {a: {class: "mp"}}, createA("edit:" + editID, "/edit/" + editID)));
				}
				if (typeof retryCount == "number" && retryCount > 0) {
					if (infoSpan.childNodes.length > 0) {
						infoSpan.appendChild(document.createTextNode(", "));
					}
					var retryLabel = "retr";
					if (retryCount > 1) {
						retryLabel = retryCount + " " + retryLabel + "ies";
					} else {
						retryLabel += "y";
					}
					infoSpan.appendChild(createA(retryLabel, track.a.getAttribute("href") + "/edits"));
				}
			}
		} else {
			removeNode(rmForm);
		}
	} else {
		var lengthcell = track.tr.querySelector("td.treleases");
		if (track.length && lengthcell) {
			lengthcell.replaceChild(document.createTextNode(time(track.length, false)), lengthcell.firstChild);
			lengthcell.style.setProperty("font-family", "monospace");
			lengthcell.style.setProperty("text-align", "right");
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
		for (let loc = 0; loc < localRelease.tracks.length; loc++) {
			cleanTrack(localRelease.tracks[loc]);
			var rem = bestStartPosition(loc, matchMode.current == matchMode.titleAndAC);
			if (rem !== null) {
				rem = 0 - rem + loc;
				if (matchedRemoteTracks.indexOf(rem) < 0) {
					matchedRemoteTracks.push(rem);
					buildMergeForm(loc, rem);
				}
			}
		}
		var notMatched = remoteRelease.tracks.length - matchedRemoteTracks.length;
		infoMerge((notMatched === 0 ? "All" : "☞") + " " + matchedRemoteTracks.length + " remote track title" + (matchedRemoteTracks.length == 1 ? "" : "s") + " matched" + (notMatched > 0 ? " (" + notMatched + " left)" : ""), matchedRemoteTracks.length > 0);
	}
}
function updateMatchModeDisplay() {
	for (let mode in matchMode) if (Object.prototype.hasOwnProperty.call(matchMode, mode)) {
		disableInputs(matchMode[mode], matchMode[mode] == matchMode.current);
	}
	enableInputs(startpos, matchMode.sequential == matchMode.current);
}
function massMergeGUI() {
	var MMRdiv = createTag("div", {a: {id: userjs.id}, e: {
		keydown: function(event) {
			if (event.target == editNote && !event[CONTROL_POMME.alt.key] && event[CONTROL_POMME.ctrl.key] && !event[CONTROL_POMME.shift.key]) {
				switch (event.key) {
					case "s":
						return saveEditNote(event);
					case "o":
						return loadEditNote(event);
				}
			}
		},
		click: prepareLocalRelease
	}}, [
		createTag("h2", {}, userjs.name),
		createTag("p", {}, "version " + userjs.version),
		createTag("p", {a: {"class": "main-shortcut"}}, ["☞ ", CONTROL_POMME.ctrl_shift.label, "M"]),
		createTag("p", {s: {marginBottom: "0px!"}}, ["Remote release: ", createTag("span", {a: {"class": "remote-release-link"}})]),
	]);
	mergeStatus = MMRdiv.appendChild(createInput("text", "mergeStatus", "", userjs.name + " remote release URL"));
	mergeStatus.style.setProperty("width", "100%");
	mergeStatus.addEventListener("input", function(event) {
		matchMode.current = matchMode.sequential;
		updateMatchModeDisplay();
		var mbid = this.value.match(new RegExp("/release/(" + sregex_MBID + ")(/disc/(\\d+))?"));
		if (mbid) {
			localRelease.tracks = [];
			recid2trackIndex.local = {};
			removeChildren(startpos);
			var trs = document.querySelectorAll("div#content table.tbl.medium > tbody > tr");
			/* var jsonRelease, scripts = document.querySelectorAll("script:not([src])");
			for (let s = 0; s < scripts.length && !jsonRelease; s++) {
				jsonRelease = scripts[s].textContent.match(/MB\.Release\.init\(([^<]+)\)/);
			}
			if (jsonRelease) jsonRelease = JSON.parse(jsonRelease[1]); */
			var multiDiscRelease = document.querySelectorAll(css_collapsed_medium).length > 1;
			for (let itrs = 0, t = 0, d = 0, dt = 0; itrs < trs.length; itrs++) {
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
						artistCredit: trackAC ? trackAC.textContent.trim() : localRelease.ac,
						length: trackLength
					});
					localRelease.tracks[t].looseName = looseTitle(localRelease.tracks[t].name);
					localRelease.tracks[t].looseAC = looseTitle(localRelease.tracks[t].artistCredit);
					/* if (jsonRelease) {
						// localRelease.tracks[localRelease.tracks.length - 1] = jsonRelease.mediums[d - 1].tracks[dt];
						for (let key in jsonRelease.mediums[d - 1].tracks[dt]) if (jsonRelease.mediums[d - 1].tracks[dt].hasOwnProperty(key)) {
							localRelease.tracks[localRelease.tracks.length - 1][key] = jsonRelease.mediums[d - 1].tracks[dt][key];
						}
					} */
					dt++;
					recid2trackIndex.local[recoid] = t;
					addOption(startpos, t, (multiDiscRelease ? d + "." : "") + dt + ". " + trackname);
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
			// loadReleaseWS(remoteRelease.id);
		}
	});
	MMRdiv.appendChild(createTag("p", {}, "Once you paste the remote release URL, all its recordings will be loaded and made available for merge with the local recordings in the left hand tracklist."));
	MMRdiv.appendChild(createTag("p", {}, "Herebelow, you can shift the alignement of local and remote tracklists."));
	MMRdiv.appendChild(createTag("p", {s: {marginBottom: "0px"}}, "Remote tracklist start position:"));
	/* track parsing */
	startpos = MMRdiv.appendChild(createTag("select", {s: {fontSize: ".8em", width: "100%"}, e: {change: function(event) {
		/* hitting ENTER on a once changed <select> triggers onchange even if no recent change */
		if (this.getAttribute("previousValue") != this.value) {
			this.setAttribute("previousValue", this.value);
			if (remoteRelease.id && remoteRelease.tracks.length > 0) {
				spreadTracks(event);
			} else {
				mergeStatus.focus();
			}
		}
	}}}));
	if (navigator.userAgent.match(/firefox/i)) startpos.addEventListener("keyup", function(event) {
		if (event.key != "Enter") {
			this.blur();
			this.focus();
		}
	});
	MMRdiv.appendChild(createTag("p", {}, [
		"☞ ", CONTROL_POMME.ctrl_shift.label,
		createTag("kbd", {a: {class: userjs.id + "arrowButton"}, s: {cursor: "pointer"}}, "↑"),
		"/",
		createTag("kbd", {a: {class: userjs.id + "arrowButton"}, s: {cursor: "pointer"}}, "↓"),
		"/",
		createTag("kbd", {a: {class: userjs.id + "arrowButton"}, s: {cursor: "pointer"}}, "←"),
		"/",
		createTag("kbd", {a: {class: userjs.id + "arrowButton"}, s: {cursor: "pointer"}}, "→"),
		": shift"
	]));
	MMRdiv.addEventListener("click", function(event) {
		if (matchMode.current == matchMode.sequential && event.target.classList.contains(userjs.id + "arrowButton")) {
			if (event.target.textContent.match(/[↑←]/) && startpos.selectedIndex > 0) {
				startpos.selectedIndex -= 1;
			} else if (event.target.textContent.match(/[↓→]/) && startpos.selectedIndex < startpos.length - 1) {
				startpos.selectedIndex += 1;
			}
			sendEvent(startpos, "change");
		}
	});
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
	var lastEditNote = (localStorage && localStorage.getItem(userjs.id));
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
	MMRdiv.appendChild(createTag("p", {}, ["☞ ", CONTROL_POMME.ctrl.label, "S", ": ", saveEditNoteButt, document.createElement("br"), "☞ ", CONTROL_POMME.ctrl.label, "O", ": ", loadEditNoteButt]));
	MMRdiv.appendChild(createTag("p", {}, "Each recording merge will automatically target the oldest, unless direction is manually changed by clicking each arrow button or below batch button."));
	from = MMRdiv.appendChild(createInput("hidden", "from", ""));
	to = MMRdiv.appendChild(createInput("hidden", "to", ""));
	swap = MMRdiv.appendChild(createInput("hidden", "swap", "yes"));
	var changeAllDirButt = createInput("button", "", "Change all merge targets to " + (swap.value == "no" ? "remote" : "local"));
	changeAllDirButt.style.setProperty("background-color", cOK);
	changeAllDirButt.addEventListener("click", function(event) {
		var allbutts = document.querySelectorAll("input." + userjs.id + "dirbutt:not([disabled])");
		var direction = this.value.match(/local/) ? rem2loc : loc2rem;
		for (let iab = 0; iab < allbutts.length; iab++) if (allbutts[iab].value != direction) allbutts[iab].click();
		swap.value = direction == rem2loc ? "no" : "yes";
		this.value = this.value.replace(/\w+$/, swap.value == "no" ? "remote" : "local");
		this.style.setProperty("background-color", swap.value == "no" ? cInfo : cOK);
	});
	var resetAllDirButt = createInput("button", "", "Reset all merge directions to oldest");
	resetAllDirButt.addEventListener("click", function(event) {
		var allbutts = document.querySelectorAll("input." + userjs.id + "dirbutt:not([disabled])");
		for (let iab = 0; iab < allbutts.length; iab++) {
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
		var allbutts = document.getElementsByClassName(userjs.id + "mergebutt");
		for (let iab = 0; iab < allbutts.length; iab++) {
			if (allbutts[iab].value == "Merge") allbutts[iab].click();
		}
	});
	var emptyQueueButt = createInput("button", "", "Empty merge queue");
	emptyQueueButt.style.setProperty("background-color", cCancel);
	emptyQueueButt.addEventListener("click", function(event) {
		if (mergeQueue.length > 0) {
			while (mergeQueue.length > 0) {
				var unqueuedbutt = mergeQueue.shift();
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
	for (let ltrack = 0; ltrack < localRelease.tracks.length; ltrack++) {
		// TODO: should probably remove some in spreadTracks() etc.
		cleanTrack(localRelease.tracks[ltrack]);
	}
	var mbidInfo = document.getElementById(userjs.id).querySelector(".remote-release-link");
	removeChildren(mbidInfo);
	mbidInfo.setAttribute("title", remoteRelease.id + remoteRelease.disc);
	mbidInfo.appendChild(document.createTextNode(" "));
	mbidInfo.appendChild(createA(remoteRelease.id.match(/[\w\d]+/), "/release/" + remoteRelease.id));
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("error", function() { infoMerge("Error " + this.status + ": “" + this.statusText + "”", false); });
	xhr.addEventListener("load", function(event) {
		if (this.status < 200 || this.status >= 400) {
			sendEvent(this, "error");
		} else {
			var releaseWithoutARs = this.responseText.replace(/<dl class="ars">[\s\S]+?<\/dl>/g, "");
			var mediums = releaseWithoutARs.match(/<table class="tbl medium">[\s\S]+?<\/table>/g);
			var rtitle = releaseWithoutARs.match(new RegExp("<title>" + sregex_title + "</title>"));
			var discount = releaseWithoutARs.match(/<a class="expand-medium"/g).length;
			if (!remoteRelease.disc && releaseWithoutARs.match(/<tbody style="display:none"><\/tbody>/)) {
				var disc = prompt("This " + discount + " medium release has some collapsed mediums.\nIn this case I can only load one medium at a time.\n\nPlease enter the medium number that you want to load.\n\nNext time you can directly paste the medium link:\n " + MBS + "/release/" + remoteRelease.id + "/disc/1.", "1");
				if (disc && disc.match(/^\d+$/) && disc > 0 && disc <= discount) {
					remoteRelease.disc = "/disc/" + disc;
					loadReleasePage();
				} else {
					infoMerge("Disc number out of bounds (1–" + discount + ") or unreadable", false);
				}
			} else if (rtitle) {
				rtitle = {
					artists: rtitle[2] || rtitle[3],
					title: rtitle[1] || rtitle[4]
				};
				remoteRelease["release-group"] = releaseWithoutARs.match(/\((?:<span[^>]*>){0,2}<a href=".*\/release-group\/([^"/]+)">(?:<bdi>)?[^<]+(?:<\/bdi>)?<\/a>(?:<\/span>){0,2}\)/)[1];
				remoteRelease.title = HTMLToText(rtitle.title);
				remoteRelease.looseTitle = looseTitle(remoteRelease.title);
				remoteRelease.comment = releaseWithoutARs.match(/<h1>.+<span class="comment">\(<bdi>([^<]+)<\/bdi>\)<\/span><\/h1>/) || "";
				if (remoteRelease.comment) {
					remoteRelease.comment = "(" + HTMLToText(remoteRelease.comment[1]) + ")";
				}
				remoteRelease.ac = rtitle.artists;
				removeChildren(mbidInfo);
				if (remoteRelease.id == localRelease.id) {
					mbidInfo.appendChild(document.createTextNode(" (same" + (remoteRelease.disc ? ", " + remoteRelease.disc.substr(1).replace(/\//, "\u00a0") + "/" + discount : "") + ")"));
				} else {
					mbidInfo.appendChild(createA(remoteRelease.title, "/release/" + remoteRelease.id));
					if (remoteRelease.comment) {
						mbidInfo.appendChild(document.createTextNode(" "));
						mbidInfo.appendChild(createTag("span", {a: {class: "comment"}}, remoteRelease.comment));
					}
					if (remoteRelease.disc) {
						mbidInfo.appendChild(createTag("fragment", null, [" (", createA(remoteRelease.disc.substr(1).replace(/\//, "\u00a0"), "/release/" + remoteRelease.id + remoteRelease.disc + "#" + remoteRelease.disc.replace(/\//g, "")),  "/" + discount + ")"]));
					}
					if (remoteRelease["release-group"] === localRelease["release-group"]) {
						mbidInfo.appendChild(document.createTextNode(" (same release group)"));
					}
				}
				remoteRelease.tracks = [];
				for (var m = 0; m < mediums.length; m++) {
					var current_medium = mediums[m].match(/<th colSpan="\d+">.+?<\/span>[<!->\s]*?([^<:]+)[<:]/);
					if (current_medium) {
						current_medium = current_medium[1].replace(/&quot;/, "ʺ") + "\u00a0– ";
					} else if (mediums.length > 1) {
						current_medium = (m + 1) + ".";
					} else {
						current_medium = "";
					}
					var recIDx5 = mediums[m].match(/entity_id=\d+[^"]*entity_type=recording|entity_type=recording[^"]*entity_id=\d+/g);
					var trackRows = mediums[m].match(/<tr class="(even|odd)" id="[-\da-z]{36}">[\s\S]+?<td class="treleases">[\s\S]+?<\/tr>/g);
					var trackInfos = mediums[m].match(new RegExp("<a href=\"/recording/" + sregex_MBID + "\"( title=\"[^\"]*\")?><bdi>[^<]*</bdi></a>", "g"));
					var trackTimes = mediums[m].match(/<td class="treleases">[^<]*<\/td>/g);
					if (recIDx5 && trackInfos && trackTimes) {
						var recIDs = [];
						for (let i5 = 0; i5 < recIDx5.length; i5 += 5) {
							recIDs.push(recIDx5[i5].match(/id=([0-9]+)/)[1]);
						}
						for (var t = 0; t < recIDs.length; t++) {
							var trackLength = trackTimes[t].match(/(\d+:)?\d+:\d+/);
							if (trackLength) trackLength = strtime2ms(trackLength[0]);
							var current_track = {
								number: current_medium + trackRows[t].match(new RegExp("<td class=\"pos[\\s\\S]+?<a href=\"" + "/track/" + sregex_MBID + "\">(.*?)</a>"))[1],
								name: HTMLToText(trackInfos[t].match(/<bdi>([^<]*)<\/bdi>/)[1]),
								artistCredit: trackRows[t].match(/<td class="wrap-anywhere">/g) && trackRows[t].match(/<td class="wrap-anywhere">/g).length === 1 ? trackRows[t].match(/[\s\S]*<td class="wrap-anywhere">([\s\S]+?)<\/td>/)[1].trim().replace(/<a/g, '<a target="_blank"') : remoteRelease.ac,
								length: trackLength,
								recording: {
									rowid: recIDs[t],
									id: trackInfos[t].match(/\/recording\/([^"]+)/)[1],
									video: trackRows[t].match(/<span class="video"/) !== null,
									editsPending: trackRows[t].match(/<td class="title"><span class="mp">/) !== null ? 1 : 0,
								},
								isDataTrack: false
							};
							current_track.artistCreditAsPlainText = HTMLToText(current_track.artistCredit);
							current_track.looseName = looseTitle(current_track.name);
							current_track.looseAC = looseTitle(current_track.artistCreditAsPlainText);
							remoteRelease.tracks.push(current_track);
							recid2trackIndex.remote[recIDs[t]] = remoteRelease.tracks.length - 1;
						}
					}
				}
										/* for (let rd = 0; rd < jsonRelease.mediums.length; rd++) {
											for (let rt = 0; rt < jsonRelease.mediums[rd].tracks.length; rt++) {
												remoteRelease.tracks.push(jsonRelease.mediums[rd].tracks[rt]);
												recid2trackIndex.remote[jsonRelease.mediums[rd].tracks[rt].recording.rowid] = remoteRelease.tracks.length - 1;
											}
										}
										jsonRelease = null; /* maybe it frees up memory */
				/* (re)build negative startpos */
				var negativeOptions = startpos.querySelectorAll("option[value^='-']");
				for (let nopt = 0; nopt < negativeOptions.length; nopt++) {
					removeNode(negativeOptions[nopt]);
				}
				for (let rtrack = 0; rtrack < remoteRelease.tracks.length - 1; rtrack++) {
					addOption(startpos, 0 - rtrack - 1, 0 - rtrack - 1, true);
				}
				startpos.value = bestStartPosition() || 0;
				spreadTracks(event);
				mergeStatus.blur();
			}
		}
	});
	xhr.open("GET", MBS + "/release/" + remoteRelease.id + remoteRelease.disc, true);
	setTimeout(function() { xhr.send(null); }, chrono(MBSminimumDelay));
}
function bestStartPosition(localTrack, matchAC) {
	var singleTrackMode = typeof localTrack != "undefined";
	for (let loc = singleTrackMode ? localTrack : 0; loc < (singleTrackMode ? localTrack + 1 : localRelease.tracks.length); loc++) {
		for (let rem = 0; rem < remoteRelease.tracks.length; rem++) {
			if (
				localRelease.tracks[loc].looseName == remoteRelease.tracks[rem].looseName
				&& (!matchAC || localRelease.tracks[loc].looseAC == remoteRelease.tracks[rem].looseAC)
				// leven(localRelease.tracks[loc].looseName, remoteRelease.tracks[rem].looseName) < 5
				// && (!matchAC || leven(localRelease.tracks[loc].looseAC, remoteRelease.tracks[rem].looseAC) < 5)
			) {
				return loc - rem;
			}
		}
	}
	return null;
}
// function loadReleaseWS(mbid) {
// }
function spreadTracks(event) {
	var rtrack = startpos.value < 0 ? 0 - startpos.value : 0;
	for (let ltrack = 0; ltrack < localRelease.tracks.length; ltrack++) {
		cleanTrack(localRelease.tracks[ltrack]);
		if (ltrack >= startpos.value && rtrack < remoteRelease.tracks.length) {
			var ntitl = "local recording #" + format(localRelease.tracks[ltrack].recid) + "\n" + localRelease.tracks[ltrack].looseName + "\n" + localRelease.tracks[ltrack].looseAC;
			var ntit = localRelease.tracks[ltrack].a.getAttribute("title");
			if (!ntit || (ntit && !ntit.match(new RegExp(ntitl)))) {
				localRelease.tracks[ltrack].a.setAttribute("title", (ntit ? ntit + " — " : "") + ntitl);
			}
			buildMergeForm(ltrack, rtrack);
			rtrack++;
		}
	}
	var mergebutts = document.getElementsByClassName(userjs.id + "mergebutt").length;
	var outOfView = Math.max(0, parseInt(startpos.value, 10) + remoteRelease.tracks.length - localRelease.tracks.length);
	if (startpos.value < 0) outOfView -= startpos.value;
	infoMerge("☞ " + mergebutts + " recording" + (mergebutts == 1 ? "" : "s") + " ready to merge" + (outOfView > 0 ? " (" + outOfView + " out of view)" : ""), mergebutts > 0);
	disableInputs(queueAll, mergebutts < 1);
}
function buildMergeForm(loc, rem) {
	var locTrack = localRelease.tracks[loc];
	var remTrack = remoteRelease.tracks[rem];
	var rmForm = document.createElement("form");
	rmForm.setAttribute("action", "/recording/merge");
	rmForm.setAttribute("method", "post");
	// rmForm.setAttribute("title", "AC: " + ac2str(remTrack.artistCredit) + "\nremote recording #" + remTrack.recording.rowid);
	rmForm.setAttribute("title", "remote recording #" + format(remTrack.recording.rowid) + "\n" + remTrack.looseName + "\n" + remTrack.looseAC);
	rmForm.setAttribute("class", userjs.id);
	rmForm.style.setProperty("display", "inline");
	rmForm.appendChild(createInput("hidden", "merge.merging.0", locTrack.recid)).setAttribute("ref", locTrack.a.getAttribute("href").match(regex_MBID)[0]);
	rmForm.appendChild(createInput("hidden", "merge.target", locTrack.recid));
	rmForm.appendChild(createInput("hidden", "merge.merging.1", remTrack.recording.rowid)).setAttribute("ref", remTrack.recording.id);
	rmForm.appendChild(createInput("hidden", "merge.edit_note", "mass rec merger"));
	if (remTrack.recording.rowid != locTrack.recid) {
		rmForm.style.setProperty("background-color", cWarning);
		var dirButt = rmForm.appendChild(createInput("button", "direction", swap.value == "no" ? rem2loc : loc2rem));
		dirButt.setAttribute("class", userjs.id + "dirbutt");
		dirButt.style.setProperty("background-color", swap.value == "no" ? cOK : cInfo);
		dirButt.style.setProperty("padding", "0 1em .5em 1em");
		dirButt.style.setProperty("margin", "0 4px");
		dirButt.addEventListener("click", function(event) {
			this.value = this.value == rem2loc ? loc2rem : rem2loc;
			this.style.setProperty("background-color", this.value == rem2loc ? cOK : cInfo);
		});
		var remrec = rmForm.appendChild(createA(remTrack.number + ". “", "/recording/" + remTrack.recording.id));
		if (remTrack.recording.video) {
			remrec.parentNode.insertBefore(createTag("span", {a: {class: "video"}}), remrec);
		} else if (remTrack.isDataTrack) {
			remrec.parentNode.insertBefore(createTag("span", {a: {class: "data-track icon img"}, s: {display: "inline-block", height: "14px", width: "16px"}}), remrec);
		}
		var rectitle = remrec.appendChild(document.createElement("span"));
		rectitle.appendChild(document.createTextNode(remTrack.name));
		remrec.appendChild(document.createTextNode("” "));
		if (remTrack.looseName == locTrack.looseName) {
			rectitle.style.setProperty("background-color", cOK);
			rectitle.setAttribute("title", "(almost) same title");
		}
		if (remTrack.recording.editsPending > 0) {
			remrec = mp(remrec, true);
		}
		var reclen = remrec.appendChild(document.createElement("span"));
		reclen.style.setProperty("float", "right");
		reclen.style.setProperty("font-family", "monospace");
		reclen.classList.add("remoteRecordingLength");
		reclen.appendChild(document.createTextNode(" " + time(remTrack.length, true)));
		if (typeof locTrack.length == "number" && typeof remTrack.length == "number") {
			var delta = Math.abs(locTrack.length - remTrack.length);
			if (delta != false && delta > safeLengthDelta * 1000) {
				if (delta >= largeSpread * 1000) {
					reclen.classList.add("largeSpread");
					reclen.setAttribute("title", "MORE THAN " + 15 + " SECONDS DIFFERENCE");
				} else {
					reclen.style.setProperty("background-color", cNG);
					reclen.setAttribute("title", "more than " + safeLengthDelta + " seconds difference");
				}
			} else {
				reclen.style.setProperty("background-color", delta && delta > 500 ? cWarning : cOK);
			}
		}
		rmForm.appendChild(document.createTextNode(" by "));
		// rmForm.appendChild(ac2dom(remTrack.artistCredit));
		var AC = document.createElement("span");
		AC.innerHTML = remTrack.artistCredit;
		if (locTrack.looseAC == remTrack.looseAC) {
			for (let spanMp = AC.querySelectorAll("span.mp"), m = 0; m < spanMp.length; m++) {
				spanMp[m].classList.remove("mp");
			}
			AC.style.setProperty("background-color", cOK);
		}
		rmForm.appendChild(AC);
		var mergeButt = rmForm.appendChild(createInput("button", "", "Merge"));
		mergeButt.setAttribute("class", userjs.id + "mergebutt");
		mergeButt.style.setProperty("background-color", cMerge);
		mergeButt.style.setProperty("float", "right");
		mergeButt.addEventListener("click", function(event) {
			var swapbutt = this.parentNode.querySelector("input." + userjs.id + "dirbutt");
			this.style.setProperty("background-color", cInfo);
			if (this.value == "Merge") {
				if (from.value === "") {
					/* if no merge is ongoing, launch this merge */
					var swapped = (swapbutt.value == loc2rem);
					var mergeFrom = this.parentNode.getElementsByTagName("input")[swapped ? 0 : 2];
					var mergeTo = this.parentNode.getElementsByTagName("input")[swapped ? 2 : 0];
					from.value = mergeFrom.value;
					from.setAttribute("ref", mergeFrom.getAttribute("ref"));
					to.value = mergeTo.value;
					to.setAttribute("ref", mergeTo.getAttribute("ref"));
					swap.value = (swapped ? "yes" : "no");
					currentButt = this;
					mergeRecsStep();
				} else if (retry.checking || retry.count > 0 || mergeQueue.indexOf(this) < 0) {
					/* if a merge is ongoing or a checking/retry is pending, queue this one */
					this.value = "Unqueue";
					enableInputs([this, swapbutt]);
					mergeQueue.push(this);
				}
			} else if (this.value == "Unqueue") {
				var queuedItem = mergeQueue.indexOf(this);
				if (queuedItem > -1) {
					/* unqueue this one */
					mergeQueue.splice(queuedItem, 1);
					this.value = "Merge";
				}
			} else if (this.getAttribute("ref") === "0") {
				/* if this merge is being stacked (step 0), cancel its submission (step 1) */
				infoMerge("Cancelling merge…", true, true);
				disableInputs(this);
				this.removeAttribute("ref");
				this.value = "Cancelling…";
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
	var recording_comment = tracktd.querySelector("span.comment"); // usually added by userscripts like mb_INLINE-STUFF
	if (recording_comment) { bestPos = recording_comment; }
	addAfter(rmForm, bestPos);
	if (remTrack.recording.rowid != locTrack.recid) {
		var remoteRowID = parseInt(remTrack.recording.rowid, 10);
		var localRowID = parseInt(locTrack.recid, 10);
		var dirbutt = rmForm.querySelector("input[type='button']." + userjs.id + "dirbutt");
		if (remoteRowID > localRowID && dirbutt.value == loc2rem || remoteRowID < localRowID && dirbutt.value == rem2loc) {
			dirbutt.click();
		}
	}
}
function expandCollapseAllMediums(clickThis) {
	// Native a#expand-all-mediums randomly collapses mediums if called by my script
	if (clickThis) for (let collapsedMediums = document.querySelectorAll(css_collapsed_medium), a = collapsedMediums.length - 1; a >= 0; a--) {
		if (collapsedMediums[a].textContent.trim() == clickThis) {
			collapsedMediums[a].click();
		}
	}
}
function prepareLocalRelease() {
	if (location.pathname.match(/\/disc\/\d+/)) {
		if (confirm(userjs.name + " only works on normal release pages (not on this kind of disc anchor version).\n\nDo you agree to reload page?")) {
			location.assign(MBS + "/release/" + localRelease.id);
		}
		return;
	}
	// link to mb_INLINE-STUFF (start)
	var inlineStuffedRecordingNames = document.querySelectorAll("a[jesus2099userjs81127recname]");
	for (let n = 0; n < inlineStuffedRecordingNames.length; n++) {
		replaceChildren(createTag("bdi", {}, inlineStuffedRecordingNames[n].getAttribute("jesus2099userjs81127recname")), inlineStuffedRecordingNames[n]);
		inlineStuffedRecordingNames[n].removeAttribute("jesus2099userjs81127recname");
	}
	// link to mb_INLINE-STUFF (end)
	document.body.appendChild(createTag("div", {a: {class: "loading-" + userjs.id}, s: {position: "fixed", background: "#FEF", opacity: ".6", top: "0px", right: "0px", bottom: "0px", left: "0px"}}));
	document.body.appendChild(createTag("h1", {a: {class: "loading-" + userjs.id}, s: {position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textShadow: "0 0 8px white"}}, "LOADING ALL MEDIUMS…"));
	expandCollapseAllMediums("▶");
	setTimeout(loadingAllMediums, 10);
}
function loadingAllMediums() {
	var loadingMessage = document.querySelector("h1.loading-" + userjs.id);
	var loading_things = document.querySelectorAll("div#content table.tbl.medium > tbody .loading-message").length;
	if (loading_things > 0 && loadingMessage.textContent.match(/MEDIUMS?…$/)) {
		loadingMessage.replaceChild(document.createTextNode("LOADING " + loading_things + " MEDIUM" + (loading_things !== 1 ? "S" : "") + "…"), loadingMessage.firstChild);
		setTimeout(loadingAllMediums, 200);
	} else {
		var loadTracks = document.querySelector("div#content table.tbl.medium > tbody a.load-tracks");
		if (loadTracks) {
			if (loadingMessage.textContent.match(/MEDIUMS?…$/)) {
				loadingMessage.replaceChild(document.createTextNode("LOADING ALL TRACKS"), loadingMessage.firstChild);
			} else {
				loadingMessage.appendChild(document.createTextNode("."));
			}
			loadTracks.click();
			setTimeout(loadingAllMediums, 200);
		} else {
			showGUI();
		}
	}
}
function showGUI() {
	for (var loadingMessages = document.querySelectorAll(".loading-" + userjs.id), i = 0; i < loadingMessages.length; i++) {
		removeNode(loadingMessages[i]);
	}
	if (!document.body.classList.contains(userjs.id)) {
		document.body.classList.add(userjs.id);
		var MMRdiv = document.getElementById(userjs.id);
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
		for (let child = 0; sidebar.childNodes[child] != MMRdiv && child < sidebar.childNodes.length; child++) {
			firstElements.unshift(sidebar.childNodes[child]);
		}
		for (let elem = 0; elem < firstElements.length; elem++) {
			addAfter(sidebar.removeChild(firstElements[elem]), MMRdiv);
		}
	}
	mergeStatus.focus();
}
function saveEditNote(event) {
	if (localStorage) {
		localStorage.setItem(userjs.id + (release_group_MBID ? "_RG" : ""), editNote.value);
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
		var savedEditNote = localStorage.getItem(userjs.id + (release_group_MBID ? "_RG" : ""));
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
	return insert && select.firstChild ? select.insertBefore(option, select.firstChild) : select.appendChild(option);
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
		o.parentNode.parentNode.replaceChild(o.cloneNode(true), o.parentNode);
	}
}
function strtime2ms(str) { // temporary until WS available again
	var time = str.split(":");
	var ms = 0;
	for (let mult = 1; time.length > 0;) {
		ms += time.pop() * mult * 1000;
		mult *= 60;
	}
	return ms;
}
function time(_ms) { // from INLINE STUFF
	var ms = typeof _ms == "string" ? parseInt(_ms, 10) : _ms;
	if (ms > 0) {
		var d = new Date(ms);
		return (d.getUTCHours() > 0 ? d.getUTCHours() + ":" + (d.getUTCMinutes() / 100).toFixed(2).slice(2) : d.getUTCMinutes()) + ":" + (d.getUTCSeconds() / 100).toFixed(2).slice(2) + (d.getUTCMilliseconds() > 0 ? "." + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2) : "");
	}
	return "?:??";
}
function format(number) {
	/* thanks to http://snipplr.com/view/72657/thousand-separator */
	return (number + "").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
}
function ac2dom(ac) {
	if (typeof ac == "string") return document.createTextNode(ac);
	var dom = document.createDocumentFragment();
	for (let c = 0; c < ac.length; c++) {
		var a = createA(ac[c].name, "/artist/" + ac[c].artist.id);
		if (ac[c].name != ac[c].artist.name) {
			a.setAttribute("title", ac[c].artist.name);
			a = document.createElement("span").appendChild(a).parentNode;
			a.className = "name-variation";
		}
		dom.appendChild(a);
		if (ac[c].joinphrase) dom.appendChild(document.createTextNode(ac[c].joinphrase));
	}
	return dom;
}
function protectEditNoteText(text) {
	return text.replace(/'/g, "&#x0027;");
}
function looseTitle(title) {
	var genericTitle = toHalfWidth(title).toUpperCase();
	var simplifications = [
		{to: "&", from: /\b(AND|ET|VÀ)\b/g},
		{to: "A", from: /[ÀÁÂÃÄÅĀĂĄǍǞǠǺȀȂȦȺᴀḀẠẢẤẦẨẪẬẮẰẲẴẶ]/g},
		{to: "AE", from: /[ÆǢǼ]/g},
		{to: "B", from: /[ƁƂɃᴃʙḂḄḆ]/g},
		{to: "C", from: /[ĆĈĊČƇȻᴄḈ]/g},
		{to: "D", from: /[ÐĎĐƉƊƋᴅḊḌḎḐḒ]/g},
		{to: "E", from: /[ÈÉÊËĒĔĖĘĚƎƐȄȆȨɆᴇⱻḔḖḘḚḜẸẺẼẾỀỂỄỆ]/g},
		{to: "F", from: /[ƑꜰḞ]/g},
		{to: "G", from: /[ĜĞĠĢƓǤǦǴɢʛḠ]/g},
		{to: "H", from: /[ĤĦȞʜḢḤḦḨḪ]/g},
		{to: "I", from: /[ÌÍÎÏĨĪĬĮİǏȈȊɪḬḮỈỊ]/g},
		{to: "J", from: /[ĴɈᴊ]/g},
		{to: "K", from: /[ĶĸǨᴋḰḲḴ]/g},
		{to: "L", from: /[ĹĻĽĿŁȽᴌʟḶḸḺḼ]/g},
		{to: "M", from: /[ᴍꟺḾṀṂ]/g},
		{to: "N", from: /[ÑŃŅŇŊƝǸȠᴎɴṄṆṈṊ]/g},
		{to: "O", from: /[ÒÓÔÕÖØŌŎŐƆƟƠǑǪǬǾȌȎȪȬȮȰᴏᴐṌṎṐṒỌỎỐỒỔỖỘỚỜỞỠỢ]/g},
		{to: "OE", from: /[ɶŒ]/g},
		{to: "P", from: /[ƤᴘṔṖ]/g},
		{to: "Q", from: /[Ɋ]/g},
		{to: "R", from: /[ŔŖŘȐȒɌᴙᴚʀʁṘṚṜṞ]/g},
		{to: "S", from: /[$ŚŜŞŠȘꜱṠṢṤṦṨ]/g},
		{to: "SS", from: /ß/g},
		{to: "T", from: /[ŢŤŦƬƮȚȾᴛṪṬṮṰ]/g},
		{to: "U", from: /[ÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛȔȖɄᴜṲṴṶṸṺỤỦỨỪỬỮỰ]/g},
		{to: "V", from: /[ƲɅᴠṼṾ]/g},
		{to: "W", from: /[ŴᴡẀẂẄẆẈ]/g},
		{to: "X", from: /[ẊẌ]/g},
		{to: "X", from: /\b(×|VS\.?|CROSS|VERSUS)\b/g},
		{to: "Y", from: /[ÝŶŸƳȲɎʏẎỲỴỶỸ]/g},
		{to: "Z", from: /[ŹŻŽƵȤᴢẐẒẔ]/g},
		{from: /\b(\w+)ING\b/g, to: "$1IN "},
		{from: /ⅰ/ig, to: "I"},
		{from: /ⅱ/ig, to: "II"},
		{from: /ⅲ/ig, to: "III"},
		{from: /ⅳ/ig, to: "IV"},
		{from: /ⅴ/ig, to: "V"},
		{from: /ⅵ/ig, to: "VI"},
		{from: /ⅶ/ig, to: "VII"},
		{from: /ⅷ/ig, to: "VIII"},
		{from: /ⅸ/ig, to: "IX"},
		{from: /ⅹ/ig, to: "X"},
		{from: /ⅺ/ig, to: "XI"},
		{from: /ⅻ/ig, to: "XII"},
		{from: /[\u0021-\u002F\u003A-\u003F\u005B-\u0060\u007B-\u00BF\u2000-\u2064\u2190-\u21FF\u2460-\u27FF\u2960-\u2B59\u3000-\u3030\u30FB\uFF5E-\uFF65]+/g, to: ""},
		{from: /\s+|\BS\b|^(?:AN?|THE)\s+|\s+(?:AN?|THE)$/g, to: ""}
	];
	for (let s = 0; s < simplifications.length; s++) {
		genericTitle = genericTitle.replace(simplifications[s].from, simplifications[s].to);
	}
	return genericTitle;
}
function toHalfWidth(s) {
	return s.replace(/[\uff01-\uff5d]/g, function(a) {
		return String.fromCharCode(a.charCodeAt(0) - 65248);
	}).replace(/\u3000/g, "\u0020").replace(/\uff5e/g, "\u301c");
}
function HTMLToText(HTMLBlurb) {
	var decoder = document.createElement("div");
	decoder.innerHTML = HTMLBlurb;
	return decoder.textContent;
}
function chrono(minimumDelay) {
	if (minimumDelay) {
		var del = minimumDelay + lastTick - new Date().getTime();
		del = del > 0 ? del : 0;
		return del;
	} else {
		lastTick = new Date().getTime();
		return lastTick;
	}
}
function RGRecordingsMassMergeGUI() {
	var MMRdiv = createTag("div", {a: {id: userjs.id}, e: {
		keydown: function(event) {
			if (event.target == editNote && !event[CONTROL_POMME.alt.key] && event[CONTROL_POMME.ctrl.key] && !event[CONTROL_POMME.shift.key]) {
				switch (event.key) {
					case "s":
						return saveEditNote(event);
					case "o":
						return loadEditNote(event);
				}
			}
		},
		click: loadRGRecordings
	}}, [
		createTag("h2", {}, userjs.name),
		createTag("p", {}, "version " + userjs.version),
		createTag("p", {a: {"class": "main-shortcut"}}, ["☞ ", CONTROL_POMME.ctrl_shift.label, "M"]),
		// createTag("p", {s: {marginBottom: "0px!"}}, ["Remote release", createTag("span", {a: {"class": "remote-release-link"}}), ":"]),
	]);
	mergeStatus = MMRdiv.appendChild(createInput("text", "mergeStatus", "", userjs.name + " loading recordings…"));
	mergeStatus.style.setProperty("width", "100%");
	MMRdiv.appendChild(createTag("p", {s: {marginBottom: "0px"}}, "Merge edit notes:"));
	editNote = MMRdiv.appendChild(createInput("textarea", "merge.edit_note"));
	var lastEditNote = (localStorage && localStorage.getItem(userjs.id + "_RG"));
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
	MMRdiv.appendChild(createTag("p", {}, ["☞ ", CONTROL_POMME.ctrl.label, "S", ": ", saveEditNoteButt, document.createElement("br"), "☞ ", CONTROL_POMME.ctrl.label, "O", ": ", loadEditNoteButt]));
	MMRdiv.appendChild(createTag("p", {}, "Each recording merge will automatically target the oldest MBID."));
	queuetrack = MMRdiv.appendChild(createTag("div", {s: {textAlign: "center", backgroundColor: cInfo, display: "none"}}, "\u00A0"));
	return MMRdiv;
}
function loadRGRecordings() {
	if (!document.body.classList.contains(userjs.id)) {
		document.body.classList.add(userjs.id);
	}
	setTimeout(loadingAllRecordings, 10);
}
function loadingAllRecordings() {
	// https://musicbrainz.org/ws/2/recording?query=rgid%3A434a0e80-f6b7-3658-961b-07c373fa9cd5&fmt=json
	// but this way we are missing row ID that are necessary for merge
	// should use releases.pop() instead, even if slower and clumsier
	// or defer row ID fetching until when we actually want to merge the recordings (like in Loujine acoustid.org recording merge script)
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function(event) {
		if (this.status == 200) {
			if (this.response.recordings.length > 0) {
				appendToRecordingList(this.response.recordings);
				if (this.response.count > 100) {
					if (document.querySelector("div#page")) { // TODO: copy MB_banner to MB JUNK SHOP, from TAG_TOOLS tag rename branch
						document.body.insertBefore(
							createTag("div", {a: {class: "banner editing-disabled"}}, createTag("p", {}, [
								"ACHTÜNG: ", this.response.count - 100, " recordings are missing! — ",
								createTag("a", {a: {href: "https://tickets.musicbrainz.org/browse/MBS-12154", target: "_blank"}}, "MBS-12154")
							])),
							document.querySelector("div#page")
						);
					} else {
						alert("WARNING\n" + (this.response.count - 100) + " recordings are missing! — MBS-12154");
					}
				}
			}
			// alert(this.response.count > this.response.offset + this.response.recordings.length); // true: next page
			// 122 recordings: https://musicbrainz.org/release-group/98e078fe-37d9-43f7-8bb4-96526727c4e0
		} else {
			alert("Error loading RG recordings!");
		}
	});
	xhr.open("GET", "/ws/2/recording?query=rgid%3A" + release_group_MBID[1] + "&limit=100", true);
	xhr.responseType = "json";
	xhr.setRequestHeader("Accept", "application/json");
	setTimeout(function() { xhr.send(null); }, chrono(MBSminimumDelay));
}
function appendToRecordingList(recordings) {
	scrollTo(0, 0);
	var recordingList = document.querySelector("div#content > table.tbl." + userjs.id + "reclist > tbody");
	if (!recordingList) {
		// initiate empty recording list (table)
		document.querySelector("div#content").insertBefore(createTag("h2", {}, "Recordings"), document.querySelector("div#content > div.annotation"));
		recordingList = document.querySelector("div#content").insertBefore(createTag("table", {a: {class: userjs.id + "reclist tbl"}}, [
			createTag("thead", {}, [
				createTag("th", {}, "#"),
				// createTag("th", {a: {class: "checkbox-cell"}}, createTag("input", {a: {type: "checkbox"}})),
				createTag("th", {}, "Recording"),
				createTag("th", {}, "Artist"),
				createTag("th", {}, "ISRCs"),
				// createTag("th", {}, "AcoustIDs"),
				createTag("th", {}, "Length"),
				createTag("th", {}, ["Releases (including ", createTag("span", {s: {backgroundColor: "#ffc"}}, "from other release groups"), ")"])
			])
		]), document.querySelector("div#content > div.annotation")).appendChild(document.createElement("tbody"));
	}
	for (var r = 0; r < recordings.length; r++) {
		if (!recordingList.querySelector("td > a[href='/recording/" + recordings[r].id + "']")) {
			var recordingRow = createTag("tr", {}, [
				createTag("td", {}, [document.createElement("br"), createTag("code", {}, recordings[r].id.match(/^[^-]+/)[0])]),
				// createTag("td", {}, createTag("input", {a: {type: "checkbox"}})),
				createTag("td", {}, recordingLink(recordings[r])),
				createTag("td", {}, ac2dom(recordings[r]["artist-credit"])),
				createTag("td", {}, ISRCList(recordings[r])),
				createTag("td", {}, time(recordings[r].length)),
				createTag("td", {}, releaseList(recordings[r]))
			]);
			var sortName = stripName(recordingRow.querySelector("td:nth-child(2)").textContent + (recordingRow.querySelector("span.video") ? "_video" : ""));
			for (var rr = 0; rr < recordingList.rows.length; rr++) {
				var recordingSortName = stripName(recordingList.rows[rr].querySelector("td:nth-child(2)").textContent + (recordingList.rows[rr].querySelector("span.video") ? "_video" : ""));
				if (sortName < recordingSortName) {
					recordingList.insertBefore(recordingRow, recordingList.rows[rr]);
					sortName = false;
					break;
				} else if (sortName == recordingSortName) {
					recordingRow.classList.add("sameName");
					recordingList.rows[rr].classList.add("sameName");
				}
			}
			if (sortName != false) {
				recordingList.appendChild(recordingRow);
			}
		}
	}
}
function stripName(name) {
	return name.toLowerCase().replace(/\s/g, "");
}
function recordingLink(recording) {
	var recordingFragment = document.createDocumentFragment();
	if (recording.video) {
		recordingFragment.appendChild(createTag("span", {a: {class: "video", title: "This recording is a video"}}));
	}
	recordingFragment.appendChild(createTag("a", {a: {href: "/recording/" + recording.id, target: "_blank"}}, recording.title));
	if (recording.disambiguation) {
		recordingFragment.appendChild(document.createTextNode(" "));
		recordingFragment.appendChild(createTag("span", {a: {class: "comment"}}, "(" + recording.disambiguation + ")"));
	}
	return recordingFragment;
}
function ISRCList(recording) {
	var list = document.createElement("ul");
	if (recording.isrcs) {
		for (var i = 0; i < recording.isrcs.length; i++) {
			list.appendChild(createTag("li", {}, createA(recording.isrcs[i], "/isrc/" + recording.isrcs[i])));
		}
	}
	return list;
}
function releaseList(recording) {
	var list = document.createElement("table");
	if (recording.releases) {
		for (var r = 0; r < recording.releases.length; r++) {
			// https://tickets.metabrainz.org/browse/MBS-12534 date problems
			var releaseRow = list.appendChild(createTag("tr", {a: {title: recording.releases[r].date || ""}}));
			// .warn-lengths more than 15 seconds diff with rec length, yellow if more than 4 seconds
			var trackLength = releaseRow.appendChild(createTag("td", {}, document.createTextNode(time(recording.releases[r].media[0].track[0].length))));
			var lengthDelta = Math.abs(recording.length - recording.releases[r].media[0].track[0].length);
			if (lengthDelta > safeLengthDelta * 1000) {
				trackLength.style.setProperty("background-color", cNG, "important");
			}
			if (lengthDelta >= largeSpread * 1000) {
				trackLength.classList.add("warn-length");
			}
			// position
			releaseRow.appendChild(createTag("td", {}, [createTag("a", {a: {title: recording.releases[r].media[0].format, href: "/track/" + recording.releases[r].media[0].track[0].id}}, recording.releases[r].media[0].position + "." + (recording.releases[r].media[0]["track-offset"] + 1)), "/", recording.releases[r].media[0]["track-count"]]));
			// release year (MBS-12534 date problems again)
			releaseRow.appendChild(createTag("td", {a: {"data-release-date": recording.releases[r].date || "error"}}, recording.releases[r].date ? recording.releases[r].date.substr(0, 4) : "????"));
			// release link
			var releaseCell = releaseRow.appendChild(createTag("td", {}, createA(recording.releases[r].title, "/release/" + recording.releases[r].id)));
			if (recording.releases[r].disambiguation) {
				releaseCell.appendChild(document.createTextNode(" "));
				releaseCell.appendChild(createTag("span", {a: {class: "comment"}}, "(" + recording.releases[r].disambiguation + ")"));
			}
			// mark when release is in another release group
			if (recording.releases[r]["release-group"].id != release_group_MBID[1]) {
				releaseCell.style.setProperty("background-color", "#ffc", "important");
			}
		}
	}
	sort_elements(list, "release-date");
	MBJS.collapseList(list, "release");
	return list;
}
function sort_elements(container, data_sort) {
	// data_sort = example-haha for data-example-haha
	// dataSort = exampleHaha for dataset.exampleHaha
	var dataSort = data_sort.replace(/-([a-z])/g, function(match, p1) { return p1.toUpperCase(); });
	var elements = Array.from(container.children);
	elements.sort(function(a, b) {
		return a.querySelector("[data-" + data_sort + "]").dataset[dataSort].localeCompare(b.querySelector("[data-" + data_sort + "]").dataset[dataSort]);
	});
	for (var e = 0; e < elements.length; e++) {
		// appenChild will move elements when they already exist
		container.appendChild(elements[e]);
	}
}
