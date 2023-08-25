// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2023.8.25
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
// @include      https://bitbucket.org/*
// @include      https://github.com/*
// @include      https://gitlab.com/*
// @run-at       document-end
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
			files: ".js-details-container .js-navigation-item div:nth-child(2) a.js-navigation-open[title$='%fileType%']",
			icon: ".js-navigation-item div:nth-child(1) svg.octicon.octicon-file",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		iconParentLevel: 3,
	},
	"gitlab.com": {
		css: {
			files: "table.tree-table tbody td.tree-item-file-name a[href*='%fileType%']",
			icon: "span > svg.file-icon",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
	},
};
var installIcons = {};
host = host[location.host];
host.css.files = supportedFileTypes.map(function(fileType) { return host.css.files.replace(/%fileType%/g, fileType) + ":not(.j2installUserScript)"; }).join(", ");
setInterval(function() {
	host.files = document.querySelectorAll(host.css.files);
	for (var f = 0; f < host.files.length; f++) {
		host.files[f].classList.add("j2installUserScript");
		var icon = host.files[f];
		if (host.iconParentLevel) for (var p = 0; p < host.iconParentLevel; p++) {
			icon = icon.parentNode;
		}
		icon = icon.querySelector(host.css.icon);
		if (icon) {
			var install = document.createElement("a");
			install.appendChild(getInstallIcon(host.files[f].getAttribute("href").match(/(\.[^.]+){2}$/)[0]));
			install.className = icon.className;
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
		}
	}
}, 1000);
function getInstallIcon(fileExtension) {
	var iconURL =
		fileExtension == ".user.js"
			? GM_info.scriptHandler == "Violentmonkey"
				? "https://github.com/violentmonkey/violentmonkey/raw/8a319d0312004ef827efbf34c56e0f66602726cf/src/resources/icon.svg?sanitize=true"
				: GM_info.scriptHandler == "Tampermonkey"
					? "https://github.com/Tampermonkey/tampermonkey/raw/07f668cd1cabb2939220045839dec4d95d2db0c8/images/licon.png"
					: "https://github.com/greasemonkey/greasemonkey/raw/bdf1a51cc4ad2ad2482d11efb9e80d3439d66731/skin/icon.svg?sanitize=true"
			: fileExtension == ".user.css"
				? "https://github.com/openstyles/stylus/raw/c2e83fb3c4dc4d980e07c5ce92e9250af3eb5609/images/icon/16.png"
				: GM_info.script.icon;
	if (!installIcons[fileExtension]) {
		installIcons[fileExtension] = document.createElement("img");
		installIcons[fileExtension].setAttribute("src", iconURL);
		installIcons[fileExtension].setAttribute("width", 16);
		installIcons[fileExtension].setAttribute("height", 16);
	}
	return installIcons[fileExtension].cloneNode(false);
}
