// ==UserScript==
// @name         lastfm. COMPARE LIBRARIES
// @version      2015.1.6.1545
// @description  last.fm. Compare others’ library with yours.
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_COMPARE-LIBRARIES.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_COMPARE-LIBRARIES.user.js
// @author       Tristan “PATATE12” Daniel
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2015-01-06
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://*.last.fm/user/*/library*
// @include      http://www.lastfm.*/user/*/library*
// @exclude      *//*/last.fm/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var page = document.querySelector("div#page");
var libtitle = document.querySelector("div#page div#content > header h1");
var user = document.querySelector("div#page nav div.masthead-right a[href^='/user/'].user-badge");
if (page && user) {
	if (self != top && location.pathname.indexOf(user.getAttribute("href")) == 0 && parent && parent.document.querySelector("iframe[src='"+decodeURIComponent(location.href)+"'].j2lfm-cl")) {
		//compare library iframe page (our library)
		page.style.setProperty("width", "100%");
		page.style.setProperty("margin", "0");
		page.style.setProperty("padding", "0");
		var hideStuff = document.querySelectorAll("div#page ~ *, iframe");
		for (var s = 0; s < hideStuff.length; s++) {
			hideStuff[s].style.setProperty("display", "none");
		}
		var fixTargets = document.querySelectorAll("a[href]");
		for (var a = 0; a < fixTargets.length; a++) {
			fixTargets[a].setAttribute("target", "_PARENT");
		}
		self.addEventListener("resize", function() {
			//align both track lists
			var albums = [{node:document.querySelector("div#libraryAlbums")}, {node:parent.document.querySelector("div#libraryAlbums")}];
			var max = 0;
			for (var a = 0; a < albums.length; a++) {
				albums[a].height = parseInt(getComputedStyle(albums[a].node).getPropertyValue("height"), 10);
				if (albums[a].height > albums[max].height) max = a;
			}
			albums[max?0:1].node.style.setProperty("min-height", albums[max?1:0].height+"px");
		});
		sendEvent(self, "resize");
	} else if (libtitle && user && location.pathname.indexOf(user.getAttribute("href")) == -1) {
		//library page (except ours)
		var comparelib = document.createElement("a");
		comparelib.style.setProperty("cursor", "pointer");
		comparelib.setAttribute("title", location.pathname.replace(/^(\/user\/)([^/]+)/, "$1"+user.textContent.trim()));
		comparelib.appendChild(document.createTextNode("compare"));
		comparelib.addEventListener("mousedown", stop);
		comparelib.addEventListener("click", function(e) {
			this.parentNode.removeChild(this.previousSibling);
			this.parentNode.removeChild(this.nextSibling);
			this.parentNode.removeChild(this);
			var hideStuff = document.querySelectorAll("iframe");
			for (var s = 0; s < hideStuff.length; s++) {
				hideStuff[s].style.setProperty("display", "none");
			}
			page.style.setProperty("display", "inline-block");
			page.style.setProperty("width", "50%");
			page.style.setProperty("margin", "0");
			page.style.setProperty("padding", "0");
			var frm = document.body.insertBefore(document.createElement("iframe"), page.nextSibling);
			frm.className = "j2lfm-cl";
			frm.appendChild(document.createTextNode("PLEASE WAIT"));
			frm.style.setProperty("display", "inline-block");
			frm.style.setProperty("width", "50%");
			frm.style.setProperty("margin", "0");
			frm.style.setProperty("border", "0");
			frm.style.setProperty("padding", "0");
			frm.setAttribute("src", location.protocol+"//"+location.host+this.getAttribute("title"));
			self.addEventListener("resize", function() {
				frm.style.setProperty("height", getComputedStyle(page).getPropertyValue("height"));
			});
			sendEvent(self, "resize");
		});
		libtitle.appendChild(document.createTextNode(" ("));
		libtitle.appendChild(comparelib);
		libtitle.appendChild(document.createTextNode(")"));
	}
}
function stop(e) {
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	e.preventDefault();
	return false;
}
function sendEvent(n, e){
	var ev = document.createEvent("HTMLEvents");
	ev.initEvent(e, true, true);
	n.dispatchEvent(ev);
}