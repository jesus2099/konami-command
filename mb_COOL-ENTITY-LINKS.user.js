// ==UserScript==
// @name         mb. COOL ENTITY LINKS
// @version      2024.6.13.2308
// @description  musicbrainz.org: In some pages like edits, blog, forums, chatlogs, tickets, annotations, etc. it will prefix entity links with an icon, shorten and embelish all sorts of MB links (cdtoc, entities, tickets, bugs, edits, etc.).
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_COOL-ENTITY-LINKS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COOL-ENTITY-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-04-24; https://web.archive.org/web/20131104205641/userscripts.org/scripts/show/131731 / https://web.archive.org/web/20141011084006/userscripts-mirror.org/scripts/show/131731
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*.musicbrainz.org/*
// @match        *://blog.metabrainz.org/*
// @match        *://chatlogs.metabrainz.org/libera/*
// @match        *://tickets.metabrainz.org/browse/*
// @match        *://web.archive.org/web/*/bugs.musicbrainz.org/ticket/*
// @match        *://web.archive.org/web/*/chatlogs.musicbrainz.org/*
// @match        *://web.archive.org/web/*/forums.musicbrainz.org/viewtopic.php*
// @exclude      /^https?:\/\/(\w+\.)?musicbrainz\.org\/account\//
// @exclude      /^https?:\/\/(\w+\.)?musicbrainz\.org\/admin\//
// @run-at       document-end
// ==/UserScript==
"use strict";
/* -------- CONFIGURATION START (don't edit above) -------- */
var contractMBIDs = true; // more compact MBIDs but brwoser can still inline search/find full MBID (this is magic from mb_INLINE-STUFF)
var editLink = true; // add direct link to edit page
var editsLink = true; // add direct link to edit history and open edit pages
/* -------- CONFIGURATION  END  (don't edit below) -------- */
var userjs = "jesus2099userjs131731";
var GUIDi = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var entities = {
	acoustid: {fullpath: "//acoustid.org/track/"},
	area: {path: "/area/", icon: "area.svg"},
	artist: {path: "/artist/", icon: "artist.svg"},
	bug: {fullpath: "//bugs.musicbrainz.org/ticket/", id: "[0-9]+", label: "#%id%", replace: [/^(https?:)\/\/bugs/, "https://web.archive.org/web/2017/bugs"]},
	cdtoc: {path: "/cdtoc/", icon: "release.svg", id: "[A-Za-z0-9_\\.]+-"},
	"classic.edit": {path: "/show/edit/?editid=", id: "[0-9]+", label: "edit\u00a0#%id%"},
	"classic.user": {path: "/show/user/?username=", id: "[^/]+"},
	edit: {path: "/edit/", id: "[0-9]+", label: "#%id%"},
	event: {path: "/event/", icon: "event.svg"},
	instrument: {path: "/instrument/", icon: "instrument.svg"},
	label: {path: "/label/", icon: "label.svg"},
	place: {path: "/place/", icon: "place.svg"},
	recording: {path: "/recording/", icon: "recording.svg"},
	release: {path: "/release/", icon: "release.svg"},
	"release-group": {path: "/release-group/", icon: "release_group.svg"},
	series: {path: "/series/", icon: "series.svg"},
	ticket: {fullpath: "//tickets.metabrainz.org/browse/", id: "[A-Za-z]+-[0-9]+"},
	"ticket-old": {fullpath: "//tickets.musicbrainz.org/browse/", id: "[A-Za-z]+-[0-9]+", replace: [/#action_(\d+)/, "#comment-$1"]},
	track: {path: "/track/", icon: "recording.svg", noTools: true},
	user: {path: "/user/", icon: "editor.svg", id: "[^/]+", openEdits: "/edits/open", noEdit: true},
	work: {path: "/work/", icon: "work.svg"},
};
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
j2css.insertRule("a." + userjs + " {text-shadow: 1px 1px 2px silver; white-space: nowrap;}", 0);
j2css.insertRule("a." + userjs + "tool {font-variant: small-caps; vertical-align: super; font-size: xx-small}", 0);
for (var ent in entities) if (Object.prototype.hasOwnProperty.call(entities, ent)) {
	var u = (entities[ent].fullpath ? entities[ent].fullpath : "musicbrainz.org" + entities[ent].path.replace("?", "\\?"));
	var c = userjs + ent;
	if (entities[ent].icon) {
		j2css.insertRule("a." + c + " { background-image: url(//musicbrainz.org/static/images/entity/" + entities[ent].icon + "); background-repeat: no-repeat; background-size: contain; padding-left: 16px; }", 0);
	}
	if (contractMBIDs && ent != "user") {
		j2css.insertRule("a." + c + " > code { display: inline-block; overflow-x: hidden; vertical-align: bottom; }", 0);
		j2css.insertRule("a." + c + ":hover > code { display: inline; }", 0);
	}
	var as, cssas;
	if (entities[ent].fullpath) {
		cssas = "a[href^='" + u + "'], a[href^='http:" + u + "'], a[href^='https:" + u + "']";
	} else if (self.location.href.match(/^https?:\/\/((beta|test)\.)?musicbrainz\.org/)) {
		cssas  = ".annotation-body a[href^='" + entities[ent].path + "'], ";
		cssas += ".annotation-body a[href*='//" + u + "'], ";
		cssas += ".annotation-body a[href*='//test." + u + "'], ";
		cssas += ".annotation-body a[href*='//beta." + u + "'], ";
		cssas += ".annotation-body a[href*='//classic." + u + "'][href$='.html'], ";
		cssas += ".edit-note-text a[href^='" + entities[ent].path + "'], ";
		cssas += ".edit-note-text a[href*='//" + u + "'], ";
		cssas += ".edit-note-text a[href*='//test." + u + "'], ";
		cssas += ".edit-note-text a[href*='//beta." + u + "'], ";
		cssas += ".edit-note-text a[href*='//classic." + u + "'][href$='.html']";
	} else {
		cssas = "a[href*='//" + u + "'], ";
		cssas += "a[href*='//test." + u + "'], ";
		cssas += "a[href*='//beta." + u + "'], ";
		cssas += "a[href*='//classic." + u + "'][href$='.html']";
	}
	as = document.querySelectorAll(cssas);
	for (var a = 0; a < as.length; a++) {
		var href, id;
		if (
			(href = as[a].getAttribute("href"))
			&& (id = href.match(new RegExp("(?:" + u + (entities[ent].path ? "|" + entities[ent].path : "") + ")" + "(" + (entities[ent].id ? entities[ent].id : GUIDi) + ")(?:\\.html)?(/[a-z_-]+)?(.+)?$", "i")))
			&& !as[a].querySelector("img:not(.rendericon)")
		) {
			var newA = as[a].cloneNode(true);
			if (entities[ent].replace) {
				newA.setAttribute("href", newA.getAttribute("href").replace(entities[ent].replace[0], entities[ent].replace[1]));
			}
			newA.classList.add(c);
			if (href.indexOf(as[a].textContent.replace(/\s?(…|\.{3}).*$/, "")) === 0) {
				newA.classList.add(userjs);
				var text = unescape(id[1]);
				if (entities[ent].label) text = entities[ent].label.replace(/%id%/, text);
				if (text) {
					newA.replaceChild(entities[ent].id ? document.createTextNode(text) : createTag("code", {}, text), newA.firstChild);
				}
				if (id[2] || id[3]) {
					var subA = createTag("small", {s: {opacity: ".8"}});
					if (id[2]) {
						subA.appendChild(createTag("b", {}, id[2].replace(/^(\/)/, " $1\u00a0")));
					}
					if (id[3]) {
						subA.appendChild(document.createTextNode(unescape(id[3]).replace(/(\/|#|\?|&)/g, " $1\u00a0").replace(/ /g, "\u00a0")));
					}
					newA.appendChild(subA);
				}
				var altserv = href.match(/^[^/]*\/\/(?:(test|beta|classic)\.musicbrainz\.org)/);
				if (altserv) {
					newA.appendChild(document.createTextNode(" (" + altserv[1] + ")"));
				}
				var code = newA.querySelector("code");
				if (contractMBIDs && code) {
					var width = parseInt(self.getComputedStyle(code).getPropertyValue("width").match(/^\d+/) + "", 10);
					code.style.setProperty("width", width / code.textContent.length * 8 + "px");
				}
				newA.insertBefore(createTag("b", {}, ent + "\u00A0"), newA.firstChild);
				if (entities[ent].noTools !== true) {
					if (u.match(/musicbrainz\.org/) && (ent == "user" && href.match(/user\/[^/]+$/) || !entities[ent].id && href.match(new RegExp(GUIDi + "$"))) && (editsLink || editLink)) {
						var fragment = document.createDocumentFragment();
						fragment.appendChild(newA);
						addAfter(document.createTextNode(">"), newA);
						if (editLink && entities[ent].noEdit !== true) { addAfter(createTag("a", {a: {href: href + "/edit", title: "edit this entity"}}, "E"), newA); }
						if (editsLink) { addAfter(createTag("a", {a: {href: href + "/edits", title: "see entity edit history"}}, "H"), newA); }
						if (editsLink) { addAfter(createTag("a", {a: {href: href + (entities[ent].openEdits ? entities[ent].openEdits : "/open_edits"), title: "see entity open edits"}}, "O"), newA); }
						addAfter(document.createTextNode(" <"), newA);
						newA = fragment;
					}
				}
			}
			as[a].parentNode.replaceChild(newA, as[a]);
		}
	}
}
