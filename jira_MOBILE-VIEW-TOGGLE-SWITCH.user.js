// ==UserScript==
// @name         jira. MOBILE VIEW TOGGLE SWITCH
// @version      2019.11.3.1855
// @description  JIRA. Provides a convenient "Switch to mobile version" big header toggle link as JIRA now only provides the opposite "Switch to desktop version"
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @since        2019-11-03
// @grant        none
// @run-at       document-end
// ==/UserScript==
// First rough version
"use strict";
if (document.head.querySelector("meta[name='application-name'][content='JIRA']")) {
	var ticket = location.pathname.match(/\/browse\/([A-Z][A-Z_0-9]+-[0-9]+)\b/);
	if (ticket) {
		var mobilePageBanner = document.createElement("h1");
		mobilePageBanner.style.setProperty("font-size", "4em");
		mobilePageBanner.style.setProperty("padding", "1em");
		mobilePageBanner.style.setProperty("text-align", "center");
		mobilePageBanner.appendChild(document.createElement("a")).appendChild(document.createTextNode("Switch to mobile version")).parentNode.setAttribute("href", "/plugins/servlet/mobile#issue/" + ticket[1]);
		document.body.insertBefore(mobilePageBanner, document.body.firstChild);
	}
}
