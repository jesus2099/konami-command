// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2015.7.9.1213
// @description  bitbucket.org, github.com, gitlab.com: Convenient direct “raw” download links (leftmost file icon) to “Install” user scripts from file lists. This will also allow user script auto‐update in most greasemonkey engines, even if the script author has not set @downloadURL and @updateURL.
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12)                my own coding setup
// @compatible   opera(12)+violentmonkey  my own browsing setup
// @compatible   firefox+greasemonkey     quickly tested
// @compatible   chromium+tampermonkey    quickly tested
// @compatible   chrome+tampermonkey      tested with chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-11-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAOMMAAAAAP8A/wJR1MosEqGhBPyZUAD/APW1hQD///vPp///AP7++P///////////////yH5BAEKAA8ALAAAAAAQABAAAARbUMlJq0Ll6AN6z0liYNnWLV84FmUBLIsAAyqpuTEgA4VomzFUyMfaaDy9WhFw/PRoK6Zn2lFyqNio58DKSAEjQnczPtTEN+ww3AIMBrM1Qpxxud80VWDP7/sNEQA7
// @grant        none
// @include      https://bitbucket.org/*
// @include      https://github.com/*
// @include      https://gitlab.com/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var supportedFileTypes = [".user.js", ".uc.js", ".uc.xul"];
var host = {
	"bitbucket.org": {
		css: {
			files: "table#source-list tbody td.filename a[title$='%fileType%']",
			icon: "span.aui-icon.aui-icon-small.aui-iconfont-devtools-file",
			newIcon: "aui-icon aui-icon-small aui-iconfont-devtools-clone", /* https://docs.atlassian.com/aui/5.5.1/docs/icons.html */
		},
		href: { match: /^(\/[^/]+\/[^/]+)\/src\/[0-9a-f]{40}\/(.+)\?at=(.+)$/, replace: "$1/raw/$3/$2" },
		unnestIcon: true,
	},
	"github.com": {
		css: {
			files: "table.files tbody a.js-directory-link[title$='%fileType%']",
			icon: "td.icon span.octicon.octicon-file-text",
			newIcon: "octicon octicon-cloud-download", /* https://octicons.github.com */
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		iconParentLevel: 3,
	},
	"gitlab.com": {
		css: {
			files: "table.tree-table tbody td.tree-item-file-name a[href$='%fileType%']",
			icon: "i.fa.fa-file-o",
			newIcon: "fa fa-download", /* https://fortawesome.github.io/Font-Awesome/icons/ */
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		iconParentLevel: 2,
	},
};
host = host[location.host];
host.css.files = supportedFileTypes.map(function(fileType) { return host.css.files.replace(/%fileType%/g, fileType) + ":not(.j2installUserScript)"; }).join(", ");
jQuery(document).on("pjax:end", changeStuff); /* https://github.com/defunkt/jquery-pjax#events */
changeStuff();
function changeStuff() {
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
			install.className = host.css.newIcon?host.css.newIcon:icon.className;
			install.setAttribute("href", host.files[f].getAttribute("href").replace(host.href.match, host.href.replace));
			install.setAttribute("title", "Install “" + host.files[f].getAttribute("title") + "”");
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
}
