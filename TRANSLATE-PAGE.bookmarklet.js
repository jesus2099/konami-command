// ==Bookmarklet==
// @name     Translate page
// @version  2024.11.30
// @author   jesus2099
// @created  2024-11-30
// ==/Bookmarklet==

open("https://translate.google.com/translate?u=" + location.href);

// Temporary Vivaldi VB-45352 VB-66045 VB-78168 VB-82445 VB-105297
// workaround from https://forum.vivaldi.net/post/744329
if (history.replaceState) history.replaceState({}, null, location.href);
