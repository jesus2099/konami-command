// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2023.7.17
// @description  Work-around 1 bug; Scroll active folder into view; Make versions clickable in Applications (sites) page; Download audio folders as named zip files; Call Details improvements; Pagination intuitive scroll
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/voicepublisher_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/voicepublisher_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-05-16
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_download
// @match        *://*.voicepublisher.net/*
// @run-at       document-ready
// ==/UserScript==
/* global I18n */ // eslint no-undef exception
"use strict";

var userjs = {
	id: GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-"),
	name: GM_info.script.name,
	css: document.createElement("style")
};
userjs.css.setAttribute("type", "text/css");
document.head.appendChild(userjs.css);
userjs.css = userjs.css.sheet;

var texts = {
	en: {
		copy: "Copy",
		download: "Download ",
		call_history_crash_bug: userjs.name + " fix to call History change app crash bug",
	},
	fr: {
		copy: "Copier",
		download: "Télécharger ",
		call_history_crash_bug: userjs.name + " contourne le plantage du changement d’application dans le Call History",
	}
}[typeof I18n != "undefined" ? I18n.lang : "en"];

// Handle normal browsing page loads
scroll_active_folder_into_view();
workaround_cookie_overflow_bug();
make_versions_clickable();
download_audio_folders();
call_details_improvements();
pagination_intuitive_scroll();
// all_time_complete_months();
// Handle XHR style browsing :-/
(new MutationObserver(function(mutations, observer) {
	for (var m = 0; m < mutations.length; m++) {
		if (mutations[m].type === "childList") {
			for (var a = 0; a < mutations[m].addedNodes.length; a++) {
				if (mutations[m].addedNodes[a].matches("body")) {
					// body removed and re-added
					scroll_active_folder_into_view();
					workaround_cookie_overflow_bug();
					make_versions_clickable();
					download_audio_folders();
					call_details_improvements();
					pagination_intuitive_scroll();
					// all_time_complete_months();
				}
			}
		}
	}
})).observe(document.querySelector("html"), {childList: true});


// ------------------------------
// Scroll active folder into view
// ------------------------------
function scroll_active_folder_into_view() {
	var active_folder = document.querySelector("div.sidebar-content-body > ul > li.active");
	if (active_folder) {
		userjs.css.insertRule("div.sidebar-content-body > ul > li.active > a { background-color: #fcf; }", 0);
		active_folder.setAttribute("title", userjs.name + " scrolled this active folder into view");
		active_folder.scrollIntoView();
	}
}


// ticket 110349 workaround --------------------------------------------
// Work-around “Call History change app crash” aka “cookie overflow” bug
// ---------------------------------------------------------------------
function workaround_cookie_overflow_bug() {
	if (location.pathname == "/calls") {
		var selected_application = document.querySelector("#select2-chosen-1");
		if (selected_application) {
			// STEP 1: Save last clicked application, in case crash happens
			self.addEventListener("beforeunload", function (event) {
				localStorage.setItem(userjs.id + "_last_application", selected_application.textContent);
			});
			// STEP 3: Detect crash flag and handle post-crash
			if (localStorage.getItem(userjs.id + "_call_history_crash") === "1") {
				localStorage.removeItem(userjs.id + "_call_history_crash");
				replaceChildren(document.createTextNode(localStorage.getItem(userjs.id + "_last_application")), selected_application);
				userjs.css.insertRule("#select2-chosen-1[title] { background-color: #fcf; text-decoration: underline dotted; }", 0);
				selected_application.setAttribute("title", texts.call_history_crash_bug);
				(new MutationObserver(function(mutations, observer) {
					if (mutations[0].target.hasAttribute("title")) {
						mutations[0].target.removeAttribute("title");
					}
				})).observe(selected_application, {childList: true});
			}
		} else {
			// STEP 2: Detect crash, flag and go back
			if (
				document.body.childNodes.length === 1
				&& document.querySelectorAll("body > div.dialog > div > h1").length === 1
				&& document.querySelectorAll("body > div.dialog > div + p").length === 1
			) {
				localStorage.setItem(userjs.id + "_call_history_crash", "1");
				replaceChildren(createTag("h1", {s: {marginTop: "40px"}}, texts.call_history_crash_bug), document.body);
				history.back();
			}
		}
	}
}


// ----------------------------------------------------
// Make versions clickable in Applications (sites) page
// ----------------------------------------------------
function make_versions_clickable() {
	if (location.pathname.match(/^\/sites/)) {
		userjs.css.insertRule("table#sites_table > tbody > tr.site > td.string > span.label { cursor: pointer; border-bottom: 2px solid purple; }", 0);
		document.addEventListener("click", function (event) {
			if (event.target.matches("table#sites_table > tbody > tr.site > td.string > span.label")) {
				var site = event.target.parentNode.parentNode.getAttribute("id");
				var status = null;
				if (event.target.classList.contains("label-success")) {
					status = "published";
				} else if (event.target.classList.contains("label-warning")) {
					status = "tested";
				}
				if (site && status) {
					var version_link = document.querySelector("div.sidebar-content-body > ul.sites > li#" + site + " > ul.site_versions > li.site-version." + status + " > a[href^='/pages?svid=']");
					if (version_link && version_link.textContent == event.target.textContent) {
						version_link.click();
					}
				}
			}
		});
	}
}


// ticket 110499 bonus -----------------------------------------------------
// Download audio folders as named zip files, including from the folder list
// -------------------------------------------------------------------------
function download_audio_folders() {
	setTimeout(function() {
		var app;
		if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
			// inside an application audio folder
			var ExportAllButton = document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right > a.btn[href$='export_all']");
			if (ExportAllButton) {
				app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
				app = {
					id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
					name: app.textContent.trim()
				};
				replaceChildren(
					createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
						download(app.id, app.name);
					}}}, [texts.download, createTag("b", {s: {color: "black", background: "#fdf", padding: "0 4px"}}, app.name), ".zip"]),
					ExportAllButton.parentNode
				);
			}
		} else if (location.pathname == "/audio_folders") {
			// on the list of application audio folders
			setInterval(function() {
				for (
					var audioFolderPencils = document.querySelectorAll("div#main_frame table#audio_folders_table > tbody > tr > td.actions > a[href$='/edit']"), p = 0;
					p < audioFolderPencils.length; p++
				) {
					var file_count = audioFolderPencils[p].closest("tr").querySelector("tr > td:nth-child(3)");
					if (
						file_count
						&& (file_count = parseInt(file_count.textContent.trim()))
						&& !isNaN(file_count)
						&& file_count <= 3088 // file export_all limitation, per ticket 110499
					) {
						if (!audioFolderPencils[p].parentNode.querySelector("a." + userjs.id + "_export")) {
							app = audioFolderPencils[p].parentNode.closest("tr").querySelector("a[href$='/audios']");
							audioFolderPencils[p].parentNode.insertBefore(
								createTag("a", {a: {title: texts.download + app.textContent.trim() + ".zip", class: userjs.id + "_export"}, e: {click: function(event) {
									app = event.target.closest("tr").querySelector("a[href$='/audios']");
									download(app.getAttribute("href").match(/\d+/)[0], app.textContent.trim());
								}}}, createTag("span", {a: {class: "fa fa-fw fa-download"}, s: {backgroundColor: "#fcf"}})),
								audioFolderPencils[p]
							);
						}
					}
				}
			}, 500);
		}
	}, 666);
}
function download(appID, appName) {
	downloading();
	GM_download({
		url: "/audio_folders/" + appID + "/audios/export_all",
		name: appName + ".zip",
		onload: downloading
	});
}
function downloading(event) {
	if (event) {
		// callback when loading ends
		document.body.removeChild(document.querySelector("div#" + userjs.id + "_loading"));
	} else {
		// manual call when loading starts
		document.body.appendChild(createTag("div", {a: {id: userjs.id + "_loading"}}, [
			createTag("div", {
				s: {position: "fixed", background: "#303", opacity: ".2", top: "0px", left: "0px", width: "100%", height: "100%", zIndex: "77"}
			}),
			createTag("div", {
				a: {class: "dataTables_processing "},
				s: {position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textShadow: "0 0 8px white", zIndex: "100"}
			}, I18n.dataTables.language.loadingRecords)
		]));
	}
}


// -------------------------
// Call Details improvements
// -------------------------
function call_details_improvements() {
	if (location.pathname == "/calls") {
		// double click call to open call details
		waitForElement("table#big_data_listings_call_history_listings_table > tbody", function(calls) {
			calls.addEventListener("dblclick", function(event) {
				event.target.closest("tr").querySelector("td.actions i").click();
			});
		});
		// allow call details nice copy with layout for pasting in document or e-mail
		waitForElement("div#callDetailsModal div.modal-footer", function(element) {
			// Ease selection: click anything to select it all
			element.parentNode.addEventListener("click", function (event) {
				self.getSelection().selectAllChildren(event.target);
			});
			// Copy All button
			element.appendChild(createTag("button", {a: {class: "btn btn-info"}, e: {click: function (event) {
				var call_details = document.querySelector("div#callDetailsModal");
				if (call_details) {
					var call_information = call_details.querySelector("fieldset.call_information");
					if (!call_information.classList.contains(GM_info.script.author)) {
						var information_labels = call_details.querySelectorAll("fieldset.call_information div.group > label + span");
						for (var l = 0; l < information_labels.length; l++) {
							information_labels[l].insertBefore(document.createTextNode("\u00a0: "), information_labels[l].firstChild);
						}
						var route_items = call_details.querySelectorAll("fieldset.call_route > div > span.item");
						for (var i = 0; i < route_items.length; i++) {
							route_items[i].firstChild.replaceChild(document.createTextNode(route_items[i].firstChild.textContent.replace(/[:\s]*$/, "")), route_items[i].firstChild.firstChild);
							route_items[i].firstChild.nextSibling.insertBefore(document.createTextNode("\u00a0: "), route_items[i].firstChild.nextSibling.firstChild);
							route_items[i].appendChild(createTag("br"));
						}
						call_information.classList.add(GM_info.script.author);
					}
				}
				getSelection().selectAllChildren(document.querySelector("div#callDetailsModal"));
				document.execCommand("copy");
				getSelection().removeAllRanges();
			}}}, texts.copy));
		});
	}
}


// ---------------------------
// Pagination intuitive scroll
// ---------------------------
function pagination_intuitive_scroll() {
	document.addEventListener("click", function(event) {
		if (event.target.closest("li.paginate_button:not(.disabled)")) {
			var main_frame = document.querySelector("div:not(.sidebar) > div.resource-list-container div#main_frame");
			main_frame.scrollTo(0, event.target.closest("li.paginate_button:not(.disabled).previous") ? main_frame.scrollHeight : 0);
		}
	});
}


// --------------------------------------
// Stats: All time (only complete months)
// --------------------------------------
function all_time_complete_months() {
	waitForElement("span.easepick-wrapper", function(_date_picker) {
		var date_picker = _date_picker.shadowRoot;
		if (date_picker) {
			var all_time_preset = date_picker.querySelector("button.preset-button[data-start][data-end]:last-of-type");
			if (all_time_preset) {
				var start = new Date(parseInt(all_time_preset.dataset.start));
				if (start.getUTCDate() !== 1) {
					start = new Date(start.getUTCFullYear(), start.getUTCMonth());
				}
				var end = new Date(parseInt(all_time_preset.dataset.end));
				if (end.getUTCMonth() ===  new Date(parseInt(all_time_preset.dataset.end) + 60 * 1000).getUTCMonth()) {
					end = new Date(new Date(end.getUTCFullYear(), end.getUTCMonth() + 1) - 1);
				}
				// Shadow DOM manipulation is currently not possible: https://github.com/violentmonkey/violentmonkey/issues/1852
				// TODO: Finish this if it becomes possible
				// all_time_preset.dataset.start = start;
				// all_time_preset.dataset.end = end;
				// all_time_preset.appendChild(document.createTextNode(" " + start));
				// addAfter(createTag("a", {}, start + " - " + end), all_time_preset);
				// date_picker.innerHTML = date_picker.innerHTML.replace(">All time</button>", ">All time</button>" +
				// 	'<button class="preset-button unit" data-start="' + start.getTime() + '" data-end="' + /*end.getTime()*/ 1690840700000 + '">All time (fullmonths)</button>'
				// );
			}
		}
	});
}
