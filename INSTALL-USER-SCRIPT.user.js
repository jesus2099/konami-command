"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2018.1.24
// @changelog    https://github.com/jesus2099/konami-command/commits/master/INSTALL-USER-SCRIPT.user.js
// @description  bitbucket.org, github.com, gitlab.com: Convenient direct “raw” download links (leftmost file icon) to “Install” user scripts from file lists. This will also allow user script auto‐update in most greasemonkey engines, even if the script author has not set @downloadURL and @updateURL.
// @supportURL   https://github.com/jesus2099/konami-command/labels/INSTALL-USER-SCRIPT
// @compatible   opera(12.18.1872)+violentmonkey      my setup
// @compatible   vivaldi(1.0.435.46)+violentmonkey    my setup (ho.)
// @compatible   vivaldi(1.13.1008.32)+violentmonkey  my setup (of.)
// @compatible   firefox(47.0)+greasemonkey           tested sometimes
// @compatible   chrome+violentmonkey                 should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/INSTALL-USER-SCRIPT.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-11-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @include      https://bitbucket.org/*
// @include      https://github.com/*
// @include      https://gitlab.com/*
// @run-at       document-end
// ==/UserScript==
// ==OpenUserJS==
// @unstableMinify it might break metadata block parser
// ==/OpenUserJS==
}};
if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
	var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
	while ((kv = row.exec(meta.rawmdb)) !== null) {
		if (meta[kv[1]]) {
			if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
			meta[kv[1]].push(kv[2]);
		} else meta[kv[1]] = kv[2];
	}
}
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
			files: "table.files tbody td.content a.js-navigation-open[title$='%fileType%']",
			icon: "td.icon svg.octicon.octicon-file",
			/*//TODO: find why a.octicon.octicon-cloud-download does not show icon any more // newIcon: "octicon octicon-cloud-download", /* https://octicons.github.com */
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		iconParentLevel: 3,
		dumbMode: true,
	},
	"gitlab.com": {
		css: {
			files: "table.tree-table tbody td.tree-item-file-name a[href$='%fileType%']",
			icon: "i.fa[class*='fa-file-']",
			newIcon: "fa fa-download", /* https://fortawesome.github.io/Font-Awesome/icons/ */
		},
		href: { match: /(\/[^/]+\/[^/]+)\/blob\//, replace: "$1/raw/" },
		iconParentLevel: 2,
		dumbMode: true,
	},
};
var installImage;
host = host[self.location.host];
host.css.files = supportedFileTypes.map(function(fileType) { return host.css.files.replace(/%fileType%/g, fileType) + ":not(.j2installUserScript)"; }).join(", ");
if (host.dumbMode) {
	setInterval(changeStuff, 1000);
} else {
	jQuery(document).on("pjax:end", changeStuff); /* https://github.com/defunkt/jquery-pjax#events */
}
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
			if (host.css.newIcon) {
				install.className = host.css.newIcon;
			} else {
				if (!installImage) {
					installImage = document.createElement("img");
					installImage.setAttribute("src", meta.icon);
				}
				install.appendChild(installImage.cloneNode());
				install.className = icon.className;
			}
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
