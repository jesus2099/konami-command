// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2023.8.28
// @description  bitbucket.org, github.com, gitlab.com: Convenient direct “raw” download links (leftmost file icon) to “Install” user scripts and user styles from file lists. This will also allow user css/js auto‐update, even if the script author has not set @downloadURL and @updateURL.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/INSTALL-USER-SCRIPT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2014-11-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @match        *://bitbucket.org/*
// @match        *://github.com/*
// @match        *://gitlab.com/*
// @run-at       document-idle
// ==/UserScript==
"use strict";
var supportedFileTypes = [".user.js", ".uc.js", ".uc.xul", ".user.css"];
var host = {
	"bitbucket.org": {
		css: {
			files: "table tbody td a[href$='%fileType%']",
			icon: "svg[width='24'][height='24']",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/src\//, replace: "$1/raw/" },
	},
	"github.com": {
		css: {
			files: ".js-details-container div[role='row'].js-navigation-item > div:nth-child(2) a[title$='%fileType%'].js-navigation-open",
			icon: "div[role='row'].js-navigation-item > div:nth-child(1) > svg.octicon.octicon-file",
			disable_for_touch: "div[role='row'].js-navigation-item > a[style*='opacity:0'].position-absolute",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		common_parent_level: 3,
	},
	"gitlab.com": {
		css: {
			files: "table.tree-table tbody td.tree-item-file-name a[href*='%fileType%']",
			icon: "span > svg.file-icon",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
	},
};
var IS_TOUCH_SCREEN = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
host = host[location.host];
host.css.files = supportedFileTypes.map(function(fileType) { return host.css.files.replace(/%fileType%/g, fileType) + ":not(.j2installUserScript)"; }).join(", ");
setInterval(function() {
	host.files = document.querySelectorAll(host.css.files);
	for (var f = 0; f < host.files.length; f++) {
		host.files[f].classList.add("j2installUserScript");
		var parent = host.files[f];
		if (host.common_parent_level) for (var p = 0; p < host.common_parent_level; p++) {
			parent = parent.parentNode;
		}
		var icon = parent.querySelector(host.css.icon);
		if (icon) {
			var install = document.createElement("a");
			install.appendChild(getInstallIcon(host.files[f].getAttribute("href").match(new RegExp(supportedFileTypes.join("|").replace(/\./g, "\\.")))[0]));
			install.setAttribute("title", "Install “" + (host.files[f].getAttribute("title") || host.files[f].getAttribute("href")) + "”");
			var absolute_pathname = host.files[f].getAttribute("href");
			absolute_pathname = (absolute_pathname.match(/^\//) ? absolute_pathname : location.pathname + absolute_pathname).replace(host.href.match, host.href.replace);
			install.setAttribute("href", absolute_pathname);
			install.style.setProperty("color", "green");
			install.addEventListener("click", function(e) {
				e.cancelBubble = true;
				if (e.stopPropagation) {
					e.stopPropagation();
				}
				return false;
			});
			if (host.unnestIcon) {
				host.files[f].parentNode.insertBefore(install, host.files[f]);
				icon.parentNode.removeChild(icon);
			} else {
				icon.parentNode.replaceChild(install, icon);
			}
			if (IS_TOUCH_SCREEN && host.css.disable_for_touch) {
				parent.querySelector(host.css.disable_for_touch).style.setProperty("visibility", "hidden");
			}
		}
	}
}, 1000);
function getInstallIcon(fileExtension) {
	var icon = "💾";
	switch (fileExtension) {
		case ".user.js":
			icon = "🐵";
			break;
		case ".user.css":
			icon = "🧾";
			break;
	}
	return document.createTextNode(icon);
}
