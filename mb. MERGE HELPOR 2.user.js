// ==UserScript==
// @name         mb. MERGE HELPOR 2
// @version      2015.5.18.1542
// @description  musicbrainz.org: Merge helper highlights last clicked, show info, indicates oldest MBID (in artist/release/release-group/work/recording merges)
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
		var showEntityInfo = true;
		mergeType = mergeType[1].replace(/_/, "-");
		var ents = [];
		var lastEnt = -1;
		var oldestEnt = -1;
		var minrowid;
		var rowid2row = {};
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
			for (var row=0; row<entityRows.length; row++) {
				var a = entityRows[row].querySelector("a");
				var rad = entityRows[row].querySelector("input[type='radio']");
				if (showEntityInfo) {
					addZone(entityRows[row], "entInfo"+row);
				}
				if (a && rad) {
					rowid2row[rad.value] = row;
					ents.push({a:a, rad:rad, row:entityRows[row], rowid:parseInt(rad.value,10)});
					minrowid = row==0?ents[row].rowid:Math.min(minrowid, ents[row].rowid);
					if (document.referrer) {
						var lmbid = a.getAttribute("href").match(rembid);
						var rmbid = document.referrer.match(rembid);
						if (rmbid && lmbid+"" == rmbid+"") {
							lastEnt = ents.length - 1;
							if (tbl) {
								var tds = entityRows[row].querySelectorAll("td");
								for (var td=0; td<tds.length; td++) {
									tds[td].style.setProperty("background-color", "#FF6");
								}
							}
							else {
								entityRows[row].style.setProperty("background-color", "#FF6");
							}
							entityRows[row].style.setProperty("border", "thin dashed black");
							entityRows[row].setAttribute("title", "LAST CLICK");
							rad.click();
						}
					}
					ents[row].rowidzone = addZone(entityRows[row], "rowID"+row);
					ents[row].rowidzone.style.setProperty("text-align", "right");
					ents[row].rowidzone.appendChild(rowIDLink(mergeType.replace(/-/, "_"), rad.value));
					var removeZone = addZone(entityRows[row], "remove"+row);
					var batchRemove = document.createElement("label");
					var removeCB = batchRemove.appendChild(document.createElement("input"));
					removeCB.setAttribute("type", "checkbox");
					removeCB.setAttribute("ref", "remove");
					removeCB.setAttribute("value", rad.value);
					batchRemove.appendChild(document.createTextNode("remove"));
					removeZone.appendChild(batchRemove);
					removeZone.appendChild(document.createTextNode(" ("));
					removeZone.appendChild(createA("now", null, "remove this and selected "+mergeType+"s from merge")).addEventListener("click", removeFromMerge);
					removeZone.appendChild(document.createTextNode(")"));
				}
			}
			if (minrowid) {
				var oldestMBIDrow = rowid2row[minrowid+""];
				ents[oldestMBIDrow].row.style.setProperty("text-shadow", "0px 0px 8px #0C0");
				ents[oldestMBIDrow].rowidzone.style.setProperty("color", "#060");
				ents[oldestMBIDrow].rowidzone.insertBefore(document.createTextNode(" (oldest) "), ents[oldestMBIDrow].rowidzone.firstChild);
				ents[oldestMBIDrow].rowidzone.insertBefore(createA("SORT!", null, "sort those rows (oldest ID first)"), ents[oldestMBIDrow].rowidzone.firstChild).addEventListener("click", function(e) {
					this.parentNode.removeChild(this);
					sortBy("rowid");
				});
				ents[oldestMBIDrow].rowidzone.querySelector("a[href$='conditions.0.args.0="+ents[oldestMBIDrow].rowid+"']").style.setProperty("background-color",  "#6F6");
				ents[oldestMBIDrow].rad.click();
			}
			if (showEntityInfo) {
				entInfo();
			}
		}
	}
	function entInfo(current) {
		var iei = current?current:0;
		var eiZone = document.getElementById(userjs+"entInfo"+iei);
		eiZone.appendChild(loadimg("info"));
		var url = "/ws/2/"+mergeType+"/"+ents[iei].a.getAttribute("href").match(rembid)+"?inc=";
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
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				removeChildren(eiZone);
				if (this.status == 200) {
					var res = this.responseXML, tmp;
					switch (mergeType) {
						case "artist":
							var tmp = res.evaluate(".//mb:country/text()", res, nsr, XPathResult.ANY_TYPE, null), tmp2;
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.nodeValue);
							}
							var tmp = res.evaluate(".//mb:work-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.getAttribute("count")+" works");
							}
							var tmp = res.evaluate(".//mb:release-group-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.getAttribute("count")+" records");
							}
							var tmp = res.evaluate(".//mb:recording-list", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.getAttribute("count")+" recs");
							}
							break;
						case "release":
							var tmp = res.evaluate(".//mb:status/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.nodeValue);
							}
							var tmp = res.evaluate(".//mb:language/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.nodeValue);
							}
							var tmp = res.evaluate(".//mb:script/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.nodeValue);
							}
							var tmp = res.evaluate(".//mb:release-group", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								var span = document.createElement("span");
								fill(span, "in ", createA(tmp2.getElementsByTagName("title")[0].textContent.replace(/\s/g, " "), "/release-group/"+tmp2.getAttribute("id")), "");
								var count = parseInt(tmp2.getAttribute("count"));
								stackInfo(eiZone, span);
							}
							break;
						case "release-group":
							var tmp = res.evaluate(".//mb:first-release-date/text()", res, nsr, XPathResult.ANY_TYPE, null);
							while (tmp2 = tmp.iterateNext()) {
								stackInfo(eiZone, tmp2.nodeValue);
							}
							break;
					}
					if (!eiZone.hasChildNodes()) {
						stackInfo(eiZone, "no info");
						eiZone.style.setProperty("opacity", ".5");
					}
					if (++iei<ents.length) {
						entInfo(iei);
					}
				}
				else {
					stackInfo(eiZone, "Error "+this.status+" fetching "+mergeType+" #"+iei+" info");
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send(null);
	}
	function sortBy(what) {
		for (var ent=0; ent < ents.length; ent++) {
			if (!ents[ent][what]) {
				ents[ent].row.parentNode.appendChild(ents[ent].row.parentNode.removeChild(ents[ent].row));
			} else {
				var rows = ents[ent].row.parentNode.querySelectorAll("tr");
				for (var row=0; rows.length; row++) {
					var indexA = rows[row].querySelector("td[id^='"+userjs+"rowID'] a[href^='/search/edits']"), index;
					if (indexA && (index = parseInt(indexA.textContent.replace(/\D/g, ""), 10)) && index >= ents[ent][what]) {
						if (ents[ent].row != rows[row]) {
							ents[ent].row.parentNode.insertBefore(ents[ent].row.parentNode.removeChild(ents[ent].row), rows[row]);
							if (index == ents[ent][what]) {
								indexA.style.setProperty("background-color", "silver");
								indexA.setAttribute("title", "same "+what.replace(/ID/, " ID")+" as above");
							}
						}
						break;
					}
				}
			}
		}
		var rows = ents[0].row.parentNode.getElementsByTagName(ents[0].row.tagName.toLowerCase());
		for (var row=0; row < rows.length; row++) {
			rows[row].className = rows[row].className.replace(/\b(even|odd)\b/, row%2?"even":"odd");
		}
	}
	function removeFromMerge(event) {
		if (event.target.parentNode.getAttribute("id").indexOf(userjs+"remove") == 0) {
			var cb = event.target.parentNode.querySelector("input[type='checkbox'][ref='remove']:not(:checked)");
			if (cb) cb.checked = true;
		}
		var checkedRemoves = mergeForm.querySelectorAll("[id^='"+userjs+"remove'] input[type='checkbox'][ref='remove']:checked");
		var href = "?submit=remove";
		if (checkedRemoves.length > 0) {
			for (var cb = 0; cb < checkedRemoves.length; cb++) {
				href += "&remove="+checkedRemoves[cb].value;
			}
			location.href = href;
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
		}
		else {
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