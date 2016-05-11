"use strict";
var meta= { rawmdb: function() {
// ==UserScript==
// @name         mb. POWER VOTE
// @version      2016.5.11
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_POWER-VOTE.user.js
// @description  musicbrainz.org: Adds some buttons to check all unvoted edits (Yes/No/Abs/None) at once in the edit search page. You can also collapse/expand (all) edits for clarity. A handy reset votes button is also available + Double click radio to vote single edit + range click with shift to vote a series of edits. , Hidden (collapsed) edits will never be voted (even if range click or shift+click force vote).
// @homepage     http://userscripts-mirror.org/scripts/show/57765
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_POWER-VOTE
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @compatible   firefox(45.0.2)+greasemonkey        quickly tested
// @compatible   chromium(46.0.2471.0)+tampermonkey  quickly tested
// @compatible   chrome+tampermonkey                 should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_POWER-VOTE.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_POWER-VOTE.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2009-09-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*
// @include      http://*.mbsandbox.org/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
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
var chrome = "Please run “" + meta.name + "” with Tampermonkey instead of plain Chrome.";
var editform = document.querySelector("div#edits > form");
if (editform) {
	/* - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- - */
	var showtop = true;
	var showbottom = true;
	var border = "thin dashed red"; /*leave "" for defaults*/
	var submitButtonOnTopToo = true;
	var onlySubmitTabIndexed = true; /*hit tab after typed text or voted directly goes to a submit button*/
	var text = " // Check all unvoted edits (shift+click to force all votes) → ";
	var canceltext = "Reset votes";
	var scrollToEdits = false; /*will never get in the way if you have scrolled down yourself*/
	var rangeclick = true; /*multiple votes by clicking first vote then shift-clicking last radio in a range*/
	var collapseEdits = true;
	var voteColours = true;
	/* - --- - --- - --- - END  OF  CONFIGURATION - --- - --- - --- - */
	var userjs = "jesus2099userjs57765";
	var FF = /firefox/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);/*FF has bugs*/
	if (FF) { FF = {"1": "#b1ebb0", "0": "#ebb1ba", "-1": "#f2f0a5"}; }
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	var j2css = document.styleSheets[document.styleSheets.length - 1];
	j2css.insertRule("div.edit-list." + userjs + "force, div.edit-list." + userjs + "ninja > div.edit-actions, div.edit-list." + userjs + "ninja > div.edit-details, div.edit-list." + userjs + "ninja > div.edit-notes { overflow: hidden !important; height: 0 !important; !important; padding: 0 !important; margin: 0 !important; }", j2css.cssRules.length);
	j2css.insertRule("div#" + userjs + "xhrstat { position: fixed; top: 0; left: 0; border: 2px solid black; border-width: 0 2px 2px 0; background-color: #ff6; }", j2css.cssRules.length);
	j2css.insertRule("tr.rename-artist-credits." + userjs + "yes > th { vertical-align: middle; }", j2css.cssRules.length);
	j2css.insertRule("tr.rename-artist-credits." + userjs + "yes > td { color: #f00; font-weight: bolder; font-size: 2em; text-shadow: 1px 1px 0 #663; text-transform: uppercase; }", j2css.cssRules.length);
	var radios = [];
	var radiosafe = [];
	var lastradio;
	var submitButton, submitClone, submitShift, inputs;
	var collapse = ["▼", "◀"];
	var pendingXHRvote = 0;
	editform.addEventListener("submit", function(event) {
		event.preventDefault();
		if (pendingXHRvote > 0) {
			if (submitShift || confirm("GOING BACKGROUND (AJAX)? (or not)\n\n" + pendingXHRvote + " background vote" + (pendingXHRvote == 1 ? " is" : "s are") + " pending,\ndo you want to add more votes to this queue?\n\nSHIFT+CLICK on submit to bypass this confirmation next time.")) {
				var pendingvotes = editform.querySelectorAll("div.voteopts input[type='radio']:not([value='-2']):not([disabled])");
				for (var pv = 0; pv < pendingvotes.length; pv++) {
					if (pendingvotes[pv].checked) {
						click(getParent(pendingvotes[pv], "label") || pendingvotes[pv], "dbl");
					}
				}
			}
		} else {
			this.submit();
		}
	}, false);
	if (inputs = document.querySelector("div#content div.overall-vote")) {
		del(inputs);
	}
	for (var rac = editform.querySelectorAll("tr.rename-artist-credits > td"), r = 0; r < rac.length; r++) {
		if (rac[r].textContent.match(/jah?|yes|s[íì]|oui|voor|kyllä|ναι|はい/i)) {
			rac[r].parentNode.classList.add(userjs + "yes");
		}
	}
	inputs = editform.querySelectorAll("div.voteopts input[type='radio']");
	for (var i = 0; i < inputs.length; i++) {
		if (onlySubmitTabIndexed) { inputs[i].setAttribute("tabindex", "-1"); }
		radios.push(inputs[i]);
		if (voteColours) {/*FF is LIFO*/
			inputs[i].addEventListener("change", spreadBackgroundColour);
			if (inputs[i].checked && inputs[i].value != -2) {
				setTimeout(function() {
					sendEvent(this, "change");
				}.bind(inputs[i]), 0);
			}
		}
		var labinput = getParent(inputs[i], "label") || inputs[i];
		preventDefault(labinput, "mousedown");
		labinput.setAttribute("title", "double-click to vote this single edit");
		labinput.addEventListener("dblclick", function(event) {
			var ed = getParent(this, "div", "edit-list");
			var vote = (this.querySelector("input[type='radio']") || this).value;
			var id = ed.querySelector("input[type='hidden'][name$='edit_id']");
			if (ed && vote && id) {
				var ta = ed.querySelector("textarea");
				var params = "enter-vote.vote.0.edit_id=" + id.value + "&enter-vote.vote.0.vote=" + vote + "&url=" + encodeURIComponent("/edit/" + id.value);
				if (ta) { params += "&enter-vote.vote.0.edit_note=" + encodeURIComponent(ta.value); }
				var xhr = new XMLHttpRequest();
				xhr.id = id.value;
				xhr.addEventListener("load", function(event) {
					var anotherEdit = this.responseText.match(/<title>\D*(\d+)\D*<\/title>/);
					if (anotherEdit && anotherEdit[1] != this.id) {
						anotherEdit = anotherEdit[1];
					} else {
						anotherEdit = false;
					}
					var editEntry = document.querySelector("input[type='hidden'][name$='edit_id'][value='" + this.id + "']");
					if (editEntry) {
						editEntry = getParent(editEntry, "div", "edit-list");
					}
					if (this.status == 200 && pendingXHRvote > 0 && !anotherEdit && editEntry) {
						del(editEntry);
					} else {
						var errorMessage = "Error while voting Edit #" + this.id + " in the background.\n\n";
						if (this.status != 200) {
							errorMessage += this.status + ": " + this.statusText + "\n";
						}
						if (anotherEdit) {
							open("/edit/" + anotherEdit);
							errorMessage += "Got Edit #" + anotherEdit + " instead in return page.\n";
						}
						if (pendingXHRvote < 1) {
							errorMessage += "No votes pending.\n";
						}
						if (editEntry) {
							ninja(event, editEntry, false, "force");
							editEntry.setAttribute("title", errorMessage);
							editEntry.style.setProperty("background-color", "pink");
							editEntry.style.setProperty("cursor", "help");
							editEntry.style.setProperty("display", "block");
						} else {
							open("/edit/" + this.id);
							errorMessage += "Edit block not found.\n";
							alert(errorMessage);
						}
					}
					if (pendingXHRvote > 0) {
						updateXHRstat(--pendingXHRvote);
					}
				});
				xhr.open("POST", "/edit/enter_votes", true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.setRequestHeader("Content-length", params.length);
				xhr.setRequestHeader("Connection", "close");
				updateXHRstat(++pendingXHRvote);
				xhr.send(params);
				ninja(event, ed, true, "force");
			}
		}, false);
		labinput.addEventListener("click", function(event) {
			var rad = this.querySelector("input[type='radio']");
			if (rangeclick && (rad || this)) {
				if (event.shiftKey && lastradio && rad != lastradio && rad.value == lastradio.value) {
					rangeclick = false;
					doitdoit(event, rad.value, Math.min(radios.indexOf(rad), radios.indexOf(lastradio)), Math.max(radios.indexOf(rad), radios.indexOf(lastradio)));
					rangeclick = true;
					lastradio = null;
				} else {
					lastradio = rad;
				}
			}
		}, false);
		if (inputs[i].checked) { radiosafe.push(inputs[i]); }
	}
	if (radios.length > 4) {
		if (showtop) { showtop = editform.insertBefore( shortcutsRow(), editform.firstChild ); }
		if (showbottom) { showbottom = editform.insertBefore( shortcutsRow(), editform.lastChild.previousSibling ); }
	}
	submitButton = editform.querySelector("div.row > span.buttons > button");
	submitButton.addEventListener("click", submitShiftKey, false);
	submitButton.setAttribute("title", "SHIFT+CLICK for background voting of selected edits");
	if (submitButtonOnTopToo) {
		submitClone = editform.insertBefore(getParent(submitButton, "div", "row").cloneNode(true), editform.firstChild).querySelector("button[type='submit']");
		submitClone.addEventListener("click", submitShiftKey, false);
	}
	if (collapseEdits) {
		var edits = editform.querySelectorAll("div.edit-list");
		for (var ed = 0; ed < edits.length; ed++) {
			if (edits[ed].querySelector("div.edit-description")) {
				var eheader = edits[ed].querySelector("div.edit-header");
				var collexp = document.createElement("div");
				var collexpa = collexp.appendChild(document.createElement("a").appendChild(document.createTextNode(collapse[0])).parentNode);
				collexp.style.setProperty("float", "right");
				collexpa.className = userjs;
				if (eheader.querySelectorAll("td.vote-count > div > strong").length == 1) collexpa.classList.add("autoedit");
				collexpa.style.setProperty("cursor", "pointer");
				collexpa.style.setProperty("font-size", "2em");
				preventDefault(collexpa, "mousedown");
				collexpa.setAttribute("title", "collapse same EDITOR edits: CTRL+click\n\ncollapse same TYPE edits: ALT+click\n\ncollapse " + (collexpa.classList.contains("autoedit") ? "auto" : "same VOTED ") + "edits: CTRL+ALT+click\n\ncollapse ALL edits: SHIFT+click");
				collexpa.setAttribute("rel", "collapse");
				collexpa.addEventListener("click", function(event) {
					var expand = (this.getAttribute("rel") == "expand");
					this.replaceChild(document.createTextNode(collapse[expand ? 0 : 1]), this.firstChild);
					this.setAttribute("title", this.getAttribute("title").replace(new RegExp(expand ? "expand" : "collapse", "g"), expand ? "collapse" : "expand"));
					this.setAttribute("rel", expand ? "collapse" : "expand");
					ninja(event, getParent(this, "div", "edit-list"), !expand);
					var editheader = getParent(this, "div", "edit-header");
					var editheadersel = "div.edit-header", editor, vote;
					var userCSS = "div.edit-header > p.subheader > a[href*='/user/']";
					var voteCSS = "div.edit-list > div.edit-actions > div.voteopts input[type='radio']:checked";
					var autoedit = false;
					if (!event.shiftKey) {
						if (event.altKey && event.ctrlKey) {
							if (this.classList.contains("autoedit")) autoedit = true;
							else {
								vote = editheader.parentNode.querySelector(voteCSS);
								if (vote) vote = vote.getAttribute("value");
							}
						} else if (event.altKey) {
							var edittype = editheader.getAttribute("class").match(/\W([a-z-]+)$/);
							if (edittype) {
								editheadersel += "." + edittype[1];
							}
						} else if (event.ctrlKey) {
							if (editor = editheader.querySelector(userCSS).getAttribute("href").match(/\/user\/(.+)$/)) {
								editor = editor[1];
							}
						}
					}
					if (event.altKey || event.ctrlKey || event.shiftKey) {
						var others = editform.querySelectorAll(editheadersel + " a." + userjs + (autoedit ? ".autoedit" : "") + "[rel='" + (expand ? "expand" : "collapse") + "']");
						for (var other = 0; other < others.length; other++) {
							var ovote = getParent(others[other], "div", "edit-list").querySelector(voteCSS);
							if (ovote) ovote = ovote.getAttribute("value");
							if (
								(!editor || editor == getParent(others[other], "div", "edit-header").querySelector(userCSS).getAttribute("href").match(/\/user\/(.+)$/)[1])
								&& (!vote || vote == ovote)
							) {
								click(others[other]);
							}
						}
					}
				}, false);
				eheader.insertBefore(collexp, eheader.firstChild);
			}
		}
	}
	if (self.pageYOffset > 0) {
		var cs, offset = 0;
		if (submitClone && (cs = getComputedStyle(getParent(submitClone, "div", "row")))) {
			offset += parseInt(cs.getPropertyValue("height").match(/\d+/), 10);
			offset += parseInt(cs.getPropertyValue("margin").match(/\d+/), 10);
		}
		if (showtop.tagName && (cs = getComputedStyle(showtop))) {
			offset += parseInt(cs.getPropertyValue("height").match(/\d+/), 10);
			offset += parseInt(cs.getPropertyValue("margin").match(/\d+/), 10);
		}
		if (offset != 0) {
			self.scrollTo(0, self.pageYOffset + offset);
		}
	} else if (scrollToEdits) {
		var foundcount = document.querySelector("div#page div.search-toggle > p > strong");
		var navpages = document.querySelector("div#edits > p.pageselector > em");
		var addedStuff;
		if (navpages) {
			navpages.appendChild(document.createTextNode(" — "));
			addedStuff = navpages.appendChild(foundcount.cloneNode(true));
		} else if (submitClone) {
			addedStuff = getParent(submitClone, "div", "row").appendChild(foundcount.cloneNode(true));
			addedStuff.style.setProperty("float", "left");
		} else {
			addedStuff = editform.insertBefore(getParent(foundcount, "div", "search-toggle").cloneNode(true), editform.firstChild);
		}
		del(getParent(foundcount, "div", "search-toggle"));
		var artistlnk = document.getElementsByClassName("artistheader");
		if (addedStuff && artistlnk && artistlnk[0] && artistlnk[0].getElementsByTagName("a") && artistlnk[0].getElementsByTagName("a")[0]) {
			addedStuff.appendChild(document.createTextNode(" for "));
			artistlnk = artistlnk[0].getElementsByTagName("a")[0].cloneNode(true);
			addedStuff.appendChild(artistlnk);
			artistlnk.style.setProperty("border", "0");
			artistlnk.style.setProperty("padding", "0");
			artistlnk.style.setProperty("margin", "0");
			artistlnk.style.setProperty("font-size", "1.2em");
			artistlnk.style.setProperty("font-weight", "normal");
			artistlnk.style.setProperty("color", "black");
		}
		self.scrollTo(0, findPos(document.getElementById("edits")).y - getComputedStyle(document.getElementById("header-menu")).getPropertyValue("height").match(/\d+/));
	}
}
function shortcutsRow() {
	var editlist, editactions, voteopts, editdetails;
	editlist = mkElt("div", "edit-list");
	editlist.style.setProperty("border", border);
	editactions = mkElt("div", "edit-actions c applied");
	voteopts = mkElt("div", "voteopts buttons");
	voteopts.style.setProperty("width", "175px");
	voteopts.style.setProperty("margin", "0");
	voteopts.appendChild(shortcut("1", "Yes"));
	voteopts.appendChild(shortcut("0", "No"));
	voteopts.appendChild(shortcut("-1", "Abstain"));
	voteopts.appendChild(shortcut("-2", "None"));
	editactions.appendChild(voteopts);
	editlist.appendChild(editactions);
	editdetails = mkElt("div", "edit-details");
	editdetails.style.setProperty("text-align", "right");
	editdetails.style.setProperty("margin", "0");
	editdetails.appendChild(mkElt("span", "buttons").appendChild(shortcut("omgcancel", canceltext)).parentNode);
	editdetails.appendChild(document.createTextNode(text));
	editlist.appendChild(editdetails);
	return editlist;
}
function mkElt(typ, cls) {
	var obj = document.createElement(typ);
	obj.className = cls;
	return obj;
}
function shortcut(vote, txt) {
	var button = document.createElement("input");
	button.setAttribute("type", "button");
	button.className = "styled-button";
	if (onlySubmitTabIndexed) { button.setAttribute("tabindex", "-1"); }
	button.style.setProperty("padding", FF ? "0 2px" : "0 3px");
	button.style.setProperty("margin", FF ? "0 3px 0 0" : "0 3px");
	button.style.setProperty("float", "none");
	button.value = txt;
	button.addEventListener("click", function(event) { doitdoit(event, vote); });
	return button;
}
function doitdoit(event, vote, min, max) {
	if (vote != "omgcancel") {
		for (i = (min ? min + (FF ? 0 : 1) : 0); i < (max ? max + 1 : radios.length); i++) {/*FF shift+click label NG*/
			if (radios[i].getAttribute("value") == vote && !radios[i].checked && !ninja(event, getParent(radios[i], "div", "edit-list")) && (event.shiftKey || isOkToVote(radios[i]))) {
				click(radios[i]);
			}
		}
	} else { for (i = 0; i < radiosafe.length; i++) { click(radiosafe[i]); } }
}
function isOkToVote(radiox) {
	return getParent(radiox, "div", "voteopts").querySelector("input[type='radio'][value='-2']").checked;
}
function getParent(obj, tag, cls) {
	var cur = obj;
	if (cur.parentNode) {
		cur = cur.parentNode;
		if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.classList.contains(cls))) {
			return cur;
		} else {
			return getParent(cur, tag, cls);
		}
	} else {
		return null;
	}
}
function findPos(obj) { /* http://www.quirksmode.org/js/findpos.html */
	var curleft = 0, curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return {"x": curleft, "y": curtop};
}
function click(n, mod){
	var clicke = document.createEvent("MouseEvents");
	clicke.initMouseEvent((mod ? mod : "") + "click", true, true, self, mod ? 2 : 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	n.dispatchEvent(clicke);
}
function sendEvent(node, eventName){
	var event = document.createEvent("HTMLEvents");
	event.initEvent(eventName, true, true);
	node.dispatchEvent(event);
}
function disable(cont, dis) {
	var inputs = cont.querySelectorAll("input, select, textarea, button");
	if (inputs.length > 0) {
		for (var i = 0; i < inputs.length; i++) {
			if (dis) { inputs[i].setAttribute("disabled", "disabled"); }
			else { inputs[i].removeAttribute("disabled"); }
		}
		return true;
	} else { return false; }
}
function ninja(event, o, n, spec) {
	disable(o, n);
	var cls = spec ? spec : "ninja";
	if (n != null) {
		var jQwtf;
		var allbutheader = "div.edit-actions, div.edit-notes, div.edit-details";
		try {
			jQwtf = spec ? jQuery(o) : jQuery(o).children(allbutheader);
		} catch(error) {
			jQwtf = spec ? [o] : o.querySelectorAll(allbutheader);
			console.log(error.message + "!\n" + chrome);
		}
		if (event.detail > 0 && !event.altKey && !event.ctrlKey && !event.shiftKey) {
			if (n) {
				try { jQwtf.hide(100); } catch(error) { for(var j = 0; j < jQwtf.length; j++) jQwtf[j].style.setProperty("display", "none"); }
			} else {
				try {
					jQuery(o).removeClass(userjs + "ninja");
					jQwtf.show(100);
				} catch(error) {
					for(var j = 0; j < jQwtf.length; j++) {
						jQwtf[j].classList.remove(userjs + "ninja");
						jQwtf[j].style.setProperty("display", "block");
					}
				}
			}
		} else {
			try { jQwtf.css("display", n ? "none" : ""); } catch(error) { for(var j = 0; j < jQwtf.length; j++) jQwtf[j].style.setProperty("display", n ? "none" : ""); }
			if (n) o.classList.add(userjs + cls);
			else o.classList.remove(userjs + cls);
		}
	} else return o.classList.contains(userjs + cls);
}
function updateXHRstat(nbr) {
	var stat = document.getElementById(userjs + "xhrstat");
	if (!stat) {
		stat = document.body.appendChild(document.createElement("div"));
		stat.setAttribute("id", userjs + "xhrstat");
		stat.appendChild(document.createTextNode(" "));
		stat.style.setProperty("z-index", "2099");
	}
	stat.replaceChild(document.createTextNode(nbr + " background vote" + (nbr == 1 ? "" : "s") + " pending…"), stat.firstChild);
	if (!editform.querySelector("div.edit-list div.edit-description")) {
		location.reload();
	}
	stat.style.setProperty("display", nbr > 0 ? "block" : "none");
}
function del(o) {
	return o.parentNode.removeChild(o);
}
function submitShiftKey(event) { submitShift = event.shiftKey; }
function preventDefault(node, eventName) { node.addEventListener(eventName, function(event) { event.preventDefault(); }, false); }
function spreadBackgroundColour(event) {
	setTimeout(function() {
		var actions = getParent(this, "div", "edit-actions");
		if (this.value != -2) {
			actions.style.setProperty("background-color", FF ? FF[this.value] : getComputedStyle(getParent(this, "div", "vote")).getPropertyValue("background-color"));
		} else {
			actions.style.removeProperty("background-color");
		}
	}.bind(this), 0);
}
