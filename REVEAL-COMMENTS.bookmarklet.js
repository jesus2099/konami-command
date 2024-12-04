// ==Bookmarklet==
// @name     Reveal comments
// @version  2024.12.4
// @author   UNKNOWN
// ==/Bookmarklet==

var style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
style.textContent = ".comment_ {color: green; background: yellow; font-family: monospace; white-space: pre}";
if (document.documentElement instanceof HTMLHtmlElement && document.documentElement.firstElementChild instanceof HTMLHeadElement)
	document.documentElement.firstElementChild.appendChild(style);
else
	document.documentElement.appendChild(style);

function reveal(comment) {
	var visible_comment = document.createElementNS("http://www.w3.org/1999/xhtml", "span");
	visible_comment.className = "comment_";
	visible_comment.textContent = "<!--" + comment.data + "-->";
	comment.parentNode.replaceChild(visible_comment, comment);
}

var comments = document.evaluate("//comment()", document, null, 7, null);
for (var i = 0; i < comments.snapshotLength; ++i)
	reveal(comments.snapshotItem(i));

// Temporary Vivaldi VB-45352 VB-66045 VB-78168 VB-82445 VB-105297
// workaround from https://forum.vivaldi.net/post/744329
if (history.replaceState) history.replaceState({}, null, location.href);
