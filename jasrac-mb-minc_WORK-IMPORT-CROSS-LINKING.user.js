"use strict";
var meta = function() {
// ==UserScript==
// @name         JASRAC. work importer/editor into MusicBrainz + MB-JASRAC-音楽の森 links + MB back search links
// @version      2019.5.7
// @changelog    https://github.com/jesus2099/konami-command/commits/master/jasrac-mb-minc_WORK-IMPORT-CROSS-LINKING.user.js
// @description  One click imports JASRAC works into MusicBrainz (name, iswc, type, credits, edit note, sort name, search hint) and マス歌詞®（mass-lyrics） and wikipedia links. It will do the same magic in work editor. Work links to both JASRAC and 音楽の森 / ongakunomori / music forest / minc / magic db and back to MB
// @homepage     http://userscripts-mirror.org/scripts/show/94676
// @supportURL   https://github.com/jesus2099/konami-command/labels/jasrac-mb-minc_WORK-IMPORT-CROSS-LINKING
// @compatible   vivaldi(2.4.1488.38)+violentmonkey   my setup (of.)
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/jasrac-mb-minc_WORK-IMPORT-CROSS-LINKING.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/jasrac-mb-minc_WORK-IMPORT-CROSS-LINKING.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-01-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match        *://*.mbsandbox.org/work/*
// @match        *://*.musicbrainz.org/work/*
// @match        *://www.minc.gr.jp/db/*
// @match        *://www2.jasrac.or.jp/eJwid/main.jsp?trxID=*WORKS_CD=*
// @exclude      *.org/work/*/*edits*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
};
meta = meta.toString();
meta = {
	name: meta.match(/@name\s+(.+)/)[1],
	version: meta.match(/@version\s+(.+)/)[1],
	namespace: meta.match(/@namespace\s+(.+)/)[1]
};
/*
	https://github.com/jesus2099/konami-command/issues/14
	POST work credits NG https://chatlogs.musicbrainz.org/musicbrainz/2015/2015-04/2015-04-09.html#T16-34-38-396540
	GET JASRAC ID (work attributes) NG http://tickets.musicbrainz.org/browse/MBS-8341
*/
var MBS7313 = "This script has been partially fixed now but is back to VERY EXPERIMENTAL status!\r\n(ノ ゜Д゜)ノ 彡┻━┻ Work credits are back on import (not on edit yet). Aliases are still disabled (maybe forever?).";
var chrome = "Please run “" + meta.name + "” with Tampermonkey instead of plain Chrome.";
var DEBUG = localStorage.getItem("jesus2099debug");
var userjs = "jesus2099userjs94676";
var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var reISWC = "T- ?\\d{3}\\.\\d{3}.\\d{3}-\\d";
var reCode = "\\d[A-Z\\d]\\d-\\d{4}-\\d";
var reAnnotCode = "(?:jasrac|作品コード)\\W+(" + reCode + ")";
var MBS = self.location.protocol + "//" + self.location.host;
var pagecat = self.location.href.match(new RegExp("(jasrac(?=\\.or\\.jp)|minc(?=\\.gr\\.jp)|work(/" + RE_GUID + "/edit$|/create)|work)"));
var oldTitle = document.title;
var xhrForm = {}, xhrWork = {}, h1, iname;
var MBlookups = [];
var joblist = [];
var xhrJobs = {
	"workinfo-get": {
		info: "PLEASE WAIT (get current work info)",
		async: true,
		method: "get",
		init: function(xhr) {
			xhrJobs["workinfo-get"].url = MBS + "/ws/2/work/" + xhrWork.mbid + "?fmt=json&inc=annotation+aliases";
		},
		onload: function() {
			if (this.status > 199 && this.status < 400 && this.responseText.match(new RegExp(xhrWork.mbid))) {
				var res = JSON.parse(this.responseText);
				xhrWork.error = res.error;
				if (!xhrWork.error) {
					xhrWork.aliases = res.aliases;
					xhrWork.annotation = res.annotation ? res.annotation : "";
					var code = xhrWork.annotation.match(new RegExp(reAnnotCode, "i"));
					if (code) {
						insertBefore(createTag("div", {a: {class: "row"}}, [createTag("label", {}, "JASRAC作品コード:"), createTag("b", {s: {backgroundColor: background}}, createA(code[1], workLookupURL("jasrac", "code", code[1]), "JASRAC work code from annotation", "_blank"))]), /*xhrForm.name*/iname.parentNode);
					}
					aliasTable();
				}
				document.title = oldTitle;
			}
		},
	},
	"work-create/edit":{
		method: "post",
		async: true,
		init: function(xhr) {
			xhrJobs["work-create/edit"].info = (self.location.pathname.match(/^\/work\/create/) ? "create" : "edit") + " work";
			xhrJobs["work-create/edit"].url = xhrForm.form.getAttribute("action");
			var inps = xhrForm.form.querySelectorAll("form > div > fieldset:not(." + userjs + ") input[name]:not([name='']):not([type='button']), form > div > fieldset:not(." + userjs + ") textarea[name], form > div > fieldset:not(." + userjs + ") select[name]");
			xhrJobs["work-create/edit"].params = "";
			for (var inp = 0; inp < inps.length; inp++) {
				xhrJobs["work-create/edit"].params += (inp > 0 ? "&" : "") + inps[inp].getAttribute("name") + "=" + encodeURIComponent(inps[inp].value);
			}
		},
		onload: function() {
			var mbid = this.responseText.match(new RegExp("<h1>(?:<span class=\"mp\">)?<a[^>]+(" + RE_GUID + ")\""));
			xhrWork.id = this.responseText.match(new RegExp("<a[^>]+/work/merge_queue\\?add-to-merge=([0-9]+)\""));
			if (!xhrWork.edit && mbid) {
				xhrWork.mbid = mbid[1];
				if (self.location.pathname.match(/^\/work\/create/) && h1) {
					h1.appendChild(document.createTextNode(" "));
					h1.appendChild(createA(iname.value, "/work/" + xhrWork.mbid, null, "_blank"));
				}
			}
			if (xhrWork.mbid && xhrWork.id && xhrWork.mbid == mbid[1]) {
				xhrMachine();
			} else {
				alert("Work create (or edit) error #" + this.status + ".\n\n" + this.responseText);
				h1.style.setProperty("background-color", "pink");
				joblist = [];
				disable(xhrForm.form, false);
			}
		},
	},
	"batch-relationship-create": {
		method: "post",
		async: false,
		url: "/relationship-editor",
		init: function(xhr) {
			var inps = xhrForm.form.querySelectorAll("div#" + userjs + "wcs input.name.lookup-performed, form > div > fieldset:not(." + userjs + ") textarea.edit-note");
			xhrJobs["batch-relationship-create"].params = "rel-editor.as_auto_editor=" + (isAutoEdit() ? "1" : "0");
			var reli = 0;
			for (var inp = 0; inp < inps.length; inp++) {
				var input = inps[inp];
				if (input.classList.contains("lookup-performed")) {
					var row = getParent(input, "div", "row");
					var rel = "&rel-editor.rels." + (reli++) + ".";
					xhrJobs["batch-relationship-create"].params +=
						rel + "action=add" +
						+ rel + "link_type=" + row.querySelector("input[name='ar.link_type_id']").value
						+ rel + "period.ended=0"
						+ rel + "entity.0.gid=" + encodeURIComponent(row.querySelector("input[class='gid']").value)
						+ rel + "entity.0.type=" + input.parentNode.className.match(/artist|label/)
						+ rel + "entity.1.gid=" + xhrWork.mbid
						+ rel + "entity.1.type=work";
					if (row.querySelector("input[name='ar.attrs.additional']")) {
						xhrJobs["batch-relationship-create"].params += rel + "attrs.additional=1";
					}
					if (row.querySelector("input[name='ar.attrs.translated']")) {//TODO: obsolete, cf. da6c5d8a-ce13-474d-9375-61feb29039a5
						xhrJobs["batch-relationship-create"].params += rel + "attrs.translated=1";
					}
				} else if (input.tagName == "TEXTAREA") {
					xhrJobs["batch-relationship-create"].params += "&rel-editor.edit_note=" + encodeURIComponent(input.value.replace(/('''PERFORMERS'''|'''MAIN TITLE''')[^※]+※/, "''{…} cf. MB add work edit for full JASRAC extract''\n\n※").replace(/\u00a0（.+）/g, "") + "\n" + MBlinks());
				}
			}
		},
	},
	"annotation-get":{
		async: true,
		info: "get current work annotation",
		method: "get",
		init: function(xhr) {
			xhrJobs["annotation-get"].url = MBS + "/ws/2/work/" + xhrWork.mbid + "?inc=annotation";
		},
		onload: function() {
			if (this.status > 199 && this.status < 400 && this.responseText.match(new RegExp("<work.+id=\"" + xhrWork.mbid + "\">"))) {
				var oldannot = this.responseText.match(/<annotation><text>([^<]+)<\/text><\/annotation>/);
				if (!oldannot || oldannot && !oldannot[1].match(new RegExp(xhrWork.code))) {
					if (oldannot) {
						xhrWork.annotation = oldannot[1];
					}
				}
			}
			xhrMachine();
		},
	},
	"annotation-add":{
		async: false,
		info: "JASRAC work code annotation",
		method: "post",
		init: function(xhr) {
			xhrJobs["annotation-add"].url = MBS + "/work/" + xhrWork.mbid + "/edit_annotation";
			var curl = workLookupURL("jasrac", "code", xhrWork.code);
			xhrJobs["annotation-add"].params = "edit-annotation.text=" + encodeURIComponent("JASRAC: '''" + xhrWork.code + "''' ([http://tickets.musicbrainz.org/browse/MBS-7359|MBS-7359])" + (xhrWork.annotation ? "\n" + xhrWork.annotation : "")) + "&edit-annotation.changelog=" + encodeURIComponent("JASRAC: " + xhrWork.code + " (MBS-7359)") + "&edit-annotation.edit_note=" + encodeURIComponent("JASRAC: '''" + xhrWork.code + "''' (" + curl + ") ← requires JASRACへの直リンク ('''jasrac_DIRECT-LINK''')\nStill needed for JASRAC auto‐linking (until http://tickets.musicbrainz.org/browse/MBS-7359).\n\n" + MBlinks());
		},
	},
	"alias-add":{
		async: false,
		method: "post",
		init: function(xhr) {
			xhrJobs["alias-add"].url = MBS + "/work/" + xhrWork.mbid + "/add-alias";
			xhrJobs["alias-add"].params = "edit-alias.as_auto_editor=" + (isAutoEdit() ? "1" : "0");
			var newAlias = xhrWork.newAliases.shift();
			if (newAlias) {
				xhrJobs["alias-add"].info = newAlias["edit-alias.name"] + " alias";
				if (newAlias["edit-alias.sort_name"].length > 0 && newAlias["edit-alias.sort_name"] != newAlias["edit-alias.name"]) {
					xhrJobs["alias-add"].info += "（" + newAlias["edit-alias.sort_name"] + "）";
				}
				for (var p in newAlias) if (newAlias.hasOwnProperty(p)) {
					xhrJobs["alias-add"].params += "&" + p + "=" + encodeURIComponent(newAlias[p]);
				}
				xhrJobs["alias-add"].params += "&edit-alias.period.ended=&edit-alias.edit_note=" + encodeURIComponent(teditnote.value.replace(/'''CREDITS'''[^※] + '''MAIN TITLE'''/, "'''MAIN TITLE'''") + "\n" + MBlinks());
			}
		},
	},
};
if (pagecat && !document.title.match(/slow down!/i)) {
	pagecat = pagecat[1].replace(new RegExp(RE_GUID + "/"), "");
	var background = "#FF6";/*favourite game*/
	var cOK = "#CFC";/*bad for ozone layer*/
	var cWARN = "gold";
	var cERR = "pink";
	var hasLyrics = "詞";
	var hasCredits = "作曲";
	var vocal = "vocal";
	var instrumental = "instrumental";
	if (DEBUG) console.log(userjs + " pagecat : " + pagecat);
	switch (pagecat) {
		case "jasrac":
			var workName;
			var sakuhinCode;
			var iswc;
			var summary = "";
			var createWork = "https://musicbrainz.org/work/create?edit-work.name=";
			var isVocal = false;
			var tables = document.getElementsByTagName("table");
			if (tables) {
				var work = tables[1];
				if (work) {
					var sakuhin = work.getElementsByTagName("b")[2].firstChild;
					var tmp = sakuhin.nodeValue.split("\u00a0");
					workName = fixSTR(tmp[2]);
					sakuhinCode = tmp[1];
					document.title = workName + "　" + sakuhinCode + "　" + document.title;
					createWork += encodeURIComponent(fullwidthToHalfwidth(workName)).replace(/%20/g, "+");
					summary += workName + " (work code '''" + sakuhinCode + "'''/" + sakuhinCode.replace(/-/g, "");
					var iswcLink = work.getElementsByTagName("a");
					if (iswcLink.length > 3) {
						iswc = iswcLink[3].parentNode.parentNode.lastChild.nodeValue.replace(" ", "").substring(0, 15);
						summary += " — ISWC '''" + iswc + "'''/" + iswc.replace(/[-\.]/g, "");
					}
					summary += ")\n";
					var srccred = tables[3];
					if (srccred) {
						var tmpcred = "";
						var credtr = srccred.getElementsByTagName("tr");
						if (credtr) {
							for (var icred = 2; icred < credtr.length; icred++) {
								var credtd = credtr[icred].getElementsByTagName("td");
								if (credtd) {
									var credit = {role: credtd[2].textContent.trim(), who: credtd[1].textContent.trim()};
									credit["trust"] = credtd[4].textContent.trim();
									if (credit.trust != "") {
										credit.trust = "\u00a0（信託状況：" + credit.trust /* + (!credit.trust.match(/全信託/) ? "sic" : "")*/;
									}
									credit["manager"] = credtd[5].textContent.trim();
									if (credit.manager != "") {
										credit.trust += (credit.trust!="" ? "／" : "（") + credit.manager;
									}
									if (credit.trust != "") {
										credit.trust += "）";
									}
									if (!isVocal && credit.role.indexOf(hasLyrics) > -1) {
										isVocal = true;
									}
									credit["line"] = credit.role + "：" + credit.who + credit.trust + "\n";
									if (credit.who != "UNKNOWN PUBLISHER" && tmpcred.indexOf(credit.line) < 0) {
										tmpcred += credit.line;
									}
								}
							}
						}
						if (tmpcred != "") {
							summary += "\n'''CREDITS'''\n" + tmpcred;
						}
					}
					var perf = tables[6];
					if (perf) {
						var perfs = perf.getElementsByTagName("tr");
						var max = Math.min(perfs.length, 13);
						var tmpperf = "\n'''PERFORMERS'''" + (perfs.length > max ? " (" + (perfs.length - 3) + ")" : "") + "\n";
						var isperf = true;
						for (var iperf = 3; iperf < max; iperf++) {
							var artist = perfs[iperf].getElementsByTagName("td")[1].textContent.trim();
							if (artist == "") {
								isperf = false;
								break;
							}
							tmpperf += (iperf > 3 ? "\n" : "") + fullwidthToHalfwidth(artist);
						}
						if (perfs.length > max) tmpperf += "\n…";
						if (isperf) {
							summary += tmpperf + "\n";
						}
					}
					var alias = tables[5];
					if (alias) {
						var transtypes = ["'''genuine'''", "''yomikata''", "latin"];
						var aliases = alias.getElementsByTagName("tr");
						var tmptran = "\n'''MAIN TITLE'''";
						var hastran = false;
						var tmpali = "\n'''ALIASES/SUBTITLES/SEARCHES/TRANSLATIONS'''";
						var hasali = false;
						for (var iali = 2; iali < aliases.length; iali++) {
							var type = aliases[iali].getElementsByTagName("td")[0].textContent.match(/(正題|タイトルの続き)/);
							if (type) {
								type = type[1];
							} else {
								type = "";
							}
							var alis = aliases[iali].getElementsByTagName("div");
							for (var itran = 0; itran < 3; itran++) {
								var ali = alis[itran].textContent.trim();
								if(type == "正題") {
									if (!hastran) {
										hastran = true;
									}
									tmptran += "\n" + ali + " (" + transtypes[itran] + ")";
								} else {
									if (type == "タイトルの続き") {
										if (!ali.match(/^[－-]$/)) {
											var prevalias = tmpali.substring(tmpali.lastIndexOf("\n")).split("◇");
											prevalias[itran] += ali;
											tmpali = tmpali.substring(0, tmpali.lastIndexOf("\n")) + prevalias.join("◇");
										}
									} else {
										if (!hasali) {
											hasali = true;
										}
										tmpali += (itran>0 ? "◇" : "\n") + ali;
									}
								}
							}
						}
						if (hastran) {
							summary += tmptran + "\n";
						}
						if (hasali) {
							summary += tmpali + "\n";
						}
						summary += "\n";
					}
			/* -- vv ------ copiable full summary ------ vv -- */
					var tr = document.createElement("tr");
					var td = document.createElement("td");
					td.setAttribute("colspan", "3");
					td.style.setProperty("text-align", "center");
					td.style.setProperty("background-image", "/eJwid/img/kokoronelogo_A-2out.jpg");
					summary += "※ '''JASRAC work importer''' (" + meta.version + ")\n" + workLookupURL("jasrac", "code", sakuhinCode) + " ← requires '''JASRAC direct links enabler'''\n" + workLookupURL("minc", "code", sakuhinCode) + " ← mirror, requires account";
					td.appendChild(document.createTextNode("click to select → "));
					var ta = createTag("textarea", {a: {name: "tsummary"}}, summary);
					ta.setAttribute("id", ta.getAttribute("name"));
					ta.style.setProperty("width", "40%");
					ta.setAttribute("rows", "1");
					ta.style.setProperty("color", "black");
					ta.style.setProperty("background", background);
					ta.addEventListener("focus", function(e) {
						this.setAttribute("rows", "20");
						this.select();
					}, false);
					ta.addEventListener("mousemove", function(e) {
						this.blur();
						this.focus();
					}, false);
					ta.addEventListener("mouseout", function(e) {
						this.setAttribute("rows", "1");
					}, false);
					td.appendChild(ta);
					td.appendChild(document.createTextNode(" ← CONTROL key + mouse over to expand + select"));
					tr.appendChild(td);
					work.appendChild(tr);
			/* -- vv ------ Add to MB ------ vv -- */
					var form = createTag("form", {a: {action: createWork.split("?")[0], method: "post", "accept-charset": "utf-8", title: "PLEASE REVIEW before final submission!"}, s: {display: "inline", background: background}});
					form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.attributes.0.type_id", value: "3"}}));
					form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.attributes.0.value", value: sakuhinCode}}));
					createWork += "&edit-work.attributes.0.type_id=3&edit-work.attributes.0.value=" + sakuhinCode;
					if (iswc) {
						form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.iswcs.0", value: iswc}}));
						createWork += "&edit-work.iswcs.0=" + iswc;
					}
					if (isVocal) {
						form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.type_id", value: "17"}}));
						createWork += "&edit-work.type_id=17";
					} else {
						form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.language_id", value: "486"}}));
						createWork += "&edit-work.language_id=486";
					}
					/* https://musicbrainz.org/relationships */
					createWork += getWorkCredits({
						/*artist-work*/
						"作詞": { nomatch: /^権利者　/, type: "3e48faba-ec01-47fd-8e89-30e81161661c" },
						"訳詞": { nomatch: /^権利者　/, type: "da6c5d8a-ce13-474d-9375-61feb29039a5" },
						"補詞": { nomatch: /^権利者　/, type: "3e48faba-ec01-47fd-8e89-30e81161661c", additional: "1" },
						"作曲": { nomatch: /^権利者　/, type: "d59d99ea-23d4-4a80-b066-edca32ee158f" },
						"作曲作詞": { type: "a255bca1-b157-4518-9108-7b147dc3fc68" },
						"不明": { type: "a255bca1-b157-4518-9108-7b147dc3fc68" }
					}, summary, createWork);
					createWork += getWorkCredits({
						/*label-work*/
						"作詞": { match: /^権利者　(.+)$/, type: "05ee6f18-4517-342d-afdf-5897f64276e3" },
						"訳詞": { match: /^権利者　(.+)$/, type: "05ee6f18-4517-342d-afdf-5897f64276e3" },
						"補詞": { match: /^権利者　(.+)$/, type: "05ee6f18-4517-342d-afdf-5897f64276e3" },
						"作曲": { match: /^権利者　㈱?(.+)$/, type: "05ee6f18-4517-342d-afdf-5897f64276e3" },
						"出版者": { type: "05ee6f18-4517-342d-afdf-5897f64276e3" },
						"サブ出版": { type: "05ee6f18-4517-342d-afdf-5897f64276e3" }
					}, summary, createWork);
					form.appendChild(createTag("input", {a: {type: "hidden", name: "edit-work.edit_note", value: summary}}));
					createWork += "&edit-work.edit_note=" + encodeURIComponent(summary).replace(/%20/g, "+");
/*						form.appendChild(createTag("a", {a: {title: MBS7313 + "\r\nImport this work in MusicBrainz (name, iswc, type, edit note)"}, s: {background: background, cursor: "pointer", textDecoration: "underline", color: "blue"}, e: {click: function(event) {
						this.parentNode.setAttribute("target", event.shiftKey || event.ctrlKey ? "_blank" : "_self");
						this.parentNode.submit();
						return stop(event);
					}}}, "Add to MB"));*/
					form.appendChild(createTag("a", {a: {href: createWork, title : MBS7313 + "\r\nImport this work in MusicBrainz (name, iswc, type, edit note)"}, s: {background: background, cursor: "pointer", textDecoration: "underline", color: "blue"}}, "Add to MusicBrainz"))
					sakuhin.parentNode.appendChild(document.createTextNode(" （"));
					sakuhin.parentNode.appendChild(form);
					sakuhin.parentNode.appendChild(document.createTextNode("）"));
			/* -- vv ------ sakuhin links ------ vv -- */
					addAfter(document.createElement("sup"), sakuhin).appendChild(createA("M", workLookupURL("mb", "name", workName), "Search this work name in MusicBrainz"));
					addAfter(document.createTextNode(" "), sakuhin);
			/* -- vv ------ sakuhin code links ------ vv -- */
					var span = document.createElement("span");
					span.appendChild(document.createTextNode(sakuhinCode));
					span.appendChild(document.createTextNode(" "));
					var suppo = span.appendChild(document.createElement("sup"));
					suppo.appendChild(createA("音", workLookupURL("minc", "code", sakuhinCode), "This work in 音楽の森"));
					suppo.appendChild(createA("M", workLookupURL("mb", "code", sakuhinCode), "Search this work code in MusicBrainz"));
					span.appendChild(document.createTextNode(" "));
					span.appendChild(document.createTextNode(workName));
					sakuhin = replaceElement(span, sakuhin); /*TODO replaceChild returns sakuhin already (removed element), no ?*/
			/* -- vv ------ iswc links ------ vv -- */
					if (iswc) {
						addAfter(document.createElement("sup"), iswcLink[iswcLink.length - 1].parentNode.parentNode.lastChild).appendChild(createA("M", workLookupURL("mb", "iswc", iswc), "Search this ISWC in MusicBrainz"));
					}
				}
			}
			break;
		case "minc":
			var sakuhinmei = document.querySelector("a[href='#sakuhinmei']");
			var sakuhincode = document.querySelector("a[href='#sakuhincode']");
			var iswccode = document.querySelector("a[href='#iswccode']");
			if (sakuhinmei && sakuhincode && iswccode) {
				sakuhinmei = getParent(sakuhinmei, "th");
				var sakuhinmei_v = getSibling(sakuhinmei, "td").textContent;
				sakuhincode = getParent(sakuhincode, "th");
				var sakuhincode_v = getSibling(sakuhincode, "td").textContent.match(new RegExp(reCode)) + "";
				iswccode = getParent(iswccode, "th");
				var iswccode_v = getSibling(iswccode, "td").textContent.match(new RegExp(reISWC));
				insertBefore(createTag("sup", {s: {float: "right"}}), sakuhinmei.firstChild).appendChild(createA("J", workLookupURL("jasrac", "name", sakuhinmei_v), "Search this work name in JASRAC"));
				insertBefore(createTag("sup", {s: {float: "right"}}), sakuhinmei.firstChild).appendChild(createA("M", workLookupURL("mb", "name", sakuhinmei_v), "Search this work name in MusicBrainz"));
				insertBefore(createTag("sup", {s: {float: "right"}}), sakuhincode.firstChild).appendChild(createA("J", workLookupURL("jasrac", "code", sakuhincode_v), "Go to this work in JASRAC"));
				insertBefore(createTag("sup", {s: {float: "right"}}), sakuhincode.firstChild).appendChild(createA("M", workLookupURL("mb", "code", sakuhincode_v), "Search this work code in MusicBrainz"));
				if (iswccode_v) {
					iswccode_v += "";
					insertBefore(createTag("sup", {s: {float: "right"}}), iswccode.firstChild).appendChild(createA("J", workLookupURL("jasrac", "iswc", iswccode_v), "Search this ISWC in JASRAC"));
					insertBefore(createTag("sup", {s: {float: "right"}}), iswccode.firstChild).appendChild(createA("M", workLookupURL("mb", "iswc", iswccode_v.replace(/T- /, "T-")), "Search this ISWC in MusicBrainz"));
				}
			} else {
				var sakuhincodet = document.querySelectorAll("a[href^='SakCdInfo.aspx?SAKUHINCD='], a[href^='SakCDInfo.aspx?SAKUHINCD='], div#ctl00_ctl00_phMain_phDBMain_PanelDetail table.tbl > tbody > tr > td:nth-child(8)");
				for (var st = 0; st < sakuhincodet.length; st++) {
					var sakuhincode = "", prec = sakuhincodet[st];
					if (sakuhincodet[st].tagName == "A") {
						sakuhincode += sakuhincodet[st].getAttribute("href").match(/.{8}$/);
					} else {
						sakuhincode += sakuhincodet[st].textContent.trim().replace(/-/, "");
						prec = prec.lastChild;
					}
					addAfter(createA("M", workLookupURL("mb", "code", sakuhincode), "Search this work code in MusicBrainz"), prec);
					addAfter(createA("J", workLookupURL("jasrac", "code", sakuhincode), "Go to this work in JASRAC"), prec);
				}
			}
			break;
		case "work":
			if (getExtLinks()) {
				/* -- vv ------ JASRAC + ongakunomori sakuhin code link ------ vv -- */
				var sakuhincode, codes = new RegExp(reAnnotCode, "ig"), donecodes = [];
				for (var workattr = document.querySelectorAll("div#sidebar > dl.properties > dd:not(.iswc):not(.lyrics-language):not(.type)"), at = 0; at < workattr.length; at++) {
					var dd = workattr[at];
					var dt = getSibling(dd, "dt", null, true);
					if (dt && dt.textContent.match(/jasrac id/i)) {
						var ddcode = dd.textContent.trim();
						replaceElement(createTag("a", {a: {href: workLookupURL("jasrac", "code", ddcode)}}, ddcode), dd.firstChild);
						if (donecodes.indexOf(ddcode) < 0) {
							donecodes.push(ddcode);
							getExtLinks().appendChild(createTag("li", {a: {class: userjs + "jasrac no-favicon"}}, createTag("a", {a: {href: workLookupURL("jasrac", "code", ddcode)}, s: {background: background}}, "JASRAC — " + ddcode)));
							getExtLinks().appendChild(createTag("li", {a: {class: userjs + "minc no-favicon"}}, createTag("a", {a: {href: workLookupURL("minc", "code", ddcode)}, s: {background: background}}, "音楽の森 — " + ddcode)));
						} else {
							if (confirm("Duplicate JASRAC ID detected in work attributes.\nDo you want to edit?")) {
								self.location.href = self.location.pathname + "/edit";
							}
						}
					}
				}
				/* -- vv ------ JASRAC ISWC link ------ vv -- */
				var iswcs = document.querySelectorAll("div#sidebar > dl.properties > dd.iswc > a[href*='/iswc/'] code");
				for (var iswc = 0; iswc < iswcs.length; iswc++) {
					var iswct = iswcs[iswc].textContent;
					getExtLinks().appendChild(createTag("li", {a: {class: userjs + "jasrac no-favicon"}}, createA("JASRAC — " + iswct, workLookupURL("jasrac", "iswc", iswct.replace(/T-/, "T-+")), "Search this ISWC in JASRAC")));
				}
				/* -- vv ------ JASRAC name search link ------ vv -- */
				var title = document.querySelector("h1 a").textContent.trim();
				getExtLinks().appendChild(createTag("li", {a: {class: userjs + "jasrac no-favicon"}}, jasracSearch("title", title)));
				getExtLinks().appendChild(createTag("li", {a: {class: userjs + "minc no-favicon"}}, mincSearch("title", title)));
			}
			break;
		case "work/edit":
			xhrWork.edit = true;
			xhrWork.mbid = self.location.pathname.match(new RegExp(RE_GUID));
			xhrMachine(xhrJobs["workinfo-get"]);
		case "work/create":
			h1 = document.querySelector("h1");
			var iname = document.getElementById("id-edit-work.name");
			xhrForm.form = getParent(iname, "form");
			insertBefore(createTag("p", {s: {color: "purple", border: "1px dashed #fcc", backgroundColor: "#ffc"}}, [createTag("h3", {}, meta.name), MBS7313, " ☞ ", createA("Read more…", "https://github.com/jesus2099/konami-command/issues/14", null, "_blank")]), xhrForm.form);
/*				xhrForm.form.addEventListener("submit", function(event) {
				var inputs = xhrForm.form.querySelectorAll(xhrForm.originalInputs.css);
				var changed = !(xhrWork.edit) || (xhrForm.originalInputs.inputs.length != inputs.length);
				for (var i = 0; !changed && i < xhrForm.originalInputs.inputs.length; i++) {
					if (xhrForm.originalInputs.inputs[i].value != xhrForm.originalInputs.values[i]) {
						changed = true;
					}
				}
				if (changed) {
					joblist.push("work-create/edit");
				}
				var rels = this.querySelectorAll("div#" + userjs + "wcs input.name.lookup-performed").length;
				if (rels > 0) {
					xhrJobs["batch-relationship-create"].info = rels + " relationship" + (rels > 1 ? "s" : "");
					joblist.push("batch-relationship-create");
				}
				if (xhrWork.code && xhrWork.edit && !xhrWork.jasracidmatch) {//je sais pas si je comprendrai toujours ça la prochaine fois
					if (xhrWork.edit && typeof xhrWork.annotation == "undefined") {
						joblist.push("annotation-get");
					}
					if (!xhrWork.edit || typeof xhrWork.annotation == "string" && !xhrWork.annotation.match(new RegExp(xhrWork.code))) {
						joblist.push("annotation-add");
					}
				}
				var aliases = xhrForm.form.querySelectorAll("table#" + userjs + "alta > tfoot > tr > td > input." + userjs + "addit[type='checkbox']");
				xhrWork.newAliases = [];
				for (var a = 0; a < aliases.length; a++) {
					if (aliases[a].checked) {
						var tr = getParent(aliases[a], "tr");
						var n = tr.querySelector("input[name='edit-alias.name']");
						var sn = tr.querySelector("input[name='edit-alias.sort_name']");
						var t = tr.querySelector("*[name='edit-alias.type_id']");
						var p = tr.querySelector("input[name='edit-alias.primary_for_locale']");
						var l = tr.querySelector("input[name='edit-alias.locale']");
						if (
							n && typeof n.value == "string" && n.value.length > 0
							&& sn && typeof sn.value == "string"
							&& t && typeof t.value == "string"
							&& p && typeof p.checked == "boolean"
							&& l && typeof l.value == "string"
						) {
							xhrWork.newAliases.push({
								"edit-alias.name": n.value,
								"edit-alias.sort_name": sn.value.length>0 ? sn.value : n.value,
								"edit-alias.type_id": t.value,
								"edit-alias.primary_for_locale": p.checked ? "1" : "0",
								"edit-alias.locale": l.value,
							});
							joblist.push("alias-add");
						}
					}
				}
				if (joblist.length > 1 || joblist.length == 1 && joblist[0] != "work-create/edit") {
					stop(event);
					scrollTo(0, 0);
					disable(this, true);
					xhrMachine();
				}
			}, false);*/
			xhrForm.submit = xhrForm.form.querySelector("div.row button.submit.positive[type='submit']");
			insertBefore(createTag("input", {a: {type: "reset", value: "Reset", title: "reset form values", tabindex: "-1", class: "styled-button"}, s: {float: "left", fontSize: ".77em", height: "16px", width: "32px", margin: "0 8px", border: "1px solid #ccc"}}), xhrForm.submit);
			xhrForm.originalInputs = {inputs: [], values: [], css: "form > div > fieldset:not(." + userjs + ") input:not([type='button']), form > div > fieldset:not(." + userjs + ") select"};
			xhrForm.originalInputs.inputs = xhrForm.form.querySelectorAll(xhrForm.originalInputs.css);
			for (var i = 0; i < xhrForm.originalInputs.inputs.length; i++) {
				xhrForm.originalInputs.values.push(xhrForm.originalInputs.inputs[i].value);
			}
			var icomment = document.getElementById("id-edit-work.comment");
			var stypeid = document.getElementById("id-edit-work.type_id");
//TODO: restore language button feature (search slangid) https://github.com/jesus2099/konami-command/issues/321
			var slangid = document.querySelector("select[name='edit-work.languages.0']");
			var teditnote = document.getElementById("id-edit-work.edit_note");
			if (document.referrer.match(/jasrac\.or\.jp/) && (sakuhin = teditnote.value.match(new RegExp("^(.+) \\(work code '''(" + reCode + ")'''")))) {
				xhrWork.code = sakuhin[2];
//				workSortName(teditnote.value);
//				workCredits(teditnote.value);
			}
			iname.addEventListener("focus", function(event){ this.style.setProperty("background", ""); }, false);
			icomment.addEventListener("focus", function(event){ this.style.setProperty("background", ""); }, false);
			stypeid.addEventListener("focus", function(event){ this.style.setProperty("background", ""); }, false);
			stypeid.style.setProperty("width", "260px");
			var buttons = stypeid.parentNode.appendChild(createTag("span", {a: {class: "buttons"}}, [createButtor(vocal), createButtor(instrumental)]));
			stypeid.style.setProperty("width", (parseInt(self.getComputedStyle(stypeid).getPropertyValue("width"), 10) - parseInt(self.getComputedStyle(buttons).getPropertyValue("width"), 10)) + "px");
//			buttons = slangid.parentNode.appendChild(createTag("span", {a: {class: "buttons"}}, [createButtol("日", 198), createButtol("EN", 120)]));
//			slangid.style.setProperty("width", (parseInt(self.getComputedStyle(slangid).getPropertyValue("width"), 10) - parseInt(self.getComputedStyle(buttons).getPropertyValue("width"), 10)) + "px");
			teditnote.parentNode.appendChild(document.createElement("br"));
			var tjasrac = document.querySelector("div.workheader p.subheader") || document.querySelector("h1");
			tjasrac = tjasrac.appendChild(createTag("textarea", {a: {placeholder: "Paste JASRAC summary here"}}));
			addAfter(document.createTextNode(" ← Hover and paste JASRAC summary here for some magic :)"), tjasrac);
			tjasrac.setAttribute("tabindex", "-1");
			tjasrac.setAttribute("rows", "1");
			tjasrac.style.setProperty("overflow", "hidden");
			tjasrac.addEventListener("mouseover", function(event) {
				if (document.activeElement != this) {
					xhrForm.lastinput = document.activeElement;
				}
				this.blur();
				this.focus();
			}, false);
			tjasrac.addEventListener("focus", function(event) {
				this.setAttribute("rows", "4");
				this.select();
			}, false);
			tjasrac.addEventListener("mouseout", function(event) {
				this.setAttribute("rows", "1");
				if (xhrForm.lastinput && xhrForm.lastinput.focus) {
					xhrForm.lastinput.focus();
				}
			}, false);
			tjasrac.addEventListener("keyup", function(event) {
				var sakuhinCode = this.value.match(new RegExp("work code '''(" + reCode + ")'''"));
				if (sakuhinCode && this.value.indexOf(hasCredits) != -1) {
					sakuhinCode = sakuhinCode[1];
					xhrWork.code = sakuhinCode;
					var sakuhin = this.value.match(/^(.+) \(work code/)[1];
					if (sakuhin == iname.value) {
						iname.style.setProperty("background", cOK);
					} else if (iname.value.match(new RegExp(sakuhin, "i"))) {
						iname.style.setProperty("background", cWARN);
					} else {
						iname.style.setProperty("background", cERR);
					}
					var workattrCSS = "form > div > fieldset > table#work-attributes";
					var workattrTypeCSS = "select";
					var workattrValueCSS = "input[type='text'][name$='.value']";
					var workattr = xhrForm.form.querySelectorAll(workattrCSS + " > tbody > tr");
					for (var wa = 0; wa < workattr.length - 1; wa++) {
						var type = workattr[wa].querySelector(workattrTypeCSS);
						var value = workattr[wa].querySelector(workattrValueCSS);
						if (type && value && type.value == "3" && value.value == xhrWork.code) {
							xhrWork.jasracidmatch = value;
							break;
						}
					}
					if (xhrWork.jasracidmatch) {
						xhrWork.jasracidmatch.style.setProperty("background", cOK);
					} else if (
						workattr.length > 1
						&& workattr[workattr.length - 2].querySelector(workattrValueCSS)
						&& workattr[workattr.length - 2].querySelector(workattrValueCSS).value == ""
					) {
						workattr[workattr.length - 2].querySelector(workattrTypeCSS).value = "3";
						workattr[workattr.length - 2].querySelector(workattrValueCSS).value = xhrWork.code;
						workattr[workattr.length - 2].querySelector(workattrValueCSS).style.setProperty("background", cWARN);
					} else {
						xhrForm.form.querySelector(workattrCSS + " button.add-item").click();
						var jasracidnew = xhrForm.form.querySelectorAll(workattrCSS + " > tbody > tr")[workattr.length - 1];
						jasracidnew.querySelector(workattrTypeCSS).value = "3";
						jasracidnew.querySelector(workattrValueCSS).style.setProperty("background", cWARN);
						jasracidnew.querySelector(workattrValueCSS).value = xhrWork.code;
					}
					var iswc = this.value.match(/— ISWC '''(T-[0-9]{3}\.[0-9]{3}.[0-9]{3}-[0-9])'''/);/*reISWC when MBS-4727 fixed*/
					var insel = "form.edit-work div.form-row-text-list div.text-list-row input.value[name^='edit-work.iswcs.']";
					var iiswcs = document.querySelectorAll(insel);
					if (iiswcs.length > 0 && iswc) { /*MBS-4727*/
						iswc = iswc[1];
						var iiswcm;
						for (var im = 0; im < iiswcs.length; im++) {
							if (iiswcs[im].value == iswc) {
								iiswcm = iiswcs[im];
								break;
							}
						}
						if (iiswcm) {
							iiswcm.style.setProperty("background", cOK);
						} else if (iiswcs[iiswcs.length - 1].value == "") {
							iiswcs[iiswcs.length - 1].value = iswc;
							iiswcs[iiswcs.length - 1].style.setProperty("background", cWARN);
						} else {
							document.querySelector("form.edit-work div.form-row-text-list div.form-row-add button.add-item").click();
							var iswcn = document.querySelectorAll(insel)[iiswcs.length];
							iswcn.style.setProperty("background", cWARN);
							iswcn.value = iswc;
						}
					}
					setType(this.value.indexOf(hasLyrics) != -1 ? vocal : instrumental);
//					workSortName(this.value);
//					workCredits(this.value);
					teditnote.value = this.value;
					this.style.setProperty("background", cOK);
					this.value = xhrWork.code + " " + sakuhin;
				} else {
					icomment.style.setProperty("background", "");
					stypeid.style.setProperty("background", "");
					this.style.setProperty("background", cERR);
				}
				scrollTo(0, 0);
			}, false);
			break;
		default:
			return false;
	}
}
function MBlinks() {
	return (xhrWork.id && self.location.href.match(/^\/work\/create/) ? "MB add work edit: " + MBS + "/search/edits?combinator=and&conditions.0.field=work&conditions.0.operator=%3D&conditions.0.name=" + (iname.value ? encodeURIComponent(iname.value) : "TA+GUEULE") + "&conditions.0.args.0=" + xhrWork.id[1] + "&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=41\n" : "") + "MB work edit history: " + MBS + "/work/" + xhrWork.mbid + "/edits";
}
function workSortName(txt) {
	var sortname = txt.match(/(.+) \(''yomikata''\)/);
	var searchint = txt.match(/(.+) \(latin\)/);
	var alrows = [];
	var aldone = [];
	if (sortname) {
		alrows.push({name: iname.value, "sort-name": sortname[1], type: "1", locale: "ja", primary: "1"});
		aldone.push(iname.value);
		aldone.push(sortname[1]);
	}
	if (searchint) {
		searchint = swapTHE(searchint[1], true);
		alrows.push({name: searchint, "sort-name": searchint, type: "2"});
		aldone.push(searchint);
	}
	var aliases = txt.substring(txt.indexOf("ALIASES/SUBTITLES/SEARCHES/TRANSLATIONS")).split("\n");
	for (var al = 1; al < aliases.length && aliases[al].match(/^.*◇.*◇.*$/); al++) {
		var alias = fixSTR(aliases[al]).split("◇");
		if (alias[0].length > 0 && !alias[1].match(/^[－-]?$/)) {
			alrows.push({name: alias[0], "sort-name": alias[1], type: "1", locale: "ja"});
			if (alias[2].length > 0) {
				var swapped = swapTHE(alias[2], true);
				alrows.push({name: swapped, "sort-name": swapped, type: "2"});
				aldone.push(swapped);
			}
		} else {
			for (var a = 0; a < 3; a++) {
				var swapped = swapTHE(alias[a], true);
				if (!alias[a].match(/^[－-]?$/) && aldone.indexOf(swapped) == -1) {
					alrows.push({name: swapped, "sort-name": swapTHE(alias[a], false)});
					aldone.push(swapped);
				}
			}
		}
	}
	if (alrows.length > 0) {
		aliasTable(alrows, true);
	}
}
function workCredits(txt) {
	var wcs = document.getElementById(userjs + "wcs");
	if (!wcs) {
		wcs = addAfter(createTag("fieldset", {a: {class: userjs}}, [createTag("legend", {}, "Relationships"), createTag("p", {}, [createTag("b", {}, "JASRAC sometimes has wrong credits"), " so, please double-check with your booklet then only lookup for the correct relationship(s) you want to create.", document.createElement("br"), "If you change your mind and want to un-lookup one of them, just select and clear the text field.", document.createElement("br"), "Only green fields will queue relationship edits."]), createTag("div", {a: {id: userjs + "wcs"}})]), xhrForm.form.querySelector("form > div > fieldset")).querySelector("div#" + userjs + "wcs");
	}
	removeChildren(wcs);
	try { jQuery; } catch (error) {
		wcs.parentNode.appendChild(createTag("p", {s: {color: "red"}}, error.message + " — “Credits inline searches” can’t work. " + chrome));
		return;
	}
	workCredit("artist", {
		"作詞": {nomatch: /^権利者　/, english: "lyrics", "ar.link_type_id": "165"},
		"訳詞": {nomatch: /^権利者　/, english: "translate lyrics", "ar.link_type_id": "165", "ar.attrs.translated": "1"},//TODO: obsolete, cf. da6c5d8a-ce13-474d-9375-61feb29039a5
		"補詞": {nomatch: /^権利者　/, english: "additional lyrics", "ar.link_type_id": "165", "ar.attrs.additional": "1"},
		"作曲": {nomatch: /^権利者　/, english: "compose", "ar.link_type_id": "168"},
		"作曲作詞": [{english: "generic write", "ar.link_type_id": "167"}, {english: "compose", "ar.link_type_id": "168"}, {english: "lyrics", "ar.link_type_id": "165"}],
		"不明": [{english: "generic write", "ar.link_type_id": "167"}, {english: "compose", "ar.link_type_id": "168"}, {english: "lyrics", "ar.link_type_id": "165"}]
	}, txt, wcs);
	workCredit("label", {
		"作詞": {match: /^権利者　(.+)$/, english: "publish", "ar.link_type_id": "208"},
		"訳詞": {match: /^権利者　(.+)$/, english: "publish", "ar.link_type_id": "208"},
		"補詞": {match: /^権利者　(.+)$/, english: "publish", "ar.link_type_id": "208"},
		"作曲": {match: /^権利者　㈱?(.+)$/, english: "publish", "ar.link_type_id": "208"},
		"出版者": {english: "publish", "ar.link_type_id": "208"},
		"サブ出版": {english: "sub-publish", "ar.link_type_id": "208"}
	}, txt, wcs);
}
function workCredit(enttype, credtypes, source, pTarget) {
	var i = pTarget.querySelectorAll("a[title^='reset'][ref]");
	i = i.length > 0 ? parseInt(i[i.length - 1].getAttribute("ref"),10) + 1 : 0;
	for (var credtype in credtypes) if (credtypes.hasOwnProperty(credtype)) {
		var ctype = credtypes[credtype].english ? [credtypes[credtype]] : credtypes[credtype];
		var cont = pTarget;
		for (var c = 0; c < ctype.length; c++) {
			var credit, credits = new RegExp("^" + credtype + "：([^\u00a0]+)(?:\u00a0（.+）)?$", "igm");
			while (credit = credits.exec(source)) {
				if (cont.tagName != "FIELDSET" && ctype.length > 1) {
					cont = cont.appendChild(createTag("fieldset", {a: {class: userjs}}, [createTag("legend", {}, "choose either")]));
				}
				credit = credit[1].trim();
				if (credtypes[credtype].nomatch && credit.match(credtypes[credtype].nomatch)) {
					continue;
				}
				if (credtypes[credtype].match) {
					if (credit = credit.match(credtypes[credtype].match)) {
						credit = credit[1];
						} else {
							continue;
					}
				}
				var ilookupid = userjs + "ilookup" + i;
				var target = cont.appendChild(createTag("div", {a: {class: "row", title: credit}}));
				target.appendChild(createTag("label", {a: {for: ilookupid}}, ctype[c].english + ":"));
				target.appendChild(createTag("a", {a: {title: "reset\r\n" + credit, ref: i}, s: {cursor: "pointer"}, e: {click: function(event) {
					MBlookups[this.getAttribute("ref")].clear(true);
				}}}, "× "));
				var jQac = jQuery(target.appendChild(createTag("span", {a: {class: enttype + " autocomplete" + (ctype.length == 1 || c > 0 ? "" : " " + userjs + "manu"), ref: enttype}}, [
					createTag("img", {a: {src: "/static/images/icons/search.png", class: "search", alt: "search"}}),
					createTag("input", {a: {type: "text", class: "name", id: ilookupid, ref: credit}, s: {width: "150px"}}),
					createTag("input", {a: {type: "hidden", class: "id"}}),
					createTag("input", {a: {type: "hidden", class: "gid"}}),
				])));
				MBlookups.push(MB.Control.EntityAutocomplete({inputs: jQac}));
				MBlookups[MBlookups.length - 1].indexedSearch = false;
				target.querySelector("input.name").value = credit;
				jQac.bind("lookup-performed", function(event) {
					var remember = xhrForm.form.querySelector("fieldset.editnote label input.jesus2099remember[type='checkbox']");
					if (remember && remember.checked) {
						remember.click();
					}
					var name = this.querySelector("input.name");
					var gidv = this.querySelector("input.gid").value;
					var href = "/" + this.getAttribute("ref") + "/" + gidv;
					var rla = this.nextSibling;
					if (rla && rla.tagName == "A") {
						rla.setAttribute("href", href);
						replaceElement(document.createTextNode(name.value), rla.firstChild);
					} else {
						addAfter(createA(name.value, href, null, "_blank"), this).style.setProperty("white-space", "nowrap");
					}
				});
				if (ctype.length == 1 || c > 0) {
					jQac.bind("lookup-performed", function(event) {
						var name = this.querySelector("input.name");
						var gidv = this.querySelector("input.gid").value;
						var others = document.querySelectorAll("div#" + userjs + "wcs span.autocomplete");
						for (var ot = 0; ot < others.length; ot++) {
							if (
								!others[ot].classList.contains(userjs + "manu")
								&& others[ot].querySelector("input.name").getAttribute("ref") == name.getAttribute("ref")
								&& !others[ot].querySelector("input.name").classList.contains("lookup-performed")
							) {
								MBlookups[ot].options.select(document.createEvent("HTMLEvents"), {item: {name: name.value, id: this.querySelector("input.id").value, gid: gidv}});
							}
						}
					});
				}
				jQac.bind("cleared", function(event) {
					var acname = this.querySelector("input.name");
					acname.value = acname.getAttribute("ref");
					if (this.nextSibling.tagName == "A") {
						removeElement(this.nextSibling);
					}
				});
				for (var wap in ctype[c]) if (wap != "english" && ctype[c].hasOwnProperty(wap)) {
					target.appendChild(createTag("input", {a: {type: "hidden", name: wap, value: ctype[c][wap]}}));
				}
				target.appendChild(document.createTextNode(" "+credtype));
				target.appendChild(document.createElement("br"));
				i++;
			}
		}
	}
}
function getWorkCredits(credtypes, source, url) {
	var newParams = "", r = url.lastIndexOf("&rels.");
	if (r > -1) {
		r = url.substr(r).match(/&rels\.(\d+)\./);
	} else {
		r = 0;
	}
	if (r) {
		r = parseInt(r[1], 10) + 1;
	}
	for (var credtype in credtypes) if (credtypes.hasOwnProperty(credtype)) {
		var ctype = credtypes[credtype].type ? [credtypes[credtype]] : credtypes[credtype];
		for (var c = 0; c < ctype.length; c++) {
			var credit, credits = new RegExp("^" + credtype + "：([^\u00a0]+)(?:\u00a0（.+）)?$", "igm");
			while (credit = credits.exec(source)) {
				credit = credit[1].trim();
				if (credtypes[credtype].nomatch && credit.match(credtypes[credtype].nomatch)) {
					continue;
				}
				if (credtypes[credtype].match) {
					if (credit = credit.match(credtypes[credtype].match)) {
						credit = credit[1];
					} else {
						continue;
					}
				}
				newParams += "&rels." + r + ".target=" + encodeURIComponent(fullwidthToHalfwidth(credit)) + "&rels." + r + ".direction=backward";
				for (var wap in ctype[c]) if (!wap.match(/match$/) && ctype[c].hasOwnProperty(wap)) {
					newParams += "&rels." + r + "." + wap + "=" + ctype[c][wap];
				}
				r++;
			}
		}
	}
	return newParams;
}
function disable(w, dis) {
	var inputs = w.querySelectorAll("input, select, textarea, button");
	var len = inputs.length;
	if ((len) && len > 0) {
		for (var i = 0; i < len; i++) {
			if (dis) {
				inputs[i].setAttribute("disabled", "disabled");
			} else {
				inputs[i].removeAttribute("disabled");
			}
		}
		return true;
	} else {
		return false;
	}
}
function getExtLinks() {
	var el = document.querySelector("div#sidebar > ul.external_links");
	var sb, lu, lis;
	if (el) {
		var lis = el.getElementsByTagName("li");
		if (lis.length == 1 && lis[0].textContent.match(/has no url relationships/i)) {
			removeElement(lis[0]);
		}
	} else if (!el && (sb = document.querySelector("div#sidebar"))) {
		var lu = sb.querySelector("div#sidebar > p.lastupdate");
		if (lu) {
			lu = lu.previousSibling;
		} else {
			lu = sb.lastChild;
		}
		el = addAfter(createTag("ul", {a: {class: "external_links"}}), lu);
		addAfter(createTag("h2", {}, "External links"), lu);
	}
	return el;
}
/*bug I reported DSK-376978, opera adds a "; charset=accept-charset" to the POST Content-Type header: "Content-Type: application/x-www-form-urlencoded; charset=shift_jis"
workaround here, using multipart/form-data accepted by JASRAC (unlike GET)*/
function jasracSearch(type, query) {
	var formJASRAC = createTag("form", {a: {action: "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3", method: "post", "accept-charset": "Shift_JIS", enctype: "multipart/form-data"}, s: {display: "inline", background: background}});
	formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_DEFAULT_WORKS_KOUHO_MAX", value: "100"}}));
	formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_DEFAULT_WORKS_KOUHO_SEQ", value: "1"}}));
	switch (type) {
		case "title":
			if (!maybeJapanese(query)) {
				query = removeLeadingArticle(query).toLowerCase();
			}
			query = removeAccents(query);
			formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_WORKS_TITLE_NAME1", value: query}}));
			formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_WORKS_TITLE_CONDITION", value: "1"}}));//or
			formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_WORKS_TITLE_NAME2", value: halfwidthToFullwidth(query)}}));//full width name
			break;
	}
	formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "IN_DEFAULT_SEARCH_WORKS_NAIGAI", value: "0"}}));
	formJASRAC.appendChild(createTag("input", {a: {type: "hidden", name: "RESULT_CURRENT_PAGE", value: "1"}}));
	formJASRAC.appendChild(createCoolSubmit("JASRAC — " + query));
	return formJASRAC;
	
}
/*workaround here, using GET accepted by MINC (unlike multipart)*//*TOTO since minc is now utf-8, see what can be dumped here*/
function mincSearch(type, query) {
	var formMINC = createTag("form", {a: {action: "https://www.minc.gr.jp/db/SakCdInfo.aspx", method: "get", "accept-charset": "utf-8"}, s: {display: "inline", background: background}});
	formMINC.appendChild(createTag("input", {a: {type: "hidden", name: "DATATYPE", value: "2"}}));
	switch (type) {
		case "title":
			if (!maybeJapanese(query)) {
				query = removeLeadingArticle(query);
			}
			query = halfwidthToFullwidth(query.toUpperCase());
			formMINC.appendChild(createTag("input", {a: {type: "hidden", name: "GTITLE", value: query}}));
			formMINC.appendChild(createTag("input", {a: {type: "hidden", name: "SAKUSINM", value: ""}}));
			formMINC.appendChild(createTag("input", {a: {type: "hidden", name: "ARTNAME", value: ""}}));
			break;
	}
	formMINC.appendChild(createTag("input", {a: {type: "hidden", name: "SRCHTYPE", value: "2"}}));
	formMINC.appendChild(createCoolSubmit("音楽の森 — " + query));
	return formMINC;
	
}
function removeLeadingArticle(title) {
	return title.replace(/^((?:LA|LE|LES|UN|UNE|DES|A|AN|THE) |L\W)/i, "");
}
function removeAccents(title) {
	return title.replace(/[đ]/g, "d").replace(/[ñ]/g, "n").replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a").replace(/[ïîíìỉĩị]/g, "i").replace(/[úùủũụưứừửữựû]/g, "u").replace(/[éèẻẽẹêếềểễệ]/g, "e").replace(/[óòỏõọơớờởỡợôốồổỗộ]/g, "o").replace(/[ýỳỷỹỵ]/g, "y")
}
function swapTHE(n, swap) {
	return fullwidthToHalfwidth(n.replace(/^(.+)\s{2}(A|THE|UN|UNE|L)$/i, swap ? "$2 $1" : "$1, $2")).replace(/\w\(/g, " (").replace(/\)\w/g, ") ").trim();
}
function toCamelCase(s) {
	return s.toLowerCase().replace(/\b(.)/g, function($1) { return $1.toUpperCase(); });
}
function setType(type) {
	switch (type.toLowerCase()) {
		case vocal.toLowerCase():
			if (stypeid.value == 17) {
				stypeid.style.setProperty("background", cOK);
			} else {
				stypeid.style.setProperty("background", cWARN);
				stypeid.value = 17;
			}
			if (slangid.value != 486) {
				slangid.style.setProperty("background", cOK);
			} else {
				slangid.style.setProperty("background", cWARN);
				slangid.selectedIndex = 0;
			}
			break;
		case instrumental.toLowerCase():
			if (stypeid.selectedIndex == 0) {
				stypeid.style.setProperty("background", cOK);
			} else {
				stypeid.style.setProperty("background", cWARN);
				stypeid.selectedIndex = 0;
			}
			if (slangid.value == 486) {
				slangid.style.setProperty("background", cOK);
			} else {
				slangid.style.setProperty("background", cWARN);
				slangid.value = 486;
			}
			break;
	}
	stypeid.focus();
}
function workLookupURL(db, type, q) {
	switch (db) {
		case "mb": switch (type) {
			case "name": return "https://musicbrainz.org/search?type=work&limit=100&query=" + encodeURIComponent(q);
			case "code": return "https://musicbrainz.org/search?type=annotation&limit=100&method=advanced&query=type%3Awork+AND+text%3A" + q;
			case "iswc": return "https://musicbrainz.org/iswc/" + q;
		}
		case "jasrac": switch (type) {
			case "name": return "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3&IN_DEFAULT_WORKS_KOUHO_MAX=100&IN_DEFAULT_WORKS_KOUHO_SEQ=1&IN_WORKS_TITLE_NAME1=" + q + "&IN_DEFAULT_SEARCH_WORKS_NAIGAI=0&RESULT_CURRENT_PAGE=1";
			case "code": return "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=F20101&WORKS_CD=" + q.replace(/-/g, "") + "&subSessionID=001&subSession=start";
			case "iswc": return "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3&IN_DEFAULT_WORKS_KOUHO_MAX=100&IN_DEFAULT_WORKS_KOUHO_SEQ=1&IN_ISWC=" + q.replace(/ /, "+") + "&IN_DEFAULT_SEARCH_WORKS_NAIGAI=0&RESULT_CURRENT_PAGE=1";
		}
		case "minc": switch (type) {
			case "code": return "https://www.minc.gr.jp/db/SakCdInfo.aspx?SAKUHINCD=" + q.replace(/-/g, "");
		}
	}
}
function aliasTable(add, clear) {
	var alta = document.getElementById(userjs + "alta");
	if (!alta) {
		alta = addAfter(createTag("fieldset", {a: {class: userjs}}, [createTag("legend", {}, "Aliases"), createTag("p", {}, "You can add some aliases including (but not limited to) the default work sort-name and a latin search-hint. The JASRAC readings are almost always already cool. Sometimes you may fix few ツ→ッ but it’s rare. You can visually check the existing aliases."), createTag("table", {a: {id: userjs + "alta"}}, [
			createTag("thead", {}, createTag("tr", {}, [createTag("th", {}, "Name"), createTag("th", {}, "Sort name"), createTag("th", {}, "Type"), createTag("th", {}, "Locale"), createTag("th", {}, "Add?")])), 
			document.createElement("tfoot"), document.createElement("tbody")
		])]), xhrForm.form.querySelector("form > div > fieldset")).querySelector("table#" + userjs + "alta");
	}
	var aliases = add ? add : xhrWork.aliases;
	var cont = alta.getElementsByTagName(add ? "tfoot" : "tbody")[0];
	if (clear || !add) {
		var headr = createTag("tr", {}, createTag("th", {a: {colspan: 5}, s: {borderTop: "1px solid black", color: "#666"}}));
		if (clear) {
			removeChildren(cont);
			var th = cont.appendChild(headr).firstChild;
			th.appendChild(document.createTextNode("Alias suggestions ("));
			th.appendChild(createTag("a", {s: {cursor: "pointer"}, e: {click: function(event) {
				aliasTable([{name: ""}]);
			}}}, "add another alias"));
			th.appendChild(document.createTextNode(")"));
		} else if (!add) {
			cont.appendChild(headr).firstChild.appendChild(createA((aliases.length > 0 ? aliases.length : "no") + " existing aliase" + (aliases.length != 1 ? "s" : ""), "/work/" + xhrWork.mbid + "/aliases", "Work aliases page", "_blank"));
		}
	}
	for (var a = 0; a < aliases.length; a++) {
		var tr = cont.appendChild(document.createElement("tr"));
		if (!add && a%2 == 0) {
			tr.style.setProperty("background-color", "#f2f2f2");
		}
		var td = tr.appendChild(createTag("td", {}, add ? createTag("input", {a: {name: "edit-alias.name", value: aliases[a].name, title: aliases[a].name}, s: {width: "10em"}}) : aliases[a].name));
		if (add || aliases[a].name != aliases[a]["sort-name"]) {
			tr.appendChild(createTag("td", {}, add ? createTag("input", {a: {name: "edit-alias.sort_name", value: aliases[a]["sort-name"] ? aliases[a]["sort-name"] : ""}, s: {width: "10em"}}) : aliases[a]["sort-name"]));
		} else {
			td.setAttribute("colspan", "2");
		}
		var se = tr.appendChild(createTag("td", {}, add ? createTag("select", {a: {name: "edit-alias.type_id"}, s: {width: "8em"}, e: {change: function(event) {
			var inps = this.parentNode.parentNode.querySelectorAll("input:not(." + userjs + "addit)");
			for (var i = 0; i < inps.length; i++) {
				if (i < 2) {
					inps[i].value = (this.value == "1" && inps[2].value == "en" ? toCamelCase(inps[i].value) : inps[i].value.toUpperCase());
				}
				if (i > 0) {
					inps[i].disabled = this.value == "2" ? true : false;
				}
			}
		}}}, [createTag("option", {}, " "), createTag("option", {a: {value: "1"}}, "work name"), createTag("option", {a: {value: "2"}}, "search hint")]) : (aliases[a].type ? aliases[a].type.toLowerCase() : ""))).querySelector("select");
		td = tr.appendChild(createTag("td", {}, add ? createTag("input", {a: {name: "edit-alias.locale", value: (aliases[a].locale ? aliases[a].locale : "")}, s: {width: "3em"}, e: {keyup: function(event) {
			var lang = this.value.match(/^$|^en$/);
			if (lang && event.keyCode != 9) {
				var titles = this.parentNode.parentNode.querySelectorAll("input[name^='edit-alias.'][name$='name']");
				for (var t = 0; t < titles.length; t++) {
					titles[t].value = lang == "en" ? toCamelCase(titles[t].value) : titles[t].value.toUpperCase();
				}
			}
		}}}) : (aliases[a].locale ? aliases[a].locale : "")));
		if (add) {
			var cb = td.appendChild(createTag("input", {a: {name: "edit-alias.primary_for_locale", value: "1", type: "checkbox", title: "primary"}}));
			if (aliases[a].primary) {
				cb.checked = true;/*for display*/
				cb.setAttribute("checked", "checked");/*for reset*/
			}
		} else if (aliases[a].primary) {
			replaceElement(document.createTextNode("primary " + td.textContent), td.firstChild);
			td.setAttribute("title", "primary");
		}
		tr.appendChild(createTag("td", {}, add ? createTag("input", {a: {type: "checkbox", title: "add this work alias?", class: userjs + "addit"}}) : ""));
		if (se) {/*se is the work type <select>*/
			if (aliases[a].type) {
				se.value = aliases[a].type;
				sendEvent(se, "change");
				se.querySelector("option[value='" + aliases[a].type + "']").setAttribute("selected", "selected");/*for reset*/
			}
			se.addEventListener("change", function(event) {
				var addit = this.parentNode.parentNode.querySelector("input." + userjs + "addit");
				if (!addit.checked) {
					addit.click();
				}
				if (this.value == "1") {
					this.parentNode.nextSibling.firstChild.focus();
				}
			}, false);
			xhrForm.form.addEventListener("reset", function(event) {
				var ops = document.querySelectorAll("#" + userjs + "alta select option[selected]");
				for (var o = 0; o < ops.length; o++) {
					ops[o].parentNode.value = ops[o].value;
					sendEvent(ops[o].parentNode, "change");
				}
			}, false);
			if (!xhrWork.edit && a < 2 && !(aliases[a].type == "2" && aliases[a].name == iname.value)) {
				getParent(se, "tr").querySelector("input." + userjs + "addit[type='checkbox']").click();
			}
			var wname = tr.querySelector("input[name='edit-alias.name']");
			var wsname = tr.querySelector("input[name='edit-alias.sort_name']");
			var wnameaddit = tr.querySelector("input."+userjs+"addit[type='checkbox']");
			if (clear && a == 0 && aliases[a].type == "1") {
				if (wname) {
					iname.addEventListener("keyup", function(event) {
						var wname = document.querySelector("table#" + userjs + "alta > tfoot > tr > td > input[name='edit-alias.name']");
						var wnameaddit = document.querySelector("table#" + userjs + "alta > tfoot > tr > td > input." + userjs + "addit[type='checkbox']");
						if (wname) {
							if (this.value != wname.value && wnameaddit && wnameaddit.checked) {
								wnameaddit.click();
							}
							wname.value = this.value;
						}
					}, false);
					wname.setAttribute("title", "work name is always used here");
					wname.setAttribute("readonly", "readonly");
				}
				addAfter(document.createTextNode(se.options[se.selectedIndex].textContent), se);
				replaceElement(createTag("input", {a: {type: "hidden", name: se.getAttribute("name"), value: se.value}}), se);
			} else if (!clear && add) {
				wname.focus();
				wnameaddit.click();
			}
			if (wname && wsname) {
				wname.setAttribute("ref", wname.value);
				wname.addEventListener("focus", function(event) {
					this.setAttribute("ref", this.value);
				}, false);
				wname.addEventListener("keyup", function(event) {
					var wsname = this.parentNode.nextSibling.firstChild;
					if (wsname.value == this.getAttribute("ref")) {
						wsname.value = this.value;
					}
					this.setAttribute("ref", this.value);
				}, false);
				if (wsname.value.length > 0) {
					wsname.setAttribute("title", wsname.value + (wsname.value==wname.value ? "\n(=name)" : ""));
				}
			}
			if (aliases.length == 1 && aliases[a].name == "" && !wnameaddit.checked) {
				/*OMG I’M LOST*/
				wnameaddit.click();
			}
		}
	}
	return alta;
}
function createA(text, link, title, tgt) {
	var a = document.createElement("a");
	a.style.setProperty("background", background);
	a.setAttribute("target", tgt || "_self");
	if (typeof link == "string") {
		a.setAttribute("href", link);
	} else {
		a.style.setProperty("cursor", "pointer");
		a.addEventListener("click", link, false);
	}
	if (title) {
		a.setAttribute("title", title);
	}
	a.appendChild(document.createTextNode(text));
	return a;
}
function createCoolSubmit(txt) {
	var a = createA(txt, function(event) {
		if (event.button == 0) {
			/*lame browsers;)*/
			if (typeof opera == "undefined") {
				if (event.shiftKey) {
					this.parentNode.setAttribute("target", "_blank");
				} else if (event.ctrlKey) {
					this.parentNode.setAttribute("target", weirdobg());
				}
			}
			this.parentNode.submit();
		}
	});
	a.addEventListener("mousedown", function (event) {
		event.preventDefault();
		if (event.button == 1) {
			this.parentNode.setAttribute("target", weirdobg());
			this.parentNode.submit();
		}
	}, false);
	return a;
}
function weirdobg() {
	var weirdo = userjs + (new Date().getTime());
	try {
		self.open("", weirdo).blur();
	} catch(e) {}
	self.focus();
	return weirdo;
}
function createButtor(type) {
	return createTag("input", {a: {type: "button", value: type.charAt(0).toUpperCase(), title: type, tabindex: "-1", class: "styled-button"}, s: {width: "10px", padding: "1px 8px"}, e: {click: function(event) {
		setType(this.getAttribute("title"));
	}}});
}
function createButtol(txt, val) {
	return createTag("input", {a: {type: "button", value: txt, title: val, tabindex: "-1", class: "styled-button"}, s: {width: "10px", padding: "1px 8px", float: "none"}, e: {click: function(event) {
		var slang;
		var title = this.getAttribute("title");
		if (title && title.length > 0 && (slang = getSibling(this.parentNode, "select", null, true))) {
			slang.value = this.getAttribute("title");
			slang.focus();
		}
	}}});
}
function isAutoEdit() {
	var ae = xhrForm.form.querySelector("div.auto-editor > input[type='checkbox'][name='edit-work.as_auto_editor']");
	return (ae && ae.checked);
}
function insertBefore(newSibling, element) {
	if (newSibling && element && element.parentNode) {
		return element.parentNode.insertBefore(newSibling, element);
	} else {
		return null;
	}
}
function fixSTR(s) {
	return s.replace(/(^|◇)[＊*]/g, "$1").replace(/～/g, "〜");
}
function fullwidthToHalfwidth(s) {
	return s.replace(/[！-｝]/g, function(a) {
		return String.fromCharCode(a.charCodeAt(0) - 65248);
	}).replace(/\u3000/g, "\u0020").replace(/～/g, "〜");
}
function halfwidthToFullwidth(s) {
	return s.replace(/[!-}]/g, function(a) {
		return String.fromCharCode(a.charCodeAt(0) + 65248);
	}).replace(/\u0020/g, "\u3000");
}
function maybeJapanese(text) {
	return fullwidthToHalfwidth(text).match(/[ぁ-\uFFFF]/);
}
function xhrMachine(_job) {
	var job;
	if (_job) {
		job = _job;
	} else {
		if (joblist.length > 0) {
			job = xhrJobs[joblist.shift()];
		} else if (xhrWork.mbid) {
			self.location.href = "/work/" + xhrWork.mbid;
			return;
		} else {
			alert("MAXI ERROR NO MBID (OMG BBQ WTF?)\nMaybe reload everything and try again…");
			disable(xhrForm.form, false);
			return;
		}
	}
	var xhr = new XMLHttpRequest();
	var async = (typeof job.async=="boolean" ? job.async : true);
	if (job.onreadystatechange) {
		xhr.onreadystatechange = job.onreadystatechange;
	}
	if (job.onload) {
		xhr.onload = job.onload;
	} else if (!async) {
		xhr.onload = function(event) {
			xhrMachine();
		};
		async = true;
	}
	if (job.onerror) {
		xhr.onerror = job.onerror;
	}
	if (job.init) {
		job.init(xhr);
	}
	if (!job.ninja) {
		document.title = "⌛ " + (job.info ? job.info : "loading");
	}
	if (h1) {
		if (h1.textContent.trim().match(/add work/i)) {
			removeChildren(h1);
		}
		h1.appendChild(createTag("div", {}, " " + document.title.replace(/ /g, "\u00a0")));
	}
	xhr.open(job.method ? job.method : "get", job.url, async);
	if (job.params) {
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}
	if (DEBUG) console.log(job.info + "\n" + job.url + "\n" + (job.params ? job.params.replace(/&/g, "\n") : ""));
	xhr.send(job.params);
	if (!async) {
		xhrMachine();
	}
}
function removeElement(element) {
	return element.parentNode.removeChild(element);
}
function replaceElement(newElement, oldElement) {
	return oldElement.parentNode.replaceChild(newElement, oldElement);
}
