// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2022.9.26.1
// @description  Download audio folders as zip files
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/voicepublisher_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/voicepublisher_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-05-16
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_download
// @include      /https?:\/\/(next|nivr)\.voicepublisher\.net\/audio_folders/
// @run-at       document-ready
// ==/UserScript==
"use strict";

/* global I18n */ // eslint no-undef exception

var texts = {
	download: {en: "Download ", fr: "Télécharger "}
};
var app;
if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
	// inside an application audio folder
	app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
	app = {
		id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
		name: app.textContent.trim()
	};
	var toolbox = document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right");
	var ExportAllButton = toolbox.querySelector("a.btn[href$='export_all']");
	var DLButton = createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		download(app.id, app.name);
	}}}, [texts.download[I18n.lang], createTag("b", {s: {color: "black", background: "#fdf", padding: "0 4px"}}, app.name), ".zip"]);
	if (ExportAllButton) {
		toolbox.replaceChild(DLButton, ExportAllButton);
	} else {
		toolbox.appendChild(DLButton);
	}
} else if (location.pathname == "/audio_folders") {
	// on the list of application audio folders
	setInterval(function() {
		for (
			var audioFolderPencils = document.querySelectorAll("div#main_frame table#audio_folders_table > tbody > tr > td.actions > a[href$='/edit']"), p = 0;
			p < audioFolderPencils.length; p++
		) {
			if (!audioFolderPencils[p].parentNode.querySelector("a.j2export")) {
				app = audioFolderPencils[p].parentNode.closest("tr").querySelector("a[href$='/audios']");
				audioFolderPencils[p].parentNode.insertBefore(
					createTag("a", {a: {title: texts.download[I18n.lang] + app.textContent.trim() + ".zip", class: "j2export"}, e: {click: function(event) {
						app = event.target.closest("tr").querySelector("a[href$='/audios']");
						download(app.getAttribute("href").match(/\d+/)[0], app.textContent.trim());
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
	if (event) {
		// callback when loading ends
		document.body.removeChild(document.querySelector("div#j2loading"));
	} else {
		// manual call when loading starts
		document.body.appendChild(createTag("div", {a: {id: "j2loading"}}, [
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
