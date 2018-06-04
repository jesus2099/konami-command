"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         mb. SUPER MIND CONTROL Ⅱ X TURBO
// @version      2018.6.4
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
// @description  musicbrainz.org power-ups (mbsandbox.org too): RELEASE_CLONER. copy/paste releases / DOUBLE_CLICK_SUBMIT / CONTROL_ENTER_SUBMIT / RELEASE_EDITOR_PROTECTOR. prevent accidental cancel by better tab key navigation / TRACKLIST_TOOLS. search→replace, track length parser, remove recording relationships, set selected works date / LAST_SEEN_EDIT. handy for subscribed entities / COOL_SEARCH_LINKS / COPY_TOC / ROW_HIGHLIGHTER / SPOT_CAA / SPOT_AC / RECORDING_LENGTH_COLUMN / RELEASE_EVENT_COLUMN / WARN_NEW_WINDOW / SERVER_SWITCH / TAG_TOOLS / USER_STATS / CHECK_ALL_SUBSCRIPTIONS / EASY_DATE. paste full dates in one go / STATIC_MENU / SLOW_DOWN_RETRY / CENTER_FLAGS / RATINGS_ON_TOP / HIDE_RATINGS / UNLINK_ENTITY_HEADER / MARK_PENDING_EDIT_MEDIUMS
// @homepage     https://github.com/jesus2099/konami-command/blob/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.md
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SUPER-MIND-CONTROL-II-X-TURBO
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
// @author       PATATE12
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0+; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2010-09-09
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match         *://*.mbsandbox.org/*
// @match         *://*.musicbrainz.org/*
// @exclude      *://blog.musicbrainz.org/*
// @exclude      *://bugs.musicbrainz.org/*
// @exclude      *://chatlogs.musicbrainz.org/*
// @exclude      *://forums.musicbrainz.org/*
// @exclude      *://geordi.musicbrainz.org/*
// @exclude      *://musicbrainz.org/ws/*
// @exclude      *://tickets.musicbrainz.org/*
// @exclude      *://wiki.musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
}};
if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
	var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
	while ((kv = row.exec(meta.rawmdb)) !== null) {
		if (meta[kv[1]]) {
			if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
			meta[kv[1]].push(kv[2]);
		} else meta[kv[1]] = kv[2];
	}
}
meta.name = meta.name.substr(4).replace(/\s/g, "\u00a0");
meta.icon = createTag("img", {a: {src: meta.icon}, s: {verticalAlign: "middle", margin: "-8px 0"}});
var debugBuffer = "";
var DEBUG = localStorage.getItem("jesus2099debug");
var pageType = self.location.pathname.match(/(area(?!.+(artists|labels|releases|places|aliases|edits))|artist(?!.+(releases|recordings|works|relationships|aliases|edits))|artists|event|labels|releases|recordings|report|series|track|works|aliases|cdtoc|collection(?!s|.+edits)|collections|edit(?!s|\/subscribed)|edits|votes|edit\/subscribed|isrc|label(?!.+edits)|place(?!.+(aliases|edits))|puid|ratings|recording(?!s|.+edits)|relationships|release[-_]group(?!.+edits)|release(?!s|-group|.+edits)|search(?!\/edits)|tracklist|tag|url|work(?!s))/);
if (pageType) {
	pageType = pageType[1].replace(/edit\/subscribed|votes/, "edits").replace(/_/, "-");
} else {
	pageType = "other";
}
debug("Page type: " + pageType);
var chrome = "Please run “" + meta.name + "” with Tampermonkey instead of plain Chrome.";
var userjs = "jesus2099userjs85790"/*have to keep this for legacy saved settings*/;
var KEYCODES = {
	ENTER:           0x0D,
	C:               0x43,
	M:               0x4D,
	O:               0x4F,
	S:               0x53,
	"NUMPAD-ZERO":   0x60,
	"NUMPAD-NINE":   0x69,
	"NUMPAD-MINUS":  0x6D,
	"NUMPAD-DOT":    0x6E,
	"NUMPAD-DIVIDE": 0x6F,
};
var MBS = self.location.protocol + "//" + self.location.host;
var lang = document.querySelector("html[lang]");
lang = lang && lang.getAttribute("lang") || "en-GB";
var sidebar = document.getElementById("sidebar");
var stre_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var re_GUID = new RegExp(stre_GUID);
var re_date = {
	YYYY: "([0-2]\\d{3})",
	YY: "(\\d{2})",
	MM: "(0(?:1|2|3|4|5|6|7|8|9)|10|11|12)",
	M: "(1|2|3|4|5|6|7|8|9|10|11|12)",
	DD: "(0(?:1|2|3|4|5|6|7|8|9)|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)",
	D: "(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)",
};
re_date.ISO = "(" + re_date.YYYY + "(?:-" + re_date.MM + "(?:-" + re_date.DD + ")?)?)";
var account = document.querySelector("div.header ul.menu li.account");
if (account) {
	var a = account.querySelector("a[href^='/user/']");
	account = {
		item: account,
		name: unescape(a.getAttribute("href").match(/[^/]+$/)),
		pathname: a.getAttribute("href"),
		menu: account.querySelector("ul")
	};
}
/*==========================================================================
## CONFIGURATORZ ##
find this script settings in MB "About" menu
==========================================================================*/
var j2superturbo = {
	menu: {
		expl: " (you can find this in “%editing%” menu)",
		addItem: function(item) {
			item.addEventListener("click", function(event) { this.parentNode.parentNode.style.removeProperty("left"); });
			j2superturbo.menu.lastItem = addAfter(createTag("li", {a: {class: "jesus2099"}, s: {textShadow: "0 0 8px purple"}}, item), j2superturbo.menu.getLastItem());
		},
		getLastItem: function() {
			if (j2superturbo.menu.lastItem) return j2superturbo.menu.lastItem;
			else {
				var head, MBmenu = document.querySelector("div.header ul.menu li.editing > ul") || document.querySelector("div.header ul.menu li.about > ul");
				if (MBmenu && (head = MBmenu.parentNode.querySelector("span.menu-header"))) {
					j2superturbo.menu.expl = j2superturbo.menu.expl.replace(/%editing%/, head.textContent);
					j2superturbo.menu.lastItem = MBmenu.appendChild(createTag("li", {a: {class: "jesus2099 separator"}}));
					head.style.setProperty("text-shadow", "0 0 8px purple");
					return j2superturbo.menu.lastItem;
				} else if (document.querySelector("div.header ul.menu")) bug({message: "Can’t add menu", report: true});
			}
		}
	},
	addCSSRule: function(CSSRule) {
		j2superturbo.css.insertRule(CSSRule, j2superturbo.css.cssRules.length);
	}
};
j2superturbo.css = document.createElement("style");
j2superturbo.css.setAttribute("type", "text/css");
document.head.appendChild(j2superturbo.css);
j2superturbo.css = j2superturbo.css.sheet;
var j2sets = {}, j2docs = {}, j2defs = {}, j2setsclean = [];
j2setting();
j2superturbo.menu.addItem(createTag("a", {a: {title: "settings:\n" + meta.description.replace(/^[^:]+: /, "").replace(/ \/ /g, "\n")}, e: {click: function(event) {
	var j2setsdiv = document.getElementById(userjs + "j2sets");
	if (!j2setsdiv) {
		j2setting();
		if (j2sets) {
			j2setsdiv = document.body.insertBefore(createTag("div", {a: {id: userjs + "j2sets"}, s: {backgroundColor: "silver", border: "2px outset white", padding: "1em"}}, [
				createTag("p", {s: {textAlign: "right", margin: "0px"}}, [
					createTag("a", {a: {href: meta.homepage, target: "_blank"}}, "HELP"),
					" | ",
					createTag("a", {a: {href: meta.supportURL, target: "_blank"}}, "known issues"),
					" | ",
					createTag("a", {e: {click: function(event) { if(confirm("RESET ALL YOUR SETTINGS TO DEFAULT?")) { localStorage.removeItem(userjs + "settings"); self.location.reload(); } }}}, "RESET"),
					" | ",
					createTag("a", {e: {click: function(event) { removeNode(document.getElementById(userjs + "j2sets")); }}}, "CLOSE"),
				]),
				createTag("h4", {s: {textShadow: "0 0 8px white", fontSize: "1.5em", marginTop: "0px"}}, ["██ ", createTag("a", {a: {href: meta.namespace, target: "_blank"}}, meta.name), " (" + meta.version + ")"]), createTag("p", {}, ["All settings are instantly saved but require a ", createTag("a", {e: {click: function() { self.location.reload(); }}}, "PAGE RELOAD"), " to see the effect."])
			]), document.getElementById("page"));
			var alphakeys = [];
			for (var s in j2sets) if (j2sets.hasOwnProperty(s)) {
				if (j2setsclean.indexOf(s) < 0) { delete j2sets[s]; }
				else if (!s.match(/!/)) { alphakeys.push(s); }
			}
			alphakeys.sort();
			var table = j2setsdiv.appendChild(createTag("table", {a: {border: "2", cellpadding: "4", cellspacing: "1"}}));
			table.appendChild(createTag("thead", {}, [createTag("th", {}, "setting"), createTag("th", {}, "default setting"), createTag("th", {}, "description")]));
			table = table.appendChild(document.createElement("tbody"));
			for (var a = 0; a < alphakeys.length; a++) {
				var tr = table.appendChild(document.createElement("tr"));
				tr.appendChild(createTag("th", {s: {backgroundColor: "#ccc", textAlign: "left", paddingLeft: alphakeys[a].match(/[a-z]/) ? "2em" : "inherit"}}, j2settinput(alphakeys[a])));
				tr.appendChild(createTag("td", {s: {opacity: ".666", textAlign: "center"}}, typeof j2defs[alphakeys[a]] == "boolean" ? (j2defs[alphakeys[a]] ? "☑" : "☐") : j2defs[alphakeys[a]]));
				tr.appendChild(createTag("td", {s: {marginBottom: ".4em"}}, j2docit(j2docs[alphakeys[a]]).concat([" — ", createTag("a", {a: {href: meta.homepage + "#" + alphakeys[a].toLowerCase(), target: "_blank"}}, "more help…")])));
			}
		}
	}
	j2setsdiv.scrollIntoView();
}}}, [meta.icon.cloneNode(false), " " + meta.name + " (" + meta.version + ")"]));
function bug(error) {
	var title = "", alrt = meta.name + " (" + meta.version + ")" + " ERROR";
	if (error.module) {
		title = " in “" + error.module + "” module";
		alrt += title;
	}
	if (error.message) {
		title = error.message + title;
		alrt += "\n\n" + error.message;
	}
	if (error.report && title) {
		if (confirm(alrt + "\n\nDo you want to report the bug?\n(requires github account)\n(will open in a NEW WINDOW)")) {
			self.open("https://github.com/jesus2099/konami-command/issues/new?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent("Hello,\nI am using that awesome *" + meta.name + "* (**" + meta.version + "**).\nI got an error while I was on [" + (document.title ? document.title : "that page") + "](" + self.location.href + "):\n\n    " + error.message.replace(/\n/g, "\n    ")));
		}
	} else {
		alert(alrt);
	}
}
function j2setting(set, val, def, doc) {
	if (set == null) { j2sets = localStorage.getItem(userjs + "settings"); if (j2sets) { j2sets = JSON.parse(j2sets); } else { j2sets = {}; } }
	else {
		if (doc) { j2docs[set] = doc; }
		if (def) {
			j2defs[set] = val;
			j2setsclean.push(set);
		}
		if (val != null && (!def || j2sets[set] == null)) {
			j2sets[set] = val;
			localStorage.setItem(userjs + "settings", JSON.stringify(j2sets));
		} else if (set) {
			return j2sets[set];
		}
	}
}
function j2settinput(set) {
	var val = j2setting(set);
	var rnd = (Math.random() + "").substring(2);
	var lbl = createTag("label", {a: {"for": userjs + enttype + set + rnd}, s: {whiteSpace: "nowrap", textShadow: "1px 1px 2px #999"}}, createTag("input", {a: {type: "checkbox", id: userjs + enttype + set + rnd, class: set}, e: {change: function(event) {
		j2setting(this.className, this.getAttribute("type") == "checkbox" ? this.checked : this.value);
	}}}));
	var inp = lbl.querySelector("input");
	switch (typeof val) {
		case "boolean":
			addAfter(document.createTextNode(set), inp);
			inp.setAttribute("type", "checkbox");
			inp.checked = val;
			break;
		default:
			lbl.insertBefore(document.createTextNode("\u00a0_\u00a0 " + set), inp);
			inp.setAttribute("type", "text");
			inp.setAttribute("value", val);
			inp.style.setProperty("margin-left", "4px");
			inp.addEventListener("keypress", function(event) { if(event.keyCode == KEYCODES.ENTER) { this.blur(); removeNode(getParent(this, "div")) } }, false);
			break;
	}
	return lbl;
}
function j2docit(txt) {
	var jira = txt.match(/\b(MBS-\d+)\b/);
	if (jira) {
		var arr = txt.split(jira[1]);
		arr.splice(1, 0, createTag("a", {a: {href: "http://tickets.musicbrainz.org/browse/" + jira[1].toUpperCase(), target: "_blank", title: "opens in new window"}}, jira[1]));
		return arr;
	}
	else return [txt];
}
/*==================================================================== LINK+
## RELEASE_CLONER ##
todo : add debugged clone release-AR module
==========================================================================*/
j2setting("RELEASE_CLONER", true, true, "one-click duplicate release(s)" + j2superturbo.menu.expl);
j2setting("RELEASE_CLONER_release_event", false, true, "clones release event(s), package, catalogue number(s), etc. (not advised as those usually change for each edition)");
j2setting("RELEASE_CLONER_additional_information", false, true, "clones annotation and disambiguation (usually change for each edition)");
j2setting("RELEASE_CLONER_external_links", false, true, "(EXPERIMENTAL) clones URL relations (not advised as those usually change for each edition)");
j2setting("RELEASE_CLONER_tracktimes", false, true, "clones track times (mastering sometimes change for some edition)");
if (j2sets.RELEASE_CLONER && account) {
	var rcwhere = self.location.pathname.match(new RegExp("^/((release(?!-group)|release-group|label)/" + stre_GUID + ")|artist/" + stre_GUID + "/(releases)$"));
	if (
		rcwhere && (rcwhere = rcwhere[2] ? rcwhere[2] : rcwhere[3])
	) {
		if (account) {
			debug("RELEASE_CLONER");
			j2superturbo.menu.addItem(createTag("a", {a: {title: meta.name + "\nshift+click to open new tab / ctrl+click for background tab" + (rcwhere != "release" ? "\nno need to select if there is only one release on this page" : "")}, e: {click: function(clickEvent) {
				var crmbids = [];
				if (rcwhere == "release") {
					crmbids.push("" + self.location.pathname.match(re_GUID));
				}
				else {
					var checkrels = document.querySelectorAll("table.tbl > tbody input[type='checkbox'][name='add-to-merge']");
					for (var crmbid, cr = 0; cr < checkrels.length; cr++) {
						if ((checkrels[cr].checked || checkrels.length == 1) && (crmbid = getParent(checkrels[cr], "tr")) && (crmbid = crmbid.querySelector("a[href*='/release/']").getAttribute("href").match(re_GUID))) {
							crmbids.push("" + crmbid);
						}
					}
				}
				if (crmbids.length > 0) {
					if (confirm("This will (you can change the settings):\n\n* " + (j2sets.RELEASE_CLONER_release_event ? "" : "NOT ") + "copy release events\n* " + (j2sets.RELEASE_CLONER_additional_information ? "" : "NOT ") + "copy additional information\n* " + (j2sets.RELEASE_CLONER_external_links ? "" : "NOT ") + "copy external links\n* " + (j2sets.RELEASE_CLONER_tracktimes ? "" : "NOT ") + "copy track times")) {
						for (var crr = crmbids.length - 1; crr >= 0; crr--) {
							var xhr = new XMLHttpRequest();
							xhr.onload = function(loadEvent) {
								var release = JSON.parse(this.responseText);
								var reled = {
									form: createTag("form", {a: {action: "/release/add", method: "post", target: formTarget(crr, clickEvent)}, s: {display: "none"}}),
									add: function(data, requestParameter, required) {
										if (data) {
											/*console.log(requestParameter + " = " + data);*/
											reled.form.appendChild(createTag("textarea", {a: {name: requestParameter}}, data));
										} else if (required) {
											return false;
										}
										return true;
									}
								};
								var ok = true;
								ok &= reled.add(release.title, "name", true);
								ok &= reled.add(release["release-group"].id, "release_group");
								if (j2sets.RELEASE_CLONER_additional_information) {
									ok &= reled.add(release.disambiguation, "comment");
									ok &= reled.add(release.annotation, "annotation");
								}
								if (j2sets.RELEASE_CLONER_release_event) {
									ok &= reled.add(release.barcode, "barcode");
									/* ws:release-event-list */
									if (release["release-events"]) for (var resi = 0; resi < release["release-events"].length && ok; resi++) {
										var date = release["release-events"][resi].date;
										if (date) {
											var datex;
											if (datex = date.match(/^(\d{4})/)) ok &= reled.add(datex[1], "events." + resi + ".date.year");
											if (datex = date.match(/^.{4}-(\d{2})/)) ok &= reled.add(datex[1], "events." + resi + ".date.month");
											if (datex = date.match(/^.{4}-.{2}-(\d{2})$/)) ok &= reled.add(datex[1], "events." + resi + ".date.day");
											if (release["release-events"][resi].area && release["release-events"][resi].area["iso-3166-1-codes"] && release["release-events"][resi].area["iso-3166-1-codes"].length > 0) ok &= reled.add(release["release-events"][resi].area["iso-3166-1-codes"][0], "events." + resi + ".country");
										}
									}
									/* ws:release-event-list */
									ok &= reled.add(release.status, "status");
									ok &= reled.add(release.packaging, "packaging");
									/* ws:label-info-list */
									for (var resi = 0; resi < release["label-info"].length && ok; resi++) {
										if (release["label-info"][resi].label) ok &= reled.add(release["label-info"][resi].label.id, "labels." + resi + ".mbid");
										ok &= reled.add(release["label-info"][resi]["catalog-number"], "labels." + resi + ".catalog_number");
									}
									/* ws:label-info-list */
								}
								ok &= reled.add(release["text-representation"].language, "language");
								ok &= reled.add(release["text-representation"].script, "script");
								/* ws:artist-credit */
								for (var resi = 0; resi < release["artist-credit"].length && ok; resi++) {
									ok &= reled.add(release["artist-credit"][resi].artist.id, "artist_credit.names." + resi + ".mbid");
									ok &= reled.add(release["artist-credit"][resi].name, "artist_credit.names." + resi + ".name");
									ok &= reled.add(release["artist-credit"][resi].joinphrase, "artist_credit.names." + resi + ".join_phrase");
								}
								/* ws:artist-credit */
								/* ws:medium-list */
								for (var resi = 0; resi < release.media.length && ok; resi++) {
									ok &= reled.add(release.media[resi].format, "mediums." + resi + ".format");
									ok &= reled.add(release.media[resi].title, "mediums." + resi + ".name");
									for (var tr = 0; tr < release.media[resi].tracks.length; tr++) {
										ok &= reled.add(release.media[resi].tracks[tr].title, "mediums." + resi + ".track." + tr + ".name");
										ok &= reled.add(release.media[resi].tracks[tr].number, "mediums." + resi + ".track." + tr + ".number");
										ok &= reled.add(release.media[resi].tracks[tr].recording.id, "mediums." + resi + ".track." + tr + ".recording");
										/* ws:artist-credit */
										for (var aci = 0; aci < release.media[resi].tracks[tr]["artist-credit"].length && ok; aci++) {
											ok &= reled.add(release.media[resi].tracks[tr]["artist-credit"][aci].artist.id, "mediums." + resi + ".track." + tr + ".artist_credit.names." + aci + ".mbid");
											ok &= reled.add(release.media[resi].tracks[tr]["artist-credit"][aci].name, "mediums." + resi + ".track." + tr + ".artist_credit.names." + aci + ".name");
											ok &= reled.add(release.media[resi].tracks[tr]["artist-credit"][aci].joinphrase, "mediums." + resi + ".track." + tr + ".artist_credit.names." + aci + ".join_phrase");
										}
										/* ws:artist-credit */
										if (j2sets.RELEASE_CLONER_tracktimes) ok &= reled.add(release.media[resi].tracks[tr].length, "mediums." + resi + ".track." + tr + ".length");
									}
								}
								/* ws:medium-list */
								if (j2sets.RELEASE_CLONER_external_links) {
									/* ws:url-rels*/
									var linkTypes = {
										"unknown29unknown29unknown29unknown29":  29/*notes*/,
										"unknown72unknown72unknown72unknown72":  72/*production*/,
										"unknown73unknown73unknown73unknown73":  73/*get*/,
										"98e08c20-8402-4163-8970-53504bb6a1e4":  74/*buy download*/,
										"9896ecd0-6d29-482d-a21e-bd5d1b5e3425":  75/*download*/,
										"4a78823c-1c53-4176-a5f3-58026c76f2bc":  76/*discogs*/,
										"4f2e710d-166c-480c-a293-2e2c8d658d87":  77/*ASIN*/,
										"2476be45-3090-43b3-a948-a8f972b4065c":  78/*cover art*/,
										"3ee51e05-a06a-415e-b40c-b3f740dedfd7":  79/*buy mail*/,
										"c74dee45-3c85-41e9-a804-92ab1c654446":  82/*other db*/,
										"7387c5a2-9abe-4515-b667-9eb5ed4dd4ce":  83/*IMDb*/,
										"08445ccf-7b99-4438-9f9a-fb9ac18099ee":  85/*stream*/,
										"6af0134a-df6a-425a-96e2-895f9cd342ba":  86/*VGMdb*/,
										"823656dd-0309-4247-b282-b92d287d59c5": 288/*discography*/,
										"004bd0c3-8a45-4309-ba52-fa99f3aa3d50": 301/*licence*/,
										"0e555925-1b7d-475c-9b25-b9c349dcc3f3": 308/*2ndhandsong*/,
										"2d24d075-9943-4c4d-a659-8ce52e6e6b57": 729/*notes*/,
										"90ff18ad-3e9d-4472-a3d1-71d4df7e8484": 755/*allmusic*/,
										"63b84620-ba52-4630-9bfe-8ad3b5504dff": 850/*bookbrainz*/,
									};
									for (var resi = 0; resi < release.relations.length && ok; resi++) {
										if (release.relations[resi].url) {
											ok &= reled.add(linkTypes[release.relations[resi]["type-id"]], "urls." + resi + ".link_type");
											ok &= reled.add(release.relations[resi].url.resource, "urls." + resi + ".url");
										}
									}
									/* ws:url-rels */
								}
								ok &= reled.add("\n —\n" + MBS + "/release/" + crmbids[crr] + " cloned using " + meta.name + "’s '''RELEASE_CLONER''' (" + meta.version + ")", "edit_note");
								/* fin */
								if (ok) document.body.appendChild(reled.form).submit();
								else sendEvent(this, "error");
							};
							xhr.onerror = function(errorEvent) {
								if (confirm("RELEASE_CLONER ERROR MY GOD\nDo you want to report this error? (in a new window)")) {
									self.open("https://github.com/jesus2099/konami-command/issues/new?title=RELEASE_CLONER+xhr+error&body=" + encodeURIComponent("Hello,\nI am using *" + meta.name + "* version **" + meta.version + "**.\nI got an error while cloning [this release](" + MBS + "/release/) on [that page](" + self.location.href + ").\n"));
								}
							};
							xhr.open("get", MBS + "/ws/2/release/" + crmbids[crr] + "?inc=artists+labels+recordings+release-groups+media+artist-credits+annotation+url-rels&fmt=json", false);
							xhr.send(null);
						}
					}
				} else {
					alert("Please select at least one release.");
				}
			}}}, [meta.icon.cloneNode(false), " Clone " + (rcwhere == "release" ? "release" : "selected releases") + " ", createTag("small", {s: {color: "grey"}}, "← RELEASE_CLONER™")]));
		}
	}
}
function formTarget(releaseIndex, event) {
	var target = "_self";
	if (event.ctrlKey || releaseIndex > 0) {
		target = userjs + (new Date().getTime());
		try {
			self.open("", target).blur();
		} catch(e) {}
		self.focus();
	} else if (event.shiftKey) {
		target = "_blank";
	}
	return target;
}
/*================================================================= DISPLAY+
## USER_STATS ##
==========================================================================*/
j2setting("USER_STATS", true, true, "adds convenient edit stats to user page (percentage of yes/no voted edits)");
if (j2sets.USER_STATS && self.location.pathname.match(/^\/user\/[^/]+$/)) {
	var stats = document.querySelectorAll("table.statistics > tbody > tr > td:last-child");
	var editorPathname = self.location.pathname.lastIndexOf("/") + 1;
	editorPathname = self.location.pathname.substr(editorPathname);
	if (!isEncoded(editorPathname)) {
		// Opera 12 alone is surprisingly decoding location.pathname
		editorPathname = encodeURIComponent(editorPathname);
	}
	editorPathname = self.location.pathname.substr(0, editorPathname) + editorPathname;
	if (stats.length > 0) {
		debug("USER_STATS");
		var accepted = readStat(stats, 0);
		var autoedits = readStat(stats, 1);
		var voteddown = readStat(stats, 2);
		var failed = readStat(stats, 3);
		var open = readStat(stats, 4);
		var cancelled = readStat(stats, 5);
		var total = accepted + voteddown;
		writeStat(stats, 0, accepted, total);
		writeStat(stats, 2, voteddown, total);
		stats[2].parentNode.parentNode.insertBefore(
			createTag("tr", null, [
				createTag("th", null, createTag("a", {a: {href: "/statistics/editors", title: "see editor rankings"}, s: {cursor: "help"}}, "Ranked total")),
				createTag("th", null, (0 + accepted + autoedits).toLocaleString(lang))
			]),
			stats[2].parentNode
		);
		stats[6].parentNode.parentNode.insertBefore(
			createTag("tr", null, [
				createTag("th", null, "Total"),
				createTag("th", null, createTag("a", {a: {href: editorPathname + "/edits"}}, (0 + accepted + autoedits + voteddown + failed + open + cancelled).toLocaleString(lang)))
			]),
			stats[6].parentNode
		);
		var refined24hSearch = stats[6].getElementsByTagName("a")[0].getAttribute("href");
		var voteSearch = "https://musicbrainz.org/search/edits?conditions.0.field=voter&conditions.0.operator=%3D&conditions.0.name=%editorName%&conditions.0.voter_id=%editorID%&conditions.0.args=%vote%";
		voteSearch = voteSearch.replace(/%editorName%/, editorPathname);
		voteSearch = voteSearch.replace(/%editorID%/, refined24hSearch.match(/conditions\.0\.args\.0=(\d+)/)[1]);
		for (var i = 7; i < stats.length; i++) {
			var vote = stats[i];
			vote.replaceChild(createTag("a", {a: {href: voteSearch.replace(/%vote%/, {7: 1, 8: 0, 9: -1, 10: 2}[i])}}, [vote.firstChild.cloneNode(true)]), vote.firstChild);
		}
		var yes = readStat(stats, 7);
		var no = readStat(stats, 8);
		var abstain = readStat(stats, 9);
		var approve = stats.length > 10 ? readStat(stats, 10) : 0;
		stats[9].parentNode.parentNode.insertBefore(
			createTag("tr", null, [
				createTag("th", null, [createTag("a", {a: {href: "/statistics/editors", title: "see editor rankings"}, s: {cursor: "help"}}, "Theoritical ranked total"), " (", createTag("a", {a: {href: "//tickets.metabrainz.org/browse/MBS-9651", title: "Top voters overall includes more edits than editor profile’s yes+no+approve"}, s: {cursor: "help"}}, "MBS-9651"), ")"]),
				createTag("th", {a: {colspan: "2"}}, (0 + yes + no + approve).toLocaleString(lang) + " (" + percentage(yes + no + approve, yes + no + abstain + approve) + ")")
			]),
			stats[9].parentNode
		);
	}
}
function isEncoded(string) {
	// a mix of http://stackoverflow.com/a/30209048/2236179 and http://stackoverflow.com/a/8267593/2236179
	if (typeof string != "string") return false;
	var result;
	try {
		result = decodeURIComponent(string);
	} catch (error) {
		result =  unescape(string);                                       
	}
	return result != string;
}
function readStat(stats, i) {
	return parseInt(stats[i].textContent.split("(")[0].replace(/\D/g, ""), 10);
}
function writeStat(stats, i, stat, total) {
	var a = stats[i].getElementsByTagName("a")[0];
	a.replaceChild(document.createTextNode(percentage(stat, total)), a.firstChild);
}
function percentage(p, c) {
	return (c == 0 ? 0 : Math.round(10000 * p / c) / 100) + "%";
}
/*=================================================================== MOUSE+
## CHECK_ALL_SUBSCRIPTIONS ##
==========================================================================*/
j2setting("CHECK_ALL_SUBSCRIPTIONS", true, true, "adds a “check all” checkbox on subscriptions pages (MBS-3629)");
if (j2sets.CHECK_ALL_SUBSCRIPTIONS && self.location.href.match(new RegExp("^" + MBS + "/user/[^/]+/subscriptions/.+$"))) {
	var cbs = document.querySelectorAll("div#page > form > table.tbl > tbody > tr > td > input[type='checkbox']");
	var ths = document.querySelector("div#page > form > table.tbl > thead > tr > th");
	if (ths && !ths.hasChildNodes() && cbs && cbs.length > 0) {
		debug("CHECK_ALL_SUBSCRIPTIONS");
		var cb = ths.appendChild(createTag("input", {a: {type: "checkbox"}, e: {click: function(event) {
			for (var icb = 0; icb < cbs.length; icb++) {
				if (cbs[icb].checked != this.checked) {
					cbs[icb].click();
				}
			}
		}}}));
	}
}
/*=============================================================== KEYBOARD+
## EASY_DATE ## basic paste-a-date!-like (https://userscripts.org/121217)
=========================================================================*/
j2setting("EASY_DATE", false, true, "you can paste full date in the YYYY field, it will split it — ascending D.M.YYYY or descending YYYY.M.D, almost any format except american (MBS-1197) — type “c” to copy current date into the other (begin→end or end→begin)");
if (j2sets.EASY_DATE) {
	EASY_DATE_init();
	document.body.addEventListener("DOMNodeInserted", EASY_DATE_calmDOM, false);
}
var EASY_DATE_calmDOMto;
function EASY_DATE_calmDOM() {
	if (EASY_DATE_calmDOMto) {
		clearTimeout(EASY_DATE_calmDOMto);
	}
	EASY_DATE_calmDOMto = setTimeout(EASY_DATE_init, 100);
}
function EASY_DATE_init() {
	debug("EASY_DATE_init");
	for (var years = document.querySelectorAll(".partial-date > input[placeholder='YYYY'][maxlength='4'][size='4']:not(." + userjs + "easydate)"), y = 0; y < years.length; y++) {
		addAfter(
			createTag("input", {
				a: {value: years[y].value, placeholder: "YYY+", size: "4", title: "EASY_DATE®\n" + j2docs.EASY_DATE},
				s: {backgroundColor: "#ff9"},
				e: {
					input: function(event) {
						this.style.setProperty("background-color", "#ff9");
						this.value = this.value.trim().replace(/[０-９]/g, function(d) { return String.fromCharCode(d.charCodeAt(0) - "０".charCodeAt(0) + "0".charCodeAt(0)); }).replace(/^\D+|\D+$/, "");
						var date;
						if (!this.value.match(/\D/)) {
							switch (this.value.length) {
								case 5:
									this.value = this.value.substr(0, 4);
									break;
								case 6:
									this.value = (parseInt(this.value, 10) > 19 ? "19" : "20") + this.value;
								case 8:
									date = this.value.match(new RegExp("^" + re_date.YYYY + re_date.MM + re_date.DD + "$"));
									break;
							}
						} else {
							date = this.value.match(new RegExp("^(?:" + re_date.YYYY + "\\D+" + re_date.MM + "(?:\\D+" + re_date.DD + ")?|(?:" + re_date.DD + "\\D+)" + re_date.MM + "\\D+" + re_date.YYYY + "|" + re_date.YYYY + "\\D+" + re_date.M + "(?:\\D+" + re_date.D + ")?|(?:" + re_date.D + "\\D+)?" + re_date.M + "\\D+" + re_date.YYYY + "|" + re_date.YY + "\\D+" + re_date.M + "(?:\\D+" + re_date.D + ")?|(?:" + re_date.D + "\\D+)?" + re_date.M + "\\D+" + re_date.YY + ")$"));
						}
						if (date) {
							var ymd = {
								YYYY: date[1]||date[6]||date[7]||date[12]||date[13]||date[18],
								MM: date[2]||date[5]||date[8]||date[11]||date[14]||date[17],
								DD: date[3]||date[4]||date[9]||date[10]||date[15]||date[16]
							};
							for (var i in ymd) if (ymd.hasOwnProperty(i) && ymd[i]) {
								if (i == "YYYY" && ymd[i].length == 2) {
									ymd[i] = (parseInt(ymd[i], 10) > 19 ? "19" : "20") + ymd[i];
								}
								else if (ymd[i].length == 1) {
									ymd[i] = "0" + ymd[i];
								}
								var input = this.parentNode.querySelector("input[placeholder='" + i + "']");
								input.value = ymd[i];
								input.focus();
								sendEvent(input, "change");
							}
							this.style.setProperty("background-color", "#cfc");
							if (self.location.pathname.match(/\/edit-relationships$/)) {
								EASY_DATE_cloneDate(this);
							}
						} else {
							this.previousSibling.value = this.value;
							sendEvent(this.previousSibling, "change");
							if (!this.value.match(/^\d\d\d\d$/)) this.style.setProperty("background-color", "#fcc");
						}
					},
					focus: function(event) { this.select(); },
					keydown: [EASY_DATE_cloneDateHotkey, EASY_DATE_nextField]
				}}
			), years[y]);
		years[y].classList.add(userjs + "easydate");
		years[y].style.setProperty("display", "none");
		years[y].addEventListener("change", function(event) {
			if (this.nextSibling.value != this.value) {
				this.nextSibling.value = this.value;
			}
		}, false);
		years[y].parentNode.querySelector("input[placeholder='MM']").addEventListener("keydown", EASY_DATE_cloneDateHotkey);
		years[y].parentNode.querySelector("input[placeholder='DD']").addEventListener("keydown", EASY_DATE_cloneDateHotkey);
		years[y].parentNode.querySelector("input[placeholder='MM']").addEventListener("keydown", EASY_DATE_nextField);
	}
}
function EASY_DATE_cloneDateHotkey(event) {
	if (!event.ctrlKey && !event.shiftKey && event.keyCode == KEYCODES.C) {
		stop(event);
		EASY_DATE_cloneDate(this, true);
	}
}
function EASY_DATE_cloneDate(current, hotkey) {
	var ph = ["YYYY", "MM", "DD"];
	for (var p = 0; p < ph.length; p++) {
		var inps = current.parentNode.parentNode.parentNode.querySelectorAll("input[placeholder='" + ph[p] + "']");
		var downwards = (current.parentNode == inps[0].parentNode);
		if (!hotkey && !downwards) {
			return;
		}
		inps[downwards ? 1 : 0].value = inps[downwards ? 0 : 1].value;
		sendEvent(inps[downwards ? 1 : 0], "change");
	}
}
function EASY_DATE_nextField(event) {
	if (!event.ctrlKey && !event.shiftKey) {
		var separatorMode = event.keyCode == KEYCODES["NUMPAD-MINUS"] || event.keyCode == KEYCODES["NUMPAD-DIVIDE"] || event.keyCode == KEYCODES["NUMPAD-DOT"];
		var fullDigitMode = this.selectionStart == this.selectionEnd && this.value.length == this.getAttribute("placeholder").length && event.keyCode >= KEYCODES["NUMPAD-ZERO"] && event.keyCode <= KEYCODES["NUMPAD-NINE"];
		if (separatorMode || fullDigitMode) {
			var nextField = this.parentNode.querySelector("input[placeholder='" + (this.getAttribute("placeholder") == "MM" ? "DD" : "MM") + "']");
			nextField.focus();
			nextField.select();
			if (fullDigitMode) {
				nextField.value = String.fromCharCode(event.keyCode - 48);
			}
			return stop(event);
		}
	}
}
/*================================================================= DISPLAY+
## SPOT_AC ##
==========================================================================*/
j2setting("SPOT_AC", true, true, "name variations (Artist Credit, track name ≠ recording name, etc.) stand out");
j2setting("SPOT_AC_css", "border-bottom: 2px dashed maroon;", true, "CSS syntax (on “span.name-variation”)");
if (j2sets.SPOT_AC) {
	j2superturbo.addCSSRule("span.name-variation { " + j2sets.SPOT_AC_css + " }");
}
/*================================================================= DISPLAY+
## SPOT_CAA ##
==========================================================================*/
j2setting("SPOT_CAA", true, true, "cover art archive’s images stand out from other images. Allows spotting incorrectly padded CAA uploads and looks cool altogether");
j2setting("SPOT_CAA_css", "box-shadow: 0 0 8px black;", true, "CSS syntax (on “a.artwork-image > img”)");
if (j2sets.SPOT_CAA) {
	j2superturbo.addCSSRule("img[src*='//coverartarchive.org/'], img.uploader-preview-image { " + j2sets.SPOT_CAA_css + " }");
}
/*================================================================= DISPLAY+
## WARN_NEW_WINDOW ##
==========================================================================*/
j2setting("WARN_NEW_WINDOW", true, true, "links that open in a new window will be marked with an icon");
if (j2sets.WARN_NEW_WINDOW) {
	j2superturbo.addCSSRule("a[target='_blank']::after { margin: 0 2px 0 4px; content: url(data:image/gif;base64,R0lGODlhCwAKAPcAAOAaGv///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAIALAAAAAALAAoAAAgpAAUIFACgoEEAAwkeLJgQYUODBBMqZOhwIEOBFTFWXAhRYkOJGTlmDAgAOw==); }");
}
/*================================================================= DISPLAY+
## CENTER_FLAGS ##
==========================================================================*/
j2setting("CENTER_FLAGS", true, true, "vertically center flags");
if (j2sets.CENTER_FLAGS) {
	j2superturbo.addCSSRule(".flag { background-origin: padding-box; background-position: 0% 84%; }");
}
/*================================================================= DISPLAY-
## HIDE_RATINGS ##
==========================================================================*/
j2setting("HIDE_RATINGS", false, true, "hide those cute little stars and everything related to ratings in MB");
if (j2sets.HIDE_RATINGS) {
	j2superturbo.addCSSRule("div#content table.tbl > * > tr > th.rating, div#content table.tbl > tbody > tr > td.rating, div#sidebar > h2.rating, div#sidebar > h2.rating + p, div#page > div.tabs > ul.tabs > li:not(.sel) > a[href$='/ratings'], div.header ul.menu li.data a[href$='/ratings'] { display: none; }");
	/*work around for missing rating classes (artist, collection)*/
	var ratingIndex = document.querySelector("div#content table.tbl > tbody > tr > td:not(.rating) > span.inline-rating");
	if (ratingIndex) {
		debug("HIDE_RATINGS");
		j2superturbo.addCSSRule("div#content table.tbl > * > tr > *:nth-child(" + (ratingIndex.parentNode.cellIndex + 1) + ") { display: none; }");
	}
}
/*================================================================= DISPLAY+
## RATINGS_ON_TOP ##
==========================================================================*/
j2setting("RATINGS_ON_TOP", false, true, "show (5 stars) ratings at the top of the sidebar");
j2setting("RATINGS_ON_TOP_below_image", true, true, "place the ratings just below the entity image (instead of topmost)");
if (j2sets.RATINGS_ON_TOP && sidebar && !j2sets.HIDE_RATINGS) {
	var ratings = sidebar.querySelector("h2.rating");
	if (ratings) {
		ratings = [ratings, getSibling(ratings, "p")];
		var where;
		if (j2sets.RATINGS_ON_TOP_below_image) where = sidebar.querySelector("div.cover-art + *, div.picture + *");
		if (!where) where = sidebar.firstChild;
		if (ratings[1] && where) for (var r = 0; r < ratings.length; r++) {
			debug("RATINGS_ON_TOP");
			sidebar.insertBefore(sidebar.removeChild(ratings[r]), where);
		}
	}
}
/*================================================================= DISPLAY+
## ROW_HIGHLIGHTER ##
evolution of brianfreud’s original idea
MusicBrainz row highlighter https://userscripts.org/118008
==========================================================================*/
j2setting("ROW_HIGHLIGHTER", true, true, "highlights rows in various MB tables");
j2setting("ROW_HIGHLIGHTER_colour", "#fcf", true, "use any CSS colour code or name");
if (j2sets.ROW_HIGHLIGHTER && j2sets.ROW_HIGHLIGHTER_colour.match(/^(#[0-9a-f]{3}|#[0-9a-f]{6}|[a-z-]+)$/i)) {
	var hldrule = {
		selector: [
			"tr." + userjs + "rowhld th",
			"tr." + userjs + "rowhld td",
			"div#release-editor > div#tracklist tr." + userjs + "rowhld td input",
			"table.details td > span." + userjs + "rowhld",
			"table.details td > span." + userjs + "rowhld a",
			"table.details th." + userjs + "rowhld"
		],
		rule: [
			"background-color:" + j2sets.ROW_HIGHLIGHTER_colour + "!important"
		]
	};
	j2superturbo.addCSSRule(hldrule.selector.join(",") + "{" + hldrule.rule.join(";") + "}");
	ROW_HIGHLIGHTER_init();
	document.body.addEventListener("DOMNodeInserted", ROW_HIGHLIGHTER_calmDOM);
}
var ROW_HIGHLIGHTER_calmDOMto;
function ROW_HIGHLIGHTER_calmDOM() {
	if (ROW_HIGHLIGHTER_calmDOMto) {
		clearTimeout(ROW_HIGHLIGHTER_calmDOMto);
	}
	ROW_HIGHLIGHTER_calmDOMto = setTimeout(ROW_HIGHLIGHTER_init, 100);
}
function ROW_HIGHLIGHTER_init() {
	debug("ROW_HIGHLIGHTER_init");
	ROW_HIGHLIGHTER_calmDOMto = null;
	var tds = document.querySelectorAll("table:not(#batch-tools):not(.advanced-format):not(.artist-credit):not(.details) > tbody > tr:not(.track-artist-credit) > *, table.details td > span");
	for (var td = 0; td < tds.length; td++) {
		tds[td].removeEventListener("mouseover", ROW_HIGHLIGHTER_refresh);
		tds[td].removeEventListener("mouseout", ROW_HIGHLIGHTER_refresh);
		/*sorry for the remove/add hack but it seems MBS still uses some
		innerHTML="<bla></bla>" which breaks event listeners, parentality, etc.*/
		tds[td].addEventListener("mouseover", ROW_HIGHLIGHTER_refresh);
		tds[td].addEventListener("mouseout", ROW_HIGHLIGHTER_refresh);
	}
}
function ROW_HIGHLIGHTER_refresh(event) {
	var row = [this.parentNode];
	if (row[0]) {
		if (self.location.pathname.match(new RegExp("^/release/(add|" + stre_GUID + "/edit)$"))) {/*release-editor hacks*/
			if (getParent(this, "div", null, "recordings")/*Recordings*/ && this.tagName == "TD") {
				if (!row[0].classList.contains("track")) {
					row[0] = getSibling(row[0], "tr", "track", true);
				}
				row.push(getSibling(row[0], "tr", "artist"));
				row.push(getSibling(row[1], "tr", null, false, 4));
			}
		} else if (this.tagName == "SPAN") {/*AR list hacks*/
			row = [
				this,
				this.style.getPropertyValue("float") == "right" ? getSibling(this, "span", false, true) : getSibling(this, "span", false),
				getSibling(this.parentNode, "th", null, true)
			];
		}
		for (var r = 0; r < row.length; r++) if (row[r]) {
			if (event.type == "mouseover") {
				row[r].classList.add(userjs + "rowhld");
			} else if (event.type == "mouseout") {
				row[r].classList.remove(userjs + "rowhld");
			}
		}
	}
}
/*=================================================================== MOUSE+
## Common form submission function ##
==========================================================================*/
function parentFormSubmit(input, event) {
	var form = getParent(input, "form") || document.querySelector("div#release-editor");
	if (form) {
		var submitbutt = form.querySelector("div#release-editor button.positive[data-click='submitEdits'], div.buttons > button[type='submit'], span.buttons > button[type='submit']");
		if (submitbutt) {
			submitbutt.style.setProperty("background-color", "yellow");
			if (submitbutt.getAttribute("disabled")) alert("This form is not (yet) submitable. Maybe you haven’t changed anything yet.");
			else sendEvent(submitbutt, (event.shiftKey ? "shift+" : "") + "click");
		} else {
			form.submit();
		}
	}
}
/*=================================================================== MOUSE+
## DOUBLE_CLICK_SUBMIT ##
==========================================================================*/
j2setting("DOUBLE_CLICK_SUBMIT", true, true, "makes the “radio buttons” and “multi-selects” submit forms on double-click (MBS-3229)");
if (j2sets.DOUBLE_CLICK_SUBMIT && self.location.pathname.match(/^\/(cdtoc\/|cdstub\/|edit\/|release\/(add(\?release-group=)?|[^/]+\/edit-cover-art\/)|release-group\/[^/]+\/edit|search|.+\/merge)/)) {
	debug("DOUBLE_CLICK_SUBMIT");
	var objs = document.querySelectorAll("div#page form > *:not(.edit-list) input[type='radio'], select[multiple]");
	for (var o = 0; o < objs.length; o++) {
		var obj = getParent(objs[o], "label") || objs[o];
		if (obj.tagName == "LABEL") obj.addEventListener("mousedown", function(event) { event.preventDefault(); });
		obj.addEventListener("dblclick", function(event) { parentFormSubmit(this, event); });
		obj.setAttribute("title", "double-click here to submit the form");
	}
}
/*================================================================ KEYBOARD+
## CONTROL_ENTER_SUBMIT ##
==========================================================================*/
j2setting("CONTROL_ENTER_SUBMIT", true, true, "hit CTRL+ENTER keys when you’re in a text area to submit the current form");
if (j2sets.CONTROL_ENTER_SUBMIT) {
	document.body.addEventListener("keydown", function(event) {
		if (event.target.tagName && event.target.tagName == "TEXTAREA" && event.ctrlKey && event.keyCode == KEYCODES.ENTER) {
			debug("CONTROL_ENTER_SUBMIT");
			parentFormSubmit(event.target, event);
		}
	});
}
/*================================================================ REMEMBER+
## LAST_SEEN_EDIT ##
==========================================================================*/
j2setting("LAST_SEEN_EDIT", false, true, "it shows you what edits you have already seen (reviewed) on entities edit histories, yeah man. only saves states when looking at all edits (not only open) of entity");
if (j2sets.LAST_SEEN_EDIT && account) {
	debug("LAST_SEEN_EDIT");
	var what = (self.location.pathname).match(new RegExp("^/(?:(user)/([^/]+)/edits(?:/(open))?|([^/]+)/(" + stre_GUID + ")/(?:(open)_)?edits)"));
	if (what) {
		var open = typeof (what[3] || what[6]) != "undefined";
		var which = what[2] || what[5];
		what = what[1] || what[4];
		var lastseenedits = localStorage.getItem(userjs + "lastseenedits-" + what);
		var upd = false;
		if (lastseenedits) { lastseenedits = JSON.parse(lastseenedits); } else { lastseenedits = {}; }
		var now = new Date();
		if (lastseenedits[which]) {
			if (lastseenedits[which][2] > lastseenedits[which][0] && new Date(lastseenedits[which][1]) < new Date(now - 1000 * 60 * 30/*30minutes*/)) {
				lastseenedits[which][0] = lastseenedits[which][2];
				lastseenedits[which][1] = now.getTime();
				upd = true;
			}
		} else {
			lastseenedits[which] = [0, now.getTime(), 0];/*[0:edit,1:when,2:next]*/
		}
		var edits = document.querySelectorAll("div.edit-header > h2 > a[href*='/edit/']");
		for (var ed = 0; ed < edits.length; ed++) {
			var editn = parseInt(edits[ed].getAttribute("href").match(/\d+$/), 10);
			var editlist = getParent(edits[ed], "div", "edit-list");
			if (!open && ed == 0 && editn > lastseenedits[which][0] && editn > lastseenedits[which][2]) {
				lastseenedits[which][2] = editn;
				upd = true;
			}
			if (editn <= lastseenedits[which][0]) {
				editlist.setAttribute("title", "SEEN EDIT");
				if (editn == lastseenedits[which][0]) {
					editlist.parentNode.insertBefore(createTag("hr", {a: {title: "edits below are already seen"}, s: {height: "0px", border: "none", "border-top": "4px dashed red"}}), editlist);
					if (ed > 0) { getSibling(editlist, "div", "edit-list", true).scrollIntoView(); }
				}
			}
			else {
				editlist.style.setProperty("background-color", "#ffc");
				editlist.setAttribute("title", "NEW EDIT");
			}
		}
		if (upd && !open) {
			localStorage.setItem(userjs + "lastseenedits-" + what, JSON.stringify(lastseenedits));
		}
	}
}
/*==================================================================== LINK+
## COOL_SEARCH_LINKS ##
==========================================================================*/
j2setting("COOL_SEARCH_LINKS", true, true, "additional “refine this search” links excluding own edits or PUID edits, cross links between edits / open_edits, etc.");
if (j2sets.COOL_SEARCH_LINKS && account && !self.location.pathname.match(/^\/search\/edits/)) {
	debug("COOL_SEARCH_LINKS");
	var noPUID = "&conditions.2097.field=type&conditions.2097.operator=%21%3D&conditions.2097.args=77&conditions.2097.args=113";
	if (self.location.pathname.match(new RegExp("/[^/]+/" + stre_GUID + "$")) && !self.location.pathname.match(/label|work/)) {
		var entityType = self.location.pathname.match(/[^/]+/); entityType = entityType ? (entityType + "").replace(/-/, "_") : "";
		var entityName = document.querySelector("div#content h1 a");
		var entityID = document.querySelector("div#sidebar a[href^='" + MBS + "/" + entityType + "/merge_queue?add-to-merge=']");
		var entityEdits = document.querySelector("div#sidebar a[href$='" + self.location.pathname + "/edits']");
		if (entityID && entityEdits && entityType && entityName) {
			entityID = entityID.getAttribute("href").match(/\d+$/);
			entityName = entityName.textContent;
			var refine = "/search/edits?conditions.0.operator=%3D&conditions.0.field=" + entityType + "&conditions.0.name=" + encodeURIComponent(entityName) + "&conditions.0.args.0=" + entityID + "&order=desc&combinator=and&negation=0";
			addAfter(createTag("span", {}, [" (", createTag("a", {a: {title: "another cool search link", href: refine + noPUID}, s: {background: "#ff6"}}, "without PUIDs"), ")"]), entityEdits);
		}
	} else {
		var refine = self.location.pathname.match(/(?:(?:(open)_)?edits|edits\/(open))\/?$/);
		var searchHelp = document.querySelector("table.search-help > tbody");
		if (searchHelp && refine) {
			var refines = document.createElement("td");
			var myID;
			var notme = "&conditions.2099.field=editor&conditions.2099.operator=%21%3D&conditions.2099.name=%myName%&conditions.2099.args.0=%myID%";
			var novote = "&conditions.2098.field=voter&conditions.2098.operator=%3D&conditions.2098.name=%myName%&conditions.2098.voter_id=%myID%&conditions.2098.args=no";
			var onlyEffective = "&conditions.2097.field=status&conditions.2097.operator=%3D&conditions.2097.args=1&conditions.2097.args=2";
			refines.appendChild(createTag("a", {a: {href: self.location.pathname.replace(/edits\/open|(open_)?edits/, refine[1]||refine[2] ? "edits" : (self.location.pathname.match(re_GUID) ? "open_edits" : "edits/open")) + self.location.search + self.location.hash}}, (refine[1]||refine[2] ? "All " : "Open ") + "edits"));
			if (
				self.location.href.indexOf(account.pathname) < 0 &&
				(refine = document.querySelector("table.search-help td > a[href^='" + MBS + "/search/edits?'][href*='user_id='][href*='&conditions.']")) &&
				(refine = refine.getAttribute("href").replace(/form_only=yes/, "")) &&
				(myID = refine.match(/user_id=(\d+)/) || localStorage.getItem(userjs + "me-userid"))
			) {
				if (self.location.pathname.match(/\/edits$/)) {
					refines.appendChild(document.createTextNode(" | "));
					refines.appendChild(createTag("a", {a: {href: refine + onlyEffective}}, ["Refine this search (", createTag("strong", null, "effective edits only"), ")"]));
				}
				if (typeof myID == "object") {
					myID = myID[1];
					if (myID != localStorage.getItem(userjs + "me-userid")) localStorage.setItem(userjs + "me-userid", myID);
					refines.appendChild(document.createTextNode(" | "));
					refines.appendChild(createTag("a", {a: {href: refine + notme.replace(/%myID%/g, myID).replace(/%myName%/g, escape(account.name))}}, ["Refine this search (", createTag("strong", null, "+not me"), ")"]));
					novote = notme + novote;
					refines.appendChild(document.createTextNode(" | "));
					refines.appendChild(createTag("a", {a: {href: refine + novote.replace(/%myID%/g, myID).replace(/%myName%/g, escape(account.name))}}, ["Refine this search (", createTag("strong", null, "+not me+not voted"), ")"]));
				}
				if (!self.location.pathname.match(/label|work/)) {
					refines.appendChild(document.createTextNode(" | "));
					refines.appendChild(createTag("a", {a: {href: refine + noPUID}}, ["Refine this search (", createTag("strong", null, "no PUID edits"), ")"]));
				}
			}
			if (refines.childElementCount > 0) {
				searchHelp.insertBefore(createTag("tr", {s: {"text-shadow": "0 0 8px purple"}}, [createTag("th", {}, "Cool link" + (refines.childElementCount > 1 ? "s" : "") + ": "), refines]), searchHelp.firstChild);
			}
		}
	}
}
/*==================================================================== LINK+
## COPY_TOC ##
==========================================================================*/
j2setting("COPY_TOC", true, true, "re-lookup Disc ID (from cdtoc page)");
if (j2sets.COPY_TOC && account && self.location.pathname.match(/^\/cdtoc\/[^/]+-$/)) {
	debug("COPY_TOC");
	var cdtoctrs = document.querySelectorAll("div#page > table table tr");
	var TOC = cdtoctrs[2].getElementsByTagName("td")[0].textContent + "%20" + cdtoctrs[cdtoctrs.length - 1].getElementsByTagName("td")[0].textContent + "%20" + cdtoctrs[cdtoctrs.length - 1].getElementsByTagName("td")[6].textContent;/*this should be 1%20totaltracks%20lastsector*/
	for (var i = 2; i < cdtoctrs.length; i++) { TOC += "%20" + cdtoctrs[i].getElementsByTagName("td")[2].textContent; }
	(document.querySelector("h1")||document.body).appendChild(createTag("fragment", {}, [" (", createTag("a", {a: {href: "/cdtoc/attach?toc=" + TOC}, s: {background: "yellow"}}, "re-lookup"), ")"]));
}
/*==================================================================== LINK+
## SERVER_SWITCH ##
==========================================================================*/
j2setting("SERVER_SWITCH", true, true, "fast switch between normal, beta and mbsandboxes. look for the new top-right MBS menu");
j2setting("SERVER_SWITCH_mbsandbox", "[\"chirlu\", \"reosarevok\"]", true, "type an array of subdomains to .mbsandbox.org");
if (j2sets.SERVER_SWITCH) {
	debug("SERVER_SWITCH");
	var langMenu = document.querySelector("div.header ul.menu li.language-selector");
	if (langMenu) {
		for (var languageLinks = langMenu.querySelectorAll("a[href*='/set-language/']"), a = 0; a < languageLinks.length; a++) {
			languageLinks[a].classList.add("jesus2099-bypass-mb_PREFERRED-MBS");//mb_PREFERRED-MBS
		}
		var servname;
		if (servname = self.location.hostname.match(/^([^.]+)\.[^.]+\.[^.]+$/)) {
			servname = servname[1];
		} else {
			servname = "MBS";
		}
		var menu = langMenu.parentNode.insertBefore(createTag("li", {a: {class: userjs + "serverSwitch"}, s: {float: "right", position: "relative"}}, [createTag("span", {a: {title: "Server Switch", class: "menu-header"}}, [meta.icon.cloneNode(false), " ", createTag("code", {}, servname), " ▾"]), document.createElement("ul")]), langMenu);
		menu.addEventListener("click", function(event) {
			if(getParent(event.target, "li", userjs + "serverSwitch")) {
				event.stopPropagation();
				for (var openMenus = document.querySelectorAll(".header ul.menu li.fake-active"), m = 0; m < openMenus.length; m++) if (openMenus[m] != this) {
					sendEvent(openMenus[m], "click");
				}
				if (this.lastChild.style.getPropertyValue("left").match(/inherit|-\d{1,4}px/)) {
					this.classList.remove("fake-active");
					this.lastChild.style.setProperty("left", "-10000px");
				} else {
					this.classList.add("fake-active");
					var ulStyle = self.getComputedStyle(this.lastChild);
					this.lastChild.style.setProperty("left", "-" + (ulStyle.getPropertyValue("width").match(/\d+/) - self.getComputedStyle(this).getPropertyValue("width").match(/\d+/) + 1 * ulStyle.getPropertyValue("padding-left").match(/\d+/) + 1 * ulStyle.getPropertyValue("padding-right").match(/\d+/)) + "px");
				}
			}
		}, true);
		menu.lastChild.addEventListener("click", function(event) { event.stopPropagation(); });
		menu = menu.firstChild.nextSibling;
		var mbMains = ["", "beta.", "test."];
		for (var mb = 0; mb < mbMains.length; mb++) {
			menu.appendChild(serverSwitch(mbMains[mb] + "musicbrainz.org"));
		}
		if (j2sets.SERVER_SWITCH_mbsandbox) {
			var mbSandBoxes = JSON.parse(j2sets.SERVER_SWITCH_mbsandbox);
			if (mbSandBoxes.length) {
				mbSandBoxes.sort();
				for (var sb = 0; sb < mbSandBoxes.length; sb++) {
					menu.appendChild(serverSwitch(mbSandBoxes[sb] + ".mbsandbox.org", sb == 0));
				}
			}
		}
	}
}
function serverSwitch(server, sep) {
	var li = document.createElement("li");
	if (sep) {
		li.className = "separator";
	}
	var protocolAndHost = server.match(/^(https?:)\/\/(.+)$/);
	var a = li.appendChild(createTag("a", {}, protocolAndHost ? protocolAndHost[2] + " (" + protocolAndHost[1].slice(0, -1) + ")" : server));
	if (self.location.host == server || self.location.protocol + "//" + self.location.host == server) {
		a.style.setProperty("cursor", "no-drop");
		a.style.setProperty("font-weight", "bold");
	} else {
		var hrefHost;
		if (protocolAndHost) {
			hrefHost = protocolAndHost[1] + "//" + protocolAndHost[2];
		} else if (server.match(/mbsandbox/)) {
			hrefHost = "http:" + "//" + server;
		} else {
			hrefHost = "//" + server;
		}
		a.setAttribute("href", hrefHost + self.location.pathname + self.location.search + self.location.hash);
		a.classList.add("jesus2099-bypass-mb_PREFERRED-MBS");//mb_PREFERRED-MBS
	}
	return li;
}
/*==================================================================== LINK+
## TAG_TOOLS ##
==========================================================================*/
j2setting("TAG_TOOLS", true, true, "makes tag pages better titled and adds a tag switch between current users’, all users’ and your own tags — sidebar tag links will link your own tags (if any) instead of global");
if (j2sets.TAG_TOOLS && account) {
	var tagscope = self.location.pathname.replace(new RegExp("^" + MBS + "|[?#].*$", "g"), "").match(/^(?:\/user\/([^/]+))?(?:\/tags|(\/tag\/([^/]+))(?:\/(?:artist|release-group|release|recording|work|label))?)$/);
	if (tagscope) {
		debug("TAG_TOOLS");
		var h1 = document.querySelector("h1");
		var tags = tagscope[0].match(/tags$/);
		if (h1 && account.pathname) {
			var tagswitches = [];
			var scope = typeof tagscope[1] == "string" ? decodeURIComponent(tagscope[1]) : "";
			if (scope != account.name) {
				tagswitches.push([account.pathname + (tags ? "/tags" : tagscope[2]), (scope == "" ? "only " : "") + "mine"]);
			}
			if (scope != "") {
				tagswitches.push([MBS + (tags ? "/tags" : tagscope[2]), "everyone’s"]);
				h1.appendChild(document.createTextNode("’s tag" + (tags ? "s" : " “" + decodeURIComponent(tagscope[3]) + "”")));
			}
			document.title = h1.textContent;
			tagswitch(h1, tagswitches);
		}
	}
	j2superturbo.addCSSRule("div#sidebar-tags ul.tag-list a[href^='/user/'] { background-color: #B1EBB0 }");
	updateTags();
}
function updateTags(event) {
	var tagZone = document.querySelector("div#sidebar-tags");
	var tagList = document.querySelector("div#sidebar-tags ul.tag-list");
	if (tagZone && tagList) {
		if (!event) {
			getSibling(tagZone, "h2", null, true).appendChild(createTag("span", {s: {color: "black", fontWeight: "normal", "float": "right"}}, ["↙", createTag("span", {s: {backgroundColor: "#B1EBB0"}}, "mine"), " and others’"]));
			tagList.addEventListener("DOMNodeInserted", updateTags);
			var mytags = document.querySelectorAll("div#sidebar-tags ul.tag-list > li > span.tag-upvoted");
			for (var t = 0; t < mytags.length; t++) {
				ownifyTag(mytags[t].previousSibling);
			}
		} else if (event.target) {
			var newTag = event.target.querySelector("span.tag-upvoted") && event.target.querySelector("a[href^='/tag/']");
			if (newTag) {
				ownifyTag(newTag);
			}
		}
	}
}
function ownifyTag(tag) {
	tag.setAttribute("href", account.pathname + tag.getAttribute("href"));
}
function tagswitch(cont, urltxt) {
	var switcht = h1.appendChild(createTag("span", {s: {color: "grey", textShadow: "1px 1px 2px silver"}}, " (see "));
	for (var i = 0; i < urltxt.length; i++) {
		if (i > 0) { switcht.appendChild(document.createTextNode(" or ")); }
		switcht.appendChild(createTag("a", {a: {href: urltxt[i][0]}}, urltxt[i][1]));
	}
	switcht.appendChild(document.createTextNode(")"));
}
/*=================================================================== MOUSE+
## STATIC_MENU ##
==========================================================================*/
j2setting("STATIC_MENU", true, true, "makes the main MB menu always there when you need it (wihout scrolling top)");
var mmenu = document.querySelector("div.header");
var etais;
if (j2sets.STATIC_MENU && mmenu) {
	debug("STATIC_MENU");
	etais = mmenu.parentNode.insertBefore(document.createElement("div"), mmenu);
	//TODO: is this even supposed to work with // @run-at document-end?
	self.addEventListener("load", smenu, false);
	self.addEventListener("resize", smenu, false);
	self.addEventListener("scroll", smenu, false);
}
function smenu(event) {
	if (document.body.scrollTop + document.documentElement.scrollTop > 0) {
		mmenu.style.setProperty("position", "fixed");
		mmenu.style.setProperty("top", "0px");
		var computedWidth = self.getComputedStyle(mmenu.parentNode).getPropertyValue("width").match(/\d+/)[0];
		computedWidth -= self.getComputedStyle(mmenu).getPropertyValue("margin-left").match(/\d+/)[0];
		computedWidth -= self.getComputedStyle(mmenu).getPropertyValue("margin-right").match(/\d+/)[0];
		mmenu.style.setProperty("width", computedWidth + "px");
		mmenu.style.setProperty("border-bottom", "10px solid white");
		mmenu.style.setProperty("background-color", "white");
		mmenu.style.setProperty("box-shadow", "0px 10px 5px 8px white");
		mmenu.style.setProperty("z-index", "9");
		etais.style.setProperty("display", "block");
		etais.style.setProperty("height", self.getComputedStyle(mmenu).getPropertyValue("height"));
		try {
			mmenu.querySelector("div > div.l").style.setProperty("display", "none");
			mmenu.querySelector("div > div.r").style.setProperty("display", "none");
		} catch (error) {}
	} else {
		mmenu.style.removeProperty("position");
		mmenu.style.removeProperty("top");
		mmenu.style.removeProperty("width");
		mmenu.style.removeProperty("border-bottom");
		mmenu.style.removeProperty("background-color");
		mmenu.style.removeProperty("box-shadow");
		mmenu.style.removeProperty("z-index");
		etais.style.setProperty("display", "none");
		try {
			mmenu.querySelector("div > div.l").style.removeProperty("display");
			mmenu.querySelector("div > div.r").style.removeProperty("display");
		} catch (error) {}
	}
}
/*==========================================================================
## SLOW_DOWN_RETRY ##
==========================================================================*/
j2setting("SLOW_DOWN_RETRY", false, true, "gently auto‐retries requests when MB overloading so you don’t have to do it yourself. also retries “read timeout” searches and “502 Bad Gateway”.");
if (j2sets.SLOW_DOWN_RETRY) {
	var errortype = document.title.match(/^(502 Bad Gateway|504 Gateway Time-out|internal server error|search error|slow down!)/i);
	if (errortype) {
		debug("SLOW_DOWN_RETRY");
		var retrydelay;
		switch (errortype[1].toLowerCase()) {
			case "slow down!":
				retrydelay = 20;
				break;
			case "502 bad gateway":
			case "504 gateway time-out":
				if (checkError("body > center > h1", new RegExp("^" + errortype[1] + "$", "i"))) retrydelay = 2;
				break;
			case "internal server error":
			case "search error":
				if (checkError("div#page pre", /canceling statement due to statement timeout at|read timeout at/)) retrydelay = 2;
				break;
		}
		if (retrydelay) {
			document.querySelector("div#page h1, div#content h1, h1").appendChild(createTag("fragment", {}, [" (retrying", createTag("span", {a: {class: "countdown"}}, delayMsg(retrydelay)), ")"]));
			setInterval(function(event) {
				retrydelay--;
				replaceChildren(document.createTextNode(delayMsg(retrydelay)), document.querySelector("h1 > span.countdown"));
				if (retrydelay == 0) { self.location.reload(false); }
			}, 1000);
		}
	}
}
function checkError(css, content) {
	try { if (document.querySelector(css).textContent.match(content)) return true; }
	catch(error) {}
	return false;
}
function delayMsg(sec) {
	return sec > 0 ? " in " + sec + " second" + (sec != 1 ? "s" : "") : "…";
}
/* --- ENTITY BONUS --- */
j2setting("RELEASE_EDITOR_PROTECTOR", true, true, "prevents from cancelling the release editor by mistake. repairs the keyboard tab navigation to save button (MBS-3112) (for the new release editor, the tab order might not be perfectly chosen yet but submit comes first and cancel last)");
j2setting("MARK_PENDING_EDIT_MEDIUMS", true, true, "puts a border around mediums with pending edits");
j2setting("TRACKLIST_TOOLS", true, true, "adds “Remove recording relationships” and “Set selected works date” in releationship editor and tools to the tracklist tab of release editor" + j2superturbo.menu.expl + ": a “Time Parser” button next to the existing “Track Parser” in release editor’s tracklists and a “Search→Replace” button");
j2setting("UNLINK_ENTITY_HEADER", false, true, "unlink entity headers where link is same as current location (artist/release/etc. name) — if you use COLLECTION HIGHLIGHTER or anything that you wish change the header, make it run first or you might not see its effects");
j2setting("RECORDING_LENGTH_COLUMN", true, true, "Displays recording lengths in work page (similar to Loujine’s script) as well as in artist relationships page");
j2setting("RELEASE_EVENT_COLUMN", true, true, "Displays release dates in label relationships page");
var enttype = self.location.href.match(new RegExp("^" + MBS + "/(area|artist|collection|event|label|place|recording|release|release-group|series|work)/.*$"));
if (enttype) {
	enttype = enttype[1];
	/*======================================================== KEYBOARD+ MOUSE+
	## RELEASE_EDITOR_PROTECTOR ##
	=========================================================================*/
	if (j2sets.RELEASE_EDITOR_PROTECTOR && enttype == "release" && self.location.href.match(new RegExp("^" + MBS + "/release/(add.*|" + stre_GUID + "/edit)$"))) {
		debug("RELEASE_EDITOR_PROTECTOR");
		var editnote = document.querySelector("div#release-editor textarea#edit-note-text");
		var cancelbutt = document.querySelector("div#release-editor button[data-click='cancelPage']");
		var previousbutt = document.querySelector("div#release-editor button[data-click='previousTab']");
		var nextbutt = document.querySelector("div#release-editor button[data-click='nextTab']");
		var savebutt = document.querySelector("div#release-editor button[data-click='submitEdits']");
		if (cancelbutt) {
			if (typeof window.onbeforeunload == "undefined") {
				// it seems that only Opera presto needed this
				cancelbutt.addEventListener("click", function(event) {
					if (!confirm("RELEASE EDITOR PROTECTOR\n\nDo you really want to cancel this release " + self.location.href.match(/add|edit/) + "?")) {
						return stop(event);
					}
				}, false);
			}
			if (editnote && cancelbutt && previousbutt && nextbutt && savebutt) {
				editnote.setAttribute("tabindex", "1");
				savebutt.setAttribute("tabindex", "1");
				previousbutt.setAttribute("tabindex", "2");
				nextbutt.setAttribute("tabindex", "2");
				cancelbutt.setAttribute("tabindex", "3");
			}
		}
	}
	/*================================================================= DISPLAY+
	## MARK_PENDING_EDIT_MEDIUMS ##
	==========================================================================*/
	if (j2sets.MARK_PENDING_EDIT_MEDIUMS && enttype == "release") {
		debug("MARK_PENDING_EDIT_MEDIUMS");
		for (var pendingEditMediums = document.querySelectorAll("div#content > table.tbl.medium > thead > tr.mp"), m = 0; m < pendingEditMediums.length; m++) {
			getParent(pendingEditMediums[m], "table").style.setProperty("border", "4px solid #fd9");
		}
	}
	/*================================================================== MOUSE+
	## TRACKLIST_TOOLS ## ex-TRACK_LENGTH_PARSER+search→replace(bookmarklet)+set-selected-works-date
	=========================================================================*/
	if (j2sets.TRACKLIST_TOOLS && enttype == "release" && self.location.pathname.match(new RegExp("/release/(add.*|" + stre_GUID + "/edit)$"))) {
		var re = document.querySelector("div#release-editor");
		if (re) {
			re.addEventListener("DOMNodeInserted", TRACKLIST_TOOLS_calmDOM);
			re.addEventListener("mouseover", TRACKLIST_TOOLS_buttonHandler);
			re.addEventListener("mouseout", TRACKLIST_TOOLS_buttonHandler);
			re.addEventListener("click", TRACKLIST_TOOLS_buttonHandler);
		}
	}
	if (j2sets.TRACKLIST_TOOLS && enttype == "release" && self.location.pathname.match(new RegExp("/release/" + stre_GUID + "/edit-relationships$"))) {
		var tabs, re = document.querySelector("div.rel-editor");
		if (re && (tabs = re.querySelector("ul.tabs"))) {
			/* :::: MASS REMOVE RECORDING RELATIONSHIPS :::: */
			j2superturbo.menu.addItem(createTag("a", {e: {click: function(event) {
				var text = prompt("This will remove the recording relationships that match the following text (ex.: “arrange”, “john”, “guitar”):");
				if (text && (text = text.trim()) && text != "") {
					var ars = document.querySelectorAll("td.recording > div.ars > div.ar > span[class*='remove-button']");
					for(var ar = 0; ar < ars.length; ar++) {
						if (!ars[ar].parentNode.querySelector("span.rel-remove") && ars[ar].parentNode.textContent.match(new RegExp(text, "i"))) {
							ars[ar].click();
						}
					}
				}
			}}}, [meta.icon.cloneNode(false), " Remove recording relationships ", createTag("small", {s: {color: "grey"}}, "← TRACKLIST_TOOLS™")]));
			/* :::: MASS SET WORKS’ RECORDING DATES :::: */
			j2superturbo.menu.addItem(createTag("a", {e: {click: function(event) {
				var checkedRelationships = {
					checkBoxes: document.querySelectorAll("#tracklist tr.track td.works div.ar input[type='checkbox']:checked")
				};
				for (var cb = 0; cb < checkedRelationships.checkBoxes.length; cb++) {
					var recordingGid = getParent(checkedRelationships.checkBoxes[cb], "tr", "track").querySelector("td.recording a[href^='/recording/']").getAttribute("href").match(re_GUID)[0];
					var workGid = getParent(checkedRelationships.checkBoxes[cb], "div", "ar").querySelector("a[href^='/work/']").getAttribute("href").match(re_GUID)[0];
					checkedRelationships[recordingGid + "-" + workGid] = true;
				}
				if (checkedRelationships.checkBoxes.length > 0) {
					var date = prompt("Type an YYYY-MM-DD, YYYY-MM or YYYY formated date that will be applied to all selected work relationships below.\nYou can type two dates, separated by at least one any character (example: “2014-12-31 2015-01”). This will set a date ranged relationship.");
					if (date) {
						if (date = date.match(new RegExp(re_date.ISO + "(?:.+" + re_date.ISO + ")?"))) {
							MB.relationshipEditor.UI.checkedWorks().forEach(function(work) {
								work.relationships().forEach(function(relationship) {
									if (
										relationship.entityTypes == "recording-work"
										&& checkedRelationships[relationship.entities.saved[0].gid + "-" + relationship.entities.saved[1].gid]
									) {
										relationship.begin_date.year(date[2]);
										relationship.begin_date.month(date[3]);
										relationship.begin_date.day(date[4]);
										relationship.end_date.year(date[5] ? date[6] : date[2]);
										relationship.end_date.month(date[5] ? date[7] : date[3]);
										relationship.end_date.day(date[5] ? date[8] : date[4]);
									}
								});
							});
						} else { alert("Wrong date format"); }
					}
				}
			}}}, [meta.icon.cloneNode(false), " Set selected works’ recording dates ", createTag("small", {s: {color: "grey"}}, "← TRACKLIST_TOOLS™")]));
		}
	}
	/*================================================================ DISPLAY-
	## UNLINK_ENTITY_HEADER ## (default off) Freso special request (https://gist.github.com/jesus2099/4111760)
	=========================================================================*/
	if (j2sets.UNLINK_ENTITY_HEADER) {
		var h1link = document.querySelector("div#page h1 a[href='" + self.location.pathname.match(new RegExp("/" + enttype + "/" + stre_GUID)) + "']");
		if (h1link) {
			var h1 = getParent(h1link, "h1");
			if (h1.firstChild.nodeType != Node.TEXT_NODE) {
				debug("UNLINK_ENTITY_HEADER");
				var unlinkH1Link = function() {
					h1.removeEventListener("mouseover", unlinkH1Link);
					h1link.removeAttribute("href");
				};
				h1.addEventListener("mouseover", unlinkH1Link);
			}
		}
	}
	/*================================================================ DISPLAY+
	## RECORDING_LENGTH_COLUMN ## inspired by loujine’s https://bitbucket.org/loujine/musicbrainz-scripts/src/default/mbz-showperformancedurations.user.js for work page
	## RELEASE_EVENT_COLUMN ## requested by Lotheric https://github.com/jesus2099/konami-command/issues/132
	=========================================================================*/
	if (
		j2sets.RECORDING_LENGTH_COLUMN && (enttype == "work" && self.location.pathname.match(new RegExp("^/work/" + stre_GUID + "$")) || enttype == "artist" && self.location.pathname.match(new RegExp("^/artist/" + stre_GUID + "/relationships$")) || enttype == "place" && self.location.pathname.match(new RegExp("^/place/" + stre_GUID + "/performances$")))
		||
		j2sets.RELEASE_EVENT_COLUMN && self.location.pathname.match(new RegExp("^/(artist|label)/" + stre_GUID + "/relationships$"))
	) {
		debug("RECORDING_LENGTH_COLUMN and/or RELEASE_EVENT_COLUMN");
		var relationshipTable = document.querySelector("div#content table.tbl");
		if (relationshipTable) {
			var fetchRecordingLength = j2sets.RECORDING_LENGTH_COLUMN && relationshipTable.getElementsByClassName("treleases").length == 0 && relationshipTable.querySelector("a[href*='/recording/']");
			var fetchReleaseEvents = j2sets.RELEASE_EVENT_COLUMN && relationshipTable.getElementsByClassName(userjs + "releaseEvents").length == 0 && relationshipTable.querySelector("a[href*='/release/']");
			if (fetchRecordingLength || fetchReleaseEvents) {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("load", function(event) {
					var relations = JSON.parse(this.responseText).relations;
					var recordingLengths = {};
					var recordingLengthFound = false;
					var releaseEvents = {};
					var releaseEventFound = false;
					// collecting recording length and release events
					for (var r = 0; r < relations.length; r++) {
						if (fetchRecordingLength && relations[r].recording && relations[r].recording.id && relations[r].recording.length) {
							recordingLengthFound = true;
							recordingLengths[relations[r].recording.id] = relations[r].recording.length;
						}
						if (fetchReleaseEvents && relations[r].release && relations[r].release.id && relations[r].release["release-events"]) {
							releaseEventFound = true;
							releaseEvents[relations[r].release.id] = relations[r].release["release-events"];
						}
					}
					if (recordingLengthFound || releaseEventFound) {
						// column headers
						if (recordingLengthFound) {
							relationshipTable.querySelector("thead > tr").appendChild(createTag("th", {a: {title: meta.name, class: "treleases"}, s: {textShadow: "0 0 2px yellow"}}, "Length"));
						}
						if (releaseEventFound) {
							relationshipTable.querySelector("thead > tr").insertBefore(createTag("th", {a: {title: meta.name, class: userjs + "releaseEvents"}, s: {textShadow: "0 0 2px yellow"}}, "Release events"), relationshipTable.querySelector("thead > tr > th:nth-child(2)"));
						}
						var rows = relationshipTable.querySelectorAll("tbody > tr");
						for (var r = 0; r < rows.length; r++) {
							if (rows[r].classList.contains("subh")) {
								// sub title row
								if (recordingLengthFound) {
									var lastHeader = rows[r].querySelector("tr.subh > th + th[colspan]");
									if (lastHeader) {
										lastHeader.setAttribute("colspan", parseInt(lastHeader.getAttribute("colspan"), 10) + 1);
									}
								}
								if (releaseEventFound) {
									var secondHeader = rows[r].querySelector("tr.subh > th:nth-child(2)");
									if (secondHeader) {
										rows[r].insertBefore(document.createElement("th"), secondHeader);
									}
								}
							} else {
								// normal data row
								if (recordingLengthFound) {
									var newCell = createTag("td", {a: {class: "treleases"}, s: {textAlign: "right"}});
									var recordingID = rows[r].querySelector("a[href*='/recording/']");
									if (recordingID && (recordingID = recordingID.getAttribute("href").match(re_GUID)[0]) && recordingLengths[recordingID]) {
										newCell.appendChild(document.createTextNode(time(recordingLengths[recordingID])));
									}
									rows[r].appendChild(newCell);
								}
								if (releaseEventFound) {
									var secondCell = rows[r].querySelector("tr:not(.subh) > td:nth-child(2)");
									if (secondCell) {
										var newCell = rows[r].insertBefore(document.createElement("td"), secondCell);
										var releaseID = secondCell.querySelector("a[href*='/release/']");
										if (releaseID && (releaseID = releaseID.getAttribute("href").match(re_GUID)[0]) && releaseEvents[releaseID]) {
											for (var e = 0; e < releaseEvents[releaseID].length; e++) {
												var releaseDate = releaseEvents[releaseID][e].date ? releaseEvents[releaseID][e].date : "\u00a0";
												var releaseEvent = createTag("div", {}, releaseDate);
												if (releaseEvents[releaseID][e].area) {
													if (releaseEvents[releaseID][e].area.name) {
														releaseEvent.setAttribute("title", releaseEvents[releaseID][e].area.name);
													}
													if (releaseEvents[releaseID][e].area["iso-3166-1-codes"] && releaseEvents[releaseID][e].area["iso-3166-1-codes"].length > 0) {
														releaseEvent.className = "flag flag-" + releaseEvents[releaseID][e].area["iso-3166-1-codes"][0];
													}
												}
												newCell.appendChild(releaseEvent);
											}
										}
									}
								}
							}
						}
					}
				});
				xhr.open("get", MBS + "/ws/2" + self.location.pathname.match(new RegExp("^/" + enttype + "/" + stre_GUID)) + "?inc=recording-rels+release-rels&fmt=json", true);
				xhr.send(null);
			}
		}
	}
}
/* --- ENTITY BONUS functions --- */
var TRACKLIST_TOOLS_calmDOMto;
function TRACKLIST_TOOLS_calmDOM() {
	if (TRACKLIST_TOOLS_calmDOMto) {
		clearTimeout(TRACKLIST_TOOLS_calmDOMto);
	}
	TRACKLIST_TOOLS_calmDOMto = setTimeout(TRACKLIST_TOOLS_init, 100);
}
function TRACKLIST_TOOLS_buttonHandler(event) {
	if (event.target.className.match(new RegExp("^" + userjs + "(search-replace|track-length-parser)$"))) {
		if (event.type == "click") {
			/* :::: TRACK NAME SEARCH→REPLACE :::: */
			if (event.target.classList.contains(userjs + "search-replace")) {
				var searchrep = localStorage.getItem(userjs + "search-replace");
				searchrep = searchrep ? JSON.parse(searchrep) : ["", ""];
				if (
					(searchrep[0] = prompt("search\n\neither regex (case *i*nsensitive and *g*lobal are optional flags): /\"([^\"]+)\"/g\n\nor normal (case sensitive and global): My String", searchrep[0]))
					&& (searchrep[1] = prompt("replace\n\nif it was a regex, you can use those $1 $2 $3 etc.: “$1”", searchrep[1])) != null
				) {
					for (var t = 0, tracks = TRACKLIST_TOOLS_getInputs("td.title > input.track-name[type='text']", event.target, event); t < tracks.length; t++) {
						var val = searchrep[0].match(/^\/.+\/[gi]*$/) ? tracks[t].value.replace(eval(searchrep[0]), searchrep[1]) : tracks[t].value.split(searchrep[0]).join(searchrep[1]);
						tracks[t].style.removeProperty("background-color");
						if (tracks[t].value != val) {
							tracks[t].value = val;
							tracks[t].style.setProperty("background-color", "yellow");
							tracks[t].focus();
							sendEvent(tracks[t], "change");
						}
					}
					localStorage.setItem(userjs + "search-replace", JSON.stringify(searchrep));
				}
			/* :::: TRACK LENGTH PARSER :::: */
			} else if (event.target.classList.contains(userjs + "track-length-parser")) {
				var erase = event.target.textContent.match(/erase/i) || event.ctrlKey;
				var inputs = TRACKLIST_TOOLS_getInputs("td.length > input.track-length[type='text']:not(.disabled-hint)", event.target, event);
				var distitle = document.querySelector("td.length > input.track-length[type='text'].disabled-hint");
				var times = !erase && prompt("Track length parser\n\nPlease paste your huge text including track times below.\n“1:23” and “1′23″” and even incorrect “1’23”” and “1'23\"” will be parsed.\nYou can for instance copy from your foobar2000 tracklist, minc.or.jp, etc.\nWARNING. You must understand that all current times will be overwritten in the tracklist editor.");
				if (inputs.length == 0 && distitle) {
					distitle = distitle.getAttribute("title") || "No track length found.";
					event.target.setAttribute("disabled", "disabled");
					event.target.setAttribute("title", distitle);
					alert(distitle);
				} else if (erase && confirm("Are you sure you want to ERASE all track times?") || times && (times = times.match(/\b\d{1,3}[:′’']\d\d\b[″”"]?/g))) {
					if (erase || inputs.length == times.length || confirm("ACHTUNG, detected times and tracks count mismatch.\nThere are " + times.length + " lengths detected in your text, butt\nthere are " + inputs.length + " tracks in the tracklist.\nAre you sure to go on?")) {
						for (var t = 0, i = 0; (erase || t < times.length) && i < inputs.length; t++, i++) {
							var time = "";
							if (!erase) {
								time = times[t].match(/(\d+)\D+(\d+)/);
								time = time[1] + ":" + time[2];
							}
							inputs[i].style.removeProperty("background-color");
							if (inputs[i].value != time) {
								inputs[i].value = time;
								inputs[i].style.setProperty("background-color", erase ? "pink" : "yellow");
								inputs[i].focus();
								sendEvent(inputs[i], "change");
							}
						}
					}
				}
			}
		} else if (event.type.match(/^mouse(over|out)$/)) {
			var _text = event.target.getAttribute("_text");
			var _ctrlText = event.target.getAttribute("_ctrlText");
			switch (event.type) {
				case "mouseover":
					if (!_text) { event.target.setAttribute("_text", event.target.textContent); }
					if (event.ctrlKey && _ctrlText) {
						event.target.style.setProperty("background-color", "pink");
						event.target.replaceChild(document.createTextNode(_ctrlText), event.target.firstChild);
					}
					if (event.shiftKey) {
						if (!(event.ctrlKey && _ctrlText)) { event.target.style.setProperty("background-color", "gold"); }
						event.target.replaceChild(document.createTextNode(event.target.textContent + " (all)"), event.target.firstChild);
					}
					break;
				case "mouseout":
					event.target.style.setProperty("background-color", "yellow");
					event.target.replaceChild(document.createTextNode(_text), event.target.firstChild);
					break;
			}
		}
	}
}
function TRACKLIST_TOOLS_getInputs(inputCSS, obj, evt) {
	var inputs = getParent(obj, "fieldset", "advanced-disc");
	if (obj.value.match(/\(all\)/i) || evt.shiftKey) { inputs = inputs.parentNode; }
	return inputs.querySelectorAll("fieldset.advanced-disc " + inputCSS);
}
function TRACKLIST_TOOLS_init() {
	debug("TRACKLIST_TOOLS_init");
	re.removeEventListener("DOMNodeInserted", TRACKLIST_TOOLS_calmDOM);
	re.addEventListener("DOMNodeInserted", function(event) {
		var tps = this.querySelectorAll("#tracklist-tools button[data-click='openTrackParser']");
		for (var tp = 0; tp < tps.length; tp++) {
			if (!tps[tp].parentNode.querySelector("." + userjs + "track-length-parser")) {
				addAfter(createTag("button", {a: {type: "button", "class": userjs + "track-length-parser", "_ctrlText": "Erase times", title: "CONTROL key to ERASE track times\nSHIFT key to alter all open tracklists"}, s: {backgroundColor: "yellow"}}, "Time Parser"), tps[tp]);
			}
			if (!tps[tp].parentNode.querySelector("." + userjs + "search-replace")) {
				addAfter(createTag("button", {a: {type: "button", "class": userjs + "search-replace", title: "SHIFT key to alter all open tracklists"}, s: {backgroundColor: "yellow"}}, "Search→replace"), tps[tp]);
			}
		}
	}, false);
}
function time(_ms) {/* adapted from mb_INLINE-TRACK-ARTIST */
	var ms = typeof _ms == "string" ? parseInt(_ms, 10) : _ms;
	if (ms > 0) {
		var d = new Date(ms);
		return d.getUTCMinutes() + ":" + (d.getUTCSeconds() / 100).toFixed(2).slice(2) + "." + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2);
	}
	return "?:??";
}
function debug(txt, buffer) {
	if (DEBUG) {
		if (buffer) {
			debugBuffer += txt + "\r\n";
		} else {
			console.log(meta.name + "\r\n" + debugBuffer + txt);
			debugBuffer = "";
		}
	}
}
