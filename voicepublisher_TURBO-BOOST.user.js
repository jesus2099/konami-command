// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2024.2.6
// @description  Scroll active folder into view; Collapse/expand all sites (ctrl+click); Make versions clickable in Applications (sites) page; Download audio folders as named zip files; Call Details improvements; Pagination intuitive scroll; Shortcut to Application Codes; Show current page title in window/tab title; Copy welcome audio duration in Fetch
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
		application_codes: "Application Codes",
		copy: "Copy",
		copy_duration: "Copy duration",
		download: "Download ",
		enter_to_submit: "Press Enter to submit",
		no_changes: "No changes",
	},
	fr: {
		application_codes: "Codes d’application",
		copy: "Copier",
		copy_duration: "Copier la durée",
		download: "Télécharger ",
		enter_to_submit: "Appuyez sur Entrée pour valider",
		no_changes: "Aucun changement",
	}
}[typeof I18n != "undefined" ? I18n.lang : "en"];

// Handle normal browsing page loads
scroll_active_folder_into_view();
collapse_expand_all_sites();
make_versions_clickable();
download_audio_folders();
call_details_improvements();
pagination_intuitive_scroll();
// all_time_complete_months();
go_to_application_codes();
show_script_is_running();
set_window_title();
copy_audio_duration();
// Handle XHR style browsing :-/
(new MutationObserver(function(mutations, observer) {
	for (var m = 0; m < mutations.length; m++) {
		if (mutations[m].type === "childList") {
			for (var a = 0; a < mutations[m].addedNodes.length; a++) {
				if (mutations[m].addedNodes[a].matches("body")) {
					// body removed and re-added
					scroll_active_folder_into_view();
					collapse_expand_all_sites();
					make_versions_clickable();
					download_audio_folders();
					call_details_improvements();
					pagination_intuitive_scroll();
					// all_time_complete_months();
					go_to_application_codes();
					set_window_title();
					copy_audio_duration();
				}
			}
		}
	}
})).observe(document.querySelector("html"), {childList: true});


function show_script_is_running() {
	var avatar = document.querySelector("nav#topbar div.user-dropdown > span.avatar > span.initials");
	if (avatar) {
		userjs.css.insertRule("nav#topbar div.user-dropdown > span.avatar > span.initials { color: black !important; background-color: #fcf !important; }", 0);
		userjs.css.insertRule("nav#topbar div.user-dropdown > span.avatar { background-color: purple !important; }", 0);
		avatar.parentNode.parentNode.setAttribute("title", userjs.name + " version " + GM_info.script.version + " is running…");
	}
}


// ------------------------------
// Scroll active folder into view
// ------------------------------
function scroll_active_folder_into_view() {
	var active_folder = document.querySelector("div.sidebar-content-body ul > li.active:not(.default)");
	if (active_folder) {
		userjs.css.insertRule("div.sidebar-content-body ul > li.active:not(.default) > a { background-color: #fcf; }", 0);
		userjs.css.insertRule("div.sidebar-content-body ul > li.manageable.active:not(.default) > a { background-color: #ccc; }", 0);
		userjs.css.insertRule("div.sidebar-content-body ul > li.tested.active:not(.default) > a { background-color: #fc6; }", 0);
		userjs.css.insertRule("div.sidebar-content-body ul > li.published.active:not(.default) > a { background-color: #cfc; }", 0);
		active_folder.setAttribute("title", userjs.name + " scrolled this active folder into view");
		var sidebar_header_height = document.querySelector("div.sidebar-content-header");
		sidebar_header_height = sidebar_header_height ? sidebar_header_height.offsetHeight : 0;
		active_folder.closest("div.sidebar-content-body").scrollTo({top: active_folder.offsetTop - sidebar_header_height, behavior: "smooth"});
	}
}


// --------------------------------------------------
// Collapse/expand all sites (ctrl+click)
// Unfortunately it does not seem to always work well
// Sometimes some sites remain closed
// --------------------------------------------------

function collapse_expand_all_sites() {
	document.addEventListener("mousedown", function(event) {
		if (event.ctrlKey && event.target.matches(".sidebar .sidebar-content-body > ul.sites > li.site > a.tree-item > span.expand")) {
			var site_selector;
			var old_class;
			var new_class;
			if (event.target.closest("li.site").classList.contains("open-site")) {
				site_selector = ".open-site";
				old_class = "open-site";
				new_class = "closed-site";
			} else {
				site_selector = ":not(.open-site)";
				old_class = "closed-site";
				new_class = "open-site";
			}
			var all_same_state_sites = event.target.closest(".sidebar .sidebar-content-body > ul.sites").querySelectorAll("li.site" + site_selector);
			for (var s = 0; s < all_same_state_sites.length; s++) {
				if (all_same_state_sites[s] !== event.target.closest("li.site")) {
					all_same_state_sites[s].classList.remove(old_class);
					all_same_state_sites[s].classList.add(new_class);
				}
			}
		}
	});
}

// ----------------------------------------------------
// Make versions clickable in Applications (sites) page
// ----------------------------------------------------
function make_versions_clickable() {
	if (location.pathname.match(/^\/sites/)) {
		document.addEventListener("mouseover", function (event) {
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
						event.target.parentNode.replaceChild(createTag("a", {a: {href: version_link.getAttribute("href"), title: event.target.getAttribute("title"), class: event.target.getAttribute("class"), dataSort: event.target.getAttribute("data-sort")}}, event.target.textContent), event.target);
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
function all_time_complete_months_old_good_except_readonly_shadow_root() {
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
function all_time_complete_months_new_bad() {
	var date_picker = document.querySelector("form#datebar-form div#datepicker");
	addAfter(createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		var min_date = new Date(date_picker.getAttribute("data-datepicker-min-date-value"));
		if (min_date.getUTCDate() !== 1) {
			min_date = new Date(min_date.getUTCFullYear(), min_date.getUTCMonth() + 1);
		}
		console.log(min_date);
		date_picker.setAttribute("data-datepicker-date-from-value", "2022-08-01 00:00:00");
		var max_date = new Date(date_picker.getAttribute("data-datepicker-max-date-value"));
		if (max_date.getUTCMonth() ===  new Date(max_date + 60 * 1000).getUTCMonth()) {
			max_date = new Date(new Date(max_date.getUTCFullYear(), max_date.getUTCMonth()) - 1);
		}
		console.log(max_date);
		date_picker.setAttribute("data-datepicker-date-to-value", "2023-06-30 23:59:59");
	}}}, "Full months"), date_picker);
}


// -----------------------------
// Shortcut to Application Codes
// -----------------------------
function go_to_application_codes() {
	var hash = "application_codes";
	var next_menu_item = document.querySelector("nav#topbar li.dropdown-profile > ul.dropdown-menu > li.divider");
	userjs.css.insertRule("nav#topbar ul.nav li." + hash + " a { color: purple; }", 0);
	userjs.css.insertRule("nav#topbar ul.nav li." + hash + " a:hover { background-color: #fcf; }", 0);
	if (next_menu_item) {
		var pre_production = document.querySelector("div.sidebar-content-body > ul > li#site_7865 > ul.site_versions > li.site-version.published > a");
		pre_production = pre_production ? pre_production.getAttribute("href").match(/svid=(\d+)/)[1] : "63113";
		next_menu_item.parentNode.insertBefore(createTag("li", {a: {class: hash}}, createTag("a", {a: {href: "/pages/list?svid=" + pre_production + "?rand=" + Math.random().toString().replace(/\D/, "") + "#" + hash}}, texts.application_codes)), next_menu_item);
	}
	if (location.pathname == "/pages/list" && location.hash == "#" + hash) {
		downloading();
		waitForElement("div#pages_table_filter span.dataTable-filter-clear", function(clear_button) { clear_button.click(); });
		waitForElement("tr[id^='voicexml_page_'] > td.actions > a[rel='edit']", function(edit_button) { location.replace(edit_button.getAttribute("href")); });
	}
}


// -------------------------------------------
// Show current page title in window/tab title
// -------------------------------------------
function set_window_title() {
	var page_title = document.querySelector("ul.bdcrumbs > li:last-of-type > a");
	if (page_title) {
		var site = page_title.parentNode.parentNode.querySelector("li > a[href^='/sites/']");
		var version = page_title.parentNode.parentNode.querySelector("li > a[href^='/pages?svid=']");
		var window_title = page_title.textContent + (site ? " - " + site.textContent + (version ? " “" + version.textContent + "”" : "") : "");
		setTimeout(function() { document.title = window_title + " - " + document.title; }, 123);
	}
}


// --------------------------------------------------------------------
// Copy welcome audio duration in Fetch Audio Minimum and Fetch Timeout
// --------------------------------------------------------------------
function copy_audio_duration() {
	if (location.pathname.match(/^\/connector_pages\/\d+\/edit$/)) {
		var page_name = document.querySelector("input#connector_page_name");
		var connector_page_audio = document.querySelector(".connector_page_audio");
		var audio_duration = document.querySelector(".connector_page_audio .audio-duration");
		var fetch_audio_delay = document.querySelector("input#connector_page_audio_time_before");
		var fetch_audio_minimum = document.querySelector("input#connector_page_audio_time_min");
		var fetch_timeout = document.querySelector("input#connector_page_fetchtimeout");
		if (
			page_name && page_name.value.match(/^w_welcome_identification_..$/)
			&& audio_duration && audio_duration.textContent.match(/(\d)+s/) && (audio_duration = parseInt(audio_duration.textContent.match(/(\d)+s/)[1]))
			&& fetch_audio_delay
			&& fetch_audio_minimum
			&& fetch_timeout
		) {
			connector_page_audio.appendChild(createTag("a", {s: {background: "#ffc"}, e: {click: function(event) {
				var changes = 0;
				var new_value = 10;
				if (parseInt(fetch_audio_delay.value) !== new_value) {
					fetch_audio_delay.parentNode.insertBefore(createTag("span", {s: {background: "#ffc", textDecoration: "line-through"}}, fetch_audio_delay.value), fetch_audio_delay);
					fetch_audio_delay.value = new_value;
					changes += 1;
				}
				new_value = audio_duration * 1000;
				if (parseInt(fetch_audio_minimum.value) !== new_value) {
					fetch_audio_minimum.parentNode.insertBefore(createTag("span", {s: {background: "#ffc", textDecoration: "line-through"}}, fetch_audio_minimum.value), fetch_audio_minimum);
					fetch_audio_minimum.value = new_value;
					changes += 1;
				}
				new_value = parseInt(fetch_audio_minimum.value) + 4000;
				if (parseInt(fetch_timeout.value) !== new_value) {
					fetch_timeout.parentNode.insertBefore(createTag("span", {s: {background: "#ffc", textDecoration: "line-through"}}, fetch_timeout.value), fetch_timeout);
					fetch_timeout.value = parseInt(fetch_audio_minimum.value) + 4000;
					changes += 1;
				}
				fetch_timeout.focus();
				fetch_timeout.parentNode.appendChild(createTag("div", {s: {background: "#ffc"}}, changes > 0 ? texts.enter_to_submit : texts.no_changes));
			}}}, texts.copy_duration));
		}
	}
}
