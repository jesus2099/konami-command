// ==UserScript==
// @name         NUMBERS
// @version      2016.8.12
// @changelog    https://github.com/jesus2099/konami-command/commits/master/lib/NUMBERS.js
// @description  Library of cool stuff revolving around NUMBERS — FOR MY OWN USE — Frequent API changes. Use it at your own risks.
// @namespace    https://github.com/jesus2099/konami-command
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// ==/UserScript==
"use strict";
function decimalToHexadecimal(decimalNumber) {
	return decimalNumber.toString(16);
}
function hexadecimalToDecimal(hexadecimalNumber) {
	return parseInt(hexadecimalNumber, 16);
}
