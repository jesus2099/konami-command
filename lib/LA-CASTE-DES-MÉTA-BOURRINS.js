// ==UserScript==
// @name         LA CASTE DES MÉTA‐BOURRINS
// @version      2015.8.12.1503
// @changelog    https://github.com/jesus2099/konami-command/commits/master/lib/LA-CASTE-DES-M%C3%89TA-BOURRINS.js
// @description  Retrieves access to metadata block content.
// @namespace    https://github.com/jesus2099/konami-command
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// ==/UserScript==
"use strict";
/* PRE‐REQUISITE
   -------------
Thou shalt surround thee metadata with those two lines:
var meta = {raw: function() {
// ==UserScript==
// @name         APOCALYPSO
// @version      6.6.6
// …
// @require      https://greasyfork.org/scripts/666-la-caste-des-m%C3%A9ta-bourrins/code/LA-CASTE-DES-M%C3%89TA-BOURRINS.js?version=666&v=6.6.6
// …
// @run-at       world-end
// ==/UserScript==
}};
By design, « // ==UserScript== » line does not *have* to be the first line of file.
*/
if (meta.raw && meta.raw.toString && (meta.raw = meta.raw.toString())) {
	var item, row = /\/\/\s+@(\S+)\s+(.+)/g;
	while ((item = row.exec(meta.raw)) !== null) {
		if (meta[item[1]]) {
			if (typeof meta[item[1]] == "string") {
				meta[item[1]] = [meta[item[1]]];
			}
			meta[item[1]].push(item[2]);
		} else {
			meta[item[1]] = item[2];
		}
	}
}
meta.shortName = meta.name.replace(/^[a-z.\s]*|[a-z.\s]*$/g, "");
