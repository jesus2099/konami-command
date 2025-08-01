// ==UserScript==
// @name         mb. SUPER MIND CONTROL Ⅱ X TURBO
// @version      2025.8.3
// @description  musicbrainz.org power-ups: RELEASE_CLONER. copy/paste releases / DOUBLE_CLICK_SUBMIT / CONTROL_ENTER_SUBMIT / TRACKLIST_TOOLS. search→replace, track length parser, remove recording relationships, set selected recording dates / LAST_SEEN_EDIT. handy for subscribed entities / COOL_SEARCH_LINKS / COPY_TOC / ROW_HIGHLIGHTER / SPOT_CAA / SPOT_AC / RECORDING_LENGTH_COLUMN / RELEASE_EVENT_COLUMN / WARN_NEW_WINDOW / SERVER_SWITCH / TAG_TOOLS / USER_STATS / EASY_DATE. paste full dates in one go / STATIC_MENU / SLOW_DOWN_RETRY / CENTER_FLAGS / RATINGS_ON_TOP / HIDE_RATINGS / UNLINK_ENTITY_HEADER / MARK_PENDING_EDIT_MEDIUMS
// @namespace    https://github.com/jesus2099/konami-command
// @homepage     https://github.com/jesus2099/konami-command/blob/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.md
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SUPER-MIND-CONTROL-II-X-TURBO
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2010-09-09; https://web.archive.org/web/20140328200933/userscripts.org/scripts/show/85790 / https://web.archive.org/web/20141011084019/userscripts-mirror.org/scripts/show/85790 / see topic GÓ GÓ AMÍGO
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/bcceaa5f3da43e9ee805cba2eccda07f602d3f0c/lib/MB-JUNK-SHOP.js?version=2024.8.26
// @require      https://github.com/jesus2099/konami-command/raw/7e350a72575bc729e9aa58af6796dadc2eca685d/lib/SUPER.js?version=2024.12.3
// @grant        none
// @match        *://*.musicbrainz.org/*
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
"use strict";

let userjs = {
	id: "jesus2099userjs85790", // have to keep this for legacy saved settings
	name: GM_info.script.name.substr(4).replace(/\s/g, "\u00a0"),
	icon: createTag("img", {a: {src: GM_info.script.icon}, s: {verticalAlign: "middle", margin: "-8px 0"}})
};
var debugBuffer = "";
var DEBUG = false;
var pageType = location.pathname.match(/(area(?!.+(artists|labels|releases|places|aliases|edits))|artist(?!.+(releases|recordings|works|relationships|aliases|edits))|artists|event|labels|releases|recordings|report|series|track|works|aliases|cdtoc|collection(?!s|.+edits)|collections|edit(?!s|\/subscribed)|edits|votes|edit\/subscribed|isrc|label(?!.+edits)|place(?!.+(aliases|edits))|ratings|recording(?!s|.+edits)|relationships|release[-_]group(?!.+edits)|release(?!s|-group|.+edits)|search(?!\/edits)|tracklist|tag|url|work(?!s))/);
if (pageType) {
	pageType = pageType[1].replace(/edit\/subscribed|votes/, "edits").replace(/_/, "-");
} else {
	pageType = "other";
}
debug("Page type: " + pageType);
var MBS = location.protocol + "//" + location.host;
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
re_date.ISO = "(" + re_date.YYYY + "(?:[-‐‑‒–—−/.] ?" + re_date.MM + "(?:[-‐‑‒–—−/.] ?" + re_date.DD + ")?)?)";
var account = document.querySelector("div.header ul.menu li.account");
if (account) {
	var a = account.querySelector("a[href^='/user/']");
	account = {
		item:     account,
		name:     unescape(a.getAttribute("href").match(/[^/]+$/)),
		pathname: a.getAttribute("href"),
		menu:     account.querySelector("ul")
	};
}
// ==========================================================================
// ## CONFIGURATORZ ##
// find this script settings in MB "About" menu
// ==========================================================================
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
		if (j2superturbo.css !== null) {
			j2superturbo.css.insertRule(CSSRule, j2superturbo.css.cssRules.length);
		} else {
			debug("Style is ignored because of CSP restricted page (" + location.pathname + "):\n" + CSSRule);
		}
	}
};
j2superturbo.css = document.createElement("style");
j2superturbo.css.setAttribute("type", "text/css");
// Pages like /account/* and /admin/* prohibit inline css:
// Content-Security-Policy: style-src 'self' staticbrainz.org;
// Missing 'unsafe-inline'
document.head.appendChild(j2superturbo.css);
// sheet is null if <style> was (appended but) not applied
j2superturbo.css = j2superturbo.css.sheet;
var j2sets = {}, j2docs = {}, j2defs = {}, j2setsclean = [];
j2setting();
j2superturbo.menu.addItem(createTag("a", {a: {title: "Settings:\n" + GM_info.script.description.replace(/^[^:]+: /, "").replace(/ \/ /g, "\n")}, e: {click: function(event) {
	var j2setsdiv = document.getElementById(userjs.id + "j2sets");
	if (!j2setsdiv) {
		j2setting();
		if (j2sets) {
			j2setsdiv = document.body.insertBefore(createTag("div", {a: {id: userjs.id + "j2sets"}, s: {backgroundColor: "silver", border: "2px outset white", padding: "1em"}}, [
				createTag("p", {s: {textAlign: "right", margin: "0px"}}, [
					createTag("a", {a: {href: GM_info.script.homepage, target: "_blank"}}, "HELP"),
					" | ",
					createTag("a", {a: {href: GM_info.script.supportURL, target: "_blank"}}, "known issues"),
					" | ",
					createTag("a", {e: {click: function(event) { if (confirm("RESET ALL YOUR SETTINGS TO DEFAULT?")) { localStorage.removeItem(userjs.id + "settings"); location.reload(); } }}}, "RESET"),
					" | ",
					createTag("a", {e: {click: function(event) { removeNode(document.getElementById(userjs.id + "j2sets")); }}}, "CLOSE"),
				]),
				createTag("h4", {s: {textShadow: "0 0 8px white", fontSize: "1.5em", marginTop: "0px"}}, [
					"██ ",
					createTag("a", {a: {href: GM_info.script.namespace, target: "_blank"}}, userjs.name),
					" (" + GM_info.script.version + ")"
				]),
				createTag("p", {}, [
					"All settings are instantly saved but require a ",
					createTag("a", {e: {click: function() {
						location.reload();
					}}}, "PAGE RELOAD"),
					" to see the effect."
				])
			]), document.getElementById("page"));
			var alphakeys = [];
			for (let s in j2sets) if (Object.prototype.hasOwnProperty.call(j2sets, s)) {
				if (j2setsclean.indexOf(s) < 0) {
					delete j2sets[s];
				} else if (!s.match(/!/)) {
					alphakeys.push(s);
				}
			}
			alphakeys.sort();
			var table = j2setsdiv.appendChild(createTag("table", {a: {border: "2", cellpadding: "4", cellspacing: "1"}}));
			table.appendChild(createTag("thead", {}, [createTag("th", {}, "setting"), createTag("th", {}, "default setting"), createTag("th", {}, "description")]));
			table = table.appendChild(document.createElement("tbody"));
			for (let a = 0; a < alphakeys.length; a++) {
				var tr = table.appendChild(document.createElement("tr"));
				tr.appendChild(createTag("th", {s: {backgroundColor: "#ccc", textAlign: "left", paddingLeft: alphakeys[a].match(/[a-z]/) ? "2em" : "inherit"}}, j2settinput(alphakeys[a])));
				tr.appendChild(createTag("td", {s: {opacity: ".666", textAlign: "center"}}, typeof j2defs[alphakeys[a]] == "boolean" ? (j2defs[alphakeys[a]] ? "☑" : "☐") : j2defs[alphakeys[a]]));
				tr.appendChild(createTag("td", {s: {marginBottom: ".4em"}}, j2docit(j2docs[alphakeys[a]]).concat([" — ", createTag("a", {a: {href: GM_info.script.homepage + "#" + alphakeys[a].toLowerCase(), target: "_blank"}}, "more help…")])));
			}
		}
	}
	j2setsdiv.scrollIntoView();
}}}, [userjs.icon.cloneNode(false), " " + userjs.name + " (" + GM_info.script.version + ")"]));
function bug(error) {
	var title = "", alrt = userjs.name + " (" + GM_info.script.version + ")" + " ERROR";
	if (error.module) {
		title = " in “" + error.module + "” module";
		alrt += title;
	}
	if (error.message) {
		title = error.message + title;
		alrt += "\n\n" + error.message;
	}
	if (error.report && title) {
		if (confirm(alrt + "\n\nDo you want to report the bug?\n(requires github account)\n(will open in a NEW WINDOW)")) {
			open("https://github.com/jesus2099/konami-command/issues/new?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent("Hello,\nI am using that awesome *" + userjs.name + "* (**" + GM_info.script.version + "**).\nI got an error while I was on [" + (document.title ? document.title : "that page") + "](" + location.href + "):\n\n    " + error.message.replace(/\n/g, "\n    ")));
		}
	} else {
		alert(alrt);
	}
}
function j2setting(setting, val, def, doc) {
	if (setting == null) {
		j2sets = localStorage.getItem(userjs.id + "settings");
		if (j2sets) { j2sets = JSON.parse(j2sets); } else { j2sets = {}; }
	} else {
		if (doc) {
			j2docs[setting] = doc;
		}
		if (def) {
			j2defs[setting] = val;
			j2setsclean.push(setting);
		}
		if (val != null && (!def || j2sets[setting] == null)) {
			j2sets[setting] = val;
			localStorage.setItem(userjs.id + "settings", JSON.stringify(j2sets));
		} else if (setting) {
			return j2sets[setting];
		}
	}
}
function j2settinput(setting) {
	var val = j2setting(setting);
	var rnd = (Math.random() + "").substring(2);
	var lbl = createTag("label", {a: {"for": userjs.id + enttype + setting + rnd}, s: {whiteSpace: "nowrap", textShadow: "1px 1px 2px #999"}}, createTag("input", {a: {type: "checkbox", id: userjs.id + enttype + setting + rnd, class: setting}, e: {change: function(event) {
		j2setting(this.className, this.getAttribute("type") == "checkbox" ? this.checked : this.value);
	}}}));
	var inp = lbl.querySelector("input");
	switch (typeof val) {
		case "boolean":
			addAfter(document.createTextNode(setting), inp);
			inp.setAttribute("type", "checkbox");
			inp.checked = val;
			break;
		default:
			lbl.insertBefore(document.createTextNode("\u00a0_\u00a0 " + setting), inp);
			inp.setAttribute("type", "text");
			inp.setAttribute("value", val);
			inp.style.setProperty("margin-left", "4px");
			inp.addEventListener("keypress", function(event) { if (event.key == "Enter") { this.blur(); removeNode(getParent(this, "div")); } }, false);
			break;
	}
	return lbl;
}
function j2docit(txt) {
	var jira = txt.match(/\b(MBS-\d+)\b/);
	if (jira) {
		var arr = txt.split(jira[1]);
		arr.splice(1, 0, createTag("a", {a: {href: "http://tickets.musicbrainz.org/browse/" + jira[1].toUpperCase(), target: "_blank", title: "Opens in new window"}}, jira[1]));
		return arr;
	} else return [txt];
}
// ==================================================================== LINK+
// ## RELEASE_CLONER ##
// todo : add debugged clone release-AR module
// ==========================================================================
j2setting("RELEASE_CLONER", true, true, "one-click duplicate release(s)" + j2superturbo.menu.expl);
j2setting("RELEASE_CLONER_release_event", false, true, "clones release event(s), package, catalogue number(s), etc. (not advised as those usually change for each edition)");
j2setting("RELEASE_CLONER_additional_information", false, true, "clones annotation and disambiguation (usually change for each edition)");
j2setting("RELEASE_CLONER_external_links", false, true, "(EXPERIMENTAL) clones URL relations (not advised as those usually change for each edition)");
j2setting("RELEASE_CLONER_tracktimes", false, true, "clones track times (mastering sometimes change for some edition)");
if (j2sets.RELEASE_CLONER && account) {
	var rcwhere = location.pathname.match(new RegExp("^/((release(?!-group)|release-group|label)/" + stre_GUID + ")|artist/" + stre_GUID + "/(releases)$"));
	if (
		rcwhere && (rcwhere = rcwhere[2] ? rcwhere[2] : rcwhere[3])
	) {
		if (account) {
			debug("RELEASE_CLONER");
			j2superturbo.menu.addItem(createTag("a", {a: {title: userjs.name + "\nshift+click to open new tab / ctrl+click for background tab" + (rcwhere != "release" ? "\nno need to select if there is only one release on this page" : "")}, e: {click: function(clickEvent) {
				var crmbids = [];
				if (rcwhere == "release") {
					crmbids.push("" + location.pathname.match(re_GUID));
				} else {
					var checkrels = document.querySelectorAll("table.tbl > tbody input[type='checkbox'][name='add-to-merge']");
					for (let crmbid, cr = 0; cr < checkrels.length; cr++) {
						if ((checkrels[cr].checked || checkrels.length == 1) && (crmbid = getParent(checkrels[cr], "tr")) && (crmbid = crmbid.querySelector("a[href*='/release/']").getAttribute("href").match(re_GUID))) {
							crmbids.push("" + crmbid);
						}
					}
				}
				if (crmbids.length > 0) {
					if (confirm("This will (you can change the settings):\n\n* " + (j2sets.RELEASE_CLONER_release_event ? "" : "NOT ") + "copy release events\n* " + (j2sets.RELEASE_CLONER_additional_information ? "" : "NOT ") + "copy additional information\n* " + (j2sets.RELEASE_CLONER_external_links ? "" : "NOT ") + "copy external links\n* " + (j2sets.RELEASE_CLONER_tracktimes ? "" : "NOT ") + "copy track times")) {
						for (let crr = crmbids.length - 1; crr >= 0; crr--) {
							var xhr_release_cloner = new XMLHttpRequest();
							xhr_release_cloner.onload = function(event) {
								var release = JSON.parse(this.responseText);
								var reled = {
									form: createTag("form", {a: {action: "/release/add", method: "post", target: formTarget(crr, clickEvent)}, s: {display: "none"}}),
									add: function(data, requestParameter, required) {
										if (data) {
											// console.log(requestParameter + " = " + data);
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
									if (release["release-events"]) for (let resi = 0; resi < release["release-events"].length && ok; resi++) {
										var date = release["release-events"][resi].date;
										if (date) {
											var datex;
											if ((datex = date.match(/^(\d{4})/))) ok &= reled.add(datex[1], "events." + resi + ".date.year");
											if ((datex = date.match(/^.{4}-(\d{2})/))) ok &= reled.add(datex[1], "events." + resi + ".date.month");
											if ((datex = date.match(/^.{4}-.{2}-(\d{2})$/))) ok &= reled.add(datex[1], "events." + resi + ".date.day");
											if (release["release-events"][resi].area && release["release-events"][resi].area["iso-3166-1-codes"] && release["release-events"][resi].area["iso-3166-1-codes"].length > 0) ok &= reled.add(release["release-events"][resi].area["iso-3166-1-codes"][0], "events." + resi + ".country");
										}
									}
									/* ws:release-event-list */
									ok &= reled.add(release.status, "status");
									ok &= reled.add(release.packaging, "packaging");
									/* ws:label-info-list */
									for (let resi = 0; resi < release["label-info"].length && ok; resi++) {
										if (release["label-info"][resi].label) ok &= reled.add(release["label-info"][resi].label.id, "labels." + resi + ".mbid");
										ok &= reled.add(release["label-info"][resi]["catalog-number"], "labels." + resi + ".catalog_number");
									}
									/* ws:label-info-list */
								}
								ok &= reled.add(release["text-representation"].language, "language");
								ok &= reled.add(release["text-representation"].script, "script");
								/* ws:artist-credit */
								for (let resi = 0; resi < release["artist-credit"].length && ok; resi++) {
									ok &= reled.add(release["artist-credit"][resi].artist.id, "artist_credit.names." + resi + ".mbid");
									ok &= reled.add(release["artist-credit"][resi].name, "artist_credit.names." + resi + ".name");
									ok &= reled.add(release["artist-credit"][resi].joinphrase, "artist_credit.names." + resi + ".join_phrase");
								}
								/* ws:artist-credit */
								/* ws:medium-list */
								for (let resi = 0; resi < release.media.length && ok; resi++) {
									ok &= reled.add(release.media[resi].format, "mediums." + resi + ".format");
									ok &= reled.add(release.media[resi].title, "mediums." + resi + ".name");
									for (let tr = 0; tr < release.media[resi].tracks.length; tr++) {
										ok &= reled.add(release.media[resi].tracks[tr].title, "mediums." + resi + ".track." + tr + ".name");
										ok &= reled.add(release.media[resi].tracks[tr].number, "mediums." + resi + ".track." + tr + ".number");
										ok &= reled.add(release.media[resi].tracks[tr].recording.id, "mediums." + resi + ".track." + tr + ".recording");
										/* ws:artist-credit */
										for (let aci = 0; aci < release.media[resi].tracks[tr]["artist-credit"].length && ok; aci++) {
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
									/* ws:url-rels */
									var linkTypes = {
										"unknown29unknown29unknown29unknown29":  29, // notes
										"unknown72unknown72unknown72unknown72":  72, // production
										"unknown73unknown73unknown73unknown73":  73, // get
										"98e08c20-8402-4163-8970-53504bb6a1e4":  74, // buy download
										"9896ecd0-6d29-482d-a21e-bd5d1b5e3425":  75, // download
										"4a78823c-1c53-4176-a5f3-58026c76f2bc":  76, // discogs
										"4f2e710d-166c-480c-a293-2e2c8d658d87":  77, // ASIN
										"2476be45-3090-43b3-a948-a8f972b4065c":  78, // cover art
										"3ee51e05-a06a-415e-b40c-b3f740dedfd7":  79, // buy mail
										"c74dee45-3c85-41e9-a804-92ab1c654446":  82, // other db
										"7387c5a2-9abe-4515-b667-9eb5ed4dd4ce":  83, // IMDb
										"08445ccf-7b99-4438-9f9a-fb9ac18099ee":  85, // stream
										"6af0134a-df6a-425a-96e2-895f9cd342ba":  86, // VGMdb
										"823656dd-0309-4247-b282-b92d287d59c5": 288, // discography
										"004bd0c3-8a45-4309-ba52-fa99f3aa3d50": 301, // licence
										"0e555925-1b7d-475c-9b25-b9c349dcc3f3": 308, // 2ndhandsong
										"2d24d075-9943-4c4d-a659-8ce52e6e6b57": 729, // notes
										"90ff18ad-3e9d-4472-a3d1-71d4df7e8484": 755, // allmusic
										"63b84620-ba52-4630-9bfe-8ad3b5504dff": 850, // bookbrainz
									};
									for (let resi = 0; resi < release.relations.length && ok; resi++) {
										if (release.relations[resi].url) {
											ok &= reled.add(linkTypes[release.relations[resi]["type-id"]], "urls." + resi + ".link_type");
											ok &= reled.add(release.relations[resi].url.resource, "urls." + resi + ".url");
										}
									}
									/* ws:url-rels */
								}
								ok &= reled.add("\n —\n" + MBS + "/release/" + crmbids[crr] + " cloned using " + userjs.name + "’s '''RELEASE_CLONER''' (" + GM_info.script.version + ")", "edit_note");
								/* fin */
								if (ok) document.body.appendChild(reled.form).submit();
								else sendEvent(this, "error");
							};
							xhr_release_cloner.onerror = function(event) {
								if (confirm("RELEASE_CLONER ERROR MY GOD\nDo you want to report this error? (in a new window)")) {
									open("https://github.com/jesus2099/konami-command/issues/new?title=RELEASE_CLONER+xhr_release_cloner+error&body=" + encodeURIComponent("Hello,\nI am using *" + userjs.name + "* version **" + GM_info.script.version + "**.\nI got an error while cloning [this release](" + MBS + "/release/) on [that page](" + location.href + ").\n"));
								}
							};
							xhr_release_cloner.open("get", MBS + "/ws/2/release/" + crmbids[crr] + "?inc=artists+labels+recordings+release-groups+media+artist-credits+annotation+url-rels&fmt=json", false);
							xhr_release_cloner.send(null);
						}
					}
				} else {
					alert("Please select at least one release.");
				}
			}}}, [userjs.icon.cloneNode(false), " Clone " + (rcwhere == "release" ? "release" : "selected releases") + " ", createTag("small", {s: {color: "grey"}}, "← RELEASE_CLONER™")]));
		}
	}
}
function formTarget(releaseIndex, event) {
	var target = "_self";
	if (event.ctrlKey || releaseIndex > 0) {
		target = userjs.id + (new Date().getTime());
		try {
			open("", target).blur();
		} catch (error) {}
		self.focus();
	} else if (event.shiftKey) {
		target = "_blank";
	}
	return target;
}
// ================================================================= DISPLAY+
// ## USER_STATS ##
// ==========================================================================
j2setting("USER_STATS", true, true, "adds convenient edit stats to user page (percentage of yes/no voted edits) and cool links like edit note searches");
if (j2sets.USER_STATS && location.pathname.match(/^\/user\/[^/]+$/)) {
	var stats = document.querySelectorAll("table.statistics > tbody");
	var editor = {
		pathname: location.pathname.substr(location.pathname.lastIndexOf("/") + 1)
	};
	if (!isEncoded(editor.pathname)) {
		// Opera 12 alone is surprisingly decoding location.pathname
		editor.pathname = encodeURIComponent(editor.pathname);
	}
	editor.name = decodeURIComponent(editor.pathname);
	if (stats.length >= 3) {
		debug("USER_STATS");
		// Edits
		var cell_acceptedEdits = getParent(stats[0].querySelector("a[href$='/edits/accepted']"), "td");
		var cell_voteddownEdits = getParent(stats[0].querySelector("a[href$='/edits/rejected']"), "td");
		var cell_appliedEdits = getParent(stats[0].querySelector("a[href$='/edits/applied']"), "td");
		var nb_acceptedEdits = readStat(cell_acceptedEdits);
		var nb_voteddownEdits = readStat(cell_voteddownEdits);
		var nb_totalNonAuto = nb_acceptedEdits + nb_voteddownEdits;
		writeStat(cell_acceptedEdits, nb_acceptedEdits, nb_totalNonAuto);
		cell_acceptedEdits.style.setProperty("font-weight", "bold");
		writeStat(cell_voteddownEdits, nb_voteddownEdits, nb_totalNonAuto);
		cell_voteddownEdits.style.setProperty("font-weight", "bold");
		cell_appliedEdits.parentNode.replaceChild(createTag("th", null, createTag("a", {a: {href: "/statistics/editors", title: "See top editors"}, s: {cursor: "help"}}, cell_appliedEdits.parentNode.firstChild.textContent)), cell_appliedEdits.previousSibling);
		// Votes
		editor.id = stats[0].querySelector("a[href^='/search/edits?']").getAttribute("href").match(/conditions\.0\.args\.0=(\d+)/)[1];
		var voteSearch = MBS + "/search/edits?conditions.0.field=voter&conditions.0.operator=%3D&conditions.0.name=%editorName%&conditions.0.voter_id=%editorID%&conditions.0.args=%vote%";
		voteSearch = voteSearch.replace(/%editorName%/, editor.pathname);
		voteSearch = voteSearch.replace(/%editorID%/, editor.id);
		for (let i = 0; i < stats[1].rows.length; i++) {
			var vote = stats[1].rows[i].cells[2];
			vote.replaceChild(createTag("a", {a: {href: voteSearch.replace(/%vote%/, {0: 1 /* Yes */, 1: 0 /* No */, 2: -1 /* Abstain */, 3: 2 /* Approve */}[i])}}, [vote.firstChild.cloneNode(true)]), vote.firstChild);
		}
		var yes = readStat(stats[1].rows[0].cells[2]);
		var no = readStat(stats[1].rows[1].cells[2]);
		var abstain = readStat(stats[1].rows[2].cells[2]);
		var approve = stats[1].rows.length > 3 ? readStat(stats[1].rows[3].cells[2]) : 0;
		if (approve > 0) {
			// Move Approve before Yes votes to include it in effective votes and leave Abstain last
			stats[1].insertBefore(stats[1].removeChild(stats[1].rows[3]), stats[1].rows[0]);
		}
		stats[1].insertBefore(
			createTag("tr", null, [
				createTag("th", null, createTag("a", {a: {href: "/statistics/editors", title: "See top voters"}, s: {cursor: "help"}}, "Total effective votes")),
				createTag("th", {a: {colspan: "2"}}, (0 + yes + no + approve).toLocaleString(lang) + " (" + percentage(yes + no + approve, yes + no + abstain + approve) + ")")
			]),
			stats[1].rows[stats[1].rows.length > 3 ? 3 : 2]
		);
		// Edit notes
		if (account && account.pathname !== "/user/" + editor.pathname) {
			var myEditNotes = "/search/edits?conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=%editorName%&conditions.0.args.0=%editorID%&conditions.1.field=edit_note_author&conditions.1.operator=me";
			var theirEditNotes = "/search/edits?conditions.0.field=editor&conditions.0.operator=me&conditions.1.field=edit_note_author&conditions.1.operator=%3D&conditions.1.name=%editorName%&conditions.1.args.0=%editorID%";
			var ourEditNotes = "/search/edits?conditions.0.field=editor&conditions.0.operator=not_me&conditions.1.field=editor&conditions.1.operator=%21%3D&conditions.1.name=%editorName%&conditions.1.args.0=%editorID%&conditions.2.field=edit_note_author&conditions.2.operator=me&conditions.3.field=edit_note_author&conditions.3.operator=%3D&conditions.3.name=%editorName%&conditions.3.args.0=%editorID%";
			stats[0].parentNode.previousSibling.parentNode.insertBefore(createTag("h2", {a: {title: userjs.name + " (USER_STATS)"}}, "Edit Notes"), stats[0].parentNode.previousSibling);
			stats[0].parentNode.previousSibling.parentNode.insertBefore(createTag("ul", {a: {title: userjs.name + " (USER_STATS)"}}, [
				createTag("li", {}, createTag("a", {a: {href: myEditNotes.replace(/%editorID%/, editor.id).replace(/%editorName%/, editor.pathname)}}, [createTag("b", {}, "Edits by " + editor.name), " (with my comments)"])),
				createTag("li", {}, createTag("a", {a: {href: theirEditNotes.replace(/%editorID%/, editor.id).replace(/%editorName%/, editor.pathname)}}, [createTag("b", {}, "Comments by " + editor.name), " (on my edits)"])),
				createTag("li", {}, createTag("a", {a: {href: ourEditNotes.replace(/%editorID%/g, editor.id).replace(/%editorName%/g, editor.pathname)}}, "Other edits with comments by both me and " + editor.name))
			]), stats[0].parentNode.previousSibling);
		}
		// Added entities
		var addedEntities = 0;
		var maxAddedEntities = 0;
		for (let i = 0; i < stats[2].rows.length; i++) {
			var added = readStat(stats[2].rows[i].cells[1]);
			maxAddedEntities = Math.max(maxAddedEntities, added);
			addedEntities += added;
		}
		stats[2].appendChild(
			createTag("tr", null, [
				createTag("th", null, "Total"),
				createTag("td", null, addedEntities.toLocaleString(lang))
			])
		);
		for (let i = 0; i < stats[2].rows.length - 1; i++) {
			writeStat(stats[2].rows[i].cells[1], readStat(stats[2].rows[i].cells[1]), addedEntities, maxAddedEntities);
		}
	}
}
function isEncoded(string) {
	// a mix of http://stackoverflow.com/a/30209048/2236179 and http://stackoverflow.com/a/8267593/2236179
	if (typeof string != "string") return false;
	var result;
	try {
		result = decodeURIComponent(string);
	} catch (error) {
		result = unescape(string);
	}
	return result != string;
}
function readStat(statsCell) {
	// fallback to 0 for very rare cases when a new entity type is not yet cached
	return parseInt(statsCell.textContent.split("(")[0].replace(/\D/g, ""), 10) || 0;
}
function writeStat(statsCell, stat, total, max) {
	var a = statsCell.getElementsByTagName("a")[0];
	a.replaceChild(document.createTextNode(percentage(stat, total)), a.firstChild);
	if (max !== 0) {
		statsCell.style.setProperty("background-color", "rgb(255, 255, " + (255 - Math.floor(stat / max * 255)) + ")");
		if (stat === max) {
			statsCell.style.setProperty("font-weight", "bold");
		}
	}
	if (parseInt(a.firstChild.textContent, 10) >= 25) {
		a.style.setProperty("background-color", "#ff6");
		getParent(statsCell, "tr").querySelector("th").style.setProperty("background-color", "#ff6");
	}
}
function percentage(p, c) {
	return (c == 0 ? 0 : Math.round(10000 * p / c / 100)) + "%";
}
// =============================================================== KEYBOARD+
// ## EASY_DATE ## basic paste-a-date!-like (https://web.archive.org/web/20131112023543/userscripts.org/scripts/show/121217)
// =========================================================================
j2setting("EASY_DATE", false, true, "You can paste full date in the YYYY field, it will split it\nascending D.M.YYYY or descending YYYY.M.D,\nalmost any format except american (MBS-1197)\n\nYou can freely type date, without tabulating, across year-month-date\n(with only digits 20241231, or with separators 2024.12/31)\n\nPress “c” to copy current date into the other (begin→end or end→begin)\nPress “d” to delete dates");
if (j2sets.EASY_DATE && !location.pathname.match(/^\/account\/edit/)) {
	document.addEventListener("focusin", function(event) {
		if (event.target.matches("input.partial-date-year, input.partial-date-month, input.partial-date-day")) {
			if (!event.target.closest("table.relationship-details, fieldset").querySelector(".jesus2099easydate")) {
				var doc = createTag("pre", {a: {class: "jesus2099easydate"}}, "EASY_DATE®\n----------\n\n" + j2docs.EASY_DATE);
				if (event.target.closest("fieldset")) {
					event.target.closest("fieldset").appendChild(createTag("div", {a: {class: "row"}}, doc));
				} else {
					event.target.closest("table.relationship-details").appendChild(createTag("tfoot", {}, createTag("tr", {}, createTag("td", {a: {colspan: "2"}}, doc))));
				}
			}
			event.target.select();
		}
	});
	document.addEventListener("paste", function(event) {
		if (event.target.matches("input.partial-date-year, input.partial-date-month, input.partial-date-day")) {
			var date = event.clipboardData.getData("text/plain").trim();
			// fullwidth to halfwidth
			date = date.replace(/[０-９]/g, function(d) {
				return String.fromCharCode(d.charCodeAt(0) - "０".charCodeAt(0) + "0".charCodeAt(0));
			});
			// remove non-digit prefix and suffix
			date = date.replace(/^\D+|\D+$/, "");
			if (!date.match(/\D/)) {
				date = date.match(new RegExp("^" + re_date.YYYY + "(?:" + re_date.MM + "(?:" + re_date.DD + ")?)?$"));
			} else {
				date = date.match(new RegExp("^(?:" + re_date.YYYY + "\\D+" + re_date.MM + "(?:\\D+" + re_date.DD + ")?|(?:" + re_date.DD + "\\D+)" + re_date.MM + "\\D+" + re_date.YYYY + "|" + re_date.YYYY + "\\D+" + re_date.M + "(?:\\D+" + re_date.D + ")?|(?:" + re_date.D + "\\D+)?" + re_date.M + "\\D+" + re_date.YYYY + "|" + re_date.YY + "\\D+" + re_date.M + "(?:\\D+" + re_date.D + ")?|(?:" + re_date.D + "\\D+)?" + re_date.M + "\\D+" + re_date.YY + ")$"));
			}
			if (date) {
				date = {
					year:  date[1] || date[6] || date[7] || date[12] || date[13] || date[18],
					month: date[2] || date[5] || date[8] || date[11] || date[14] || date[17],
					day:   date[3] || date[4] || date[9] || date[10] || date[15] || date[16]
				};
				for (var i in date) if (Object.prototype.hasOwnProperty.call(date, i) && date[i]) {
					if (i == "year" && date[i].length == 2) {
						// YY to YYYY
						date[i] = EASY_DATE_YY_to_YYYY(date[i]) + date[i];
					} else if (date[i].length == 1) {
						date[i] = "0" + date[i];
					}
					var input = event.target.closest(".partial-date").querySelector("input.partial-date-" + i);
					input.focus();
					forceValue(input, date[i]);
					input.style.setProperty("background-color", "#cfc");
				}
				if (event.target.matches("input:not([name^='edit-'])[name*='.begin_date.'], input:not([name^='edit-'])[name*='.end_date.']")) {
					EASY_DATE_cloneDate(event.target);
				}
				stop(event);
			} else {
				if (!date.match(/^\d\d\d\d$/)) event.target.style.setProperty("background-color", "#fcc");
				stop(event);
			}
		}
	});
	document.addEventListener("keydown", function(event) {
		if (event.target.matches("input.partial-date-year, input.partial-date-month, input.partial-date-day")) {
			if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key) {
				if (event.key.match(/^(c|d)$/)) {
					var is_date_span = event.target.matches("input[name*='.begin_date.'], input[name*='.end_date.']");
					switch (event.key) {
						case "c":
							if (is_date_span) {
								EASY_DATE_cloneDate(event.target, true);
							}
							break;
						case "d":
							EASY_DATE_deleteDates(event.target, is_date_span);
							break;
					}
					return stop(event);
				} else if (event.key.match(/[0-9０-９\-/.]/) && event.target.matches("input.partial-date-year, input.partial-date-month")) {
					var separator_mode = event.key == "-" || event.key == "/" || event.key == ".";
					var full_digit_mode = event.target.selectionStart === event.target.selectionEnd && event.target.value.length === event.target.getAttribute("placeholder").length && event.key.match(/[0-9０-９]/);
					if (separator_mode || full_digit_mode) {
						var next_field = event.target.parentNode.querySelector("input.partial-date-" + (event.target.matches("input.partial-date-year") ? "month" : "day"));
						next_field.focus();
						next_field.select();
						if (full_digit_mode) {
							forceValue(next_field, event.key);
						}
						return stop(event);
					}
				}
			}
		}
	});
}
function EASY_DATE_YY_to_YYYY(yy) {
	// 94 means 1994 but 19 means 2019
	return (parseInt(yy, 10) > 28 ? "19" : "20") + yy;
}
function EASY_DATE_cloneDate(current, hotkey) {
	var date_elements = ["year", "month", "day"];
	var copied_date = "";
	for (let p = 0; p < date_elements.length; p++) {
		var date_parts = current.closest("table.relationship-details > tbody, fieldset").querySelectorAll("input.partial-date-" + date_elements[p]);
		var downwards = (current.parentNode == date_parts[0].parentNode);
		if (!hotkey && !downwards) {
			return;
		}
		date_parts[downwards ? 1 : 0].focus();
		forceValue(date_parts[downwards ? 1 : 0], date_parts[downwards ? 0 : 1].value);
		date_parts[downwards ? 1 : 0].style.setProperty("background-color", "#cfc");
		copied_date += date_parts[downwards ? 0 : 1].value;
	}
	if (copied_date === "") {
		EASY_DATE_uncheckEnded(current);
	}
}
function EASY_DATE_deleteDates(current, is_date_span) {
	var date_elements = ["year", "month", "day"];
	for (let p = 0; p < date_elements.length; p++) {
		var date_parts = current.closest(is_date_span ? "table.relationship-details > tbody, fieldset" : "span.partial-date").querySelectorAll("input.partial-date-" + date_elements[p]);
		for (let i = 0; i < date_parts.length; i++) {
			date_parts[i].focus();
			forceValue(date_parts[i], "");
			date_parts[i].style.removeProperty("background-color");
		}
	}
	if (is_date_span) {
		EASY_DATE_uncheckEnded(current);
	}
}
function EASY_DATE_uncheckEnded(current) {
	var endedCheckbox = current.closest("table.relationship-details > tbody, fieldset").querySelector("input[name$='period.ended'][type='checkbox']");
	if (endedCheckbox && endedCheckbox.checked) {
		endedCheckbox.focus();
		endedCheckbox.click();
	}
}
// ================================================================= DISPLAY+
// ## SPOT_AC ##
// ==========================================================================
j2setting("SPOT_AC", true, true, "name variations (Artist Credit, track name ≠ recording name, etc.) stand out");
j2setting("SPOT_AC_css", "border-bottom: 2px dashed maroon;", true, "CSS syntax (on “.name-variation” - and on “.name-variation” of recording page)");
if (j2sets.SPOT_AC) {
	j2superturbo.addCSSRule(".name-variation, .artist-credit-variation { " + j2sets.SPOT_AC_css + " }");
}
// ================================================================= DISPLAY+
// ## SPOT_CAA ##
// ==========================================================================
j2setting("SPOT_CAA", true, true, "cover art archive’s images stand out from other images. Allows spotting incorrectly padded CAA uploads and looks cool altogether. Now also supports event art archive (EAA) and zabe40 Entity Images userscript PR #16");
j2setting("SPOT_CAA_css", "box-shadow: 0 0 8px black;", true, "CSS syntax (on “a.artwork-image > img”)");
if (j2sets.SPOT_CAA) {
	j2superturbo.addCSSRule("img[src*='//coverartarchive.org/'], img[src*='//eventartarchive.org/'], #sidebar .picture > img, img[src*='//archive.org/download/mbid-'], img.uploader-preview-image { " + j2sets.SPOT_CAA_css + " }");
}
// ================================================================= DISPLAY+
// ## WARN_NEW_WINDOW ##
// ==========================================================================
j2setting("WARN_NEW_WINDOW", true, true, "links that open in a new window will be marked with an icon");
if (j2sets.WARN_NEW_WINDOW) {
	j2superturbo.addCSSRule("a[target='_blank'] { padding-right: 16px; background: no-repeat 99% url(data:image/gif;base64,R0lGODlhCwAKAPcAAOAaGv///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAIALAAAAAALAAoAAAgpAAUIFACgoEEAAwkeLJgQYUODBBMqZOhwIEOBFTFWXAhRYkOJGTlmDAgAOw==); }");
}
// ================================================================= DISPLAY+
// ## CENTER_FLAGS ##
// ==========================================================================
j2setting("CENTER_FLAGS", true, true, "vertically center flags");
if (j2sets.CENTER_FLAGS) {
	j2superturbo.addCSSRule(".flag { background-origin: padding-box; background-position: 0% 84%; }");
}
// ================================================================= DISPLAY-
// ## HIDE_RATINGS ##
// ==========================================================================
j2setting("HIDE_RATINGS", false, true, "hide those cute little stars and everything related to ratings in MB");
if (j2sets.HIDE_RATINGS) {
	j2superturbo.addCSSRule("div#content table.tbl > * > tr > th.rating, div#content table.tbl > tbody > tr > td.rating, div#sidebar > h2.rating, div#sidebar > h2.rating + p, div#page > div.tabs > ul.tabs > li:not(.sel) > a[href$='/ratings'], div.header ul.menu li.data a[href$='/ratings'] { display: none; }");
	// add missing rating class to artist and collection table body rating cells
	var rating_cells = document.querySelectorAll("div#content table.tbl > tbody > tr > td:not(.rating) > span.inline-rating");
	for (var c = 0; c < rating_cells.length; c++) {
		rating_cells[c].parentNode.classList.add("rating");
	}
}
// ================================================================= DISPLAY+
// ## RATINGS_ON_TOP ##
// ==========================================================================
j2setting("RATINGS_ON_TOP", false, true, "show (5 stars) ratings at the top of the sidebar");
j2setting("RATINGS_ON_TOP_below_image", true, true, "place the ratings just below the entity image (instead of topmost)");
if (j2sets.RATINGS_ON_TOP && sidebar && !j2sets.HIDE_RATINGS) {
	var ratings = sidebar.querySelector("h2.rating");
	if (ratings) {
		ratings = [ratings, getSibling(ratings, "p")];
		var where;
		if (j2sets.RATINGS_ON_TOP_below_image) where = sidebar.querySelector("div.cover-art + *, div.picture + *");
		if (!where) where = sidebar.firstChild;
		if (ratings[1] && where) for (let r = 0; r < ratings.length; r++) {
			debug("RATINGS_ON_TOP");
			sidebar.insertBefore(sidebar.removeChild(ratings[r]), where);
		}
	}
}
// ================================================================= DISPLAY+
// ## ROW_HIGHLIGHTER ##
// evolution of brianfreud’s original idea
// MusicBrainz row highlighter https://web.archive.org/web/20131104205654/userscripts.org/scripts/show/118008
// ==========================================================================
j2setting("ROW_HIGHLIGHTER", true, true, "highlights rows in various MB tables");
j2setting("ROW_HIGHLIGHTER_colour", "#f9f3", true, "use any CSS colour code or name (yellow, #fcf, #ffccff, #f9f3, #ff99ff33, hsl(…), rgb(…), rgba(…), etc.)");
if (j2sets.ROW_HIGHLIGHTER && j2sets.ROW_HIGHLIGHTER_colour.match(/^(#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z-]+|(hsl|rgb)a?\([^)]+\))$/i)) {
	j2superturbo.addCSSRule(
		"div#content table.tbl > tbody > tr:hover > td,"
		+ "div#page.fullwidth > table.tbl > tbody > tr:hover > td,"
		+ "div#release-editor > div#tracklist tr:hover > td,"
		+ "div#release-editor > div#tracklist tr:hover > td input {"
			+ "background-image: linear-gradient(" + j2sets.ROW_HIGHLIGHTER_colour + ", " + j2sets.ROW_HIGHLIGHTER_colour + ");"
		+ "}"
	);
}
// =================================================================== MOUSE+
// ## Common form submission function ##
// ==========================================================================
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
// =================================================================== MOUSE+
// ## DOUBLE_CLICK_SUBMIT ##
// ==========================================================================
j2setting("DOUBLE_CLICK_SUBMIT", true, true, "makes the “radio buttons” and “multi-selects” submit forms on double-click (MBS-3229)");
if (j2sets.DOUBLE_CLICK_SUBMIT && location.pathname.match(/^\/(cdtoc\/|cdstub\/|edit\/|release\/(add(\?release-group=)?|[^/]+\/edit-cover-art\/)|release-group\/[^/]+\/edit|search|.+\/merge)/)) {
	document.body.addEventListener("dblclick", function(event) {
		if (
			event.target.tagName
			&& !getParent(event.target, "div", "edit-list") // mb_POWER-VOTE has its own DOUBLE_CLICK_SUBMIT
			&& (
				event.target.tagName == "INPUT"
				&& event.target.getAttribute("type") == "radio"
				||
				event.target.tagName == "LABEL"
				&& event.target.querySelector("input[type='radio']")
				||
				event.target.tagName == "OPTION"
				&& event.target.parentNode.tagName == "SELECT"
				&& event.target.parentNode.getAttribute("multiple") != null
			)
		) {
			debug("DOUBLE_CLICK_SUBMIT");
			parentFormSubmit(event.target, event);
		}
	});
}
// ================================================================ KEYBOARD+
// ## CONTROL_ENTER_SUBMIT ##
// ==========================================================================
j2setting("CONTROL_ENTER_SUBMIT", true, true, "hit CTRL+ENTER keys when you’re in a text area to submit the current form");
if (j2sets.CONTROL_ENTER_SUBMIT) {
	document.body.addEventListener("keydown", function(event) {
		if (
			event.ctrlKey && event.key == "Enter"
			&& event.target.matches("textarea")
			&& !event.target.matches("#release-editor #annotation")
		) {
			debug("CONTROL_ENTER_SUBMIT");
			parentFormSubmit(event.target, event);
		}
	});
}
// ================================================================ REMEMBER+
// ## LAST_SEEN_EDIT ##
// ==========================================================================
j2setting("LAST_SEEN_EDIT", false, true, "it shows you what edits you have already seen (reviewed) on entities edit histories, yeah man. only saves states when looking at all edits (not only open) of entity");
if (j2sets.LAST_SEEN_EDIT && account) {
	debug("LAST_SEEN_EDIT");
	var what = (location.pathname).match(new RegExp("^/(?:(user)/([^/]+)/edits(?:/(open))?|([^/]+)/(" + stre_GUID + ")/(?:(open)_)?edits)"));
	if (what) {
		var isOpenEdits = typeof (what[3] || what[6]) != "undefined";
		var which = what[2] || what[5];
		what = what[1] || what[4];
		var lastseenedits = localStorage.getItem(userjs.id + "lastseenedits-" + what);
		var upd = false;
		if (lastseenedits) { lastseenedits = JSON.parse(lastseenedits); } else { lastseenedits = {}; }
		var now = new Date();
		if (lastseenedits[which]) {
			if (lastseenedits[which][2] > lastseenedits[which][0] && new Date(lastseenedits[which][1]) < new Date(now - 1000 * 60 * 30 /* 30minutes */)) {
				lastseenedits[which][0] = lastseenedits[which][2];
				lastseenedits[which][1] = now.getTime();
				upd = true;
			}
		} else {
			lastseenedits[which] = [0, now.getTime(), 0]; // [0:edit,1:when,2:next]
		}
		var edits = document.querySelectorAll("div.edit-header > h2 > a[href*='/edit/']");
		for (let ed = 0; ed < edits.length; ed++) {
			var editn = parseInt(edits[ed].getAttribute("href").match(/\d+$/), 10);
			var editlist = getParent(edits[ed], "div", "edit-list");
			if (!isOpenEdits && ed == 0 && editn > lastseenedits[which][0] && editn > lastseenedits[which][2]) {
				lastseenedits[which][2] = editn;
				upd = true;
			}
			if (editn <= lastseenedits[which][0]) {
				editlist.setAttribute("title", "SEEN EDIT");
				if (editn == lastseenedits[which][0]) {
					editlist.parentNode.insertBefore(createTag("hr", {a: {title: "Edits below are already seen"}, s: {height: "0px", border: "none", "border-top": "4px dashed red"}}), editlist);
					if (ed > 0) { getSibling(editlist, "div", "edit-list", true).scrollIntoView(); }
				}
			} else {
				editlist.style.setProperty("background-color", "#ffc");
				editlist.setAttribute("title", "NEW EDIT");
			}
		}
		if (upd && !isOpenEdits) {
			localStorage.setItem(userjs.id + "lastseenedits-" + what, JSON.stringify(lastseenedits));
		}
	}
}
// ==================================================================== LINK+
// ## COOL_SEARCH_LINKS ##
// ==========================================================================
j2setting("COOL_SEARCH_LINKS", true, true, "additional “refine this search” links excluding own and/or unvoted and/or cancelled/failed edits as well as quick switch between all edits / open_edits");
if (j2sets.COOL_SEARCH_LINKS && account && !location.pathname.match(/^\/search\/edits/)) {
	debug("COOL_SEARCH_LINKS");
	var baseURL = location.pathname.match(new RegExp("^/([^/]+)/(" + stre_GUID + ")"));
	var is_edit_search = location.pathname.match(/((open_)?edits|edits\/(accepted|applied|autoedits|cancelled|failed|open|rejected))\/?$/);
	if (baseURL && !is_edit_search) {
		// Entity page
		var entityType = baseURL[1].replace(/-/, "_");
		var entityName = document.querySelector("div#content h1 a");
		var entityID = document.querySelector("div#sidebar a[href^='/" + entityType + "/merge_queue?add-to-merge=']");
		var entityEdits = document.querySelector("div#sidebar a[href$='" + baseURL[0] + "/edits']");
		if (entityID && entityEdits && entityType && entityName && entityType != "collection") {
			// TODO: Allow collections with missing MBS-3922 feature “Edit search: Filter edits by collections” https://tickets.metabrainz.org/browse/MBS-3922
			entityID = entityID.getAttribute("href").match(/add-to-merge=(\d+)/)[1];
			entityName = entityName.textContent;
			// refine
			var refine_sidebar = "/search/edits?conditions.0.operator=%3D&conditions.0.field=" + entityType + "&conditions.0.name=" + encodeURIComponent(entityName) + "&conditions.0.args.0=" + entityID + "&order=desc&combinator=and&negation=0";
			addAfter(createTag("span", {}, [" (", createTag("a", {a: {title: "Another cool search link from " + userjs.name, href: refine_sidebar + "&form_only=yes"}, s: {background: "#ff6"}}, "refine"), ")"]), entityEdits);
			entityEdits.setAttribute("title", "Includes child/related entity edits");
			var refineEntity = entitySpecificEdits(entityType, refine_sidebar, "pure+cover+relationship");
			if (refineEntity) {
				// pure entity edits
				entityEdits.parentNode.appendChild(createTag("ul", {a: {title: userjs.name}, s: {border: "2px solid purple"}},
					createTag("li", {}, [createTag("a", {a: {title: "No child/related entity (VERY SLOW)", href: refineEntity}}, "Only this " + entityType.replace(/_/, "\u00a0") + " edits"), " (SLOW)",
						createTag("ul", {s: {paddingLeft: "10px"}}, [
							createTag("li", {a: {id: userjs.id + "-pure+cover"}, s: {background: "#ff6"}}, createTag("a", {a: {href: entitySpecificEdits(entityType, refine_sidebar, "pure+cover")}, s: {fontWeight: "bold"}}, "Pure " + entityType.replace(/_/, "\u00a0") + " edits")),
							createTag("li", {}, [createTag("span", {}, [createTag("a", {a: {class: userjs.id + "-rels", href: entitySpecificEdits(entityType, refine_sidebar, "relationship")}}, "Relationship edits"), " (SLOW)"]),
								createTag("ul", {s: {paddingLeft: "10px"}}, [
									createTag("li", {s: {background: "#ff6", textDecoration: "initial"}}, createTag("a", {a: {class: userjs.id + "-post-ngs-rels", href: entitySpecificEdits(entityType, refine_sidebar, "post-ngs-relationship")}, title: "Edits since 2011-05-17"}, "Post‐NGS")),
									createTag("li", {s: {background: "#ff6", textDecoration: "initial"}}, createTag("a", {a: {class: userjs.id + "-pre-ngs-rels", href: entitySpecificEdits(entityType, refine_sidebar, "pre-ngs-relationship")}, title: "Edits before 2011-05-17"}, "Pre‐NGS"))
								])
							]),
						])
					])
				));
				if (entityType == "release") {
					refineEntity = entitySpecificEdits(entityType, refine_sidebar, "cover");
					if (refineEntity) {
						document.getElementById(userjs.id + "-pure+cover").appendChild(createTag("fragment", {}, [
							" (",
							createTag("a", {a: {title: "No art edits", href: entitySpecificEdits(entityType, refine_sidebar, "pure")}}, "no"),
							"/",
							createTag("a", {a: {title: "Only art edits", href: refineEntity}}, "art"),
							")"
						]));
					}
				}
				// Check if there are pre‐NGS relationship edits
				var xhr_cool_search_links = new XMLHttpRequest();
				xhr_cool_search_links.addEventListener("load", function(event) {
					if (this.status == 200) {
						var foundEdits = this.responseText.match(/<strong>([^<]*)<\/strong><\/p><\/div><div id="edits">/);
						if (foundEdits) {
							// Edits found
							document.querySelector("li > a." + userjs.id + "-pre-ngs-rels").parentNode.appendChild(document.createTextNode(" (" + foundEdits[1].toLowerCase() + ")"));
						} else {
							// No edits found
							var all_relationships = sidebar.querySelector("a." + userjs.id + "-rels");
							all_relationships.setAttribute("href", sidebar.querySelector("a." + userjs.id + "-post-ngs-rels").getAttribute("href"));
							all_relationships.closest("li").removeChild(all_relationships.closest("li").querySelector("ul"));
							all_relationships.parentNode.removeChild(all_relationships.parentNode.lastChild);
						}
					}
				});
				xhr_cool_search_links.open("get", refine_sidebar + "&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=233&conditions.1.args=234&conditions.1.args=235", true);
				xhr_cool_search_links.send(null);
			}
		}
	} else {
		var searchHelp = document.querySelector("table.search-help > tbody");
		if (searchHelp && is_edit_search) {
			var refines = document.createElement("td");
			var refine_search;
			var notme = "&conditions.2099.field=editor&conditions.2099.operator=%21%3D&conditions.2099.name=%myName%&conditions.2099.args.0=%myID%";
			var novote = "&conditions.2098.field=voter&conditions.2098.operator=%3D&conditions.2098.name=%myName%&conditions.2098.voter_id=%myID%&conditions.2098.args=no";
			var onlyEffective = "&conditions.2097.field=status&conditions.2097.operator=%3D&conditions.2097.args=1&conditions.2097.args=2";
			if (
				(refine_search = document.querySelector("table.search-help td > a[href^='" + MBS + "/search/edits?'][href*='&conditions.']")) &&
				(refine_search = refine_search.getAttribute("href").replace(/&?form_only=yes/, ""))
			) {
				if (location.pathname.match(/\bedits$/)) {
					// No need for effective edit filter in /user/xxx/edits/(accepted|applied|autoedits|cancelled|failed|open|rejected)
					refines.appendChild(document.createTextNode(" | "));
					refines.appendChild(createTag("a", {a: {href: refine_search + onlyEffective}}, "Effective edits (open or applied)"));
				}
				if (location.href.indexOf(account.pathname) < 0 && typeof __MB__ !== "undefined") {
					var myID = __MB__.$c.user.id;
					if (myID) {
						if (myID != localStorage.getItem(userjs.id + "me-userid")) localStorage.setItem(userjs.id + "me-userid", myID);
						if (!location.pathname.match(/^\/user\//)) {
							refines.appendChild(document.createTextNode(" | "));
							refines.appendChild(createTag("a", {a: {href: refine_search + notme.replace(/%myID%/g, myID).replace(/%myName%/g, escape(account.name))}}, "Exclude my own edits"));
						}
						if (!location.pathname.match(/\/edits\/autoedits/)) {
							novote = notme + novote;
							refines.appendChild(document.createTextNode(" | "));
							refines.appendChild(createTag("a", {a: {href: refine_search + novote.replace(/%myID%/g, myID).replace(/%myName%/g, escape(account.name))}}, "Edits I have not voted"));
						}
					}
				}
			}
			if (refines.childElementCount > 0) {
				refines.removeChild(refines.firstChild);
				searchHelp.insertBefore(createTag("tr", {a: {title: userjs.name}, s: {"text-shadow": "0 0 8px purple"}}, [createTag("th", {}, "Cool links: "), refines]), searchHelp.lastChild);
			}
		}
	}
}
function entitySpecificEdits(entityType, refine, searchMode) {
	var editTypes = [];
	var linkTypes = [];
	if (searchMode.match(/pure/)) {
		switch (entityType) {
			case "artist":
				/* Add artist                       */ editTypes.push("1");
				/* Add artist alias                 */ editTypes.push("6");
				/* Add artist annotation            */ editTypes.push("5");
				/* Change artist quality (historic) */ editTypes.push("252");
				/* Edit artist                      */ editTypes.push("2");
				/* Edit artist alias                */ editTypes.push("8");
				/* Edit artist credit               */ editTypes.push("9");
				/* Edit URL                         */ editTypes.push("101");
				/* Merge artists                    */ editTypes.push("4");
				/* Remove artist                    */ editTypes.push("3");
				/* Remove artist alias              */ editTypes.push("7");
				break;
			case "label":
				/* Add label            */ editTypes.push("10");
				/* Add label alias      */ editTypes.push("16");
				/* Add label annotation */ editTypes.push("15");
				/* Edit label           */ editTypes.push("11");
				/* Edit label alias     */ editTypes.push("18");
				/* Edit URL             */ editTypes.push("101");
				/* Merge labels         */ editTypes.push("14");
				/* Remove label         */ editTypes.push("13");
				/* Remove label alias   */ editTypes.push("17,262");
				break;
			case "recording":
				/* Add disc ID                                    */ editTypes.push("55,232");
				/* Add ISRCs                                      */ editTypes.push("76");
				/* Add medium                                     */ editTypes.push("51");
				/* Add recording alias                            */ editTypes.push("711");
				/* Add recording annotation                       */ editTypes.push("75");
				/* Add release (historic)                         */ editTypes.push("216");
				/* Add standalone recording                       */ editTypes.push("71");
				/* Add track (historic)                           */ editTypes.push("207,218");
				/* Edit medium                                    */ editTypes.push("52");
				/* Edit recording                                 */ editTypes.push("72,204,245");
				/* Edit recording alias                           */ editTypes.push("713");
				/* Edit track (historic)                          */ editTypes.push("205,210");
				/* Merge recordings                               */ editTypes.push("74");
				/* Move disc ID                                   */ editTypes.push("56,221");
				/* Remove disc ID                                 */ editTypes.push("54,220");
				/* Remove ISRC                                    */ editTypes.push("78");
				/* Remove medium                                  */ editTypes.push("53");
				/* Remove recording                               */ editTypes.push("73");
				/* Remove recording alias                         */ editTypes.push("712");
				/* Remove release                                 */ editTypes.push("212,310");
				/* Remove releases (historic)                     */ editTypes.push("224");
				/* Remove track                                   */ editTypes.push("211");
				/* Set track lengths                              */ editTypes.push("58,253");
				break;
			case "release":
				/* Add disc ID                                    */ editTypes.push("55,232");
				/* Add ISRCs                                      */ editTypes.push("76");
				/* Add medium                                     */ editTypes.push("51");
				/* Add release                                    */ editTypes.push("31,216");
				/* Add release alias                              */ editTypes.push("318");
				/* Add release annotation                         */ editTypes.push("35,231");
				/* Add release events (historic)                  */ editTypes.push("249");
				/* Add release label                              */ editTypes.push("34");
				/* Add standalone recording                       */ editTypes.push("71");
				/* Add track (historic)                           */ editTypes.push("207,218");
				/* Change release data quality                    */ editTypes.push("38,263");
				/* Convert release to multiple artists (historic) */ editTypes.push("209");
				/* Convert release to single artist (historic)    */ editTypes.push("213");
				/* Edit barcodes                                  */ editTypes.push("39");
				/* Edit medium                                    */ editTypes.push("52");
				/* Edit release                                   */ editTypes.push("32,33,201,208,226,244,273,312");
				/* Edit release alias                             */ editTypes.push("320");
				/* Edit release events (historic)                 */ editTypes.push("229,250");
				/* Edit release label                             */ editTypes.push("37");
				/* Edit URL                                       */ editTypes.push("101");
				/* Merge releases                                 */ editTypes.push("223,225,311");
				/* Move disc ID                                   */ editTypes.push("56,221");
				/* Remove disc ID                                 */ editTypes.push("54,220");
				/* Remove ISRC                                    */ editTypes.push("78");
				/* Remove medium                                  */ editTypes.push("53");
				/* Remove release                                 */ editTypes.push("212,310");
				/* Remove release events (historic)               */ editTypes.push("251");
				/* Remove release label                           */ editTypes.push("36");
				/* Remove releases (historic)                     */ editTypes.push("224");
				/* Remove track                                   */ editTypes.push("211");
				/* Reorder mediums                                */ editTypes.push("313");
				/* Set track lengths                              */ editTypes.push("58,253");
				break;
			case "release_group":
				/* Add release group            */ editTypes.push("20");
				/* Add release group alias      */ editTypes.push("26");
				/* Add release group annotation */ editTypes.push("25");
				/* Edit release group           */ editTypes.push("21");
				/* Edit release group alias     */ editTypes.push("28");
				/* Edit URL                     */ editTypes.push("101");
				/* Merge release groups         */ editTypes.push("24");
				/* Remove release group         */ editTypes.push("23");
				/* Remove release group alias   */ editTypes.push("27");
				break;
		}
	}
	if (searchMode.match(/cover/)) {
		switch (entityType) {
			case "release":
				/* Add cover art     */ editTypes.push("314");
				/* Edit cover art    */ editTypes.push("316");
				/* Remove cover art  */ editTypes.push("315");
				/* Reorder cover art */ editTypes.push("317");
				break;
			case "release_group":
				/* Set cover art */ editTypes.push("22");
				break;
		}
	}
	if (searchMode.match(/relationship/)) {
		switch (entityType) {
			case "artist":
				/* Add relationship                   */ editTypes.push("90,233");
				/* Edit relationship                  */ editTypes.push("91,234");
				/* Remove relationship                */ editTypes.push("92,235");
				/* Reorder relationships              */ editTypes.push("99");
				/* artist-artist relationships        */ linkTypes.push(102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 292, 305, 722, 728, 847, 855, 895, 965, 973, 1079);
				/* artist-event relationships         */ linkTypes.push(798, 799, 800, 801, 806, 807, 893, 932, 935, 936, 1084, 1163, 1231, 1232, 1233, 1234, 1255, 1256);
				/* artist-genre relationships         */ linkTypes.push(1260);
				/* artist-instrument relationships    */ linkTypes.push(896);
				/* artist-label relationships         */ linkTypes.push(115, 116, 117, 119, 120, 121, 723, 724, 990, 991, 1081, 1258, 1259, 1266);
				/* artist-place relationships         */ linkTypes.push(701, 702, 703, 704, 714, 832, 856, 923, 924, 925, 926, 937, 975, 988, 1164, 1165, 1166, 1281);
				/* artist-recording relationships     */ linkTypes.push(122, 123, 125, 127, 128, 129, 130, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142, 143, 144, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 160, 297, 298, 300, 726, 760, 858, 869, 961, 962, 986, 1011, 1186, 1230, 1236, 1241, 1242, 1243, 1244, 1245, 1276);
				/* artist-release relationships       */ linkTypes.push(18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 295, 296, 709, 710, 727, 759, 871, 927, 928, 929, 969, 987, 993, 1010, 1012, 1179, 1184, 1185, 1187, 1235, 1267);
				/* artist-release_group relationships */ linkTypes.push(62, 63, 65, 868, 974);
				/* artist-series relationships        */ linkTypes.push(750, 751, 859, 994, 996, 1000, 1002, 1003, 1004);
				/* artist-url relationships           */ linkTypes.push(171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 182, 183, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194, 197, 199, 283, 291, 303, 307, 310, 352, 707, 718, 754, 785, 816, 840, 841, 852, 862, 897, 902, 919, 978, 981, 1080, 1131, 1192, 1193);
				/* artist-work relationships          */ linkTypes.push(161, 162, 164, 165, 167, 168, 169, 170, 282, 293, 294, 834, 844, 846, 872, 889, 917, 956, 972, 1257, 1285, 1286);
				break;
			case "label":
				/* Add relationship                  */ editTypes.push("90,233");
				/* Edit relationship                 */ editTypes.push("91,234");
				/* Remove relationship               */ editTypes.push("92,235");
				/* Reorder relationships             */ editTypes.push("99");
				/* area-label relationships          */ linkTypes.push(1237);
				/* artist-label relationships        */ linkTypes.push(115, 116, 117, 119, 120, 121, 723, 724, 990, 991, 1081, 1258, 1259, 1266);
				/* event-label relationships         */ linkTypes.push(1168);
				/* genre-label relationships         */ linkTypes.push(1164);
				/* instrument-label relationships    */ linkTypes.push(918);
				/* label-label relationships         */ linkTypes.push(200, 201, 202, 203, 205, 725);
				/* label-place relationships         */ linkTypes.push(989);
				/* label-recording relationships     */ linkTypes.push(206, 867, 945, 946, 949, 950, 998, 1178, 1228, 1252, 1277);
				/* label-release relationships       */ linkTypes.push(66, 349, 359, 360, 361, 362, 708, 711, 712, 833, 848, 942, 944, 947, 948, 951, 952, 955, 985, 999, 1170, 1171, 1172, 1173, 1174, 1175, 1183, 1253, 1280);
				/* label-release_group relationships */ linkTypes.push(970);
				/* label-series relationships        */ linkTypes.push(933);
				/* label-url relationships           */ linkTypes.push(210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 221, 222, 224, 225, 290, 304, 311, 313, 354, 719, 838, 851, 899, 903, 957, 958, 959, 960, 977, 982, 997, 1005, 1130, 1194);
				/* label-work relationships          */ linkTypes.push(208, 890, 922, 1265);
				break;
			case "recording":
				/* Add relationship                  */ editTypes.push("90,233");
				/* Edit relationship                 */ editTypes.push("91,234");
				/* Remove relationship               */ editTypes.push("92,235");
				/* Reorder relationships             */ editTypes.push("99");
				/* area-recording relationships      */ linkTypes.push(698, 758, 814, 821, 827, 830, 864, 964);
				/* artist-recording relationships    */ linkTypes.push(122, 123, 125, 127, 128, 129, 130, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142, 143, 144, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 160, 297, 298, 300, 726, 760, 858, 869, 961, 962, 986, 1011, 1186, 1230, 1236, 1241, 1242, 1243, 1244, 1245, 1276);
				/* event-recording relationships     */ linkTypes.push(809, 966);
				/* label-recording relationships     */ linkTypes.push(206, 867, 945, 946, 949, 950, 998, 1178, 1228, 1252, 1277);
				/* place-recording relationships     */ linkTypes.push(693, 694, 813, 819, 825, 829, 866, 963);
				/* recording-recording relationships */ linkTypes.push(226, 227, 228, 230, 231, 232, 233, 234, 236, 238, 309, 857, 1177, 1238, 1239);
				/* recording-release relationships   */ linkTypes.push(69);
				/* recording-series relationships    */ linkTypes.push(740, 1006);
				/* recording-url relationships       */ linkTypes.push(254, 255, 256, 257, 258, 268, 285, 302, 306, 905, 976, 979);
				/* recording-work relationships      */ linkTypes.push(278);
				break;
			case "release":
				/* Add relationship                */ editTypes.push("90,233");
				/* Edit relationship               */ editTypes.push("91,234");
				/* Remove relationship             */ editTypes.push("92,235");
				/* Reorder relationships           */ editTypes.push("99");
				/* area-release relationships      */ linkTypes.push(699, 756, 757, 815, 822, 826, 831, 835, 849, 863, 967, 1181, 1268, 1269, 1270, 1271, 1272, 1273, 1274);
				/* artist-release relationships    */ linkTypes.push(18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 295, 296, 709, 710, 727, 759, 871, 927, 928, 929, 969, 987, 993, 1010, 1012, 1179, 1184, 1185, 1187, 1235, 1267);
				/* event-release relationships     */ linkTypes.push(795, 796, 810);
				/* label-release relationships     */ linkTypes.push(66, 349, 359, 360, 361, 362, 708, 711, 712, 833, 848, 942, 944, 947, 948, 951, 952, 955, 985, 999, 1170, 1171, 1172, 1173, 1174, 1175, 1183, 1253, 1280);
				/* place-release relationships     */ linkTypes.push(695, 696, 697, 812, 820, 824, 828, 865, 941, 953, 954, 968, 1182, 1246, 1247, 1248, 1249, 1250, 1251);
				/* recording-release relationships */ linkTypes.push(69);
				/* release-release relationships   */ linkTypes.push(1, 2, 3, 4, 6, 1009);
				/* release-series relationships    */ linkTypes.push(741);
				/* release-url relationships       */ linkTypes.push(72, 73, 74, 75, 76, 77, 78, 79, 82, 83, 85, 86, 288, 301, 308, 729, 755, 850, 906, 980);
				break;
			case "release_group":
				/* Add relationship                          */ editTypes.push("90,233");
				/* Edit relationship                         */ editTypes.push("91,234");
				/* Remove relationship                       */ editTypes.push("92,235");
				/* Reorder relationships                     */ editTypes.push("99");
				/* artist-release_group relationships        */ linkTypes.push(62, 63, 65, 868, 974);
				/* event-release_group relationships         */ linkTypes.push(797, 887);
				/* genre-release_group relationships         */ linkTypes.push(1261);
				/* label-release_group relationships         */ linkTypes.push(970);
				/* release_group-release_group relationships */ linkTypes.push(8, 9, 10, 11, 12, 13, 15, 17, 894, 1082, 1176, 1229, 1240);
				/* release_group-series relationships        */ linkTypes.push(742, 888, 1007, 1282);
				/* release_group-url relationships           */ linkTypes.push(88, 89, 90, 93, 94, 96, 97, 284, 287, 353, 853, 907, 1169, 1190);
				/* release_group-work relationships          */ linkTypes.push(1283);
				break;
		}
	}
	if (editTypes.length > 0 || linkTypes.length > 0) {
		var refineFullURL = refine;
		if (editTypes.length > 0) {
			editTypes = editTypes.map(function(element) {
				return "conditions.1.args=" + encodeURIComponent(element);
			});
			refineFullURL += "&" + "conditions.1.field=type&conditions.1.operator=%3D" + "&" + editTypes.join("&");
		}
		if (!searchMode.match(/pre-ngs/) && linkTypes.length > 0) {
			linkTypes = linkTypes.map(function(element) {
				return "conditions.2.args=" + element;
			});
			refineFullURL += "&" + "conditions.2.field=link_type&conditions.2.operator=%3D" + "&" + linkTypes.join("&");
		}
		if (searchMode.match(/relationship/) && !searchMode.match(/ngs/)) {
			refineFullURL = refineFullURL.replace(/(combinator)=and/, "$1=or").replace(/(negation)=0/, "$1=1").replace(/(conditions\.\d+\.operator)=%3D/g, "$1=%21%3D");
		}
		if (searchMode.match(/post-ngs/)) {
			refineFullURL += "&" + "conditions.3.field=open_time&conditions.3.operator=%3E&conditions.3.args.0=2011-05-16";
		} else if (searchMode.match(/pre-ngs/)) {
			refineFullURL += "&" + "conditions.2.field=open_time&conditions.2.operator=%3C&conditions.2.args.0=2011-05-17";
		}
		return refineFullURL;
	}
}
// ==================================================================== LINK+
// ## COPY_TOC ##
// ==========================================================================
j2setting("COPY_TOC", true, true, "re-lookup Disc ID (from cdtoc page)");
if (j2sets.COPY_TOC && account && location.pathname.match(/^\/cdtoc\/[^/]+-$/)) {
	debug("COPY_TOC");
	// Now MBS directly provides the full TOC: first track (1) <space> last track (n) <space> last track end sector, then, (n times) <space> nth track start sector
	var fullTOC = document.querySelector("div#page > table > tbody > tr:not([id]) > td");
	debug("Full TOC: " + fullTOC.textContent);
	(document.querySelector("h1") || document.body).appendChild(createTag("fragment", {}, [" (", createTag("a", {a: {href: "/cdtoc/attach?toc=" + fullTOC.textContent.trim().replace(/\s+/g, "%20")}, s: {background: "yellow"}}, "re-lookup"), ")"]));
}
// ==================================================================== LINK+
// ## SERVER_SWITCH ##
// ==========================================================================
// Most of this code was written when we had *.mbsandbox.org dev test servers: https://wiki.musicbrainz.org/History:Development/Sandbox
// It is now limited to MBS, beta and test but I am reluctent to remove dead code, just in case
j2setting("SERVER_SWITCH", true, true, "fast switch between normal, beta and test. look for the new top-right MBS menu");
// j2setting("SERVER_SWITCH_mbsandbox", '["celes", "chirlu", "reosarevok"]', true, "type an array of subdomains to .mbsandbox.org");
if (j2sets.SERVER_SWITCH) {
	debug("SERVER_SWITCH");
	var langMenu = document.querySelector("div.header ul.menu li.language-selector");
	if (langMenu) {
		for (let languageLinks = langMenu.querySelectorAll("a[href*='/set-language/']"), a = 0; a < languageLinks.length; a++) {
			languageLinks[a].classList.add("jesus2099-bypass-mb_PREFERRED-MBS"); // mb_PREFERRED-MBS
		}
		var servname;
		if ((servname = location.hostname.match(/^([^.]+)\.[^.]+\.[^.]+$/))) {
			servname = servname[1];
		} else {
			servname = "MBS";
		}
		var menu = langMenu.parentNode.insertBefore(createTag("li", {a: {class: userjs.id + "serverSwitch"}, s: {float: "right", position: "relative"}}, [createTag("span", {a: {title: "Server Switch", class: "menu-header"}}, [userjs.icon.cloneNode(false), " ", createTag("code", {}, servname), " ▾"]), document.createElement("ul")]), langMenu);
		menu.addEventListener("click", function(event) {
			if (getParent(event.target, "li", userjs.id + "serverSwitch")) {
				event.stopPropagation();
				for (let openMenus = document.querySelectorAll(".header ul.menu li.fake-active"), m = 0; m < openMenus.length; m++) if (openMenus[m] != this) {
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
		for (let mb = 0; mb < mbMains.length; mb++) {
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
function serverSwitch(server, separator) {
	var li = document.createElement("li");
	if (separator) {
		li.className = "separator";
	}
	var protocolAndHost = server.match(/^(https?:)\/\/(.+)$/);
	var a = li.appendChild(createTag("a", {}, protocolAndHost ? protocolAndHost[2] + " (" + protocolAndHost[1].slice(0, -1) + ")" : server));
	if (location.host == server || location.protocol + "//" + location.host == server) {
		a.style.setProperty("cursor", "no-drop");
		a.style.setProperty("font-weight", "bold");
	} else {
		var hrefHost;
		if (protocolAndHost) {
			hrefHost = protocolAndHost[1] + "//" + protocolAndHost[2];
		} else if (server.match(/mbsandbox/)) {
			hrefHost = "http://" + server;
		} else {
			hrefHost = "//" + server;
		}
		a.setAttribute("href", hrefHost + location.pathname + location.search + location.hash);
		a.classList.add("jesus2099-bypass-mb_PREFERRED-MBS"); // mb_PREFERRED-MBS
	}
	return li;
}
// ==================================================================== LINK+
// ## TAG_TOOLS ##
// ==========================================================================
j2setting("TAG_TOOLS", true, true, "makes tag pages better titled and adds a tag switch between current users’, all users’ and your own tags — sidebar tag links will link your own tags (if any) instead of global");
if (j2sets.TAG_TOOLS && account) {
	var tagscope = location.pathname.replace(new RegExp("^" + MBS + "|[?#].*$", "g"), "").match(/^(?:\/user\/(?<user>[^/]+))?(?<path>\/tags|\/tag\/(?<tag>[^/]+)(?:\/(?<type>artist|release-group|release|recording|work|label))?)$/);
	if (tagscope) {
		debug("TAG_TOOLS");
		var h1 = document.querySelector("h1");
		var tags = tagscope.groups.path.match(/tags$/);
		if (h1 && account.pathname) {
			var tagswitches = [];
			var scope = typeof tagscope.groups.user == "string" ? decodeURIComponent(tagscope.groups.user) : "";
			if (scope !== account.name) {
				tagswitches.push([account.pathname + tagscope.groups.path, (scope === "" ? "only " : "") + "mine"]);
			}
			if (scope !== "") {
				tagswitches.push([MBS + tagscope.groups.path, "everyone’s"]);
				h1.appendChild(document.createTextNode("’s tag" + (tags ? "s" : " “" + decodeURIComponent(tagscope.groups.tag) + "”")));
			}
			if (tagscope.groups.type) {
				h1.appendChild(createTag("span", {s: {color: "grey"}}, " on "));
				h1.appendChild(document.createTextNode(tagscope.groups.type.replace(/-/, " ") + "s"));
			}
			document.title = h1.textContent;
			tagswitch(h1, tagswitches);
		}
	}
	j2superturbo.addCSSRule("div.sidebar-tags ul[class$='-list'] a[href^='/user/'] { background-color: #B1EBB0 }");
	var tagZone = document.querySelector("div.sidebar-tags");
	if (tagZone) {
		tagZone.parentNode.insertBefore(createTag("div", {s: {position: "relative", bottom: "-1rem", color: "black", fontWeight: "normal", "float": "right"}}, ["↙", createTag("span", {s: {backgroundColor: "#B1EBB0"}}, "mine"), " and others’"]), tagZone.previousSibling);
		(new MutationObserver(function(mutations, observer) {
			updateTags();
		})).observe(tagZone, {childList: true, subtree: true, attributes: true});
		updateTags();
	}
}
function updateTags() {
	setTimeout(function() {
		var newUpvotedTags = document.querySelectorAll("div.sidebar-tags ul[class$='-list'] > li > a:not([href^='" + account.pathname + "']) + span.tag-vote-buttons.tag-upvoted");
		for (var new_tag = 0; new_tag < newUpvotedTags.length; new_tag++) {
			ownifyTag(newUpvotedTags[new_tag].previousSibling);
		}
		var oldUpvotedTags = document.querySelectorAll("div.sidebar-tags ul[class$='-list'] > li > a[href^='" + account.pathname + "'] + span.tag-vote-buttons:not(.tag-upvoted)");
		for (var old_tag = 0; old_tag < oldUpvotedTags.length; old_tag++) {
			ownifyTag(oldUpvotedTags[old_tag].previousSibling, true);
		}
	}, 123);
}
function ownifyTag(tag, revert) {
	if (revert) {
		tag.setAttribute("href", tag.getAttribute("href").replace(account.pathname, ""));
	} else {
		tag.setAttribute("href", account.pathname + tag.getAttribute("href"));
	}
}
function tagswitch(h1, urltxt) {
	var switcht = h1.appendChild(createTag("span", {s: {color: "grey"}}, " (see "));
	for (let i = 0; i < urltxt.length; i++) {
		if (i > 0) { switcht.appendChild(document.createTextNode(" or ")); }
		switcht.appendChild(createTag("a", {a: {href: urltxt[i][0]}}, urltxt[i][1]));
	}
	switcht.appendChild(document.createTextNode(")"));
}
// =================================================================== MOUSE+
// ## STATIC_MENU ##
// ==========================================================================
// Replaced by https://github.com/jesus2099/konami-command/blob/master/mb_STICKY-HEADER.user.css
// TODO: Remove STATIC_MENU completely
j2setting("STATIC_MENU", false, false, "☠ OBSOLETE ☠ Has been replaced by mb_STICKY-HEADER userstyle");
if (j2sets.STATIC_MENU && document.querySelector("div.header")) {
	debug("STATIC_MENU");
	j2superturbo.css.insertRule("." + MBJS.id + ".banner." + userjs.id + " h1 { margin-bottom: 1em; }", 0);
	j2superturbo.css.insertRule("." + MBJS.id + ".banner." + userjs.id + " p { text-align: left; }", 0);
	j2superturbo.css.insertRule("." + MBJS.id + ".banner." + userjs.id + " a { text-decoration: underline; font-weight: bold; }", 0);
	MBJS.displayBanner(createTag("fragment", {}, [
		createTag("h1", {}, "STATIC_MENU → mb_STICKY-HEADER"),
		createTag("p", {}, ["⚠\uFE0F For the sake of maintanability, ", GM_info.script.name, "’s ", createTag("b", {}, "STATIC_MENU"), " has been replaced by a new userstyle called ", createTag("a", {a: {href: "https://github.com/jesus2099/konami-command/blob/master/mb_STICKY-HEADER.user.css", target: "_blank"}}, "mb_STICKY-HEADER"), "."]),
		createTag("p", {}, ["💁\uFE0F You should now disable STATIC_MENU ", j2superturbo.menu.expl, " and ", createTag("a", {a: {href: "https://github.com/jesus2099/konami-command/raw/master/mb_STICKY-HEADER.user.css", target: "_blank"}}, "install mb_STICKY-HEADER"), " thanks to ", createTag("a", {a: {href: "//add0n.com/stylus.html", target: "_blank"}}, "Stylus"), " extension."])
	]), userjs.id);
}
// ==========================================================================
// ## SLOW_DOWN_RETRY ##
// ==========================================================================
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
				if (checkError("div#page pre", /canceling statement due to statement timeout at|read timeout at|could not fetch the document from the search server/)) retrydelay = 2;
				break;
		}
		if (retrydelay) {
			document.querySelector("div#page h1, div#content h1, h1").appendChild(createTag("fragment", {}, [" (retrying", createTag("span", {a: {class: "countdown"}}, delayMsg(retrydelay)), ")"]));
			setInterval(function(event) {
				retrydelay--;
				replaceChildren(document.createTextNode(delayMsg(retrydelay)), document.querySelector("h1 > span.countdown"));
				if (retrydelay == 0) { location.reload(false); }
			}, 1000);
		}
	}
}
function checkError(css, content) {
	try { if (document.querySelector(css).textContent.match(content)) return true; } catch (error) {}
	return false;
}
function delayMsg(sec) {
	return sec > 0 ? " in " + sec + " second" + (sec != 1 ? "s" : "") : "…";
}
/* --- ENTITY BONUS --- */
j2setting("MARK_PENDING_EDIT_MEDIUMS", true, true, "puts a border around mediums with pending edits");
j2setting("TRACKLIST_TOOLS", true, true, "adds “Remove recording relationships” and “Set selected recording dates” in releationship editor and tools to the tracklist tab of release editor" + j2superturbo.menu.expl + ": a “Time Parser” button next to the existing “Track Parser” in release editor’s tracklists and a “Search→Replace” button");
j2setting("UNLINK_ENTITY_HEADER", false, true, "unlink entity headers where link is same as current location (artist/release/etc. name) — if you use COLLECTION HIGHLIGHTER or anything that you wish change the header, make it run first or you might not see its effects");
j2setting("RECORDING_LENGTH_COLUMN", true, true, "Displays recording lengths in work page (similar to Loujine’s script) as well as in artist relationships page");
j2setting("RELEASE_EVENT_COLUMN", true, true, "Displays release dates in label relationships page");
var enttype = location.href.match(new RegExp("^" + MBS + "/(area|artist|collection|event|label|place|recording|release|release-group|series|work)/.*$"));
if (enttype) {
	enttype = enttype[1];
	// ================================================================= DISPLAY+
	// ## MARK_PENDING_EDIT_MEDIUMS ##
	// ==========================================================================
	if (j2sets.MARK_PENDING_EDIT_MEDIUMS && enttype == "release") {
		debug("MARK_PENDING_EDIT_MEDIUMS");
		for (let pendingEditMediums = document.querySelectorAll("div#content > table.tbl.medium > thead > tr.mp"), m = 0; m < pendingEditMediums.length; m++) {
			getParent(pendingEditMediums[m], "table").style.setProperty("border", "4px solid #fd9");
		}
	}
	// ================================================================== MOUSE+
	// ## TRACKLIST_TOOLS ## ex-TRACK_LENGTH_PARSER+search→replace(bookmarklet)+set-selected-works-date
	// =========================================================================
	if (j2sets.TRACKLIST_TOOLS && enttype == "release" && location.pathname.match(new RegExp("/release/(add.*|" + stre_GUID + "/edit)$"))) {
		userjs.releaseEditor = document.querySelector("div#release-editor");
		if (userjs.releaseEditor) {
			TRACKLIST_TOOLS_observer = new MutationObserver(function(mutations, observer) {
				TRACKLIST_TOOLS_calmDOM();
			});
			TRACKLIST_TOOLS_observer.observe(userjs.releaseEditor, {childList: true, subtree: true});
			userjs.releaseEditor.addEventListener("mouseover", TRACKLIST_TOOLS_buttonHandler);
			userjs.releaseEditor.addEventListener("mouseout", TRACKLIST_TOOLS_buttonHandler);
			userjs.releaseEditor.addEventListener("click", TRACKLIST_TOOLS_buttonHandler);
		}
	}
	if (j2sets.TRACKLIST_TOOLS && enttype == "release" && location.pathname.match(new RegExp("/release/" + stre_GUID + "/edit-relationships$"))) {
		var relationshipEditor = document.querySelector("div.rel-editor");
		if (relationshipEditor && relationshipEditor.querySelector("ul.tabs")) {
			/* :::: MASS REMOVE RECORDING RELATIONSHIPS :::: */
			j2superturbo.menu.addItem(createTag("a", {e: {click: function(event) {
				var text = prompt("This will remove the recording relationships that match the following text (ex.: “arrange”, “john”, “guitar”):");
				if (text && (text = text.trim()) && text != "") {
					var ars = document.querySelectorAll("td.recording > div.ars > div.ar > span[class*='remove-button']");
					for (var ar = 0; ar < ars.length; ar++) {
						if (!ars[ar].parentNode.querySelector("span.rel-remove") && ars[ar].parentNode.textContent.match(new RegExp(text, "i"))) {
							ars[ar].click();
						}
					}
				}
			}}}, [userjs.icon.cloneNode(false), " Remove recording relationships ", createTag("small", {s: {color: "grey"}}, "← TRACKLIST_TOOLS™")]));
			/* :::: MASS SET SELECTED RECORDING DATES :::: */
			j2superturbo.menu.addItem(createTag("a", {e: {click: function(event) {
				if (document.querySelector("#edit-relationship-dialog")) {
					alert("Close the Edit relationship popup")
				} else {
					userjs.checkedRelationships = {
						checkBoxes: document.querySelectorAll("#tracklist tr.track > td.recording > input.recording[type='checkbox']:checked"),
						pencils: []
					};
					if (userjs.checkedRelationships.checkBoxes.length > 0) {
						userjs.checkedRelationships.date = prompt("Type an YYYY-MM-DD, YYYY-MM or YYYY formated date that will be applied to all selected work relationships below.\nYou can type two dates, separated by at least one any character (example: “2014-12-31 2015-01”). This will set a date ranged relationship.");
						if (userjs.checkedRelationships.date) {
							if ((userjs.checkedRelationships.date = userjs.checkedRelationships.date.match(new RegExp(re_date.ISO + "(?:.+" + re_date.ISO + ")?")))) {
								for (let cb = 0; cb < userjs.checkedRelationships.checkBoxes.length; cb++) {
									for (let p = 0, pencils = userjs.checkedRelationships.checkBoxes[cb].closest("tr.track").querySelectorAll("table.rel-editor-table > tbody > tr.recording-of button.edit-item"); p < pencils.length; p++) {
										userjs.checkedRelationships.pencils = userjs.checkedRelationships.pencils.concat(Array.from(pencils));
									}
								}
								TRACKLIST_TOOLS_setWorkRecDate();
							} else {
								alert("Wrong date format");
							}
						}
					} else {
						alert("No recordings selected");
					}
				}
			}}}, [userjs.icon.cloneNode(false), " Set selected recording dates ", createTag("small", {s: {color: "grey"}}, "← TRACKLIST_TOOLS™")]));
		}
	}
	// ================================================================ DISPLAY-
	// ## UNLINK_ENTITY_HEADER ## (default off) Freso special request (https://gist.github.com/jesus2099/4111760)
	// =========================================================================
	if (j2sets.UNLINK_ENTITY_HEADER) {
		var h1link = document.querySelector("div#page h1 a[href='" + location.pathname.match(new RegExp("/" + enttype + "/" + stre_GUID)) + "']");
		if (h1link) {
			let h1 = getParent(h1link, "h1");
			if (h1.firstChild.nodeType != Node.TEXT_NODE) {
				debug("UNLINK_ENTITY_HEADER");
				h1link.classList.add(userjs.id);
				h1.addEventListener("mouseover", unlinkH1Link);
			}
		}
	}
	// ================================================================ DISPLAY+
	// ## RECORDING_LENGTH_COLUMN ## inspired by loujine’s https://bitbucket.org/loujine/musicbrainz-scripts/src/default/mbz-showperformancedurations.user.js for work page
	// ## RELEASE_EVENT_COLUMN ## requested by Lotheric https://github.com/jesus2099/konami-command/issues/132
	// =========================================================================
	if (
		j2sets.RECORDING_LENGTH_COLUMN && (enttype == "work" && location.pathname.match(new RegExp("^/work/" + stre_GUID + "$")) || enttype == "artist" && location.pathname.match(new RegExp("^/artist/" + stre_GUID + "/relationships$")) || enttype == "place" && location.pathname.match(new RegExp("^/place/" + stre_GUID + "/performances$")))
		||
		j2sets.RELEASE_EVENT_COLUMN && location.pathname.match(new RegExp("^/(artist|label)/" + stre_GUID + "/relationships$"))
	) {
		debug("RECORDING_LENGTH_COLUMN and/or RELEASE_EVENT_COLUMN");
		var relationshipTable = document.querySelector("div#content table.tbl");
		if (relationshipTable) {
			var fetchRecordingLength = j2sets.RECORDING_LENGTH_COLUMN && relationshipTable.getElementsByClassName("treleases").length == 0 && relationshipTable.querySelector("a[href*='/recording/']");
			var fetchReleaseEvents = j2sets.RELEASE_EVENT_COLUMN && relationshipTable.getElementsByClassName(userjs.id + "releaseEvents").length == 0 && relationshipTable.querySelector("a[href*='/release/']");
			if (fetchRecordingLength || fetchReleaseEvents) {
				var xhr_recording_length_column = new XMLHttpRequest();
				xhr_recording_length_column.addEventListener("load", function(event) {
					var relations = JSON.parse(this.responseText).relations;
					var recordingLengths = {};
					var recordingLengthFound = false;
					var releaseEvents = {};
					var releaseEventFound = false;
					// collecting recording length and release events
					for (let r = 0; r < relations.length; r++) {
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
							var length_header = relationshipTable.querySelector("thead > tr").lastChild;
							length_header.style.setProperty("text-shadow", "0 0 2px yellow");
							length_header.classList.add("treleases");
							length_header.setAttribute("title", userjs.name);
						}
						if (releaseEventFound) {
							relationshipTable.querySelector("thead > tr").insertBefore(createTag("th", {a: {title: userjs.name, class: userjs.id + "releaseEvents"}, s: {textShadow: "0 0 2px yellow"}}, "Release events"), relationshipTable.querySelector("thead > tr > th:nth-child(2)"));
						}
						var rows = relationshipTable.querySelectorAll("tbody > tr");
						for (let r = 0; r < rows.length; r++) {
							if (rows[r].classList.contains("subh")) {
								// sub title row
								if (releaseEventFound) {
									var secondHeader = rows[r].querySelector("tr.subh > th:nth-child(2)");
									if (secondHeader) {
										rows[r].insertBefore(document.createElement("th"), secondHeader);
									}
								}
							} else {
								// normal data row
								if (recordingLengthFound) {
									var length_cell = rows[r].lastChild;
									length_cell.style.setProperty("text-align", "right");
									length_cell.classList.add("treleases");
									length_cell.setAttribute("title", userjs.name);
									var recordingID = rows[r].querySelector("a[href*='/recording/']");
									if (recordingID && (recordingID = recordingID.getAttribute("href").match(re_GUID)[0])) {
										replaceChildren(document.createTextNode(recordingLengths[recordingID] ? time(recordingLengths[recordingID]) : "?:??"), length_cell);
									}
								}
								if (releaseEventFound) {
									var secondCell = rows[r].querySelector("tr:not(.subh) > td:nth-child(2)");
									if (secondCell) {
										let newCell = rows[r].insertBefore(document.createElement("td"), secondCell);
										var releaseID = secondCell.querySelector("a[href*='/release/']");
										if (releaseID && (releaseID = releaseID.getAttribute("href").match(re_GUID)[0]) && releaseEvents[releaseID]) {
											for (let e = 0; e < releaseEvents[releaseID].length; e++) {
												var releaseDate = releaseEvents[releaseID][e].date ? releaseEvents[releaseID][e].date : "\u00a0";
												var releaseEvent = createTag("div", {}, releaseDate);
												if (releaseEvents[releaseID][e].area) {
													if (releaseEvents[releaseID][e].area.name) {
														releaseEvent.setAttribute("title", releaseEvents[releaseID][e].area.name);
													}
													if (releaseEvents[releaseID][e].area["iso-3166-1-codes"] && releaseEvents[releaseID][e].area["iso-3166-1-codes"].length > 0) {
														releaseEvent.classList.add("flag");
														releaseEvent.classList.add("flag-" + releaseEvents[releaseID][e].area["iso-3166-1-codes"][0]);
														releaseEvent.setAttribute("title", releaseEvent.getAttribute("title") + " (" + releaseEvents[releaseID][e].area["iso-3166-1-codes"][0] + ")");
													}
												}
												newCell.appendChild(releaseEvent);
												if (releaseEvents[releaseID].length > 4) {
													if (e > 1 && e != releaseEvents[releaseID].length - 1) {
														releaseEvent.classList.add(userjs.id + "hiddenEvent");
														releaseEvent.style.setProperty("display", "none");
													}
													if (e == 1) {
														newCell.appendChild(createTag("div", {s: {padding: "8px"}}, ["(", createTag("a", {e: {click: tooManyEventsToggle}}, "show " + (releaseEvents[releaseID].length - 3) + " more"), ")"]));
													} else if (e == releaseEvents[releaseID].length - 1) {
														newCell.appendChild(createTag("div", {a: {class: userjs.id + "hiddenEvent"}, s: {display: "none", padding: "8px"}}, ["(", createTag("a", {e: {click: tooManyEventsToggle}}, "show less"), ")"]));
													}
												}
											}
										}
									}
								}
							}
						}
					}
				});
				xhr_recording_length_column.open("get", MBS + "/ws/2" + location.pathname.match(new RegExp("^/" + enttype + "/" + stre_GUID)) + "?inc=recording-rels+release-rels&fmt=json", true);
				xhr_recording_length_column.send(null);
			}
		}
	}
}
function tooManyEventsToggle(event) {
	var hideEvents = event.target.parentNode.classList.contains(userjs.id + "hiddenEvent");
	var otherToggle = event.target.parentNode.parentNode.querySelector("div" + (hideEvents ? ":not(." + userjs.id + "hiddenEvent)" : "." + userjs.id + "hiddenEvent") + " > a").parentNode;
	event.target.parentNode.style.setProperty("display", "none");
	if (hideEvents) {
		otherToggle.style.setProperty("display", "block");
	}
	var hiddenEvents = event.target.parentNode.parentNode.querySelectorAll("div." + userjs.id + "hiddenEvent");
	for (let h = 0; h < hiddenEvents.length; h++) {
		hiddenEvents[h].style.setProperty("display", hideEvents ? "none" : "block");
	}
	otherToggle.scrollIntoView();
}
/* --- ENTITY BONUS functions --- */
var TRACKLIST_TOOLS_calmDOMto;
var TRACKLIST_TOOLS_observer;
function TRACKLIST_TOOLS_calmDOM() {
	if (TRACKLIST_TOOLS_calmDOMto) {
		clearTimeout(TRACKLIST_TOOLS_calmDOMto);
	}
	TRACKLIST_TOOLS_calmDOMto = setTimeout(TRACKLIST_TOOLS_init, 100);
}
function TRACKLIST_TOOLS_buttonHandler(event) {
	if (event.target.className.match(new RegExp("^" + userjs.id + "(search-replace|track-length-parser)$"))) {
		if (event.type == "click") {
			/* :::: TRACK NAME SEARCH→REPLACE :::: */
			if (event.target.classList.contains(userjs.id + "search-replace")) {
				var searchrep = localStorage.getItem(userjs.id + "search-replace");
				searchrep = searchrep ? JSON.parse(searchrep) : ["", ""];
				if (
					(searchrep[0] = prompt("search\n\neither regex (case *i*nsensitive and *g*lobal are optional flags): /\"([^\"]+)\"/g\n\nor normal (case sensitive and global): My String", searchrep[0]))
					&& (searchrep[1] = prompt("replace\n\nif it was a regex, you can use those $1 $2 $3 etc.: “$1”", searchrep[1])) != null
				) {
					for (let t = 0, tracks = TRACKLIST_TOOLS_getInputs("td.format > input[id^='medium-title-'][type='text'], td.title > input.track-name[type='text']", event.target, event); t < tracks.length; t++) {
						var val = searchrep[0].match(/^\/.+\/[gi]*$/) ? tracks[t].value.replace(eval(searchrep[0]), searchrep[1]) : tracks[t].value.split(searchrep[0]).join(searchrep[1]);
						tracks[t].style.removeProperty("background-color");
						if (tracks[t].value != val) {
							tracks[t].value = val;
							tracks[t].style.setProperty("background-color", "yellow");
							tracks[t].focus();
							sendEvent(tracks[t], "change");
						}
					}
					localStorage.setItem(userjs.id + "search-replace", JSON.stringify(searchrep));
				}
			/* :::: TRACK LENGTH PARSER :::: */
			} else if (event.target.classList.contains(userjs.id + "track-length-parser")) {
				var durationParser = "(?:(?:(\\b\\d\\b)[°h])?(\\b\\d{1,3}\\b)[′’'m])?(\\b\\d{2}\\b)[″”\"s]|(?:(?:(\\b\\d\\b):)?(\\b\\d{1,3}\\b):)(\\b\\d{2}\\b)";
				var erase = event.target.textContent.match(/erase/i) || event.ctrlKey;
				var inputs = TRACKLIST_TOOLS_getInputs("td.length > input.track-length[type='text']:not(.disabled-hint)", event.target, event);
				var distitle = document.querySelector("td.length > input.track-length[type='text'].disabled-hint");
				var times = !erase && prompt("Track length parser\n\nPlease paste your huge text including track times below.\n“1:23” and “1′23″” and even incorrect “1’23”” and “1'23\"” will be parsed.\nYou can for instance copy from your foobar2000 tracklist, minc.or.jp, etc.\nWARNING. You must understand that all current times will be overwritten in the tracklist editor.");
				if (inputs.length == 0 && distitle) {
					distitle = distitle.getAttribute("title") || "No track length found.";
					event.target.setAttribute("disabled", "disabled");
					event.target.setAttribute("title", distitle);
					alert(distitle);
				} else if (erase && confirm("Are you sure you want to ERASE all track times?") || times && (times = times.match(new RegExp(durationParser, "g")))) {
					if (erase || inputs.length == times.length || confirm("ACHTUNG, detected times and tracks count mismatch.\nThere are " + times.length + " lengths detected in your text, butt\nthere are " + inputs.length + " tracks in the tracklist.\nAre you sure to go on?")) {
						for (let t = 0, i = 0; (erase || t < times.length) && i < inputs.length; t++, i++) {
							var time = "";
							if (!erase) {
								var date = new Date();
								time = times[t].match(new RegExp(durationParser));
								date.setUTCHours(time[1] || time[4] || 0);
								date.setUTCMinutes(time[2] || time[5] || 0);
								date.setUTCSeconds(time[3] || time[6]);
								time = (date.getUTCHours() * 60 + date.getUTCMinutes()) + ":" + (date.getUTCSeconds() < 10 ? "0" : "") + date.getUTCSeconds();
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
	var inputs = getParent(obj, "fieldset", "advanced-medium");
	if (obj.value.match(/\(all\)/i) || evt.shiftKey) { inputs = inputs.parentNode; }
	return inputs.querySelectorAll("fieldset.advanced-medium " + inputCSS);
}
function TRACKLIST_TOOLS_init() {
	debug("TRACKLIST_TOOLS_init");
	TRACKLIST_TOOLS_observer.disconnect();
	(new MutationObserver(function(mutations, observer) {
		var tps = userjs.releaseEditor.querySelectorAll("#tracklist-tools button[data-click='openTrackParser']");
		for (let tp = 0; tp < tps.length; tp++) {
			if (!tps[tp].parentNode.querySelector("." + userjs.id + "track-length-parser")) {
				addAfter(createTag("button", {a: {type: "button", "class": userjs.id + "track-length-parser", "_ctrlText": "Erase times", title: "CONTROL key to ERASE track times\nSHIFT key to alter all open tracklists"}, s: {backgroundColor: "yellow"}}, "Time Parser"), tps[tp]);
			}
			if (!tps[tp].parentNode.querySelector("." + userjs.id + "search-replace")) {
				addAfter(createTag("button", {a: {type: "button", "class": userjs.id + "search-replace", title: "SHIFT key to alter all open tracklists"}, s: {backgroundColor: "yellow"}}, "Search→replace"), tps[tp]);
			}
		}
	})).observe(userjs.releaseEditor, {childList: true, subtree: true});
}
function TRACKLIST_TOOLS_setWorkRecDate() {
	if (userjs.checkedRelationships.pencils.length > 0) {
		userjs.checkedRelationships.current_pencil = userjs.checkedRelationships.pencils.shift();
		var rel_id = userjs.checkedRelationships.current_pencil.getAttribute("id").match(/^edit-relationship-recording-work-(\d+)$/)[1];
		rel_id = "#edit-relationship-dialog input[type='text']#relationship-type-recording-work-" + rel_id;
		userjs.checkedRelationships.current_pencil.click();
		waitForElement(rel_id, function() {
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.begin_date.year']"), userjs.checkedRelationships.date[2]);
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.begin_date.month']"), userjs.checkedRelationships.date[3] || "");
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.begin_date.day']"), userjs.checkedRelationships.date[4] || "");
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.end_date.year']"), (userjs.checkedRelationships.date[5] ? userjs.checkedRelationships.date[6] : userjs.checkedRelationships.date[2]) || "");
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.end_date.month']"), (userjs.checkedRelationships.date[5] ? userjs.checkedRelationships.date[7] : userjs.checkedRelationships.date[3]) || "");
			forceValue(document.querySelector("#edit-relationship-dialog table.relationship-details > tbody input[id='id-period.end_date.day']"), (userjs.checkedRelationships.date[5] ? userjs.checkedRelationships.date[8] : userjs.checkedRelationships.date[4]) || "");
			document.querySelector("#edit-relationship-dialog div.buttons button.positive").click();
		});
		waitForNoElements(rel_id, function() { TRACKLIST_TOOLS_setWorkRecDate(); });
	}
}
function waitForNoElements(selector, callback) {
	var waitForElementIntervalID = setInterval(function() {
		var element = document.querySelector(selector);
		if (!element) {
			clearInterval(waitForElementIntervalID);
			callback(element);
		}
	}, 123);
}
function unlinkH1Link(event) {
	event.currentTarget.removeEventListener("mouseover", unlinkH1Link);
	let h1link = event.currentTarget.querySelector("a." + userjs.id);
	h1link.classList.remove(userjs.id);
	h1link.removeAttribute("href");
}
function time(_ms) {/* adapted from mb_INLINE-TRACK-ARTIST */
	var ms = typeof _ms == "string" ? parseInt(_ms, 10) : _ms;
	if (ms > 0) {
		var d = new Date(ms);
		return (d.getUTCHours() ? d.getUTCHours() + ":" + (d.getUTCMinutes() < 10 ? "0" : "") : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() / 100).toFixed(2).slice(2) + "." + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2);
	}
	return "?:??";
}
function debug(txt, buffer) {
	if (DEBUG) {
		if (buffer) {
			debugBuffer += txt + "\n";
		} else {
			console.debug("[" + userjs.name + "] " + "\n" + debugBuffer + txt);
			debugBuffer = "";
		}
	}
}
