// ==UserScript==
// @name         mb. INLINE TRACK ARTIST
// @version      2015.11.20
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_INLINE-TRACK-ARTIST.user.js
// @description  musicbrainz.org: highlights track title, length and artist differences in recording page
// @homepage     http://userscripts-mirror.org/scripts/show/166877
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_INLINE-TRACK-ARTIST
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_INLINE-TRACK-ARTIST.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_INLINE-TRACK-ARTIST.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @requester    culinko
// @since        2013-05-07
// @grant        none
// @include      http*://*musicbrainz.org/recording/*
// @include      http://*.mbsandbox.org/recording/*
// @exclude      *.org/recording/*/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var mbid = location.pathname.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
var tracks = document.querySelectorAll("div#content table.tbl > tbody > tr");
if (mbid && tracks.length > 0) {
	var artistth = getParent(tracks[0], "table").querySelectorAll("thead > tr > th");
	var accol = -1;
	var lecol = -1;
	var ticol = -1;
	for (var thi=0; thi<artistth.length && (ticol == -1 || accol == -1) ; thi++) {
		if (artistth[thi].textContent.match(/^title/i)) {
			ticol = thi+1;
		}
		if (artistth[thi].textContent.match(/length/i)) {
			lecol = thi+1;
		}
		if (artistth[thi].textContent.match(/release artist/i)) {
			artistth = artistth[thi];
			accol = thi+1;
		}
	}
	if (ticol + lecol + accol > 0) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e) {
			var res = this.responseXML.documentElement;
			var reclen = res.querySelector("recording-list > recording > length");
			reclen = time(reclen?reclen.textContent:0);
			var durspan = document.querySelector("div#sidebar dl.properties dd.length");
			if (durspan) { durspan.replaceChild(document.createTextNode(reclen), durspan.firstChild); }
			var wstracks = res.querySelectorAll("recording-list > recording > release-list > release > medium-list > medium > track-list > track");/*recording[id='"+mbid+"'] marche pas!?*/
			for (var wt=0; wt<wstracks.length; wt++) {
				var relid = getParent(wstracks[wt], "release");
				var discnum = wstracks[wt].parentNode.parentNode.querySelector("position");
				var tracknum = wstracks[wt].querySelector("number");
				if (
					relid && (relid = relid.getAttribute("id")) &&
					discnum && (discnum = discnum.textContent) &&
					tracknum && (tracknum = tracknum.textContent)
				) {
					for (var tt=0; tt<tracks.length; tt++) {
						if (tracks[tt].querySelector("a[href*='/release/']") && tracks[tt].querySelector("a[href*='/release/']").getAttribute("href").indexOf(relid) > 0 && tracks[tt].querySelector("td:first-of-type").textContent.trim() == discnum+"."+tracknum) {
							var titlespan = tracks[tt].querySelector("td:nth-child("+ticol+")");
							if (titlespan) {
								var tit = document.querySelector("h1 a");
								var wtit = wstracks[wt].querySelector("title");
								if (tit && wtit && tit.textContent != wtit.textContent) {
									titlespan.setAttribute("title", "≠ "+tit.textContent);
									titlespan.classList.add("name-variation");
									titlespan.style.setProperty("text-shadow", "1px 2px 2px #999");
									titlespan.style.setProperty("color", "maroon");
								}
							}
							var lenspan = tracks[tt].querySelector("td:nth-child("+lecol+")");
							if (lenspan) {
								var tlen = wstracks[wt].querySelector("length");
								if (tlen && (tlen = time(tlen.textContent))) {
									lenspan.replaceChild(document.createTextNode(tlen), lenspan.firstChild);
									if (tlen != reclen) {
										lenspan.setAttribute("title", "≠ "+reclen);
										lenspan.classList.add("name-variation");
										lenspan.style.setProperty("text-shadow", "1px 2px 2px #999");
										lenspan.style.setProperty("color", "maroon");
									}
								}
							}
							var ac = wstracks[wt].querySelectorAll("artist-credit > name-credit");
							if (ac.length > 0) {
								var acdiv = createTag("div", {"s":{"border":"4px solid gold","padding":"1px 2px","text-shadow":"1px 1px 2px #993"}});
								if (artistth != null) {
									artistth.insertBefore(acdiv.cloneNode(true), artistth.firstChild).appendChild(document.createTextNode("Track Artist"));
									artistth = null;
								}
								var artisttd = tracks[tt].querySelector("td:nth-child("+accol+")");
								if (artisttd) {
									var acdivc = artisttd.insertBefore(acdiv.cloneNode(true), artisttd.firstChild);
									for (var nc=0; nc<ac.length; nc++) {
										var arn = ac[nc].querySelector("artist");
										var ari, art;
										if (arn && (ari = arn.getAttribute("id")) && (art = arn.querySelector("name")) && (art = art.textContent) && (arn = ac[nc].querySelector("name")) && (arn = arn.textContent)) {
											var acpart = createTag("a", {"a":{"href":"/artist/"+ari}}, arn);
											if (art != arn) {
												acpart.setAttribute("title", art);
												acdivc.appendChild(createTag("span", {"a":{"class":"name-variation"}}, acpart));
											}
											else {
												acdivc.appendChild(acpart);
											}
										}
										var jp = ac[nc].getAttribute("joinphrase");
										if (jp) {
											acdivc.appendChild(document.createTextNode(jp));
										}
									}
								}
							}
							break;
						}
					}
				}
			}
		};
		xhr.onerror = function(e) {
			alert("mb. INLINE TRACK ARTIST ERROR MY GOD");
		};
		xhr.open("get", "/ws/2/recording?query=rid:"+mbid, true);
		/* xhr.open("get", "/ws/2/recording/"+mbid+"?inc=releases+artist-credits+mediums", true); */
		xhr.overrideMimeType("text/xml");
		xhr.send(null);
	}
}
function time(_ms) {
	var ms = typeof _ms=="string"?parseInt(_ms,10):_ms;
	if (ms > 0) {
		var d = new Date();
		d.setTime(parseInt(("" + ms).slice(-3), 10) < 500 ? ms : ms + 1000);
		return d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds()+(d.getMilliseconds()>0?"."+(d.getMilliseconds()<100?"0":"")+(d.getMilliseconds()<10?"0":"")+d.getMilliseconds():"");
	}
	return "?:??";
}
function createTag(tag, gadgets, children) {
	var t = document.createElement(tag);
	if(t.tagName) {
		if (gadgets) {
			for (var attri in gadgets.a) { if (gadgets.a.hasOwnProperty(attri)) { t.setAttribute(attri, gadgets.a[attri]); } }
			for (var style in gadgets.s) { if (gadgets.s.hasOwnProperty(style)) { t.style.setProperty(style.replace(/!/,""), gadgets.s[style], style.match(/!/)?"important":""); } }
			for (var event in gadgets.e) { if (gadgets.e.hasOwnProperty(event)) { t.addEventListener(event, gadgets.e[event], false); } }
		}
		if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
		if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child=0; child<chldrn.length; child++) { t.appendChild(typeof chldrn[child]=="string"?document.createTextNode(chldrn[child]):chldrn[child]); } t.normalize(); }
	}
	return t;
}
function getParent(obj, tag, cls) {
	var cur = obj;
	if (cur.parentNode) {
		cur = cur.parentNode;
		if (cur.tagName.toUpperCase() == tag.toUpperCase() && (!cls || cls && cur.classList.contains(cls))) {
			return cur;
		} else {
			return getParent(cur, tag, cls);
		}
	} else {
		return null;
	}
}
