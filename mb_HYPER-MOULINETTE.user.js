(function(){"use strict";var meta={rawmdb:function(){
// ==UserScript==
// @name         mb. HYPER MOULINETTE
// @version      2014.9.30.1234
// @description  musicbrainz.org: (CURRENTLY “ONLY” SUPPORTS COLLECTING RELEASES FROM EDIT SEARCH AND PUT/DELETE THEM IN/FROM COLLECTION) browses pages of MB content to perform some actions on spotted entities
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_HYPER-MOULINETTE.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_HYPER-MOULINETTE.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014.9.19
// @grant        none
// @include      http*://*musicbrainz.org/*
// @include      http://*.mbsandbox.org/*
// @exclude      *//*/*mbsandbox.org*
// @exclude      *//*/*musicbrainz.org*
// @exclude      *blog.musicbrainz.org*
// @exclude      *bugs.musicbrainz.org*
// @exclude      *chatlogs.musicbrainz.org*
// @exclude      *forums.musicbrainz.org*
// @exclude      *geordi.musicbrainz.org*
// @exclude      *musicbrainz.org/ws*
// @exclude      *tickets.musicbrainz.org*
// @exclude      *wiki.musicbrainz.org*
// @run-at       document-end
// ==/UserScript==
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
	var DEBUG = false;
	meta.key = "jesus2099userjsHyperMoulinette";
	var MBS = self.location.protocol+"//"+self.location.host;
	var stre_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var re_GUID = new RegExp(stre_GUID);
	var account = document.querySelector("div#header-menu li.account");
	var collid, action, search, client, loaders = [];
	if (account) {
		document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
		/*==========================================================================
		## MENU ITEM ##
		find this script in MB "Editing" menu
		==========================================================================*/
		var j2hypermoulinette = {
			css: document.styleSheets[document.styleSheets.length-1],
			menu: {
				addItem: function(item) {
					j2hypermoulinette.menu.lastItem = addAfter(createTag("li", {a:{"class":"jesus2099"}}, item), j2hypermoulinette.menu.getLastItem());
				},
				getLastItem: function() {
					if (j2hypermoulinette.menu.lastItem) return j2hypermoulinette.menu.lastItem;
					else {
						var head, MBmenu = document.querySelector("div#header-menu li.editing > ul") || document.querySelector("div#header-menu li.about > ul");
						if (MBmenu && (head = MBmenu.parentNode.querySelector("a"))) {
							j2hypermoulinette.menu.lastItem = MBmenu.appendChild(createTag("li", {a:{"class":"jesus2099 separator"}}));
							return j2hypermoulinette.menu.lastItem;
						}
					}
				},
			},
		};
		j2hypermoulinette.menu.addItem(createTag("a", {e:{click:mouli}}, "HYPER MOULINETTE™"));
	}
	/*==========================================================================
	## THE BIG ONE ## goes here
	==========================================================================*/
	function mouli() {
		collid = prompt("This allows to batch PUT/DELETE releases from an edit search into a collection.\n\nPlease paste a collection URL or MBID.").toLowerCase();
		action = prompt("Please tell if you want to PUT or DELETE releases to/from this collection.", "put").toLowerCase();
		search = prompt("Please paste your edit search URL here.\nCurrently it has only been tested on a « edit type is Add Release by editor XXX » kind of search that is updating a collection.");
		client = meta.name.replace(/^mb\. /, "").replace(/ /g, ".").toLowerCase()+"-"+meta.version;
		if (
			(collid = collid.match(re_GUID)) &&
			(action.match(/^(put|delete)$/i)) &&
			(search = search.replace(/([\?&])page=\d+&*/g, "$1")+(search.match(/\?/)?"&":"?")+"page=1")
		) {
			modal(meta.name+" "+meta.version+" (reload this page to abort)…", 2);
			loadForExtract(search);
		} else {
			alert("syntax error\nsearch: "+search+"\ncollid: "+collid+"\naction (should be either “put” or “delete”): "+action);
		}
	}
	function loadForExtract(page) {
		var p = parseInt(page.match(/page=(\d+)$/)[1], 10);
		var xhr = new XMLHttpRequest();
		loaders[xhr.getID()] = {maxRetry:5, url:page};
		xhr.addEventListener("load", function(e) {
			var res = document.createElement("html"); res.innerHTML = this.responseText;
			var releases = res.querySelectorAll("div.edit-details a[href*='/release/']");
			if (releases.length > 0) {
				var url = "/ws/2/collection/"+collid+"/releases/";
				for (var r=0; r < releases.length; r++) {
					url += (r==0?"":";")+releases[r].getAttribute("href").match(re_GUID);
				}
				requestForAction(action, url+"?client="+client);
			}
			var lp;
			if ((lp = res.querySelector("p.pageselector > a:last-of-type")) && (lp = lp.getAttribute("href").match(/page=(\d+)/))) {
				lp = parseInt(lp[1]);
			}
			if (p < lp) {
				loadForExtract(page.replace(/(page=)\d+$/, "$1"+(p+1)));
			} else {
				alert("Last page processed.");
				modal();
			}
		});
		xhr.addEventListener("error", function(e) {
			if (--loaders[this.getID()].maxRetry > 0) {
				modal("Retrying…");
				loadForExtract(loaders[this.getID()].url);
			} else {
				alert("XHR-"+this.getID()+" ERROR "+this.status+"\nStopped retrying.\n"+loaders[this.getID].url+"\n\n"+this.responseText);
			}
		});
		xhr.openDebug("get", page);
		modal("Loading page #"+p+"…");
		xhr.sendDebug(null);
	}
	function requestForAction(method, url) {
		//<?xml version="1.0" encoding="UTF-8"?><metadata xmlns="http://musicbrainz.org/ns/mmd-2.0#"><message><text>OK</text></message></metadata>
		var xhr = new XMLHttpRequest();
		loaders[xhr.getID()] = {method:method, url:url, maxRetry:5};
		xhr.addEventListener("load", function(e) {
			var node, res = this.responseXML.documentElement;
			if ((node = res.querySelector("message text")) && node.textContent.match(/ok/i)) {
				modal(loaders[this.getID()].method+" releases OK.", 2);
			} else {
				modal(loaders[this.getID()].method+" releases NG.\n\n"+this.responseText, 2);
			}
		});
		xhr.addEventListener("error", function(e) {
			if (--loaders[this.getID()].maxRetry > 0) {
				modal("Retrying…");
				loadForAction(loaders[this.getID()].method, loaders[this.getID()].url);
			} else {
				alert("XHR-"+this.getID()+" ERROR "+this.status+"\nStopped retrying.\n"+loaders[this.getID].url+"\n\n"+this.responseText);
			}
		});
		xhr.openDebug(method, url);
		xhr.overrideMimeType("text/xml");
		modal("Changing collection…");
		xhr.sendDebug(null);
	}
	/*======================================
	## hacked from COLLECTION HIGHLIGHTER ##
	======================================*/
	function modal(txt, brs) {
		var obj = document.getElementById(meta.key+"modal");
		if (txt && !obj) {
			coolstuff("div", "50", "100%", "100%", "black", ".6");
			obj = coolstuff("div", "55", "600px", "50%", "white");
			obj.setAttribute("id", meta.key+"modal");
			obj.style.padding = "4px";
			obj.style.overflow = "auto";
			obj.style.whiteSpace = "nowrap";
			obj.style.border = "4px solid black";
			obj.addEventListener("mouseover", function(e) { this.style.borderColor = "silver"; }, false);
			obj.addEventListener("mouseout", function(e) { this.style.borderColor = "black"; }, false);
		}
		if (txt && obj) {
			var br = 1;
			if (brs) { br = brs; }
			obj.appendChild(typeof txt=="string"?document.createTextNode(txt):txt);
			for (var ibr=0; ibr<br; ibr++) {
				obj.appendChild(document.createElement("br"));
			}
			if (obj.style.borderColor == "black") { obj.scrollTop = obj.scrollHeight; }
		}
		if (!txt && obj) {
			obj.parentNode.removeChild(obj.previousSibling);
			obj.parentNode.removeChild(obj);
		}
		return obj;
		function coolstuff(t,z,x,y,b,o,a) {
			var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
			truc.style.position = "fixed";
			truc.style.zIndex = z;
			truc.style.width = x;
			var xx = x.match(/^([0-9]+)(px|%)$/);
			if (xx) {
				truc.style.left = ((xx[2]=="%"?100:self.innerWidth)-xx[1])/2+xx[2];
			}
			truc.style.height = y;
			var yy = y.match(/^([0-9]+)(px|%)$/);
			if (yy) {
				truc.style.top = ((yy[2]=="%"?100:self.innerHeight)-yy[1])/2+yy[2];
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
	XMLHttpRequest.prototype.openDebug = function(method, url, async, user, password) {
		if (DEBUG) { console.log("XHR-"+this.getID()+" open "+method.toUpperCase()+" "+url+"\n"+async+", "+user+":"+password); }
		this.open(method, url, async, user, password);
	};
	XMLHttpRequest.prototype.sendDebug = function(params) {
		if (DEBUG) {
			console.log("XHR-"+this.getID()+" send("+params+")");
			var loaded = function(e) {
				console.log("XHR-"+this.getID()+" "+e.type+" "+this.status+"\n"+this.responseText);
			}
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