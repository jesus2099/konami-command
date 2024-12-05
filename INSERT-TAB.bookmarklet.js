// ==Bookmarklet==
// @name     Insert tab
// @version  2024.12.4
// @author   jesus2099
// @created  long time ago
// ==/Bookmarklet==

document.activeElement.setRangeText("\t", document.activeElement.selectionStart, document.activeElement.selectionEnd, "end");

// Temporary Vivaldi VB-45352 VB-66045 VB-78168 VB-82445 VB-105297
// workaround from https://forum.vivaldi.net/post/744329
if (history.replaceState) history.replaceState({}, null, location.href);
