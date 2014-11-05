// ==UserScript==
// @name         mb. FUNKEY ILLUSTRATED RECORDS
// @version      2014.11.5.1530
// @description  musicbrainz.org: CAA front cover art archive pictures/images (release groups and releases) Big illustrated discography and/or inline everywhere possible without cluttering the pages
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_FUNKEY-ILLUSTRATED-RECORDS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/cdtoc/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/search?*type=annotation*
// @include      http*://*musicbrainz.org/search?*type=release*
// @include      http*://*musicbrainz.org/tag/*
// @include      http*://*musicbrainz.org/user/*/ratings*
// @include      http*://*musicbrainz.org/user/*/tag/*
// @exclude      *://*musicbrainz.org/cdtoc/remove*
// @run-at       document-end
// ==/UserScript==
function chromehackuserjs154481f(){"use strict";
/*---CONFIG-START---*/
	var bigpics = true; /*displays big pics illustrated discography in main artist page*/
	var smallpics = "right"; /*false, "left" or "right" : displays small pics for every releases and release groups, everywhere*/
	var forceHTTP = true; /*as long as HTTP is being faster on CAA (less latency), you can force it for CAA images even if when you are using HTTPS for musicbrainz*/
	var colour = "yellow"; /*used for various mouse-over highlights*/
/*---CONFIG-STOPR---*/
	var userjs = "jesus2099userjs154481";
	var CAA_URL = (forceHTTP?"http:":"")+"//coverartarchive.org/%type%/%mbid%/front";
	var SMALL_SIZE = "19px";
	var BIG_SIZE = "125px";
	var types = ["release-group", "release"];
	var RE_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
	var imgurls = [];
	for (var t=0; t<types.length; t++) {
		var as = document.querySelectorAll("tr > td a[href*='musicbrainz.org/"+types[t]+"/'], div#page.fullwidth ul > li a[href*='musicbrainz.org/"+types[t]+"/']");
		var istable = false;
		for (var a=0; a<as.length; a++) {
			if (a == 0) {
				istable = getParent(as[0], "table");
				if (istable) { istable = document.evaluate(".//thead/tr/th[contains(./text(), 'Artist') or contains(./a/text(), 'Artist')]", istable, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength == 1; }
			}
			var imgurl = CAA_URL.replace(/%type%/, types[t]).replace(/%mbid%/,as[a].getAttribute("href").match(new RegExp(RE_GUID)));
			if (smallpics) {
				as[a].parentNode.insertBefore(
					createTag("div",{},{"float":smallpics=="left"?"left":"right","margin-right":".5em"},{},[document.createTextNode("\u231b"),
						createTag("a",{"href":imgurl},{"display":"none"},{},[
							createTag("img",
								{"alt":as[a].textContent,"title":"click to enlarge","src":imgurl+"-250","_s":"_"},
								{"cursor":"pointer","box-shadow":"1px 1px 4px black","margin":"none","padding":"none"},
								{
									"click":function(e){big(e,this,SMALL_SIZE);},
									"load":function(e){this.setAttribute("_height",this.height+"px");this.style.setProperty("height","0");del(this.parentNode.parentNode.firstChild);this.parentNode.style.setProperty("display","inline");big(e,this,SMALL_SIZE)},
									"error":function(e){del(this.parentNode.parentNode);},
									"mouseover":function(e){this.parentNode.parentNode.nextSibling.style.setProperty("background-color",colour);},
									"mouseout":function(e){this.parentNode.parentNode.nextSibling.style.removeProperty("background-color");}
								}
							)
						])
					])
				, as[a]);
			}
			var tr = getParent(as[a], "tr") || getParent(as[a], "li");
			tr.addEventListener("mouseover", updateBig, false);
			tr.addEventListener("mouseout", updateBig, false);
			var box = getParent(as[a], "table") || getParent(as[a], "ul");
			if (bigpics && imgurls.indexOf(imgurl) < 0 && (box = box.previousSibling.tagName == "DIV" && box.previousSibling.className == userjs+"bigbox"?box.previousSibling:box.parentNode.insertBefore(createTag("div",{"class":userjs+"bigbox"}),box))) {
				var artisttd = istable && getSibling(getParent(as[a],"td"),"td");
				box.appendChild(createTag("a",{"href":as[a].getAttribute("href"),"title":as[a].textContent+(artisttd?"\r\n"+artisttd.textContent.trim():"")},{"display":"inline-block","height":"100%","margin":"8px 8px 4px 4px"},{},[
					document.createTextNode("\u231b"),
					createTag("img",
						{"src":imgurl+"-250","alt":as[a].textContent},
						{"vertical-align":"middle","display":"none","max-height":"20px","max-width":"20px","box-shadow":"1px 1px 4px black"},
						{
							"load":function(e){del(this.parentNode.firstChild);this.style.setProperty("display","inline");jQuery(this).animate({"max-height":BIG_SIZE,"max-width":BIG_SIZE},"fast");},
							"error":function(e){del(this.parentNode);},
							"mouseover":updateA,
							"mouseout":updateA
						}
					)
				]));
			}
			imgurls.push(imgurl);
		}
	}
	function updateA(e) {
		var ah = this.parentNode.getAttribute("href");
		var rels = document.querySelectorAll("tr > td a[href='"+ah+"'], div#page.fullwidth ul > li a[href='"+ah+"']");
		for (var r=0; r<rels.length; r++) {
			if (e.type == "mouseover") { rels[r].style.setProperty("background-color",colour); }
			else { rels[r].style.removeProperty("background-color"); }
		}
	}
	function updateBig(e) {
		var img = this.querySelector("img[_height]");
		if (img) {
			img = document.querySelector("div."+userjs+"bigbox > a > img[src='"+img.getAttribute("src")+"']");
			if (img) {
				if (e.type == "mouseover") {
					var s = (parseInt(BIG_SIZE, 10) - 8) + "px";
					img.parentNode.style.setProperty("border", "4px solid "+colour);
					img.style.setProperty("max-height", s);
					img.style.setProperty("max-width", s);
				}
				else {
					img.parentNode.style.removeProperty("border");
					img.style.setProperty("max-height", BIG_SIZE);
					img.style.setProperty("max-width", BIG_SIZE);
				}
			}
		}
	}
	function big(e, o, s) {
		if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
			var click = o.getAttribute("title"); click = click && click.match(/^click to (enlarge|shrink)$/);
			var b = (o.getAttribute("_s")=="t");
			jQuery(o).animate({"height": b?(o.getAttribute("_height")||"250px"):s}, "fast");
			if (click) {
				o.setAttribute("_s", b?"o":"t");
				o.setAttribute("title", o.getAttribute("title").replace(/\w+$/, b?"shrink":"enlarge"));
				e.preventDefault();
			}
		}
	}
	function del(o) {
		return o.parentNode.removeChild(o);
	}
	function createTag(tag, attribs, styles, events, children) {
		var t = document.createElement(tag);
		if(t.tagName) {
			for (var attr in attribs) { if (attribs.hasOwnProperty(attr)) { t.setAttribute(attr, attribs[attr]); } }
			for (var styl in styles) { if (styles.hasOwnProperty(styl)) { t.style.setProperty(styl.replace(/!/,""), styles[styl], styl.match(/!/)?"important":""); } }
			for (var evt in events) { if (events.hasOwnProperty(evt)) { t.addEventListener(evt, events[evt], false); } }
			if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child=0; child<chldrn.length; child++) { t.appendChild(typeof chldrn[child]=="string"?document.createTextNode(chldrn[child]):chldrn[child]); } }
		}
		return t;
	}
	function getParent(obj, tag, cls) {
		var cur = obj;
		if (cur.parentNode) {
			cur = cur.parentNode;
			if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
				return cur;
			} else {
				return getParent(cur, tag, cls);
			}
		} else {
			return null;
		}
	}
	function getSibling(obj, tag, cls, prev) {
		var cur = obj;
		if (cur = prev?cur.previousSibling:cur.nextSibling) {
			if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
				return cur;
			} else {
				return getSibling(cur, tag, cls, prev);
			}
		} else {
			return null;
		}
	}
}
var chromehackuserjs154481s = document.createElement("script");
chromehackuserjs154481s.appendChild(document.createTextNode("("+chromehackuserjs154481f+")();"));
document.body.appendChild(chromehackuserjs154481s);