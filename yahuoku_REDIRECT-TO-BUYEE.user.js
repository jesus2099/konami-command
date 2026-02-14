// ==UserScript==
// @name         yahuoku. REDIRECT TO BUYEE
// @version      2026.2.14
// @description  auctions.yahoo.co.jp: Redirect (Europe?) geoblocked ヤフオク！ (Yahoo! Auctions Japan) to Buyee proxy
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/yahuoku_REDIRECT-TO-BUYEE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/yahuoku_REDIRECT-TO-BUYEE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @created      2022-11-04
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/(page\.)?auctions\.yahoo\.co\.jp\/jp\/auction\/[0-9a-z]+/
// @run-at       document-start
// ==/UserScript==
"use strict";
location.assign(location.pathname.replace(/^\/jp/, "https://buyee.jp/item/yahoo"));
