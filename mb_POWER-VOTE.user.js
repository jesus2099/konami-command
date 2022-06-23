// ==UserScript==
// @name         mb. POWER VOTE
// @version      2022.6.23
// @description  musicbrainz.org: Adds some buttons to check all unvoted edits (Yes/No/Abs/None) at once in the edit search page. You can also collapse/expand (all) edits for clarity. A handy reset votes button is also available + Double click radio to vote single edit + range click with shift to vote a series of edits., Hidden (collapsed) edits will never be voted (even if range click or shift+click force vote). Fast approve with edit notes. Prevent leaving voting page with unsaved changes.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_POWER-VOTE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_POWER-VOTE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2009-09-14; https://web.archive.org/web/20131103163355/userscripts.org/scripts/show/57765 / https://web.archive.org/web/20141011084007/userscripts-mirror.org/scripts/show/57765
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://cdn.jsdelivr.net/gh/jesus2099/konami-command@58be27d33c01f1081291751bbcfcbddc3be2c4ea/lib/SUPER.js?v=2021.2.4
// @grant        GM_info
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/[^/]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(open_)?edits\b/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/edit\/\d+\b/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/edit\/(open|subscribed(_editors)?)\b/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/search\/edits\b/
// @include      /^https?:\/\/(\w+\.)?musicbrainz\.org\/user\/[^/]+\/(edits(\/open)?|votes)\b/
// @run-at       document-end
// ==/UserScript==
"use strict";
var chrome = "Please run “" + GM_info.script.name + "” with Violentmonkey instead of plain Chrome.";
var editform = document.querySelector("div#edits > form");
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
if (editform) {
	// - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- -
	var showtop = true;
	var showbottom = true;
	var border = "thin dashed red"; // leave "" for defaults
	var submitButtonOnTopToo = true;
	var onlySubmitTabIndexed = true; // hit tab after typed text or voted directly goes to a submit button
	var text = " // Check all unvoted edits (shift+click to force all votes) → ";
	var canceltext = "Reset votes";
	var scrollToEdits = false; // will never get in the way if you have scrolled down yourself
	var rangeclick = true; // multiple votes by clicking first vote then shift-clicking last radio in a range
	var collapseEdits = true;
	var voteColours = true;
	// - --- - --- - --- - END  OF  CONFIGURATION - --- - --- - --- -
	var userjs = "jesus2099userjs57765";
	var FF = /firefox/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent); // FF has bugs
	if (FF) { FF = {"1": "#b1ebb0", "0": "#ebb1ba", "-1": "#f2f0a5"}; }
	j2css.insertRule("div.edit-list." + userjs + "force, div.edit-list." + userjs + "ninja > div.edit-actions, div.edit-list." + userjs + "ninja > div.edit-details, div.edit-list." + userjs + "ninja > div.edit-notes { overflow: hidden !important; height: 0 !important; !important; padding: 0 !important; margin: 0 !important; }", 0);
	j2css.insertRule("div#" + userjs + "xhrstat { position: fixed; top: 0; left: 0; border: 2px solid black; border-width: 0 2px 2px 0; background-color: #ff6; }", 0);
	j2css.insertRule("tr.rename-artist-credits." + userjs + "yes > th { vertical-align: middle; }", 0);
	j2css.insertRule("tr.rename-artist-credits." + userjs + "yes > td { color: #f00; font-weight: bolder; font-size: 2em; text-shadow: 1px 1px 0 #663; text-transform: uppercase; }", 0);
	if (showtop || submitButtonOnTopToo) {
		j2css.insertRule("div.overall-vote { display: none; }", 0);
	}
	var radios = [];
	var radiosafe = [];
	var lastradio;
	var submitButton, submitClone, submitShift, inputs;
	var collapse = ["▼", "◀"];
	var pendingXHRvote = 0;
	// Prevent leaving voting page with unsaved changes
	editform.addEventListener("input", preventLosingUnsavedChanges);
	// Prevent losing background voting queue
	editform.addEventListener("submit", function(event) {
		self.removeEventListener("beforeunload", preventLosingUnsavedChanges); // Allow unload on submit (volontary)
		event.preventDefault();
		if (pendingXHRvote > 0) {
			if (submitShift || confirm("GOING BACKGROUND (AJAX)? (or not)\n\n" + pendingXHRvote + " background vote" + (pendingXHRvote == 1 ? " is" : "s are") + " pending,\ndo you want to add more votes to this queue?\n\nSHIFT+CLICK on submit to bypass this confirmation next time.")) {
				var pendingvotes = editform.querySelectorAll("div.voteopts input[type='radio']:not([value='-2']):not([disabled])");
				for (let pv = 0; pv < pendingvotes.length; pv++) {
					if (pendingvotes[pv].checked) {
						sendEvent(getParent(pendingvotes[pv], "label") || pendingvotes[pv], "dblclick");
					}
				}
			}
		} else {
			this.submit();
		}
	}, false);
	if ((inputs = document.querySelector("div#content div.overall-vote"))) {
		removeNode(inputs);
	}
	for (let rac = editform.querySelectorAll("tr.rename-artist-credits > td"), r = 0; r < rac.length; r++) {
		if (rac[r].textContent.match(/jah?|yes|s[íì]|oui|voor|kyllä|ναι|はい/i)) {
			rac[r].parentNode.classList.add(userjs + "yes");
		}
	}
	// Fast approve with edit notes
	document.body.addEventListener("click", function(event) {
		if (event.target.closest("div.edit-actions") && event.target.matches("a.positive[href^='/edit/'][href*='/approve']")) {
			event.stopPropagation();
			event.preventDefault();
			var edit = event.target.closest("div.edit-list");
			var editId = edit.querySelector("input[type='hidden'][name$='edit_id']");
			if (edit && editId) {
				var editNote = edit.querySelector("textarea");
				if (editNote && editNote.value.trim() !== "") {
					// Save edit note before approving
					queueVote(edit, editId.value, "-2", queueApprove);
				} else {
					queueApprove(edit, editId.value);
				}
			}
		}
	}, true);
	inputs = editform.querySelectorAll("div.voteopts input[type='radio']");
	if (voteColours) {
		editform.addEventListener("change", spreadBackgroundColour);
	}
	for (let i = 0; i < inputs.length; i++) {
		if (onlySubmitTabIndexed) { inputs[i].setAttribute("tabindex", "-1"); }
		radios.push(inputs[i]);
		if (voteColours && inputs[i].checked && inputs[i].value != -2) {
			setTimeout(function() {
				sendEvent(this, "change");
			}.bind(inputs[i]), 0);
		}
		var labinput = getParent(inputs[i], "label") || inputs[i];
		preventDefault(labinput, "mousedown");
		labinput.setAttribute("title", "double-click to vote this single edit");
		labinput.addEventListener("dblclick", function(event) {
			var edit = this.closest("div.edit-list");
			var vote = (this.querySelector("input[type='radio']") || this).value;
			var editId = edit.querySelector("input[type='hidden'][name$='edit_id']");
			if (edit && vote && editId) {
				queueVote(edit, editId.value, vote);
			}
		});
		labinput.addEventListener("click", function(event) {
			var rad = this.querySelector("input[type='radio']");
			if (rangeclick && (rad || this)) {
				if (event.shiftKey && lastradio && rad != lastradio && rad.value == lastradio.value) {
					rangeclick = false;
					rangeVote(event, rad.value, Math.min(radios.indexOf(rad), radios.indexOf(lastradio)), Math.max(radios.indexOf(rad), radios.indexOf(lastradio)));
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
		if (showtop) { showtop = editform.insertBefore(shortcutsRow(), editform.firstChild); }
		if (showbottom) { showbottom = editform.insertBefore(shortcutsRow(), editform.lastChild.previousSibling); }
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
		for (let ed = 0; ed < edits.length; ed++) {
			if (edits[ed].querySelector("div.edit-description")) {
				var eheader = edits[ed].querySelector("div.edit-header");
				var collexp = document.createElement("div");
				var collexpa = collexp.appendChild(document.createElement("a").appendChild(document.createTextNode(collapse[0])).parentNode);
				collexp.style.setProperty("float", "right");
				collexpa.className = userjs;
				if (eheader.querySelectorAll("td.vote-count > div > strong").length === 1) collexpa.classList.add("autoedit");
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
					ninja(event, this.closest("div.edit-list"), !expand);
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
							if ((editor = editheader.querySelector(userCSS).getAttribute("href").match(/\/user\/(.+)$/))) {
								editor = editor[1];
							}
						}
					}
					if (event.altKey || event.ctrlKey || event.shiftKey) {
						var others = editform.querySelectorAll(editheadersel + " a." + userjs + (autoedit ? ".autoedit" : "") + "[rel='" + (expand ? "expand" : "collapse") + "']");
						for (let other = 0; other < others.length; other++) {
							var ovote = others[other].closest("div.edit-list").querySelector(voteCSS);
							if (ovote) ovote = ovote.getAttribute("value");
							if (
								(!editor || editor == getParent(others[other], "div", "edit-header").querySelector(userCSS).getAttribute("href").match(/\/user\/(.+)$/)[1])
								&& (!vote || vote == ovote)
							) {
								sendEvent(others[other], "click");
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
		if (submitClone && (cs = self.getComputedStyle(getParent(submitClone, "div", "row")))) {
			offset += parseInt(cs.getPropertyValue("height").match(/\d+/), 10);
			offset += parseInt(cs.getPropertyValue("margin").match(/\d+/), 10);
		}
		if (showtop.tagName && (cs = self.getComputedStyle(showtop))) {
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
		removeNode(getParent(foundcount, "div", "search-toggle"));
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
		self.scrollTo(0, findPos(document.getElementById("edits")).y - self.getComputedStyle(document.getElementById("header-menu")).getPropertyValue("height").match(/\d+/));
	}
}
function queueApprove(edit, editId) {
	var xhr = new XMLHttpRequest();
	xhr.editId = editId;
	xhr.addEventListener("load", function(event) {
		checkAfterQueue(this, "approving");
	});
	xhr.open("POST", "/edit/" + editId + "/approve", true);
	updateXHRstat(++pendingXHRvote);
	xhr.send(null);
	ninja(null, edit, true, "force");
}
function queueVote(edit, editId, vote, callback) {
	var editNote = edit.querySelector("textarea");
	var params = "enter-vote.vote.0.edit_id=" + editId + "&enter-vote.vote.0.vote=" + vote + "&url=" + encodeURIComponent("/edit/" + editId);
	if (editNote) { params += "&enter-vote.vote.0.edit_note=" + encodeURIComponent(editNote.value); }
	var xhr = new XMLHttpRequest();
	xhr.editId = editId;
	xhr.addEventListener("load", function(event) {
		checkAfterQueue(this, "voting", callback);
	});
	xhr.open("POST", self.location.protocol + "//" + self.location.host + "/edit/enter_votes", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	updateXHRstat(++pendingXHRvote);
	xhr.send(params);
	ninja(null, edit, true, "force");
}
function checkAfterQueue(xhr, queueType, callback) {
	var anotherEdit = xhr.responseText.match(/<title>\D*(\d+)\D*<\/title>/);
	if (anotherEdit && anotherEdit[1] != xhr.editId) {
		anotherEdit = anotherEdit[1];
	} else {
		anotherEdit = false;
	}
	var notApproved = queueType == "approving" && xhr.responseText.indexOf('<a class="positive" href="/edit/' + xhr.editId + '/approve') != -1;
	var editEntry = document.querySelector("input[type='hidden'][name$='edit_id'][value='" + xhr.editId + "']");
	if (editEntry) {
		editEntry = editEntry.closest("div.edit-list");
	}
	if (xhr.status == 200 && pendingXHRvote > 0 && !anotherEdit && editEntry && !notApproved) {
		if (callback) callback(editEntry, xhr.editId);
		else removeNode(editEntry);
	} else {
		var errorMessage = "Error while " + queueType + " Edit #" + xhr.editId + " in the background.\n\n";
		if (xhr.status != 200) {
			errorMessage += xhr.status + ": " + xhr.statusText + "\n";
		}
		if (anotherEdit) {
			open("/edit/" + anotherEdit);
			errorMessage += "Got Edit #" + anotherEdit + " instead in return page.\n";
		}
		if (notApproved) {
			errorMessage += "Edit still not approved.\n";
		}
		if (pendingXHRvote < 1) {
			errorMessage += "No votes pending.\n";
		}
		if (editEntry) {
			ninja(null, editEntry, false, "force");
			editEntry.setAttribute("title", errorMessage);
			editEntry.style.setProperty("background-color", "pink");
			editEntry.style.setProperty("cursor", "help");
			editEntry.style.setProperty("display", "block");
		} else {
			open("/edit/" + xhr.editId);
			errorMessage += "Edit block not found.\n";
			alert(errorMessage);
		}
	}
	if (pendingXHRvote > 0) {
		updateXHRstat(--pendingXHRvote);
	}
}
function preventLosingUnsavedChanges(event) {
	switch (event.type) {
		case "input":
			editform.removeEventListener("input", preventLosingUnsavedChanges);
			self.addEventListener("beforeunload", preventLosingUnsavedChanges);
			break;
		case "beforeunload":
			var formChanged = false;
			// Check changed votes
			for (var r = 0; r < radiosafe.length; r++) {
				if(radiosafe[r].closest("body") && !radiosafe[r].checked) {
					formChanged = true;
					break;
				}
			}
			// Check typed edit notes
			for (var n = 0, editNotes = editform.querySelectorAll("div.edit-notes textarea.edit-note"); n < editNotes.length; n++) {
				if (editNotes[n].value) {
					formChanged = true;
					break;
				}
			}
			if (formChanged) {
				event.preventDefault();
				return event.returnValue = "There are some unsaved changes.\nAre you sure you want to exit?";
			}
			break;
	}
}
// From mb_NGS-MILESTONE
// Show if edits are pre-NGS (NGS was released on 2011-05-16, last pre-NGS Edit #14459455, first NGS Edit #14459456)
var firstNGSEdit = 14459456; // nikki work edit
j2css.insertRule("div.edit-header.pre-ngs { background-image: url(data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP/MAP///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQAAACwAAAAAEAAQAAACIQyOF8uW2NpTcU1Q7czu8fttGTiK1YWdZISWprTCL9NGBQAh+QQJBQAAACwAAAAAEAAQAAACIIQdqXm9285TEc1QwcV1Zz19lxhmo1l2aXSqD7lKrXMWACH5BAkFAAAALAAAAAAQABAAAAIhRI4Hy5bY2lNxzVDtzO7x+20ZOIrVhZ1khJamtMIv00YFACH5BAkFAAAALAAAAAAQABAAAAIgjA2peb3bzlMRTVDDxXVnPX2XGGajWXZpdKoPuUqtcxYAOw==); }", 0);
if (location.pathname.match(/\/edit\/\d+/)) {
	var edit = document.querySelector("div#content > div.edit-header > h1");
	if (parseInt(edit.textContent.match(/\d+/), 10) < firstNGSEdit) {
		preNGS(edit);
	}
} else {
	var edits = document.querySelectorAll("div.edit-header > h2 > a[href*='/edit/']");
	for (var e = 0; e < edits.length; e++) {
		var edit = parseInt(edits[e].getAttribute("href").match(/\d+$/), 10);
		if (edit < firstNGSEdit) {
			preNGS(edits[e].parentNode);
		}
	}
}
function preNGS(editHeader) {
	editHeader.appendChild(document.createTextNode(" (pre‐NGS)"));
	editHeader.parentNode.classList.add("pre-ngs");
}
function shortcutsRow() {
	return createTag("div", {a: {class: "edit-list"}, s: {border: border}}, [
		createTag("div", {a: {class: "edit-actions c applied"}},
			createTag("div", {a: {class: "voteopts buttons"}, s: {margin: "0", width: "175px"}}, [
				shortcut("1", "Yes"),
				shortcut("0", "No"),
				shortcut("-1", "Abstain"),
				shortcut("-2", "None")
			])
		),
		createTag("div", {a: {class: "edit-details"}, s: {margin: "0", textAlign: "right"}}, [
			createTag("span", {a: {class: "buttons"}}, shortcut("reset-votes", canceltext)),
			text
		])
	]);
}
function shortcut(vote, label) {
	var button = createTag("input", {
		a: {type: "button", value: label, class: "styled-button"},
		s: {float: "none", margin: FF ? "0 3px 0 0" : "0 3px", padding: FF ? "0 2px" : "0 3px"},
		e: {click: function(event) { rangeVote(event, vote); }}
	});
	if (onlySubmitTabIndexed) { button.setAttribute("tabindex", "-1"); }
	return button;
}
function rangeVote(event, vote, min, max) {
	if (vote != "reset-votes") {
		if (event.detail === 1) { // first click
			for (let i = (min ? min + (FF ? 0 : 1) : 0); i < (max ? max + 1 : radios.length); i++) { // FF shift+click label NG
				if (radios[i].getAttribute("value") == vote && !radios[i].checked && !ninja(event, radios[i].closest("div.edit-list")) && (event.shiftKey || notVotedYet(radios[i]))) {
					sendEvent(radios[i], "click");
				}
			}
		} else if (event.detail === 2) { // double click
			sendEvent(submitButton, "click");
		}
	} else { for (let i = 0; i < radiosafe.length; i++) { sendEvent(radiosafe[i], "click"); } }
}
function notVotedYet(radiox) {
	return getParent(radiox, "div", "voteopts").querySelector("input[type='radio'][value='-2']").checked;
}
function findPos(obj) { /* http://www.quirksmode.org/js/findpos.html */
	var curleft = 0, curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while ((obj = obj.offsetParent));
	}
	return {"x": curleft, "y": curtop};
}
function disable(cont, dis) {
	var inputs = cont.querySelectorAll("input, select, textarea, button");
	if (inputs.length > 0) {
		for (let i = 0; i < inputs.length; i++) {
			if (dis) {
				inputs[i].setAttribute("disabled", "disabled");
			} else {
				inputs[i].removeAttribute("disabled");
			}
		}
		return true;
	} else { return false; }
}
function ninja(event, edit, collapse, specificClassName) {
	disable(edit, collapse);
	var ninjaClassName = specificClassName ? specificClassName : "ninja";
	if (collapse != null) {
		var allbutheader = "div.edit-actions, div.edit-notes, div.edit-details";
		var editEntryContent = specificClassName ? [edit] : edit.querySelectorAll(allbutheader);
		if (event && event.detail > 0 && !event.altKey && !event.ctrlKey && !event.shiftKey) {
			if (collapse) {
				for (var i = 0; i < editEntryContent.length; i++) {
					editEntryContent[i].style.setProperty("display", "none");
				}
			} else {
				for (var i = 0; i < editEntryContent.length; i++) {
					editEntryContent[i].classList.remove(userjs + "ninja");
					editEntryContent[i].style.setProperty("display", "block");
				}
			}
		} else {
			for (var i = 0; i < editEntryContent.length; i++) {
				editEntryContent[i].style.setProperty("display", collapse ? "none" : "");
			}
			if (collapse) edit.classList.add(userjs + ninjaClassName);
			else edit.classList.remove(userjs + ninjaClassName);
		}
	} else return edit.classList.contains(userjs + ninjaClassName);
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
		self.removeEventListener("beforeunload", preventLosingUnsavedChanges); // Allow reload (no more edits)
		self.location.reload();
	}
	stat.style.setProperty("display", nbr > 0 ? "block" : "none");
}
function submitShiftKey(event) { submitShift = event.shiftKey; }
function preventDefault(node, eventName) { node.addEventListener(eventName, function(event) { event.preventDefault(); }, false); }
function spreadBackgroundColour(event) {
	if (
		event.target !== event.currentTarget
		&& event.target.tagName == "INPUT"
		&& event.target.getAttribute("type") == "radio"
		&& event.target.getAttribute("name").match(/^enter-vote\.vote\.\d+\.vote$/)
	) {
		setTimeout(function() {
			var actions = getParent(this, "div", "edit-actions");
			if (this.value != -2) {
				actions.style.setProperty("background-color", FF ? FF[this.value] : self.getComputedStyle(getParent(this, "div", "vote")).getPropertyValue("background-color"));
			} else {
				actions.style.removeProperty("background-color");
			}
		}.bind(event.target), 0);
		event.stopPropagation();
	}
}
