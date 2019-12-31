// ==UserScript==
// @name         jira. MOBILE VIEW TOGGLE SWITCH
// @version      2019.12.31
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
var isMobilePage = !(new RegExp("^" + issuePrefix.desktop)).test(location.pathname);
var isMobileDevice = self.matchMedia("only screen and (max-width: 480px)").matches;
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
	css.insertRule("a#switch-to-desktop-header, a#switch-to-desktop-footer { font-size: 4em; }", 0);
	css.insertRule("a#switch-to-desktop-header { display: block; padding: 1em; text-align: center; }", 0);
	var issueLink;
	if (issueLink = document.querySelector("a[href='" + issuePrefix.desktop + issue + "']")) {
		if (isMobileDevice) {
			var mobileSwitch = document.createElement("a");
			mobileSwitch.setAttribute("id", "switch-to-desktop-header");
			mobileSwitch.appendChild(document.createTextNode("Switch to mobile version"));
			mobileSwitch.setAttribute("href", "/plugins/servlet/mobile#issue/" + issue)
			document.body.insertBefore(mobileSwitch, document.body.firstChild);
		} else {
			issueLink.parentNode.appendChild(document.createTextNode(" / "));
			issueLink.parentNode.appendChild(document.createElement("a")).appendChild(document.createTextNode("Switch to mobile version")).parentNode.setAttribute("href", issuePrefix.mobile + issue);
		}
	}
}
