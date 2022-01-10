// ==UserScript==
// @name         mb. COLLECTION HIGHLIGHTER
// @version      2022.1.10.1827
// @description  musicbrainz.org: Highlights releases, release-groups, etc. that you have in your collections (anyone’s collection can be loaded) everywhere
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_COLLECTION-HIGHLIGHTER
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COLLECTION-HIGHLIGHTER.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-02-21; https://web.archive.org/web/20140327054755/userscripts.org/scripts/show/126380 / https://web.archive.org/web/20141011084019/userscripts-mirror.org/scripts/show/126380
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\//
// @include      /^https?:\/\/acoustid\.org\/track\//
// @exclude      /^https?:\/\/(\w+\.)?musicbrainz\.org\/account\//
// @exclude      /^https?:\/\/(\w+\.)?musicbrainz\.org\/admin\//
// @exclude      *.org/collection/*/own_collection/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var DEBUG = false;
let scriptNameAndVersion = GM_info.script.name.substr("4") + " " + GM_info.script.version;
// ############################################################################
// #                                                                          #
// #                         BUTTONS / TRIGGERS / GUI                         #
// #                                                                          #
// ############################################################################
var MBS = self.location.protocol + "//" + self.location.host;
var lang = document.querySelector("html[lang]");
lang = lang && lang.getAttribute("lang") || "en-GB";
var cat = self.location.pathname.match(/(area(?!.+(artists|labels|releases|places|aliases|edits))|artist(?!.+(releases|recordings|works|relationships|aliases|edits))|artists|event|labels|releases|recordings|report|series|track|works|aliases|cdtoc|collection(?!s|.+edits)|collections|edit(?!s|\/subscribed)|edits|votes|edit\/subscribed|isrc|label(?!.+edits)|place(?!.+(aliases|edits))|puid|ratings|recording(?!s|.+edits)|relationships|release[-_]group(?!.+edits)|release(?!s|-group|.+edits)|search(?!\/edits)|tracklist|tag|url|work(?!s))/);
if (cat) {
	/* -------- CONFIGURATION START (don’t edit above) -------- */
	var highlightColour = "purple";
	var highlightInEditNotes = false;
	var skipArtists = "89ad4ac3-39f7-470e-963a-56509c546377"; // put artist GUID separated by space that you want to skip, example here it’s VA
	var MBWSRate = 999;
	var MBWSSpeedLimit = 100; // from 1 (only 1 result per request) to 100 (maxium amount of result per request)
	/* -------- CONFIGURATION  END  (don’t edit below) -------- */
	var prefix = "collectionHighlighter";
	var dialogprefix = "..:: " + scriptNameAndVersion.replace(/ /g, " :: ") + " ::..\n\n";
	var maxRetry = 20;
	var retryPause = 5000;
	var slowDownStepAfterRetry = 0;
	var css_nextPage = "ul.pagination > li:last-of-type > a";
	var retry = 0;
	var debugBuffer = "";
	var j2ss = document.createElement("style");
	j2ss.setAttribute("type", "text/css");
	document.head.appendChild(j2ss);
	j2ss = j2ss.sheet;
	var brdr = " border-left: 4px solid " + highlightColour + "; ";
	j2ss.insertRule("." + prefix + "Box {" + brdr.replace(/-left/, "") + "}", 0);
	j2ss.insertRule("." + prefix + "Row {" + brdr + "}", 0);
	j2ss.insertRule("li." + prefix + "Row { padding-left: 4px; }", 0);
	j2ss.insertRule("." + prefix + "Item { text-shadow: 0 0 8px " + highlightColour + "!important; }", 0);
	j2ss.insertRule("." + prefix + "Row ." + prefix + "Item { border: 0; padding: 0; }", 0);
	var collectionsID = GM_getValue("collections") || "";
	var releaseID;
	var stuff, collectedStuff = ["collection", "release", "release-group", "recording", "artist", "work", "label"];
	var strType = "release-group|recording|label|artist|work";
	var strMBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var collectionLoadingStartDate = Date.now();
	var currentTaskStartDate;
	cat = cat[1].replace(/edit\/subscribed|votes/, "edits").replace(/_/, "-");
	debug("CAT: " + cat);
// ############################################################################
// #                                       DISPLAY RELEASE PAGE SIDEBAR TOOLS #
// ############################################################################
	if (cat == "release" && (releaseID = self.location.pathname.match(new RegExp(strMBID)))) {
		releaseID = releaseID[0];
		var mainReleasePage = self.location.pathname.match(new RegExp("^/release/" + strMBID + "$"));
		var colls = document.querySelectorAll("div#sidebar a[href*='/collection_collaborator/add?release='], div#sidebar a[href*='/collection_collaborator/remove?release=']");
		for (let coll = 0; coll < colls.length; coll++) {
			if (collectionsID.indexOf(colls[coll].getAttribute("href").match(new RegExp(strMBID))) > -1) {
				if (mainReleasePage) {
					collectionUpdater(colls[coll], colls[coll].getAttribute("href").match(/add|remove/).toString());
				} else {
					addAfter(createTag("div", {s: {textShadow: "0 0 8px " + highlightColour}}, ["(please go to ", createTag("a", {a: {href: "/release/" + releaseID}}, "main release page"), " for this button to auto‐update your collection highlighter)"]), colls[coll]);
				}
			}
		}
		if (mainReleasePage) {
			var lili = document.querySelector("div#sidebar > h2.collections ~ ul.links");
			if (lili) {
				var buttxt = " this release to your local collection highlighter,\nwithout changing its status among you MB collection(s)";
				lili = lili.insertBefore(document.createElement("li"), lili.firstChild);
				lili.appendChild(document.createTextNode("Force highlight "));
				collectionUpdater(lili.appendChild(createA("ON", self.location.href, "Add" + buttxt, true)), "add");
				lili.appendChild(document.createTextNode(" / "));
				collectionUpdater(lili.appendChild(createA("OFF", self.location.href, "Remove" + buttxt.replace(" to ", " from "), true)), "remove");
			}
		}
	}
	if (cat == "collections") {
// ############################################################################
// #                                     DISPLAY COLLECTION PAGE LOADER TOOLS #
// ############################################################################
		var xp1 = document.evaluate("//xhtml:table[contains(@class, 'tbl')]/xhtml:thead//xhtml:th/text()[contains(., 'Veröffentlichungen') or contains(., 'Väljalasked') or contains(., 'Releases') or contains(., 'Publicaciones') or contains(., 'Parutions') or contains(., 'Pubblicazioni') or contains(., 'Uitgaves') or contains(., 'Julkaisut') or contains(., 'Κυκλοφορίες') or contains(., 'リリース')]", document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let tbl_idx = 0; tbl_idx < xp1.snapshotLength > 0; tbl_idx++) {
			xp1.snapshotItem(tbl_idx).parentNode.parentNode.appendChild(createTag("th", {a: {colspan: "2"}}, scriptNameAndVersion));
			var tbl = getParent(xp1.snapshotItem(tbl_idx).parentNode, "table");
			var xp = document.evaluate("./xhtml:tbody/xhtml:tr", tbl, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			for (let i = 0; i < xp.snapshotLength; i++) {
				let coll = xp.snapshotItem(i).getElementsByTagName("a")[0];
				var collid = coll.getAttribute("href").match(new RegExp(strMBID));
				var loadButtons = [];
				var loadButtonText = "Load";
				if (collectionsID.indexOf(collid) > -1) {
					decorate(coll);
					loadButtonText = "Reload";
				}
				loadButtons.push(createA(
					"Append",
					function(event) {
						var opts = document.querySelectorAll("td." + prefix + " input[type='checkbox']:checked");
						stuff = {};
						for (let opt = 0; opt < opts.length; opt++) {
							stuff[opts[opt].getAttribute("name")] = {};
						}
						currentTaskStartDate = Date.now();
						loadCollection(this.getAttribute("title").match(new RegExp(strMBID)), "add");
					},
					"Add this collection’s content to highlighter (" + collid + ")"
				));
				loadButtons.push(" | ");
				loadButtons.push(createA(
					loadButtonText,
					function(event) {
						var cmsg = "This will REPLACE your current loaded stuff.";
						if (confirm(dialogprefix + cmsg)) {
							// erase local stuff
							for (let stu = 0; stu < collectedStuff.length; stu++) {
								GM_deleteValue(collectedStuff[stu] + "s");
							}
							// then append (previous button)
							this.previousSibling.previousSibling.click();
						}
					},
					"Replace current highlighted content with this collection’s content (" + collid + ")"
				));
				xp.snapshotItem(i).appendChild(document.createElement("td")).appendChild(concat(loadButtons));
				if (i == 0) {
					/* settings */
					var settings = [];
					for (let stu = 0; stu < collectedStuff.length; stu++) if (collectedStuff[stu] != "collection") {
						var cstuff = collectedStuff[stu];
						var lab = document.createElement("label");
						lab.appendChild(concat([createTag("input", {a: {type: "checkbox", name: cstuff}, e: {change: function(event) { GM_setValue("cfg" + this.getAttribute("name"), this.checked ? "1" : "0"); }}}), cstuff + "s "]));
						var cfgcb = lab.querySelector("input[type='checkbox'][name='" + cstuff + "']");
						if (cstuff.match(/artist|recording|release(-group)?|work/)) { // defaults
							cfgcb.setAttribute("checked", "checked");
						}
						if (cstuff.match(/release(-group)?/)) { // forced
							lab.style.setProperty("opacity", ".5");
							cfgcb.setAttribute("disabled", "disabled");
						} else {/* read previous settings */
							var cfgstu = GM_getValue("cfg" + cstuff);
							if (cfgstu == "1") {
								cfgcb.setAttribute("checked", "checked");
							} else if (cfgstu == "0") {
								cfgcb.removeAttribute("checked");
							}
						}
						if (cstuff.match(/artist|work/)) { // artist and work tracking requires recording tracking
							cfgcb.addEventListener("change", function(event) {
								if (this.checked) {
									var recording = this.parentNode.parentNode.querySelector("input[name='recording']");
									recording.checked = true;
									sendEvent(recording, "change");
								}
							}, false);
						} else if (cstuff.match(/recording/)) {
							cfgcb.addEventListener("change", function(event) {
								if (!this.checked) {
									var artistwork = this.parentNode.parentNode.querySelectorAll("input[name='artist'], input[name='work']");
									for (let aw = 0; aw < artistwork.length; aw++) {
										artistwork[aw].checked = false;
										sendEvent(artistwork[aw], "change");
									}
								}
							}, false);
						}
						settings.push(lab);
						settings.push(document.createElement("br"));
					}
					xp.snapshotItem(i).appendChild(createTag("td", {a: {class: prefix, rowspan: xp.snapshotLength}}, concat(settings)));
				}
			}
		}
// ############################################################################
// #                                     LAUNCH THE HIGHLIGHTING ON ALL PAGES #
// ############################################################################
	} else if (cat == "track" /* AcoustID */) {
		// AcoustID.org: no problems
		findOwnedStuff();
	} else {
		// MusicBrainz.org: React problems
		var DOMChanged = true;
		document.querySelector("div#content, div#page").addEventListener("DOMNodeInserted", function(event) { DOMChanged = true; });
		setInterval(function() {
			// Make sure to re-scan page content (after, not during) each time React does some funny stuff hydrate redraw content
			if (!document.querySelector("p.loading-message") && DOMChanged) {
				DOMChanged = false;
				findOwnedStuff();
			}
		}, 1000);
	}
}
// ############################################################################
// #                                                                          #
// #                           MAIN FUNCTIONS                                 #
// #                                                                          #
// ############################################################################
// ############################################################################
// #                                     FIND COLLECTION ENTITIES IN THE PAGE #
// ############################################################################
function findOwnedStuff() {
	stuff = {};
	// Annotation link trim spaces and protocol + "//" + host
	for (let annotationLinks = document.querySelectorAll("div#content div.annotation a"), l = 0; l < annotationLinks.length; l++) {
		annotationLinks[l].setAttribute("href", annotationLinks[l].getAttribute("href").trim().replace(/^((https?:)?\/\/(\w+\.)?musicbrainz\.org)\//, "/"));
	}
	for (let stu = 0; stu < collectedStuff.length; stu++) {
		var cstuff = collectedStuff[stu];
		stuff[cstuff] = {};
		var uphill = "";
		var downhill = cat == "release" && cstuff == "label" ? "" : "[count(ancestor::xhtml:div[contains(@id, 'sidebar')])=0]";
		if (!highlightInEditNotes && (cat == "edit" || cat == "edits")) {
			downhill += "[count(ancestor::xhtml:div[contains(@class, 'edit-notes')])=0]";
		}
		var root = cat == "track" /* acoustid.org */ ? "//musicbrainz.org/" : "/";
		var path = uphill + "//xhtml:a[starts-with(@href, '" + root + cstuff + "/')][not(starts-with(@class, '" + prefix + "'))]" + downhill;
		var xp = document.evaluate(path, document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let i = 0; i < xp.snapshotLength; i++) {
			var mbid = xp.snapshotItem(i).getAttribute("href").match(new RegExp("/" + cstuff + "/(" + strMBID + ")$"));
			if (mbid) {
				mbid = mbid[1];
				if (!stuff[cstuff].loaded) {
					stuff[cstuff].rawids = GM_getValue(cstuff + "s");
					if (stuff[cstuff].rawids) {
						stuff[cstuff].ids = stuff[cstuff].rawids.trim().split(" ");
						debug(" \n" + stuff[cstuff].ids.length + " " + cstuff.toUpperCase() + (stuff[cstuff].ids.length == 1 ? "" : "S") + " loaded (" + cstuff + "s)\nMatching: " + path, true);
					} else { debug(" \nNo " + cstuff.toUpperCase() + "S in highlighter (" + cstuff + "s)", true); }
					stuff[cstuff].loaded = true;
				}
				if (stuff[cstuff].ids && stuff[cstuff].ids.indexOf(mbid) > -1) {
					debug(mbid + " ● “" + xp.snapshotItem(i).textContent + "”", true);
					decorate(xp.snapshotItem(i));
				}
			}
		}
	}
	debug("");
}
// ############################################################################
// #                                              HIGHLIGHT / DECORATE A LINK #
// ############################################################################
function decorate(entityLink) {
	if (!getParent(entityLink, "div", "tabs")) {
		// Does not highlight tabs.
		entityLink.classList.add(prefix + "Item");
		var page = document.getElementById("page");
		if (getParent(entityLink, "h1")) {
			// Entity page is boxed.
			page.classList.add(prefix + "Box");
		} else {
			var entityType = entityLink.getAttribute("href").match(new RegExp("/(.+?)/" + strMBID, "i")) || "";
			if (entityType) {
				entityType = entityType[1];
			}
			if (cat == "edit") {
				// entity edit page is boxed
				var editDetails = getParent(entityLink, "table", "details");
				if (editDetails && entityLink == editDetails.querySelector("a")) {
					page.classList.add(prefix + "Box");
				}
			} else if (cat == "edits") {
				// in edit lists: Release or release group edits are boxed; other entity edits are left bordered
				var edit = getParent(entityLink, "div", "edit-list");
				if (edit) {
					edit.classList.add(prefix + (entityLink == edit.querySelector("div.edit-details a") ? "Box" : "Row"));
				}
			} else {
				// in other pages: Associated tracks are Leftmost entity table rows are left bordered. Not in owned release tracklists
				var row = !getParent(entityLink, "ul") && !getParent(entityLink, "dl") && getParent(entityLink, "tr");
				if (row) {
					if (
						entityLink == row.querySelector("a:not([href*='coverartarchive.org']):not([href*='/track/']):not([href$='/cover-art'])" + (cat == "recording" ? ":not([href^='/artist/'])" : ""))
						&& !(cat == "release" && page.classList.contains(prefix + "Box") && entityType == "recording")
					) {
						row.classList.add(prefix + "Row");
					}
					// decorate tracks without holding them
					if (cat == "release" && entityType == "recording" || cat == "recording" && entityType == "release") {
						var track = row.querySelector("a[href*='/track/']");
						if (track) {
							track.classList.add(prefix + "Item");
						}
					}
				}
			}
		}
	}
}
// ############################################################################
// #                                         COLLECT RELEASES FROM COLLECTION #
// ############################################################################
function loadCollection(collectionMBID, action, _offset) {
	var offset = _offset || 0;
	var url = "/ws/2/release?collection=" + collectionMBID + "&inc=release-groups+release-group-level-rels+release-group-rels+labels+recordings+artist-credits+recording-level-rels+work-rels&limit=" + MBWSSpeedLimit + "&offset=" + offset;
	if (offset === 0) {
		setTitle(true);
		// Add collection MBID to list of highlighted
		collectionsID = GM_getValue("collections") || "";
		if (collectionsID.indexOf(collectionMBID) < 0) {
			collectionsID += collectionMBID + " ";
		}
		modal(true, concat([createTag("h3", {}, dialogprefix), "WTF? If you want to stop this monster crap, just ", createA("reload", function(event) { self.location.reload(); }), " or close this page.", "<br>", "<br>", "<hr>", "Loading collection " + collectionMBID + "…"]), 2);
		for (let stu in stuff) if (Object.prototype.hasOwnProperty.call(stuff, stu) && collectedStuff.indexOf(stu) >= 0) {
			stuff[stu].rawids = GM_getValue(stu + "s") || "";
			// stuff[stu].ids = stuff[stu].rawids.length > 0 ? stuff[stu].rawids.trim().split(" ") : [];
		}
		stuff["release-new"] = {ids: []};
		stuff["missingRecordingWorks"] = [];
	}
	modal(true, "Fetching releases…", 1);
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function(event) {
		if (this.status == 401) {
			end(false, concat(["Error 401. Please ", createA("report bug", GM_info.script.supportURL), " to ", GM_info.script.author, "."]));
		} else if (this.status == 200) {
			modal(true, "Received " + this.response.releases.length.toLocaleString(lang) + " release" + (this.response.releases.length == 1 ? "" : "s") + ":", 2);
			browseReleases(this.response.releases, action, offset, this.response["release-count"]);
			modal(true, " ", 1);
			var newOffset = this.response["release-offset"] + this.response.releases.length;
			if (newOffset < this.response["release-count"]) {
				retry = 0;
				setTimeout(function() { loadCollection(collectionMBID, action, newOffset); }, chrono(MBWSRate));
			} else {
				if (stuff["release-new"].ids.length > 0) {
					delete(stuff["release-new"]); // free up memory
					if (stuff["missingRecordingWorks"].length > 0) {
						modal(true, concat(["<hr>", "\u26A0\uFE0F It is not possible to fetch works for releases with more than 500 tracks.", "<br>", "Fetching missing works now from " + stuff["missingRecordingWorks"].length.toLocaleString(lang) + " recordings. Just wait a little more time:"]), 2);
						retry = 0;
						setTimeout(function() {
							currentTaskStartDate = Date.now();
							loadMissingRecordingWorks(stuff["missingRecordingWorks"], action);
							delete(stuff["missingRecordingWorks"]); // free up memory
						}, chrono(MBWSRate));
					} else {
						end(true);
					}
				} else {
					modal(true, "No new releases.", 2);
					end(true);
				}
			}
		} else {
			if (retry++ < maxRetry) {
				MBWSRate += slowDownStepAfterRetry;
				modal(true, "Error " + this.status + " “" + this.statusText + "” (" + retry + "/" + maxRetry + ")", 2);
				debugRetry(this.status);
				setTimeout(function() { loadCollection(collectionMBID, action, offset); }, chrono(retryPause));
			} else {
				end(false, "Too many (" + maxRetry + ") errors (last " + this.status + " “" + this.statusText + "” while loading collection).");
			}
		}
	});
	debug(MBS + url, true);
	chrono();
	xhr.open("GET", MBS + url, true);
	xhr.responseType = "json";
	xhr.setRequestHeader("Accept", "application/json");
	xhr.send(null);
}
// ############################################################################
// #                                  COLLECT ALL DATA FROM A SET OF RELEASES #
// ############################################################################
function browseReleases(releases, action, offset, releaseCount) {
	for (var r = 0; r < releases.length; r++) {
		var country = releases[r].country ? createTag("span", {a: {class: "flag flag-" + releases[r].country}}) : "";
		var disambiguation = releases[r].disambiguation ? " (" + releases[r].disambiguation + ")" : "";
		modal(true, concat([createTag("code", {s: {whiteSpace: "pre", textShadow: "0 0 8px " + highlightColour}}, (offset + r + 1).toLocaleString(lang).padStart(6, " ")), ". ", country, createA(releases[r].title, "/release/" + releases[r].id), disambiguation]), 1, {text: "releases", current: offset + r + 1, total: releaseCount});
		var missingRecordingLevelRels = 0;
		if (stuff["release"].rawids.indexOf(releases[r].id) < 0) { stuff["release-new"].ids.push(releases[r].id); }
		addRemoveEntities("release", releases[r], action);
		if (stuff["artist"]) { addRemoveEntities("artist", releases[r]["artist-credit"], action); }
		if (stuff["label"]) { addRemoveEntities("label", releases[r]["label-info"], action); }
		addRemoveEntities("release-group", releases[r]["release-group"], action);
		for (var rgRel = 0; rgRel < releases[r]["release-group"].relations.length; rgRel++) {
			// add included release groups and their artists
			if (
				(
					releases[r]["release-group"].relations[rgRel].type == "included in"
					|| releases[r]["release-group"].relations[rgRel]["type-id"] == "589447ea-be2c-46cc-b9e9-469e1d06e18a"
				)
				&& releases[r]["release-group"].relations[rgRel].direction == "backward"
			) {
				modal(true, concat([createTag("code", {s: {whiteSpace: "pre", color: "grey"}}, "\t└"), " Includes ", createA(releases[r]["release-group"].relations[rgRel].release_group.title, "/release-group/" + releases[r]["release-group"].relations[rgRel].release_group.id)]), 1);
				addRemoveEntities("release-group", releases[r]["release-group"].relations[rgRel].release_group, action);
				if (stuff["artist"]) { addRemoveEntities("artist", releases[r]["release-group"].relations[rgRel].release_group["artist-credit"], action); }
			}
		}
		addRemoveEntities("release-group", releases[r]["release-group"], action);
		if (stuff["artist"]) { addRemoveEntities("artist", releases[r]["release-group"]["artist-credit"], action); }
		for (var m = 0; m < releases[r].media.length; m++) {
			if (releases[r].media[m].pregap) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m].pregap, action);
			}
			// TODO: let's study this strange for loop style from https://stackoverflow.com/a/18738341/2236179 one day
			if (releases[r].media[m].tracks) for (var i = 0, len = releases[r].media[m].tracks.length; i < len; ++i) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m].tracks[i], action);
			}
			if (releases[r].media[m]["data-tracks"]) for (var i = 0, len = releases[r].media[m]["data-tracks"].length; i < len; ++i) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m]["data-tracks"][i], action);
			}
		}
		if (missingRecordingLevelRels > 0) {
			modal(true, concat([createTag("code", {s: {whiteSpace: "pre", color: "grey"}}, "\t└"), " \u26A0\uFE0F missing work relationships for " + missingRecordingLevelRels.toLocaleString(lang) + " recordings (will be loaded later)"]), 1);
		}
	}
}
function browseTrack(track, action) {
	var missingRecordingLevelRels = 0;
	if (stuff["artist"]) { addRemoveEntities("artist", track["artist-credit"], action); }
	if (stuff["recording"]) { addRemoveEntities("recording", track.recording, action); }
	if (stuff["artist"]) { addRemoveEntities("artist", track.recording["artist-credit"], action); }
	if (track.recording.relations) {
		for (var w = 0; w < track.recording.relations.length; w++) {
			if (track.recording.relations[w]["type-id"] === "a3005666-a872-32c3-ad06-98af558e99b0") {
				// is a recording of
				if (stuff["work"]) { addRemoveEntities("work", track.recording.relations[w].work, action); }
			}
		}
	} else {
		// no recording.relations: when there are more than 500 tracks, the recording-level-rels are not returned
		if (stuff["missingRecordingWorks"].indexOf(track.recording.id) < 0) {
			// add each recording to a list for later later work fetch
			stuff["missingRecordingWorks"].push(track.recording.id);
			missingRecordingLevelRels += 1;
		}
	}
	return missingRecordingLevelRels;
}
// ############################################################################
// #                                                             UPDATE STUFF #
// ############################################################################
function addRemoveEntities(type, _entities, action) {
	var entities = Array.isArray(_entities) ? _entities : [_entities];
	for (var e = 0; e < entities.length; e++) {
		debug(action + " " + type + "\n" + JSON.stringify(entities[e]));
		var entity = {};
		switch (type) {
			case "artist":
				// pass through
			case "label":
				if (entities[e][type]) {
					entity.id = entities[e][type].id;
					entity.name = entities[e][type].name;
				} else {
					// labels can be null
					entity = null;
				}
				break;
			case "recording":
				// pass through
			case "release":
				// pass through
			case "release-group":
				// pass through
			case "work":
				entity.id = entities[e].id;
				entity.name = entities[e].title;
				break;
		}
		if (
			entity !== null // labels can be null
			&& stuff[type] // this type is highlighted
			&& stuff[type].rawids.indexOf(entity.id) < 0 // this entity is not yet tracked
			&& !(type == "artist" && skipArtists.indexOf(entity.id) >= 0) // ignore Various Artists, etc.
		) {
			switch (action) {
				case "add":
//					modal(true, concat([createTag("b", {}, "Adding "), type, " ", createA(entity.name, "/" + type + "/" + entity.id), "…"]), 1);
					stuff[type].rawids += entity.id + " ";
					break;
				case "remove":
					// TODO: remove entity
					break;
			}
		}
	}
}
// ############################################################################
// #                                  LOAD WORKS FROM HUNDREDS OF RECORDINGS #
// ############################################################################
var mbs12154 = 0; // #### REMOVE WHEN MBS-12154 FIXED // reduce batch size (results in random order, we try to get less than 101 results to keep them all on one page)
function loadMissingRecordingWorks(recordings, action, _batchOffset, _wsResponseOffset) {
	var batchOffset = _batchOffset || 0;
	var wsResponseOffset = _wsResponseOffset || 0;
	// keep the query URL short enough (100 recordings) to avoid 414 Request-URI Too Large
	var batchSize = 100;
	batchSize -= mbs12154; // #### REMOVE WHEN MBS-12154 FIXED
	var batch = recordings.slice(batchOffset, batchOffset + batchSize);
	var workQueryURL = "/ws/2/work?query=rid%3A" + batch.join("+OR+rid%3A") + "&limit=" + MBWSSpeedLimit + "&offset=" + wsResponseOffset;
	if (wsResponseOffset === 0) {
		modal(true, "Fetching works from " + batch.length + " recordings… ", 0);
	}
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function(event) {
		if (this.status == 200) {
			modal(true, this.response.works.length.toString(), 0, {text: "recordings", current: batchOffset + batch.length, total: recordings.length});
			for (var r = 0; r < this.response.works.length; r++) {
				if (stuff["work"]) { addRemoveEntities("work", this.response.works[r], action); }
			}
			var newWsResponseOffset = this.response.offset + this.response.works.length;
			if (newWsResponseOffset < this.response.count) {
				modal(true, createTag("span", {s: {color: "grey"}}, "+"), 0);
				mbs12154 += this.response.count - MBWSSpeedLimit; // #### REMOVE WHEN MBS-12154 FIXED
				if (mbs12154 < MBWSSpeedLimit) { // #### REMOVE WHEN MBS-12154 FIXED
					modal(true, concat(["<br>", "<br>", createTag("b", {s: {color: "red"}}, "MBS-12154 pagination bug!"), "<br>", "Reducing recording batch size: ", createTag("del", {}, batchSize), "→", createTag("b", {}, batchSize - this.response.count + MBWSSpeedLimit), " — ", createA("more info", "//github.com/jesus2099/konami-command/issues/174#issuecomment-1008267401")]), 2); // #### REMOVE WHEN MBS-12154 FIXED
				retry = 0;
// #### UNCOMMENT WHEN MBS-12154 FIXED				setTimeout(function() { loadMissingRecordingWorks(recordings, action, batchOffset, newWsResponseOffset); }, chrono(MBWSRate));
					setTimeout(function() { loadMissingRecordingWorks(recordings, action, batchOffset); }, chrono(MBWSRate)); // #### REMOVE WHEN MBS-12154 FIXED
				} else { // #### REMOVE WHEN MBS-12154 FIXED
					end(false, "MBS-12154 bug\n\nCannot load works."); // #### REMOVE WHEN MBS-12154 FIXED
				} // #### REMOVE WHEN MBS-12154 FIXED
			} else {
				modal(true, " ", 1);
				var newBatchOffset = batchOffset + batch.length;
				if (newBatchOffset < recordings.length) {
					retry = 0;
					setTimeout(function() { loadMissingRecordingWorks(recordings, action, newBatchOffset); }, chrono(MBWSRate));
				} else {
					modal(true, " ", 1);
					end(true);
				}
			}
		} else {
			if (retry++ < maxRetry) {
				MBWSRate += slowDownStepAfterRetry;
				modal(true, "Error " + this.status + " “" + this.statusText + "” (" + retry + "/" + maxRetry + ")", 2);
				debugRetry(this.status);
				setTimeout(function() { loadMissingRecordingWorks(recordings, action, batchOffset, wsResponseOffset); }, chrono(retryPause));
			} else {
				end(false, "Too many (" + maxRetry + ") errors (last " + this.status + " “" + this.statusText + "” while loading missing recording works).");
			}
		}
	});
	debug(MBS + workQueryURL + "&fmt=json");
	chrono();
	xhr.open("GET", MBS + workQueryURL, true);
	xhr.responseType = "json";
	xhr.setRequestHeader("Accept", "application/json");
	xhr.send(null);
}
// ############################################################################
// #                         DYNAMIC COLLECTION UPDATER (FOR CURRENT RELEASE) #
// ############################################################################
var altered = false;
function collectionUpdater(link, action) {
	if (link && action) {
		link.addEventListener("click", function(event) {
			altered = this.getAttribute("href") != self.location.href;
			modal(true, "Refreshing memory…", 1);
			collectionsID = GM_getValue("collections") || "";
			for (let stu in stuff) if (Object.prototype.hasOwnProperty.call(stuff, stu) && collectedStuff.indexOf(stu) >= 0) {
				stuff[stu].rawids = GM_getValue(stu + "s");
				stuff[stu].ids = stuff[stu].rawids != null ? (stuff[stu].rawids.length > 0 ? stuff[stu].rawids.trim().split(" ") : []) : null;
			}
			if (stuff["release"].ids && releaseID) {
				setTitle(true);
				var checks = getStuffs();
				switch (action) {
					case "add":
						if (stuff["release"].rawids.indexOf(releaseID) == -1) {
							modal(true, concat([createTag("b", {}, "Adding this release"), " to loaded collection…"]), 1);
							stuff["release"].rawids += releaseID + " ";
							GM_setValue("releases", stuff["release"].rawids);
							altered = true;
						}
						for (let c = 0; c < checks.length; c++) {
							var match = checks[c].getAttribute("href").match(new RegExp("/(" + strType + ")/(" + strMBID + ")$", "i"));
							if (match) {
								var type = match[1], mbid = match[2];
								if (stuff[type].ids && stuff[type].rawids.indexOf(mbid) < 0 && (type != "artist" || skipArtists.indexOf(mbid) < 0)) {
									modal(true, concat([createTag("b", {}, ["Adding " + type, " ", createA(type != "release-group" ? checks[c].getAttribute("jesus2099userjs81127recname") || checks[c].textContent : mbid, checks[c].getAttribute("href"), type)]), "…"]), 1); // jesus2099userjs81127recname linked to mb_INLINE-STUFF
									stuff[type].rawids += mbid + " ";
									GM_setValue(type + "s", stuff[type].rawids);
									altered = true;
								}
							}
						}
						setTitle(false);
						break;
					case "remove":
						if (stuff["release"].rawids.indexOf(releaseID) > -1) {
							modal(true, concat([createTag("b", {}, "Removing this release"), " from loaded collection…"]), 1);
							stuff["release"].rawids = stuff["release"].rawids.replace(new RegExp(releaseID + "( |$)"), "");
							GM_setValue("releases", stuff["release"].rawids);
							altered = true;
						}
						if (checks.length > 0) {
							lastLink(this.getAttribute("href"));
							stuffRemover(checks);
							return stop(event);
						}
						break;
				}
			}
			if (!altered) {
				modal(true, "Nothing has changed.", 1);
				setTimeout(function() { modal(false); }, 1000);
				return stop(event);
			} else {
				modal(true, "Re‐loading page…", 1);
			}
		}, false);
		decorate(link);
	}
}
// ############################################################################
// #                                    COLLECT ALL DATA FROM CURRENT RELEASE #
// ############################################################################
function getStuffs(what, pwhere) {
	var cont = pwhere ? pwhere : document;
	var selector = {
		"release": "div#content table.tbl > tbody > tr > td a[href^='/release/']", // pwhere(lab,rec,rgr)
		"release-group": "div.releaseheader a[href^='/release-group/']", // rel
		"recording": (pwhere ? "div#content [href^='/recording/']" : "table.medium > tbody > tr > td:not(.pos):not(.video) > a[href^='/recording/'], table.medium > tbody > tr > td:not(.pos):not(.video) > :not(div):not(.ars) a[href^='/recording/']"), // pwhere(art,wrk)/rel
		"artist": "div.releaseheader a[href^='/artist/'], div#content table.tbl > tbody > tr > td > a[href^='/artist/'], div#content table.tbl > tbody > tr > td > span > a[href^='/artist/'], div#content table.tbl > tbody > tr > td > span > span > a[href^='/artist/']", // rel
		"work": "div#content div.ars > dl.ars > dd > a[href^='/work/'], div#content div.ars > dl.ars > dd > span.mp > a[href^='/work/'], div#content div.bottom-credits > table.details > tbody > tr > td > a[href^='/work/'], div#content div.bottom-credits > table.details > tbody > tr > td > span.mp > a[href^='/work/']", // rel
		"label": "div#sidebar > ul.links > li a[href^='/label/']", // rel
	};
	if (what) {
		return cont.querySelectorAll(selector[what]);
	} else {
		var allrelsel = selector["release-group"];
		if (stuff["recording"].ids) { allrelsel += ", " + selector["recording"]; }
		if (stuff["label"].ids) { allrelsel += ", " + selector["label"]; }
		var all = basicOnly(cont.querySelectorAll(allrelsel));
		var allrecsel = "", sep = "";
		if (stuff["artist"].ids) { allrecsel += sep + selector["artist"]; sep = ", "; }
		if (stuff["work"].ids) { allrecsel += sep + selector["work"]; }
		if (allrecsel != "") {
			all = basicOnly(cont.querySelectorAll(allrecsel), all);
		}
		return all;
	}
	function pathname(href) {
		return href.match(new RegExp("/[^/]+/" + strMBID)) + "";
	}
	function basicOnly(nodes, parr) {
		var arr = parr ? parr : [];
		var hrefs = [];
		for (let a = 0; a < arr.length; a++) {
			hrefs.push(pathname(arr[a].getAttribute("href")));
		}
		for (let n = 0; n < nodes.length; n++) {
			if (nodes[n].getAttribute) {
				var href = pathname(nodes[n].getAttribute("href"));
				if (href && href.match(new RegExp(strMBID + "$")) && hrefs.indexOf(href) == -1) {
					hrefs.push(href);
					arr.push(nodes[n]);
				}
			}
		}
		return arr;
	}
}
// ############################################################################
// #                                             CHECK IF STUFF IS STILL USED #
// ############################################################################
function stuffRemover(checks, pp) {
	var check = checks[0];
	if (check) {
		var p = pp ? pp : 1;
		var checkMatch = check.getAttribute("href").match(new RegExp("/(" + strType + ")/(" + strMBID + ")$", "i"));
		if (checkMatch) {
			var checkType = checkMatch[1];
			var checkID = checkMatch[2];
			var checkAgainst;
			switch (checkType) {
				case "label":
				case "recording":
				case "release-group":
					checkAgainst = "release";
					break;
				case "artist":
				case "work":
					checkAgainst = "recording";
					break;
			}
			if (stuff[checkAgainst].rawids && stuff[checkType].rawids.indexOf(checkID) > -1) {
				var url = "/" + checkType + "/" + checkID;
				if (checkType == "artist") { url += "/recordings"; }
				url += "?page=" + p;
				modal(true, concat(["Checking " + checkType + " ", createA(checkType != "release-group" ? check.getAttribute("jesus2099userjs81127recname") || check.textContent : checkID, check.getAttribute("href"), checkType), " against all its ", createA(checkAgainst + "s" + (p > 1 ? " (page " + p + ")" : ""), url), "…"]), 1); // jesus2099userjs81127recname linked to mb_INLINE-STUFF
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(event) {
					if (this.readyState == 4) {
						if (this.status == 200) {
							var res = document.createElement("html"); res.innerHTML = this.responseText;
							var nextPage = res.querySelector(css_nextPage);
							var mates = getStuffs(checkAgainst, res);
							for (let m = 0; m < mates.length; m++) {
								if (stuff[checkAgainst].rawids.indexOf(mates[m].getAttribute("href").match(new RegExp(strMBID))) > -1) {
									modal(true, createTag("span", {s: {color: "grey"}}, ["still used by ", createA(mates[m].textContent, mates[m].getAttribute("href"), checkAgainst), ": keeping."]), 1);
									retry = 0;
									setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
									return;
								}
							}
							if (nextPage) {
								if (p == 1) { modal(true, createTag("span", {s: {color: "grey"}}, "(several pages but this check will stop as soon as it finds something)"), 1); }
								retry = 0;
								setTimeout(function() { stuffRemover(checks, p + 1); }, chrono(MBWSRate));
							} else {
								modal(true, concat([createTag("span", {s: {color: "grey"}}, "not used any more: "), createTag("b", {}, "removing"), "…"]), 1);
								stuff[checkType].rawids = stuff[checkType].rawids.replace(new RegExp(checkID + "( |$)"), "");
								GM_setValue(checkType + "s", stuff[checkType].rawids);
								altered = true;
								retry = 0;
								setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
							}
						} else {
							if (retry++ < maxRetry) {
								MBWSRate += slowDownStepAfterRetry;
								debugRetry(this.status);
								setTimeout(function() { stuffRemover(checks, p); }, chrono(retryPause));
							} else {
								end(false, "Too many (" + maxRetry + ") errors (last " + this.status + " while checking stuff to remove).");
							}
						}
					} // 4
				};
				debug(MBS + url);
				chrono();
				xhr.open("GET", MBS + url, true);
				xhr.send(null);
			} else {
				if (!stuff[checkAgainst].rawids) {/* Protection for some edge cases of new script using old script data */
					modal(true, concat([createTag("span", {s: {color: "grey"}}, ["no ", checkAgainst, "s at all (", createA("#87", "//github.com/jesus2099/konami-command/issues/87"), "): "]), "removing…"]), 1);
					stuff[checkType].rawids = stuff[checkType].rawids.replace(new RegExp(checkID + "( |$)"), "");
					GM_setValue(checkType + "s", stuff[checkType].rawids);
					altered = true;
				}
				retry = 0;
				setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
			}
		}
	} else {
		setTitle(false);
		if (altered) { lastLink(); } else { modal(false); }
	}
}
// ############################################################################
// #                                                                          #
// #                           ACCESSORY DISPLAY FUNCTIONS                    #
// #                                                                          #
// ############################################################################
function setTitle(ldng, percentage) {
	var old = document.title.match(/ :: (.+)$/);
	old = old ? old[1] : document.title;
	if (ldng) {
		document.title = (percentage ? percentage + "%" : "⌛") + " Altering highlighter content… :: " + old;
	} else {
		document.title = old;
	}
}
function end(ok, msg) {
	setTitle(false);
	if (debugBuffer != "") { debug(""); }
	if (ok) {
		modal(true, concat(["<hr>", createTag("h2", {}, "Highlighted stuff")]), 1);
		// display summary of added entities and write all MBID in the storage now
		for (let type in stuff) if (Object.prototype.hasOwnProperty.call(stuff, type) && stuff[type].rawids) {
			stuff[type].ids = stuff[type].rawids.length > 0 ? stuff[type].rawids.trim().split(" ") : [];
			modal(true, createTag("span", {}, [createTag("code", {s: {whiteSpace: "pre", textShadow: "0 0 8px " + highlightColour}}, stuff[type].ids.length.toLocaleString(lang).padStart(12, " ")), createTag("b", {}, " " + type.replace(/-/, " ") + (stuff[type].ids.length == 1 ? "" : "s")), "… "]));
			GM_setValue(type + "s", stuff[type].rawids);
			modal(true, "saved.", 1);
			stuff[type].rawids = "";
			stuff[type].ids = [];
		}
		GM_setValue("collections", collectionsID);
		modal(true, concat(["<hr>", "Collection loaded in highlighter in ", sInt2msStr(Math.floor((Date.now() - collectionLoadingStartDate) / 1000)), ".", "<br>", "You may now enjoy this stuff highlighted in various appropriate places. YAY(^o^;)Y", "<br>"]), 1);
	} else {
		modal(true, createTag("pre", {s: {fontWeight: "bolder", backgroundColor: "yellow", color: "red", border: "2px dashed black", boxShadow: "2px 2px 2px grey", width: "fit-content", margin: "1em auto", padding: "1em"}}, createTag("code", {}, msg)), 1).style.setProperty("background-color", "pink");
		alert(dialogprefix + msg);
		modal(true, concat(["You may ", createA("have a look at known issues and/or create a new bug report", GM_info.script.namespace + "/issues/new?labels=" + GM_info.script.name.replace(". ", "_").replace(" ", "-")), " or just ", createA("reload this page", function(event) { self.location.reload(); }), "."]), 1);
	}
	closeButt();
}
function closeButt() {
	modal(true, concat(["☞ You can now review these cute logs, or close it (press “Escape” or click outside). ஜ۩۞۩ஜ"]), 1);
	document.getElementById(prefix + "Modal").previousSibling.addEventListener("click", closeModal);
	document.body.addEventListener("keydown", closeModal);
}
function closeModal(event) {
	if (event.type == "click" || event.type == "keydown" && event.key == "Escape") {
		var modalWall = document.getElementById(prefix + "Modal").previousSibling;
		if (gaugeto) { clearTimeout(gaugeto); gaugeto = null; }
		modalWall.parentNode.removeChild(modalWall.nextSibling);
		modalWall.parentNode.removeChild(modalWall);
		if (event.type == "keydown") {
			document.body.removeEventListener("keydown", closeModal);
		}
	}
}
var gaugeto;
function modal(show, txt, brs, gauge) {
	var obj = document.getElementById(prefix + "Modal");
	if (show && !obj) {
		coolstuff("div", "50", "100%", "100%", "black", ".6");
		obj = coolstuff("div", "55", "600px", "92%", "white");
		obj.setAttribute("id", prefix + "Modal");
		obj.style.setProperty("padding", "4px");
		obj.style.setProperty("overflow", "auto");
		obj.style.setProperty("border", "4px solid black");
		obj.addEventListener("mouseover", function(event) { this.style.setProperty("border-color", "silver"); }, false);
		obj.addEventListener("mouseout", function(event) { this.style.setProperty("border-color", "black"); }, false);
		var gaug = obj.appendChild(document.createElement("div"));
		gaug.style.setProperty("position", "fixed");
		gaug.style.setProperty("left", 0);
		gaug.style.setProperty("bottom", 0);
		gaug.style.setProperty("width", 0);
		gaug.style.setProperty("background", "black");
		gaug.appendChild(document.createTextNode("\u00a0"));
		gaug = gaug.appendChild(document.createElement("div"));
		gaug.style.setProperty("position", "fixed");
		gaug.style.setProperty("left", 0);
		gaug.style.setProperty("bottom", 0);
		gaug.style.setProperty("width", "100%");
		gaug.style.setProperty("text-align", "center");
		gaug.style.setProperty("color", "white");
		gaug.style.setProperty("text-shadow", "1px 2px 2px black");
		gaug.appendChild(document.createTextNode("\u00a0"));
	}
	if (show && obj && txt) {
		if (gauge) {
			var percentage = Math.floor(100 * gauge.current / gauge.total);
			if (percentage) {
				var gau = obj.firstChild;
				if (gaugeto || gau.style.getPropertyValue("display") == "none") {
					clearTimeout(gaugeto);
					gaugeto = null;
					gau.style.setProperty("display", "block");
				}
				gau.style.setProperty("width", Math.ceil(self.innerWidth * gauge.current / gauge.total) + "px");
				var elapsedSeconds = Math.floor((Date.now() - currentTaskStartDate) / 1000);
				var totalSeconds = Math.ceil(elapsedSeconds > 0 ? elapsedSeconds * gauge.total / gauge.current : (gauge.total - gauge.current) * MBWSRate / 1000);
				gau.lastChild.replaceChild(document.createTextNode((gauge.text ? gauge.text + " " : "") + gauge.current.toLocaleString(lang) + " / " + gauge.total.toLocaleString(lang) + " (" + percentage + "%); loading time: elapsed " + sInt2msStr(elapsedSeconds) + " / estimated total " + sInt2msStr(totalSeconds) + ", remaining " + sInt2msStr(totalSeconds - elapsedSeconds)), gau.lastChild.firstChild);
				setTitle(true, percentage);
				if (gauge.current >= gauge.total) {
					gaugeto = setTimeout(function() {
						if ((obj = document.getElementById(prefix + "Modal")) !== null) {
							obj.firstChild.style.setProperty("display", "none");
						}
					}, 10000);
				}
			}
		}
		var br = 0;
		if (brs && brs > 0) { br = brs; }
		obj.appendChild(typeof txt == "string" ? document.createTextNode(txt) : txt);
		for (let ibr = 0; ibr < br; ibr++) {
			obj.appendChild(document.createElement("br"));
		}
		if (obj.style.getPropertyValue("border-color") == "black") {
			obj.scrollTop = obj.scrollHeight;
		}
	}
	if (!show && obj) {
		obj.parentNode.removeChild(obj.previousSibling);
		obj.parentNode.removeChild(obj);
	}
	return obj;
	function coolstuff(t, z, x, y, b, o) {
		var truc = document.body.appendChild(document.createElement(t));
		truc.style.setProperty("position", "fixed");
		truc.style.setProperty("z-index", z);
		truc.style.setProperty("width", x);
		var xx = x.match(/^([0-9]+)(px|%)$/);
		if (xx) {
			if (xx[2] == "px" && xx[1] >= self.innerWidth) {
				truc.style.setProperty("width", (self.innerWidth - 8) + "px");
				truc.style.setProperty("left", (self.pageXOffset - 4) + "px"); // pageXOffset unfortunately always returns 0 (?!)
			} else {
				truc.style.setProperty("left", ((xx[2] == "%" ? 100 : self.innerWidth) - xx[1]) / 2 + xx[2]);
			}
		}
		truc.style.setProperty("height", y);
		var yy = y.match(/^([0-9]+)(px|%)$/);
		if (yy) {
			truc.style.setProperty("top", ((yy[2] == "%" ? 100 : self.innerHeight) - yy[1]) / 4 + yy[2]);
		}
		if (b) { truc.style.setProperty("background", b); }
		if (o) { truc.style.setProperty("opacity", o); }
		return truc;
	}
}
// ############################################################################
// #                                                                          #
// #                           ACCESSORY TECHNICAL FUNCTIONS                  #
// #                                                                          #
// ############################################################################
function lastLink(href) {
	if (href) {
		GM_setValue("lastlink", href);
	} else {
		var ll = GM_getValue("lastlink");
		if (ll) {
			GM_deleteValue("lastlink");
			modal(true, "Re‐loading page…", 1);
			setTimeout(function() { self.location.href = ll; }, chrono(MBWSRate));
		} else {
			modal(true, " ", 1);
			end(false, "Sorry, I’m lost. I don’t know what was the link you last clicked.");
		}
	}
}
function createA(text, link, title, stay) {
	var a = document.createElement("a");
	a.appendChild(document.createTextNode(text));
	if (link && typeof link == "string") {
		a.setAttribute("href", link);
		if (!stay) {
			a.setAttribute("target", "_blank");
		}
	} else {
		if (link && typeof link == "function") {
			a.addEventListener("click", link, false);
		}
		a.style.setProperty("cursor", "pointer");
	}
	if (title){ a.setAttribute("title", title); }
	return a;
}
function concat(tstuff) {
	var concats = document.createDocumentFragment();
	var stuff = tstuff;
	if (typeof stuff != "object" || !stuff.length) {
		stuff = [stuff];
	}
	for (let thisStuff = 0; thisStuff < stuff.length; thisStuff++) {
		var ccat = stuff[thisStuff];
		if (typeof ccat == "string") {
			var ccatr = ccat.match(/^<(.+)>$/);
			if (ccatr) {
				ccat = document.createElement(ccatr[1]);
			} else {
				ccat = document.createTextNode(ccat);
			}
		}
		concats.appendChild(ccat);
	}
	return concats;
}
var lastchrono;
function chrono(delay) {
	if (delay) {
		var del = delay + lastchrono - new Date().getTime();
		del = del > 0 ? del : 0;
		return del;
	} else {
		lastchrono = new Date().getTime();
		return lastchrono;
	}
}
function sInt2msStr(seconds) {
	var s = seconds;
	var div = s % (60 * 60);
	var h = Math.floor(s / (60 * 60));
	var m = Math.floor(div / 60);
	    s = Math.ceil(div % 60);
	return ((h > 0 ? h + ":" : "") + (m > 9 ? m : "0" + m) + ":" + (s > 9 ? s : "0" + s));
}
function debug(txt, buffer) {
	if (DEBUG) {
		if (buffer) {
			debugBuffer += txt + "\n";
		} else {
			console.debug(prefix + "\n" + debugBuffer + txt);
			debugBuffer = "";
		}
	}
}
function debugRetry(status) {
	debug("Error " + status + "\nRetrying (" + retry + "/" + maxRetry + ") in " + retryPause + " ms\nSlowing down, new rate: " + (MBWSRate - slowDownStepAfterRetry) + "+" + slowDownStepAfterRetry + " = " + MBWSRate + " ms");
}
function nsr(prefix) {
	var ns = {
		xhtml: "http://www.w3.org/1999/xhtml",
		mb: "http://musicbrainz.org/ns/mmd-2.0#",
	};
	return ns[prefix] || null;
}
