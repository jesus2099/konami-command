(function(){var meta=function(){
// ==UserScript==
// @name         mb. MASS MERGE RECORDINGS
// @version      2014.0616.1804
// @description  musicbrainz.org: Merges selected or all recordings from release A to release B
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_MASS-MERGE-RECORDINGS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_MASS-MERGE-RECORDINGS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011.12.13.
// @grant        none
// @include      http*://*musicbrainz.org/release/*
// @include      http://*.mbsandbox.org/release/*
// @exclude      *://*musicbrainz.org/release/*/*
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
	var cSwap = "#ccf";
	/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	if (document.getElementsByClassName("account").length < 1) { return; }
	var rythm = 1000;
	var coolos = 5000;
	var currentButt;
	var MMRid = "MMR2099userjs120382";
	var MBS = location.protocol+"//"+location.host;
	var sidebar = document.getElementById("sidebar");
	var recid2trackIndex = {};/*recid:tracks index*/
	var mergeQueue = [];/*contains next mergeButts*/
	var regex_MBID = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
	var sregex_title = "[^“]+“(.+)” \\S+ (.+) - MusicBrainz";
	var startpos, status, from, to, swap, editNote, queuetrack;
	var rem2loc = "\u25c0";
	var loc2rem = "\u25b6";
	var ltitle = document.title.match(new RegExp("^"+sregex_title+"$"));
	var localRelease = {
		"rg": document.querySelector("div.releaseheader > p.subheader a[href*='/release-group/']").getAttribute("href").match(regex_MBID)[0],
		"title": ltitle[1],
		"comment": document.getElementsByTagName("h1")[0].textContent.match(new RegExp("^"+ltitle[1]+"  (\(.*\))$")),
		"ac": ltitle[2],
		"mbid": location.pathname.match(regex_MBID)[0],
		"tracks":[]
	};
	if (localRelease.comment) localRelease.comment = " "+localRelease.comment[1]; else localRelease.comment = "";
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
		var params = ["submit=cancel", "add-to-merge="+to.value+"&add-to-merge="+from.value, "merge.merging.0="+to.value+"&merge.target="+to.value+"&merge.merging.1="+from.value+"&merge.edit_note="+encodeURIComponent(MMR.getElementsByTagName("textarea")[0].value.trim()+(MMR.getElementsByTagName("textarea")[0].value.trim().length>0?"\n —\n":""))];
		if (step == 2) {
			var paramsup = releaseInfoRow("source", swap.value=="no"?remoteRelease:localRelease);
			paramsup += releaseInfoRow("target", swap.value=="no"?localRelease:remoteRelease);
			if (localRelease.ac == remoteRelease.ac) {
				paramsup += "'''SAME RELEASE ARTIST''' "+localRelease.ac+"\n";
			}
			if (localRelease.title == remoteRelease.title) {
				paramsup += "'''SAME RELEASE TITLE''' “"+localRelease.title+"”\n";
			}
			if (localRelease.rg == remoteRelease.rg) {
				paramsup += "'''SAME RELEASE GROUP''' "+MBS+"/release-group/"+localRelease.rg+"\n";
			}
			params[2] += encodeURIComponent(paramsup) + (meta?" —\n'''"+meta.n+"''' ("+meta.ns+") "+meta.v:"");
		}
		infoMerge("#"+from.value+" to #"+to.value+" "+statuses[step]+"…");
		currentButt.setAttribute("value", buttStatuses[step]+" "+step+"/2");
		var xhr = new XMLHttpRequest();
		function releaseInfoRow(hdr, rel) {
			return hdr+": “'''''"+rel.title+"'''''”"+rel.comment+" ("+rel.tracks.length+" tracks) "+MBS+"/release/"+rel.mbid+" by '''"+rel.ac+"'''\n";
		}
		function FuckingFireFrox(butt) {
			butt.removeAttribute("disabled");
			if (/*LAME*/navigator.userAgent.match(/firefox/i)) {
				butt.setAttribute("value", "(F)FF delay…");
				setTimeout(function() { butt.click(); }, 1000);
			}
			else { butt.click(); }
		}
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					if (step < 2) {
						mergeRecsStep(step+1);
					} else {
						cleanTrack(localRelease.tracks[recid2trackIndex[swap.value=="yes"?from.value:to.value]], true);
						infoMerge("#"+from.value+" to #"+to.value+" merged OK", true, true);
						currentButt = null;
						if (nextButt = mergeQueue.shift()) {
							skipstep = true;
							FuckingFireFrox(nextButt);
						}
					}
				}
				else {
					var errormsg = "Error "+xhr.status+", step "+(step+1)+"/3.";
					if (currentButt) {
						errormsg += " Retry in "+Math.ceil(coolos/1000)+" seconds.";
						setTimeout(function(){
							FuckingFireFrox(currentButt);
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
	}
	function cleanTrack(track, ok) {
		var td = track.tr.querySelector("td:not(.pos):not(.video)");
		var rmForm = td.getElementsByTagName("form");
		if (rmForm) {
			for (var irf=0; irf<rmForm.length; irf++) {
				if (rmForm[irf].className == MMRid) {
					rmForm[irf].parentNode.removeChild(rmForm[irf]);
				}
			}
		}
		if (ok) {
			mp(track.tr.querySelector("a"), true);
		}
	}
	function mergeRecs(show) {
		var frg = document.createDocumentFragment();
		var tmp = frg.appendChild(document.createElement("h2"));
		tmp.appendChild(createA("Mass merge recordings"));
		tmp.addEventListener("click", function(e) {
			var mm = document.getElementById(MMRid);
			mm.style.setProperty("display", mm.style.getPropertyValue("display")=="none"?"block":"none");
			if (mm.style.getPropertyValue("display")=="block") { mm.getElementsByTagName("input")[0].select(); }
		}, false);
		var MMRdiv = document.createElement("div");
		MMRdiv.setAttribute("id", MMRid);
		MMRdiv.style.setProperty("display", show?"block":"none");
		prints(MMRdiv, ["Current page will be the target for each recording merge.", ""], true);
		/*track parsing*/
		startpos = document.createElement("select");
		startpos.style.setProperty("font-size", ".8em");
		startpos.style.setProperty("width", "100%");
		startpos.addEventListener("change", function(e) {
			if (remoteRelease.tracks.length > 0) {
				status.focus();
			} else {/*i know it is dumb, it is for future clever stuff if time (no reload source release)*/
				status.focus();
			}
		}, false);
		var trs = document.querySelectorAll("div#content > table.tbl > tbody > tr");
		for (var itrs=0, t=0, d=0, dt=0; itrs<trs.length; itrs++) {
			if (!trs[itrs].className.match(/subh/)) {
				var tracka = trs[itrs].querySelector("td:not(.pos):not(.video) a[href^='/recording/']");
				var recid = trs[itrs].querySelector("td.rating a.set-rating").getAttribute("href").match(/id=([0-9]+)/)[1];
				localRelease.tracks.push({"tr": trs[itrs], "disc": d, "track": ++dt, "a": tracka, "recid": recid});
				recid2trackIndex[recid] = t;
				addOption(startpos, t, d+"."+(dt<10?" ":"")+dt+". "+tracka.textContent);
				t++
			}
			else {
				d++; dt = 0;
			}
		}
		prints(MMRdiv, "\u2199 Select start position (track):", true);
		MMRdiv.appendChild(startpos);
		prints(MMRdiv, ["", "Source release MBID or URL:"], true);
		status = createInput("text", "status", "", "Source release MBID or URL");
		status.style.setProperty("width", "100%");
		status.addEventListener("keyup", function(e) {
			var mbid = this.value.match(regex_MBID);
			if (mbid) {
				this.setAttribute("ref", this.value);
				var url = "/release/"+mbid[0];
				remoteRelease.mbid = mbid[0];
				infoMerge("Fetching recordings…");
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(e) {
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							var jsonRelease = JSON.parse(xhr.responseText.match(/MB\.Release\.init\(([^<]+)\)/)[1].trim());
							var rtitle = xhr.responseText.match(/<title>[^“]+“(.+)” \S+ (.+) - MusicBrainz<\/title>/)[1];
							var rtitle = xhr.responseText.match(new RegExp("<title>"+sregex_title+"</title>"));
							remoteRelease.rg = xhr.responseText.match(/\(<a href=".*\/release-group\/([^"]+)">[^<]+<\/a>\)/)[1];
							remoteRelease.title = rtitle[1];
							remoteRelease.comment = xhr.responseText.match(/<h1>.+  <span class="comment">\(<bdi>([^<]+)<\/bdi>\)<\/span><\/h1>/);
							if (remoteRelease.comment) remoteRelease.comment = " ("+remoteRelease.comment[1]+")"; else remoteRelease.comment = "";
							remoteRelease.ac = rtitle[2];
							if (jsonRelease) {
								remoteRelease.tracks = [];
								for (var rd=0; rd < jsonRelease.mediums.length; rd++) {
									for (var rt=0; rt < jsonRelease.mediums[rd].tracks.length; rt++) {
										remoteRelease.tracks.push(jsonRelease.mediums[rd].tracks[rt]);
									}
								}
								jsonRelease = null;/*maybe it frees up memory*/
								for (var ltrack=0, rtrack=0; ltrack < localRelease.tracks.length; ltrack++) {
									cleanTrack(localRelease.tracks[ltrack]);
									if(ltrack >= startpos.value && rtrack < remoteRelease.tracks.length) {
										var ntitl = "local recording #"+localRelease.tracks[ltrack].recid;
										var ntit = localRelease.tracks[ltrack].a.getAttribute("title");
										if (!ntit || (ntit && !ntit.match(new RegExp(ntitl)))) {
											localRelease.tracks[ltrack].a.setAttribute("title", (ntit?ntit+" \u2014\u00A0":"")+ntitl);
										}
										rmForm = document.createElement("form");
										rmForm.setAttribute("action", "/recording/merge");
										rmForm.setAttribute("method", "post");
										rmForm.setAttribute("title", "remote recording #"+remoteRelease.tracks[rtrack].recording.id);
										rmForm.setAttribute("class", MMRid);
										rmForm.style.setProperty("display", "inline");
										rmForm.appendChild(createInput("hidden", "merge.merging.0", localRelease.tracks[ltrack].recid));
										rmForm.appendChild(createInput("hidden", "merge.target", localRelease.tracks[ltrack].recid));
										rmForm.appendChild(createInput("hidden", "merge.merging.1", remoteRelease.tracks[rtrack].recording.id));
										rmForm.appendChild(createInput("hidden", "merge.edit_note", "mass rec merger"));
										if (remoteRelease.tracks[rtrack].recording.id != localRelease.tracks[ltrack].recid) {
											rmForm.style.setProperty("background-color", cWarning);
											var dirButt = rmForm.appendChild(createInput("button", "direction", rem2loc));
											dirButt.setAttribute("class", MMRid+"dirbutt");
											dirButt.style.setProperty("background-color", cSwap);
											dirButt.style.setProperty("font-size", "1em");
											dirButt.style.setProperty("padding", "0 1em .5em 1em");
											dirButt.style.setProperty("margin", "0 4px");
											dirButt.addEventListener("click", function(e) {
												this.value = (this.value == rem2loc?loc2rem:rem2loc);
											}, false);
											rmForm.appendChild(createA(remoteRelease.tracks[rtrack].number+". “"+remoteRelease.tracks[rtrack].name+"” ("+time(remoteRelease.tracks[rtrack].length)+")", "/recording/"+remoteRelease.tracks[rtrack].recording.gid));
											var mergeButt = rmForm.appendChild(createInput("button", "", "Merge"));
											mergeButt.setAttribute("class", MMRid+"mergebutt");
											mergeButt.style.setProperty("background-color", cMerge);
											mergeButt.style.setProperty("float", "right");
											mergeButt.addEventListener("click", function(e) {
												this.setAttribute("disabled", "disabled");
												this.style.setProperty("background-color", cInfo);
												var swapped = (this.parentNode.getElementsByTagName("input")[4].value == loc2rem);
												var mergeFrom = this.parentNode.getElementsByTagName("input")[swapped?0:2].value;
												var mergeTo = this.parentNode.getElementsByTagName("input")[swapped?2:0].value;
												if (from.value == "") {
													from.value = mergeFrom;
													to.value = mergeTo;
													swap.value = (swapped?"yes":"no");
													currentButt = this;
													mergeRecsStep(skipstep?1:0);
												}
												else if (mergeQueue.indexOf(this) == -1 && from.value != mergeFrom && to.value != mergeTo) {
													this.value = "Unqueue";
													this.removeAttribute("disabled");
													mergeQueue.push(this);
												} else if ((where = mergeQueue.indexOf(this)) > -1) {
													mergeQueue.splice(where, 1);
													this.value = "Merge";
													this.removeAttribute("disabled");
													this.style.setProperty("background-color", cInfo);
												} else {
													this.removeAttribute("disabled");
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
											localRelease.tracks[ltrack].a = localRelease.tracks[ltrack].tr.querySelector("td:not(.pos):not(.video) a[href^='/recording/']");
										}
										var tracktd = getParent(localRelease.tracks[ltrack].a, "td");
										var bestPos = tracktd.querySelector("span.mp");
										bestPos = bestPos?bestPos:localRelease.tracks[ltrack].a;
										if (recdis = tracktd.querySelector("span.userjs81127recdis")) { bestPos = recdis; }
										addAfter(rmForm, bestPos);
										rtrack++;
									}
								}
							}
							infoMerge("Recordings loaded, ready to merge", true);
							document.getElementById(MMRid).getElementsByTagName("textarea")[0].focus();
						}
						else { infoMerge("This is not a valid release", false); }
					}
				};
				xhr.open("GET", url, true);
				xhr.send(null);
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
		tmp = MMRdiv.appendChild(createInput("button", "", "Change all merge directions"));
		tmp.style.setProperty("background-color", cSwap);
		tmp.addEventListener("click", function(e) {
			var allbutts = document.getElementsByClassName(MMRid+"dirbutt");
			for (var iab=0; iab < allbutts.length; iab++) {
				allbutts[iab].click();
			}
		}, false);
		tmp = MMRdiv.appendChild(createInput("button", "", "Merge all found recs"));
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
				unqueuedbutt.removeAttribute("disabled");
				unqueuedbutt.setAttribute("value", "Merge");
			}
			queueTrack();
		}, false);
		queuetrack = MMRdiv.appendChild(document.createElement("div"));
		queuetrack.style.setProperty("text-align", "center");
		queuetrack.style.setProperty("background-color", cInfo);
		queuetrack.style.setProperty("display", "none");
		prints(queuetrack, "\u00A0");
		frg.appendChild(MMRdiv);
		return frg;
	}
	function createA(text, link) {
		var a = document.createElement("a");
		if (link) {
			a.setAttribute("href", link);
			a.setAttribute("target", "_blank");
		}
		else {
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
	function addOption(sel, val, txt) {
		var opt = document.createElement("option");
		opt.setAttribute("value", val);
		opt.appendChild(document.createTextNode(txt));
		return sel.appendChild(opt);
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
		}
		else if (set && !mp(o)) {
			var smp = document.createElement("span");
			smp.className = "mp";
			o.parentNode.replaceChild(smp.appendChild(o.cloneNode(true)).parentNode, o);
			return smp.firstChild;
		}
		else if (!set && mp(o)) {
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
	function time(_ms) {/*from 166877*/
		var ms = typeof _ms=="string"?parseInt(_ms,10):_ms;
		if (ms > 0) {
			var d = new Date();
			d.setTime(ms);
			return d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds()+(d.getMilliseconds()>0?"."+(d.getMilliseconds()<100?"0":"")+(d.getMilliseconds()<10?"0":"")+d.getMilliseconds():"");
		}
		return "?:??";
	}
})();