"use strict";
var meta = {rawmdb: function() {
// ==UserScript==
// @name         INSTALL USER SCRIPT
// @version      2019.9.13
// @description  bitbucket.org, github.com, gitlab.com: Convenient direct “raw” download links (leftmost file icon) to “Install” user scripts and user styles from file lists. This will also allow user css/js auto‐update, even if the script author has not set @downloadURL and @updateURL.
// @compatible   vivaldi(2.6.1566.49)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(68.0.1)+violentmonkey       tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
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
// @inject-into  auto
// "inject-into  auto" is specific to Firefox + Violentmonkey + GitHub https://github.com/violentmonkey/violentmonkey/issues/597
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
var supportedFileTypes = [".user.js", ".uc.js", ".uc.xul", ".user.css"];
var host = {
	"bitbucket.org": {
		css: {
			files: "table tbody td a[href*='%fileType%']",
			icon: "svg[width='24'][height='24']",
			newIcon: "aui-icon aui-icon-small aui-iconfont-devtools-clone", /* https://docs.atlassian.com/aui/5.5.1/docs/icons.html */
		},
		href: { match: /(\/[^/]+\/[^/]+)\/src\//, replace: "$1/raw/" },
		unnestIcon: true,
		dumbMode: true,
	},
	"github.com": {
		css: {
			files: ".js-details-container .js-navigation-item div:nth-child(2) a.js-navigation-open[title$='%fileType%']",
      icon: ".js-navigation-item div:nth-child(1) svg.octicon.octicon-file",
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
var installIcons = {};
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
				install.appendChild(getInstallIcon(host.files[f].getAttribute("href").match(/(\.[^.]+){2}$/)[0]));
				install.className = icon.className;
			}
			install.setAttribute("title", "Install “" + (host.files[f].getAttribute("title") || host.files[f].getAttribute("href")) + "”");
			install.setAttribute("href", host.files[f].getAttribute("href").replace(host.href.match, host.href.replace));
			if (install.getAttribute("href").match(/%from-pathname%/) && host.hrefFromPathname) {
				install.setAttribute("href", install.getAttribute("href").replace(/%from-pathname%/, self.location.pathname.match(host.hrefFromPathname)[1]));
			}
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
function getInstallIcon(fileExtension) {
	var iconURL = fileExtension == ".user.js" ? "https://github.com/violentmonkey/violentmonkey/raw/1d911bffd7d4c37f82b5bcdada16f0b79fe0a70a/src/public/images/icon16.png" : fileExtension == ".user.css" ? "https://github.com/openstyles/stylus/raw/c2e83fb3c4dc4d980e07c5ce92e9250af3eb5609/images/icon/16.png" : meta.icon;
	if (!installIcons[fileExtension]) {
		installIcons[fileExtension] = document.createElement("img");
		installIcons[fileExtension].setAttribute("src", iconURL);
	}
	return installIcons[fileExtension].cloneNode(false);
}
