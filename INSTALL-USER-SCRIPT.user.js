// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2023.12.5
// @description  bitbucket.org, github.com, gitlab.com: Install links for userscripts and userstyles
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/INSTALL-USER-SCRIPT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2014-11-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/0cc6cdbba2933c0eadc75632e8abac44c34b2188/lib/SUPER.js?version=2023.3.23
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
			files: ".js-details-container div[role='row'].js-navigation-item > div:nth-child(2) a[title$='%fileType%'].js-navigation-open, "
				+ "table[aria-labelledby='folders-and-files'] > tbody > tr > td > div.react-directory-filename-column a[href$='%fileType%'].Link--primary",
			icon: "svg.octicon.octicon-file, "
				+ "div.react-directory-filename-column > svg",
			icon_parent: ".js-details-container div[role='row'].js-navigation-item, "
				+ "table[aria-labelledby='folders-and-files'] > tbody > tr > td",
			disable_for_touch: "div[role='row'].js-navigation-item > a[style*='opacity:0'].position-absolute",
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
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
	var file_path, file_extension;
	// file list
	host.files = document.querySelectorAll(host.css.files);
	for (var f = 0; f < host.files.length; f++) {
		host.files[f].classList.add("j2installUserScript");
		var parent = host.files[f];
		if (host.css.icon_parent) {
			parent = parent.closest(host.css.icon_parent);
		}
		var icon = parent.querySelector(host.css.icon);
		if (icon) {
			file_path = host.files[f].getAttribute("href");
			var install_link = get_basic_install_link(file_path, get_file_supported_extension(file_path));
			install_link.setAttribute("title", "Install “" + (host.files[f].getAttribute("title") || file_path) + "”");
			// Bitbucket and GitLab
			install_link.addEventListener("click", function(event) { event.cancelBubble = true; });
			icon.parentNode.replaceChild(install_link, icon);
			if (IS_TOUCH_SCREEN && host.css.disable_for_touch) {
				// GitHub
				var disable_for_touch = parent.querySelector(host.css.disable_for_touch);
				if (disable_for_touch) {
					disable_for_touch.style.setProperty("visibility", "hidden");
				} else {
					console.log("disable_for_touch not needed");
				}
			}
		}
	}
	// file view
	// TODO: GitHub only: Add support for Bitbucket and GitLab
	var file_view_buttons = document.querySelector("react-app[app-name='react-code-view'][initial-path] main ul[aria-label='File view']");
	if (file_view_buttons) {
		var existing_button = file_view_buttons.parentNode.querySelector("a.j2installLink");
		file_path = location.pathname;
		file_extension = get_file_supported_extension(file_path);
		if (file_extension) {
			if (!existing_button || get_install_path(file_path) !== existing_button.getAttribute("href")) {
				var install_button = get_basic_install_link(file_path, file_extension);
				install_button.appendChild(document.createTextNode("\u00a0Install"));
				install_button.classList.add("btn");
				install_button.style.setProperty("background-color", "#fcf");
				if (existing_button) {
					existing_button.parentNode.replaceChild(install_button, existing_button);
				} else {
					addAfter(install_button, file_view_buttons);
				}
			}
		} else if (existing_button) {
			existing_button.parentNode.removeChild(existing_button);
		}
	}
}, 1000);
function get_install_icon(file_extension) {
	var icon = "";
	switch (file_extension) {
		case ".user.js":
			icon = "🐵";
			break;
		case ".user.css":
			icon = "🧾";
			break;
		default:
			icon = "💾";
	}
	return icon;
}
function get_install_path(file_path) {
	return (file_path.match(/^\//) ? file_path : location.pathname + file_path).replace(host.href.match, host.href.replace);
}
function get_file_supported_extension(file_path) {
	var file_extention = file_path.match(new RegExp(supportedFileTypes.join("|").replace(/\./g, "\\.")));
	if (file_extention) {
		return file_extention[0];
	} else {
		return "";
	}
}
function get_basic_install_link(file_path, file_extension) {
	var basic_install_link = createTag("a", {a: {href: get_install_path(file_path), class: "j2installLink"}}, get_install_icon(file_extension));
	if (file_extension == ".user.css") {
		basic_install_link.setAttribute("target", "_blank");
	}
	return basic_install_link;
}
