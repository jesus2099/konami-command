// ==UserScript==
// @name         gh. NEW SUB-ISSUE
// @version      2021.5.20
// @description  github.com: A yellow button to create a sub-issue that links to its parent. You still have to manually create the sub-issue list in the parent issue.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/gh_NEW-SUB-ISSUE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/gh_NEW-SUB-ISSUE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2020-11-07
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @grant        none
// @include      /^https?:\/\/github\.com\//
// @run-at       document-end
// ==/UserScript==
"use strict";
setInterval(function() {
	if (self.location.pathname.match(/^\/[^/]+\/[^/]+\/(issues|pull)\/\d+\b/)) {
		var repo = self.location.pathname.match(/^\/[^/]+\/[^/]+/)[0];
		var issueId = self.location.pathname.match(/\/(issues|pull)\/(\d+)\b/)[2];
		var issueTitle = document.querySelector(".js-issue-title").textContent.trim();
		var issueEditButton = document.querySelector(".gh-header-actions button[aria-label^='Edit '][aria-label$=' title']");
		var subIssue = document.querySelector(".new-sub-issue-link-j2");
		if (issueEditButton && !subIssue) {
			subIssue = document.createElement("a");
			subIssue.classList.add("new-sub-issue-link-j2", "btn", "btn-sm");
			subIssue.style.setProperty("border-color", "gold");
			subIssue.style.setProperty("text-shadow", "1px 2px 2px black");
			subIssue.setAttribute("href", repo + "/issues/new?body=" + encodeURIComponent("↖ #" + issueId + " – " + issueTitle + "\n\n---\n\n"));
			subIssue.appendChild(document.createTextNode("New sub-issue"));
			issueEditButton.parentNode.insertBefore(subIssue, issueEditButton.nextSibling);
		}
	}
}, 2000);
