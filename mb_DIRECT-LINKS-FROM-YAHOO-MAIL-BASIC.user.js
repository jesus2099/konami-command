// ==UserScript==
// @name         mb. DIRECT LINKS FROM YAHOO! MAIL (BASIC)
// @version      2014.11.28.11.57
// @description  BACK FOR BASIC Y!MAIL only (/neo/b/) now. Adds links to MusicBrainz edits directly in mail.yahoo.com folders view (including "no votes" and "subscription" emails). No need to open all those e-mails any more. Only one link per edit ID, duplicate ID are coloured and e-mail(s) marked for deletion. Once clicked, the link is faded, to keep trace of already browsed edits. Limitations : only Opera(maybe) and y!mail BASIC I guess.
// @homepage     http://userscripts-mirror.org/scripts/show/80308
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_DIRECT-LINKS-FROM-YAHOO-MAIL-BASIC.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_DIRECT-LINKS-FROM-YAHOO-MAIL-BASIC.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2010-06-28
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*mail.yahoo.com/neo/b/*
// @exclude      http*://*mail.yahoo.com/mc/md.php*
// @run-at       document-end
// ==/UserScript==
(function(){
	/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
	var colour = "yellow";
	var colourclicked = "pink";
	var colourdupe = "mistyrose";
	var colourno = "yellow";
	var colournobg = "red";
	var colourloading = "gold";
	/* Specify which e-mail box links you want the script to be triggered in.
	   It will remove AJAX from those links so that the page reloads and the script is re-run.
	   It shouldn’t be required any more with current ymail BASIC
	   set an empty array [] to disable */
	var directlinks = [];//["inbox", /*"draft", "bulk",*/ "trash", "%Musibrainz%", "%Any Other e-mail Folder (see yahoo source page for ID)%"];
	var loadingtxt = "⌛ loading…";
	var edittypes = { "deleted":"×", "merged":"+" };
	var markReadEditsForDeletion = true;
	/* - --- - --- - --- - END OF CONFIGURATION - --- - --- - --- - */
	var userjs = "jesus2099userjs80308";
	var edits = [];
	var editTrigger = /^(?:Note added to|Someone has voted against)( your)? edit #([0-9]+)$/;
	var jiraTrigger = /^\[jira\] \w+: \(([A-Z][A-Z\d]*-\d+)\)/;
	var triggerno = /^Someone has voted against your edit(?: #[0-9]+)?$/;
	var triggernoextractorz = /<div class="plainMail">'(.+)' has voted against your edit #([0-9]+)/;
	var edittypeextractor = /(deleted|merged) by edit #([0-9]+)/;
	var idextractor = /by edit #([0-9]+)/;
	var triggerResponseURL = /<input type="hidden" name="mid" value="([^"]+)"/;
	var editurl = "//musicbrainz.org/edit/";
	var jiraurl = "//tickets.musicbrainz.org/browse/";
	for (var i=0; i<directlinks; i++) {
		var lnk = document.querySelector("li#"+directlinks[i]+" a");
		if (lnk) {
			lnk.style.setProperty("background-color", colour);
			lnk.addEventListener("click", function(e){ top.location = this.getAttribute("href"); }, true);
		}
	}
	var emails = document.querySelectorAll("table#datatable > tbody > tr > td > h2 > a.mlink");
	var emailnovotes = [];
	var emailsubscrs = [];
	if (emails) {
		for (var i=0; i < emails.length; i++) {
			var email = emails[i];
			var emailtxt = email.getAttribute("title");
			var editid = emailtxt.match(editTrigger);
			var jiraid = emailtxt.match(jiraTrigger);
			if (jiraid) {
				jiraid = jiraid[1];
				if (!edits[jiraid]) {
					edits[jiraid] = email;
					editlink(email, jiraurl+jiraid, false, jiraid);
				} else {
					edits[jiraid].style.backgroundColor = colourdupe;
					email.style.backgroundColor = colourdupe;
					editlink(email, jiraurl+jiraid, true, jiraid);
				}
			} else if (editid) {
				editid = editid[editid.length-1];
				email.replaceChild(document.createTextNode(emailtxt.substring(0,emailtxt.length-editid.length-2)), email.firstChild);
				var emailfrom = getParent(email, "tr").querySelector("tr > td > div > a.mlink");
				emailfrom.setAttribute("href", "//musicbrainz.org/user/"+encodeURIComponent(emailfrom.textContent.trim()));
				emailfrom.setAttribute("target", "_blank");
				emailfrom.style.setProperty("background-color", colour);
				if (!edits[editid]) {
					edits[editid] = email;
					editlink(email, editid);
				} else {
					edits[editid].style.backgroundColor = colourdupe;
					email.style.backgroundColor = colourdupe;
					editlink(email, editid, true);
				}
			} else if (email.getAttribute("title").match(/^Edits for your subscriptions$/)) {
				getParent(email, "tr").style.backgroundColor = colourloading;
				email.insertBefore(loading(), email.firstChild);
				emailsubscrs[decodeURIComponent(email.getAttribute("href").match(/(?:&|\?)mid=([^&$]+)/)[1])] = email;
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var res = this.responseText;
						var susu = res.match(/(deleted|merged) by edit #([0-9]+)/g);
						var susuemail = emailsubscrs[this.responseText.match(triggerResponseURL)[1]];
						var susuemailine = getParent(susuemail, "tr");
						susuemailine.className = "";/* mark as read */
						susuemailine.style.backgroundColor = "";
						susuemail.removeChild(susuemail.firstChild);
						if (susu) {
							for (var i=0; i<susu.length; i++) {
								var modid = susu[i].match(idextractor)[1];
								var type = susu[i].match(edittypeextractor)[1];
								if (edits[modid]) {
									edits[modid].style.backgroundColor = colourdupe;
									if (susu.length <= 1) {
										susuemail.style.backgroundColor = colourdupe;
									}
									editlink(susuemail, modid, true, edittypes[type]+modid).setAttribute("title", type);
								} else {
									edits[modid] = susuemail;
									editlink(susuemail, modid, false, edittypes[type]+modid).setAttribute("title", type);
								}
							}
						} else {
							susuemail.style.backgroundColor = colourclicked;
						}
						var entitiesEditorsExtractorz = "<BR>([^>]+) \\((\\d+ open), (\\d+ applied)\\)<BR>(?:Open edits: )?<a href=\"(https?://musicbrainz\\.org/(?:artist|collection|label|user)/[^/]+/edits)(?:/open)?\" target=_blank";
						var alledits = res.match(new RegExp(entitiesEditorsExtractorz, "g"));
						for (var ee=0; ee<alledits.length; ee++) {
							var allparts = alledits[ee].match(new RegExp(entitiesEditorsExtractorz));
							var lnk = editlink(susuemail, allparts[4], false, allparts[3]);
							var a = document.createElement("a");
							a.setAttribute("href", allparts[4].replace(/\/edits$/, ""));
							a.setAttribute("target", "_blank");
							a.style.setProperty("background-color", colourclicked);
							var im = a.appendChild(document.createElement("img"));
							var openedits = "/open_edits";
							if ((type = allparts[4].match(/artist|collection|label|series/))) {
								im.setAttribute("src", "//musicbrainz.org/static/images/entity/%type%.png".replace(/%type%/, type).replace(/collection|series/, "release_group"));
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
							a.setAttribute("href", a.getAttribute("href")+openedits);
							lnk.parentNode.insertBefore(document.createTextNode(" ("), lnk);
							lnk.parentNode.insertBefore(a, lnk);
							lnk.parentNode.insertBefore(document.createTextNode(", "), lnk);
							lnk.parentNode.insertBefore(document.createTextNode(")"), lnk.nextSibling);
						}
					}
				};
				xmlhttp.open("GET", email.getAttribute("href"), true);
				xmlhttp.send(null);
			}
			if (email.getAttribute("title").match(triggerno)) {
				var nonoemailfrom = getParent(email, "tr").querySelector("tr > td > div > a.mlink");
				nonoemailfrom.style.backgroundColor = colourloading;
				nonoemailfrom.replaceChild(loading(), nonoemailfrom.firstChild);
				emailnovotes[decodeURIComponent(email.getAttribute("href").match(/(?:&|\?)mid=([^&$]+)/)[1])] = email;
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
					if (this.readyState > 2 && this.status < 400 && this.status > 199) {
						var nonoemail = this.responseText.match(triggerResponseURL);
						if (nonoemail && (nonoemail = emailnovotes[this.responseText.match(triggerResponseURL)[1]])) {
							nonoemail = getParent(nonoemail, "tr");
							nonoemail.className = "";/* mark as read */
							var nono = this.responseText.match(triggernoextractorz);
							nonoemail = nonoemail.querySelector("tr > td > div > a");
							if (nono) {
								nonoemail.replaceChild(document.createTextNode(nono[1]), nonoemail.firstChild);/* from: xxx */
								nonoemail.style.setProperty("background-color", colournobg);
								nonoemail.style.setProperty("color", colourno);
								nonoemail.setAttribute("href", nonoemail.getAttribute("href").replace(/[^/]+$/, encodeURIComponent(nono[1])));
							} else {
								nonoemail.replaceChild(document.createTextNode("(._.?)"), nonoemail.firstChild);
							}
						}
					}
				};
				xmlhttp.open("GET", email.getAttribute("href"), true);
				xmlhttp.send(null);
			}
		}
	}
	function editlink(email, urlOrEditid, dupe, txt) {
		var fragment = document.createDocumentFragment();
		var a = document.createElement("a");
		a.addEventListener("click", function(e) {
			var edits = getParent(this, "table", "tbldata").querySelectorAll("table#datatable > tbody > tr > td > h2 > a."+userjs+"new[href='"+this.getAttribute("href")+"']");
			for (var e=0; e<edits.length; e++) {
				edits[e].className = edits[e].className.replace(userjs+"new", userjs+"read");
				edits[e].style.setProperty("background-color", colourclicked);
				edits[e].style.setProperty("text-decoration", "line-through");
				if (markReadEditsForDeletion && (cb = getParent(edits[e], "tr")) && cb.getElementsByClassName(userjs+"new").length == 0 && (cb = cb.querySelector("input.selectmsg[type='checkbox']"))) { cb.checked = true; }
			}
		}, true);
		a.setAttribute("href", urlOrEditid.match(/^\d+$/)?editurl+urlOrEditid:urlOrEditid);
		a.className = userjs+"new";
		a.setAttribute("target", "_blank");
		a.style.backgroundColor = dupe? colourdupe : colour;
		a.appendChild(document.createTextNode(txt?txt:"#"+urlOrEditid));
		fragment.appendChild(a);
		fragment.appendChild(document.createElement("br"));
		email.parentNode.insertBefore(fragment, email);
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
	function removeAllChildren(node) {
		if (node && node.hasChildNodes && node.removeChild) {
			while (node.hasChildNodes()) {
				node.removeChild(node.firstChild);
			}
		}
	}
	function getParent(obj, tag, cls) {
		var cur = obj;
		if (cur.parentNode) {
			cur = cur.parentNode;
			if (cur.tagName.toUpperCase() == tag.toUpperCase() && (!cls || cls && cur.className.match(new RegExp("\\W*"+cls+"\\W*")))) {
				return cur;
			} else {
				return getParent(cur, tag, cls);
			}
		} else {
			return null;
		}
	}
})();