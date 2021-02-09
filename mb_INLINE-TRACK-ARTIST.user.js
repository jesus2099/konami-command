// ==UserScript==
// @name         mb. INLINE TRACK ARTIST
// @version      2021.2.9
// @description  ☠ OBSOLETE ☠ musicbrainz.org: highlights track title, length and artist differences in recording page
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_INLINE-TRACK-ARTIST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_INLINE-TRACK-ARTIST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @requester    culinko
// @since        2013-05-07; https://web.archive.org/web/20131104205636/userscripts.org/scripts/show/166877 / https://web.archive.org/web/20141011084010/userscripts-mirror.org/scripts/show/166877
// @grant        none
// @match        *://*.musicbrainz.org/recording/*
// @exclude      *.org/recording/*/*
// @run-at       document-start
// ==/UserScript==
"use strict";
if (
	confirm(
		"mb. INLINE TRACK ARTIST is now obsolete.\nPlease uninstall this userscript.\n\n"
		+ "Its main feature is now part of MBS code itself, thanks to reosarevok (MBS-10355).\n\n"
		+ "If you are still interested by the remaining features:\n\n"
		+ "- millisecond display\n- spot track length variations\n- spot track title variations\n\n"
		+ "Press OK to find them in INLINE-STUFF\n\n"
		+ "Thank you for having used INLINE TRACK ARTIST.\n\njesus2099"
	)
) {
	open("https://github.com/jesus2099/konami-command/blob/master/mb_INLINE-STUFF.user.js");
}
