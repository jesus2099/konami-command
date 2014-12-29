(function(){"use strict";var meta={rawmdb:function(){
// ==UserScript==
// @name         z. MOVE TEST
// @version      2
// @description  please don’t install this is just a test to see how to manage script file move with auto update maintain (on github, gf and oujs).
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/z_MOVE-TEST.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/z_MOVE-TEST.user.js
// ==/UserScript==
	}};
	if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
		var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
		while ((kv = row.exec(meta.rawmdb)) !== null) {
			if (meta[kv[1]]) {
				if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
				meta[kv[1]].push(kv[2]);
			} else meta[kv[1]] = kv[2];
		}
	}
	var aMalibu = meta.name+" ("+meta.version+")";
	try { aMalibu += "\n\n"+meta.downloadURL; } catch(e) {}
	alert(aMalibu);
})();