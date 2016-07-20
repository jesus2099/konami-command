// ==UserScript==
// @name         mb. MERGE HELPOR 2
// @version      2016.6.15
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb.%20MERGE%20HELPOR%202.user.js
// @description  musicbrainz.org: Merge helper highlights last clicked, shows info, indicates oldest MBID, manages (remove) entity merge list; merge queue (clear before add) tool; don’t reload page for nothing when nothing is checked
// @homepage     http://userscripts-mirror.org/scripts/show/124579
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_MERGE-HELPOR-2
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey         tested sometimes
// @compatible   chromium(46)+tampermonkey        tested sometimes
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb.%20MERGE%20HELPOR%202.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb.%20MERGE%20HELPOR%202.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-01-31
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=84017&v=2015.11.2
// @grant        none
// @match        *://*.mbsandbox.org/*
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
	mergeType = mergeType[1].replace(/_/, "-");
	var showEntityInfo = true;
	var entities = {};
	var minrowid;
	var lastCB;
	var mergeForm = document.querySelector("div#content > form[action*='/merge']");
	if (mergeForm) {
		/*	entity merge pages progressively abandon ul layout in favour of table.tbl
			* area			ul (but only for admins)
			* artist		ul
			* event			table.tbl
			* label			table.tbl
			* place			table.tbl
			* recording		table.tbl
			* release		table.tbl
			* release group	table.tbl
			* series		table.tbl
			* work			table.tbl
			* what else ?	*/
		mergeForm.addEventListener("submit", function(event) {
			var editNote = this.querySelector("textarea[name='merge.edit_note']");
			if (editNote) {
				editNote.value = editNote.value.replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "").replace(/\n?(\s*—[\s\S]+)?Merging\sinto\soldest\s\[MBID\]\s\([\'\d,\s←+]+\)\.(\n|$)/g, "").replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "");//linked in mb_ELEPHANT-EDITOR.user.js
				var mergeTargets = mergeForm.querySelectorAll("form > table.tbl > tbody input[type='radio'][name='merge.target'], form > ul > li input[type='radio'][name='merge.target']");
				var mergeTarget;
				var sortedTargets = [];
				for (var t = 0; t < mergeTargets.length; t++) {
					var id = parseInt(mergeTargets[t].value, 10);
					if (mergeTargets[t].checked) {
						mergeTarget = id;
					}
					if (sortedTargets.length == 0 || id > sortedTargets[sortedTargets.length - 1]) {
						sortedTargets.push(id);
					} else if (id < sortedTargets[0]) {
						sortedTargets.unshift(id);
					} else {
						for (var s = 0; s < sortedTargets.length; s++) {
							if (id < sortedTargets[s]) {
								sortedTargets.splice(s, 0, id);
								break;
							}
						}
					}
				}
				if (mergeTarget && mergeTarget == sortedTargets[0]) {
					mergeTargets = "'''" + thousandSeparator(mergeTarget) + "'''";
					for (var i = 1; i < sortedTargets.length; i++) {
						mergeTargets += (i == 1 ? " ← " : " + ") + thousandSeparator(sortedTargets[i]);
					}
					editNote.value = (editNote.value ? editNote.value + "\r\n — \r\n" : "") + "Merging into oldest [MBID] (" + mergeTargets + ").";
				}
			}
		});
		var tbl = mergeForm.querySelector("table.tbl");
		var entityRows = mergeForm.getElementsByTagName("li");
		if (tbl) {
			entityRows = mergeForm.querySelectorAll("form > table.tbl > tbody > tr");
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
			var batchRemove = headers.appendChild(document.createElement("th")).appendChild(createA("Remove selected entities", null, "Remove selected " + mergeType + "s from merge"));
			batchRemove.addEventListener("click", removeFromMerge);
		}
		var rowIDzone = [];
		for (var row = 0; row < entityRows.length; row++) {
			var a = entityRows[row].querySelector("a");
			var rad = entityRows[row].querySelector("input[type='radio'][name='merge.target']");
			if (a && rad) {
				if (showEntityInfo) {
					addZone(entityRows[row], "entInfo" + rad.value);
				}
				entities[rad.value] = {a: a, rad: rad, row: entityRows[row], rowid: parseInt(rad.value, 10)};
				minrowid = row == 0 ? entities[rad.value].rowid : Math.min(minrowid, entities[rad.value].rowid);
				if (document.referrer) {
					var lmbid = a.getAttribute("href").match(rembid);
					var rmbid = document.referrer.match(rembid);
					if (lmbid && rmbid && lmbid[0] == rmbid[0]) {
						if (tbl) {
							var tds = entityRows[row].querySelectorAll("td");
							for (var td = 0; td < tds.length; td++) {
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
				entities[rad.value].rowidzone = addZone(entityRows[row], "rowID"+row);
				entities[rad.value].rowidzone.style.setProperty("text-align", "right");
				entities[rad.value].rowidzone.appendChild(rowIDLink(mergeType.replace(/-/, "_"), rad.value));
				var removeZone = addZone(entityRows[row], "remove" + row);
				var batchRemove = document.createElement("label");
				var removeCB = batchRemove.appendChild(document.createElement("input"));
				removeCB.setAttribute("type", "checkbox");
				removeCB.setAttribute("ref", "remove");
				removeCB.setAttribute("value", rad.value);
				batchRemove.addEventListener("click", rangeClick);
				batchRemove.appendChild(document.createTextNode("remove"));
				removeZone.appendChild(batchRemove);
				removeZone.appendChild(document.createTextNode(" ("));
				removeZone.appendChild(createA("now", null, "remove this and all selected "+mergeType+"s from merge")).addEventListener("click", removeFromMerge);
				removeZone.appendChild(document.createTextNode(")"));
			}
		}
		if (minrowid) {
			minrowid += "";
			entities[minrowid].row.style.setProperty("text-shadow", "0px 0px 8px #0C0");
			entities[minrowid].rowidzone.style.setProperty("color", "#060");
			entities[minrowid].rowidzone.insertBefore(document.createTextNode(" (oldest) "), entities[minrowid].rowidzone.firstChild);
			var rowidsHeader = document.getElementById(userjs + "rowidsHeader");
			var sortButton = createA(rowidsHeader ? rowidsHeader.textContent : "SORT!", null, "Sort those " + mergeType + "s (oldest ID first)");
			sortButton.addEventListener("click", function(e) {
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
			for (var releases = {}, mediums = document.querySelectorAll("input[id$='.release_id'][type='hidden']"), m = 0; m < mediums.length; m++) {
				if (!releases[mediums[m].value]) {
					releases[mediums[m].value] = {fragment: document.createDocumentFragment()};
					var releaseCell = getSibling(document.querySelector("form > table.tbl > tbody input[type='radio'][name='merge.target'][value='" + mediums[m].value + "']").parentNode, "td");
					releases[mediums[m].value].format = releaseCell.parentNode.getElementsByTagName("td")[3].textContent.replace(/\s/g, "").replace(/"/g, "″");
					for (var c = 0; c < releaseCell.childNodes.length; c++) {
						releases[mediums[m].value].fragment.appendChild(releaseCell.childNodes[c].cloneNode(true));
					}
					var a = releases[mediums[m].value].fragment.firstChild;
					if (a.tagName != "A") a = a.getElementsByTagName("a")[0];
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
} else {
	/* merge queue (clear before add) tool */
	var mergeButton = document.querySelector("div#content > form[action$='/merge_queue'] > table.tbl ~ div.row > span.buttons > button[type='submit'], div#page > form[action$='/merge_queue'] > table.tbl ~ div.row > span.buttons > button[type='submit']");
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
		var reMergeButton = mergeButton.cloneNode();
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
	var currentMergeForm = document.querySelector("div#current-editing > form[action$='/merge']");
	if (currentMergeForm) {
		currentMergeForm.querySelector("button[type='submit'][value='remove']").addEventListener("click", function(event) {
			var href = currentMergeForm.getAttribute("action") + "?submit=remove";
			for (var checked = currentMergeForm.querySelectorAll("li > input[type='checkbox'][id^='remove.'][value]:checked"), c = 0; c < checked.length; c++) {
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
function setButtonTextFromSelectedToAll(button, all) {
	button.replaceChild(document.createTextNode(button.textContent.replace(new RegExp(all ? "selected" : "all", "i"), all ? "all" : "selected")), button.firstChild);
}
function noChildrenChecked(parent) {
	return !parent.querySelector("table.tbl input[name='add-to-merge']:checked");
}
function checkAllChildren(parent) {
	var checkAll = parent.querySelectorAll("table.tbl input[name='add-to-merge']:not(:checked)");
	for (var cb = 0; cb < checkAll.length; cb += 1) {
		checkAll[cb].checked = true;
	}
}
function loadEntInfo() {
	var entInfoZone = mergeForm.querySelector("[id^='" + userjs + "entInfo']:not([class])") || mergeForm.querySelector("[id^='" + userjs + "entInfo']:not([class~='ok'])");
	if (entInfoZone) {
		var rowid = entInfoZone.getAttribute("id").match(/\d+$/)[0];
		entInfoZone.appendChild(loadimg("info"));
		var mbid = entities[rowid].a.getAttribute("href").match(rembid)[0];
		var url = "/ws/2/" + mergeType + "/" + mbid + "?inc=";
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
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:work-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " works");
							}
							tmp = res.evaluate(".//mb:release-group-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " records");
							}
							tmp = res.evaluate(".//mb:recording-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.getAttribute("count") + " recs");
							}
							break;
						case "release":
							tmp = res.evaluate(".//mb:status/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:language/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:script/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(entInfoZone, tmp2.nodeValue);
							}
							tmp = res.evaluate(".//mb:release-group", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								var span = document.createElement("span");
								fill(span, "in ", createA(tmp2.getElementsByTagName("title")[0].textContent.replace(/\s/g, " "), "/release-group/" + tmp2.getAttribute("id")), "");
								stackInfo(entInfoZone, span);
							}
							break;
						case "release-group":
							tmp = res.evaluate(".//mb:first-release-date/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
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
	for (var rowid in entities) if (entities.hasOwnProperty(rowid)) {
		if (!entities[rowid][what]) {
			entities[rowid].row.parentNode.appendChild(entities[rowid].row.parentNode.removeChild(entities[rowid].row));
		} else {
			var rows = entities[rowid].row.parentNode.querySelectorAll("tr, li");
			for (var row = 0; row < rows.length; row++) {
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
function rangeClick(event) {
	if (event.target.tagName == "LABEL") {
		if (event.shiftKey && lastCB && event.target.firstChild != lastCB && event.target.firstChild.checked != lastCB.checked) {
			var CBs = event.target.parentNode.parentNode.parentNode.querySelectorAll("[id^='" + userjs + "remove']  > label > input[type='checkbox'][ref='remove']");
			var found;
			for (var cb = 0; cb < CBs.length; cb++) {
				if (found) {
					if (CBs[cb] != lastCB && CBs[cb] != event.target.firstChild) {
						CBs[cb].checked = lastCB.checked;
					} else break;
				} else if (CBs[cb] == lastCB || CBs[cb] == event.target.firstChild) {
					found = true;
				}
			}
			lastCB = null;
		} else {
			lastCB = event.target.firstChild;
		}
	}
}
function removeFromMerge(event) {
	var isCB = event.target.parentNode.getAttribute("id");
	if (isCB && isCB.indexOf(userjs + "remove") == 0) {
		var cb = event.target.parentNode.querySelector("input[type='checkbox'][ref='remove']:not(:checked)");
		if (cb) cb.checked = true;
	}
	var checkedRemoves = mergeForm.querySelectorAll("[id^='" + userjs + "remove'] input[type='checkbox'][ref='remove']:checked");
	if (checkedRemoves.length > 0) {
		var href = "?submit=remove";
		for (var cb = 0; cb < checkedRemoves.length; cb++) {
			href += "&remove=" + checkedRemoves[cb].value;
			delete entities[checkedRemoves[cb].value];
			checkedRemoves[cb].parentNode.parentNode.parentNode.parentNode.removeChild(checkedRemoves[cb].parentNode.parentNode.parentNode);
		}
		oddEvenRowsRedraw();
		var xhr = new XMLHttpRequest();
		xhr.open("GET", href, true);
		xhr.send(null);
	}
}
function oddEvenRowsRedraw() {
	var rows = mergeForm.querySelectorAll("form > table > tbody > tr");
	for (var row = 0; row < rows.length; row++) {
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
function addZone(par, id) {
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
	par.appendChild(typeof stu=="string" ? document.createTextNode(stu) : stu);
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
	if (minimumDelay) {
		var del = minimumDelay + lastTick - new Date().getTime();
		del = del > 0 ? del : 0;
		return del;
	} else {
		lastTick = new Date().getTime();
		return lastTick;
	}
}
