// ==UserScript==
// @name         mb. COLLECTION HIGHLIGHTER
// @version      2025.12.30
// @description  musicbrainz.org: Highlights releases, release-groups, etc. that you have in your collections (anyone’s collection can be loaded) everywhere
// @namespace    https://github.com/jesus2099/konami-command
// @homepageURL  https://community.metabrainz.org/t/collection-highlighter-highlight-owned-stuff-releases-recordings/559889?u=jesus2099
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_COLLECTION-HIGHLIGHTER
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COLLECTION-HIGHLIGHTER.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-02-21; https://web.archive.org/web/20140327054755/userscripts.org/scripts/show/126380 / https://web.archive.org/web/20141011084019/userscripts-mirror.org/scripts/show/126380
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(eu|org)\//
// @exclude      /^https?:\/\/((beta|test)\.)?musicbrainz\.(eu|org)\/account\//
// @exclude      /^https?:\/\/((beta|test)\.)?musicbrainz\.(eu|org)\/admin\//
// @include      /^https?:\/\/acoustid\.org\/track\//
// @include      /^https?:\/\/magicisrc\.kepstin\.ca\//
// @run-at       document-end
// ==/UserScript==
"use strict";
var DEBUG = localStorage.getItem("jesus2099debug");
var userjs = {
	name_ver: GM_info.script.name.substr(4) + " " + GM_info.script.version,
	prefix: "collectionHighlighter",
	highlightColour: "purple",
	MBWSRate: 999,
	MBWSSpeedLimit: 100, // from 1 (only 1 result per request) to 100 (maxium amount of result per request)
	maxRetry: 20,
	retryPause: 5000,
	slowDownStepAfterRetry: 0,
};
// ############################################################################
// #                                                                          #
// #                         BUTTONS / TRIGGERS / GUI                         #
// #                                                                          #
// ############################################################################
var MBS = self.location.protocol + "//" + self.location.host;
var lang = document.querySelector("html[lang]");
lang = lang && lang.getAttribute("lang") || "en-GB";
var cat = self.location.pathname.match(/(area(?!.+(artists|labels|releases|places|aliases|edits))|artist(?!.+(releases|recordings|works|relationships|aliases|edits))|artists|event|labels|releases|recordings|report|series|track|works|aliases|cdtoc|collection(?!s|.+edits)|collections|edit(?!s|\/subscribed)|edits|votes|edit\/subscribed|isrc|label(?!.+edits)|place(?!.+(aliases|edits))|puid|ratings|recording(?!s|.+edits)|relationships|release[-_]group(?!.+edits)|release(?!s|-group|.+edits)|search(?!\/edits)|tracklist|tag|url|work(?!s))/) || location.host.match(/\b(magicisrc)\b/);
if (cat) {
	/* -------- CONFIGURATION START (don’t edit above) -------- */
	userjs.skipArtists = [
		"89ad4ac3-39f7-470e-963a-56509c546377", // Various Artists
		"f731ccc4-e22a-43af-a747-64213329e088", // [anonymous]
		"33cf029c-63b0-41a0-9855-be2a3665fb3b", // [data]
		"314e1c25-dde7-4e4d-b2f4-0a7b9f7c56dc", // [dialogue]
		"eec63d3c-3b81-4ad4-b1e4-7c147d4d2b61", // [no artist]
		"a0ef7e1d-44ff-4039-9435-7d5fefdeecc9", // [theatre]
		"9be7f096-97ec-4615-8957-8d40b5dcbc41", // [traditional]
		"125ec42a-7229-4250-afc5-e057484327fe", // [unknown]
	];
	userjs.skipLabels = [
		"157afde4-4bf5-4039-8ad2-5a15acc85176", // [no label]
		"46caaa9e-3e26-49b5-827c-64ccc73c1b07", // [unknown]
	];
	/* -------- CONFIGURATION  END  (don’t edit below) -------- */
	userjs.dialogprefix = "..:: " + userjs.name_ver.replace(/ /g, " :: ") + " ::..\n\n";
	userjs.retry = 0;
	userjs.lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 1; // 1 (GB) on my Raspberry Pi 3B+
	var j2ss = document.createElement("style");
	j2ss.setAttribute("type", "text/css");
	document.head.appendChild(j2ss);
	j2ss = j2ss.sheet;
	var brdr = " border-left: 3px solid " + userjs.highlightColour + "; ";
	j2ss.insertRule("." + userjs.prefix + "Box {" + brdr.replace(/-left/, "") + "}", 0);
	j2ss.insertRule("." + userjs.prefix + "Row {" + brdr + "}", 0);
	j2ss.insertRule("li." + userjs.prefix + "Row { padding-left: 3px; }", 0);
	j2ss.insertRule("." + userjs.prefix + "Item { text-shadow: 0 0 8px " + userjs.highlightColour + "!important; }", 0);
	userjs.collectionsID = GM_getValue("collections") || "";
	userjs.stuff = {};
	userjs.collected_stuff = ["collection", "release", "release-group", "recording", "artist", "work", "label"];
	userjs.strType = "release-group|recording|label|artist|work";
	userjs.strMBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	cat = cat[1].replace(/edit\/subscribed|votes/, "edits").replace(/_/, "-");
	debug("CAT: " + cat);
// ############################################################################
// #                                       DISPLAY RELEASE PAGE SIDEBAR TOOLS #
// ############################################################################
	if (cat == "release" && (userjs.releaseID = self.location.pathname.match(new RegExp(userjs.strMBID)))) {
		userjs.releaseID = userjs.releaseID[0];
		var mainReleasePage = self.location.pathname.match(new RegExp("^/release/" + userjs.strMBID + "$"));
		var colls = document.querySelectorAll("div#sidebar a[href*='/collection_collaborator/add?release='], div#sidebar a[href*='/collection_collaborator/remove?release=']");
		userjs.in_this_many_collections = 0;
		for (let coll = 0; coll < colls.length; coll++) {
			if (userjs.collectionsID.indexOf(colls[coll].getAttribute("href").match(new RegExp(userjs.strMBID))) > -1) {
				if (colls[coll].getAttribute("href").match(/remove/)) {
					userjs.in_this_many_collections += 1;
				}
				if (mainReleasePage) {
					collectionUpdater(colls[coll], colls[coll].getAttribute("href").match(/add|remove/).toString());
				} else {
					addAfter(createTag("div", {s: {textShadow: "0 0 8px " + userjs.highlightColour}}, ["(please go to ", createTag("a", {a: {href: "/release/" + userjs.releaseID}}, "main release page"), " for this button to auto‐update your collection highlighter)"]), colls[coll]);
				}
			}
		}
		/* if (mainReleasePage) { // TODO: Feature hidden as long as it is not working (will not add any elements of releases already partially highlighted)
			var lili = document.querySelector("div#sidebar > h2.collections ~ ul.links");
			if (lili) {
				var buttxt = " this release to your local collection highlighter,\nwithout changing its status among you MB collection(s)";
				lili = lili.insertBefore(document.createElement("li"), lili.firstChild);
				lili.appendChild(document.createTextNode("Force highlight "));
				collectionUpdater(lili.appendChild(createA("ON", self.location.href, "Add" + buttxt, true)), "add");
				lili.appendChild(document.createTextNode(" / "));
				collectionUpdater(lili.appendChild(createA("OFF", self.location.href, "Remove" + buttxt.replace(" to ", " from "), true)), "remove");
			}
		} */
	}
	if (cat == "collections") {
// ############################################################################
// #                                     DISPLAY COLLECTION PAGE LOADER TOOLS #
// ############################################################################
		var xp1 = document.evaluate("//xhtml:table[contains(@class, 'tbl')]/xhtml:thead//xhtml:th/text()[contains(., 'Veröffentlichungen') or contains(., 'Väljalasked') or contains(., 'Releases') or contains(., 'Publicaciones') or contains(., 'Parutions') or contains(., 'Pubblicazioni') or contains(., 'Uitgaves') or contains(., 'Julkaisut') or contains(., 'Κυκλοφορίες') or contains(., 'リリース')]", document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let tbl_idx = 0; tbl_idx < xp1.snapshotLength > 0; tbl_idx++) {
			xp1.snapshotItem(tbl_idx).parentNode.parentNode.appendChild(createTag("th", {a: {colspan: "2"}}, userjs.name_ver));
			var tbl = getParent(xp1.snapshotItem(tbl_idx).parentNode, "table");
			var xp = document.evaluate("./xhtml:tbody/xhtml:tr", tbl, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			for (let i = 0; i < xp.snapshotLength; i++) {
				let coll = xp.snapshotItem(i).getElementsByTagName("a")[0];
				var collid = coll.getAttribute("href").match(new RegExp(userjs.strMBID));
				var loadButtons = [];
				var loadButtonText = "Load";
				if (userjs.collectionsID.indexOf(collid) > -1) {
					decorate(coll);
					loadButtonText = "Reload";
				}
				loadButtons.push(createA(
					"Append",
					function(event) {
						var opts = document.querySelectorAll("td." + userjs.prefix + " input[type='checkbox']:checked");
						userjs.stuff = {};
						for (let opt = 0; opt < opts.length; opt++) {
							userjs.stuff[opts[opt].getAttribute("name")] = {};
						}
						userjs.collectionLoadingStartDate = Date.now();
						userjs.currentTaskStartDate = Date.now();
						loadCollection(this.getAttribute("title").match(new RegExp(userjs.strMBID)), "add");
					},
					"Add this collection’s content to highlighter (" + collid + ")"
				));
				loadButtons.push(" | ");
				loadButtons.push(createA(
					loadButtonText,
					function(event) {
						var cmsg = "This will REPLACE your current loaded stuff.";
						if (confirm(userjs.dialogprefix + cmsg)) {
							// erase local stuff
							for (let stu = 0; stu < userjs.collected_stuff.length; stu++) {
								GM_deleteValue(userjs.collected_stuff[stu] + "s");
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
					for (let stu = 0; stu < userjs.collected_stuff.length; stu++) if (userjs.collected_stuff[stu] != "collection") {
						var cstuff = userjs.collected_stuff[stu];
						var lab = document.createElement("label");
						lab.appendChild(concat([createTag("input", {a: {type: "checkbox", name: cstuff}, e: {change: function(event) { GM_setValue("cfg" + this.getAttribute("name"), this.checked ? "1" : "0"); }}}), cstuff + "s "]));
						var cfgcb = lab.querySelector("input[type='checkbox'][name='" + cstuff + "']");
						if (cstuff.match(/artist|recording|release(-group)?|work/)) {
							// defaults
							cfgcb.setAttribute("checked", "checked");
						}
						if (cstuff.match(/release(-group)?/)) {
							// forced
							lab.style.setProperty("opacity", ".5");
							cfgcb.setAttribute("disabled", "disabled");
						} else {
							// read previous settings
							var cfgstu = GM_getValue("cfg" + cstuff);
							if (cfgstu == "1") {
								cfgcb.setAttribute("checked", "checked");
							} else if (cfgstu == "0") {
								cfgcb.removeAttribute("checked");
							}
						}
						if (cstuff.match(/artist|work/)) {
							// artist and work tracking requires recording tracking
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
					xp.snapshotItem(i).appendChild(createTag("td", {a: {class: userjs.prefix, rowspan: xp.snapshotLength}}, concat(settings)));
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
		// MusicBrainz.org and magicisrc: React problems
		var DOMChanged = true;
		(new MutationObserver(function(mutations, observer) {
			for (var m = 0; m < mutations.length; m++) {
				if (mutations[m].type === "childList") {
					DOMChanged = true;
				}
			}
		})).observe(document.querySelector(cat == "magicisrc" ? "body" : "div#content, div#page"), {childList: true, subtree: true});
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
	// Annotation link trim spaces and protocol + "//" + host
	for (let annotationLinks = document.querySelectorAll("div#content div.annotation a, div#content div.annotation-preview a"), l = 0; l < annotationLinks.length; l++) {
		annotationLinks[l].setAttribute("href", annotationLinks[l].getAttribute("href").trim().replace(/^((https?:)?\/\/((beta|test)\.)?musicbrainz\.org)\//, "/"));
	}
	for (let stu = 0; stu < userjs.collected_stuff.length; stu++) {
		var cstuff = userjs.collected_stuff[stu];
		userjs.stuff[cstuff] = {};
		var uphill = "";
		var downhill = cat == "release" && cstuff == "label" ? "" : "[count(ancestor::xhtml:div[contains(@id, 'sidebar')])=0]";
		var root = cat == "track" /* acoustid.org */ ? "//musicbrainz.org/" : "/";
		var path = uphill + "//xhtml:a[contains(@href, '" + root + cstuff + "/')][not(starts-with(@class, '" + userjs.prefix + "'))]" + downhill;
		var xp = document.evaluate(path, document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let i = 0; i < xp.snapshotLength; i++) {
			var mbid = xp.snapshotItem(i).getAttribute("href").match(new RegExp("/" + cstuff + "/(" + userjs.strMBID + ")$"));
			if (mbid) {
				mbid = mbid[1];
				debug(cstuff + " is already loaded? " + userjs.stuff[cstuff].loaded);
				if (!userjs.stuff[cstuff].loaded) {
					debug("Load " + cstuff);
					userjs.stuff[cstuff].rawids = GM_getValue(cstuff + "s");
					if (userjs.stuff[cstuff].rawids) {
						userjs.stuff[cstuff].ids = userjs.stuff[cstuff].rawids.trim().split(" ");
						debug(" \n" + userjs.stuff[cstuff].ids.length + " " + cstuff.toUpperCase() + (userjs.stuff[cstuff].ids.length == 1 ? "" : "S") + " loaded (" + cstuff + "s)\nMatching: " + path);
					} else { debug(" \nNo " + cstuff.toUpperCase() + "S in highlighter (" + cstuff + "s)"); }
					userjs.stuff[cstuff].loaded = true;
					debug(cstuff + " is now loaded? " + userjs.stuff[cstuff].loaded);
				}
				if (userjs.stuff[cstuff].ids && userjs.stuff[cstuff].ids.indexOf(mbid) > -1) {
					debug(mbid + " ● “" + xp.snapshotItem(i).textContent + "”");
					decorate(xp.snapshotItem(i));
				}
			}
		}
	}
}
// ############################################################################
// #                                              HIGHLIGHT / DECORATE A LINK #
// ############################################################################
function decorate(entityLink) {
	if (!getParent(entityLink, "div", "tabs")) {
		// Does not highlight tabs.
		entityLink.classList.add(userjs.prefix + "Item");
		var page = document.getElementById("page");
		if (getParent(entityLink, "h1")) {
			// Entity page is boxed.
			page.classList.add(userjs.prefix + "Box");
		} else {
			var entityType = entityLink.getAttribute("href").match(new RegExp("/(.+?)/" + userjs.strMBID, "i")) || "";
			if (entityType) {
				entityType = entityType[1];
			}
			if (cat == "edit") {
				// entity edit page is boxed
				var editDetails = getParent(entityLink, "table", "details");
				if (editDetails && entityLink == editDetails.querySelector("a")) {
					page.classList.add(userjs.prefix + "Box");
				}
			} else if (cat == "edits") {
				// in edit lists: Release or release group edits are boxed; other entity edits are left bordered
				var edit = getParent(entityLink, "div", "edit-list");
				if (edit) {
					edit.classList.add(userjs.prefix + (entityLink == edit.querySelector("div.edit-details a") ? "Box" : "Row"));
				}
			}
			// Associated tracks are Leftmost entity table rows are left bordered. Not in owned release tracklists
			var row = !getParent(entityLink, "ul") && !getParent(entityLink, "dl") && getParent(entityLink, "tr");
			if (row) {
				if (
					entityLink == row.querySelector("a[href]:not([href*='coverartarchive.org']):not([href*='/track/']):not([href$='/cover-art'])" + (cat == "recording" ? ":not([href^='/artist/'])" : ""))
					&& !(cat == "cdtoc" && entityType == "recording")
					&& !(cat == "release" && page.classList.contains(userjs.prefix + "Box") && entityType == "recording")
					&& cat != "aliases"
				) {
					row.classList.add(userjs.prefix + "Row");
				}
				// decorate tracks without holding them
				if (cat == "release" && entityType == "recording" || cat == "recording" && entityType == "release") {
					var track = row.querySelector("a[href*='/track/']");
					if (track) {
						track.classList.add(userjs.prefix + "Item");
					}
				}
			}
		}
	}
}
// ############################################################################
// #                                         COLLECT RELEASES FROM COLLECTION #
// ############################################################################
function loadCollection(collectionMBID, action) {
	setTitle(true);
	// Add collection MBID to list of highlighted
	userjs.collectionsID = GM_getValue("collections") || "";
	if (userjs.collectionsID.indexOf(collectionMBID) < 0) {
		userjs.collectionsID += collectionMBID + " ";
	}
	modal(true, concat([createTag("h3", {}, userjs.dialogprefix), "WTF? If you want to stop this monster crap, just ", createA("reload", function(event) { self.location.reload(); }), " or close this page.", "<br>", "<br>", "<hr>", "Loading collection " + collectionMBID + "…"]), 2);
	for (let stu in userjs.stuff) if (Object.prototype.hasOwnProperty.call(userjs.stuff, stu) && userjs.collected_stuff.indexOf(stu) >= 0) {
		userjs.stuff[stu].rawids = GM_getValue(stu + "s") || "";
	}
	userjs.stuff["release-new"] = {ids: []};
	userjs.stuff["missingRecordingWorks"] = [];
	if (userjs.lowMemory) {
		modal(true, "Low memory machine (" + navigator.deviceMemory + " GB): Displaying less stuff to preserve performances.", 2);
	}
	loadReleases("?collection=" + collectionMBID, action, concludeCollectionLoading);
}
function loadReleases(query /* "?collection=MBID&" or "/MBID?" */, action /* add or remove */, conclusionCallback, _offset) {
	var offset = _offset || 0;
	var ws2releaseUrl = "/ws/2/release" + query + (query.indexOf("?") >= 0 ? "&" : "?") + "inc=release-groups+release-group-level-rels+release-group-rels+labels+recordings+artist-credits+recording-level-rels+work-rels+recording-rels&limit=" + userjs.MBWSSpeedLimit + "&offset=" + offset;
	if (offset == 0 || !userjs.lowMemory) {
		modal(true, "Fetching releases…", 1);
	}
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("readystatechange", function(event) {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status == 401) {
				error(concat(["Error 401. Please ", createA("report bug", GM_info.script.supportURL), " to ", GM_info.script.author, "."]));
			} else if (this.status == 200) {
				var oneRelease = this.response.releases === undefined;
				if (!userjs.lowMemory) {
					modal(true, "Received " + (oneRelease ? 1 : this.response.releases.length.toLocaleString(lang)) + " release" + ((oneRelease ? 1 : this.response.releases.length) == 1 ? "" : "s") + ":", 2);
				}
				browseReleases(oneRelease ? [this.response] : this.response.releases, action, offset, oneRelease ? 1 : this.response["release-count"]);
				if (!userjs.lowMemory) {
					modal(true, "", 1);
				}
				var newOffset = !oneRelease && this.response["release-offset"] + this.response.releases.length;
				if (!oneRelease && newOffset < this.response["release-count"]) {
					userjs.retry = 0;
					setTimeout(function() { loadReleases(query, action, conclusionCallback, newOffset); }, chrono(userjs.MBWSRate));
				} else {
					// end of recursive function
					if (userjs.stuff["release-new"].ids.length > 0) {
						delete(userjs.stuff["release-new"]); // free up memory
						if (userjs.stuff["missingRecordingWorks"].length > 0) {
							modal(true, concat(["<hr>", "\u26A0\uFE0F Big releases require ", createTag("b", {s: {color: userjs.highlightColour}}, "delayed work fetching"), " (for " + userjs.stuff["missingRecordingWorks"].length.toLocaleString(lang) + " recordings):"]), 2);
							userjs.retry = 0;
							setTimeout(function() {
								userjs.currentTaskStartDate = Date.now();
								loadMissingRecordingWorks(userjs.stuff["missingRecordingWorks"], action, conclusionCallback);
								delete(userjs.stuff["missingRecordingWorks"]); // free up memory
							}, chrono(userjs.MBWSRate));
						} else {
							conclusionCallback();
						}
					} else {
						modal(true, "No new releases.", 2);
						conclusionCallback();
					}
				}
			} else {
				if (userjs.retry++ < userjs.maxRetry) {
					userjs.MBWSRate += userjs.slowDownStepAfterRetry;
					modal(true, "Error " + this.status + " “" + this.statusText + "” (" + userjs.retry + "/" + userjs.maxRetry + ")", 2);
					debugRetry(this.status);
					setTimeout(function() { loadReleases(query, action, conclusionCallback, offset); }, chrono(userjs.retryPause));
				} else {
					error("Too many (" + userjs.maxRetry + ") errors (last " + this.status + " “" + this.statusText + "” while loading collection).");
				}
			}
		}
	});
	debug(MBS + ws2releaseUrl);
	chrono();
	xhr.open("GET", MBS + ws2releaseUrl, true);
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
		var disambiguation = releases[r].disambiguation ? createTag("span", {a: {class: "comment"}}, "(" + releases[r].disambiguation + ")") : "";
		if (!userjs.lowMemory) {
			modal(true, concat([createTag("code", {s: {whiteSpace: "pre", textShadow: "0 0 8px " + userjs.highlightColour}}, (offset + r + 1).toLocaleString(lang).padStart(6, " ")), ". ", country, createA(releases[r].title, "/release/" + releases[r].id), " ", disambiguation]), 1, {text: "releases", current: offset + r + 1, total: releaseCount});
		} else {
			modal(true, "", 0, {text: "releases", current: offset + r + 1, total: releaseCount});
		}
		var missingRecordingLevelRels = 0;
		if (userjs.stuff["release"].rawids.indexOf(releases[r].id) < 0) { userjs.stuff["release-new"].ids.push(releases[r].id); }
		addRemoveEntities("release", releases[r], action);
		if (userjs.stuff["artist"]) { addRemoveEntities("artist", releases[r]["artist-credit"], action); }
		if (userjs.stuff["label"]) { addRemoveEntities("label", releases[r]["label-info"], action); }
		addRemoveEntities("release-group", releases[r]["release-group"], action);
		for (var rgRel = 0; rgRel < releases[r]["release-group"].relations.length; rgRel++) {
			// add included release groups and their artists
			if (
				(
					releases[r]["release-group"].relations[rgRel].type == "included in"
					|| releases[r]["release-group"].relations[rgRel]["type-id"] == "589447ea-be2c-46cc-b9e9-469e1d06e18a"
				)
				&& releases[r]["release-group"].relations[rgRel].direction == "backward"
				|| (
					releases[r]["release-group"].relations[rgRel].type == "excerpt from"
					|| releases[r]["release-group"].relations[rgRel]["type-id"] == "6d3242b9-0eb5-45c7-bf07-303aaff46d0f"
				)
				&& releases[r]["release-group"].relations[rgRel].direction == "backward"

			) {
				if (!userjs.lowMemory) {
					var excerpt = releases[r]["release-group"].relations[rgRel].type.match(/excerpt/);
					excerpt = excerpt ? excerpt[0] + " " : "";
					modal(true, concat([createTag("code", {s: {whiteSpace: "pre", color: "grey"}}, "\t└"), " Includes " + excerpt, createA(releases[r]["release-group"].relations[rgRel].release_group.title, "/release-group/" + releases[r]["release-group"].relations[rgRel].release_group.id)]), 1);
				}
				addRemoveEntities("release-group", releases[r]["release-group"].relations[rgRel].release_group, action);
				if (userjs.stuff["artist"]) { addRemoveEntities("artist", releases[r]["release-group"].relations[rgRel].release_group["artist-credit"], action); }
			}
		}
		addRemoveEntities("release-group", releases[r]["release-group"], action);
		if (userjs.stuff["artist"]) { addRemoveEntities("artist", releases[r]["release-group"]["artist-credit"], action); }
		for (var m = 0; m < releases[r].media.length; m++) {
			if (releases[r].media[m].pregap) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m].pregap, action);
			}
			if (releases[r].media[m].tracks) for (var t = 0; t < releases[r].media[m].tracks.length; t++) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m].tracks[t], action);
			}
			if (releases[r].media[m]["data-tracks"]) for (var dt = 0; dt < releases[r].media[m]["data-tracks"].length; dt++) {
				missingRecordingLevelRels += browseTrack(releases[r].media[m]["data-tracks"][dt], action);
			}
		}
		if (!userjs.lowMemory && missingRecordingLevelRels > 0) {
			modal(true, concat([createTag("code", {s: {whiteSpace: "pre", color: "grey"}}, "\t└"), " \u26A0\uFE0F " + missingRecordingLevelRels.toLocaleString(lang) + " recordings queued for ", createTag("b", {s: {color: userjs.highlightColour}}, "delayed work fetching")]), 1);
		}
	}
}
function browseTrack(track, action) {
	var missingRecordingLevelRels = 0;
	if (userjs.stuff["artist"]) { addRemoveEntities("artist", track["artist-credit"], action); }
	if (userjs.stuff["recording"]) { addRemoveEntities("recording", track.recording, action); }
	if (userjs.stuff["artist"]) { addRemoveEntities("artist", track.recording["artist-credit"], action); }
	if (userjs.stuff["recording"] || userjs.stuff["work"]) {
		if (track.recording.relations) {
			for (var r = 0; r < track.recording.relations.length; r++) {
				// add works
				if (
					userjs.stuff["work"]
					&& (
						track.recording.relations[r].type === "performance"
						|| track.recording.relations[r]["type-id"] === "a3005666-a872-32c3-ad06-98af558e99b0"
					)
					// strange MBS-12714 bug
					&& track.recording.relations[r]["target-type"] == "work" && track.recording.relations[r].work
				) {
					addRemoveEntities("work", track.recording.relations[r].work, action);
				}
				// add compiled recordings and their artists
				if (
					userjs.stuff["recording"]
					&& (
						track.recording.relations[r].type === "compilation"
						|| track.recording.relations[r]["type-id"] === "1b6311e8-5f81-43b7-8c55-4bbae71ec00c"
					)
					&& track.recording.relations[r].direction == "forward"
					// in case of another MBS-12714
					&& track.recording.relations[r]["target-type"] == "recording" && track.recording.relations[r].recording
				) {
					if (!userjs.lowMemory) {
						modal(true, concat([createTag("code", {s: {whiteSpace: "pre", color: "grey"}}, "\t└"), " Compiles ", createA(track.recording.relations[r].recording.title, "/recording/" + track.recording.relations[r].recording.id)]), 1);
					}
					addRemoveEntities("recording", track.recording.relations[r].recording, action);
					if (userjs.stuff["artist"]) {
						addRemoveEntities("artist", track.recording.relations[r].recording["artist-credit"], action);
					}
				}
			}
		} else {
			// no recording.relations: when there are more than 500 tracks, the recording-level-rels are not returned
			if (userjs.stuff["missingRecordingWorks"].indexOf(track.recording.id) < 0) {
				// add each recording to a list for later later work fetch
				userjs.stuff["missingRecordingWorks"].push(track.recording.id);
				missingRecordingLevelRels += 1;
			}
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
				// fall through
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
				// fall through
			case "release":
				// fall through
			case "release-group":
				// fall through
			case "work":
				entity.id = entities[e].id;
				entity.name = entities[e].title;
				break;
		}
		debug(type);
		debug(userjs.stuff[type]);
		if (
			entity !== null // labels can be null
			&& userjs.stuff[type] // this type is highlighted (initial load)
			&& typeof userjs.stuff[type].rawids == "string" // this type is highlighted (dynamic load)
			&& userjs.stuff[type].rawids.indexOf(entity.id) < 0 // this entity is not yet tracked
			&& !(type == "artist" && userjs.skipArtists.indexOf(entity.id) >= 0) // ignore Various Artists and such
			&& !(type == "label" && userjs.skipLabels.indexOf(entity.id) >= 0) // ignore [no label] and such
		) {
			switch (action) {
				case "add":
					userjs.stuff[type].rawids += entity.id + " ";
					break;
				case "remove":
					// TODO: remove entity
					break;
			}
		}
	}
}
// ############################################################################
// #                                   LOAD WORKS FROM HUNDREDS OF RECORDINGS #
// ############################################################################
var mbs12154 = 0; // #### REMOVE WHEN MBS-12154 FIXED // reduce batch size (results in random order, we try to get less than 101 results to keep them all on one page)
function loadMissingRecordingWorks(recordings, action, conclusionCallback, _batchOffset, _wsResponseOffset) {
	var batchOffset = _batchOffset || 0;
	var wsResponseOffset = _wsResponseOffset || 0;
	// keep the query URL short enough (100 recordings) to avoid 414 Request-URI Too Large
	var batchSize = 100;
	batchSize -= mbs12154; // #### REMOVE WHEN MBS-12154 FIXED
	var batch = recordings.slice(batchOffset, batchOffset + batchSize);
	var workQueryURL = "/ws/2/work?query=rid%3A" + batch.join("+OR+rid%3A") + "&limit=" + userjs.MBWSSpeedLimit + "&offset=" + wsResponseOffset;
	if (wsResponseOffset === 0) {
		modal(true, "Fetching works for " + batch.length + " recordings… ", 0);
	}
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("readystatechange", function(event) {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status == 200) {
				var works = this.response.works;
				modal(true, works.length.toString(), 0, {text: "recordings", current: batchOffset + batch.length, total: recordings.length});
				if (userjs.stuff["work"]) {
					for (var r = 0; r < works.length; r++) {
						addRemoveEntities("work", works[r], action);
					}
				}
				var newWsResponseOffset = this.response.offset + works.length;
				if (newWsResponseOffset < this.response.count) {
					modal(true, concat([createTag("span", {s: {color: "grey"}}, "+"), " works"]), 0);
					mbs12154 += this.response.count - userjs.MBWSSpeedLimit; // #### REMOVE WHEN MBS-12154 FIXED
					if (mbs12154 < userjs.MBWSSpeedLimit) { // #### REMOVE WHEN MBS-12154 FIXED
						modal(true, concat(["<br>", "<br>", createTag("b", {s: {color: userjs.highlightColour}}, ["Slow down required (", createTag("a", {a: {href: "https://tickets.metabrainz.org/browse/MBS-12154", target: "_blank"}}, "MBS-12154"), ")"]), "<br>", "Reducing recording query size: ", createTag("del", {}, batchSize), "→", createTag("b", {}, batchSize - this.response.count + userjs.MBWSSpeedLimit), " recordings"]), 2); // #### REMOVE WHEN MBS-12154 FIXED
						userjs.retry = 0;
						// #### UNCOMMENT WHEN MBS-12154 FIXED // setTimeout(function() { loadMissingRecordingWorks(recordings, action, conclusionCallback, batchOffset, newWsResponseOffset); }, chrono(userjs.MBWSRate));
						setTimeout(function() { loadMissingRecordingWorks(recordings, action, conclusionCallback, batchOffset); }, chrono(userjs.MBWSRate)); // #### REMOVE WHEN MBS-12154 FIXED
					} else { // #### REMOVE WHEN MBS-12154 FIXED
						error("MBS-12154 bug\n\nCannot load works."); // #### REMOVE WHEN MBS-12154 FIXED
					} // #### REMOVE WHEN MBS-12154 FIXED
				} else {
					modal(true, " works", 1);
					var newBatchOffset = batchOffset + batch.length;
					if (newBatchOffset < recordings.length) {
						userjs.retry = 0;
						setTimeout(function() { loadMissingRecordingWorks(recordings, action, conclusionCallback, newBatchOffset); }, chrono(userjs.MBWSRate));
					} else {
						// end of recursive function
						modal(true, "", 1);
						conclusionCallback();
					}
				}
			} else {
				if (userjs.retry++ < userjs.maxRetry) {
					userjs.MBWSRate += userjs.slowDownStepAfterRetry;
					modal(true, "Error " + this.status + " “" + this.statusText + "” (" + userjs.retry + "/" + userjs.maxRetry + ")", 2);
					debugRetry(this.status);
					setTimeout(function() { loadMissingRecordingWorks(recordings, action, conclusionCallback, batchOffset, wsResponseOffset); }, chrono(userjs.retryPause));
				} else {
					error("Too many (" + userjs.maxRetry + ") errors (last " + this.status + " “" + this.statusText + "” while loading missing recording works).");
				}
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
			if (action == "add" || userjs.in_this_many_collections < 2) {
				modal(true, "Refreshing memory…", 1);
				userjs.collectionsID = GM_getValue("collections") || "";
				for (let type in userjs.stuff) if (Object.prototype.hasOwnProperty.call(userjs.stuff, type) && userjs.collected_stuff.indexOf(type) >= 0) {
					userjs.stuff[type].rawids = GM_getValue(type + "s");
					userjs.stuff[type].ids = userjs.stuff[type].rawids != null ? (userjs.stuff[type].rawids.length > 0 ? userjs.stuff[type].rawids.trim().split(" ") : []) : null;
				}
				setTitle(true);
				lastLink(this.getAttribute("href"));
				switch (action) {
					case "add":
						userjs.stuff["release-new"] = {ids: []};
						userjs.stuff["missingRecordingWorks"] = [];
						userjs.collectionLoadingStartDate = Date.now();
						userjs.currentTaskStartDate = Date.now();
						loadReleases("/" + userjs.releaseID, action, concludeDynamicReleaseLoading);
						return stop(event);
						// break;
					case "remove":
						// Force release for "Add to / Remove from collection" but not for "Force highlight ON /OFF"
						altered = this.getAttribute("href") != self.location.href;
						var checks = getStuffs();
						if (userjs.stuff["release"].rawids.indexOf(userjs.releaseID) > -1) {
							modal(true, concat([createTag("b", {}, "Removing this release"), " from loaded collection…"]), 1);
							userjs.stuff["release"].rawids = userjs.stuff["release"].rawids.replace(new RegExp(userjs.releaseID + "( |$)"), "");
							GM_setValue("releases", userjs.stuff["release"].rawids);
							altered = true;
						}
						if (checks.length > 0) {
							lastLink(this.getAttribute("href"));
							stuffRemover(checks);
							return stop(event);
						}
						break;
				}
				if (!altered) {
					modal(true, "Nothing has changed.", 1);
					setTimeout(function() { modal(false); }, 1000);
					return stop(event);
				} else {
					modal(true, "Re‐loading page…", 1);
				}
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
		if (userjs.stuff["recording"].ids) { allrelsel += ", " + selector["recording"]; }
		if (userjs.stuff["label"].ids) { allrelsel += ", " + selector["label"]; }
		var all = basicOnly(cont.querySelectorAll(allrelsel));
		var allrecsel = "", sep = "";
		if (userjs.stuff["artist"].ids) { allrecsel += sep + selector["artist"]; sep = ", "; }
		if (userjs.stuff["work"].ids) { allrecsel += sep + selector["work"]; }
		if (allrecsel != "") {
			all = basicOnly(cont.querySelectorAll(allrecsel), all);
		}
		return all;
	}
	function pathname(href) {
		return href.match(new RegExp("/[^/]+/" + userjs.strMBID)) + "";
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
				if (href && href.match(new RegExp(userjs.strMBID + "$")) && hrefs.indexOf(href) == -1) {
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
		var checkMatch = check.getAttribute("href").match(new RegExp("/(" + userjs.strType + ")/(" + userjs.strMBID + ")$", "i"));
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
			if (typeof userjs.stuff[checkAgainst].rawids == "string" && userjs.stuff[checkType].rawids.indexOf(checkID) > -1) {
				var url = "/" + checkType + "/" + checkID;
				if (checkType == "artist") { url += "/recordings"; }
				url += "?page=" + p;
				modal(true, concat(["Checking " + checkType + " ", createA(checkType != "release-group" ? check.getAttribute("jesus2099userjs81127recname") || check.textContent : checkID, check.getAttribute("href"), checkType), " against all its ", createA(checkAgainst + "s" + (p > 1 ? " (page " + p + ")" : ""), url), "…"]), 1); // jesus2099userjs81127recname linked to mb_INLINE-STUFF
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(event) {
					if (this.readyState === XMLHttpRequest.DONE) {
						if (this.status == 200) {
							var res = document.createElement("html"); res.innerHTML = this.responseText;
							var mates = getStuffs(checkAgainst, res);
							for (let m = 0; m < mates.length; m++) {
								if (userjs.stuff[checkAgainst].rawids.indexOf(mates[m].getAttribute("href").match(new RegExp(userjs.strMBID))) > -1) {
									modal(true, createTag("span", {s: {color: "grey"}}, ["still used by ", createA(mates[m].textContent, mates[m].getAttribute("href"), checkAgainst), ": keeping."]), 1);
									userjs.retry = 0;
									setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(userjs.MBWSRate));
									return;
								}
							}
							if (res.querySelector("ul.pagination > li:last-of-type > a")) {
								if (p == 1) { modal(true, createTag("span", {s: {color: "grey"}}, "(several pages but this check will stop as soon as it finds something)"), 1); }
								userjs.retry = 0;
								setTimeout(function() { stuffRemover(checks, p + 1); }, chrono(userjs.MBWSRate));
							} else {
								modal(true, concat([createTag("span", {s: {color: "grey"}}, "not used any more: "), createTag("b", {}, "removing"), "…"]), 1);
								userjs.stuff[checkType].rawids = userjs.stuff[checkType].rawids.replace(new RegExp(checkID + "( |$)"), "");
								GM_setValue(checkType + "s", userjs.stuff[checkType].rawids);
								altered = true;
								userjs.retry = 0;
								setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(userjs.MBWSRate));
							}
						} else {
							if (userjs.retry++ < userjs.maxRetry) {
								userjs.MBWSRate += userjs.slowDownStepAfterRetry;
								debugRetry(this.status);
								setTimeout(function() { stuffRemover(checks, p); }, chrono(userjs.retryPause));
							} else {
								error("Too many (" + userjs.maxRetry + ") errors (last " + this.status + " while checking stuff to remove).");
							}
						}
					} // 4
				};
				debug(MBS + url);
				chrono();
				xhr.open("GET", MBS + url, true);
				xhr.send(null);
			} else {
				if (!userjs.stuff[checkAgainst].rawids) {/* Protection for some edge cases of new script using old script data */
					modal(true, concat([createTag("span", {s: {color: "grey"}}, ["no ", checkAgainst, "s at all (", createA("#87", "//github.com/jesus2099/konami-command/issues/87"), "): "]), "removing…"]), 1);
					userjs.stuff[checkType].rawids = userjs.stuff[checkType].rawids.replace(new RegExp(checkID + "( |$)"), "");
					GM_setValue(checkType + "s", userjs.stuff[checkType].rawids);
					altered = true;
				}
				userjs.retry = 0;
				setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(userjs.MBWSRate));
			}
		}
	} else {
		// end of recursive function
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
function concludeCollectionLoading() {
	saveRawIdsToGMStorage();
	unlockModal();
}
function concludeDynamicReleaseLoading() {
	modal(true, "Re‐loading page…", 1);
	saveRawIdsToGMStorage();
	lastLink();
}
function saveRawIdsToGMStorage() {
	setTitle(false);
	modal(true, concat(["<hr>", createTag("h2", {}, "Highlighted stuff")]), 1);
	// display summary of added entities and write all MBID in the storage now
	for (let type in userjs.stuff) if (Object.prototype.hasOwnProperty.call(userjs.stuff, type) && userjs.stuff[type].rawids) {
		userjs.stuff[type].ids = userjs.stuff[type].rawids.length > 0 ? userjs.stuff[type].rawids.trim().split(" ") : [];
		modal(true, createTag("span", {}, [createTag("code", {s: {whiteSpace: "pre", textShadow: "0 0 8px " + userjs.highlightColour}}, userjs.stuff[type].ids.length.toLocaleString(lang).padStart(12, " ")), createTag("b", {}, " " + type.replace(/-/, " ") + (userjs.stuff[type].ids.length == 1 ? "" : "s")), "… "]));
		GM_setValue(type + "s", userjs.stuff[type].rawids);
		modal(true, "saved.", 1);
		// free up memory
		userjs.stuff[type].rawids = "";
		userjs.stuff[type].ids = [];
	}
	GM_setValue("collections", userjs.collectionsID);
	modal(true, concat(["<br>", createTag("b", {s: {color: userjs.highlightColour}}, "Everything loaded!")]), 1);
	modal(true, concat(["<hr>", "Collection loaded in highlighter in ", sInt2msStr(Math.floor((Date.now() - userjs.collectionLoadingStartDate) / 1000)), ".", "<br>", "You may now enjoy this stuff highlighted in various appropriate places. YAY(^o^;)Y", "<br>"]), 1);
}
function error(msg) {
	setTitle(false);
	modal(true, createTag("pre", {s: {fontWeight: "bolder", backgroundColor: "yellow", color: "red", border: "2px dashed black", boxShadow: "2px 2px 2px grey", width: "fit-content", margin: "1em auto", padding: "1em"}}, createTag("code", {}, msg)), 1).style.setProperty("background-color", "pink");
	alert(userjs.dialogprefix + msg);
	modal(true, concat(["You may ", createA("have a look at known issues and/or create a new bug report", GM_info.script.namespace + "/issues/new?labels=" + GM_info.script.name.replace(". ", "_").replace(" ", "-")), " or just ", createA("reload this page", function(event) { self.location.reload(); }), "."]), 1);
	unlockModal();
}
function unlockModal() {
	modal(true, concat(["☞ You can now review these cute logs, or close it (press “Escape” or click outside). ஜ۩۞۩ஜ"]), 1);
	document.getElementById(userjs.prefix + "Modal").previousSibling.addEventListener("click", closeModal);
	document.body.addEventListener("keydown", closeModal);
}
function closeModal(event) {
	if (event.type == "click" || event.type == "keydown" && event.key == "Escape") {
		var modalWall = document.getElementById(userjs.prefix + "Modal").previousSibling;
		if (gaugeto) { clearTimeout(gaugeto); gaugeto = null; }
		modalWall.parentNode.removeChild(modalWall.nextSibling);
		modalWall.parentNode.removeChild(modalWall);
		if (event.type == "keydown") {
			document.body.removeEventListener("keydown", closeModal);
		}
	}
}
var gaugeto;
function modal(show, data, newlines, gauge) {
	var obj = document.getElementById(userjs.prefix + "Modal");
	if (show && !obj) {
		coolstuff("div", "50", "100%", "100%", "black", ".6");
		obj = coolstuff("div", "55", "600px", "92%", "white");
		obj.setAttribute("id", userjs.prefix + "Modal");
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
	if (show && obj) {
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
				var elapsedSeconds = Math.floor((Date.now() - userjs.currentTaskStartDate) / 1000);
				var totalSeconds = Math.ceil(elapsedSeconds > 0 ? elapsedSeconds * gauge.total / gauge.current : (gauge.total - gauge.current) * userjs.MBWSRate / 1000);
				gau.lastChild.replaceChild(document.createTextNode((gauge.text ? gauge.text + " " : "") + gauge.current.toLocaleString(lang) + " / " + gauge.total.toLocaleString(lang) + " (" + percentage + "%); loading time: elapsed " + sInt2msStr(elapsedSeconds) + " / estimated total " + sInt2msStr(totalSeconds) + ", remaining " + sInt2msStr(totalSeconds - elapsedSeconds)), gau.lastChild.firstChild);
				setTitle(true, percentage);
				if (gauge.current >= gauge.total) {
					gaugeto = setTimeout(function() {
						if ((obj = document.getElementById(userjs.prefix + "Modal")) !== null) {
							obj.firstChild.style.setProperty("display", "none");
						}
					}, 10000);
				}
			}
		}
		if (data) {
			// neither null nor empty string
			obj.appendChild(typeof data == "string" ? document.createTextNode(data) : data);
		}
		if (newlines) {
			// neither null nor number 0
			for (var b = 0; b < newlines; b++) {
				obj.appendChild(document.createElement("br"));
			}
		}
		if ((data || newlines) && obj.style.getPropertyValue("border-color") == "black") {
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
			setTimeout(function() { self.location.href = ll; }, chrono(userjs.MBWSRate));
		} else {
			modal(true, "", 1);
			error("Sorry, I’m lost. I don’t know what was the link you last clicked.");
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
function concat(_nodes) {
	var concats = document.createDocumentFragment();
	var nodes = (typeof _nodes != "object" || !_nodes.length) ? [_nodes] : _nodes;
	for (let n = 0; n < nodes.length; n++) {
		var ccat = nodes[n];
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
function debug(txt) {
	if (DEBUG) {
		console.debug(userjs.prefix + "\n" + txt);
	}
}
function debugRetry(status) {
	debug("Error " + status + "\nRetrying (" + userjs.retry + "/" + userjs.maxRetry + ") in " + userjs.retryPause + " ms\nSlowing down, new rate: " + (userjs.MBWSRate - userjs.slowDownStepAfterRetry) + "+" + userjs.slowDownStepAfterRetry + " = " + userjs.MBWSRate + " ms");
}
function nsr(prefix) {
	var ns = {
		xhtml: "http://www.w3.org/1999/xhtml",
		mb: "http://musicbrainz.org/ns/mmd-2.0#",
	};
	return ns[prefix] || null;
}
