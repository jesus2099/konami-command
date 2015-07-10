// ==UserScript==
// @name         SUPER
// @description  This is my own SUPER library. It is only intended to be used by my own user scripts. It can change at any time without prior notice. If you want to use it, target a specific version of it or, better, fork it.
// @namespace    https://github.com/jesus2099/konami-command
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// ==/UserScript==
function createTag(tag, gadgets, _children) {
	var t = (tag == "fragment" ? document.createDocumentFragment() : document.createElement(tag));
	if(t.tagName) {
		if (gadgets) {
			for (var attri in gadgets.a) if (gadgets.a.hasOwnProperty(attri)) {
				t.setAttribute(attri, gadgets.a[attri]);
			}
			for (var style in gadgets.s) if (gadgets.s.hasOwnProperty(style)) {
				t.style.setProperty(
					style.replace(/!/g, "").replace(/[A-Z]/g, "-$&").toLowerCase(),
					gadgets.s[style].replace(/!/g, ""),
					style.match(/!/) || gadgets.s[style].match(/!/) ? "important" : ""
				);
			}
			for (var event in gadgets.e) if (gadgets.e.hasOwnProperty(event)) {
				var listeners = Array.isArray(gadgets.e[event]) ? gadgets.e[event] : [gadgets.e[event]];
				for (var l = 0; l < listeners.length; l++) { t.addEventListener(event, listeners[l]); }
			}
		}
		if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
	}
	if (_children) {
		var children = Array.isArray(_children) ? _children : [_children];;
		for (var c = 0; c < children.length; c++) { t.appendChild((typeof children[c]).match(/number|string/) ? document.createTextNode(children[c]) : children[c]); }
		t.normalize();
	}
	return t;
}
function removeChildren(parent) {
	while (parent && parent.hasChildNodes()) { parent.removeChild(parent.firstChild); }
}
function replaceChildren(newContent, parent) {
	removeChildren(parent);
	return parent.appendChild(newContent);
}
function stop(event) {
	event.cancelBubble = true;
	if (event.stopPropagation) event.stopPropagation();
	event.preventDefault();
	return false;
}
/* from https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions */
function escapeRegExp(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
