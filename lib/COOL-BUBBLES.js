// ==UserScript==
// @name         COOL BUBBLES
// @version      2016.5.31
// @changelog    https://github.com/jesus2099/konami-command/commits/master/lib/COOL-BUBBLES.js
// @description  Library for displaying bottom right notifications (PHYLACTÈRES À LA COOL)
// @supportURL   https://github.com/jesus2099/konami-command/labels/COOL-BUBBLES
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @namespace    jesus2099/shamo
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-05-31
// @grant        none
// ==/UserScript==
"use strict";
//TODO: add category system
//TODO: insert CSS instead of inline style
function coolBubble(bubble) { // bubble = {message, delay, type = "information, warning, error"}
	if (bubble && typeof bubble.message != "undefined") {
		if (typeof bubble.delay == "undefined") {
			bubble.delay = 5 * 1000; // messages stay onscreen for 5 seconds by default
		}
		var coolID = "jesus2099coolBubble-place";
		var coolPlace = document.getElementById(coolID);
		if (!coolPlace) {
			var coolPlace = document.createElement("div");
			coolPlace.setAttribute("id", coolID);
			coolPlace.style.setProperty("position", "fixed");
			coolPlace.style.setProperty("right", "0");
			coolPlace.style.setProperty("bottom", "0");
			document.body.appendChild(coolPlace);
		}
		var randomID = "_bubble-" + Math.random().toString().substr(2);
		var newBubble = document.createElement("div");
		newBubble.className = randomID;
		if (typeof bubble.type == "undefined") {
			bubble.type = "information";
		}
		var backgroundColour = {
			information: "#9F9",
			warning:     "#FF9",
			error:       "#F99"
		};
		newBubble.style.setProperty("background-color", backgroundColour[bubble.type]);
		newBubble.style.setProperty("border", "1px dashed black");
		newBubble.style.setProperty("margin", "2px");
		newBubble.style.setProperty("padding", "6px");
		if (bubble.message.nodeType) { // for instance a Node.DOCUMENT_FRAGMENT_NODE
			console.log(bubble.message.textContent);
			newBubble.appendChild(bubble.message);
		} else if (typeof bubble.message == "string") {
			console.log(bubble.message);
			newBubble.appendChild(document.createTextNode(bubble.message));
		}
		coolPlace.appendChild(newBubble);
		coolPlace.style.setProperty("width", self.getComputedStyle(coolPlace).getPropertyValue("width")); // keep growing and never shrink
		coolPlace.style.setProperty("display", "block"); // show coolPlace when at least one bubble
		if (bubble.delay > 0) {
			setTimeout(function() {
				var oldBubble = document.querySelector("#" + coolID + " > ." + randomID);
				if (oldBubble) {
					try {
						jQuery(oldBubble).animate({opacity: "0", height: "0px"}, 1000, function() {
							this.parentNode.removeChild(this);
							if (coolPlace.children.length == 0) {
								coolPlace.style.setProperty("display", "none");
							}
						});
					} catch(error) {
						oldBubble.parentNode.removeChild(oldBubble);
						if (coolPlace.children.length == 0) {
							coolPlace.style.setProperty("display", "none"); // hide coolPlace when no bubbles are left
						}
					}
				}
			}, bubble.delay);
		}
	}
}
