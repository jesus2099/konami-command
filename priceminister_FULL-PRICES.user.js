// ==UserScript==
// @name         priceminister. FULL PRICES
// @version      2015.6.4.1626
// @changelog    https://github.com/jesus2099/konami-command/commits/master/priceminister_FULL-PRICES.user.js
// @description  Affiche les prix totaux (incl. frais de port)
// @supportURL   https://github.com/jesus2099/konami-command/labels/priceminister_FULL-PRICES
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/priceminister_FULL-PRICES.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/priceminister_FULL-PRICES.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-08-14
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://www.priceminister.com/offer/buy/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var prix = document.querySelectorAll("table.advertList ul.priceInfos");
	for (var p = 0; p < prix.length; p++) {
		var total = { tag: prix[p].querySelector("li.price") };
		var fdp = { tag: prix[p].querySelector("li.shipping") };
		if (fdp.tag && total.tag) {
			total.tag.setAttribute("title", total.tag.textContent + " " + fdp.tag.textContent);
			total.valuetag = total.tag.querySelector("b");
			if (total.valuetag) total.value = total.valuetag.textContent.match(/[\d,\.]+/);
			fdp.valuetag = fdp.tag.querySelector("b.value, span[class*='value']");
			if (fdp.valuetag) fdp.value = fdp.valuetag.textContent.match(/[\d,\.]+/);
			if (!fdp.tag.classList.contains("freeShipping") && fdp.value && total.value) {
				var normal = (""+fdp.value).match(/,/);
				if (normal) {
					total.value = (""+total.value).replace(",", ".");
					fdp.value = (""+fdp.value).replace(",", ".");
				}
				total.value = parseFloat(total.value);
				fdp.value = parseFloat(fdp.value);
				var calc = (total.value + fdp.value).toFixed(2);
				if (normal) calc = (""+calc).replace(".", ",");
				total.valuetag.replaceChild(document.createTextNode(calc + total.valuetag.textContent.substr(-2)), total.valuetag.firstChild);
				total.tag.style.setProperty("text-decoration", "underline");
				total.tag.style.setProperty("cursor", "help");
				fdp.tag.replaceChild(document.createTextNode("incl. "), fdp.tag.firstChild);
			}
		}
	}
})();