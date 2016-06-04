// ==UserScript==
// @name         mb. ALL LINKS
// @version      2016.5.29
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_ALL-LINKS.user.js
// @description  Hidden links include fanpage, social network, etc. (NO duplicates) Generated autolinks (configurable) includes plain web search, auto last.fm, Discogs and LyricWiki searches, etc. Shows begin/end dates on URL and provides edit link. Expands Wikidata links to wikipedia articles.
// @homepage     http://userscripts-mirror.org/scripts/show/108889
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALL-LINKS
// @compatible   opera(12.18.1872)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey         tested sometimes
// @compatible   chromium(46)+tampermonkey        tested sometimes
// @compatible   chrome+tampermonkey              should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_ALL-LINKS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-08-02
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=125133&v=2016.5.11
// @grant        none
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/release/*
// @include      http://*.mbsandbox.org/artist/*
// @include      http://*.mbsandbox.org/release/*
// @exclude      *//*/*mbsandbox.org/*
// @exclude      *//*/*musicbrainz.org/*
// @exclude      *//*musicbrainz.org/artist/*/edit
// @exclude      *//*musicbrainz.org/artist/*/split
// @run-at       document-end
// ==/UserScript==
"use strict";
/* hint for Opera 12 users allow opera:config#UserPrefs|Allowscripttolowerwindow and opera:config#UserPrefs|Allowscripttoraisewindow */
var userjs = "jesus2099_all-links_";
var nonLatinName = /[\u0384-\u1cf2\u1f00-\uffff]/; // U+2FA1D is currently out of js range
var extlinksOpacity = "1";
var autolinksOpacity = ".5";
var rawLanguages = JSON.parse(localStorage.getItem(userjs + "languages")) || ["navigator", "musicbrainz"];
// %artist-id% (MBID)
// %arist-name%
// %artist-sort-name%
// %artist-family-name-first%
var autolinks = {
	user: JSON.parse(localStorage.getItem(userjs + "user-autolinks")) || {},
	default: {
		"Web pages": "//duckduckgo.com/?q=%artist-name%",
		"Web pages (strict)": "//duckduckgo.com/?q=%2B%22%artist-name%%22",
		"Images": "//duckduckgo.com/?q=%artist-name%+!i",
		"Videos": "//duckduckgo.com/?q=%artist-name%+!v",
		"Credits": null,
		"SACEM (Interprète)": {
			acceptCharset: "ISO-8859-1",
			action: "http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do",
			parameters: {
				"ftin": "true",
				"tiers": "%artist-name%"
			}
		},
		"SACEM (Auteur‐Compositeur‐Éditeur)": {
			acceptCharset: "ISO-8859-1",
			action: "http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do",
			parameters: {
				"ftad": "true",
				"tiers": "%artist-name%"
			}
		},
		"JASRAC（アーティスト）": {
			title: "requires JASRAC direct link",
			method: "post",
			acceptCharset: "Shift_JIS",
			enctype: "multipart/form-data",
			action: "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3",
			parameters: {
				"IN_ARTIST_NAME_OPTION1": "0",
				"IN_ARTIST_NAME1": "%artist-name%",
				"IN_DEFAULT_WORKS_KOUHO_MAX": "100",
				"IN_DEFAULT_WORKS_KOUHO_SEQ": "1",
				"IN_DEFAULT_SEARCH_WORKS_NAIGAI": "0",
				"RESULT_CURRENT_PAGE": "1"
			}
		},
		"JASRAC（著作者）": {
			title: "requires JASRAC direct link",
			method: "post",
			acceptCharset: "Shift_JIS",
			enctype: "multipart/form-data",
			action: "http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3",
			parameters: {
				"IN_KEN_NAME_OPTION1": "0",
				"IN_KEN_NAME1": "%artist-family-name-first%",
				"IN_KEN_NAME_JOB1": "0",
				"IN_DEFAULT_WORKS_KOUHO_MAX": "100",
				"IN_DEFAULT_WORKS_KOUHO_SEQ": "1",
				"IN_DEFAULT_SEARCH_WORKS_NAIGAI": "0",
				"RESULT_CURRENT_PAGE": "1"
			}
		},
		"音楽の森（アーティスト）": "//www.minc.gr.jp/db/ArtNmSrch.aspx?ArtNm=%artist-name%",
		"音楽の森（著作者）": "//www.minc.gr.jp/db/KenriSrch.aspx?KENRISYANM=%artist-family-name-first%",
		"Lyrics": null,
		"decoda": "http://decoda.com/search?q=%artist-name%",
		"LyricWiki": "//lyrics.wikia.com/%artist-name%",
		"うたまっぷ（アーティスト）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "artist",
				"word": "%artist-name%"
			}
		},
		"うたまっぷ（作詞者）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "sakusi",
				"word": "%artist-name%"
			}
		},
		"うたまっぷ（作曲者）": {
			acceptCharset: "euc-jp",
			action: "http://www.utamap.com/searchkasi.php",
			parameters: {
				"searchname": "sakyoku",
				"word":"%artist-name%"
			}
		},
		"J-Lyric（歌手）": "http://j-lyric.net/index.php?ka=%artist-name%",
		"歌詞タイム": "//duckduckgo.com/?q=site%3Akasi-time.com+subcat+intitle:%artist-name%",
		"Japanese stuff": null,
		"VGMdb": "http://vgmdb.net/search?q=%artist-name%",
		"ja.Wikipedia": "//ja.wikipedia.org/w/index.php?search=%artist-name%",
		"CDJournal search": {
			acceptCharset: "euc-jp",
			action: "https://cdjournal.com/search/do/",
			parameters: {
				"k": "%artist-name%",
				"target": "a"
			}
		},
		"Joshinweb search": {
			acceptCharset: "Shift_JIS",
			action: "//joshinweb.jp/cdshops/Dps",
			parameters: {
				"KEY": "ARTIST",
				"FM": "0",
				"KEYWORD": "%artist-name%"
			}
		},
		"Yunisan": "//duckduckgo.com/?q=site:www22.big.or.jp+%22%2F%7Eyunisan%2Fvi%2F%22+%artist-name%",
		"VKDB": "//duckduckgo.com/?q=site:vkdb.jp+%artist-name%",
		"Vietnamese stuff": null,
		"vi.Wikipedia": "//vi.wikipedia.org/w/index.php?search=%artist-name%",
		"nhạc số": "http://nhacso.net/tim-kiem-nghe-si.html?keyName=%artist-name%",
		"Korean stuff": null,
		"maniadb": "http://www.maniadb.com/search.asp?sr=PO&q=%artist-name%",
		"Other databases": null,
		"AllMusic": "http://www.allmusic.com/search/artist/%artist-name%",
		"Discogs": "http://www.discogs.com/search?q=%artist-name%&type=artist",
		"ISNI": "//isni.oclc.nl/xslt/CMD?ACT=SRCHA&IKT=8006&TRM=%artist-name%",
		"Rate Your Music": "//rateyourmusic.com/search?searchtype=a&searchterm=%artist-name%", 
		"Second hand songs": "http://secondhandsongs.com/search?search_text=%artist-name%",
		"WhoSampled": "//www.whosampled.com/search/artists/?h=1&q=%artist-name%", 
		"Other stuff": null,
		"en.Wikipedia": "//en.wikipedia.org/w/index.php?search=%artist-name%",
		"*.Wikipedia": "//duckduckgo.com/?q=site:wikipedia.org+%22%artist-name%%22",
		"Lastfm (mbid)": "http://last.fm/mbid/%artist-id%",
		"Lastfm (name)": "http://last.fm/music/%artist-name%",
		"BBC Music": "http://www.bbc.co.uk/music/artists/%artist-id%",
	}
};
var enabledDefaultAutolinks = {};
var loadedSettings = JSON.parse(localStorage.getItem(userjs + "enabled-default-autolinks")) || {};
for (var link in autolinks.default) if (autolinks.default.hasOwnProperty(link)) {
	enabledDefaultAutolinks[link] = typeof loadedSettings[link] != "undefined" ? loadedSettings[link] : true;
}
var faviconClasses = { // https://github.com/metabrainz/musicbrainz-server/blob/61960dd9ebd5b77c6f1199815160e63b3383437e/lib/MusicBrainz/Server/Entity/URL/Sidebar.pm
	"amazon"                    : "amazon",
	"allmusic.com"              : "allmusic",
	"animenewsnetwork.com"      : "animenewsnetwork",
	"wikipedia.org"             : "wikipedia",
	"facebook.com"              : "facebook",
	"generasia.com"             : "generasia",
	"last.fm"                   : "lastfm",
	"myspace.com"               : "myspace",
	"twitter.com"               : "twitter",
	"youtube.com"               : "youtube",
	"discogs.com"               : "discogs",
	"secondhandsongs.com"       : "secondhandsongs",
	"songfacts.com"             : "songfacts",
	"soundcloud.com"            : "soundcloud",
	"ibdb.com"                  : "ibdb",
	"imdb.com"                  : "imdb",
	"imslp.org"                 : "imslp",
	"instagram.com"             : "instagram",
	"ester.ee"                  : "ester",
	"worldcat.org"              : "worldcat",
	"45cat.com"                 : "fortyfivecat",
	"rateyourmusic.com"         : "rateyourmusic",
	"rolldabeats.com"           : "rolldabeats",
	"psydb.net"                 : "psydb",
	"metal-archives.com"        : "metalarchives",
	"spirit-of-metal.com"       : "spiritofmetal",
	"theatricalia.com"          : "theatricalia",
	"whosampled.com"            : "whosampled",
	"ocremix.org"               : "ocremix",
	"musik-sammler.de"          : "musiksammler",
	"encyclopedisque.fr"        : "encyclopedisque",
	"nla.gov.au"                : "trove",
	"rockensdanmarkskort.dk"    : "rockensdanmarkskort",
	"rockinchina.com"           : "ric",
	"rockipedia.no"             : "rockipedia",
	"vgmdb.net"                 : "vgmdb",
	"viaf.org"                  : "viaf",
	"vk.com"                    : "vk",
	"vkdb.jp"                   : "vkdb",
	"dhhu.dk"                   : "dhhu",
	"thesession.org"            : "thesession",
	"plus.google.com"           : "googleplus",
	"openlibrary.org"           : "openlibrary",
	"bandcamp.com"              : "bandcamp",
	"play.google.com"           : "googleplay",
	"itunes.apple.com"          : "itunes",
	"spotify.com"               : "spotify",
	"soundtrackcollector.com"   : "stcollector",
	"wikidata.org"              : "wikidata",
	"lieder.net"                : "lieder",
	"loudr.fm"                  : "loudr",
	"genius.com"                : "genius",
	"imvdb.com"                 : "imvdb",
	"residentadvisor.net"       : "residentadvisor",
	"d-nb.info"                 : "dnb",
	"iss.ndl.go.jp"             : "ndl",
	"ci.nii.ac.jp"              : "cinii",
	"finnmusic.net"             : "finnmusic",
	"fono.fi"                   : "fonofi",
	"stage48.net"               : "stage48",
	"tedcrane.com/dancedb"      : "dancedb",
	"finna.fi"                  : "finna",
	"mainlynorfolk.info"        : "mainlynorfolk",
	"bibliotekapiosenki.pl"     : "piosenki",
	"qim.com"                   : "quebecinfomusique",
	"thedancegypsy.com"         : "thedancegypsy",
	"videogam.in"               : "videogamin",
	"spirit-of-rock.com"        : "spiritofrock",
	"tunearch.org"              : "tunearch",
	"castalbums.org"            : "castalbums",
	"smdb.kb.se"                : "smdb",
	"triplejunearthed.com"      : "triplejunearthed",
	"cdbaby.com"                : "cdbaby",
};
var favicons = {
	"lastfm.": "//musicbrainz.org/static/images/favicons/lastfm-16.png",
	"livedoor.jp": "http://blog.livedoor.jp/favicon.ico",
	"rakuten.co.jp": "//plaza.rakuten.co.jp/favicon.ico",
	"yahoo.": "http://blogs.yahoo.co.jp/favicon.ico",
};
var favicontry = [];
var guessOtherFavicons = true;
var sidebar = document.getElementById("sidebar");
var arelsws = "/ws/2/artist/%artist-id%?inc=url-rels";
var existingLinks, extlinks;
document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
var j2css = document.styleSheets[document.styleSheets.length - 1];
j2css.insertRule("ul.external_links > li.defaultAutolink > input[type='checkbox'] { display: none; }", 0);
j2css.insertRule("ul.external_links > li.defaultAutolink.disabled { text-decoration: line-through; display: none; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink.disabled { display: list-item; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink > input[type='checkbox'] { display: inline; }", 0);
var hrStyle = {css: ""};
main();
for (var s = 0; s < document.styleSheets.length; s++) {
	for (var r = 0; r < document.styleSheets[s].cssRules.length - 1; r++) {
		if (hrStyle.match = document.styleSheets[s].cssRules[r].cssText.match(/(#sidebar.+ul.+hr) {(.+)}/)) {
			hrStyle.css += hrStyle.match[2];
		}
	}
}
if (hrStyle.css) {
	j2css.insertRule("div#sidebar ul.external_links hr { margin-top: 8px !important; width: inherit !important; " + hrStyle.css + "}", 0);
}
function main() {
	if (sidebar) {
		var artistid = self.location.href.match(/(?:mbsandbox|musicbrainz)\.org\/artist\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
		var artistname = document.querySelector("div#content > div.artistheader > h1 a, div#content > div.artistheader > h1 span[href]"); /* for compatibilly with https://gist.github.com/jesus2099/4111760 */
		var artistsortname, artistsortnameSwapped = "";
		if (artistid && artistname) {
			artistid = artistid[1];
			arelsws = arelsws.replace(/%artist-id%/, artistid);
			artistsortname = artistname.getAttribute("title");
			var tmpsn = artistsortname.split(",");
			for (var isn = tmpsn.length - 1; isn >= 0; isn--) {
				artistsortnameSwapped += tmpsn[isn].trim();
				if (isn != 0) {
					artistsortnameSwapped += " ";
				}
			}
			artistname = artistname.textContent.trim();
			extlinks = sidebar.getElementsByClassName("external_links");
			if (extlinks && extlinks.length > 0) {
				extlinks = extlinks[0];
				loading(true);
				// Attached missing links
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(event) {
					if (this.readyState == 4) {
						if (this.status == 200) {
							loading(false);
							var res = this.responseXML;
							var url, urls = res.evaluate("//mb:relation-list[@target-type='url']/mb:relation", res, nsr, XPathResult.ANY_TYPE, null);
							var haslinks = false;
							while (url = urls.iterateNext()) {
								var target = res.evaluate("./mb:target", url, nsr, XPathResult.ANY_TYPE, null);
								target = target.iterateNext();
								var begin, end;
								if (begin = res.evaluate("./mb:begin", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) {
									begin = begin.textContent;
								}
								if (end = res.evaluate("./mb:end", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) {
									end = end.textContent;
								} else if (res.evaluate("./mb:ended", url, nsr, XPathResult.ANY_TYPE, null).iterateNext()) {
									end = "????";
								}
								if (target) {
									if (addExternalLink({text: url.getAttribute("type"), target: target.textContent, mbid: target.getAttribute("id"), begin: begin, end: end})) {
										if (!haslinks) {
											haslinks = true;
											addExternalLink({text: " Hidden links"});
										}
									}
								}
							}
						} else if (this.status >= 400) {
							var txt = this.responseText.match(/<error><text>(.+)<\/text><text>/);
							txt = txt ? txt[1] : "";
							error(this.status, txt);
						}
					}
				};
				xhr.open("GET", arelsws, true);
				xhr.send(null);
				// Autolinks
				extlinksOpacity = autolinksOpacity;
				for (var defaultOrUser in autolinks) if (autolinks.hasOwnProperty(defaultOrUser)) {
					var haslinks = false;
					for (var link in autolinks[defaultOrUser]) if (autolinks[defaultOrUser].hasOwnProperty(link)) {
						var target = autolinks[defaultOrUser][link];
						var sntarget = null;
						if (target) {
							if (typeof target == "string") {
								target = target.replace(/%artist-id%/, artistid);
								if (target.match(/%artist-name%/) && artistname != artistsortnameSwapped && artistname.match(nonLatinName)) {
									sntarget = target.replace(/%artist-name%/, encodeURIComponent(artistsortnameSwapped));
								}
								target = target.replace(/%artist-name%/, encodeURIComponent(artistname));
								target = target.replace(/%artist-family-name-first%/, encodeURIComponent(artistname.match(nonLatinName) ? artistname : artistsortname));
							} else {
								var aname = target.acceptCharset;
								aname = aname && aname.match(/iso-8859/i) && artistname != artistsortnameSwapped && artistname.match(nonLatinName) ? artistsortnameSwapped : artistname;
								for (var param in target.parameters) if (target.parameters.hasOwnProperty(param)) {
									target.parameters[param] = target.parameters[param].replace(/%artist-id%/, artistid).replace(/%artist-name%/, aname).replace(/%artist-family-name-first%/, artistname.match(nonLatinName) ? artistname : artistsortname);
								}
							}
						}
						if (addExternalLink({text: link, target: target, sntarget: sntarget, enabledDefaultAutolink: enabledDefaultAutolinks[link]})) {
							if (!haslinks) {
								haslinks = true;
								addExternalLink({text: " " + defaultOrUser.substr(0, 1).toUpperCase() + defaultOrUser.substr(1).toLowerCase() + " autolinks"});
								extlinks.lastChild.previousSibling.appendChild(document.createTextNode(" "));
								extlinks.lastChild.previousSibling.appendChild(createTag("div", {a: {class: "icon img"}, s: {backgroundImage: "url(/static/images/icons/cog.png)"}}, createTag("a", {a: {title: "configure " + defaultOrUser + " autolinks"}, s: {color: "transparent"}, e: {click: configureModule}}, "configure")));
							}
						}
					}
				}
			}
		}/*artist*/
		/*wikidata to wikipedia*/
		if (rawLanguages && Array.isArray(rawLanguages) && rawLanguages.length > 0) {
			var languages = parseLanguages(rawLanguages);
			var wikidatas = sidebar.querySelectorAll("ul.external_links > li a[href*='wikidata.org/wiki/Q']");
			for (var wd = 0; wd < wikidatas.length; wd++) {
				var wikidataID = wikidatas[wd].getAttribute("href").match(/Q\d+$/);
				if (wikidataID) {
					if (!wikidatas[wd].parentNode.querySelector("a.edit-languages")) {
						addAfter(createTag("div", {a: {class: "icon img"}, s: {backgroundImage: "url(/static/images/icons/cog.png)", opacity: ".5"}}, createTag("a", {a: {class: "edit-languages", title: "choose wikipedia languages"}, s: {color: "transparent"}, e: {click: configureModule}}, "choose wikipedia languages")), wikidatas[wd]);
						addAfter(document.createTextNode(" "), wikidatas[wd]);
					}
					var xhr = new XMLHttpRequest();
					xhr.id = wikidataID[0];
					getParent(wikidatas[wd], "li").classList.add(userjs + "-wd-" + xhr.id);
					wikidatas[wd].parentNode.appendChild(createTag("img", {a: {alt: "checking available wikipedia languages…", src: "/static/images/icons/loading.gif"}}));
					xhr.addEventListener("load", function(event) {
						var wikidataListItem = sidebar.querySelector("ul.external_links > li." + userjs + "-wd-" + this.id);
						removeNode(wikidataListItem.querySelector("img[src$='loading.gif']"));
						var wikidata = JSON.parse(this.responseText);
						if (wikidata && wikidata.entities && (wikidata = wikidata.entities[this.id])) {
							for (var languageCode = 0; languageCode < languages.length; languageCode++) {
								var wikiEntry = wikidata.sitelinks[languages[languageCode] + "wiki"];
								if (wikiEntry) {
									var href = wikiEntry.url.replace(/^https?:/, "");
									var ul;
									/*if (!existingLinks || !existingLinks[url]) {*/
									if (!extlinks.querySelector("li a[href$='" + href + "']")) {
										if (!ul) {
											ul = wikidataListItem.appendChild(createTag("ul", {s: {listStyle: "none"}}));
										}
										ul.appendChild(createTag("li", {a: {class: "wikipedia-favicon"}, s: {marginLeft: "-22px"}}, [languages[languageCode], ": ", createTag("a", {a: {href: href}}, wikiEntry.title)]));
									}
								}
							}
						}
					});
					xhr.open("get", "https://www.wikidata.org/wiki/Special:EntityData/" + xhr.id + ".json", true);
					xhr.send(null);
				}
			}
		}
	}
}
function addExternalLink(parameters/*text, target, begin, end, sntarget, mbid, enabledDefaultAutolink*/) {
	var newLink = true;
	var lis = extlinks.getElementsByTagName("li");
	if (!existingLinks) {
		existingLinks = [];
		for (var ilis = 0; ilis < lis.length; ilis++) {
			var lisas = lis[ilis].getElementsByTagName("a");
			if (lisas.length > 0) {
				existingLinks.push(lisas[0].getAttribute("href").trim().replace(/^https?:/, ""));
			}
		}
	}
	if (parameters.target) {
		// This is a link
		var li;
		if (typeof parameters.target != "string") {
			var form = createTag("form", {a: {action: parameters.target.action}});
			if (parameters.target.title) {
				form.style.setProperty("cursor", "help");
			}
			var info = "\r\n" + parameters.target.action;
			for (var attr in parameters.target) if (parameters.target.hasOwnProperty(attr)) {
				if (attr == "parameters") {
					for (var param in parameters.target.parameters) if (parameters.target.parameters.hasOwnProperty(param)) {
						info += "\r\n" + param + "=" + parameters.target.parameters[param];
						form.appendChild(createTag("input", {a: {name: param, type: "hidden", value: parameters.target.parameters[param]}}));
					}
				} else {
					if (attr.match(/acceptCharset|enctype|method/)) {
						info = parameters.target[attr] + " " + info;
					}
					form.setAttribute(attr.replace(/[A-Z]/g, "-$&").toLowerCase(), parameters.target[attr]);
				}
			}
			form.appendChild(createTag("a", {a: {title: info}, e: {
				click: function(event) {
					if (event.button == 0) {
						/* lame browsers ;) */
						if (typeof opera == "undefined") {
							if (event.shiftKey) {
								this.parentNode.setAttribute("target", "_blank");
							} else if (event.ctrlKey) {
								this.parentNode.setAttribute("target", weirdobg());
							}
						}
						this.parentNode.submit();
					}
				},
				mousedown: function(event) {
					event.preventDefault();
					if (event.button == 1) {
						this.parentNode.setAttribute("target", weirdobg());
						this.parentNode.submit();
					}
				}
			}}, parameters.text));
			form.appendChild(document.createTextNode("*"));
			li = createTag("li", {a: {ref: parameters.text}}, form);
		} else {
			var exi = existingLinks.indexOf(parameters.target.trim().replace(/^https?:/, ""));
			if (exi < 0) {
				existingLinks.push(parameters.target.trim().replace(/^https?:/, ""));
				li = createTag("li", {a: {ref: parameters.text}}, createTag("a", {a: {href: parameters.target}}, parameters.text));
			} else {
				newLink = false;
				li = lis[exi];
			}
			if (parameters.sntarget && newLink) {
				li.appendChild(document.createTextNode(" ("));
				li.appendChild(createTag("a", {a: {href: parameters.sntarget, title: "search with latin name"}}, "lat."));
				li.appendChild(document.createTextNode(")"));
			}
			if (parameters.begin || parameters.end) {
				var ardates = createTag("span", {s: {whiteSpace: "nowrap"}}, " (");
				if (!parameters.begin && parameters.end == "????") {
					ardates.appendChild(archivedDate(parameters.end, parameters.target));
				} else {
					if (parameters.begin) { ardates.appendChild(archivedDate(parameters.begin, parameters.target)); }
					if (parameters.begin != parameters.end) { ardates.appendChild(document.createTextNode("—")); }
					if (parameters.end && parameters.begin != parameters.end) { ardates.appendChild(archivedDate(parameters.end, parameters.target)); }
				}
				ardates.appendChild(document.createTextNode(")"));
				ardates.normalize();
				li.appendChild(ardates);
			}
			if (parameters.mbid) {
				addAfter(createTag("div", {a: {class: "icon img edit-item"}, s: {opacity: ".5"}}, createTag("a", {a: {title: "edit this URL relationship", href: "/url/" + parameters.mbid + "/edit"}, s: {color: "transparent"}}, "edit")), li.querySelector("a"));
				addAfter(document.createTextNode(" "), li.querySelector("a"));
			}
		}
		if (typeof parameters.enabledDefaultAutolink != "undefined") {
			li.classList.add("defaultAutolink");
			var cb = li.appendChild(createTag("input", {a: {type: "checkbox"}, e: {click: function(event) {
				this.parentNode.classList.toggle("disabled", !this.checked);
				var loadedSettings = JSON.parse(localStorage.getItem(userjs + "enabled-default-autolinks")) || {};
				if (this.checked) {
					delete loadedSettings[this.parentNode.getAttribute("ref")];
				} else {
					loadedSettings[this.parentNode.getAttribute("ref")] = false;
				}
				localStorage.setItem(userjs + "enabled-default-autolinks", JSON.stringify(loadedSettings));
			}}}));
			if (parameters.enabledDefaultAutolink === true) {
				cb.checked = true;
			} else if (parameters.enabledDefaultAutolink === false) {
				li.classList.add("disabled");
				cb.checked = false;
			}
		}
		var favurltest = (typeof parameters.target == "string") ? parameters.target : parameters.target.action;
		var favclass = "no";
		// MusicBrainz cached favicon CSS classes
		var searchdomain = favurltest.match(/site:([^+]*)\+/);
		var urldomain = searchdomain ? searchdomain[1] : favurltest.split("/")[2];
		for (var classdomain in faviconClasses) if (faviconClasses.hasOwnProperty(classdomain)) {
			if (urldomain.match(classdomain)) {
				favclass = faviconClasses[classdomain];
				break;
			}
		}
		if (favclass != "no") {
			li.classList.add(favclass + "-favicon");
		} else {
			// Static favicon URL dictionary
			var favurlfound = false;
			for (var part in favicons) if (favicons.hasOwnProperty(part)) {
				if (favurltest.indexOf(part) != -1) {
					favurlfound = favicons[part];
					break;
				}
			}
			if (!guessOtherFavicons && !favurlfound) {
				li.classList.add("no-favicon");
			} else {
				// arbitrary /favicon.ico load try out
				if (guessOtherFavicons && !favurlfound) {
					favurlfound = favurltest.substr(0, favurltest.indexOf("/", 8)) + "/favicon.ico";
				}
				var ifit = favicontry.length;
				favicontry[ifit] = new Image();
				favicontry[ifit].addEventListener("error", function (event) {
					this.li.classList.add("no-favicon");
				});
				favicontry[ifit].addEventListener("load", function (event) {
					clearTimeout(this.to);
					this.li.style.setProperty("background-image", "url(" + this.src + ")");
					this.li.style.setProperty("background-size", "16px 16px");
				});
				favicontry[ifit].li = li;
				favicontry[ifit].src = favurlfound;
				favicontry[ifit].to = setTimeout(function() {
					// don’t wait for more than 5 seconds
					favicontry[ifit].src = "";
					favicontry[ifit].li.classList.add("no-favicon");
				}, 5000);
			}
		}
	} else {
		// This is a header
		var li = createTag("li", {s: {fontWeight: "bold"}}, parameters.text);
		if (parameters.text.indexOf(" ") === 0) {
			// Level 1 header
			li.style.setProperty("padding-top", "0px");
			extlinks.insertBefore(li, extlinks.lastChild);
		} else {
			// Level 2 header
			li.style.setProperty("padding", "0px");
			li.style.setProperty("float", "right");
			extlinks.appendChild(li);
		}
		extlinks.insertBefore(document.createElement("hr"), li);
	}
	if (newLink) {
		li.style.setProperty("opacity", extlinksOpacity);
		if (parameters.target) { extlinks.appendChild(li); }
	}
	return newLink;
}
function weirdobg() {
	var weirdo = userjs + (new Date().getTime());
	try { open("", weirdo).blur(); } catch(error) {}
	self.focus();
	return weirdo;
}
function error(code, text) {
	var ldng = document.getElementById(userjs + "-loading");
	if (ldng) {
		ldng.setAttribute("id", userjs + "-error");
		ldng.style.setProperty("background", "pink");
		ldng.replaceChild(document.createTextNode("Error " + code), ldng.firstChild);
		ldng.appendChild(createTag("a", {a: {href: arelsws}}, "*"));
		ldng.appendChild(document.createTextNode(" in "));
		ldng.appendChild(createTag("a", {a: {href: "http://userscripts-mirror.org/scripts/show/108889"}}, "all links"));
		ldng.appendChild(document.createTextNode(" ("));
		ldng.appendChild(createTag("a", {e: {click: function(event) {
			var err = document.getElementById(userjs + "-error");
			if (err) { err.parentNode.removeChild(err); }
			main();
		}}}, "retry"));
		ldng.appendChild(document.createTextNode(")"));
		ldng.appendChild(document.createElement("br"));
		ldng.appendChild(createTag("i", {}, text));
	} else {
		loading(true);
		error(code, text);
	}
}
function loading(on) {
	var ldng = document.getElementById(userjs + "-loading");
	if (on && !ldng) {
		extlinks.appendChild(createTag("li", {a: {id: userjs + "-loading"}}, createTag("img", {a: {alt: "loading all links…", src: "/static/images/icons/loading.gif"}})));
		var li = extlinks.querySelector("ul.external_links > li.all-relationships");
		if (li) {
			li.style.setProperty("display", "none");
		}
	} else if (ldng && !on) {
		ldng.parentNode.removeChild(ldng);
	}
}
function archivedDate(date, url) {
	var text = date == "????" ? "ended" : date.replace(/-/g, "‐");
	if (!url.match(/\.archive\.org\//)) {
		var archiveStamp = "*";
		if (date != "????") {
			archiveStamp = date.replace(/\D/g, "");
			while (archiveStamp.length < 14) archiveStamp += "0";
		}
		return createTag("a", {a: {href: "//wayback.archive.org/web/" + archiveStamp + "/" + url.replace(/https?:\/\//, ""), title: "Internet Archive Wayback Machine capture"}}, text);
	} else {
		return document.createTextNode(text);
	}
}
function nsr(prefix) {
	switch (prefix) {
		case "mb":
			return "http://musicbrainz.org/ns/mmd-2.0#";
		default:
			return null;
	}
}
function guessNavigatorLanguages() {
	if (Array.isArray(navigator.languages)) {
		return navigator.languages;
	} else {
		var language = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage;
		if (language) {
			return [language];
		} else {
			return [];
		}
	}
}
function parseLanguages(inputLanguages) {
	var outputLanguages = [];
	for (var il = 0; il < inputLanguages.length; il++) {
		var nextLanguage = inputLanguages[il];
		if (inputLanguages[il] == "navigator") {
			var navigatorLanguages = guessNavigatorLanguages();
			for (var nl = 0; nl < navigatorLanguages.length; nl++) {
				nextLanguage = navigatorLanguages[nl];
				if (outputLanguages.indexOf(nextLanguage) < 0) {
					outputLanguages.push(nextLanguage);
				}
			}
		} else {
			if (inputLanguages[il] == "musicbrainz") {
				nextLanguage = document.documentElement.getAttribute("lang") || "en";
			}
			if (outputLanguages.indexOf(nextLanguage) < 0) {
				outputLanguages.push(nextLanguage);
			}
		}
	}
	return splitLanguages(outputLanguages);
}
function splitLanguages(inputLanguages) {
	var outputLanguages = [];
	for (var il = 0; il < inputLanguages.length; il++) {
		outputLanguages.push(inputLanguages[il]);
		if (inputLanguages[il].match(/-/)) {
			var splitLanguage = inputLanguages[il].split("-")[0];
			if (outputLanguages.indexOf(splitLanguage) < 0) {
				outputLanguages.push(splitLanguage);
			}
		}
	}
	return outputLanguages;
}
function configureModule(event) {
	switch (event.target.getAttribute("title")) {
		case "configure user autolinks":
			//TODO: provide a real editor
			var loadedUserAutolinks = localStorage.getItem(userjs + "user-autolinks") || {};
			var newUserAutolinks = prompt("Edit your user autolinks\r\nCopy/paste in a real editor\r\nSorry for such an awful prompt\r\n\r\nAvailable variables: %artist-id% (MBID), %arist-name%, %artist-sort-name% and %artist-family-name-first%\r\n\r\nExample: {\"xyz\": \"//duckduckgo.com/?q=%artist-name%+xyz\",\r\n\"XYZ\": \"//duckduckgo.com/?q=%artist-name%+XYZ\",\r\n\"abc\": \"/ws/2/artist/%artist-id%?inc=works\",\r\n\"La FNAC\": \"//recherche.fnac.com/SearchResult/ResultList.aspx?SCat=3%211&Search=%artist-name%&sft=1&sa=0\"}", loadedUserAutolinks);
			if (newUserAutolinks && newUserAutolinks != loadedUserAutolinks && JSON.stringify(newUserAutolinks)) {
				localStorage.setItem(userjs + "user-autolinks", newUserAutolinks);
			}
			break;
		case "configure default autolinks":
			//TODO: refresh default autolink statuses
			extlinks.classList.toggle("configure");
			break;
		case "choose wikipedia languages":
			var navigatorLanguages = splitLanguages(guessNavigatorLanguages());
			var musicbrainzLanguage = splitLanguages([document.documentElement.getAttribute("lang") || "en"])[0];
			var loadedLanguages = localStorage.getItem(userjs + "languages") || JSON.stringify(rawLanguages);
			var newLanguages = prompt("Choose your favourite language(s)\r\n\r\nMeta languages are:\r\n- \"navigator\" for navigator settings, currently " + (navigatorLanguages.length > 0 ? "detected as " + JSON.stringify(navigatorLanguages).replace(/,/g, "$& ") : "undetected") + "\r\n- \"musicbrainz\" for MusicBrainz UI settings, currently " + (musicbrainzLanguage ? "detected as [" + JSON.stringify(musicbrainzLanguage) + "]" : "undetected") + "\r\n\r\nDefault: [\"navigator\", \"musicbrainz\"]\r\nExample 2: [\"fr\", \"en\", \"vi\", \"ja\"]\r\nExample 3: [\"en\"]\r\nExample 4: []", loadedLanguages.replace(/,/g, "$& "));
			if (newLanguages && newLanguages != loadedLanguages && JSON.stringify(newLanguages)) {
				localStorage.setItem(userjs + "languages", newLanguages);
				rawLanguages = newLanguages;
			}
			break;
	}
}
