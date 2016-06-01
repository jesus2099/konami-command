// ==UserScript==
// @name         COOL BUBBLES
// @version      2016.6.1
// @changelog    https://github.com/jesus2099/konami-command/commits/master/lib/COOL-BUBBLES.js
// @description  Library for displaying bottom right notifications (PHYLACTÈRES À LA COOL)
// @supportURL   https://github.com/jesus2099/konami-command/labels/COOL-BUBBLES
// @compatible   opera(12.18.1872)+violentmonkey     my setup
// @compatible   firefox(46.0.1)+greasemonkey        quickly tested
// @compatible   chromium(46.0.2471.0)+tampermonkey  quickly tested
// @compatible   chrome+tampermonkey                 should be same as chromium
// @namespace    jesus2099/shamo
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2016-05-31
// @grant        none
// ==/UserScript==
"use strict";
//TODO: add category system
//TODO: insert CSS instead of inline style
var coolBubble = {
	id: "jesus2099coolBubble-container",
	msg: function(params) {
		this.show(params, "message");
	},
	warn: function(params) {
		this.show(params, "warning");
	},
	err: function(params) {
		this.show(params, "error");
	},
	show: function(params, type) {
		var bubble;
		if (typeof params == "string" || params.nodeType) {
			// create new bubble with message passed in parameter
			bubble = {message: params};
			bubble.message = params;
		} else {
			bubble = params;
		}
		if (bubble && typeof bubble.message != "undefined") {
			var coolPlace = document.getElementById(this.id);
			if (!coolPlace) {
				var coolPlace = document.createElement("div");
				coolPlace.setAttribute("id", this.id);
				coolPlace.style.setProperty("position", "fixed");
				coolPlace.style.setProperty("right", "0");
				coolPlace.style.setProperty("bottom", "0");
				coolPlace.addEventListener("dblclick", function(event) {
					if (event.target.classList.contains("error")) {
						coolBubble.dismissCoolBubble(event);
					}
				});
				document.body.appendChild(coolPlace);
			}
			var randomID = "_bubble-" + Math.random().toString().substr(2);
			var newBubble = document.createElement("div");
			newBubble.className = randomID;
			var defaults = {
				message: {backgroundColour: "#9F9", delay: 4 * 1000},
				warning: {backgroundColour: "#FF9", delay: 8 * 1000},
				error:   {backgroundColour: "#F99", delay: 0}
			};
			if (typeof bubble.delay == "undefined") {
				bubble.delay = defaults[type].delay;
			}
			newBubble.classList.add(type);
			newBubble.style.setProperty("background-color", defaults[type].backgroundColour);
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
				setTimeout(this.dismissCoolBubble, bubble.delay, newBubble);
				setTimeout(function() {
					var oldBubble = document.querySelector("#" + this.id + " > ." + randomID);
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
			} else {
				newBubble.addEventListener("dblclick", this.dismissCoolBubble);
				newBubble.setAttribute("title", "double‐click to dismiss this bubble");
			}
		}
	},
	dismissCoolBubble: function(eventOrNode) {
		var coolPlace = document.getElementById(coolBubble.id);
		var bubble = eventOrNode.nodeType ? eventOrNode : eventOrNode.target;
		if (coolPlace && bubble) {
			try {
				jQuery(bubble).animate({opacity: "0", height: "0px"}, eventOrNode.nodeType ? 1000 : 100, function() {
					this.parentNode.removeChild(this);
					if (coolPlace.children.length == 0) {
						coolPlace.style.setProperty("display", "none");
					}
				});
			} catch(error) {
				bubble.parentNode.removeChild(bubble);
				if (coolPlace.children.length == 0) {
					coolPlace.style.setProperty("display", "none"); // hide coolPlace when no bubbles are left
				}
			}
		}
	}
}
