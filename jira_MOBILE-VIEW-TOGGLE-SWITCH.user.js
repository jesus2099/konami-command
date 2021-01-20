// ==UserScript==
// @name         jira. MOBILE VIEW TOGGLE SWITCH
// @version      2021.1.20
// @description  Provides a convenient "Switch to mobile version" big header toggle link in all JIRA sites, in addition to the existing reverse "Switch to desktop version"
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @since        2019-11-03
// @grant        none
// @include      /^https?:\/\/[^/]+?\/(browse|plugins/servlet/mobile#issue)\/[A-Z][A-Z_0-9]+-[0-9]+/
// @run-at       document-end
// ==/UserScript==
"use strict";
var issuePattern = "[A-Z][A-Z_0-9]+-[0-9]+";
var issuePrefix = {
	desktop: "/browse/",
	mobile: "/plugins/servlet/mobile#issue/"
};
var rawIssueLinkPattern = new RegExp("^(?:(?:https?:)?//[^/]+)?" + issuePrefix.desktop + "(" + issuePattern + "\\b).*");
var isMobilePage = !(new RegExp("^" + issuePrefix.desktop)).test(location.pathname);
var isMobileDevice = navigator.userAgent.match(/\bmobile\b/i);
var issue;
if (
	!isMobilePage && (issue = location.pathname.match(new RegExp("^" + issuePrefix.desktop + "(" + issuePattern + ")")))
	|| isMobilePage && (issue = (location.pathname + location.hash).match(new RegExp("^" + issuePrefix.mobile + "(" + issuePattern + ")")))
) {
	issue = issue[1];
	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	document.head.appendChild(css);
	css = css.sheet;
	css.insertRule("a#switch-to-desktop-header, a#key-val + a[href^='" + issuePrefix.mobile + "'], a#switch-to-desktop-footer { background: #ff6; color: black !important; text-decoration: underline; }", 0);
	css.insertRule("a#switch-to-desktop-header { display: block; font-size: 4em; padding: 1em; text-align: center; }", 0);
	css.insertRule("a#switch-to-desktop-footer { font-size: 2em; }", 0);
	var issueLink;
	if ((issueLink = document.querySelector("a[href='" + issuePrefix.desktop + issue + "']")) !== null) {
		if (isMobileDevice) {
			// Big banner link on mobile device
			var mobileSwitch = document.createElement("a");
			mobileSwitch.setAttribute("id", "switch-to-desktop-header");
			mobileSwitch.appendChild(document.createTextNode("Switch to mobile version"));
			mobileSwitch.setAttribute("href", "/plugins/servlet/mobile#issue/" + issue)
			document.body.insertBefore(mobileSwitch, document.body.firstChild);
		} else {
			// Discrete link on desktop
			issueLink.parentNode.appendChild(document.createTextNode(" / "));
			issueLink.parentNode.appendChild(document.createElement("a")).appendChild(document.createTextNode("Switch to mobile version")).parentNode.setAttribute("href", issuePrefix.mobile + issue);
		}
	}
	if (isMobilePage) {
		document.addEventListener("mousedown", pressed);
		document.addEventListener("touchstart", pressed);
	}
}
function pressed(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = element.parentNode;
		}
		if (element && element.tagName == "A") {
			if (element.classList.contains("issue-link") && element.getAttribute("data-issue-key").match(new RegExp("^" + issuePattern + "$"))) {
				process(element);
			} else if (element.getAttribute("href").match(rawIssueLinkPattern)) {
				process(element, true);
			}
		}
	}
}
function process(anchor, rawLink) {
	var oldHref = anchor.getAttribute("href");
	var newHref;
	if (rawLink) {
		newHref = oldHref.replace(rawIssueLinkPattern, issuePrefix.mobile + "$1");
	} else {
		var issueKey = anchor.getAttribute("data-issue-key");
		if (oldHref && issueKey && oldHref.match(new RegExp(issuePrefix.desktop + issueKey + "$"))) {
			newHref = issuePrefix.mobile + issueKey;
		}
	}
	if (newHref && newHref != oldHref) {
		anchor.setAttribute("href", newHref);
		anchor.style.setProperty("background-color", "#cfc");
		anchor.style.setProperty("color", "#606");
		anchor.style.setProperty("text-decoration", "line-through");
		var tooltip = anchor.getAttribute("title") || "";
		if (tooltip) {
			tooltip += "\n";
		}
		anchor.setAttribute("title", tooltip + "old: " + oldHref + "\nnew: " + newHref);
	}
}
