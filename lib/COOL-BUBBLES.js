// ==UserScript==
// @name         COOL BUBBLES
// @version      2021.1.19.2099
// @description  Library for displaying bottom right notifications (PHYLACTÈRES À LA COOL) — FOR MY OWN USE — Frequent API changes. Use it at your own risks. Use https://cdn.jsdelivr.net/gh/jesus2099/konami-command@<github-commit-full-hash>/lib/COOL-BUBBLES.js to prevent updates.
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2016-05-31; https://github.com/jesus2099/konami-command/commit/c7d3a5569710eb1f3b278723ee54f9b7b591100b
// @grant        none
// ==/UserScript==
"use strict";
// TODO: add category system
// TODO: check out GM_notification https://violentmonkey.github.io/api/gm/#gm_notification
document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
var coolBubble = {
	id: "jesus2099coolBubble-container",
	css: document.styleSheets[document.styleSheets.length - 1],
	info: function(params) {
		this.show(params, "info");
	},
	warn: function(params) {
		this.show(params, "warn");
	},
	error: function(params) {
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
				coolPlace = document.createElement("div");
				coolPlace.setAttribute("id", this.id);
				coolPlace.addEventListener("dblclick", function(event) {
					if (event.target.classList.contains("error")) {
						coolBubble.remove(event);
					}
				});
				document.body.appendChild(coolPlace);
			}
			var newBubble = document.createElement("div");
			newBubble.classList.add("bubble-" + Math.random().toString().substr(2));
			newBubble.classList.add(type);
			var defaults = {
				info:  {delay: 4 * 1000},
				warn:  {delay: 8 * 1000},
				error: {delay: 0}
			};
			if (typeof bubble.delay == "undefined") {
				bubble.delay = defaults[type].delay;
			}
			if (bubble.message.nodeType) { // for instance a Node.DOCUMENT_FRAGMENT_NODE
				console[type](bubble.message.textContent);
				newBubble.appendChild(bubble.message);
			} else if (typeof bubble.message == "string") {
				console[type](bubble.message);
				newBubble.appendChild(document.createTextNode(bubble.message));
			}
			coolPlace.appendChild(newBubble);
			coolPlace.style.setProperty("width", self.getComputedStyle(coolPlace).getPropertyValue("width")); // keep growing and never shrink
			coolPlace.style.setProperty("display", "block"); // show coolPlace when at least one bubble
			if (bubble.delay > 0) {
				setTimeout(this.remove, bubble.delay, newBubble);
			} else {
				newBubble.addEventListener("dblclick", this.remove);
				newBubble.setAttribute("title", "double‐click to dismiss this bubble");
			}
		}
	},
	remove: function(eventOrNode) {
		if (eventOrNode.type && eventOrNode.type == "dblclick") {
			eventOrNode.stopPropagation();
		}
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
			} catch (error) {
				bubble.parentNode.removeChild(bubble);
				if (coolPlace.children.length == 0) {
					coolPlace.style.setProperty("display", "none"); // hide coolPlace when no bubbles are left
				}
			}
		}
	}
};
coolBubble.css.insertRule("#" + coolBubble.id + " { position: fixed; bottom: 0; right: 0; }", 0);
coolBubble.css.insertRule("#" + coolBubble.id + " div { border: 1px dashed black; margin: 2px; padding: 6px }", 0);
coolBubble.css.insertRule("#" + coolBubble.id + " .info { background-color: #9F9; }", 0);
coolBubble.css.insertRule("#" + coolBubble.id + " .warn { background-color: #FF9; }", 0);
coolBubble.css.insertRule("#" + coolBubble.id + " .error { background-color: #F99; color: black; }", 0);
