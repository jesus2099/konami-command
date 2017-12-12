"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         mb. HYPER MOULINETTE
// @version      2017.12.12
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_HYPER-MOULINETTE.user.js
// @description  musicbrainz.org: Mass PUT or DELETE releases in a collection from an edit search or an other collection
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_HYPER-MOULINETTE
// @incompatible opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.34)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_HYPER-MOULINETTE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_HYPER-MOULINETTE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-09-19
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @match        *://*.mbsandbox.org/user/*/collections
// @match        *://*.musicbrainz.org/user/*/collections
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
meta.name = meta.name.substr("4");
var DEBUG = false;
meta.key = "jesus2099"+meta.name.replace(/ /, "-");
var stre_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var re_GUID = new RegExp(stre_GUID);
var account = document.querySelector("ul.menu li.account");
var target, method, source, client, loaders = [];
var crawlType = {
	"^/collection/": "div#page table.tbl tbody a[href*='/release/']",
	"^/search/edits": "div.edit-details a[href*='/release/']",
};
var genuineTitle = document.title;
/*==========================================================================
## MENU ITEM ##
find this script in front of release collections
==========================================================================*/
if (self.location.href.match(/\/collections/) && document.querySelector("h1").textContent == account.querySelector("span.menu-header").textContent.match(/(\w+)\s.$/)[1]) {
	var collectionHeaders = document.querySelectorAll("table.tbl > thead > tr")
	for (var th = 0; th < collectionHeaders.length; th++) {
		if (collectionHeaders[th].textContent.match(/Veröffentlichungen|Väljalasked|Releases|Publicaciones|Parutions|Pubblicazioni|Uitgaves|Julkaisut|Κυκλοφορίες|リリース/i)) {
			collectionHeaders[th].appendChild(createTag("th", {a: {class: "hypermouli-header"}}, [meta.name.replace(/.+\. /, "") + (self.opera ? " (does not work in Opera!)" : ""), createTag("br"), meta.description.replace(/.+:/, "")]));
			var columns = collectionHeaders[th].parentNode.parentNode.querySelectorAll("table.tbl > tbody > tr");
			for (var c = 0; c < columns.length; c++) {
				columns[c].appendChild(createTag("td", {}, [createTag("a", {e: {click: mouli}}, "Put"), " | ", createTag("a", {e: {click: mouli}}, "Delete")]));
			}
		}
	}
}
/*==========================================================================
## THE BIG ONE ## goes here
==========================================================================*/
function mouli() {
	target = this.parentNode.parentNode.querySelector("a[href*='/collection/']").getAttribute("href").match(re_GUID);
	method = this.textContent.toLowerCase();
	source = prompt("Please paste your release edit search or other collection URL here.\nIt will parse these pages to modify the previously mentionned collection.", localStorage.getItem(meta.key+"_"+method+"-source")||"");
	client = meta.name.replace(/^mb\. /, "").replace(/ /g, ".").toLowerCase()+"-"+meta.version;
	if (target && method.match(/^(put|delete)$/i) && source) {
		localStorage.setItem(meta.key+"_"+method+"-source", source);
		source = source.replace(/^(https?:\/\/[^\/]+)?(\/.+)/, "$2");
		modal(createTag("h3", {}, [createTag("a", {a:{href:meta.namespace, target:"_blank"}}, meta.name), " ", createTag("b", {}, meta.version), " (reload this page to abort)"]));
		if (source.match(/^\/search\/edits/)) {
			modal(createTag("p", {}, "(loading first page of an edit search is always long)"));
		}
		loadForExtract(source.replace(/([\?&])page=\d+&*/g, "$1")+(source.match(/\?/)?"&":"?")+"page=1");
	} else {
		alert("syntax error\ntarget: "+target+"\nmethod: "+method+" (should be either “put” or “delete”)\nsource: "+source);
	}
}
function loadForExtract(page) {
	var xhr = new XMLHttpRequest();
	loaders[xhr.getID()] = {maxRetry:5, url:page};
	xhr.addEventListener("load", function(e) {
		var sPage = loaders[this.getID()].url.match(/page=(\d+)$/)[1];
		var iPage = parseInt(sPage, 10);
		var suffix = {1:"st",2:"nd",3:"rd",digit:sPage.match(/(?:^|[02-9])([123])$/)};
		sPage = sPage+(suffix.digit?suffix[suffix.digit[1]]:"th")+" page";
		var ploaded = modal(createTag("h4", {}, [createTag("a", {a:{href:loaders[this.getID()].url, target:"_blank"}}, sPage), " loaded"]));
		document.title = sPage+" loaded ("+meta.name+") "+genuineTitle;
		var res = document.createElement("html"); res.innerHTML = this.responseText;
		var releases;
		for (var type in crawlType) if (crawlType.hasOwnProperty(type) && loaders[this.getID()].url.match(new RegExp(type))) {
			releases = res.querySelectorAll(crawlType[type]);
			ploaded.appendChild(document.createTextNode(" ("+releases.length+" release"+(releases.length==1?"":"s")+"):"));
			if (releases.length > 0) {
				var url = "/ws/2/collection/"+target+"/releases/";
				var cont = modal(createTag("table"));
				for (var r=0; r < releases.length; r++) {
					var guid = releases[r].getAttribute("href").match(re_GUID);
					cont.appendChild(createTag("tr", {}, [createTag("th", {s:{"padding-right":"6px"}}, (r+1)+"."), createTag("td", {s:{padding:"0px"}}, createTag("img", {a:{src:"http://coverartarchive.org/release/"+guid+"/front-250",alt:""},s:{margin:"0px","max-height":"16px","max-width":"16px","box-shadow":"1px 1px 2px black"},e:{error:function(){this.parentNode.removeChild(this);}}})), createTag("td", {s:{"padding-left":"6px"}}, createTag("a", {a:{href:releases[r].getAttribute("href"),target:"_blank"}}, releases[r].textContent))]));
					url += (r==0?"":";")+guid;
				}
				requestForAction(method, url+"?client="+client);
			}
			break;
		}
		if (res.querySelector("ul.pagination > li:last-of-type > a")) {
			loadForExtract(page.replace(/(page=)\d+$/, "$1"+(iPage+1)));
		} else {
			document.title = genuineTitle;
			modal(createTag("h3", {}, ["Last page processed (", createTag("a",{e:{click:function(){self.location.reload()}}},"RELOAD"), " page to quit this crap)."]));
		}
	});
	xhr.addEventListener("error", function(e) {
		if (--loaders[this.getID()].maxRetry > 0) {
			modal(createTag("fragment", {}, ["Error loading ", createTag("a", {a:{href:loaders[this.getID()].url, target:"_blank"}}, "page"), ", retrying…"]));
			loadForExtract(loaders[this.getID()].url);
		} else {
			alert("XHR-"+this.getID()+" ERROR "+this.status+"\nStopped retrying.\n"+loaders[this.getID].url+"\n\n"+this.responseText);
		}
	});
	xhr.openDebug("get", page);
	xhr.sendDebug(null);
}
function requestForAction(method, url) {
if (self.opera) { modal(createTag("p", {}, ["Will not perform ",createTag("a", {a:{href:url,target:"_blank"}}, method)," (auth-digest does not work in Opera)."])); }
	else {
		var xhr = new XMLHttpRequest();
		loaders[xhr.getID()] = {method:method, url:url, maxRetry:5};
		xhr.addEventListener("load", function(e) {
			var node, res = this.responseXML.documentElement;
			var msg = createTag("fragment", {}, ["Releases “", createTag("a", {a:{title:loaders[this.getID()].method, href:loaders[this.getID()].url, target:"_blank"}}, loaders[this.getID()].method), "” on collection "]);
			if ((node = res.querySelector("message text")) && node.textContent.match(/ok/i)) {
				modal(createTag("p", {}, [msg, "OK."]));
			} else {
				modal(createTag("p", {}, [msg, "failed.\n\n"+res.textContent]));
			}
		});
		xhr.addEventListener("error", function(e) {
			if (--loaders[this.getID()].maxRetry > 0) {
				modal(createTag("fragment", {}, ["Error performing ", createTag("a", {a:{title:loaders[this.getID()].method, href:loaders[this.getID()].url, target:"_blank"}}, "“"+loaders[this.getID()].method+"” method"), ", retrying…"]));
				loadForAction(loaders[this.getID()].method, loaders[this.getID()].url);
			} else {
				alert("XHR-"+this.getID()+" ERROR "+this.status+"\nStopped retrying.\n"+loaders[this.getID].url+"\n\n"+this.responseText);
			}
		});
		xhr.openDebug(method, url);
		xhr.overrideMimeType("text/xml");
		xhr.sendDebug(null);
	}
}
/*======================================
## hacked from COLLECTION HIGHLIGHTER ##
======================================*/
function modal(txt) {
	var obj = document.getElementById(meta.key+"modal");
	if (txt && !obj) {
		coolstuff("div", "50", "100%", "100%", "black", ".6");
		obj = coolstuff("div", "55", "800px", "600px", "white");
		obj.setAttribute("id", meta.key+"modal");
		obj.style.padding = "4px";
		obj.style.overflow = "auto";
		obj.style.whiteSpace = "nowrap";
		obj.style.border = "4px solid black";
		obj.addEventListener("mouseover", function(e) { this.style.borderColor = "silver"; }, false);
		obj.addEventListener("mouseout", function(e) { this.style.borderColor = "black"; }, false);
	}
	if (txt && obj) {
		var ret = obj.appendChild(typeof txt=="string"?document.createTextNode(txt):txt);
		if (obj.style.borderColor == "black") { obj.scrollTop = obj.scrollHeight; }
		return ret;
	}
	if (!txt && obj) {
		obj.parentNode.removeChild(obj.previousSibling);
		obj.parentNode.removeChild(obj);
	}
	function coolstuff(t,z,x,y,b,o,a) {
		var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
		truc.style.position = "fixed";
		truc.style.zIndex = z;
		truc.style.width = x;
		var xx = x.match(/^([0-9]+)(px|%)$/);
		if (xx) {
			truc.style.left = ((xx[2] == "%" ? 100 : self.innerWidth) - xx[1]) / 2 + xx[2];
		}
		truc.style.height = y;
		var yy = y.match(/^([0-9]+)(px|%)$/);
		if (yy) {
			truc.style.top = ((yy[2] == "%" ? 100 : self.innerHeight) - yy[1]) / 2 + yy[2];
		}
		if (b) { truc.style.background = b; }
		if (o) { truc.style.opacity = o; }
		return truc;
	}
}
/*================================================================================
## adaptation of JULIEN COUVREUR inspired code at http://oreilly.com/pub/h/4133 ##
================================================================================*/
XMLHttpRequest.prototype.getID = function() {
	if (!this.id) {
		this.id = Math.floor(Math.random() * 1000);
	}
	return this.id;
};
XMLHttpRequest.prototype.openDebug = function(method, url) {
	var _url = (url.match(/^https?:\/\//) ? "" : self.location.protocol + "//" + self.location.host) + url;
	if (DEBUG) { console.log("XHR-"+this.getID()+" open "+method.toUpperCase()+" "+_url); }
	this.open(method, _url);
};
XMLHttpRequest.prototype.sendDebug = function(params) {
	if (DEBUG) {
		console.log("XHR-"+this.getID()+" send("+params+")");
		var loaded = function(e) {
			console.log("XHR-"+this.getID()+" "+e.type+" "+this.status);
		};
		this.addEventListener("load", loaded, false);
		this.addEventListener("error", loaded, false);
	}
	this.send(params);
};
/*==========================================================================
## MY COMMON CRAP : https://github.com/jesus2099/javascript-patate12chips ##
==========================================================================*/
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
			for (var attri in gadgets.a) if (gadgets.a.hasOwnProperty(attri)) { t.setAttribute(attri, gadgets.a[attri]); }
			for (var style in gadgets.s) if (gadgets.s.hasOwnProperty(style)) { t.style.setProperty(style.replace(/!/g,""), gadgets.s[style].replace(/!/g,""), style.match(/!/)||gadgets.s[style].match(/!/)?"important":""); }
			for (var event in gadgets.e) if (gadgets.e.hasOwnProperty(event)) { t.addEventListener(event, gadgets.e[event], false); }
		}
		if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
	}
	if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child=0; child<chldrn.length; child++) { t.appendChild(typeof chldrn[child]=="string"?document.createTextNode(chldrn[child]):chldrn[child]); } t.normalize(); }
	return t;
}
