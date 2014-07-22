// ==UserScript==
// @name         www. HTTPS REDIREKTOR
// @version      2014.7.22.2057
// @description  redirect to HTTPS in some websites. keep hash. avoid infinite loops (Opera speed-up tip: save as bla.js instead of bla.user.js)
// @namespace    https://github.com/jesus2099/konami-command
// @author       PATATE12 aka. jesus2099/shamo
// @contributor  Freso
// @contributor  RaiuGekkou
// @contributor  http://userscripts-mirror.org/topics/131180
// @contributor  http://userscripts-mirror.org/topics/118881
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2013.9.18
// @grant        none
// @include      http://*.mediawiki.org/*
// @include      http://*.wikibooks.org/*
// @include      http://*.wikimedia.org/*
// @include      http://*.wikinews.org/*
// @include      http://*.wikipedia.org/*
// @include      http://*.wikiquote.org/*
// @include      http://*.wikisource.org/*
// @include      http://*.wikiversity.org/*
// @include      http://*.wiktionary.org/*
// @include      http://beta.musicbrainz.org/*
// @include      http://blog.musicbrainz.org/*
// @include      http://chatlogs.musicbrainz.org/*
// @include      http://duckduckgo.com/*
// @include      http://musicbrainz.org/*
// @include      http://test.musicbrainz.org/*
// @include      http://userscripts.org/*
// @include      http://wiki.musicbrainz.org/*
// @include      http://wikimediafoundation.org/*
// @exclude      http://*google.*/*imgres*
// @exclude      http://*musicbrainz.org/release/add*
// @exclude      http://*musicbrainz.org/work/create*
// @exclude      http://*musicbrainz.org/ws/*
// @run-at       document-start
// ==/UserScript==
if(location.protocol=="http:")location.href=location.href.replace(/^http/,"https");