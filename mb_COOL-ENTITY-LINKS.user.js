// ==UserScript==
// @name         mb. COOL ENTITY LINKS
// @version      2015.6.4.1626
// @description  musicbrainz.org: In some pages like edits, blog, forums, chatlogs, tickets, annotations, etc. it will prefix entity links with an icon, shorten and embelish all sorts of MB links (cdtoc, entities, tickets, bugs, edits, etc.).
// @homepage     http://userscripts-mirror.org/scripts/show/131731
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COOL-ENTITY-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_COOL-ENTITY-LINKS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-04-24
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*
// @include      http://*.mbsandbox.org/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	/* -------- CONFIGURATION START (don't edit above) -------- */
	var editLink = true;/*add direct link to edit page*/
	var editsLink = true;/*add direct link to edit history page*/
	var confirmIfMoreThan = 2000;/*-1 to never confirm*/
	var addNormal = true;/*add direct link to normal mbs after beta or test links*/
	var forceHTTPS = true;/*force HTTPS instead of HTTP everytime possible*/
	/* -------- CONFIGURATION  END  (don't edit below) -------- */
	var userjs = "jesus2099userjs131731";
	var GUIDi = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var entities = {
		"artist": {"path":"/artist/", "icon":"artist"},
		"bug": {"fullpath":"http://bugs.musicbrainz.org/ticket/", "id": "[0-9]+", "label":"#%id%", "HTTPonly":true},
		"cdtoc": {"path":"/cdtoc/", "icon":"release", "id":"[A-Za-z0-9_\\.]+-"},
		"classic.edit": {"path":"/show/edit/?editid=", "id":"[0-9]+", "label":"edit\u00a0#%id%"},
		"classic.user": {"path":"/show/user/?username=", "id":".+"},
		"edit": {"path":"/edit/", "id":"[0-9]+", "label":"edit\u00a0#%id%"},
		"label": {"path":"/label/", "icon":"label"},
		"place": {"path":"/place/", "icon":"blank"},/*MBS-7070*/
		"recording": {"path":"/recording/", "icon":"recording"},
		"release": {"path":"/release/", "icon":"release"},
		"release-group": {"path":"/release-group/", "icon":"release_group"},
		"ticket": {"fullpath":"http://tickets.musicbrainz.org/browse/", "id":"[A-Za-z]+-[0-9]+", "HTTPonly":true},
		"track": {"path":"/track/", "icon":"recording"},
		"user": {"path":"/user/", "id":".+"},
		"work": {"path":"/work/", "icon":"blank"},/*MBS-7070*/
	};
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	var j2css = document.styleSheets[document.styleSheets.length-1];
	j2css.insertRule("a."+userjs+" {text-shadow: 1px 1px 2px silver; white-space: nowrap;}", j2css.cssRules.length);
	j2css.insertRule("a."+userjs+"tool {font-variant: small-caps; vertical-align: super; font-size: xx-small}", j2css.cssRules.length);
	self.addEventListener("load",function(e){
		for (var ent in entities) { if (entities.hasOwnProperty(ent)) {
			localStorage.removeItem("jesus2099skip_linksdeco_"+ent);
		} }
	},false);
	for (var ent in entities) { if (entities.hasOwnProperty(ent)) {
		var u = (entities[ent].fullpath?entities[ent].fullpath:"musicbrainz.org"+entities[ent].path.replace("?", "\\?"));
		var c = userjs+ent;
		if (entities[ent].icon) {
			j2css.insertRule("a."+c+"::before {content:url(//musicbrainz.org/static/images/entity/"+entities[ent].icon+".png);margin-right:4px;vertical-align:-.3em;}", j2css.cssRules.length);
		}
		var as, cssas;
		if (entities[ent].fullpath) {
			cssas = "a[href^='"+u+"']";
		}
		else if (location.href.match(/^https?:\/\/(test\.|beta\.|classic\.)?musicbrainz\.org/)) {
			cssas = 
				"table.details a[href*='://"+u+"'], "+
				"table.details a[href*='://test."+u+"'], "+
				"table.details a[href*='://beta."+u+"'], "+
				"table.details a[href*='://classic."+u+"'][href$='.html'], "+
				"div.annotation a[href*='://"+u+"'], "+
				"div.annotation a[href*='://test."+u+"'], "+
				"div.annotation a[href*='://beta."+u+"'], "+
				"div.annotation a[href*='://classic."+u+"'][href$='.html'], "+
				"div[class^='edit-'] a[href*='://"+u+"'], "+
				"div[class^='edit-'] a[href*='://test."+u+"'], "+
				"div[class^='edit-'] a[href*='://beta."+u+"'], "+
				"div[class^='edit-'] a[href*='://classic."+u+"'][href$='.html']";
			if (location.pathname.match(new RegExp("/artist/"+GUIDi+"/relationships|/place/"+GUIDi+"/performances"),"i")) {
				cssas += ", table.tbl tr > td:first-child + td a[href*='://"+u+"'], "+
				"table.tbl tr > td:first-child + td a[href*='://test."+u+"'], "+
				"table.tbl tr > td:first-child + td a[href*='://beta."+u+"']";
			}
		}
		else {
			cssas = 
				"a[href*='://"+u+"'], "+
				"a[href*='://test."+u+"'], "+
				"a[href*='://beta."+u+"'], "+
				"a[href*='://classic."+u+"'][href$='.html']";
		}
		as = document.querySelectorAll(cssas);
		var skip = localStorage.getItem("jesus2099skip_linksdeco_"+ent);/*skip deco shared with COLLECTION HIGHLIGHTER asks only once per page*/
		if (confirmIfMoreThan < 0 || (as.length <= confirmIfMoreThan || skip && skip == "0" || !(skip && skip == "1") && as.length > confirmIfMoreThan && confirm("jesus2099 links decorator (MB entities / collection)\n\nThere are "+as.length+" "+ent.toUpperCase()+"S to parse on this page.\nThis can take a great while to check/decorate all these links.\n\nPress OK if you still want to proceed anyway or\npress CANCEL if you want to skip it this time."))) {
			skip = "0";
			for (var a=0; a<as.length; a++) {
				var href, id;
				if (
					(href = as[a].getAttribute("href")) && 
					(id = href.match(new RegExp(u+"("+(entities[ent].id?entities[ent].id:GUIDi)+")(?:\\.html)?(/[a-z_-]+)?(.+)?$", "i"))) &&
					!as[a].querySelector("img:not(.rendericon)")
				) {
					var altserv = href.match(/^[^/]*\/\/(?:(test|beta|classic)\.)/);
					var hrefn = href;
					if (altserv && addNormal) { hrefn = href.replace(/^([^/]*\/\/).+\.(musicbrainz\.org.+)$/, "$1$2"); }
					as[a].classList.add(c);
					if (as[a].textContent == href || /*forums*/as[a].textContent == href.substr(0, 39)+" … "+href.substr(-10) || /*edit-notes*/as[a].textContent == href.substr(0, 48)+"…") {
						if (forceHTTPS && !entities[ent].HTTPonly && href.match(/^http[^s]/)) {
							href = href.replace(/^(http)(:\/\/.+)$/, "https$2");
							as[a].setAttribute("href", href);
						}
						as[a].classList.add(userjs);
						var text = unescape(id[1]);
						if (entities[ent].label) text = entities[ent].label.replace(/%id%/, text);
						if (text) {
							as[a].replaceChild(document.createTextNode(text), as[a].firstChild);
							as[a].setAttribute("title", ent);
						}
						if (id[2] || id[3]) {
							as[a].appendChild(document.createElement("small")).appendChild(document.createTextNode((id[2]?id[2]:"") + (id[3]?"…":""))).parentNode.style.setProperty("opacity", ".5");
						}
						if ((ent=="user" && href.match(/user\/[^/]+$/) || !entities[ent].id && href.match(new RegExp(GUIDi+"$"))) && (editsLink || editLink)) {
							addAfter(document.createTextNode(">"), as[a]);
							if (editsLink) { addAfter(createTag("a", {"a":{"href":hrefn+"/edits","title":"see entity edit history"}}, "L"), as[a]); }
							if (editLink) { addAfter(createTag("a", {"a":{"href":hrefn+"/edit","title":"edit this entity"}}, "E"), as[a]); }
							addAfter(document.createTextNode("<"), as[a]);
						}
						if (altserv) {
							if (addNormal) {
								var mbs = document.createElement("a");
								mbs.setAttribute("title", "normal server link");
								mbs.setAttribute("href", hrefn);
								mbs.appendChild(document.createTextNode("n"));
								addAfter(document.createTextNode(")"), as[a]);
								addAfter(mbs, as[a]);
								addAfter(document.createTextNode("("), as[a]);
							}
							as[a].insertBefore(document.createElement("code").appendChild(document.createTextNode(altserv[1]+"\u00a0")).parentNode, as[a].firstChild);
						}
					}
				}
			}
		} else { skip = "1"; }
		localStorage.setItem("jesus2099skip_linksdeco_"+ent, skip);
	} }
	function addAfter(n, e) {
		if (n && e && e.parentNode) {
			if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
			else { return e.parentNode.appendChild(n); }
		} else { return null; }
	}
	function createTag(tag, gadgets, children) {
	        var t = (tag=="fragment"?document.createDocumentFragment():document.createElement(tag));
	        if(t.tagName) {
	                if (gadgets) {
	                        for (var attri in gadgets.a) { if (gadgets.a.hasOwnProperty(attri)) { t.setAttribute(attri, gadgets.a[attri]); } }
	                        for (var style in gadgets.s) { if (gadgets.s.hasOwnProperty(style)) { t.style.setProperty(style.replace(/!/,""), gadgets.s[style], style.match(/!/)?"important":""); } }
	                        for (var event in gadgets.e) { if (gadgets.e.hasOwnProperty(event)) { t.addEventListener(event, gadgets.e[event], false); } }
	                }
	                if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
	        }
	        if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child=0; child<chldrn.length; child++) { t.appendChild(typeof chldrn[child]=="string"?document.createTextNode(chldrn[child]):chldrn[child]); } t.normalize(); }
	        return t;
	}
})();