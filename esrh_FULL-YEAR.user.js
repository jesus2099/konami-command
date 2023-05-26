// ==UserScript==
// @name         esrh. FULL YEAR
// @version      2023.5.27
// @description  Affiche les congés sur toute l’année
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/esrh_FULL-YEAR
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/esrh_FULL-YEAR.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2023-05-26; 2018 as bookmarklet
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @include      /^https?:\/\/[ericvhs]{11}\.[fiancer]{9}\.[rf]{2}\//
// @run-at       document-idle
// ==/UserScript==
"use strict";
var year_calendar_path = "/TimeManagFF/Plugs/AFTimeEPlanning/printMPlanPopup.jsp?redirectDate=%year%01&nbMonth=12&btnPrint=IMPRIMAX&btnClose=FERMAY";
var full_year_path_match = (location.pathname + location.search).match(new RegExp("^" + year_calendar_path.replace(/\./g, "\\.").replace(/\?/g, "\\?").replace("%year%", "(\\d{4})")));
if (full_year_path_match) {
	var header = document.getElementById("AFTimeEPlanning_textMY");
	if (header) {
		// show user when page is loading other year
		self.addEventListener("beforeunload", function(event) {
			document.body.style.setProperty("cursor", "progress");
			document.body.style.setProperty("opacity", ".12");
		});
		// display year in main title, clickable to change year
		header.replaceChild(document.createTextNode(full_year_path_match[1]), header.firstChild);
		header.style.setProperty("font-size", "1.5em");
		header.style.setProperty("color", "black");
		header.style.setProperty("cursor", "pointer");
		header.style.setProperty("border-bottom", "1px solid black");
		header.setAttribute("title", "Changer d’année");
		header.addEventListener("click", function(event) {
			var new_year = prompt("Charger quelle année ?", full_year_path_match[1]);
			if (new_year && new_year.match(/^(\d{2}|\d{4})$/) && new_year !== full_year_path_match[1] && ("20" + new_year) !== full_year_path_match[1]) {
				if (new_year.match(/^\d{2}$/)) {
					new_year = "20" + new_year;
				}
				location.assign(year_calendar_path.replace("%year%", new_year));
			}
		});
		// add previous and next year buttons
		header.parentNode.style.setProperty("color", "grey");
		header.parentNode.insertBefore(createTag("fragment", {}, [year_link(parseInt(full_year_path_match[1]) - 1), " << "]), header);
		header.parentNode.insertBefore(createTag("fragment", {}, [" >> ", year_link(parseInt(full_year_path_match[1]) + 1)]), header.nextSibling);
	}
} else if ((location.pathname + location.search).match(/^\/TimeManagFF\/Core\/default\.jsp\?role=[EM]/)) {
	waitForElement("select#AFTimeEPlanning_newYear", function(new_year) {
		// add button to open FULL YEAR
		new_year.closest("th").nextSibling.appendChild(createTag("a", {a: {class: "btn"}, e: {click: function(event) {
			open(year_calendar_path.replace("%year%", document.querySelector("select#AFTimeEPlanning_newYear").value.trim()));
		}}}, ["VOIR TOUT ", createTag("span", {a: {class: "year"}}, document.querySelector("select#AFTimeEPlanning_newYear").value)]));
		// update button label when new year is selected
		new_year.addEventListener("change", function(event) {
			replaceChildren(document.createTextNode(new_year.value), new_year.closest("th").nextSibling.querySelector("a.btn > span.year"));
		});
	});
}
function year_link(year) {
	return createTag("a", {a: {href: year_calendar_path.replace("%year%", year)}}, year);
}
