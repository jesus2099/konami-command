// ==UserScript==
// @name         mb. COOL ENTITY LINKS
// @version      2021.1.20.2099
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_COOL-ENTITY-LINKS.user.js
// @description  musicbrainz.org: In some pages like edits, blog, forums, chatlogs, tickets, annotations, etc. it will prefix entity links with an icon, shorten and embelish all sorts of MB links (cdtoc, entities, tickets, bugs, edits, etc.).
// @homepage     http://userscripts-mirror.org/scripts/show/131731
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_COOL-ENTITY-LINKS
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COOL-ENTITY-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_COOL-ENTITY-LINKS.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012-04-24; https://web.archive.org/web/20131104205641/userscripts.org/scripts/show/131731 / https://web.archive.org/web/20141011084006/userscripts-mirror.org/scripts/show/131731
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@4fa74ddc55ec51927562f6e9d7215e2b43b1120b/lib/SUPER.js?v=2018.3.14
// @grant        none
// @match        *://*.mbsandbox.org/*
// @match        *://*.musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* -------- CONFIGURATION START (don't edit above) -------- */
var contractMBIDs = true; // more compact MBIDs but brwoser can still inline search/find full MBID (this is magic from mb_INLINE-STUFF)
var editLink = true; // add direct link to edit page
var editsLink = true; // add direct link to edit history and open edit pages
var confirmIfMoreThan = 2000; // -1 to never confirm
/* -------- CONFIGURATION  END  (don't edit below) -------- */
var userjs = "jesus2099userjs131731";
var GUIDi = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var entities = {
	acoustid: {fullpath: "//acoustid.org/track/"},
	artist: {path: "/artist/", icon: "artist.png"},
	bug: {fullpath: "//bugs.musicbrainz.org/ticket/", id: "[0-9]+", label: "#%id%", HTTPonly: true},
	cdtoc: {path: "/cdtoc/", icon: "release.png", id: "[A-Za-z0-9_\\.]+-"},
	"classic.edit": {path: "/show/edit/?editid=", id: "[0-9]+", label: "edit\u00a0#%id%"},
	"classic.user": {path: "/show/user/?username=", id: ".+"},
	edit: {path: "/edit/", id: "[0-9]+", label: "#%id%"},
	label: {path: "/label/", icon: "label.png"},
	place: {path: "/place/", icon: "place.svg"},
	recording: {path: "/recording/", icon: "recording.png"},
	release: {path: "/release/", icon: "release.png"},
	"release-group": {path: "/release-group/", icon: "release_group.svg"},
	ticket: {fullpath: "//tickets.musicbrainz.org/browse/", id: "[A-Za-z]+-[0-9]+", HTTPonly: true},
	track: {path: "/track/", icon: "recording.png", noTools: true},
	user: {path: "/user/", id: ".+", openEdits: "/edits/open", noEdit: true},
	work: {path: "/work/", icon: "work.svg"},
};
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
j2css.insertRule("a." + userjs + " {text-shadow: 1px 1px 2px silver; white-space: nowrap;}", 0);
j2css.insertRule("a." + userjs + "tool {font-variant: small-caps; vertical-align: super; font-size: xx-small}", 0);
self.addEventListener("load", function(event){
	for (var ent in entities) if (Object.prototype.hasOwnProperty.call(entities, ent)) {
		localStorage.removeItem("jesus2099skip_linksdeco_" + ent);
	}
});
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
	} else if (self.location.href.match(/^https?:\/\/(test\.|beta\.|classic\.)?musicbrainz\.org/)) {
		cssas = "table.details a[href*='//" + u + "'], ";
		cssas += "table.details a[href*='//test." + u + "'], ";
		cssas += "table.details a[href*='//beta." + u + "'], ";
		cssas += "table.details a[href*='//classic." + u + "'][href$='.html'], ";
		cssas += "div.annotation a[href*='//" + u + "'], ";
		cssas += "div.annotation a[href*='//test." + u + "'], ";
		cssas += "div.annotation a[href*='//beta." + u + "'], ";
		cssas += "div.annotation a[href*='//classic." + u + "'][href$='.html'], ";
		cssas += "div[class^='edit-'] a[href*='//" + u + "'], ";
		cssas += "div[class^='edit-'] a[href*='//test." + u + "'], ";
		cssas += "div[class^='edit-'] a[href*='//beta." + u + "'], ";
		cssas += "div[class^='edit-'] a[href*='//classic." + u + "'][href$='.html']";
		if (self.location.pathname.match(new RegExp("/(artist|label)/" + GUIDi + "/relationships|/place/" + GUIDi + "/performances"), "i")) {
			cssas += ", table.tbl tr > td:first-child + td a[href*='//" + u + "'], ";
			cssas += "table.tbl tr > td:first-child + td a[href*='//test." + u + "'], ";
			cssas += "table.tbl tr > td:first-child + td a[href*='//beta." + u + "']";
		}
	} else {
		cssas = "a[href*='//" + u + "'], ";
		cssas += "a[href*='//test." + u + "'], ";
		cssas += "a[href*='//beta." + u + "'], ";
		cssas += "a[href*='//classic." + u + "'][href$='.html']";
	}
	as = document.querySelectorAll(cssas);
	var skip = localStorage.getItem("jesus2099skip_linksdeco_" + ent); // skip deco shared with COLLECTION HIGHLIGHTER asks only once per page
	if (confirmIfMoreThan < 0 || (as.length <= confirmIfMoreThan || skip && skip == "0" || !(skip && skip == "1") && as.length > confirmIfMoreThan && confirm("jesus2099 links decorator (MB entities / collection)\n\nThere are " + as.length + " " + ent.toUpperCase() + "S to parse on this page.\nThis can take a great while to check/decorate all these links.\n\nPress OK if you still want to proceed anyway or\npress CANCEL if you want to skip it this time."))) {
		skip = "0";
		for (var a = 0; a < as.length; a++) {
			var href, id;
			if (
				(href = as[a].getAttribute("href"))
				&& (id = href.match(new RegExp(u + "(" + (entities[ent].id ? entities[ent].id : GUIDi) + ")(?:\\.html)?(/[a-z_-]+)?(.+)?$", "i")))
				&& !as[a].querySelector("img:not(.rendericon)")
			) {
				var newA = as[a].cloneNode(true);
				newA.classList.add(c);
				if (as[a].textContent == href || /* forums */ as[a].textContent == href.substr(0, 39) + " … " + href.substr(-10) || /* edit-notes */ as[a].textContent == href.substr(0, 48) + "…") {
					newA.classList.add(userjs);
					var text = unescape(id[1]);
					if (entities[ent].label) text = entities[ent].label.replace(/%id%/, text);
					if (text) {
						newA.replaceChild(entities[ent].id ? document.createTextNode(text) : createTag("code", {}, text), newA.firstChild);
					}
					if (id[2] || id[3]) {
						newA.appendChild(document.createElement("small")).appendChild(document.createTextNode((id[2] ? id[2] : "") + (id[3] ? "…" : ""))).parentNode.style.setProperty("opacity", ".5");
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
	} else { skip = "1"; }
	localStorage.setItem("jesus2099skip_linksdeco_" + ent, skip);
}
