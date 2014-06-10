// ==UserScript==
// @name         mb. SPOT DUPLICATE RECORDINGS
// @version      2014.0221.1717
// @description  musicbrainz.org: Spot recordings that are linked multiple times to the same work
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_SPOT-DUPLICATE-RECORDINGS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @include      http://*musicbrainz.org/work/*
// @include      https://*musicbrainz.org/work/*
// @exclude      *musicbrainz.org/work/*/*
// @include      http://*musicbrainz.org/recording/*
// @include      https://*musicbrainz.org/recording/*
// @exclude      *musicbrainz.org/recording/*/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var userjs = "jesus2099userjs106145";
	for (var tables=document.querySelectorAll("div#content table.details > tbody"), it=0; it<tables.length; it++) {
		for (var alllinks=tables[it].getElementsByTagName("a"), parsedlinks=[], i=0; i < alllinks.length; i++) {
			var href = alllinks[i].getAttribute("href");
			var pn = alllinks[i].parentNode;
			if (pn.tagName.toLowerCase() == "span" && pn.className.indexOf("mp") >= 0) { pn = pn.parentNode; }
			if (href && href.match(/\/recording\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/) && pn.tagName.toLowerCase() != "h1" && pn.parentNode.className.indexOf("tabs") < 0 && pn.className.indexOf("pageselector") < 0) {
				if (parsedlinks[href]) { /*dupelink*/
					if (!parsedlinks[href]["dup"]) {
						parsedlinks[href]["obj"].parentNode.insertBefore(dupetxt(parsedlinks[href]["idx"]), parsedlinks[href]["obj"]);
						parsedlinks[href]["dup"] = true;
					}
					alllinks[i].parentNode.insertBefore(dupetxt(parsedlinks[href]["idx"]), alllinks[i]);
				}
				else { /*newlink*/
					parsedlinks[href] = { "obj": alllinks[i], "idx": it+"-"+i, "dup": false };
				}
			}
		}
	}
	function dupetxt(txt) {
		var cont = document.createElement("span");
		cont.appendChild(document.createTextNode("duplicate #"+txt));
		cont.setAttribute("class", userjs+txt);
		cont.style.setProperty("background-color", "yellow");
		cont.style.setProperty("color", "red");
		cont.style.setProperty("padding", "0 4px");
		cont.addEventListener("mouseover", dupehl, false);
		cont.addEventListener("mouseout", dupehl, false);
		return cont;
	}
	function dupehl(e) {
		for (var dupes = getParent(this, "tbody").getElementsByClassName(this.className), d=0; d<dupes.length; d++) {
			dupes[d].style.setProperty("background-color", e.type=="mouseover"?"red":"yellow");
			dupes[d].style.setProperty("color", e.type=="mouseover"?"yellow":"red");
		}
	}
	function getParent(obj, tag, cls) {
	        var cur = obj;
	        if (cur.parentNode) {
	                cur = cur.parentNode;
	                if (cur.tagName.toUpperCase() == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
	                        return cur;
	                } else {
	                        return getParent(cur, tag, cls);
	                }
	        } else {
	                return null;
	        }
	}
})();