// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2022.5.16
// @description  Download all audios at once (but still broken)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/voicepublisher_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/voicepublisher_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-05-16
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_download
// @match        *://next.voicepublisher.net/audio_folders/*
// @run-at       document-ready
// ==/UserScript==
"use strict";
var languageCode = {
	"Aucune": "nolang",
	"Dutch (NL)": "nl-NL",
	"English (GB)": "en-GB",
	"French (FR)": "fr-FR",
}
if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
	document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right").appendChild(createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		var app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
		app = {
			id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
			name: app.textContent.trim()
		};
		var audios = document.querySelectorAll("div#main_frame table#audios_table > tbody > tr[id^='audio_']");
		for (
			var audios = document.querySelectorAll("div#main_frame table#audios_table > tbody > tr[id^='audio_']"), a = 0;
			a < audios.length;
			a++
		) {
			var app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']").textContent.trim();
			var audio = audios[a].querySelector("a[data-id][data-title]");
			var lang = languageCode[audios[a].querySelector("tr > td:nth-child(3)").textContent.trim()];
			GM_download({
				// or audio.getAttribute("data-url") for mp3
				url: "/audio/audio_file_2016/" + audio.getAttribute("data-id") + "/" + audio.getAttribute("data-title"),
				name: app + " - " + lang + " - " + audio.getAttribute("data-title"),
				saveAs: false // not yet supported by VM
			});
		}
	}}}, "Download"));
}
