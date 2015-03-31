(function(){var meta=function(){
// ==UserScript==
// @name         mb. MASS MERGE RECORDINGS
// @version      2015.3.31.1754
// @description  musicbrainz.org: Merges selected or all recordings from release A to release B
// @homepage     http://userscripts-mirror.org/scripts/show/120382
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_MASS-MERGE-RECORDINGS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_MASS-MERGE-RECORDINGS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-12-13
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
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
};if(meta&&meta.toString&&(meta=meta.toString()))meta={n:meta.match(/@name\s+(.+)/)[1],v:meta.match(/@version\s+(.+)/)[1],ns:meta.match(/@namespace\s+(.+)/)[1]};
	/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
	/* COLOURS */
	var cOK = "greenyellow";
	var cNG = "pink";
	var cInfo = "gold";
	var cWarning = "yellow";
	var cMerge = "#fcc";
	var cCancel = "#cfc";
	/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	if (document.getElementsByClassName("account").length < 1) { return; }
	var rythm = 1000;
	var coolos = 5000;
	var currentButt;
	var MMRid = "MMR2099userjs120382";
	var MBS = location.protocol+"//"+location.host;
	var sidebar = document.getElementById("sidebar");
	var recid2trackIndex = {remote:{}, local:{}};/*recid:tracks index*/
	var mergeQueue = [];/*contains next mergeButts*/
	var sregex_MBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var regex_MBID = new RegExp(sregex_MBID, "i");
	var css_track = "div#content > table.medium > tbody > tr > td:not(.pos):not(.video) a[href^='/recording/'], td:not(.pos):not(.video) a[href^='"+MBS+"/recording/']";
	css_track = css_track+", "+css_track.replace(MBS, "");/*in case those come back again to no-host URL in the future*/
	var sregex_title = "[^“]+“(.+)” \\S+ (.+) - MusicBrainz";
	var startpos, status, from, to, swap, editNote, queuetrack;
	var rem2loc = "◀";
	var loc2rem = "▶";
	var dtitle = document.title;
	var ltitle = dtitle.match(new RegExp("^"+sregex_title+"$"));
	var localRelease = {
		"release-group": document.querySelector("div.releaseheader > p.subheader a[href*='/release-group/']").getAttribute("href").match(regex_MBID)[0],
		title: ltitle[1],
		comment: document.querySelector("h1 > span.comment > bdi"),
		ac: ltitle[2],
		id: location.pathname.match(regex_MBID)[0],
		tracks: []
	};
	var safeLengthDelta = 4;
	if (localRelease.comment) localRelease.comment = " ("+localRelease.comment.textContent+")"; else localRelease.comment = "";
	var remoteRelease = {"tracks":[]};
	sidebar.insertBefore(mergeRecs(false), sidebar.querySelector("h2"));
	var skipstep;
	function mergeRecsStep(step) {
		skipstep = false;
		var MMR = document.getElementById(MMRid);
		MMR.style.setProperty("display", "block");
		var inputs = MMR.getElementsByTagName("input");
		status = inputs[0];
		from = inputs[1];
		to = inputs[2];
		var statuses = ["cancelling previous merges", "adding recs. to merge", "applying merge edit"];
		var buttStatuses = ["Clearing…", "Stacking…", "Merging…"];
		var urls = ["/recording/merge", "/recording/merge_queue", "/recording/merge"];
		var params = [
			"submit=cancel",
			"add-to-merge="+to.value+"&add-to-merge="+from.value,
			"merge.merging.0="+to.value+"&merge.target="+to.value+"&merge.merging.1="+from.value
		];
		disable(startpos);
		disable(status);
		if (step == 2) {
			disable(editNote);
			params[step] += "&merge.edit_note=";
			var paramsup = MMR.getElementsByTagName("textarea")[0].value.trim();
			if (paramsup != "") paramsup += "\n —\n";
			paramsup += releaseInfoRow("source", swap.value=="no"?remoteRelease:localRelease, swap.value=="no"?recid2trackIndex.remote[from.value]:recid2trackIndex.local[from.value]);
			paramsup += releaseInfoRow("target", swap.value=="no"?localRelease:remoteRelease, swap.value=="no"?recid2trackIndex.local[to.value]:recid2trackIndex.remote[to.value]);
			var targetID = parseInt(to.value, 10);
			var sourceID = parseInt(from.value, 10);
			if (sourceID > targetID) {
				 paramsup += "👍 Targetting '''oldest [MBID]''' ("+format(to.value)+" ← "+format(from.value)+")"+"\n";
			}
			if (almostSame(localRelease.tracks[recid2trackIndex.local[swap.value=="no"?to.value:from.value]].name, remoteRelease.tracks[recid2trackIndex.remote[swap.value=="no"?from.value:to.value]].name)) paramsup += "👍 Same '''track titles''' (case insensitive comparison)\n";
			if (typeof localRelease.tracks[recid2trackIndex.local[swap.value=="no"?to.value:from.value]].length == "number" && typeof remoteRelease.tracks[recid2trackIndex.remote[swap.value=="no"?from.value:to.value]].length == "number") {
				var delta = Math.abs(localRelease.tracks[recid2trackIndex.local[swap.value=="no"?to.value:from.value]].length - remoteRelease.tracks[recid2trackIndex.remote[swap.value=="no"?from.value:to.value]].length);
				if (delta <= safeLengthDelta*1000) paramsup += "👍 "+(delta==0?"Same":"Very close")+" '''track times''' "+(delta==0?"(in milliseconds)":"(within "+safeLengthDelta+" seconds)")+"\n";
			}
			if (localRelease.ac == remoteRelease.ac) paramsup += "👍 Same '''release artist''' “'''"+protectEditNoteText(localRelease.ac)+"'''”\n";
			if (localRelease.title == remoteRelease.title) paramsup += "👍 Same '''release title''' “'''"+protectEditNoteText(localRelease.title)+"'''”\n";
			if (localRelease["release-group"] == remoteRelease["release-group"]) paramsup += "👍 Same '''release group''' ("+MBS+"/release-group/"+localRelease["release-group"]+")\n";
			if (meta) paramsup += " —\n"+meta.n+" ("+meta.v+")";
			params[step] += encodeURIComponent(paramsup);
		}
		infoMerge("#"+from.value+" to #"+to.value+" "+statuses[step]+"…");
		currentButt.setAttribute("value", buttStatuses[step]+" "+step+"/2");
		var xhr = new XMLHttpRequest();
		function releaseInfoRow(sourceOrTarget, rel, trackIndex) {
			return sourceOrTarget+": "+MBS+"/release/"+rel.id+" #'''"+(trackIndex<9?"0":"")+(trackIndex+1)+"'''/"+(rel.tracks.length<10?"0":"")+rel.tracks.length+". “'''"+protectEditNoteText(rel.title)+"'''”"+protectEditNoteText(rel.comment)+" by '''"+protectEditNoteText(rel.ac)+"'''\n";
		}
		function FireFoxWorkAround(butt) {
			enable(butt);
			if (navigator.userAgent.match(/firefox/i)) {
				butt.setAttribute("value", "FF delay…");
				setTimeout(function() { butt.click(); }, 1000);
			} else { butt.click(); }
		}
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					if (step < 2) {
						mergeRecsStep(step+1);
					} else {
						remoteRelease.tracks[recid2trackIndex.remote[swap.value=="no"?from.value:to.value]].recording.editsPending++;
						cleanTrack(localRelease.tracks[recid2trackIndex.local[swap.value=="no"?to.value:from.value]], true);
						infoMerge("#"+from.value+" to #"+to.value+" merged OK", true, true);
						currentButt = null;
						document.title = dtitle;
						enable(startpos);
						enable(status);
						enable(editNote);
						if (nextButt = mergeQueue.shift()) {
							skipstep = true;
							FireFoxWorkAround(nextButt);
						} else {
							var x = scrollX, y = scrollY;
							startpos.focus();
							scrollTo(x, y);
						}
					}
				} else {
					var errormsg = "Error "+xhr.status+", step "+(step+1)+"/3.";
					if (currentButt) {
						errormsg += " Retry in "+Math.ceil(coolos/1000)+" seconds.";
						setTimeout(function(){
							FireFoxWorkAround(currentButt);
						}, coolos);
					}
					infoMerge(errormsg, false, true);
				}
			}
		};
		xhr.open("POST", urls[step], true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Content-length", params[step].length);
		xhr.setRequestHeader("Connection", "close");
		setTimeout(function(){ xhr.send(params[step]); }, rythm);
	}
	function infoMerge(msg, goodNews, reset) {
		status.value = msg;
		if (goodNews != null) { status.style.setProperty("background-color", goodNews?cOK:cNG); }
		else { status.style.setProperty("background-color", cInfo); }
		if (reset) {
			from.value = "";
			to.value = "";
		}
	}
	function queueTrack() {
		queuetrack.replaceChild(document.createTextNode(mergeQueue.length+" queued merge"+(mergeQueue.length>1?"s":"")), queuetrack.firstChild);
		queuetrack.style.setProperty("display", mergeQueue.length>0?"block":"none");
		document.title = "⌛"+(mergeQueue.length+1)+" ‐ "+dtitle;
	}
	function cleanTrack(track, ok) {
		var rmForm = track.tr.querySelectorAll("td:not(.pos):not(.video) form."+MMRid);
		for (var irf=0; irf<rmForm.length; irf++) {
			rmForm[irf].parentNode.removeChild(rmForm[irf]);
		}
		if (ok) {
			mp(track.tr.querySelector(css_track), true);
		} else {
			var lengthcell = track.tr.querySelector("td.treleases");
			if (track.length && lengthcell) {
				lengthcell.replaceChild(document.createTextNode(time(track.length, true)), lengthcell.firstChild);
				lengthcell.style.setProperty("font-family", "monospace");
			}
		}
	}
	function mergeRecs(show) {
		var frg = document.createDocumentFragment();
		var tmp = frg.appendChild(document.createElement("h2"));
		tmp.appendChild(createA("Mass merge recordings"));
		tmp.setAttribute("title", "version "+meta.v);
		tmp.addEventListener("click", function(e) {
			var mm = document.getElementById(MMRid);
			mm.style.setProperty("display", mm.style.getPropertyValue("display")=="none"?"block":"none");
			if (mm.style.getPropertyValue("display")=="block") { mm.getElementsByTagName("input")[0].select(); }
		}, false);
		var MMRdiv = document.createElement("div");
		MMRdiv.setAttribute("id", MMRid);
		MMRdiv.style.setProperty("display", show?"block":"none");
		prints(MMRdiv, ["Each recording merge will automatically target the oldest MBID unless direction is manually changed.", ""], true);
		/*track parsing*/
		startpos = document.createElement("select");
		startpos.style.setProperty("font-size", ".8em");
		startpos.style.setProperty("width", "100%");
		startpos.addEventListener("change", function(e) {
			if (remoteRelease.id && remoteRelease.tracks.length > 0) {
				spreadTracks(e);
			} else {
				status.focus();
			}
		}, false);
		var trs = document.querySelectorAll("div#content > table.tbl > tbody > tr");
		var jsonRelease, scripts = document.querySelectorAll("script:not([src])");
		for (var s=0; s < scripts.length && !jsonRelease; s++) {
			jsonRelease = scripts[s].textContent.match(/MB\.Release\.init\(([^<]+)\)/);
		}
		if (jsonRelease) jsonRelease = JSON.parse(jsonRelease[1]);
		for (var itrs=0, t=0, d=0, dt=0; itrs<trs.length; itrs++) {
			if (!trs[itrs].className.match(/subh/)) {
				var tracka = trs[itrs].querySelector(css_track);
				var recoid = trs[itrs].querySelector("td.rating a.set-rating").getAttribute("href").match(/id=([0-9]+)/)[1];
				var trackname = tracka.textContent;
				var trackLength = trs[itrs].querySelector("td.treleases").textContent.match(/(\d+:)?\d+:\d+/);
				if (trackLength) trackLength = strtime2ms(trackLength[0]);
				localRelease.tracks.push({
					tr: trs[itrs],
					disc: d,
					track: dt,
					a: tracka,
					recid: recoid,
					name: trackname,
					artistCredit: null,
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
				addOption(startpos, t, d+"."+(dt<10?" ":"")+dt+". "+trackname);
				t++;
			} else if (!trs[itrs].querySelector("div.data-track")) {
				d++; dt = 0;
			}
		}
		prints(MMRdiv, "↙ Select start position (track):", true);
		MMRdiv.appendChild(startpos);
		prints(MMRdiv, ["", "Remote release "], false);
		MMRdiv.appendChild(document.createElement("span")).appendChild(document.createTextNode("MBID or URL")).parentNode.className = "remote-release-link";
		prints(MMRdiv, [":"], true);
		status = createInput("text", "status", "", "Remote release MBID or URL");
		status.style.setProperty("width", "100%");
		status.addEventListener("input", function(e) {
			var mbid = this.value.match(new RegExp("/release/("+sregex_MBID+")"));
			if (mbid) {
				this.setAttribute("ref", this.value);
				if (mbid[1] != localRelease.mbid) {
					remoteRelease.id = mbid[1];
					infoMerge("Fetching recordings…");
					loadReleasePage(mbid[1]);
					loadReleaseWS(mbid[1]);
				} else {
					infoMerge("Same release", false);
				}
			}
		}, false);
		MMRdiv.appendChild(status);
		prints(MMRdiv, ["", "Merge edit note:"], true);
		var lastEN = (localStorage && localStorage.getItem(MMRid));
		editNote = MMRdiv.appendChild(createInput("textarea", "merge.edit_note", lastEN?lastEN:""));
		editNote.style.setProperty("width", "100%");
		editNote.setAttribute("rows", "5");
		editNote.addEventListener("select", function(e) {
			this.style.removeProperty("background-color");
			this.removeAttribute("title");
		}, false);
		editNote.addEventListener("change", function(e) {
			if (localStorage) {
				localStorage.setItem(MMRid, this.value);
				this.style.setProperty("background-color", cOK);
				this.setAttribute("title", "Saved to local storage");
			} else {
				this.style.setProperty("background-color", cInfo);
				this.setAttribute("title", "Could not save to local storage");
			}
		}, false);
		from = MMRdiv.appendChild(createInput("hidden", "from", ""));
		to = MMRdiv.appendChild(createInput("hidden", "to", ""));
		swap = MMRdiv.appendChild(createInput("hidden", "swap", "no"));
		tmp = MMRdiv.appendChild(createInput("button", "", "Change all merge directions to "+(swap.value=="no"?loc2rem:rem2loc)));
		tmp.style.setProperty("background-color", cInfo);
		tmp.addEventListener("click", function(e) {
			var allbutts = document.querySelectorAll("input."+MMRid+"dirbutt:not([disabled])");
			for (var iab=0; iab < allbutts.length; iab++) if (allbutts[iab].value != this.value[this.value.length-1]) allbutts[iab].click();
			swap.value = this.value[this.value.length-1]==rem2loc?"no":"yes";
			this.value = this.value.substring(0, this.value.length-1) + (swap.value=="no"?loc2rem:rem2loc);
			this.style.setProperty("background-color", swap.value=="no"?cInfo:cOK);
			startpos.focus();
		}, false);
		tmp = MMRdiv.appendChild(createInput("button", "", "Reset all merge directions to oldest"));
		tmp.addEventListener("click", function(e) {
			var allbutts = document.querySelectorAll("input."+MMRid+"dirbutt:not([disabled])");
			for (var iab=0; iab < allbutts.length; iab++) {
				var remoteRowID = parseInt(allbutts[iab].parentNode.querySelector("input[name='merge.merging.1']").value, 10);
				var localRowID = parseInt(allbutts[iab].parentNode.querySelector("input[name='merge.merging.0']").value, 10);
				if (remoteRowID > localRowID && allbutts[iab].value == loc2rem || remoteRowID < localRowID && allbutts[iab].value == rem2loc) {
					allbutts[iab].click();
				}
			}
			startpos.focus();
		});
		tmp = MMRdiv.appendChild(createInput("button", "", "Merge all found recs"));
		tmp.setAttribute("ref", tmp.value);
		tmp.setAttribute("id", MMRid+"mergeallbutt");
		tmp.style.setProperty("background-color", cMerge);
		tmp.addEventListener("click", function(e) {
			var allbutts = document.getElementsByClassName(MMRid+"mergebutt");
			for (var iab=0; iab<allbutts.length; iab++) {
				if (allbutts[iab].value == "Merge") allbutts[iab].click();
			}
		}, false);
		tmp = MMRdiv.appendChild(createInput("button", "", "Empty merge queue"));
		tmp.style.setProperty("background-color", cCancel);
		tmp.addEventListener("click", function(e) {
			while (mergeQueue.length > 0) {
				var unqueuedbutt = mergeQueue.shift()
				unqueuedbutt.style.setProperty("background-color", cMerge);
				enable(unqueuedbutt);
				unqueuedbutt.setAttribute("value", "Merge");
			}
			queueTrack();
			startpos.focus();
		}, false);
		queuetrack = MMRdiv.appendChild(document.createElement("div"));
		queuetrack.style.setProperty("text-align", "center");
		queuetrack.style.setProperty("background-color", cInfo);
		queuetrack.style.setProperty("display", "none");
		prints(queuetrack, "\u00A0");
		frg.appendChild(MMRdiv);
		return frg;
	}
	function loadReleasePage(mbid) {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function(e) {
			if (this.status == 200) {
				var recIDx5 = this.responseText.match(/entity_id=[0-9]+&amp;entity_type=recording/g);
				var trackRows = this.responseText.match(/<tr.+>[\s\S]+?<td class="treleases">[\s\S]+?<\/tr>/g);
				var trackInfos = this.responseText.match(new RegExp("<a href=\""+MBS+"/recording/"+sregex_MBID+"\"( title=\"[^\"]*\")?><bdi>[^<]*</bdi></a>", "g"));
				var trackTimes = this.responseText.match(/<td class="treleases">[^<]*<\/td>/g);
				var rtitle = this.responseText.match(new RegExp("<title>"+sregex_title+"</title>"));
				var releaseAC = this.responseText.match(/\s+Release by (<.+>)/);
				if (recIDx5 && trackInfos && trackTimes && rtitle) {
					var recIDs = [];
					for (var i5 = 0; i5 < recIDx5.length; i5 += 5) {
						recIDs.push(recIDx5[i5].match(/id=([0-9]+)/)[1]);
					}
					remoteRelease["release-group"] = this.responseText.match(/\((?:<span[^>]*>)?<a href=".*\/release-group\/([^"]+)">(?:<bdi>)?[^<]+(?:<\/bdi>)?<\/a>(?:<\/span>)?\)/)[1];
					remoteRelease.title = rtitle[1];
					remoteRelease.comment = this.responseText.match(/<h1>.+  <span class="comment">\(<bdi>([^<]+)<\/bdi>\)<\/span><\/h1>/);
					if (remoteRelease.comment) remoteRelease.comment = " ("+remoteRelease.comment[1]+")"; else remoteRelease.comment = "";
					remoteRelease.ac = rtitle[2];
					var mbidInfo = document.getElementById(MMRid).querySelector(".remote-release-link");
					removeChildren(mbidInfo);
					prints(mbidInfo, "(");
					mbidInfo.appendChild(createA(remoteRelease.id, "/release/"+mbid));
					prints(mbidInfo, ")");
					remoteRelease.tracks = [];
					for (var t = 0; t < recIDs.length; t++) {
						var trackLength = trackTimes[t].match(/(\d+:)?\d+:\d+/);
						if (trackLength) trackLength = strtime2ms(trackLength[0]);
						remoteRelease.tracks.push({
							number: trackRows[t].match(new RegExp("<td class=\"pos[\\s\\S]+?<a href=\""+MBS+"/track/"+sregex_MBID+"\">(.*?)</a>"))[1],
							name: trackInfos[t].match(/<bdi>([^<]*)<\/bdi>/)[1],
							artistCredit: trackRows[t].match(/<td>/g).length>1?trackRows[t].match(/[\s\S]*(<td>[\s\S]+?<\/td>)/)[1]:releaseAC[1],
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
//									for (var rd=0; rd < jsonRelease.mediums.length; rd++) {
//										for (var rt=0; rt < jsonRelease.mediums[rd].tracks.length; rt++) {
//											remoteRelease.tracks.push(jsonRelease.mediums[rd].tracks[rt]);
//											recid2trackIndex.remote[jsonRelease.mediums[rd].tracks[rt].recording.rowid] = remoteRelease.tracks.length - 1;
//										}
//									}
//									jsonRelease = null;/*maybe it frees up memory*/
					//(re)build negative startpos
					var negativeOptions = startpos.querySelectorAll("option[value^='-']");
					for (var nopt = 0; nopt < negativeOptions.length; nopt++) {
						removeElement(negativeOptions[nopt]);
					}
					for (var rtrack = 0; rtrack < remoteRelease.tracks.length-1; rtrack++) {
						addOption(startpos, 0-rtrack-1, 0-rtrack-1, true);
					}
					spreadTracks(e);
				}
			} else {
				infoMerge("This is not a valid release", false);
			}
		});
		xhr.open("GET", "/release/"+mbid, true);
		xhr.send(null);
	}
	function loadReleaseWS(mbid) {
	}
	function spreadTracks(e) {
		var rtrack = startpos.value<0?0-startpos.value:0;
		for (var ltrack=0; ltrack < localRelease.tracks.length; ltrack++) {
			cleanTrack(localRelease.tracks[ltrack]);
			if(ltrack >= startpos.value && rtrack < remoteRelease.tracks.length) {
				var ntitl = "local recording #"+localRelease.tracks[ltrack].recid;
				var ntit = localRelease.tracks[ltrack].a.getAttribute("title");
				if (!ntit || (ntit && !ntit.match(new RegExp(ntitl)))) {
					localRelease.tracks[ltrack].a.setAttribute("title", (ntit?ntit+" — ":"")+ntitl);
				}
				var rmForm = document.createElement("form");
				rmForm.setAttribute("action", "/recording/merge");
				rmForm.setAttribute("method", "post");
//				rmForm.setAttribute("title", "AC: "+ac2str(remoteRelease.tracks[rtrack].artistCredit)+"\nremote recording #"+remoteRelease.tracks[rtrack].recording.rowid);
				rmForm.setAttribute("title", "remote recording #"+remoteRelease.tracks[rtrack].recording.rowid);
				rmForm.setAttribute("class", MMRid);
				rmForm.style.setProperty("display", "inline");
				rmForm.appendChild(createInput("hidden", "merge.merging.0", localRelease.tracks[ltrack].recid));
				rmForm.appendChild(createInput("hidden", "merge.target", localRelease.tracks[ltrack].recid));
				rmForm.appendChild(createInput("hidden", "merge.merging.1", remoteRelease.tracks[rtrack].recording.rowid));
				rmForm.appendChild(createInput("hidden", "merge.edit_note", "mass rec merger"));
				if (remoteRelease.tracks[rtrack].recording.rowid != localRelease.tracks[ltrack].recid) {
					rmForm.style.setProperty("background-color", cWarning);
					var dirButt = rmForm.appendChild(createInput("button", "direction", swap.value=="no"?rem2loc:loc2rem));
					dirButt.setAttribute("class", MMRid+"dirbutt");
					dirButt.style.setProperty("background-color", swap.value=="no"?cOK:cInfo);
					dirButt.style.setProperty("padding", "0 1em .5em 1em");
					dirButt.style.setProperty("margin", "0 4px");
					dirButt.addEventListener("click", function(e) {
						this.value = this.value==rem2loc?loc2rem:rem2loc;
						this.style.setProperty("background-color", this.value==rem2loc?cOK:cInfo);
					}, false);
					var remrec = rmForm.appendChild(createA(remoteRelease.tracks[rtrack].number+". “", "/recording/"+remoteRelease.tracks[rtrack].recording.id));
					if (remoteRelease.tracks[rtrack].isDataTrack) {
						remrec.parentNode.insertBefore(MBicon("data-track icon img"), remrec);
					}
					if (remoteRelease.tracks[rtrack].recording.video) {
						remrec.parentNode.insertBefore(MBicon("video is-video icon img"), remrec);
					}
					var rectitle = remrec.appendChild(document.createElement("span"));
					rectitle.appendChild(document.createTextNode(remoteRelease.tracks[rtrack].name));
					remrec.appendChild(document.createTextNode("” "));
					if (almostSame(remoteRelease.tracks[rtrack].name, localRelease.tracks[ltrack].name)) {
						rectitle.style.setProperty("background-color", cOK);
						rectitle.setAttribute("title", "(almost) same title");
					}
					if (remoteRelease.tracks[rtrack].recording.editsPending > 0) {
						remrec = mp(remrec, true);
					}
					var reclen = remrec.appendChild(document.createElement("span"));
					reclen.style.setProperty("float", "right");
					reclen.style.setProperty("font-family", "monospace");
					reclen.appendChild(document.createTextNode(" "+time(remoteRelease.tracks[rtrack].length, true)));
					if (typeof localRelease.tracks[ltrack].length == "number" && typeof remoteRelease.tracks[rtrack].length == "number") {
						var delta = Math.abs(localRelease.tracks[ltrack].length - remoteRelease.tracks[rtrack].length);
						if (delta != false && delta > safeLengthDelta*1000) {
							if (delta >= 15*1000) {/*MBS-7417:MBS/lib/MusicBrainz/Server/Edit/Utils.pm*/
								reclen.style.setProperty("color", "red");
								reclen.style.setProperty("background-color", "black");
								reclen.setAttribute("title", "MORE THAN "+15+" SECONDS DIFFERENCE");
							} else {
								reclen.style.setProperty("background-color", cNG);
								reclen.setAttribute("title", "more than "+safeLengthDelta+" seconds difference");
							}
						} else {
							reclen.style.setProperty("background-color", delta&&delta>500?cWarning:cOK);
						}
					}
					rmForm.appendChild(document.createTextNode(" by "));
//					rmForm.appendChild(ac2dom(remoteRelease.tracks[rtrack].artistCredit));
					var AC = document.createElement("span");
					AC.innerHTML = remoteRelease.tracks[rtrack].artistCredit;
					rmForm.appendChild(AC);
					var mergeButt = rmForm.appendChild(createInput("button", "", "Merge"));
					mergeButt.setAttribute("class", MMRid+"mergebutt");
					mergeButt.style.setProperty("background-color", cMerge);
					mergeButt.style.setProperty("float", "right");
					mergeButt.addEventListener("click", function(e) {
						disable(this);
						var swapbutt = this.parentNode.getElementsByTagName("input")[4];
						disable(swapbutt)
						this.style.setProperty("background-color", cInfo);
						var swapped = (swapbutt.value == loc2rem);
						var mergeFrom = this.parentNode.getElementsByTagName("input")[swapped?0:2].value;
						var mergeTo = this.parentNode.getElementsByTagName("input")[swapped?2:0].value;
						if (from.value == "") {
							from.value = mergeFrom;
							to.value = mergeTo;
							swap.value = (swapped?"yes":"no");
							currentButt = this;
							mergeRecsStep(skipstep?1:0);
						} else if (mergeQueue.indexOf(this) == -1 && from.value != mergeFrom && to.value != mergeTo) {
							this.value = "Unqueue";
							enable(this);
							enable(swapbutt);
							mergeQueue.push(this);
						} else if ((where = mergeQueue.indexOf(this)) > -1) {
							mergeQueue.splice(where, 1);
							this.value = "Merge";
							enable(this);
							enable(swapbutt);
							this.style.setProperty("background-color", cInfo);
						} else {
							enable(this);
							enable(swapbutt);
							this.style.setProperty("background-color", cWarning);
							this.value += " error?";
						}
						queueTrack();
					}, false);
				} else {
					rmForm.style.setProperty("background-color", cCancel);
					prints(rmForm, " (same recording) ");
					rmForm.appendChild(createA(remoteRelease.tracks[rtrack].name, localRelease.tracks[ltrack].a.getAttribute("href")));
				}
				if (!localRelease.tracks[ltrack].a.parentNode) {
					localRelease.tracks[ltrack].a = localRelease.tracks[ltrack].tr.querySelector(css_track);
				}
				var tracktd = getParent(localRelease.tracks[ltrack].a, "td");
				var bestPos = tracktd.querySelector("td > span.mp");
				bestPos = bestPos?bestPos:localRelease.tracks[ltrack].a;
				if (recdis = tracktd.querySelector("span.userjs81127recdis")) { bestPos = recdis; }
				addAfter(rmForm, bestPos);
				if (remoteRelease.tracks[rtrack].recording.rowid != localRelease.tracks[ltrack].recid) {
					var remoteRowID = parseInt(remoteRelease.tracks[rtrack].recording.rowid, 10);
					var localRowID = parseInt(localRelease.tracks[ltrack].recid, 10);
					var dirbutt = rmForm.querySelector("input[type='button']."+MMRid+"dirbutt");
					if (remoteRowID > localRowID && dirbutt.value == loc2rem || remoteRowID < localRowID && dirbutt.value == rem2loc) {
						dirbutt.click();
					}
				}
				rtrack++;
			}
		}
		var mergebutts = document.getElementsByClassName(MMRid+"mergebutt").length;
		infoMerge("Recordings loaded, "+mergebutts+" ready to merge", true);
		var mergeallbutt = document.getElementById(MMRid+"mergeallbutt");
		mergeallbutt.value = mergeallbutt.getAttribute("ref").replace(/all/, mergebutts);
		if (mergebutts == 1) mergeallbutt.value = mergeallbutt.value.replace(/recs/, "rec");
		if (mergebutts == 0) disable(mergeallbutt);
		else enable(mergeallbutt);
		if (mergebutts > 0 && e && e.type && e.type == "load") startpos.focus();
	}
	function disable(o, dis) {
		if (!o.tagName && o.length) for (io=0; io<o.length; o++) disable(o[io], dis);
		else if (dis == null || dis == true) o.setAttribute("disabled", "disabled");
		else o.removeAttribute("disabled");
	}
	function enable (o) {
		disable(o, false);
	}
	function createA(text, link) {
		var a = document.createElement("a");
		if (link) {
			a.setAttribute("href", link);
			a.setAttribute("target", "_blank");
		} else {
			a.style.setProperty("cursor", "pointer");
		}
		prints(a, text);
		return a;
	}
	function createInput(type, name, value, placeholder) {
		var input;
		if (type == "textarea") {
			input = document.createElement("textarea");
			prints(input, value);
		} else {
			input = document.createElement("input");
			input.setAttribute("type", type);
			input.setAttribute("value", value);
		}
		if (placeholder) input.setAttribute("placeholder", placeholder);
		input.setAttribute("name", name);
		input.style.setProperty("font-size", ".8em");
		if (type == "text") {
			input.addEventListener("focus", function(e) {
				this.select();
			}, false);
		}
		return input;
	}
	function addOption(select, value, text, insert) {
		var option = document.createElement("option");
		option.setAttribute("value", value);
		option.appendChild(document.createTextNode(text));
		return insert&&select.firstChild?select.insertBefore(option, select.firstChild):select.appendChild(option);
	}
	function addAfter(n, e) {
		if (n && e && e.parentNode) {
			if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
			else { return e.parentNode.appendChild(n); }
		} else { return null; }
	}
	function prints(obj, text, newline) {
		var texts;
		if (typeof text == "string") { texts = [text]; }
		else { texts = text; }
		for (var i=0; i<texts.length; i++) {
			obj.appendChild(document.createTextNode(texts[i]));
			if (newline) { obj.appendChild(document.createElement("br")); }
		}
	}
	function mp(o, set) {
		if (set == null || typeof set != "boolean") {
			return o.parentNode.tagName == "SPAN" && o.parentNode.className == "mp";
		} else if (set && !mp(o)) {
			var smp = document.createElement("span");
			smp.className = "mp";
			o.parentNode.replaceChild(smp.appendChild(o.cloneNode(true)).parentNode, o);
			return smp.firstChild;
		} else if (!set && mp(o)) {
			o.parentNode.parentNode.replaceChild(o.cloneNode(true), o.parentNode)
		}
	}
	function getParent(obj, tag, cls) {
	        var cur = obj;
	        if (cur.parentNode) {
	                cur = cur.parentNode;
	                if (cur.tagName.toUpperCase() == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
	                        return cur;
	                } else {
	                        return getParent(cur, tag, cls);
	                }
	        } else {
	                return null;
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
		var ms = typeof _ms=="string"?parseInt(_ms,10):_ms;
		if (ms > 0) {
			var d = new Date();
			d.setTime(ms);
			return /*milliseconds temporary hidden*/(d.getUTCHours()>0?d.getUTCHours()+":":"")+(pad&&d.getMinutes()<10?(d.getUTCHours()>0?"0":" "):"")+d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds()/*+(pad||d.getMilliseconds()>0?"."+(d.getMilliseconds()<100?"0":"")+(d.getMilliseconds()<10?"0":"")+d.getMilliseconds():"")*/;
		}
		return "?:??";
	}
	function format(number) {
		/* thanks to http://snipplr.com/view/72657/thousand-separator */
		return (number+"").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
	}
	function ac2str(ac) {
		var str = "";
		for (var c=0; c<ac.length; c++) {
			str += ac[c].name+ac[c].joinPhrase;
		}
		return str;
	}
	function ac2dom(ac) {
		if (typeof ac == "string") return document.createTextNode(ac);
		var dom = document.createDocumentFragment();
		for (var c=0; c<ac.length; c++) {
			var a = createA(ac[c].name, "/artist/"+ac[c].artist.id);
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
	function protectEditNoteText(text) {
		return text.replace(/\'/g, "&#x0027;");
	}
	function MBicon(iconCss) {
		var icon = document.createElement("div");
		icon.className = iconCss;
		icon.style.setProperty("margin-right", "4px");
		return icon;
	}
	function removeElement(node) {
		return node.parentNode.removeChild(node);
	}
	function removeChildren(p) {
		while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
	}
	function almostSame(a, b) {
		return looseTitle(a) == looseTitle(b);
	}
	function looseTitle(title) {
		return fw2hw(title).toUpperCase().replace(/[\s\u0021-\u002f\u003a-\u003f\u005b-\u0060\u007b-\u00bf\u2000-\u2064\u2190-\u21ff\u2460-\u27ff\u2960-\u2b59\uff5e-\uff65]+|S\b/g, "");
	}
	function fw2hw(s) {
		return s.replace(/[\uff01-\uff5d]/g, function(a) {
			return String.fromCharCode(a.charCodeAt(0)-65248);
		}).replace(/\u3000/g, "\u0020").replace(/\uff5e/g, "\u301c");
	}
})();