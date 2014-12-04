// ==UserScript==
// @name         mb. MERGE HELPOR 2
// @version      2014.12.4.145
// @description  musicbrainz.org: Merge helper highlights last clicked, show info, retrieve oldest edit (in artist/release/release-group/work/recording merges)
// @homepage     http://userscripts-mirror.org/scripts/show/124579
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb.%20MERGE%20HELPOR%202.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb.%20MERGE%20HELPOR%202.user.js
// @author       PATATE12 aka. jesus2099/shamo
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
(function(){
/* -------- CONFIG START ---- */
var showEntityInfo = true;
/*	lookForOldestEdit is DEPRECATED in favour of oldest rowid = oldest MBID. 
	i will remove it completely during 2015 except if popular request to keep it or change it. */
var lookForOldestEdit = false;
/* -------- CONFIG  END  ---- */
	var userjs = "j2userjs124579";
	var rembid = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
	if (etype = self.location.pathname.match(/\/(.+)\/merge/)) {
		etype = etype[1].replace(/_/, "-");
		var ents = [];
		var lastEnt = -1;
		var oldestEnt = -1;
		var minrowid;
		var rowid2row = {};
		if (mergeForm = document.querySelector("div#content > form[action*='/merge']")) {
			/*	entity merge pages progressively abandon ul layout in favour of table.tbl
				* area			ul (but only for admins)
				* artist		table.tbl
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
				tbl.querySelector("thead tr").appendChild(document.createElement("th")).appendChild(document.createTextNode("MBID birth date (row ID)"));
				if (showEntityInfo && etype.match(/(release|release-group)/)) {
					tbl.querySelector("thead tr").appendChild(document.createElement("th")).appendChild(document.createTextNode("Information"));
				} else { showEntityInfo = false; }
				if (lookForOldestEdit) {
					tbl.querySelector("thead tr").appendChild(document.createElement("th")).appendChild(document.createTextNode("First found edit (deprecated)"));
				}
			}
			var rowIDzone = [];
			for (var row=0; row<entityRows.length; row++) {
				var a = entityRows[row].querySelector("a");
				var rad = entityRows[row].querySelector("input[type='radio']");
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
					ents[row].rowidzone.appendChild(document.createTextNode(rad.value));
				}
				if (showEntityInfo) {
					addZone(entityRows[row], "entInfo"+row);
				}
				if (lookForOldestEdit) {
					addZone(entityRows[row], "oldestEdit"+row);
				}
			}
			if (minrowid) {
				var oldestMBIDrow = rowid2row[minrowid+""];
				ents[oldestMBIDrow].row.style.setProperty("text-shadow", "0px 0px 8px #0C0");
				ents[oldestMBIDrow].rowidzone.style.setProperty("font-weight", "bold");
				ents[oldestMBIDrow].rowidzone.appendChild(document.createTextNode(" (oldest)"));
				ents[oldestMBIDrow].rad.click();
			}
			if (showEntityInfo) {
				entInfo();
			}
			if (lookForOldestEdit) {
				oldestEdit();
			}
		}
	}
	function entInfo(current) {
		var iei = current?current:0;
		var eiZone = document.getElementById(userjs+"entInfo"+iei);
		eiZone.appendChild(loadimg("info"));
		var url = "/ws/2/"+etype+"/"+ents[iei].a.getAttribute("href").match(rembid)+"?inc=";
		switch (etype) {
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
					switch (etype) {
						case "artist":
							var tmp = res.evaluate(".//mb:country/text()", res, nsr, XPathResult.ANY_TYPE, null);
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
					stackInfo(eiZone, "Error "+this.status+" fetching "+etype+" #"+iei+" info");
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send(null);
	}
	function oldestEdit(current, oldest) {
		var ioe = current?current:0, io = current&&oldest?oldest:0;
		var oeZone = document.getElementById(userjs+"oldestEdit"+ioe);
		oeZone.appendChild(loadimg("edits"));
		var url = "/search/edits?order=asc&conditions.0.field="+etype.replace(/-/, "_")+"&conditions.0.operator=%3D&conditions.0.name=toto&conditions.0.args.0="+ents[ioe].rad.value;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				removeChildren(oeZone);
				if (this.status == 200) {
					var res = document.createElement("html"); res.innerHTML = this.responseText;
					if ((edit = res.querySelector("div#content div.edit-list h2 a[href*='musicbrainz.org/edit/']")) && (editid = edit.getAttribute("href").match(/[0-9]+$/)) && (edittype = edit.textContent.match(/- (.+)$/)) && (edittype = edittype[1].toUpperCase())) {
						ents[ioe].edit = parseInt(editid, 10);
						if (!ents[io].edit || ents[io].edit > ents[ioe].edit) { io = ioe; }
						var span = document.createElement("span");
						span.appendChild(document.createTextNode("edit:"));
						span.appendChild(createA(editid, "/edit/"+editid)).setAttribute("id", userjs+"oldestEditA"+ioe);
						oeZone.setAttribute("title", edittype);
						if (editor = res.querySelector("div#content div.edit-list h2 + p.subheader > a[href*='musicbrainz.org/user/']")) {
							oeZone.setAttribute("title", edittype+" / "+editor.textContent);
						}
						stackInfo(oeZone, span);
					}
					else {
						stackInfo(oeZone, "(no edits found)");
						oeZone.style.setProperty("opacity", ".5");
					}
					if (++ioe<ents.length) {
						oldestEdit(ioe, io);
					}
					else {
						if (ents[io].edit) {
							oldestEnt = io;
//							if (lastEnt < 0) { ents[io].rad.click(); }
							var ioeZone = document.getElementById(userjs+"oldestEdit"+io);
							ioeZone.appendChild(document.createTextNode(" (oldest) "));
//							ioeZone.appendChild(createA("SORT!", null, "sort those rows (oldest edit first)")).addEventListener("click", function(e) {
//								this.parentNode.removeChild(this);
//								sortByEdit();
//							});
							document.getElementById(userjs+"oldestEditA"+io).style.setProperty("background-color",  "#6F6");
						}
						top.status = "";
					}
				}
				else {
					stackInfo(oeZone, "Error "+this.status+" fetching oldest entity history #"+ioe);
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send(null);
	}
//	function sortByEdit() {
//		for (var ent=0; ent < ents.length; ent++) {
//			if (!ents[ent].edit) {
//				ents[ent].row.parentNode.appendChild(ents[ent].row.parentNode.removeChild(ents[ent].row));
//			} else {
//				var rows = ents[ent].row.parentNode.querySelectorAll("tr");
//				for (var row=0; rows.length; row++) {
//					var rowedit = rows[row].querySelector("a[id^='"+userjs+"oldestEdit'][href^='/edit/']");
//					if (rowedit && (rowedit = parseInt(rowedit.textContent, 10)) && rowedit >= ents[ent].edit) {
//						if (ents[ent].row != rows[row]) {
//							ents[ent].row.parentNode.insertBefore(ents[ent].row.parentNode.removeChild(ents[ent].row), rows[row]);
//							if (rowedit == ents[ent].edit) {
//								var samesame = rows[row].querySelector("a[id^='"+userjs+"oldestEdit'][href^='/edit/']");
//								samesame.style.setProperty("background-color", "silver");
//								samesame.setAttribute("title", "same edit as above");
//							}
//						}
//						break;
//					}
//				}
//			}
//		}
//		var rows = ents[0].row.parentNode.getElementsByTagName(ents[0].row.tagName.toLowerCase());
//		for (var row=0; row < rows.length; row++) {
//			rows[row].className = rows[row].className.replace(/\b(even|odd)\b/, row%2?"even":"odd");
//		}
//	}
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
})();