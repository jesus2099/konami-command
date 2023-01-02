// ==UserScript==
// @name         gnudb. FIX FREEDB REDIRECT
// @version      2023.1.2
// @description  GnuDb.org: FreeDB.org redirects to GnuDb.org but the path is not corrected (useful for old MB FreeDB import edit notes)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/gnudb_FIX_FREEDB_REDIRECT
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/gnudb_FIX_FREEDB_REDIRECT.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2023-01-02
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/gnudb\.org\/\?cat=(.+)&id=(.+)$/
// @run-at       document-start
// ==/UserScript==
"use strict";
var url_parameters = new URLSearchParams(location.search);
if (url_parameters.get("cat") && url_parameters.get("id")) {
	location.assign(location.protocol + "//" + location.host + "/cd/" + url_parameters.get("cat").trim().substring(0, 2).toLowerCase() + url_parameters.get("id").trim().toLowerCase());
}
