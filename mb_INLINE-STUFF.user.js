// ==UserScript==
// @name         mb. INLINE STUFF
// @version      2014.7.22.1526
// @description  musicbrainz.org release page: Inline recording names, comments, ISRC and AcoustID. Displays CAA count and add link if none. Highlights duplicates in releases and edits.
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_INLINE-STUFF.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_INLINE-STUFF.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2010.7.9
// @grant        none
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org*edit*
// @include      http*://*musicbrainz.org*edits*
// @include      http*://*musicbrainz.org/show/edit/?editid=*
// @include      http*://*musicbrainz.org/mod/search/results.html*
// @include      http*://*musicbrainz.org/artist/*/recordings*
// @exclude      http*://*musicbrainz.org/ws/*
// @exclude      http*://*musicbrainz.org/release/add
// @exclude      http*://*musicbrainz.org/release/add?artist*
// @exclude      http*://*musicbrainz.org/release/add?release-group*
// @exclude      http*://*musicbrainz.org/release/*annotation*
// @exclude      http*://*musicbrainz.org/release/*cover-art*
// @exclude      http*://*musicbrainz.org/release/*/relationships
// @exclude      http*://*musicbrainz.org/release/*/discids
// @exclude      http*://*musicbrainz.org/release/*/tags
// @exclude      http*://*musicbrainz.org/release/*/details
// @exclude      http*://*musicbrainz.org/release/*/edit
// @exclude      http*://*musicbrainz.org/search?*type=*
// @exclude      http*://blog.musicbrainz.org*
// @exclude      http*://bugs.musicbrainz.org*
// @exclude      http*://forums.musicbrainz.org*
// @exclude      http*://lists.musicbrainz.org*
// @exclude      http*://tickets.musicbrainz.org*
// @exclude      http*://wiki.musicbrainz.org*
// @run-at       document-end
// ==/UserScript==
(function(){
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var isrcLinksTexts = {"start": "has\u00A0ISRC", "separator": ", ", "final-separator": " and ", "end": ""};
var acoustidLinksTexts = {"start": "has\u00A0AcoustID", "separator": ", ", "final-separator": " and ", "end": ""};
var dupeColour = "pink";
var infoColour = "lightcyan";
var isrcRemoveLinkTexts = { "before": "\u00A0(", "link": "remove", "after":")" };/*or "\u00D7" for instance*/
var addIsrcLinkText = "Add ISRC"; /* put "" to disable this link */
var UrlRelText = "URL rel."; /* put "" to disable this link */
var contractFingerPrints = true; /* more compact AcoustIDs but brwoser can still inline search/find full AcoustID */
var pleaseWaitText = "Fetching %s AcoustID and ISRC\u2026"; /* put "" to disable this pleasewait message */
	/* track/recording name diff: null for no marking and no inline recording disambiguation comment either, 
	"" for no name change, %br% is return to new line feed
	ex.: "%track-name%*", "%track-name% (%recording-name%)" or even %recording-name% */
var markTrackRecNameDiff = "%track-name%%br%%recording-name%";
var recUseInRelationshipLink = "+relate"; /* null or delete for no such tool */
var recAddToMergeLink = "+merge"; /* null or delete for no such tool */
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099userjs81127";
var hasDupeISRCs = 0;
var hasDupeAcoustIDs = 0;
var shownisrcs = [];
var isrcDone = false;
var shownacoustids = [];
var acoustidDone = false;
var shownworks = {"count":0};
var isrcURL = "/isrc/%s";
var acoustidURL = "//acoustid.org/track/%s";
var releasewsURL = "/ws/2/release/%s/?inc=recordings+isrcs"; /* http://wiki.musicbrainz.org/XMLWebService#release_resources */ 
var isrcRemoveURL = "/edit/isrc/remove.html?trackid=%trackid&isrc=%isrc";
var addIsrcURL = "/edit/isrc/add.html?trackid=%trackid";
var UrlRelURL = "/edit/relationship/addurl.html?id=%trackid&type=track&name=%trackname";
var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var AcoustIDlinkingURL = "//acoustid.org/edit/toggle-track-mbid?track_gid=%acoustid&mbid=%mbid&state=%state";
var CSS_Arec = "td:not(.pos):not(.video) a[href^='/recording/']";
var pleaseWaitFragment = null;
var tracksHtml = null;
var pagecat = self.location.href.match(/\/show\/edit\/|\/mod\/search\/|\/edit|\/edits|\/open_edits/i)? "edits" : "release";
if (self.location.href.match(/\/recordings/i)) { pagecat = "recordings"; }
if (pagecat) {
	switch(pagecat) {
		case "release":
			var relMBID = getRelMBID();
			if (relMBID && (tracksHtml = document.querySelectorAll("div#content > table.tbl > tbody > tr[id]:not(.subh)")).length > 0) {
				if (recUseInRelationshipLink || recAddToMergeLink) {
					for (var ith=0; ith < tracksHtml.length; ith++) {
						var toolzone = tracksHtml[ith].querySelector("td.treleases");
						if (toolzone) {
							toolzone = toolzone.appendChild(document.createElement("div"));
							toolzone.className = userjs+"toolzone";
							toolzone.style.setProperty("display", "none");
							if (recUseInRelationshipLink && (rec = tracksHtml[ith].querySelector(CSS_Arec))) {
								toolzone.appendChild(createA(recUseInRelationshipLink, rec.getAttribute("href")+"/relate", "Use this recording in a relationship\u2026"));
							}
							if (recAddToMergeLink && (rat = tracksHtml[ith].querySelector("span.star-rating a.set-rating"))) {
								if (recUseInRelationshipLink) { toolzone.appendChild(document.createElement("br")); }
								toolzone.appendChild(createA(recAddToMergeLink, "/recording/merge_queue?add-to-merge="+rat.getAttribute("href").match(/id=([0-9]+)/)[1], "Merge this recording\u2026"));
							}
							toolzone = toolzone.parentNode.appendChild(document.createElement("div"));
							toolzone.className = userjs+"editbutt";
							toolzone.style.setProperty("display", "none");
							toolzone.appendChild(createA("Edit", rec.getAttribute("href")+"/edit", "Edit this recording"));
						}
						if (works = tracksHtml[ith].querySelectorAll("td:not(.pos):not(.video) dl.ars > dd a[href^='/work/']")) {
							for (var w=0; w<works.length; w++) {
								if (workid = works[w].getAttribute("href").match(new RegExp("/work/("+RE_GUID+")$"))) {
									if (!shownworks[workid[1]]) {
										shownworks[workid[1]] = 0;
										shownworks.count++;
									}
									shownworks[workid[1]]++;
								}
							}
						}
					}
				}
				idCount("Track", tracksHtml.length);
				if (shownworks.count > 0) { idCount("Work", shownworks.count); }
				var url = releasewsURL.replace(/%s/, relMBID);
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = isrcFish;
				xhr.open("GET", url, true);
				xhr.overrideMimeType("text/xml");
				pleaseWait(true);
				xhr.send(null);
			}
			break;
		case "recordings":
			var rectable = document.querySelector("div#content table.tbl");
			rectable.className += " add-isrcs";/*for later duplicate spot*/
			var reclines = rectable.getElementsByTagName("tr");
			var icol;
			var rectabhd = reclines[0].getElementsByTagName("th");
			for (icol=0; icol < rectabhd.length; icol++) {
				if (rectabhd[icol].textContent.toLowerCase() == "isrcs") {
					break;
				}
			}
			for (var irl=1; irl < reclines.length; irl++) {
				var isrctd = reclines[irl].getElementsByTagName("td")[icol];
				var tdi = isrctd.textContent.trim();
				if (tdi != "") {
					tdi = tdi.replace(/[^\w]{2,}/g, " ").split(" ");
					removeChildren(isrctd);
					for (var itdi=0; itdi < tdi.length; itdi++) {
						if (itdi>0) { isrctd.appendChild(document.createElement("br")); }
						isrctd.appendChild(createA(tdi[itdi], isrcURL.replace(/%s/, tdi[itdi])));
					}
				}
			}/*no-break, do the duplicate spot below*/
		case "edits":
			var iedits = document.querySelectorAll("div#page table.add-isrcs");
			for (var ied=0; ied<iedits.length; ied++) {
				shownisrcs = [];
				var as = iedits[ied].getElementsByTagName("a");
				for (var ia=0; ia<as.length; ia++) {
					var href = as[ia].getAttribute("href").match(/isrc[=/]([^?]+)$/);
					if (href) {
						as[ia].replaceChild(coolifyISRC(as[ia].textContent), as[ia].firstChild);
						if (shownisrcs[href[1]]) {
							hasDupeISRCs++;
							shownisrcs[href[1]].style.setProperty("background-color", dupeColour);
							as[ia].style.setProperty("background-color", dupeColour);
						} else {
							shownisrcs[href[1]] = as[ia];
						}
					}
				}
			}
	}
}
function createA(text, link, title, target) {
	var a = document.createElement("a");
	if (link) { a.setAttribute("href", link); }
	else { a.style.setProperty("cursor", "pointer"); }
	if (typeof text == "string") { a.appendChild(document.createTextNode(text)); }
	else { a.appendChild(text); }
	if (title){ a.setAttribute("title", title); }
	if (target){ a.setAttribute("target", target); }
	return a;
}
function addAfter(n, e) {
	if (n && e) {
		if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
		else { return e.parentNode.appendChild(n); }
	} else { return null; }
}
function removeChildren(p) {
	while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
}
function pleaseWait(on) {
	if (on && pleaseWaitText) {
		var pwf = getPleaseWaitFragment();
		pwf.appendChild(document.createTextNode(pleaseWaitText.replace(/%s/, " "+pagecat+" ")));
	} else if (!on && pleaseWaitFragment) {
		document.body.removeChild(pleaseWaitFragment);
		pleaseWaitFragment = null;
	}
}
function getPleaseWaitFragment() {
	if (pleaseWaitFragment == null) {
		var pwf = document.createElement("div");
		pwf.style.setProperty("position", "fixed");
		pwf.style.setProperty("left", "0");
		pwf.style.setProperty("bottom", "0");
		pwf.style.setProperty("padding", "0 4px");
		pwf.style.setProperty("background-color", "#ff0");
		pwf.style.setProperty("color", "black");
		pwf.style.setProperty("border-right", "2px solid #660");
		pwf.style.setProperty("border-top", "2px solid #ffc");
		pleaseWaitFragment = document.body.appendChild(pwf);
	}
	return pleaseWaitFragment;
}
function isrcFish() {
	if (this.readyState == 4 && this.status == 200 && tracksHtml) {
		var res = this.responseXML;
		if (
			(CAAcnt = res.documentElement.querySelector("release > cover-art-archive > count")) && 
			(CAAtab = document.querySelector("div.tabs > ul.tabs > li > a[href$='/cover-art']")) && 
			(CAAtxt = "CAA")
		) {
			CAAcnt = parseInt(CAAcnt.textContent, 10);
			if (CAAcnt > 0) {
				CAAtxt += " ("+CAAcnt+")";
				CAAtab.style.setProperty("background-color", "#6f9");
			}
			else {
				CAAtxt = "Add "+CAAtxt;
				CAAtab.setAttribute("href", CAAtab.getAttribute("href").replace(/cover-art/, "add-cover-art"));
				CAAtab.style.setProperty("background-color", "#ff6");
			}
			CAAtab.style.setProperty("width", self.getComputedStyle(CAAtab).getPropertyValue("width"));
			CAAtab.style.setProperty("height", self.getComputedStyle(CAAtab).getPropertyValue("height"));
			CAAtab.style.setProperty("text-align", "center");
			CAAtab.replaceChild(document.createTextNode(CAAtxt), CAAtab.firstChild);
		}
		var isrcNet = {};
		var recnameNet = {};
		var acoustidNet = [];
		var tracks = res.evaluate("//mb:recording", res, nsr, XPathResult.ANY_TYPE, null);
		for (var pos=1; track = tracks.iterateNext(); pos++) {
			var trackMBID = track.getAttribute("id");
			if (acoustidNet.indexOf(trackMBID) < 0) { acoustidNet.push(trackMBID); }
			isrcNet[trackMBID] = [];
			recnameNet[trackMBID] = {};
			var isrcs = res.evaluate(".//mb:isrc", track, nsr, XPathResult.ANY_TYPE, null);
			while (isrc = isrcs.iterateNext()) {
				isrcNet[trackMBID].push(isrc.getAttribute("id"));
			}
			var recnames = res.evaluate(".//mb:title/text()", track, nsr, XPathResult.ANY_TYPE, null);
			while (recname = recnames.iterateNext()) {
				recnameNet[trackMBID].name = recname.textContent;
			}
			var recdisambigs = res.evaluate(".//mb:disambiguation/text()", track, nsr, XPathResult.ANY_TYPE, null);
			while (recdisambig = recdisambigs.iterateNext()) {
				recnameNet[trackMBID].comment = recdisambig.textContent;
			}
		}
		acoustidFishBatch(acoustidNet);
		for (var i=0 ; i < tracksHtml.length ; i++) {
			var as = tracksHtml[i].getElementsByTagName("a");
			if (as.length > 0) {
				var mbid = as[0].getAttribute("href").match(/(recording|track)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*$/);
				if (mbid) { mbid = mbid[2]; }
				else { continue; }
				var trackid = as[as.length-1].getAttribute("href").match(/trackid=(.+)$/);
				if (trackid) { trackid = trackid[1]; }
				var trackTitleCell = tracksHtml[i].querySelector("td:not(.pos):not(.video)");
				var trackLinksCell = tracksHtml[i].querySelector("td.links");
				if (isrcNet[mbid].length > 0) {
					insertBeforeARS(trackTitleCell, createStuffFragment("ISRC", isrcNet[mbid], shownisrcs, isrcLinksTexts, isrcURL, trackid, mbid));
				}
				if (as[0].textContent != recnameNet[mbid].name) {
					var ntit = as[0].getAttribute("title");
					ntit = (ntit?ntit+" \u2014\u00a0":"")+"track name: "+as[0].textContent+"\n\u2260rec. name: "+recnameNet[mbid].name;
					as[0].setAttribute("title", ntit);
					if (markTrackRecNameDiff != null) {
						if (typeof markTrackRecNameDiff == "string" && markTrackRecNameDiff != "") {
							var patf = document.createDocumentFragment();
							var patt = markTrackRecNameDiff.replace(/%track-name%/ig, as[0].textContent).replace(/%recording-name%/ig, recnameNet[mbid].name).split("%br%");
							for (var p=0; p<patt.length; p++) {
								if (p>0) { patf.appendChild(document.createElement("br")); }
								patf.appendChild(document.createTextNode(patt[p]));
							}
							as[0].replaceChild(patf, as[0].firstChild);
						}
						as[0].style.setProperty("text-shadow", "1px 2px 2px #999");
						as[0].style.setProperty("color", "maroon");
					}
				}
				if (markTrackRecNameDiff != null && recnameNet[mbid].comment) {
					var recdis = document.createElement("span");
					recdis.className = userjs+"recdis";
					recdis.appendChild(document.createTextNode(" ("+recnameNet[mbid].comment+")"));
					addAfter(recdis, as[0]);
				}
			}
		}
		isrcDone = true;
		idCount("ISRC", shownisrcs);
	}
}
function createStuffFragment(stufftype, stuffs, shownstuffs, linksTexts, url, trackid, recid) {
	var td = document.createElement("span");
	td.className = "small";
	td.style.setProperty("font-style", "normal");
	td.appendChild(document.createTextNode(linksTexts["start"]+(stuffs.length>1?"s":"")+" "));
	for (var i=0; i < stuffs.length; i++) {
		var adisabled = (stufftype == "AcoustID" && stuffs[i][1]);
		var stuff = (stufftype == "AcoustID"?stuffs[i][0]:stuffs[i]);
		if (stuffs.length > 1 && i == stuffs.length - 1) {
			td.appendChild(document.createTextNode(linksTexts["final-separator"]));
		} else if (i > 0) {
			td.appendChild(document.createTextNode(linksTexts["separator"]));
		}
		var a = document.createElement("a");
		a.style.setProperty("white-space", "nowrap");
		a.setAttribute("href", url.replace(/%s/, stuff));
		var code = document.createElement("code");
		if (stufftype == "ISRC") {
			code = coolifyISRC(stuff);
		}
		else {/*AcoustID*/
			if (contractFingerPrints) {
				a.style.setProperty("display", "inline-block");
				a.style.setProperty("overflow-x", "hidden");
				a.style.setProperty("vertical-align", "bottom");
				code.setAttribute("title", stuff);
			}
			code.appendChild(document.createTextNode(stuff));
		}
		a.appendChild(code);
		if (adisabled) {
			code.style.setProperty("text-decoration", "line-through");
			code.style.setProperty("opacity", ".2");
			a.addEventListener("mouseover",function(e){this.firstChild.style.removeProperty("text-decoration");this.firstChild.style.removeProperty("opacity");},false);
			a.addEventListener("mouseout",function(e){this.firstChild.style.setProperty("text-decoration","line-through");this.firstChild.style.setProperty("opacity",".2");},false);
		}
		td.appendChild(a);
		if (!adisabled) {
			if (shownstuffs[stuff]) {
				var bgColour = dupeColour;
				if (recid && shownstuffs[stuff]["recid"] == recid) {
					bgColour = infoColour;
				}
				else {
					eval("hasDupe"+stufftype+"s++");
				}
				if (shownstuffs[stuff]["a"].style.getPropertyValue("background-color") != dupeColour) {
					shownstuffs[stuff]["a"].style.setProperty("background-color", bgColour);
				}
				a.style.setProperty("background-color", bgColour);
			}
			else {
				shownstuffs[stuff] = { "a": a, "trackid": trackid, "recid": recid };
			}
		}
		switch (stufftype) {
			case "ISRC":
				if (trackid) { td.appendChild(isrcRemoveLink(trackid, stuff)); }
				break;
			case "AcoustID":
				a.parentNode.appendChild(togAID(recid, stuff, adisabled));
				break;
		}
	}
	td.appendChild(document.createTextNode(linksTexts["end"]));
	var tr = document.createElement("div");
	tr.appendChild(td);
	var table = document.createElement("div");
	table.className = "relationships "+stufftype+"81127";
	table.style.setProperty("display", localStorage.getItem("hide"+stufftype+"81127")=="1"?"none":"block");
	table.style.setProperty("margin", "0 1em");
	table.appendChild(tr);
	return table;
}
function togAID(rec, aid, dis) {
	var acoustracktoggle = createA(dis?"+":"×", AcoustIDlinkingURL.replace(/%acoustid/, aid).replace(/%mbid/, rec).replace(/%state/, dis?"0":"1"), dis?"Link AcoustID to this recording":"Unlink AcoustID from this recording", "_blank");
	acoustracktoggle.style.setProperty("color", dis?"green":"red");
	return acoustracktoggle;
}
function isrcRemoveLink(trackid, isrc) {
	var span = document.createElement("span");
	span.style.setProperty("background-color", dupeColour);
	span.appendChild(document.createTextNode(isrcRemoveLinkTexts["before"]));
	span.appendChild(createA(isrcRemoveLinkTexts["link"], isrcRemoveURL.replace(/%trackid/, trackid).replace(/%isrc/, isrc)));
	span.appendChild(document.createTextNode(isrcRemoveLinkTexts["after"]));
	return span;
}
function insertBeforeARS(par, chi) {
	var ars = par.getElementsByClassName("ars");
	if (ars.length > 0) { return par.insertBefore(chi, ars[0]); }
	else { return par.appendChild(chi); }
}
function getRelMBID() {
	var mbid = self.location.href.match(/musicbrainz\.org\/[^/]+\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
	if (mbid) { return mbid[1]; }
	else { return null; }
}
function nsr(prefix) {
	switch (prefix) {
		case "mb":
			return "http://musicbrainz.org/ns/mmd-2.0#";
		default:
			return null;
	}
}
var bonusclicks = [];
function idCount(type, hash) {
	var idCountZone = document.querySelector("div#sidebar div#"+userjs+"idcountzone");
	if (!idCountZone) {
		idCountZone = document.querySelector("div#sidebar > dl.properties").appendChild(document.createElement("div"));
		idCountZone.setAttribute("id", userjs+"idcountzone");
		idCountZone.style.setProperty("border", "1px dashed silver");
		var showTZ = idCountZone.appendChild(document.createElement("dd")).appendChild(document.createElement("label")).appendChild(document.createElement("input"));
		showTZ.setAttribute("type", "checkbox");
		showTZ.parentNode.appendChild(document.createTextNode(" Show relate/merge tools"));
		showTZ.addEventListener("click", function(e) {
			var tzs = document.querySelectorAll("div."+userjs+"toolzone");
			for (var tz = 0; tz < tzs.length; tz++) {
				tzs[tz].style.setProperty("display", this.checked?"block":"none");
			}
		}, false);
		var showEB = idCountZone.appendChild(document.createElement("dd")).appendChild(document.createElement("label")).appendChild(document.createElement("input"));
		showEB.setAttribute("type", "checkbox");
		showEB.parentNode.appendChild(document.createTextNode(" Show Edit rec. buttons"));
		showEB.addEventListener("click", function(e) {
			var ebs = document.querySelectorAll("div."+userjs+"editbutt");
			for (var eb = 0; eb < ebs.length; eb++) {
				ebs[eb].style.setProperty("display", this.checked?"block":"none");
			}
		}, false);
	}
	var count = 0;
	if (typeof hash == "number") { count = hash; }
	else { for (key in hash) { if (hash.hasOwnProperty(key)) { count++; } } }
	if (count != 0) {
		var errorMsg = { "-20": "acoustid.org unreachable", "-21": "Strange result from acoustid.org" };
		var cooldt = idCountZone.appendChild(document.createElement("dt")).appendChild(document.createTextNode(type+(count>1?"s":"")+":")).parentNode;
		var cooldd = idCountZone.appendChild(document.createElement("dd")).appendChild(document.createTextNode(count<0?errorMsg[count]+" (or\u00a0something\u00a0like\u00a0that)":count)).parentNode;
		if (count<0) { 
			cooldt.setAttribute("title", "Error "+count);
			cooldt.style.setProperty("background-color", dupeColour);
		}
		else if (count >= 0 && type != "Track" && type != "Work") {
			var dupes = 0;
			try { eval("dupes = hasDupe"+type+"s;"); } catch(e) {}
			if (dupes > 0) {
				cooldt.setAttribute("title", "There "+(dupes==1?"is 1":"are "+dupes)+" duplicate"+(dupes==1?"":"s"));
				cooldt.style.setProperty("background-color", dupeColour);
			}
			cooldd.appendChild(document.createTextNode(" ("));
			var typetoggle = cooldd.appendChild(createA(localStorage.getItem("hide"+type+"81127")=="1"?"show":"hide", null, "shift+click to hide/show all"));
			typetoggle.style.setProperty("cursor", "pointer");
			typetoggle.setAttribute("id", "tog81127"+type);
			typetoggle.addEventListener("click", function(e) {
				var type =  this.getAttribute("id").match(/^tog81127([a-z]+)$/i)[1];
				var show = (this.textContent == "show");
				localStorage.setItem("hide"+type+"81127", show?"0":"1");
				var togstuffs = document.getElementsByClassName(type+81127);
				for (var itog=0; itog < togstuffs.length; itog++) {
					togstuffs[itog].style.setProperty("display", show?"block":"none");
				}
				this.replaceChild(document.createTextNode(show?"hide":"show"), this.firstChild);
				if (e.shiftKey && bonusclicks.length == 0) {
					if (showHideARSButt = document.querySelector("a."+(show?"show":"hide")+"-credits")) {
						showHideARSButt[0].click();
					} else {
						var ars = document.querySelectorAll("div.ars");
						for (var iar=0; iar< ars.length; iar++) {
							ars[iar].style.setProperty("display", show?"block":"none");
						}
					}
					if ((showToolZones = document.querySelectorAll("div#sidebar div#"+userjs+"idcountzone input[type='checkbox']"))) {
						for (var stz=0; stz < showToolZones.length; stz++) {
							if (showToolZones[stz].checked != show) showToolZones[stz].click();
						}
					}
					var otogs = ["AcoustID", "ISRC"];
					for (var iotog=0; iotog < otogs.length; iotog++) {
						var togid = "tog81127"+otogs[iotog];
						var toglnk = document.getElementById(togid);
						if (this.id != togid && toglnk && toglnk.textContent == (show?"show":"hide")) {
							bonusclicks.push(toglnk);
						}
					}
				}
				if (bonusclicks.length > 0) {
					bonusclicks.pop().click();
				}
			}, false);/*onclick*/
			cooldd.appendChild(document.createTextNode(")"));
		}
	}
	if (isrcDone && acoustidDone) {
		pleaseWait(false);
	}
}
function coolifyISRC(isrc) {
	function truc(txt, i) {
		var ivt = document.createElement("span");
		ivt.appendChild(document.createTextNode(txt));
		if (i) {
			ivt.style.setProperty("color", "red");
			ivt.style.setProperty("margin", "0 .1em");
			ivt.style.setProperty("text-shadow", "1px 2px 2px yellow");
		}
		return ivt;
	}
	if (isrc.match(/[a-z]{2}\-?[a-z0-9]{3}\-?[0-9]{2}\-?[0-9]{5}/i)) {
		var coolISRC = document.createElement("code");
		coolISRC.appendChild(truc(isrc.substr(0,2), true));
		coolISRC.appendChild(truc(isrc.substr(2,3), false));
		coolISRC.appendChild(truc(isrc.substr(5,2), true));
		coolISRC.appendChild(truc(isrc.substr(7,5), false));
		return coolISRC;
	}
	else { return document.createTextNode(isrc); }
}
/* http://tiffanybbrown.com/presentations/2011/xhr2/ */
function acoustidFishBatch(recids) {
	if (recids.length > 0) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e) {
			if (
				this.status == 200 && 
				(res = this.responseXML.documentElement) &&
				(wsstatus = res.querySelector("response > status")) && 
				wsstatus.textContent == "ok" && 
				(mbids = res.querySelectorAll("response > mbids > mbid > mbid:not(:empty)"))
			) {
				var acoustids = {};
				for (var m = 0; m < mbids.length; m++) {
					if ((mbid = mbids[m].textContent) && mbid.match(new RegExp(RE_GUID))) {
						if (!acoustids[mbid]) { acoustids[mbid] = []; }
						var trackids = mbids[m].parentNode.querySelectorAll("track > id:not(:empty)");
						for (var ti = 0; ti < trackids.length; ti++) {
							if ((trackid = trackids[ti].firstChild.textContent) && trackid.match(new RegExp(RE_GUID))) {
								var disabled = trackids[ti].parentNode.querySelector("disabled");
								disabled = disabled && disabled.textContent.match(/true/i);
								var duo = [trackid, disabled];
								if (disabled) { acoustids[mbid].push(duo); }
								else { acoustids[mbid].unshift(duo); }
							}
						}
					}
				}
				for (var th = 0; th < tracksHtml.length; th++) {
					if (
						(recmbid = tracksHtml[th].querySelector(CSS_Arec)) && 
						(recmbid = recmbid.getAttribute("href").match(new RegExp("/("+RE_GUID+")$"))) && 
						(recmbid = recmbid[1]) && 
						acoustids[recmbid].length > 0 &&
						(trackTitleCell = tracksHtml[th].querySelector("td:not(.pos):not(.video)"))
					) {
						var aidtable = insertBeforeARS(trackTitleCell, createStuffFragment("AcoustID", acoustids[recmbid], shownacoustids, acoustidLinksTexts, acoustidURL, null, recmbid));
						if (contractFingerPrints) {
							var show = aidtable.style.getPropertyValue("display") == "block";
							aidtable.style.setProperty("display", "block");
							var aids = aidtable.querySelectorAll("a > code[title]");
							for (var aid=0; aid<aids.length; aid++) {
								aids[aid].parentNode.style.setProperty("width", parseInt(self.getComputedStyle(aids[aid].parentNode).getPropertyValue("width").match(/^\d+/)+"", 10)/aids[aid].textContent.length*6+"px");
							}
							aidtable.style.setProperty("display", show?"block":"none");
						}
					}
				}
			}
			else {
				shownacoustids = -21;
			}
			acoustidDone = true;
			idCount("AcoustID", shownacoustids);
		};
		xhr.onerror = function(e) {
			acoustidDone = true;
			idCount("AcoustID", -20);
		};
		xhr.open("post", "//api.acoustid.org/v2/track/list_by_mbid", true);
		var params = "client=A6AsOfBc&format=xml&batch=1&disabled=1";
		for (var m = 0; m < recids.length; m++) {
			params += "&mbid="+recids[m];
		}
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Content-length", params.length);
		xhr.setRequestHeader("Connection", "close");
		xhr.overrideMimeType("text/xml");
		xhr.send(params);
	}
}
})();