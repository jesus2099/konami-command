(function(){"use strict";var meta={rawmdb:function(){
// ==UserScript==
// @name         mb. HYPER MOULINETTE
// @version      2014.10.10.1909
// @description  musicbrainz.org: browses pages of MB content to perform some actions on spotted entities
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
	meta.key = "jesus2099"+meta.name.replace(/^mb\. /, "").replace(/ /, "-");
	var MBS = self.location.protocol+"//"+self.location.host;
	var stre_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var re_GUID = new RegExp(stre_GUID);
	var account = document.querySelector("div#header-menu li.account");
	var target, action, source, client, loaders = [];
	var crawlType = {
		"^/collection/": "div#content table.tbl a[href*='/release/']",
		"^/search/edits": "div.edit-details a[href*='/release/']",
	};
	var genuineTitle = document.title;
	if (!self.opera && account) {
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
		this.parentNode.parentNode.style.removeProperty("left");
		target = prompt("This allows to batch PUT/DELETE releases from an edit search into a collection.\n\nPlease paste the “TARGET” collection URL or MBID.\nThis is the collection that will be modified (either add or remove releases).", localStorage.getItem(meta.key+"target")||"");
		action = prompt("Please tell if you want to PUT or DELETE releases in this collection.", localStorage.getItem(meta.key+"method")||"put");
		source = prompt("Please paste your “SOURCE” (release edit search, another collection) URL here.\nIt will parse these pages to modify the previously mentionned collection.", localStorage.getItem(meta.key+"source")||"");
		client = meta.name.replace(/^mb\. /, "").replace(/ /g, ".").toLowerCase()+"-"+meta.version;
		if (
			target && (target = target.match(re_GUID)) &&
			action && (action.match(/^(put|delete)$/i)) &&
			source
		) {
			localStorage.setItem(meta.key+"target", target);
			localStorage.setItem(meta.key+"method", action);
			localStorage.setItem(meta.key+"source", source);
			source = source.replace(/^(https?:\/\/[^\/]+)?(\/.+)/, "$2");
			modal(createTag("fragment", {}, [createTag("a", {a:{href:meta.namespace, target:"_blank"}}, meta.name), " ", createTag("b", {}, meta.version), " (reload this page to abort)"]), 2);
			loadForExtract(source.replace(/([\?&])page=\d+&*/g, "$1")+(source.match(/\?/)?"&":"?")+"page=1");
		} else {
			alert("syntax error\ntarget: "+target+"\naction: "+action+" (should be either “put” or “delete”)\nsource: "+source);
		}
	}
	function loadForExtract(page) {
		var xhr = new XMLHttpRequest();
		loaders[xhr.getID()] = {maxRetry:5, url:page};
		xhr.addEventListener("load", function(e) {
			var p = parseInt(loaders[this.getID()].url.match(/page=(\d+)$/)[1], 10);
			modal(createTag("fragment", {}, [createTag("a", {a:{href:loaders[this.getID()].url, target:"_blank"}}, "Page "+p), " loaded."]));
			document.title = "Page "+p+" loaded (HYPER MOULINETTE) "+genuineTitle;
			var res = document.createElement("html"); res.innerHTML = this.responseText;
			var releases;
			for (var type in crawlType) if (crawlType.hasOwnProperty(type) && loaders[this.getID()].url.match(new RegExp(type))) {
				releases = res.querySelectorAll(crawlType[type]);/*crawlTypes*/
				if (releases.length > 0) {
					var url = "/ws/2/collection/"+target+"/releases/";
					for (var r=0; r < releases.length; r++) {
						url += (r==0?"":";")+releases[r].getAttribute("href").match(re_GUID);
					}
					requestForAction(action, url+"?client="+client);
				}
				break;
			}
			var lp;
			if ((lp = res.querySelector("p.pageselector > a:last-of-type")) && (lp = lp.getAttribute("href").match(/page=(\d+)/))) {
				lp = parseInt(lp[1]);
			}
			if (p < lp) {
				loadForExtract(page.replace(/(page=)\d+$/, "$1"+(p+1)));
			} else {
				document.title = genuineTitle;
				alert("Last page processed.");
				modal();
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
		var xhr = new XMLHttpRequest();
		loaders[xhr.getID()] = {method:method, url:url, maxRetry:5};
		xhr.addEventListener("load", function(e) {
			var node, res = this.responseXML.documentElement;
			var msg = createTag("fragment", {}, ["Releases “", createTag("a", {a:{title:loaders[this.getID()].method, href:loaders[this.getID()].url, target:"_blank"}}, loaders[this.getID()].method), "” on collection "]);
			if ((node = res.querySelector("message text")) && node.textContent.match(/ok/i)) {
				modal(createTag("fragment", {}, [msg, "OK."]));
			} else {
				modal(createTag("fragment", {}, [msg, "failed.\n\n"+res.textContent]));
			}
		});
		xhr.addEventListener("error", function(e) {
			if (--loaders[this.getID()].maxRetry > 0) {
				modal(createTag("fragment", {}, ["Error performing ", createTag("a", {a:{title:loaders[this.getID()].method, href:loaders[this.getID()].url, target:"_blank"}}, "“"+loaders[this.getID()].method+"” action"), ", retrying…"]));
				loadForAction(loaders[this.getID()].method, loaders[this.getID()].url);
			} else {
				alert("XHR-"+this.getID()+" ERROR "+this.status+"\nStopped retrying.\n"+loaders[this.getID].url+"\n\n"+this.responseText);
			}
		});
		xhr.openDebug(method, url);
		xhr.overrideMimeType("text/xml");
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
	XMLHttpRequest.prototype.openDebug = function(method, url) {
		if (DEBUG) { console.log("XHR-"+this.getID()+" open "+method.toUpperCase()+" "+url); }
		this.open(method, url);
	};
	XMLHttpRequest.prototype.sendDebug = function(params) {
		if (DEBUG) {
			console.log("XHR-"+this.getID()+" send("+params+")");
			var loaded = function(e) {
				console.log("XHR-"+this.getID()+" "+e.type+" "+this.status);
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