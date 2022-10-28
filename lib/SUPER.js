// ==UserScript==
// @name         SUPER
// @version      2022.10.28
// @description  Library of SUPER cool stuff — FOR MY OWN USE — Frequent API changes. Use it at your own risks. Use https://cdn.jsdelivr.net/gh/jesus2099/konami-command@<github-commit-full-hash>/lib/SUPER.js to prevent updates.
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2015-07-10; https://github.com/jesus2099/konami-command/commit/f487d85fbd26aca4a16f558bb180fbbbed6ee5d8
// @grant        none
// ==/UserScript==
"use strict";

function addAfter(newNode, existingNode) {
	if (newNode && existingNode && existingNode.parentNode) {
		if (existingNode.nextSibling) {
			return existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
		} else {
			return existingNode.parentNode.appendChild(newNode);
		}
	} else {
		return null;
	}
}

function createTag(tag, gadgets, children) {
	var t = (tag == "fragment" ? document.createDocumentFragment() : document.createElement(tag));
	if (t.tagName) {
		if (gadgets) {
			for (var attri in gadgets.a) if (Object.prototype.hasOwnProperty.call(gadgets.a, attri)) {
				t.setAttribute(attri, gadgets.a[attri]);
			}
			for (var style in gadgets.s) if (Object.prototype.hasOwnProperty.call(gadgets.s, style)) {
				t.style.setProperty(
					style.replace(/!/g, "").replace(/[A-Z]/g, "-$&").toLowerCase(),
					gadgets.s[style].replace(/!/g, ""),
					style.match(/!/) || gadgets.s[style].match(/!/) ? "important" : ""
				);
			}
			for (var event in gadgets.e) if (Object.prototype.hasOwnProperty.call(gadgets.e, event)) {
				var listeners = Array.isArray(gadgets.e[event]) ? gadgets.e[event] : [gadgets.e[event]];
				for (var l = 0; l < listeners.length; l++) { t.addEventListener(event, listeners[l]); }
			}
		}
		if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
	}
	if (children) {
		var _children = Array.isArray(children) ? children : [children];
		for (var c = 0; c < _children.length; c++) {
			t.appendChild((typeof _children[c]).match(/number|string/) ? document.createTextNode(_children[c]) : _children[c]);
		}
		t.normalize();
	}
	return t;
}

function disableInputs(inputs, setAsDisabled) {
	if (Array.isArray(inputs) || inputs instanceof NodeList) {
		for (var i = 0; i < inputs.length; i++) {
			disableInputs(inputs[i], setAsDisabled);
		}
	} else if (typeof setAsDisabled == "undefined" || setAsDisabled == true) {
		inputs.setAttribute("disabled", "disabled");
	} else {
		inputs.removeAttribute("disabled");
	}
}

function enableInputs(inputs, setAsEnabled) {
	disableInputs(inputs, !(typeof setAsEnabled == "undefined" || setAsEnabled));
}

// from https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getParent(startingNode, searchedTag, searchedCssClass, searchedId) {
	var currentNode = startingNode;
	if (currentNode && (currentNode = currentNode.parentNode)) {
		if (
			currentNode.tagName
			&& currentNode.tagName.toUpperCase() == searchedTag.toUpperCase()
			&& (!searchedCssClass || searchedCssClass && currentNode.classList && currentNode.classList.contains(searchedCssClass))
			&& (!searchedId || currentNode.getAttribute && currentNode.getAttribute("id") == searchedId)
		) {
			return currentNode;
		} else {
			return getParent(currentNode, searchedTag, searchedCssClass, searchedId);
		}
	}
	return null;
}

function getSibling(startingNode, searchedTag, searchedCssClass, previous, maximumDistance) {
	var currentNode = startingNode;
	var max = typeof maximumDistance == "number" ? maximumDistance : 1;
	if (currentNode && (currentNode = previous ? currentNode.previousSibling : currentNode.nextSibling)) {
		if (
			currentNode.tagName
			&& currentNode.tagName.toUpperCase() == searchedTag.toUpperCase()
			&& (!searchedCssClass || searchedCssClass && currentNode.classList && currentNode.classList.contains(searchedCssClass))
		) {
			return currentNode;
		} else if (max > 0) {
			return getSibling(currentNode, searchedTag, searchedCssClass, previous, typeof maximumDistance == "number" ? max - 1 : null);
		}
	}
	return null;
}

function removeChildren(parent) {
	while (parent && parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}

function removeNode(node) {
	return node.parentNode.removeChild(node);
}

function replaceChildren(newContent, parent) {
	removeChildren(parent);
	return parent.appendChild(newContent);
}

function sendEvent(node, eventName) {
	var _eventName = eventName.toLowerCase();
	var event;
	if (_eventName.match(/^mouse|click$/)) {
		var parameters = {modifierKeys: []};
		if (_eventName.match(/\+/)) {
			parameters.modifierKeys = _eventName.split("+");
			_eventName = parameters.modifierKeys.pop();
		}
		// Advised new MouseEvent() does not work in SUPER TURBO release editor submit with Ctrl+Enter
		event = document.createEvent("MouseEvents");
		event.initMouseEvent(_eventName, true, true, null, 0, 0, 0, 0, 0, parameters.modifierKeys.indexOf("ctrl") > -1, parameters.modifierKeys.indexOf("alt") > -1, parameters.modifierKeys.indexOf("shift") > -1, parameters.modifierKeys.indexOf("meta") > -1, 0, null);
	} else {
		event = document.createEvent("HTMLEvents");
		event.initEvent(_eventName, true, true);
	}
	node.dispatchEvent(event);
}

function stop(event) {
	event.cancelBubble = true;
	if (event.stopPropagation) event.stopPropagation();
	event.preventDefault();
	return false;
}

function waitForElement(selector, callback) {
	var waitForElementIntervalID = setInterval(function() {
		var element = document.querySelector(selector);
		if (element) {
			clearInterval(waitForElementIntervalID);
			callback(element);
		}
	}, 123);
}

function write_cookie(name, value, seconds) {
	if (seconds) {
		var max_age = "; max-age=" + seconds;
	} else {
		var max_age = "";
	}
	document.cookie = name + "=" + encodeURIComponent(value) + max_age + "; path=/";
}

function read_cookie(name) {
	var name_equals = name + "=";
	var cookie_array = document.cookie.split(";");
	for (var c = 0; c < cookie_array.length; c++) {
		var cookie = cookie_array[c];
		while (cookie.charAt(0) == " ") {
			cookie = cookie.substring(1, cookie.length);
		}
		if (cookie.indexOf(name_equals) == 0) {
			return decodeURIComponent(cookie.substring(name_equals.length, cookie.length));
		}
	}
	return null;
}

function delete_cookie(name) {
	write_cookie(name, "", -1);
}
