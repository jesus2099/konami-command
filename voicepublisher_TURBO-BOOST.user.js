// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2022.5.17
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
// @include      /https?:\/\/next\.voicepublisher\.net\/audio_folders/
// @run-at       document-ready
// ==/UserScript==
"use strict";
var texts = {
	exportAll: {en: "Export all", fr: "Tout exporter"}
}
if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
	// inside an application audio folder
	var ExportAllButton = document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right a.btn[href$='export_all']");
	var DLButton = createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		var app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
		app = {
			id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
			name: app.textContent.trim()
		};
		download(app.id, app.name)
	}}}, ExportAllButton ? ExportAllButton.textContent.trim() : texts.exportAll[I18n.lang]);
	if (ExportAllButton) {
		ExportAllButton.parentNode.replaceChild(DLButton, ExportAllButton);
	} else {
		document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right").appendChild(DLButton);
	}
} else if (location.pathname == "/audio_folders") {
	// above all application audio folders
	setInterval(function() {
		for (
			var audioFolderPencils = document.querySelectorAll("div#main_frame table#audio_folders_table > tbody > tr > td.actions > a[href$='/edit']"), p = 0;
			p < audioFolderPencils.length; p++
		) {
			if (!audioFolderPencils[p].parentNode.querySelector("a.j2export")) {
				audioFolderPencils[p].parentNode.insertBefore(
					createTag("a", {a: {title: texts.exportAll[I18n.lang], class: "j2export"}, e: {click: function(event) {
						var appLink = event.target.closest("tr").querySelector("a[href$='/audios']");
						download(appLink.getAttribute("href").match(/\d+/)[0], appLink.textContent.trim());
					}}}, createTag("span", {a: {class: "glyphicon glyphicon-share-alt"}, s: {backgroundColor: "#fcf"}})),
					audioFolderPencils[p]
				);
			}
		}
	}, 500);
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
	var infoPopup = document.querySelector("div#main_frame div#audios_table_processing");
	if (infoPopup) infoPopup.style.setProperty("visibility", event ? "hidden" : "visible");
	if (event) {
		document.body.removeChild(document.querySelector("div#j2loading"));
	} else {
		document.body.appendChild(createTag("div", {
			a: {id: "j2loading"},
			s: {position: "fixed", background: "#303", opacity: ".2", top: "0px", left: "0px", width: "100%", height: "100%", zIndex: "77"}
		}));
	}
}
