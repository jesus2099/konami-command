// ==UserScript==
// @name         lastfm. COMPARE LIBRARY
// @version      2015.1.7.1234
// @description  last.fm: Basic side by side comparison of any library page with ours.
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_COMPARE-LIBRARY.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/lastfm_COMPARE-LIBRARY.user.js
// @author       PATATE12
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
var menus = page.querySelector("div.masthead-wrapper");
var libtitle = document.querySelector("div#page div#content > header h1");
var user = page.querySelector("nav div.masthead-right a[href^='/user/'].user-badge");
if (page && user && menus) {
	var thisFrame = parent && parent.document.querySelector("iframe.j2lfm-cl");
	if (self != top && location.pathname.indexOf(user.getAttribute("href")) == 0 && thisFrame) {
		//FIGHTING *googleadservices.com/* !!!
		parent.document.querySelector("html").style.removeProperty("display");
		//compare library iframe page (our library)
		page.style.setProperty("width", "100%");
		page.style.setProperty("margin", "0");
		page.style.setProperty("padding", "0");
		page.querySelector("div#content").style.setProperty("padding", "0");
		menus.style.setProperty("visibility", "hidden");
		document.body.style.setProperty("padding", "0");
		document.body.style.setProperty("margin", "0");
		document.body.style.setProperty("border-left", "2px solid black");
		var hideStuff = document.querySelectorAll("div#page ~ *, div[id^='LastAd_'], iframe");
		for (var s = 0; s < hideStuff.length; s++) {
			hideStuff[s].style.setProperty("display", "none");
		}
		var fixTargets = document.querySelectorAll("a[href]");
		for (var a = 0; a < fixTargets.length; a++) {
			fixTargets[a].setAttribute("target", "_PARENT");
		}
		self.addEventListener("resize", function() {
			//align both track lists
			var libraryPadding = [{root:page}, {root:parent.document.querySelector("div#page")}];
			var headerTypes = ["Top", "Albums"];
			for (var t = 0; t < headerTypes.length; t++) {
				var max = 0;
				for (var i = 0; i < libraryPadding.length; i++) {
					libraryPadding[i][headerTypes[t]] = {"node": libraryPadding[i].root.querySelector("div#library"+headerTypes[t])};
					if (libraryPadding[i][headerTypes[t]].node) {
						libraryPadding[i][headerTypes[t]].node.style.removeProperty("min-height");
						libraryPadding[i][headerTypes[t]].height = parseInt(getComputedStyle(libraryPadding[i][headerTypes[t]].node).getPropertyValue("height"), 10);
					}
					if (libraryPadding[i][headerTypes[t]].height > libraryPadding[max][headerTypes[t]].height) max = i;
				}
				if (libraryPadding[0][headerTypes[t]].height && libraryPadding[1][headerTypes[t]].height) {
					libraryPadding[max?0:1][headerTypes[t]].node.style.setProperty("min-height", libraryPadding[max?1:0][headerTypes[t]].height+"px");
				}
			}
			thisFrame.style.setProperty("min-height", Math.max(parseInt(getComputedStyle(document.body).getPropertyValue("height"), 10)+27, parseInt(getComputedStyle(libraryPadding[1].root).getPropertyValue("height"), 10))+"px");
		});
		sendEvent(self, "resize");
	} else if (libtitle && user && location.pathname.indexOf(user.getAttribute("href")) == -1) {
		//library page (except ours)
		var comparelib = document.createElement("a");
		comparelib.style.setProperty("cursor", "pointer");
		comparelib.setAttribute("title", location.protocol+"//"+location.host+location.pathname.replace(/^(\/user\/)([^/]+)/, "$1"+user.textContent.trim())+location.search+location.hash);
		comparelib.appendChild(document.createTextNode("compare with mine"));
		comparelib.addEventListener("mousedown", stop);
		comparelib.addEventListener("click", function(e) {
			this.parentNode.removeChild(this.previousSibling);
			this.parentNode.removeChild(this.nextSibling);
			this.parentNode.removeChild(this);
			var hideStuff = document.querySelectorAll("div[id^='LastAd_'], iframe");
			for (var s = 0; s < hideStuff.length; s++) {
				hideStuff[s].style.setProperty("display", "none");
			}
			page.style.setProperty("display", "inline-block");
			page.style.setProperty("width", "50%");
			menus.style.setProperty("width", "200%");
			page.style.setProperty("margin", "0");
			page.style.setProperty("padding", "0");
			page.querySelector("div#content").style.setProperty("padding", "0");
			var frm = document.body.insertBefore(document.createElement("iframe"), page.nextSibling);
			frm.className = "j2lfm-cl";
			frm.setAttribute("scrolling", "no");
			frm.style.setProperty("display", "inline-block");
			frm.style.setProperty("width", "50%");
			frm.style.setProperty("margin", "0");
			frm.style.setProperty("border", "0");
			frm.style.setProperty("padding", "0");
			frm.style.setProperty("min-height", getComputedStyle(page).getPropertyValue("height"));
			frm.setAttribute("src", this.getAttribute("title"));
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