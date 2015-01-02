// ==UserScript==
// @name         openuserjs. CODE VIEW HEIGHT FIX
// @version      2015.1.2.1111
// @description  openuserjs.org. Source code tab height fix (for Opera 12 and other css "calc" and "vh" unit unabled browsers)
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/openuserjs_CODE-VIEW-HEIGHT-FIX.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/openuserjs_CODE-VIEW-HEIGHT-FIX.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-06-06
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      *://openuserjs.org/scripts/*/*/source
// @exclude      *//*/openuserjs.org/*
// @run-at       document-end
// ==/UserScript==
"use strict";
var editor = document.querySelector("pre#editor");
if (editor) {
	var minHeight = getComputedStyle(editor).getPropertyValue("min-height");
	if (minHeight && (minHeight = minHeight.match(/(\d+)px/)) && (minHeight = parseInt(minHeight[1], 10)) && editor.offsetHeight <= minHeight) {
		var margins = document.getElementsByTagName("head")[0].querySelector("style");
		if (margins && (margins = margins.textContent.match(/#editor[^}]+height: calc\(100vh\s*-\s*(\d+)px\);/)) && (margins = parseInt(margins[1], 10))) {
			editor.style.setProperty("height", (document.documentElement.clientHeight - margins) + "px");
		}
	}
}