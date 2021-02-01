// ==UserScript==
// @name         mb. MERGE HELPOR 2
// @version      2021.2.2.38
// @description  musicbrainz.org: Merge helper highlights last clicked, shows info, indicates oldest MBID, manages (remove) entity merge list; merge queue (clear before add) tool; don’t reload page for nothing when nothing is checked
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_MERGE-HELPOR-2
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb.%20MERGE%20HELPOR%202.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-01-31; https://web.archive.org/web/20131103163402/userscripts.org/scripts/show/124579
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        none
// @match        *://*.musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var userjs = "j2userjs124579";
var rembid = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
var mergeType = self.location.pathname.match(/^\/(.+)\/merge/);
var lastTick = new Date().getTime();
var WSrate = 1000;
if (mergeType) {
	/* main merge tool */
	var mergeForm = document.querySelector("div#content > form[action*='/merge']");
	var tbl = mergeForm.querySelector("table.tbl");
	var entities = {};
	var deferScript = setInterval(function() {
		// Make sure no more React funny stuff will redraw content (on /recording/merge for the moment)
		if (!document.querySelector("p.loading-message")) {
			clearInterval(deferScript);
			findUsefulMergeInfo();
		}
	}, 500);
} else {
	/* merge queue (clear before add) tool */
	var mergeButton = document.querySelector("div#content > form[action*='/merge_queue'] > table.tbl ~ div.row > span.buttons > button[type='submit'], div#page > form[action*='/merge_queue'] > table.tbl ~ div.row > span.buttons > button[type='submit'], div#content > form[action*='/merge_queue'] > div.recording-list ~ div.row > span.buttons > button[type='submit']");
	if (mergeButton) {
		var checkForm = mergeButton.parentNode.parentNode.parentNode;
		setButtonTextFromSelectedToAll(mergeButton, true);
		checkForm.addEventListener("submit", function(event) {
			if (noChildrenChecked(this)) {
				checkAllChildren(this);
			}
		});
		var loadingAnimation = "url(data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP/MAP///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQAAACwAAAAAEAAQAAACIQyOF8uW2NpTcU1Q7czu8fttGTiK1YWdZISWprTCL9NGBQAh+QQJBQAAACwAAAAAEAAQAAACIIQdqXm9285TEc1QwcV1Zz19lxhmo1l2aXSqD7lKrXMWACH5BAkFAAAALAAAAAAQABAAAAIhRI4Hy5bY2lNxzVDtzO7x+20ZOIrVhZ1khJamtMIv00YFACH5BAkFAAAALAAAAAAQABAAAAIgjA2peb3bzlMRTVDDxXVnPX2XGGajWXZpdKoPuUqtcxYAOw==)";
		mergeButton.parentNode.parentNode.parentNode.addEventListener("change", function(event) {
			if (event.target.tagName == "INPUT" && event.target.getAttribute("type") == "checkbox") {
				var nothingChecked = noChildrenChecked(this);
				setButtonTextFromSelectedToAll(mergeButton, nothingChecked);
				setButtonTextFromSelectedToAll(reMergeButton, nothingChecked);
			}
		});
		/* clear merge queue and add new stuff to merge queue within only one click */
		var reMergeButton = mergeButton.cloneNode(true);
		reMergeButton.replaceChild(document.createTextNode("Clear queue then " + mergeButton.textContent.toLowerCase()), reMergeButton.firstChild);
		reMergeButton.setAttribute("title", "You don’t need this if you are adding a different type of entities.");
		reMergeButton.style.setProperty("cursor", "help");
		reMergeButton.style.setProperty("background-color", "#ff3");
		reMergeButton.addEventListener("click", function(event) {
			/* store control and/or shift key statuses to pass them to the other later merge button click */
			var modifierKeys = (event.altKey ? "alt+" : "") + (event.ctrlKey ? "ctrl+" : "") + (event.metaKey ? "meta+" : "") + (event.shiftKey ? "shift+" : "");
			reMergeButton.style.setProperty("background-image", loadingAnimation);
			var xhr = new XMLHttpRequest();
			xhr.addEventListener("load", function(event) {
				reMergeButton.style.removeProperty("background-image");
				if (this.status == 200) {
					if (modifierKeys == "") {
						mergeButton.style.setProperty("background-image", loadingAnimation);
					}
					sendEvent(mergeButton, modifierKeys + "click");
				} else {
					reMergeButton.style.setProperty("background-color", "#fcc");
				}
			});
			xhr.open("GET", mergeButton.parentNode.parentNode.parentNode.getAttribute("action").replace(/_queue$/, "?submit=cancel"), true);
			xhr.send(null);
			return stop(event);
		});
		addAfter(reMergeButton, mergeButton);
	}
	/* Make “Remove selected entites” and “Cancel” buttons faster */
	var currentMergeForm = document.querySelector("div#current-editing > form[action*='/merge']");
	if (currentMergeForm) {
		currentMergeForm.querySelector("button[type='submit'][value='remove']").addEventListener("click", function(event) {
			var href = currentMergeForm.getAttribute("action") + "?submit=remove";
			for (let checked = currentMergeForm.querySelectorAll("li > input[type='checkbox'][id^='remove.'][value]:checked"), c = 0; c < checked.length; c++) {
				href += "&remove=" + checked[c].value;
				removeNode(checked[c].parentNode);
			}
			var xhr = new XMLHttpRequest();
			xhr.open("GET", href, true);
			xhr.send(null);
			return stop(event);
		});
		currentMergeForm.querySelector("button[type='submit'][value='cancel']").addEventListener("click", function(event) {
			removeNode(currentMergeForm.parentNode);
			var xhr = new XMLHttpRequest();
			xhr.open("GET", currentMergeForm.getAttribute("action") + "?submit=cancel", true);
			xhr.send(null);
			return stop(event);
		});
	}
}
function findUsefulMergeInfo() {
	mergeType = mergeType[1].replace(/_/, "-");
	var showEntityInfo = true;
	var minrowid;
	if (mergeForm) {
		/* entity merge pages progressively abandon ul layout in favour of table.tbl
		* area          ul (but only for admins)
		* artist        ul
		* event         table.tbl
		* label         table.tbl
		* place         table.tbl
		* recording     table.tbl
		* release       table.tbl
		* release group table.tbl
		* series        table.tbl
		* work          table.tbl
		* what else     ? */
		mergeForm.addEventListener("submit", function(event) {
			var editNote = this.querySelector("textarea[name='merge.edit_note']");
			if (event.submitter && event.submitter.classList.contains("positive")) {
				// Script only triggered by Submit (button.positive), not Cancel (button.negative)
				if (editNote && editNote.value && editNote.value.match(/\w{4,}/g) && editNote.value.match(/\w{4,}/g).length > 3) {
					editNote.style.removeProperty("background-color");
					editNote.value = editNote.value.replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "").replace(/\n?(\s*—[\s\S]+)?Merging\sinto\soldest\s\[MBID\]\s\(['\d,\s←+]+\)\.(\n|$)/g, "").replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, ""); // linked in mb_ELEPHANT-EDITOR.user.js
					var mergeTargets = mergeForm.querySelectorAll("form table.tbl > tbody input[type='radio'][name='merge.target'], form > ul > li input[type='radio'][name='merge.target']");
					var mergeTarget;
					var sortedTargets = [];
					for (let t = 0; t < mergeTargets.length; t++) {
						var id = parseInt(mergeTargets[t].value, 10);
						if (mergeTargets[t].checked) {
							mergeTarget = id;
						}
						if (sortedTargets.length == 0 || id > sortedTargets[sortedTargets.length - 1]) {
							sortedTargets.push(id);
						} else if (id < sortedTargets[0]) {
							sortedTargets.unshift(id);
						} else {
							for (let s = 0; s < sortedTargets.length; s++) {
								if (id < sortedTargets[s]) {
									sortedTargets.splice(s, 0, id);
									break;
								}
							}
						}
					}
					if (mergeTarget && mergeTarget == sortedTargets[0]) {
						mergeTargets = "'''" + thousandSeparator(mergeTarget) + "'''";
						for (let i = 1; i < sortedTargets.length; i++) {
							mergeTargets += (i == 1 ? " ← " : " + ") + thousandSeparator(sortedTargets[i]);
						}
						editNote.value = (editNote.value ? editNote.value + "\n — \n" : "") + "Merging into oldest [MBID] (" + mergeTargets + ").";
					}
				} else {
					alert("Merging entities is a destructive edit that is impossible to undo without losing ISRCs, AcoustIDs, edit histories, etc.\n\nPlease make sure your edit note makes it clear why you are sure that these entities are exactly the same versions, mixes, cuts, etc.");
					editNote.style.setProperty("background-color", "pink");
					return stop(event);
				}
			}
		});
		var entityRows = mergeForm.getElementsByTagName("li");
		if (tbl) {
			entityRows = mergeForm.querySelectorAll("form table.tbl > tbody > tr");
			var headers = tbl.querySelector("thead tr");
			if (showEntityInfo && mergeType.match(/(release|release-group)/)) {
				headers.appendChild(document.createElement("th")).appendChild(document.createTextNode("Information"));
			} else {
				showEntityInfo = false;
			}
			var rowids = document.createElement("th");
			rowids.setAttribute("id", userjs + "rowidsHeader");
			rowids.style.setProperty("text-align", "right");
			rowids.appendChild(document.createTextNode("MBID age (row ID) "));
			headers.appendChild(rowids);
		}
		for (let row = 0; row < entityRows.length; row++) {
			let a = entityRows[row].querySelector("a[href^='/" + mergeType + "/']");
			var rad = entityRows[row].querySelector("input[type='radio'][name='merge.target']");
			if (a && rad) {
				if (showEntityInfo) {
					addZone(tbl, entityRows[row], "entInfo" + rad.value);
				}
				entities[rad.value] = {a: a, rad: rad, row: entityRows[row], rowid: parseInt(rad.value, 10)};
				minrowid = row == 0 ? entities[rad.value].rowid : Math.min(minrowid, entities[rad.value].rowid);
				if (document.referrer) {
					var lmbid = a.getAttribute("href").match(rembid);
					var rmbid = document.referrer.match(rembid);
					if (lmbid && rmbid && lmbid[0] == rmbid[0]) {
						if (tbl) {
							var tds = entityRows[row].querySelectorAll("td");
							for (let td = 0; td < tds.length; td++) {
								tds[td].style.setProperty("background-color", "#FF6");
							}
						} else {
							entityRows[row].style.setProperty("background-color", "#FF6");
						}
						entityRows[row].style.setProperty("border", "thin dashed black");
						entityRows[row].setAttribute("title", "LAST CLICK");
						rad.click();
					}
				}
				entities[rad.value].rowidzone = addZone(tbl, entityRows[row], "rowID" + row);
				entities[rad.value].rowidzone.style.setProperty("text-align", "right");
				entities[rad.value].rowidzone.appendChild(rowIDLink(mergeType.replace(/-/, "_"), rad.value));
			}
		}
		if (minrowid) {
			minrowid += "";
			entities[minrowid].row.style.setProperty("text-shadow", "0px 0px 8px #0C0");
			entities[minrowid].rowidzone.style.setProperty("color", "#060");
			entities[minrowid].rowidzone.insertBefore(document.createTextNode(" (oldest) "), entities[minrowid].rowidzone.firstChild);
			var rowidsHeader = document.getElementById(userjs + "rowidsHeader");
			var sortButton = createA(rowidsHeader ? rowidsHeader.textContent : "SORT!", null, "Sort those " + mergeType + "s (oldest ID first)");
			sortButton.addEventListener("click", function(event) {
				sortBy("rowid");
			});
			if (rowidsHeader) {
				rowidsHeader.replaceChild(sortButton, rowidsHeader.firstChild);
			} else {
				mergeForm.insertBefore(sortButton, mergeForm.firstChild);
			}
			entities[minrowid].rowidzone.querySelector("a[href$='conditions.0.args.0=" + entities[minrowid].rowid + "']").style.setProperty("background-color",  "#6F6");
			entities[minrowid].rad.click();
		}
		if (showEntityInfo) {
			loadEntInfo();
		}
		if (mergeType == "release") {
			/* make the release each medium is from a clickable link */
			for (let releases = {}, mediums = document.querySelectorAll("input[id$='.release_id'][type='hidden']"), m = 0; m < mediums.length; m++) {
				if (!releases[mediums[m].value]) {
					releases[mediums[m].value] = {fragment: document.createDocumentFragment()};
					var releaseCell = getSibling(document.querySelector("form table.tbl > tbody input[type='radio'][name='merge.target'][value='" + mediums[m].value + "']").parentNode, "td");
					releases[mediums[m].value].format = releaseCell.parentNode.getElementsByTagName("td")[3].textContent.replace(/\s/g, "").replace(/"/g, "″");
					for (let c = 0; c < releaseCell.childNodes.length; c++) {
						releases[mediums[m].value].fragment.appendChild(releaseCell.childNodes[c].cloneNode(true));
					}
					var funkeyCAA = releases[mediums[m].value].fragment.querySelector("div.jesus2099userjs154481");
					if (funkeyCAA) {
						removeNode(funkeyCAA);
					}
					let a = releases[mediums[m].value].fragment.querySelector("a[href^='/release/']");
					a.setAttribute("target", "_blank");
					a.style.setProperty("color", self.getComputedStyle(releaseCell.getElementsByTagName("a")[0]).getPropertyValue("color"));
					releases[mediums[m].value].title = a.textContent;
				}
				var text = mediums[m].parentNode.lastChild.textContent.trim();
				mediums[m].parentNode.replaceChild(createTag("fragment", {}, [
					" " + text.substring(1, text.lastIndexOf(releases[mediums[m].value].title)),
					releases[mediums[m].value].fragment.cloneNode(true),
					createTag("span", {a: {class: "comment"}}, " (" + releases[mediums[m].value].format + ")"),
					text.substring(text.lastIndexOf(releases[mediums[m].value].title) + releases[mediums[m].value].title.length, text.length - 1)
				]), mediums[m].parentNode.lastChild);
			}
		}
	}
}
function setButtonTextFromSelectedToAll(button, all) {
	button.replaceChild(document.createTextNode(button.textContent.replace(new RegExp(all ? "selected" : "all", "i"), all ? "all" : "selected")), button.firstChild);
}
function noChildrenChecked(parent) {
	return !parent.querySelector("table.tbl input[name='add-to-merge']:checked");
}
function checkAllChildren(parent) {
	var checkAll = parent.querySelectorAll("table.tbl input[name='add-to-merge']:not(:checked)");
	for (let cb = 0; cb < checkAll.length; cb += 1) {
		checkAll[cb].checked = true;
	}
}
function loadEntInfo() {
	var entInfoZone = mergeForm.querySelector("[id^='" + userjs + "entInfo']:not([class])") || mergeForm.querySelector("[id^='" + userjs + "entInfo']:not([class~='ok'])");
	if (entInfoZone) {
		var rowid = entInfoZone.getAttribute("id").match(/\d+$/)[0];
		entInfoZone.appendChild(loadimg("info"));
		var mbid = entities[rowid].a.getAttribute("href").match(rembid)[0];
		var url = self.location.protocol + "//" + self.location.host + "/ws/2/" + mergeType + "/" + mbid + "?inc=";
		switch (mergeType) {
			case "artist":
				url += "release-groups+works+recordings";
				break;
			case "release":
				url += "release-groups";
				break;
			case "release-group":
				url += "releases";
				break;
		}
		var xhr = new XMLHttpRequest();
		xhr.id = rowid;
		xhr.addEventListener("load", function() {
			var entInfoZone = document.getElementById(userjs + "entInfo" + this.id);
			if (entInfoZone) {
				removeChildren(entInfoZone);
				if (this.status == 200) {
					entInfoZone.className = "ok";
					var res = this.responseXML, tmp, tmp2;
					switch (mergeType) {
						case "artist":
							tmp = res.evaluate(".//mb:country/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:work-list", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " works");
							}
							tmp = res.evaluate(".//mb:release-group-list", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " records");
							}
							tmp = res.evaluate(".//mb:recording-list", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " recs");
							}
							break;
						case "release":
							tmp = res.evaluate(".//mb:status/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:language/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:script/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:release-group", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								var span = document.createElement("span");
								fill(span, "in ", createA(tmp2.getElementsByTagName("title")[0].textContent.replace(/\s/g, " "), "/release-group/" + tmp2.getAttribute("id")), "");
								stackInfo(entInfoZone, span);
							}
							break;
						case "release-group":
							tmp = res.evaluate(".//mb:first-release-date/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while ((tmp2 = tmp.iterateNext()) !== null) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							break;
					}
					if (!entInfoZone.hasChildNodes()) {
						stackInfo(entInfoZone, "no info");
						entInfoZone.style.setProperty("opacity", ".5");
					}
					loadEntInfo();
				} else {
					entInfoZone.className = "ng";
					stackInfo(entInfoZone, "Error " + this.status + " fetching " + mergeType + " #" + this.id + " info");
					setTimeout(function() { loadEntInfo(); }, chrono(WSrate * 8));
				}
			}
		});
		xhr.open("GET", url, true);
		setTimeout(function() { xhr.send(null); }, chrono(WSrate));
	}
}
function sortBy(what) {
	for (let rowid in entities) if (Object.prototype.hasOwnProperty.call(entities, rowid)) {
		if (!entities[rowid][what]) {
			entities[rowid].row.parentNode.appendChild(entities[rowid].row.parentNode.removeChild(entities[rowid].row));
		} else {
			var rows = entities[rowid].row.parentNode.querySelectorAll("tr, li");
			for (let row = 0; row < rows.length; row++) {
				var indexA = rows[row].querySelector("[id^='" + userjs + "rowID'] a[href^='/search/edits']"), index;
				if (indexA && (index = parseInt(indexA.textContent.replace(/\D/g, ""), 10)) && index >= entities[rowid][what]) {
					if (entities[rowid].row != rows[row]) {
						entities[rowid].row.parentNode.insertBefore(entities[rowid].row.parentNode.removeChild(entities[rowid].row), rows[row]);
						if (index == entities[rowid][what]) {
							indexA.style.setProperty("background-color", "silver");
							indexA.setAttribute("title", "same " + what.replace(/ID/, " ID") + " as above");
						}
					}
					break;
				}
			}
		}
	}
	oddEvenRowsRedraw();
}
function oddEvenRowsRedraw() {
	var rows = mergeForm.querySelectorAll("form > table > tbody > tr");
	for (let row = 0; row < rows.length; row++) {
		rows[row].className = rows[row].className.replace(/\b(even|odd)\b/, row % 2 ? "even" : "odd");
	}
}
function loadimg(txt) {
	var img = document.createElement("img");
	img.setAttribute("src", "/static/images/icons/loading.gif");
	if (txt) {
		var msg = "⌛ loading " + txt + "…";
		img.setAttribute("alt", msg);
		img.setAttribute("title", msg);
		top.status = msg;
	}
	return img;
}
function addZone(tbl, par, id) {
	par.appendChild(document.createTextNode(" "));
	var zone = par.appendChild(document.createElement(tbl ? "td" : "span"));
	zone.setAttribute("id", userjs + id);
	par.appendChild(document.createTextNode(" "));
	return zone;
}
function stackInfo(zone, info) {
	fill(zone, tbl ? "" : " — ", info, ", ");
}
function fill(par, beg, stu, sep) {
	par.appendChild(document.createTextNode(par.hasChildNodes() ? sep : beg));
	par.appendChild(typeof stu == "string" ? document.createTextNode(stu) : stu);
}
function createA(text, link, title) {
	var a = document.createElement("a");
	if (link) {
		a.setAttribute("href", link);
	} else {
		a.style.setProperty("cursor", "pointer");
	}
	if (title) {
		a.setAttribute("title", title);
	}
	a.appendChild(document.createTextNode(text));
	return a;
}
function nsr(prefix) {
	var ns = {
		"xhtml": "http://www.w3.org/1999/xhtml",
		"mb": "http://musicbrainz.org/ns/mmd-2.0#",
	};
	return ns[prefix] || null;
}
function rowIDLink(type, id) {
	/* thanks to http://snipplr.com/view/72657/thousand-separator */
	var renderedID = thousandSeparator(id);
	var a = createA(
		renderedID,
		"/search/edits?order=asc&conditions.0.operator=%3D&conditions.0.field=" + type + "&conditions.0.name=" + renderedID + "&conditions.0.args.0=" + id
	);
	return a;
}
function thousandSeparator(number) {
	return (number + "").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
}
function chrono(minimumDelay) {
	var del = minimumDelay + lastTick - new Date().getTime();
	del = del > 0 ? del : 0;
	lastTick = new Date().getTime();
	return del;
}
