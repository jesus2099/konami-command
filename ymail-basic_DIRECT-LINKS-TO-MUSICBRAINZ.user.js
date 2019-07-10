// ==UserScript==
// @name         ymail-basic. DIRECT LINKS TO MUSICBRAINZ
// @version      2019.7.10
// @description  BASIC Yahoo! Mail only (/neo/b/). Adds links to MusicBrainz edits directly in mail.yahoo.com folders view (including "no votes" and "subscription" emails). No need to open all those e-mails any more. Only one link per edit ID, duplicate ID are coloured and e-mail(s) marked for deletion. Once clicked, the link is faded, to keep trace of already browsed edits. Limitations : only Opera(maybe) and y!mail BASIC I guess.
// @compatible   vivaldi(2.4.1488.38)+violentmonkey  my setup (office)
// @compatible   vivaldi(1.0.435.46)+violentmonkey   my setup (home, xp)
// @compatible   firefox(64.0)+greasemonkey          tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2010-06-28 http://userscripts-mirror.org/scripts/show/80308
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @include      /^https?://mail.yahoo.com/b/.*/
// @run-at       document-end
// ==/UserScript==
"use strict";
/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
var colour = "yellow";
var colourclicked = "pink";
var colourdupe = "mistyrose";
var colourno = "yellow";
var colournobg = "red";
var colourloading = "gold";
var loadingtxt = "⌛ loading…";
var edittypes = {deleted: "×", merged: "+"};
var markReadEditsForDeletion = true;
/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
var userjs = "jesus2099userjs80308";
var edits = [];
var emailSubjects = document.querySelectorAll("table#messageListContainer > tbody td[data-test-id='subject'] > a");
if (emailSubjects) {
	for (var i = 0; i < emailSubjects.length; i++) {
		var emailSubject = emailSubjects[i];
		var emailtxt = emailSubject.getAttribute("title");
		var editid = emailtxt.match(/^(?:Note added to|Someone has voted against)( your)? edit #([0-9]+)$/);
		var jiraIdTitle = emailtxt.match(/^\[MeB JIRA\] \(([A-Z][A-Z\d]*-\d+)\) (.+)$/);
		emailSubject.parentNode.style.setProperty("line-height", "13px");
		var emailSender = getParent(emailSubject, "tr").querySelector("td[data-test-id='sender'] > a");
		if (jiraIdTitle) { // An email about a JIRA ticket
			var jiraId = jiraIdTitle[1];
			var jiraurl = "//tickets.musicbrainz.org/browse/";
			editlink(emailSubject, jiraurl + jiraId, edits[jiraId], jiraId);
			if (!edits[jiraId]) {
				edits[jiraId] = emailSubject;
			}
			emailSubject.replaceChild(document.createTextNode(jiraIdTitle[2]), emailSubject.lastChild);
		} else if (editid) { // An email about an edit (edit note or no vote)
			editid = editid[editid.length - 1];
			emailSubject.replaceChild(document.createTextNode(emailtxt.substring(0, emailtxt.length - editid.length - 2)), emailSubject.firstChild);
			emailSender.setAttribute("href", "//musicbrainz.org/user/" + encodeURIComponent(emailSender.textContent.trim()));
			emailSender.setAttribute("target", "_blank");
			emailSender.style.setProperty("background-color", colour);
			editlink(emailSubject, editid, edits[editid]);
			if (!edits[editid]) {
				edits[editid] = emailSubject;
			}
			var xhr = new XMLHttpRequest();
			xhr.emailSubject = emailSubject;
			xhr.emailRow = getParent(emailSubject, "tr");
			xhr.addEventListener("load", function(event) {
				if (this.status > 199 && this.status < 400) {
					this.emailRow.classList.remove("u_b"); // mark as read
					var editNote = this.responseText.match(/'[^']+' has added the following note to(?: your)? edit #\d+:<BR><\/div><div dir='ltr'>-{72}<BR><\/div><div dir='ltr'>(.+)<BR><\/div><div dir='ltr'>-{72}<BR><\/div><div dir='ltr'>If you would like to reply to this note, please add your note at:<BR>/);
					if (editNote) {
						editNote = editNote[1];
						var div = document.createElement("div");
						div.innerHTML = editNote.replace(/<a/g, '<a style="color: blue; text-decoration: underline;"');
						div.style.setProperty("background-color", "#eee")
						div.style.setProperty("padding", "4px")
						this.emailSubject.parentNode.insertBefore(div, this.emailSubject);
					}
				}
			});
			xhr.open("get", emailSubject.getAttribute("href"), true);
			xhr.send(null);
		} else if (emailSubject.getAttribute("title").match(/^Edits for your subscriptions$/)) { // A subscription email
			getParent(emailSubject, "tr").style.setProperty("background-color", colourloading);
			emailSubject.insertBefore(loading(), emailSubject.firstChild);
			var xhr = new XMLHttpRequest();
			xhr.emailSubject = emailSubject;
			xhr.emailRow = getParent(emailSubject, "tr");
			xhr.addEventListener("load", function(event) {
				if (this.status > 199 && this.status < 400) {
					this.emailRow.classList.remove("u_b"); // mark as read
					this.emailRow.style.setProperty("background-color", "");
					var res = this.responseText;
					var deletedOrMergedEntities = res.match(/(deleted|merged) by edit #([0-9]+)/g);
					this.emailSubject.removeChild(this.emailSubject.firstChild);
					if (deletedOrMergedEntities) {
						for (var i = 0; i < deletedOrMergedEntities.length; i++) {
							var modid = deletedOrMergedEntities[i].match(/by edit #([0-9]+)/)[1];
							var type = deletedOrMergedEntities[i].match(/(deleted|merged) by edit #([0-9]+)/)[1];
							editlink(this.emailSubject, modid, edits[modid], edittypes[type] + modid).setAttribute("title", type);
							if (!edits[modid]) {
								edits[modid] = this.emailSubject;
							}
						}
					} else {
						this.emailSubject.style.setProperty("background-color", colourclicked);
					}
					var entitiesEditorsExtractorz = "<BR>(?:</div><div dir='ltr'>)?([^>]+) \\((\\d+ open), (\\d+ applied)\\)<BR>(?:</div><div dir='ltr'>)?(?:Open edits: )?<a href=\"(https?://musicbrainz\\.org/(?:artist|collection|label|series|user)/[^/]+/edits)(?:/open)?\" target=_blank";
					var alledits = res.match(new RegExp(entitiesEditorsExtractorz, "g"));
					for (var ee = 0; ee < alledits.length; ee++) {
						var allparts = alledits[ee].match(new RegExp(entitiesEditorsExtractorz));
						var lnk = editlink(this.emailSubject, allparts[4], false, allparts[3]);
						var a = document.createElement("a");
						a.setAttribute("href", allparts[4].replace(/\/edits$/, ""));
						a.setAttribute("target", "_blank");
						a.style.setProperty("background-color", colourclicked);
						var im = a.appendChild(document.createElement("img"));
						var openedits = "/open_edits";
						var type = allparts[4].match(/artist|collection|label|series/);
						if (type) {
							im.setAttribute("src", "//musicbrainz.org/static/images/entity/%type%.svg".replace(/%type%/, type).replace(/collection/, "release_group"));
							im.setAttribute("height", "16px");
							im.setAttribute("width", "16px");
						} else if (allparts[4].match(/user/)) {
							im.setAttribute("src", "//gravatar.com/avatar/placeholder?d=mm&s=12");
							openedits = "/edits/open";
						}
						im.style.setProperty("margin-right", "4px");
						im.style.setProperty("vertical-align", "-.3em");
						a.appendChild(document.createTextNode(allparts[1]));
						lnk.parentNode.insertBefore(a, lnk);
						a = a.cloneNode(true);
						a.removeChild(a.firstChild);
						a.replaceChild(document.createTextNode(allparts[2]), a.firstChild);
						a.setAttribute("href", a.getAttribute("href") + openedits);
						lnk.parentNode.insertBefore(document.createTextNode(" ("), lnk);
						lnk.parentNode.insertBefore(a, lnk);
						lnk.parentNode.insertBefore(document.createTextNode(", "), lnk);
						lnk.parentNode.insertBefore(document.createTextNode(")"), lnk.nextSibling);
					}
				}
			});
			xhr.open("get", emailSubject.getAttribute("href"), true);
			xhr.send(null);
		}
		if (emailSubject.getAttribute("title").match(/^Someone has voted against your edit(?: #[0-9]+)?$/)) { // An own no‐voted edit
			emailSender.style.setProperty("background-color", colourloading);
			emailSender.replaceChild(loading(), emailSender.firstChild);
			var xhr = new XMLHttpRequest();
			xhr.emailSubject = emailSubject;
			xhr.emailSender = emailSender;
			xhr.emailRow = getParent(emailSubject, "tr");
			xhr.addEventListener("load", function(event) {
				if (this.status > 199 && this.status < 400) {
					this.emailRow.classList.remove("u_b"); // mark as read
					var nono = this.responseText.match(/'([^']+)' has voted against your edit #([0-9]+)/);
					if (nono) {
						this.emailSender.replaceChild(document.createTextNode(nono[1]), this.emailSender.firstChild); // from: xxx
						this.emailSender.style.setProperty("background-color", colournobg);
						this.emailSender.style.setProperty("color", colourno);
						this.emailSender.setAttribute("href", this.emailSender.getAttribute("href").replace(/[^/]+$/, encodeURIComponent(nono[1])));
					} else {
						this.emailSender.replaceChild(document.createTextNode("(._.?)"), this.emailSender.firstChild);
					}
				}
			});
			xhr.open("get", emailSubject.getAttribute("href"), true);
			xhr.send(null);
		}
	}
}
function editlink(emailSubject, urlOrEditId, dupe, txt) {
	var fragment = document.createDocumentFragment();
	var a = document.createElement("a");
	a.addEventListener("click", function(event) {
		var sameEditLinks = document.querySelectorAll("table#messageListContainer > tbody a." + userjs + "new[href$='" + this.getAttribute("href").replace(/^(https?:)?\/\/(beta\.)?/g, "") + "']"); // in case of on the fly change by mb-PREFERRED-MBS
		for (var e = 0; e < sameEditLinks.length; e++) {
			sameEditLinks[e].className = sameEditLinks[e].classList.replace(userjs + "new", userjs + "read");
			sameEditLinks[e].style.setProperty("background-color", colourclicked);
			sameEditLinks[e].style.setProperty("text-decoration", "line-through");
			if (markReadEditsForDeletion) {
				var cb = getParent(sameEditLinks[e], "tr");
				if (
					cb
					&& cb.getElementsByClassName(userjs + "new").length == 0
					&& (cb = cb.querySelector("input[name='mids[]'][type='checkbox']"))
				) {
					cb.checked = true;
				}
			}
		}
	}, true);
	a.setAttribute("href", urlOrEditId.match(/^\d+$/) ? "//musicbrainz.org/edit/" + urlOrEditId : urlOrEditId);
	a.classList.add(userjs + "new");
	a.setAttribute("target", "_blank");
	a.style.setProperty("background-color", dupe ? colourdupe : colour);
	if (dupe) {
		edits[urlOrEditId].style.setProperty("background-color", colourdupe);
		emailSubject.style.setProperty("background-color", colourdupe);
	}
	a.appendChild(document.createTextNode(txt ? txt : "Edit #" + urlOrEditId));
	fragment.appendChild(a);
	fragment.appendChild(document.createElement("br"));
	emailSubject.parentNode.insertBefore(fragment, emailSubject);
	return a;
}
function loading() {
	var frag = document.createDocumentFragment();
	var span = document.createElement("span");
	span.style.setProperty("background-color", colour);
	span.appendChild(document.createTextNode(loadingtxt));
	frag.appendChild(span);
	frag.appendChild(document.createTextNode(" "));
	return frag;
}
