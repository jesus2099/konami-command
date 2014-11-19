// ==UserScript==
// @name         github. INSTALL USER SCRIPT
// @version      2014.11.19.2250
// @description  github.com: Convenient direct “raw” download link (leftmost file icon) to “Install” user scripts from file lists
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/github_INSTALL-USER-SCRIPT.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/github_INSTALL-USER-SCRIPT.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-11-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://github.com/*/*
// @include      https://github.com/*/*
// @run-at       document-end
// ==/UserScript==
setInterval(function() {"use strict";
	var ujs = document.querySelectorAll("table.files tbody a.js-directory-link[title$='.user.js']:not(.j2gIUS), table.files tbody a.js-directory-link[title$='.uc.js']:not(.j2gIUS), table.files tbody a.js-directory-link[title$='.uc.xul']:not(.j2gIUS)");
	for (var i=0; i<ujs.length; i++) {
		ujs[i].className += " j2gIUS";
		var icon = ujs[i].parentNode.parentNode.parentNode.querySelector("td.icon span.octicon.octicon-file-text");
		if (icon) {
			var install = document.createElement("a");
			install.className = "octicon octicon-file-code"; // https://octicons.github.com
			install.setAttribute("href", ujs[i].getAttribute("href").replace(/(\/[^/]+\/[^/]+)\/blob\//, "$1/raw/"));
			install.setAttribute("title", "Install “"+ujs[i].getAttribute("title")+"”");
			install.style.setProperty("color", "green");
			install.addEventListener("click", function(e) {
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();
				return false;
			});
			icon.parentNode.replaceChild(install, icon);
		}
	}
}, 1000);