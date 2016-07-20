// ==UserScript==
// @name         mb. PUNBB FORUMS ENHANCER
// @version      2016.6.16-obsolete
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PUNBB-FORUMS-ENHANCER.user.js
// @description  ☠ OBSOLETE ☠ — BBCode markup buttons (bold, italic, url, etc.) with keyboard shortcut keys and restore accesskey on preview and submit too in musicbrainz forums + Hide some forums from new posts page
// @homepage     http://userscripts-mirror.org/scripts/show/125668
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_PUNBB-FORUMS-ENHANCER
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey         quickly tested
// @compatible   chromium(46)+tampermonkey        quickly tested
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_PUNBB-FORUMS-ENHANCER.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_PUNBB-FORUMS-ENHANCER.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-02-13
// @icon         data:image/gif;base64,R0lGODlhEAAQAOMMAAAAAP8A/wJR1MosEqGhBPyZUAD/APW1hQD///vPp///AP7++P///////////////yH5BAEKAA8ALAAAAAAQABAAAARbUMlJq0Ll6AN6z0liYNnWLV84FmUBLIsAAyqpuTEgA4VomzFUyMfaaDy9WhFw/PRoK6Zn2lFyqNio58DKSAEjQnczPtTEN+ww3AIMBrM1Qpxxud80VWDP7/sNEQA7
// @grant        none
// @include      http://forums.musicbrainz.org/edit.php*
// @include      http://forums.musicbrainz.org/post.php*
// @include      http://forums.musicbrainz.org/search.php?action=show_new*
// @include      http://forums.musicbrainz.org/viewforum.php*
// @include      http://forums.musicbrainz.org/viewtopic.php*
// @run-at       document-end
// ==/UserScript==
"use strict";
if (confirm("“mb. PUNBB FORUMS ENHANCER” is now obsolete.\r\n\r\nThank you for using this script but MusicBrainz PunBB forum is now closed.\r\n\r\nPlease uninstall “mb. PUNBB FORUMS ENHANCER”.\r\n\r\n — PATATE12 (jesus2099), user script author —\r\n\r\n\r\nPress OK to go to the new MetaBrainz forum.")) {
	open("https://community.metabrainz.org/");
}
