// ==UserScript==
// @name         priceminister. FULL PRICES
// @version      2014.8.14.1555
// @description  Affiche les prix totaux (incl. frais de port)
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/priceminister_FULL-PRICES.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/priceminister_FULL-PRICES.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014.8.14
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
			if (!fdp.tag.className.match(/freeShipping/) && fdp.value && total.value) {
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