// ==UserScript==
// @name         mb. POWER VOTE
// @version      2025.11.17
// @description  musicbrainz.org: Adds some buttons to check all unvoted edits (Yes/No/Abs/None) at once in the edit search page. You can also collapse/expand (all) edits for clarity. A handy reset votes button is also available + Double click radio to vote single edit + range click with shift to vote a series of edits., Hidden (collapsed) edits will never be voted (even if range click or shift+click force vote). Fast approve with edit notes. Prevent leaving voting page with unsaved changes. Add hyperlinks after inline looked up entity green fields.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_POWER-VOTE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_POWER-VOTE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2009-09-14; https://web.archive.org/web/20131103163355/userscripts.org/scripts/show/57765 / https://web.archive.org/web/20141011084007/userscripts-mirror.org/scripts/show/57765
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://github.com/jesus2099/konami-command/raw/45e79077994ef566d0f7f513f8d838c151f1989d/lib/CONTROL-POMME.js?version=2023.2.23
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/[^/]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(open_)?edits\b/
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/edit\/\d+\b/
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/edit\/(open|subscribed(_editors)?)\b/
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/search\/edits\b/
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/user\/[^/]+\/(edits(\/open)?|votes)\b/
// @run-at       document-end
// ==/UserScript==
"use strict";
var userjs = { id: "jesus2099userjs57765" };
var editform = document.querySelector("div#edits > form");
var edit_list = document.querySelectorAll("div#edits > form > div.edit-list");
var search_form = document.querySelector("div#content > form[action='/search/edits']");
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
// - --- - --- - --- - START OF CONFIGURATION - --- - --- - --- -
var showtop = true;
var showbottom = true;
var border = "thin dashed red"; // leave "" for defaults
var onlySubmitTabIndexed = true; // hit tab after typed text or voted directly goes to a submit button
var rangeclick = true; // multiple votes by clicking first vote then shift-clicking last radio in a range
var collapseEdits = true;
var voteColours = true;
// - --- - --- - --- - END  OF  CONFIGURATION - --- - --- - --- -
var FF = /firefox/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent); // FF has bugs
if (FF) { FF = {"1": "#b1ebb0", "0": "#ebb1ba", "-1": "#f2f0a5"}; }
var IS_TOUCH_SCREEN = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
j2css.insertRule("div.edit-list." + userjs.id + "force, div.edit-list." + userjs.id + "ninja > div.edit-actions, div.edit-list." + userjs.id + "ninja > div.entered-from, div.edit-list." + userjs.id + "ninja > div.edit-details, div.edit-list." + userjs.id + "ninja > div.edit-notes { overflow: hidden !important; height: 0 !important; !important; padding: 0 !important; margin: 0 !important; }", 0);
j2css.insertRule("div#" + userjs.id + "xhrstat { position: fixed; top: 0; left: 0; border: 2px solid black; border-width: 0 2px 2px 0; background-color: #ff6; }", 0);
j2css.insertRule("tr.rename-artist-credits." + userjs.id + "yes > th { vertical-align: middle; }", 0);
j2css.insertRule("tr.rename-artist-credits." + userjs.id + "yes > td { color: #f00; font-weight: bolder; font-size: 2em; text-shadow: 1px 1px 0 #663; text-transform: uppercase; }", 0);
j2css.insertRule("/*div#content >*/ form[action='/search/edits'] span." + userjs.id + "-permalink { background-color: #ffc; }", 0);
j2css.insertRule("/*div#content >*/ form[action='/search/edits'] span." + userjs.id + "-permalink[data-gid=''] { font-style: italic; }", 0);
j2css.insertRule("form[action='/edit/enter_votes'] div.voteopts > div.vote > label { user-select: none; }", 0);
// Hide automod “Vote on all edits” feature, because POWER VOTE is better
if (showtop) {
	j2css.insertRule("div.overall-vote { display: none; }", 0);
}
// localisation
var lang = document.querySelector("html[lang]");
lang = lang && lang.getAttribute("lang") || "en";
var texts = {
	de: {
		double_click_to_vote: "doppelklicken Sie, um diese Änderung abzustimmen",
		edit: "Bearbeiten",
		editing_history: "Bearbeitungshistorie",
		open_edits: "Offene Bearbeitungen",
		order_newest_first: "die neuesten zuerst",
		order_oldest_first: "die ältesten zuerst",
		reset_votes: "Stimmen zurücksetzen",
		show_form: "Formular zeigen",
		vote_all: " // Über alle nicht abgestimmten Änderungen abstimmen (" + CONTROL_POMME.shift.label + "Klick für alle) → ",
	},
	en: {
		double_click_to_vote: "double-click to vote this edit",
		edit: "Edit",
		editing_history: "Editing history",
		open_edits: "Open edits",
		order_newest_first: "newest first",
		order_oldest_first: "oldest first",
		reset_votes: "Reset votes",
		show_form: "Show form",
		vote_all: " // Vote on all unvoted edits (" + CONTROL_POMME.shift.label + "click for all) → ",
	},
	fr: {
		double_click_to_vote: "double-cliquer pour voter cette modification",
		edit: "Modifier",
		editing_history: "Historique des modifications",
		open_edits: "Modifications en attente",
		order_newest_first: "les plus récents en premier",
		order_oldest_first: "les plus anciens en premier",
		reset_votes: "Réinitialiser les votes",
		show_form: "Afficher le formulaire",
		vote_all: " // Voter pour toutes les modifications non votées (" + CONTROL_POMME.shift.label + "clic pour toutes) → ",
	},
	it: {
		double_click_to_vote: "fare doppio clic per votare questa modifica",
		edit: "Modifica",
		editing_history: "Cronologia modifiche",
		open_edits: "Modifiche in corso",
		order_newest_first: "prima le più recenti",
		order_oldest_first: "prima le più vecchie",
		reset_votes: "Reimposta voti",
		show_form: "Mostra modulo",
		vote_all: " // Vota per tutte le modifiche non votate (" + CONTROL_POMME.shift.label + "clic per tutte) → ",
	},
	nl: {
		double_click_to_vote: "dubbelklik om deze wijziging te stemmen",
		edit: "Bewerken",
		editing_history: "Alle bewerkingen",
		open_edits: "Open bewerkingen",
		order_newest_first: "nieuwste eerst",
		order_oldest_first: "oudste eerst",
		reset_votes: "Stemmen terugzetten",
		show_form: "Vorm tonen",
		vote_all: " // Stem op alle niet-gestemde wijzigingen (" + CONTROL_POMME.shift.label + "klik voor alles) → ",
	},
	getText: function(key) {
		return this[lang] && this[lang][key] ? this[lang][key] : this.en[key];
	}
};
// Update window title with result count
var edits_found = document.querySelector("#content > .search-toggle > p > strong");
if (
	edits_found
	&& (edits_found = edits_found.textContent)
	&& (edits_found = edits_found.replace(/\D/g, ""))
) {
	document.title = "[" + edits_found + "] " + document.title;
}
// Remind sort order in Search for Edits title
if (edit_list.length > 1) {
	var order;
	if (search_form) {
		order = document.querySelector("div#content form#edit-search select[name='order']").selectedOptions[0].label;
	} else {
		if (
			edit_list[0].querySelector("div.edit-list > div.edit-header > h2 > a[href*='/edit/']").getAttribute("href").match(/\d+$/)[0]
			>
			edit_list[1].querySelector("div.edit-list > div.edit-header > h2 > a[href*='/edit/']").getAttribute("href").match(/\d+$/)[0]
		) {
			order = texts.getText("order_newest_first");
		} else {
			order = texts.getText("order_oldest_first");
		}

	}
	if (order) {
		document.querySelector("#content h1, #content > h2").appendChild(createTag("small", {}, [
			" (",
			createTag("span", {s: {background: "#ffc"}}, order), ")"
		]));
	}
}
if (search_form) {
	// Hide huge edit search form that pushes results off screen
	if (
		location.search // not initial blank edit search form
		&& !location.search.match(/\bform_only=yes\b/) // not form only after Refine click
		&& edit_list.length > 0 // has 1+ results
	) {
		j2css.insertRule("div#content." + userjs.id + "-hide-form > p:nth-of-type(1), div#content." + userjs.id + "-hide-form > p:nth-of-type(2), div#content." + userjs.id + "-hide-form > form#edit-search { display: none; }", 0);
		search_form.parentNode.classList.add(userjs.id + "-hide-form");
		document.querySelector("#content > h1").appendChild(createTag("fragment", {}, [
			" ",
			createTag("button", {a: {title: GM_info.script.name}, s: {background: "#fcf", cursor: "pointer"}, e: {click: function(event) {
				search_form.parentNode.classList.remove(userjs.id + "-hide-form");
				removeNode(event.target);
				scroll_to_first_selected_options();
			}, mouseover: function(event) { event.target.click(); }}}, texts.getText("show_form"))
		]));
	} else {
		var visible_form_waiter = setInterval(function() {
			if (!search_form.querySelector("span.field[style*='display: none']")) {
				clearInterval(visible_form_waiter);
				scroll_to_first_selected_options();
			}
		}, 234);
	}
	// Search form: Add permalinks to searched entities (all except recordings, because of MBS-12560)
	(new MutationObserver(function(mutations, observer) {
		for (var m = 0; m < mutations.length; m++) {
			var span_autocomplete;
			if (
				mutations[m].type === "childList"
				&&
				mutations[m].target.matches("span.autocomplete")
				&&
				mutations[m].target.querySelector("span.autocomplete > input.name.ui-autocomplete-input.lookup-performed ~ input[type='hidden'].id[value]:not([value=''])")
				&&
				(span_autocomplete = mutations[m].target)
				||
				mutations[m].type === "attributes"
				&&
				mutations[m].target === mutations[m].target.parentNode.querySelector("span.autocomplete > input.name.ui-autocomplete-input.lookup-performed ~ input[type='hidden'].id")
				&&
				(span_autocomplete = mutations[m].target.parentNode)
			) {
				var type = span_autocomplete.className.match(/\b(area|artist|editor|event|genre|instrument|label|place|recording|release-group|release|series|work)\b/);
				var gid = span_autocomplete.querySelector("input[type='hidden'].gid").value;
				var id = span_autocomplete.querySelector("input[type='hidden'].id").value;
				var name = span_autocomplete.querySelector("input.name.ui-autocomplete-input.lookup-performed").value;
				if (type && (gid || id) && name) {
					type = type[1];
					if (type == "editor") {
						type = "user";
						gid = escape(name);
					}
					var path = "/" + type + "/" + (gid || id);
					var bonus_links = {
						open_edits: path + "/open_edits",
						editing_history: path + "/edits",
						edit: path + "/edit"
					};
					if (type == "user") {
						bonus_links.open_edits = path + "/edits/open";
						bonus_links.edit = "/admin/user/edit/" + gid;
					}
					var permalink = span_autocomplete.parentNode.querySelector("span." + userjs.id + "-permalink");
					var new_permalink = createTag("span", {a: {class: userjs.id + "-permalink", "data-gid": gid}}, [
						createTag("a", {a: {
							href: path,
							target: "_blank",
							title: GM_info.script.name
						}}, name),
						" <",
						createTag("a", {a: {href: bonus_links.open_edits, title: texts.getText("open_edits"), class: userjs.id + "-permalink"}}, "O"),
						createTag("a", {a: {href: bonus_links.editing_history, title: texts.getText("editing_history"), class: userjs.id + "-permalink"}}, "H"),
						createTag("a", {a: {href: bonus_links.edit, title: texts.getText("edit"), class: userjs.id + "-permalink"}}, "E"),
						">"
					]);
					if (!permalink) {
						span_autocomplete.parentNode.appendChild(new_permalink);
						if (!gid) {
							// When opening a refine search with preloaded entity filters, MBID (gid) is unset
							// Entity page with ID URL redirects 302 to page with MBID URL, fetch MBID from there and finish permalink
							var xhr = new XMLHttpRequest();
							xhr.id = id;
							xhr.type = type;
							xhr.updateGid = function(mbid) {
								var permalink_a = document.querySelector("span." + userjs.id + "-permalink > a[href='/" + this.type + "/" + this.id + "']");
								if (permalink_a) {
									permalink_a.parentNode.parentNode.querySelector("input[type='hidden'].gid").value = mbid;
									// Manual trigger
									permalink_a.parentNode.parentNode.querySelector("span.autocomplete").appendChild(document.createTextNode(" "));
								}
							};
							xhr.addEventListener("readystatechange", function(event) {
								var MBID = this.responseURL.match(new RegExp("/" + this.type + "/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"));
								if (MBID) {
									this.updateGid(MBID[1]);
									this.abort();
								}
							});
							xhr.open("GET", path, true);
							xhr.send(null);
						}
					} else if (permalink.dataset["gid"] != gid) {
						span_autocomplete.parentNode.replaceChild(new_permalink, permalink);
					}
				}
			}
		}
	})).observe(search_form, {childList: true, subtree: true, attributes: true, attributeFilter: ["value"]});
	setTimeout(function() {
		// Deferred manual trigger for preloaded entity lookups (sometimes displayed before MutationObserver starts)
		for (var input of search_form.querySelectorAll("span.autocomplete > input.name.ui-autocomplete-input.lookup-performed")) {
			input.parentNode.appendChild(document.createTextNode(" "));
		}
	}, 666);
}
// Edit list
if (editform) {
	userjs.radios = [];
	userjs.radiosafe = [];
	var submitClone, inputs;
	var collapse = ["▼", "◀"];
	userjs.pendingXHRvote = 0;
	// Prevent leaving voting page with unsaved changes
	editform.addEventListener("input", preventLosingUnsavedChanges);
	// Prevent losing background voting queue
	editform.addEventListener("submit", function(event) {
		self.removeEventListener("beforeunload", preventLosingUnsavedChanges); // Allow unload on submit (volontary)
		event.preventDefault();
		if (userjs.pendingXHRvote > 0) {
			if (userjs.submitShift || confirm("GOING BACKGROUND (AJAX)? (or not)\n\n" + userjs.pendingXHRvote + " background vote" + (userjs.pendingXHRvote == 1 ? " is" : "s are") + " pending,\ndo you want to add more votes to this queue?\n\n" + CONTROL_POMME.shift.label + "click on submit to bypass this confirmation next time.")) {
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
	// Warn of destructive “Rename artist credits: Yes” artist merges, big visible red “YES”
	for (let rac = editform.querySelectorAll("tr.rename-artist-credits > td"), r = 0; r < rac.length; r++) {
		if (rac[r].textContent.match(/jah?|yes|s[íì]|oui|voor|kyllä|ναι|はい/i)) {
			rac[r].parentNode.classList.add(userjs.id + "yes");
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
	// Apply visible vote colours on changed votes
	if (voteColours) {
		editform.addEventListener("change", function(event) {
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
		});
	}
	for (let i = 0; i < inputs.length; i++) {
		if (onlySubmitTabIndexed) { inputs[i].setAttribute("tabindex", "-1"); } // remove keyboard navigation from vote radio buttons (good idea?)
		userjs.radios.push(inputs[i]);
		// Apply visible vote colours on loaded edits
		if (voteColours && inputs[i].checked && inputs[i].value != -2) {
			setTimeout(function() {
				sendEvent(this, "change");
			}.bind(inputs[i]), 0);
		}
		// Double click to vote single edits
		var labinput = getParent(inputs[i], "label") || inputs[i];
		labinput.setAttribute("title", texts.getText("double_click_to_vote"));
		labinput.addEventListener("dblclick", function(event) {
			var edit = this.closest("div.edit-list");
			var vote = (this.querySelector("input[type='radio']") || this).value;
			var editId = edit.querySelector("input[type='hidden'][name$='edit_id']");
			if (edit && vote && editId) {
				queueVote(edit, editId.value, vote);
			}
		});
		// Range click
		labinput.addEventListener("click", function(event) {
			var rad = this.querySelector("input[type='radio']");
			if (rangeclick && (rad || this)) {
				if (event[CONTROL_POMME.shift.key] && userjs.lastradio && rad != userjs.lastradio && rad.value === userjs.lastradio.value) {
					rangeclick = false;
					rangeVote(event, rad.value, event[CONTROL_POMME.shift.key], Math.min(userjs.radios.indexOf(rad), userjs.radios.indexOf(userjs.lastradio)), Math.max(userjs.radios.indexOf(rad), userjs.radios.indexOf(userjs.lastradio)));
					rangeclick = true;
					userjs.lastradio = null;
				} else {
					userjs.lastradio = rad;
				}
			}
		}, false);
		if (inputs[i].checked) { userjs.radiosafe.push(inputs[i]); }
	}
	// Display global vote bar when more than 1 votable edit
	if (userjs.radios.length > 4) {
		// init localised vote texts directly from MBS page
		for (var v = 0, votes = ["yes", "no", "abstain", "none"]; v < votes.length; v++) {
			if (!texts[lang]) {
				texts[lang] = {};
			}
			texts[lang][votes[v]] = userjs.radios[v].closest("label").textContent;
		}
		if (showtop) { showtop = editform.insertBefore(shortcutsRow(), editform.firstChild.nextSibling); }
		if (showbottom) { showbottom = editform.insertBefore(shortcutsRow(), editform.lastChild.previousSibling); }
	}
	userjs.submitButton = editform.querySelector("div.row > span.buttons > button");
	userjs.submitButton.addEventListener("click", submitShiftKey, false);
	userjs.submitButton.setAttribute("title", CONTROL_POMME.shift.label + "click for background voting of selected edits");
	// (mass) collapse edit toggles
	if (collapseEdits) {
		for (let ed = 0; ed < edit_list.length; ed++) {
			if (edit_list[ed].querySelector("div.edit-description")) {
				var eheader = edit_list[ed].querySelector("div.edit-header");
				var collexp = document.createElement("div");
				var collexpa = collexp.appendChild(document.createElement("a").appendChild(document.createTextNode(collapse[0])).parentNode);
				collexp.style.setProperty("float", "right");
				collexpa.className = userjs.id;
				if (eheader.querySelectorAll("td.vote-count > div > strong").length === 1) collexpa.classList.add("autoedit");
				collexpa.style.setProperty("cursor", "pointer");
				collexpa.style.setProperty("font-size", "2em");
				preventDefault(collexpa, "mousedown");
				collexpa.setAttribute("title", "collapse same EDITOR edits: " + CONTROL_POMME.ctrl.label.toUpperCase() + "click\n\ncollapse same TYPE edits: " + CONTROL_POMME.ctrl.label.toUpperCase() + CONTROL_POMME.shift.label.toUpperCase() + "click\n\ncollapse " + (collexpa.classList.contains("autoedit") ? "auto" : "same VOTED ") + "edits: " + CONTROL_POMME.ctrl.label.toUpperCase() + CONTROL_POMME.alt.label.toUpperCase() + "click\n\ncollapse ALL edits: " + CONTROL_POMME.shift.label.toUpperCase() + "click");
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
					if (event[CONTROL_POMME.alt.key] && event[CONTROL_POMME.ctrl.key]) {
						if (this.classList.contains("autoedit")) autoedit = true;
						else {
							vote = editheader.parentNode.querySelector(voteCSS);
							if (vote) vote = vote.getAttribute("value");
						}
					} else if (event[CONTROL_POMME.ctrl.key] && event[CONTROL_POMME.shift.key]) {
						var edittype = editheader.getAttribute("class").match(/\W([a-z-]+)$/);
						if (edittype) {
							editheadersel += "." + edittype[1];
						}
					} else if (event[CONTROL_POMME.ctrl.key]) {
						if ((editor = editheader.querySelector(userCSS).getAttribute("href").match(/\/user\/(.+)$/))) {
							editor = editor[1];
						}
					}
					if (event[CONTROL_POMME.alt.key] || event[CONTROL_POMME.ctrl.key] || event[CONTROL_POMME.shift.key]) {
						var others = editform.querySelectorAll(editheadersel + " a." + userjs.id + (autoedit ? ".autoedit" : "") + "[rel='" + (expand ? "expand" : "collapse") + "']");
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
	// If user started scrolling: scroll the page down of the height of inserted top buttons and toolbar, to avoid scroll jumps
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
	}
}
function queueApprove(edit, editId) {
	var xhr = new XMLHttpRequest();
	xhr.editId = editId;
	xhr.addEventListener("load", function(event) {
		checkAfterQueue(this, "approving");
	});
	xhr.open("POST", "/edit/" + editId + "/approve", true);
	updateXHRstat(++userjs.pendingXHRvote);
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
	updateXHRstat(++userjs.pendingXHRvote);
	xhr.send(params);
	ninja(null, edit, true, "force");
}
function checkAfterQueue(xhr, queueType, callback) {
	var anotherEdit = xhr.responseText.match(/<title>\D+(\d+) - MusicBrainz<\/title>/);
	if (anotherEdit && anotherEdit[1] != xhr.editId) {
		anotherEdit = anotherEdit[1];
	} else {
		anotherEdit = false;
	}
	var notApproved = queueType == "approving" && xhr.responseText.indexOf('<a class="positive" href="/edit/' + xhr.editId + "/approve") != -1;
	var editEntry = document.querySelector("input[type='hidden'][name$='edit_id'][value='" + xhr.editId + "']");
	if (editEntry) {
		editEntry = editEntry.closest("div.edit-list");
	}
	if (xhr.status == 200 && userjs.pendingXHRvote > 0 && !anotherEdit && editEntry && !notApproved) {
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
		if (userjs.pendingXHRvote < 1) {
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
	if (userjs.pendingXHRvote > 0) {
		updateXHRstat(--userjs.pendingXHRvote);
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
			for (var r = 0; r < userjs.radiosafe.length; r++) {
				if (userjs.radiosafe[r].closest("body") && !userjs.radiosafe[r].checked) {
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
if (location.pathname.match(/^\/edit\/\d+/)) {
	// edit
	var edit = document.querySelector("div#content > div.edit-header > h1");
	if (parseInt(edit.textContent.match(/\d+/), 10) < firstNGSEdit) {
		preNGS(edit);
	}
} else {
	// edit list
	var edits = document.querySelectorAll("div.edit-header > h2 > a[href*='/edit/']");
	for (var e = 0; e < edits.length; e++) {
		if (parseInt(edits[e].getAttribute("href").match(/\d+$/), 10) < firstNGSEdit) {
			preNGS(edits[e].parentNode);
		}
	}
}
function preNGS(editHeader) {
	editHeader.appendChild(document.createTextNode(" (pre‐NGS)"));
	editHeader.parentNode.classList.add("pre-ngs");
}
function shortcutsRow() {
	var vote_all_text = texts.getText("vote_all");
	if (IS_TOUCH_SCREEN) {
		vote_all_text = vote_all_text.replace(new RegExp(CONTROL_POMME.shift.label.replace("+", "\\+") + "[clik]+\\b"), "long touch");
	}
	return createTag("div", {a: {class: "edit-list"}, s: {border: border}}, [
		createTag("div", {a: {class: "edit-actions c applied"}},
			createTag("div", {a: {class: "voteopts buttons"}}, [
				shortcut("1", texts.getText("yes")),
				shortcut("0", texts.getText("no")),
				shortcut("-1", texts.getText("abstain")),
				shortcut("-2", texts.getText("none"))
			])
		),
		createTag("div", {a: {class: "edit-details"}, s: {margin: "0", textAlign: "right"}}, [
			createTag("span", {a: {class: "buttons"}}, shortcut("reset-votes", texts.getText("reset_votes"))),
			vote_all_text
		])
	]);
}
function shortcut(vote, label) {
	var button = createTag("input", {
		a: {type: "button", value: label, class: "styled-button"},
		s: {float: "none", margin: FF ? "0 3px 0 0" : "0 3px", padding: FF ? "0 2px" : "0 3px"},
		e: {click: function(event) { rangeVote(event, vote, event[CONTROL_POMME.shift.key]); }}
	});
	if (IS_TOUCH_SCREEN) {
		onLongPress(button, function(event) { rangeVote(event, vote, true); });
	}
	if (onlySubmitTabIndexed) { button.setAttribute("tabindex", "-1"); } // remove keyboard navigation from mass vote buttons (good idea?)
	return button;
}
function rangeVote(event, vote, force, min, max) {
	if (vote != "reset-votes") {
		if (event.detail < 2) { // first click (1) or touch (0)
			for (let i = (min ? min + (FF ? 0 : 1) : 0); i < (max ? max + 1 : userjs.radios.length); i++) { // FF shift+click label NG
				if (userjs.radios[i].getAttribute("value") == vote && !userjs.radios[i].checked && !ninja(event, userjs.radios[i].closest("div.edit-list")) && (force || notVotedYet(userjs.radios[i]))) {
					sendEvent(userjs.radios[i], "click");
				}
			}
		} else if (event.detail === 2) { // double click
			sendEvent(userjs.submitButton, "click");
		}
	} else { for (let i = 0; i < userjs.radiosafe.length; i++) { sendEvent(userjs.radiosafe[i], "click"); } }
}
function notVotedYet(radiox) {
	return getParent(radiox, "div", "voteopts").querySelector("input[type='radio'][value='-2']").checked;
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
	var ninjaClassName = specificClassName ? specificClassName : "ninja";
	if (typeof collapse != "undefined") {
		disable(edit, collapse);
		var allbutheader = "div.edit-actions, div.edit-notes, div.edit-details";
		var editEntryContent = specificClassName ? [edit] : edit.querySelectorAll(allbutheader);
		for (var i = 0; i < editEntryContent.length; i++) {
			editEntryContent[i].style.setProperty("display", collapse ? "none" : "");
		}
		if (collapse) edit.classList.add(userjs.id + ninjaClassName);
		else edit.classList.remove(userjs.id + ninjaClassName);
	} else return edit.classList.contains(userjs.id + ninjaClassName);
}
function updateXHRstat(nbr) {
	var stat = document.getElementById(userjs.id + "xhrstat");
	if (!stat) {
		stat = document.body.appendChild(document.createElement("div"));
		stat.setAttribute("id", userjs.id + "xhrstat");
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
function submitShiftKey(event) { userjs.submitShift = event[CONTROL_POMME.shift.key]; }
function preventDefault(node, eventName) { node.addEventListener(eventName, function(event) { event.preventDefault(); }, false); }
function scroll_to_first_selected_options() {
	// Scroll multi select to make first selected option visible
	var multiselects = search_form.querySelectorAll("select[multiple]");
	for (var s = 0; s < multiselects.length; s++) {
		var multiselect_size = multiselects[s].getAttribute("size");
		if (multiselect_size < multiselects[s].options.length) {
			var first_selected_option = multiselects[s].querySelector("option[selected]");
			if (first_selected_option && first_selected_option.index >= multiselect_size) {
				var original_scroll = {x: scrollX, y: scrollY};
				first_selected_option.scrollIntoView({block: "center", behavior: "instant"});
				scroll(original_scroll.x, original_scroll.y);
			}
		}
	}
}
function onLongPress(element, callback) {
	// https://stackoverflow.com/a/60207895/2236179
	let timer;
	element.addEventListener("touchstart", function(event) {
		timer = setTimeout(function() {
			timer = null;
			callback(event);
		}, 500);
	});
	function cancel() {
		clearTimeout(timer);
	}
	element.addEventListener("touchend", cancel);
	element.addEventListener("touchcancel", cancel);
	element.addEventListener("touchmove", cancel);
}
