// ==UserScript==
// @name         mb. MERGE HELPOR 2
// @version      2015.6.2.1609
// @description  musicbrainz.org: Merge helper highlights last clicked, shows info, indicates oldest MBID, manages (remove) entity merge list (in artist/release/release-group/work/recording merges)
// @homepage     http://userscripts-mirror.org/scripts/show/124579
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12)             my own coding setup
// @compatible   opera+violentmonkey   my own browsing setup
// @compatible   firefox+greasemonkey  quickly tested
// @compatible   chromium              quickly tested
// @compatible   chromium+tampermonkey quickly tested
// @compatible   chrome                tested with chromium
// @compatible   chrome+tampermonkey   tested with chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb.%20MERGE%20HELPOR%202.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb.%20MERGE%20HELPOR%202.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-01-31
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*/merge*
// @include      http://*.mbsandbox.org/*/merge*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var userjs = "j2userjs124579";
	var rembid = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
	var mergeType = location.pathname.match(/\/(.+)\/merge/);
	if (mergeType) {
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
			var tbl = mergeForm.querySelector("table.tbl");
			var entityRows = mergeForm.getElementsByTagName("li");
			if (tbl) {
				entityRows = mergeForm.querySelectorAll("form > table > tbody > tr");
				var headers = tbl.querySelector("thead tr");
				if (showEntityInfo && mergeType.match(/(release|release-group)/)) {
					headers.appendChild(document.createElement("th")).appendChild(document.createTextNode("Information"));
				} else { showEntityInfo = false; }
				headers.appendChild(document.createElement("th")).appendChild(document.createTextNode("MBID age (row ID)")).parentNode.style.setProperty("text-align", "right");
				var batchRemove = headers.appendChild(document.createElement("th")).appendChild(createA("Remove selected entities", null, "Remove selected "+mergeType+"s from merge"));
				batchRemove.addEventListener("click", removeFromMerge);
			}
			var rowIDzone = [];
			for (var row = 0; row < entityRows.length; row++) {
				var a = entityRows[row].querySelector("a");
				var rad = entityRows[row].querySelector("input[type='radio']");
				if (a && rad) {
					if (showEntityInfo) {
						addZone(entityRows[row], "entInfo"+rad.value);
					}
					entities[rad.value] = {a:a, rad:rad, row:entityRows[row], rowid:parseInt(rad.value, 10)};
					minrowid = row==0?entities[rad.value].rowid:Math.min(minrowid, entities[rad.value].rowid);
					if (document.referrer) {
						var lmbid = a.getAttribute("href").match(rembid);
						var rmbid = document.referrer.match(rembid);
						if (lmbid && rmbid && lmbid[0] == rmbid[0]) {
							if (tbl) {
								var tds = entityRows[row].querySelectorAll("td");
								for (var td=0; td<tds.length; td++) {
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
					var removeZone = addZone(entityRows[row], "remove"+row);
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
				entities[minrowid].rowidzone.insertBefore(createA("SORT!", null, "sort those rows (oldest ID first)"), entities[minrowid].rowidzone.firstChild).addEventListener("click", function(e) {
					this.parentNode.removeChild(this);
					sortBy("rowid");
				});
				entities[minrowid].rowidzone.querySelector("a[href$='conditions.0.args.0="+entities[minrowid].rowid+"']").style.setProperty("background-color",  "#6F6");
				entities[minrowid].rad.click();
			}
			if (showEntityInfo) {
				loadEntInfo();
			}
		}
	}
	function loadEntInfo() {
		var entInfoZone = mergeForm.querySelector("[id^='"+userjs+"entInfo']:not([class])") || mergeForm.querySelector("[id^='"+userjs+"entInfo']:not([class~='ok'])");
		if (entInfoZone) {
			var rowid = entInfoZone.getAttribute("id").match(/\d+$/)[0];
			entInfoZone.appendChild(loadimg("info"));
			var mbid = entities[rowid].a.getAttribute("href").match(rembid)[0];
			var url = "/ws/2/"+mergeType+"/"+mbid+"?inc=";
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
				var entInfoZone = document.getElementById(userjs+"entInfo"+this.id);
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
									stackInfo(entInfoZone, tmp2.getAttribute("count")+" works");
								}
								tmp = res.evaluate(".//mb:release-group-list", res, nsr, XPathResult.ANY_TYPE, null);
								while (tmp2 = tmp.iterateNext()) {
									stackInfo(entInfoZone, tmp2.getAttribute("count")+" records");
								}
								tmp = res.evaluate(".//mb:recording-list", res, nsr, XPathResult.ANY_TYPE, null);
								while (tmp2 = tmp.iterateNext()) {
									stackInfo(entInfoZone, tmp2.getAttribute("count")+" recs");
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
									fill(span, "in ", createA(tmp2.getElementsByTagName("title")[0].textContent.replace(/\s/g, " "), "/release-group/"+tmp2.getAttribute("id")), "");
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
					} else {
						entInfoZone.className = "ng";
						stackInfo(entInfoZone, "Error "+this.status+" fetching "+mergeType+" #"+this.id+" info");
					}
				}
				loadEntInfo();
			});
			xhr.open("GET", url, true);
			xhr.send(null);
		}
	}
	function sortBy(what) {
		for (var rowid in entities) if (entities.hasOwnProperty(rowid)) {
			if (!entities[rowid][what]) {
				entities[rowid].row.parentNode.appendChild(entities[rowid].row.parentNode.removeChild(entities[rowid].row));
			} else {
				var rows = entities[rowid].row.parentNode.querySelectorAll("tr, li");
				for (var row=0; row < rows.length; row++) {
					var indexA = rows[row].querySelector("[id^='"+userjs+"rowID'] a[href^='/search/edits']"), index;
					if (indexA && (index = parseInt(indexA.textContent.replace(/\D/g, ""), 10)) && index >= entities[rowid][what]) {
						if (entities[rowid].row != rows[row]) {
							entities[rowid].row.parentNode.insertBefore(entities[rowid].row.parentNode.removeChild(entities[rowid].row), rows[row]);
							if (index == entities[rowid][what]) {
								indexA.style.setProperty("background-color", "silver");
								indexA.setAttribute("title", "same "+what.replace(/ID/, " ID")+" as above");
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
				var CBs = event.target.parentNode.parentNode.parentNode.querySelectorAll("td[id^='"+userjs+"remove']  > label > input[type='checkbox'][ref='remove']");
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
		if (isCB && isCB.indexOf(userjs+"remove") == 0) {
			var cb = event.target.parentNode.querySelector("input[type='checkbox'][ref='remove']:not(:checked)");
			if (cb) cb.checked = true;
		}
		var checkedRemoves = mergeForm.querySelectorAll("[id^='"+userjs+"remove'] input[type='checkbox'][ref='remove']:checked");
		if (checkedRemoves.length > 0) {
			var href = "?submit=remove";
			for (var cb = 0; cb < checkedRemoves.length; cb++) {
				href += "&remove="+checkedRemoves[cb].value;
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
		for (var row=0; row < rows.length; row++) {
			rows[row].className = rows[row].className.replace(/\b(even|odd)\b/, row%2?"even":"odd");
		}
	}
	function loadimg(txt) {
		var img = document.createElement("img");
		img.setAttribute("src", "/static/images/icons/loading.gif");
		if (txt) {
			var msg = "⌛ loading "+txt+"…";
			img.setAttribute("alt", msg);
			img.setAttribute("title", msg);
			top.status = msg;
		}
		return img;
	}
	function addZone(par, id) {
		par.appendChild(document.createTextNode(" "));
		var zone = par.appendChild(document.createElement(tbl?"td":"span"));
		zone.setAttribute("id", userjs+id);
		par.appendChild(document.createTextNode(" "));
		return zone;
	}
	function stackInfo(zone, info) {
		fill(zone, tbl?"":" — ", info, ", ");
	}
	function fill(par, beg, stu, sep) {
		par.appendChild(document.createTextNode(par.hasChildNodes()?sep:beg));
		par.appendChild(typeof stu=="string"?document.createTextNode(stu):stu);
	}
	function createA(text, link, title) {
		var a = document.createElement("a");
		if (link) {
			a.setAttribute("href", link);
		} else {
			a.style.setProperty("cursor", "pointer");
		}
		if (title){ a.setAttribute("title", title); }
		a.appendChild(document.createTextNode(text));
		return a;
	}
	function removeChildren(p) {
		while (p && p.hasChildNodes()) { p.removeChild(p.firstChild); }
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
		var renderedID = (id+"").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
		var a = createA(
			renderedID,
			"/search/edits?order=asc&conditions.0.operator=%3D&conditions.0.field="+type+"&conditions.0.name="+renderedID+"&conditions.0.args.0="+id
		);
		return a;
	}
})();