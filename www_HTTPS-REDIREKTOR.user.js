// ==UserScript==
// @name         www. HTTPS REDIREKTOR
// @version      2014.11.17.1518
// @description  redirect to HTTPS in some websites. keep hash. avoid infinite loops (Opera speed-up tip: save as bla.js instead of bla.user.js)
// @homepage     http://userscripts-mirror.org/scripts/show/178037
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/www_HTTPS-REDIREKTOR.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/www_HTTPS-REDIREKTOR.user.js
// @author       PATATE12
// @contributor  Freso
// @contributor  RaiuGekkou
// @contributor  http://userscripts-mirror.org/topics/131180
// @contributor  http://userscripts-mirror.org/topics/118881
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2013-09-18
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
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
if(location.protocol=="http:")location.replace(location.href.replace(/^http/,"https"));