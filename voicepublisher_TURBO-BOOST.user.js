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
var texts = {
	exportAll: {en: "Export all", fr: "Tout exporter"}
}
if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
	var ExportAllButton = document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right a.btn[href$='export_all']");
	var DLButton = createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		var app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
		app = {
			id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
			name: app.textContent.trim()
		};
		downloading();
		GM_download({
			url: "/audio_folders/" + app.id + "/audios/export_all",
			name: app.name + ".zip",
			onload: downloading
		});
	}}}, ExportAllButton ? ExportAllButton.textContent.trim() : texts.exportAll[I18n.lang]);
	if (ExportAllButton) {
		ExportAllButton.parentNode.replaceChild(DLButton, ExportAllButton);
	} else {
		document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right").appendChild(DLButton);
	}
}
function downloading(event) {
	var infoPopup = document.querySelector("div#main_frame div#audios_table_processing");
	infoPopup.style.setProperty("visibility", event ? "hidden" : "visible");
	if (event) {
		document.body.removeChild(document.querySelector("div#j2loading"));
	} else {
		document.body.appendChild(createTag("div", {
			a: {id: "j2loading"},
			s: {position: "fixed", background: "#303", opacity: ".2", top: "0px", left: "0px", width: "100%", height: "100%"}
		}));
	}
}
