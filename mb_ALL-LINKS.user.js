// ==UserScript==
// @name         mb. ALL LINKS
// @version      2020.2.17
// @description  Hidden links include fanpage, social network, etc. (NO duplicates) Generated autolinks (configurable) includes plain web search, auto last.fm, Discogs and LyricWiki searches, etc. Shows begin/end dates on URL and provides edit link. Expands Wikidata links to wikipedia articles.
// @compatible   vivaldi(2.11.1811.33)+violentmonkey my setup
// @compatible   firefox(64.0)+greasemonkey          tested sometimes
// @compatible   chrome+violentmonkey                should be same as vivaldi
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2011-08-02; http://userscripts-mirror.org/scripts/show/108889
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=263111&v=2018.3.14
// @grant        none
// @match        *://*.mbsandbox.org/area/*
// @match        *://*.mbsandbox.org/artist/*
// @match        *://*.mbsandbox.org/event/*
// @match        *://*.mbsandbox.org/instrument/*
// @match        *://*.mbsandbox.org/label/*
// @match        *://*.mbsandbox.org/place/*
// @match        *://*.mbsandbox.org/recording/*
// @match        *://*.mbsandbox.org/release/*
// @match        *://*.mbsandbox.org/release-group/*
// @match        *://*.mbsandbox.org/series/*
// @match        *://*.mbsandbox.org/url/*
// @match        *://*.mbsandbox.org/work/*
// @match        *://*.musicbrainz.org/area/*
// @match        *://*.musicbrainz.org/artist/*
// @match        *://*.musicbrainz.org/event/*
// @match        *://*.musicbrainz.org/instrument/*
// @match        *://*.musicbrainz.org/label/*
// @match        *://*.musicbrainz.org/place/*
// @match        *://*.musicbrainz.org/recording/*
// @match        *://*.musicbrainz.org/release/*
// @match        *://*.musicbrainz.org/release-group/*
// @match        *://*.musicbrainz.org/series/*
// @match        *://*.musicbrainz.org/url/*
// @match        *://*.musicbrainz.org/work/*
// @exclude      *.org/*/*/*annotat*
// @exclude      *.org/*/*/*create*
// @exclude      *.org/*/*/*delete*
// @exclude      *.org/*/*/*edit*
// @exclude      *.org/*/*/*merge*
// @exclude      *.org/*/*/*remove*
// @exclude      *.org/*/*/*split*
// @exclude      *.org/*/*/add-alias*
// @exclude      *.org/*/*annotat*
// @exclude      *.org/*/*create*
// @exclude      *.org/*/*delete*
// @exclude      *.org/*/*edit*
// @exclude      *.org/*/*merge*
// @exclude      *.org/*/*remove*
// @exclude      *.org/*/*split*
// @exclude      *.org/release/add
// @exclude      *.org/release/add?*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* hint for Opera 12 users allow opera:config#UserPrefs|Allowscripttolowerwindow and opera:config#UserPrefs|Allowscripttoraisewindow */
var userjs = "jesus2099_all-links_";
var nonLatinName = /[\u0384-\u1cf2\u1f00-\uffff]/; // U+2FA1D is currently out of js range
var rawLanguages = JSON.parse(localStorage.getItem(userjs + "languages")) || ["navigator", "musicbrainz"];
// Available tokens:
// - for all entity pages: %entity-type% %entity-mbid% %entity-name%
// - for "that" type entity pages: %that-mbid% %that-name% where "that" is an entity type in the above @include list
// - for artist entity pages: %artist-sort-name% %artist-family-name-first% %artist-latin-script-name%
// - for url entity pages: %url-target% (while %entity-name% and %url-name% are deliberately ignored)
var hiddenLinks = {
	en: "Hidden links",
	fr: "Liens cachés"
};
var webSearchLinks = {
	title: {
		en: "Search the web",
		de: "Durchsuchen das Web",
		fr: "Chercher sur le Web",
		nl: "Zoeken op het Web"
	},
	items: {
		webPageSearch: {
			title: {en: "Web pages", de: "Webseiten", fr: "Pages Web", nl: "Webpagina’s"},
			target: "//duckduckgo.com/?q=%entity-name%"
		},
		webPageSearchPlusQuotes: {
			title: {en: "Web pages (exact)", de: "Webseiten (genaue)", fr: "Pages Web (exacte)", nl: "Webpagina’s (exacten)"},
			target: [
				"//duckduckgo.com/?q=%2B%22%entity-name%%22",
				"//duckduckgo.com/?q=%2B%22%url-target%%22"
			]
		},
		imageSearch: {
			title: {en: "Images", de: "Bilder", fr: "Images", nl: "Afbeeldingen"},
			target: "//duckduckgo.com/?q=%entity-name%+!i"
		},
		videoSearch: {
			title: {en: "Videos", de: "Videos", fr: "Vidéos", nl: "Video’s"},
			target: "//duckduckgo.com/?q=%entity-name%+!v"
		},
		waybackMachineHistory: {
			title: {en: "Archive history", de: "Archivgeschichte", fr: "Versions archivées", nl: "Archiefgeschiedenis"},
			target: "//web.archive.org/web/*/%url-target%"
		}
	}
};
var whitelistSearchLinks = {
	title: {
		de: "Durchsuchen in die weiße Liste",
		en: "Search in the whitelist",
		fr: "Sites autorisés",
		nl: "Zoeken in de witte lijst"
	},
	items: {
		lyricsDBs: {
			title: {
				de: "Liedtext",
				en: "Lyrics",
				fr: "Paroles",
				nl: "Liedtekst"
			},
			items: {
				Decoda: [
					{en: "//www.decoda.com/search?q=%artist-name%"},
					{en: "//www.decoda.com/search?q=%work-name%"}
				],
				Directlyrics: [
					{en: "//startpage.com/do/search?q=site:directlyrics.com/*-artist.html+%artist-name%"},
					{en: "http://www.directlyrics.com/search/?q=%work-name%"}
				],
				LyricWikia: [
					{en: "http://lyrics.wikia.com/wiki/Special:Search?search=%artist-name%"},
					{en: "http://lyrics.wikia.com/wiki/Special:Search?search=%release-group-name%"},
					{en: "http://lyrics.wikia.com/wiki/Special:Search?search=%work-name%"}
				]
			}
		},
		scoreDBs: {
			title: {
				de: "Partitur",
				en: "Score",
				fr: "Partitions",
				nl: "Bladmuziek"
			},
			items: {
				"IMSLP/Petrucci Music Library": "//duckduckgo.com/?q=site:imslp.org+%work-name%"
			}
		},
		regionalDBs: {
			title: {
				de: "Pro Gebiet",
				en: "By area",
				fr: "Par région",
				nl: "Per Gebied"
			},
			items: {
				DE: {
					title: {
						de: "Deutschland",
						en: "Germany",
						fr: "Allemagne",
						nl: "Duitsland"
					},
					items: {
						"Musik-Sammler.de": [
							{de: "https://www.musik-sammler.de/search/%artist-name%/?q=artist"},
							{de: "https://www.musik-sammler.de/search/%release-name%/?q=medium"},
							{de: "https://www.musik-sammler.de/search/%release-group-name%/?q=album"}
						],
						"DNB - Deutsches Musikarchiv": {de: "https://portal.dnb.de/opac.htm?query=%28mat%3DMusic+OR+cod%3Dmt%29+AND+%release-name%&method=simpleSearch&cqlMode=true"}
					}
				},
				FR: {
					title: {
						de: "Frankreich",
						en: "France",
						fr: "France",
						nl: "Frankrijk"
					},
					items: {
						"Encyclopédisque": [
							{fr: "http://www.encyclopedisque.fr/recherche.html?ra=%artist-name%&sp=1#resultat"},
							{fr: "http://www.encyclopedisque.fr/recherche.html?rd=%release-name%&sp=1#resultat"}
						]
					}
				}
			}
		},
		otherDBs: {
			title: {
				de: "Andere Datenbanken",
				en: "Other databases",
				fr: "Autres bases de données",
				nl: "Andere databases"
			},
			items: {
				AllMusic: {
					target: [
						{en: "//www.allmusic.com/search/artists/%artist-name%"},
						{en: "//www.allmusic.com/search/labels/%label-name%"},
						{en: "//www.allmusic.com/search/songs/%recording-name%"},
						{en: "//www.allmusic.com/search/all/%release-name%"},
						{en: "//www.allmusic.com/search/albums/%release-group-name%"},
						{en: "//www.allmusic.com/search/compositions/%work-name%"}
					]
				},
				"BBC Music": {"cy en ga gd": "//www.bbc.co.uk/music/artists/%artist-mbid%"},
				Discogs: [
					{"de en es fr it ja": "//www.discogs.com/%language%/search?q=%artist-name%&type=artist"},
					{"de en es fr it ja": "//www.discogs.com/%language%/search?q=%release-name%&type=release"},
					{"de en es fr it ja": "//www.discogs.com/%language%/search?q=%release-group-name%&type=master"},
					{"de en es fr it ja": "//www.discogs.com/%language%/search?q=%label-name%&type=label"}
				],
				GeoNames: [
					{en: "http://www.geonames.org/search.html?q=%area-name%"},
					{en: "http://www.geonames.org/advanced-search.html?q=%place-name%&featureClass=S"}
				],
				ISNI: {en: "//isni.oclc.nl/xslt/CMD?ACT=SRCHA&IKT=8006&TRM=%artist-name%"},
				"Last.fm (MBID)": {
					"en": "http://last.fm/mbid/%artist-mbid%",
					"de es fr it ja pl pt ru sv tr zh": "http://last.fm/%language%/mbid/%artist-mbid%"
				},
				lastfmName: {
					title: {en: "Last.fm (name)",	de: "Last.fm (Name)", es: "Last.fm (nombre)", fr: "Last.fm (nom)", it: "Last.fm (Nome)", ja: "Last.fm (名)", pl: "Last.fm (Nazwa)", pt: "Last.fm (nome)", ru: "Last.fm (имя)", sv: "Last.fm (namn)", tr: "Last.fm (ad)", zh: "Last.fm (名)"},
					target: {
						"en": "http://last.fm/search?q=%artist-name%",
						"de es fr it ja pl pt ru sv tr zh": "http://last.fm/%language%/search?q=%artist-name%"
					}
				},
				"Rate Your Music": [
					{en: "//rateyourmusic.com/search?searchtype=a&searchterm=%artist-name%"},
					{en: "//rateyourmusic.com/search?searchtype=b&searchterm=%label-name%"},
					{en: "//rateyourmusic.com/search?searchtype=l&searchterm=%release-name%"},
					{en: "//rateyourmusic.com/search?searchtype=r&searchterm=%work-name%"}
				],
				SecondHandSongs: [
					{en: "//secondhandsongs.com/search/artist?sel[]=common_name&val[]=%artist-name%"},
					{en: "//secondhandsongs.com/search/label?sel[]=name&val[]=%label-name%"},
					{en: "//secondhandsongs.com/search/performance?sel[]=title&val[]=%recording-name%"},
					{en: "//secondhandsongs.com/search/release?sel[]=title&val[]=%release-name%"},
					{en: "//secondhandsongs.com/search/work?sel[]=title&val[]=%work-name%"}
				],
				WhoSampled: [
					{en: "//www.whosampled.com/search/artists/?q=%artist-name%"},
					{en: "//www.whosampled.com/search/tracks/?q=%recording-name%"}
				],
				Wikipedia: "//duckduckgo.com/?q=site:wikipedia.org+%22%entity-name%%22"
			}
		}
	}
};
var additionalSearchLinks = {
	title: {
		de: "Durchsuchen noch mehr",
		en: "Search further",
		fr: "Chercher plus loin",
		nl: "Zoeken verder naar"
	},
	items: {
		lyricsDBs: {
			title: {
				de: "Liedtext",
				en: "Lyrics",
				fr: "Paroles",
				nl: "Liedtekst"
			},
			items: {
				WikiParoles: {fr: "http://fr.lyrics.wikia.com/wiki/Special:Search?search=%work-name%"}
			}
		},
		regionalDBs: {
			title: {
				de: "Pro Gebiet",
				en: "By area",
				fr: "Par région",
				nl: "Per Gebied"
			},
			items: {
				FR: {
					title: {
						de: "Frankreich",
						en: "France",
						fr: "France",
						nl: "Frankrijk"
					},
					items: {
						SACEM: {
							fr: "https://repertoire.sacem.fr/resultats?filters=titles&query=%work-name%#searchBtn",
							en: "https://repertoire.sacem.fr/en/results?filters=titles&query=%work-name%#searchBtn"
						},
						sacemWorks: {
							title: {fr: "SACEM (œuvres)", en: "SACEM (works)"},
							target: [
								{
									fr: "https://repertoire.sacem.fr/resultats?filters=parties&query=%artist-name%#searchBtn",
									en: "https://repertoire.sacem.fr/en/results?filters=parties&query=%artist-name%#searchBtn"
								}, {
									fr: "https://repertoire.sacem.fr/resultats?filters=parties&query=%label-name%#searchBtn",
									en: "https://repertoire.sacem.fr/en/results?filters=parties&query=%label-name%#searchBtn"
								}
							]
						}
					}
				}
			}
		}
	}
};
var searchLinks = {items: {
	web: webSearchLinks,
	whitelist: whitelistSearchLinks,
	additional: additionalSearchLinks
}};
var disabledSearchLinks = {};
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
	"deezer.com": "https://e-cdns-files.dzcdn.net/cache/images/common/favicon/favicon-16x16.526cde4edf20647be4ee32cdf35c1c13.png",
	"lastfm.": "//musicbrainz.org/static/images/favicons/lastfm-16.png",
	"livedoor.jp": "http://blog.livedoor.jp/favicon.ico",
	"rakuten.co.jp": "//plaza.rakuten.co.jp/favicon.ico",
	"yahoo.": "http://blogs.yahoo.co.jp/favicon.ico",
};
var favicontry = [];
var guessOtherFavicons = true;
var sidebar = document.getElementById("sidebar");
var tokenValues = {};
var entityUrlRelsWS = self.location.protocol + "//" + self.location.host + "/ws/2/%entity-type%/%entity-mbid%?inc=url-rels";
var extlinks;
var j2css = document.createElement("style");
j2css.setAttribute("type", "text/css");
document.head.appendChild(j2css);
j2css = j2css.sheet;
j2css.insertRule("ul.external_links > li.defaultAutolink > input[type='checkbox'] { display: none; }", 0);
j2css.insertRule("ul.external_links > li.defaultAutolink.disabled { text-decoration: line-through; display: none; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink.disabled { display: list-item; }", 0);
j2css.insertRule("ul.external_links.configure > li.defaultAutolink > input[type='checkbox'] { display: inline; }", 0);
j2css.insertRule("div#sidebar > [class^='" + userjs + "'], div#sidebar > [class^='" + userjs + "'] + ul  { background-color: #fee; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks.emptySection { display: none; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks li.emptySection { display: none; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks input[type='checkbox'] { display: none; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks.disabled { text-decoration: line-through; display: none; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks .disabled { text-decoration: line-through; display: none; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks.emptySection { display: block; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks li.emptySection { display: list-item; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks input[type='checkbox'] { display: inline; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks.disabled { display: block; }", 0);
j2css.insertRule("div#sidebar > ul.configure." + userjs + "searchLinks.disabled { display: none; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks li.disabled { display: list-item; }", 0);
j2css.insertRule("div#sidebar > .configure." + userjs + "searchLinks ul.disabled { display: none; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks h3 { margin: 0; }", 0);
j2css.insertRule("div#sidebar > ." + userjs + "searchLinks h4 { margin: 0; }", 0);
j2css.insertRule("div#sidebar > ul." + userjs + "userLinks > li.subsectionHeader { font-weight: 'bold'; padding: '0px'; float: 'right'; }", 0);
main();
function main() {
	if (sidebar) {
		var entityMatch = self.location.href.match(/\/([a-z\-]*)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
		var entityType = tokenValues["%entity-type%"] = entityMatch[1];
		var entityMBID = tokenValues["%entity-mbid%"] = entityMatch[2];
		tokenValues["%" + entityType + "-mbid%"] = entityMBID;
		/* Hidden links and autolinks */
		if (entityType && entityMBID) {
			// Tokens for autolinks
			var entityHeaderClass = (entityType === "release-group" ? "rg" : entityType) + "header";
			var entityNameNode = document.querySelector("div#content > div." + entityHeaderClass + " > h1 a, div#content > div." + entityHeaderClass + " > h1 span[href]"); /* for compatibilly with https://gist.github.com/jesus2099/4111760 */
			if (entityNameNode) {
				var entityName = tokenValues["%entity-name%"] = entityNameNode.textContent.trim();
				tokenValues["%" + entityType + "-name%"] = entityName;
				if (entityType == "artist") {
					var artistid = tokenValues["%artist-id"] = entityMBID; /* for user links backward compatibility */
					var artistname = entityName;
					var artistsortname, artistsortnameSwapped = "";
					artistsortname = tokenValues["%artist-sort-name%"] = entityNameNode.getAttribute("title");
					if (!artistname.match(nonLatinName)) {
						tokenValues["%artist-family-name-first%"] = artistsortname;
						tokenValues["%artist-latin-script-name%"] = artistname;
					} else {
						var tmpsn = artistsortname.split(",");
						for (var isn = tmpsn.length - 1; isn >= 0; isn--) {
							artistsortnameSwapped += tmpsn[isn].trim();
							if (isn != 0) {
								artistsortnameSwapped += " ";
							}
						}
						tokenValues["%artist-family-name-first%"] = artistname;
						tokenValues["%artist-latin-script-name%"] = artistsortnameSwapped;
					}
				} else if (entityType == "url") {
					delete tokenValues["%entity-name%"];
					delete tokenValues["%url-name%"];
					tokenValues["%url-target%"] = entityName;
				}
			}
			extlinks = sidebar.querySelector(".external_links");
			if (!extlinks) {
				extlinks = addAfter(createTag("ul", {a: {class: "external_links"}}, createTag("li", {}, "No white‐listed links yet.")), sidebar.querySelector("div.sidebar-tags"));
				addAfter(createTag("h2", {a: {class: "external-links"}}, "External links"), sidebar.querySelector("div.sidebar-tags"));
			} 
			// Hidden links
			entityUrlRelsWS = entityUrlRelsWS.replace(/%entity-type%/, entityType).replace(/%entity-mbid%/, entityMBID);
			addHiddenLinks();
			// Search links
			loadDisabledSearchLinks();
			for (var sectionKey in searchLinks.items) if (searchLinks.items.hasOwnProperty(sectionKey)) {
				addSearchLinksSection([sectionKey], sidebar);
			}
			// User links
			addUserLinks();
		}
		/* Wikidata to Wikipedia */
		if (rawLanguages && Array.isArray(rawLanguages) && rawLanguages.length > 0) {
			var languages = parseLanguages(rawLanguages);
			var wikidatas = sidebar.querySelectorAll("ul.external_links > li a[href*='wikidata.org/wiki/Q']");
			for (var wd = 0; wd < wikidatas.length; wd++) {
				var wikidataID = wikidatas[wd].getAttribute("href").match(/Q\d+$/);
				if (wikidataID) {
					if (!wikidatas[wd].parentNode.querySelector("a.edit-languages")) {
						addAfter(createTag("div", {a: {class: "icon img"}, s: {backgroundImage: "url(/static/images/icons/cog.png)", opacity: ".5"}}, createTag("a", {a: {class: "edit-languages", title: "choose languages"}, s: {color: "transparent"}, e: {click: configureModule}}, "choose languages")), wikidatas[wd]);
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
									if (!sidebar.querySelector("ul.external_links > li a[href$='" + href + "']")) {
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
	if (parameters.target) {
		// This is a link
		var li;
		if (typeof parameters.target === "string") {
			var existingLink = 
				sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "']")
				// MBS adds a trailing code to ASIN URL https://github.com/metabrainz/musicbrainz-server/blob/7b16dfae25fef7ef570bbc96e2d7cb71f123139e/lib/DBDefs/Default.pm#L318-L328
				|| parameters.target.match(/\bamazon\.ca\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music0b72-20']")
				|| parameters.target.match(/\bamazon\.co\.jp\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=musicbrainzjp-22']")
				|| parameters.target.match(/\bamazon\.co\.uk\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music080d-21']")
				|| parameters.target.match(/\bamazon\.com\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=musicbrainz0d-20']")
				|| parameters.target.match(/\bamazon\.de\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music059-21']")
				|| parameters.target.match(/\bamazon\.fr\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music083d-21']")
				|| parameters.target.match(/\bamazon\.it\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music084d-21']")
				|| parameters.target.match(/\bamazon\.es\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "?tag=music02e-21']")
				// MBS adds a trailing slash to viaf URL https://github.com/jesus2099/konami-command/issues/293#issuecomment-376875307
				|| parameters.target.match(/\bviaf\b/) && sidebar.querySelector("ul.external_links > li a[href$='" + parameters.target.replace(/^https?:/, "") + "/']")
			;
			if (existingLink) {
				newLink = false;
				li = getParent(existingLink, "li");
			} else {
				li = createTag("li", {a: {ref: parameters.text}}, createTag("a", {a: {href: parameters.target}}, parameters.text));
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
		setFavicon(li, (typeof parameters.target == "string") ? parameters.target : parameters.target.action);
	} else {
		// This is a header
		var li = createTag("li", {s: {fontWeight: "bold"}, a: {class: "separator"}}, parameters.text);
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
	}
	if (newLink) {
		if (!parameters.mbid) { li.style.setProperty("opacity", ".5"); }
		if (parameters.target) { extlinks.appendChild(li); }
	}
	return newLink;
}
function addHiddenLinks() {
	loading(true);
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
								addExternalLink({text: " " + getLocalisedText(hiddenLinks)});
							}
						}
					}
				}
			} else if (this.status >= 400 || this.status == 0) {
				var txt = this.responseText.match(/<error><text>(.+)<\/text><text>/);
				txt = txt ? txt[1] : "";
				error(this.status, txt);
			}
		}
	};
	xhr.open("GET", entityUrlRelsWS, true);
	xhr.send(null);
}
function addSearchLinksSection(sectionPath, parentNode) {
	var level = sectionPath.length;
	var section = pathToItem(sectionPath);
	var sectionID = pathToID(sectionPath);
	var sectionTitleNode = createTag("h" + (1 + level), {a: {id: sectionID}}, section.title ? getLocalisedText(section.title) : sectionPath[sectionPath.length - 1]);
	if (level === 1) {
		sectionTitleNode.classList.add(userjs + "searchLinks");
		var landingSibling = false;
		for (var n = 0; n < parentNode.children.length; n++) {
			if (parentNode.children[n].classList.contains("editing")) {
				landingSibling = parentNode.children[n];
				break;
			}
		}
		if (landingSibling) {
			parentNode.insertBefore(sectionTitleNode, landingSibling);
		} else {
			parentNode.appendChild(sectionTitleNode);
		}
		if (section === webSearchLinks) {
			sectionTitleNode.appendChild(document.createTextNode(" "));
			sectionTitleNode.appendChild(
				createTag("a", {a: {title: "filter search links"}, s: {padding: "1px 3px"}, e: {click: configureModule}},
					createTag("img", {a: {src: "/static/images/icons/filter.png", alt: "filter search links", title: "filter search links"}})
				)
			);
		}
	} else {
		parentNode.appendChild(sectionTitleNode);
	}
	var sectionListNode = addAfter(createTag("ul", {a: {class: "external_links"}}), sectionTitleNode);
	if (level === 1) {
		sectionListNode.classList.add(userjs + "searchLinks");
	}
	if (section !== webSearchLinks) {
		var sectionCBox = sectionTitleNode.appendChild(
			createTag("input", {a: {type: "checkbox"}, s: {float: "right", margin: "1px"}, e: {click: function(event) {
				toggleStorage(this.parentNode.id);
				this.parentNode.nextElementSibling.classList.toggle("disabled", !this.checked);
				if (this.parentNode.parentNode.id !== "sidebar") {
					this.parentNode.parentNode.classList.toggle("disabled", !this.checked);
					toggleEmpty(this.parentNode.parentNode, !this.checked);
				} else {
					this.parentNode.classList.toggle("disabled", !this.checked);
				}
			}}})
		);
		sectionCBox.checked = !disabledSearchLinks[sectionID];
		if (disabledSearchLinks[sectionID]) {
			sectionListNode.classList.add("disabled");
			if (level === 1) {
				sectionTitleNode.classList.add("disabled");
			} else {
				parentNode.classList.add("disabled");
			}
		}
	}
	var hasNothing = true;
	var hasVisibleContent = false;
	for (var itemKey in section.items) if (section.items.hasOwnProperty(itemKey)) {
		var item = section.items[itemKey];
		var itemPath = sectionPath.concat([itemKey]);
		var itemID = pathToID(itemPath);
		var itemNode = createTag("li", {a: {id: itemID}});
		if (typeof item === "object" && item.items) {
			hasNothing = false;
			sectionListNode.appendChild(itemNode);
			var subIsVisible = addSearchLinksSection(itemPath, itemNode);
			if (subIsVisible) {
				hasVisibleContent = true;
			} else {
				itemNode.classList.add("emptySection");
			}
		} else {
			// "key": <target> → "key": {"target": <target>}
			if (typeof item !== "object" || !item.target) {
				item = {target: item};
				// section.items[itemKey] = item; // not sure I need this
			}
			var itemTarget = false;
			if (Array.isArray(item.target)) {
				for (var t = 0; t < item.target.length; t++) {
					itemTarget = replaceAllTokens(getLocalisedText(item.target[t]));
					if (itemTarget) {
						break;
					}
				}
			} else {
				itemTarget = replaceAllTokens(getLocalisedText(item.target));
			}
			if (itemTarget) {
				hasNothing = false;
				sectionListNode.appendChild(itemNode);
				itemNode.appendChild(createTag("a", {a: {href: itemTarget}}, item.title ? getLocalisedText(item.title) : itemKey));
				setFavicon(itemNode, itemTarget);
				var itemCBox = itemNode.appendChild(
					createTag("input", {a: {type: "checkbox"}, s: {float: "right", margin: "1px"}, e: {click: function(event) {
						this.parentNode.classList.toggle("disabled", !this.checked);
						toggleStorage(this.parentNode.id);
						toggleEmpty(this.parentNode, !this.checked);
					}}})
				);
				itemCBox.checked = !disabledSearchLinks[itemID];
				if (disabledSearchLinks[itemID]) {
					itemNode.classList.add("disabled");
				} else {
					hasVisibleContent = true;
				}
			}
		}
	}
	if (!hasVisibleContent) {
		if (level === 1 && section !== webSearchLinks) {
			sectionTitleNode.classList.add("emptySection");
			sectionListNode.classList.add("emptySection");
		}
		if (hasNothing) {
			var noItemNote = {
				de: "nichts für diesen Entitätstyp",
				en: "nothing for this entity type",
				fr: "rien pour ce type d’entité",
				nl: "niets voor dit soort entiteit"
			};
			sectionListNode.appendChild(createTag("li", {s: {fontStyle: "italic", opacity: "0.5"}}, getLocalisedText(noItemNote)));
		}
	}
	return hasVisibleContent && !disabledSearchLinks[sectionID];
}
function addUserLinks() {
	var loadedUserLinks = JSON.parse(localStorage.getItem(userjs + "user-autolinks")) || {};
	var filteredUserLinks = {};
	var currentSection = "";
	var currentSectionIsEmpty = true;
	for (var title in loadedUserLinks) if (loadedUserLinks.hasOwnProperty(title)) {
		var target = loadedUserLinks[title];
		if (!target || target === "") {
			if (currentSectionIsEmpty) {
				delete filteredUserLinks[currentSection];
			}
			currentSection = title;
			currentSectionIsEmpty = true;
			filteredUserLinks[title] = null;
		}
		if (typeof target === "string") {
			target = replaceAllTokens(target);
			if (target) {
				currentSectionIsEmpty = false;
				filteredUserLinks[title] = target;
			}
		}
	}
	if (currentSectionIsEmpty) {
		delete filteredUserLinks[currentSection];
	}
	if (!Object.getOwnPropertyNames(filteredUserLinks).length) {
		return;
	}
	var userLinksTitle = {
		de: "Meine Links",
		en: "My links",
		fr: "Mes liens",
		nl: "Mijn links"
	};
	var userLinksTitleNode = createTag("h2", {}, getLocalisedText(userLinksTitle));
	userLinksTitleNode.appendChild(document.createTextNode(" "));
	userLinksTitleNode.appendChild(
		createTag("a", {a: {title: "configure user autolinks"}, s: {padding: "0px"}, e: {click: configureModule}},
			createTag("img", {a: {src: "/static/images/icons/cog.png", alt: "configure user autolinks", title: "configure user autolinks"}})
		)
	);
	var landingSibling = false;
	for (var n = 0; n < sidebar.children.length; n++)
		if (sidebar.children[n].classList.contains("editing")) {
			landingSibling = sidebar.children[n];
			break;
		}
	if (landingSibling) {
		sidebar.insertBefore(userLinksTitleNode, landingSibling);
	} else {
		parentNode.appendChild(userLinksTitleNode);
	}
	var userLinksListNode = createTag("ul", {a: {class: "external_links " + userjs + "userLinks"}})
	addAfter(userLinksListNode, userLinksTitleNode);
	for (var title in filteredUserLinks) if (filteredUserLinks.hasOwnProperty(title)) {
		var target = filteredUserLinks[title];
		var itemNode = createTag("li", {});
		if (target === null) {
			itemNode.classList.add("subsectionHeader", "separator");
			itemNode.appendChild(document.createTextNode(title));
		} else {
			itemNode.appendChild(createTag("a", {a: {href: target}}, title));
			setFavicon(itemNode, target);
		}
		userLinksListNode.appendChild(itemNode);
	}
}
function getLocalisedText(textSet) {
	if (typeof textSet === "string") {
		return textSet;
	}
	// Manages both "fr" and multinligual "fr vi ja en" formats
	var expanded = {};
	for (var key in textSet) if (textSet.hasOwnProperty(key)) {
		var allKeys = key.split(" ");
		for (var ak = 0; ak < allKeys.length; ak++)
			expanded[allKeys[ak]] = textSet[key].replace(/%language%/g, allKeys[ak]);
	}
	textSet = expanded;
	var languages = parseLanguages(["musicbrainz", "navigator"]);
	for (var l = 0; l < languages.length; l++) {
		if (textSet.hasOwnProperty(languages[l])) {
			return textSet[languages[l]];
		}
	}
	return textSet[Object.getOwnPropertyNames(textSet)[0]];
}
function idToPath(id) {
	return id.replace(userjs + "searchLinks-", "").split("-");
}
function loadDisabledSearchLinks() {
	var loadedSettings = JSON.parse(localStorage.getItem(userjs + "disabled-search-links")) || {};
	for (var itemID in loadedSettings) if (loadedSettings.hasOwnProperty(itemID)) {
		var itemPath = idToPath(itemID);
		if (itemPath && pathToItem(itemPath)) {
			disabledSearchLinks[itemID] = true;
		}
	}
	delete disabledSearchLinks[pathToID(["web"])];
	localStorage.setItem(userjs + "disabled-search-links", JSON.stringify(disabledSearchLinks));
}
function pathToItem(path) {
	var item = searchLinks;
	for (var i = 0; i < path.length; i++) {
		item = item.items[path[i]];
		if (!item) {
			return false;
		}
	}
	return item;
}
function pathToID(path) {
	var id = userjs + "searchLinks";
	for (var i = 0; i < path.length; i++)
		id = id + "-" + path[i];
	return id;
}
function replaceAllTokens(string, encode) {
	var stringTokens = string.match(/%[a-z]+(?:-[a-z]+)+%/g);
	if (stringTokens) for (var t = 0; t < stringTokens.length; t++) {
		var token = stringTokens[t];
		if (!tokenValues.hasOwnProperty(token)) {
			return false;
		}
		string = string.replace(token, encode ? encodeURIComponent(tokenValues[token]) : tokenValues[token]);
	}
	return string;
}
function setFavicon(li, url) {
	var favclass = "no";
	// MusicBrainz cached favicon CSS classes
	var searchdomain = url.match(/site:([^+]*)\+/);
	var urldomain = searchdomain ? searchdomain[1] : url.split("/")[2];
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
			if (url.indexOf(part) != -1) {
				favurlfound = favicons[part];
				break;
			}
		}
		if (!guessOtherFavicons && !favurlfound) {
			li.classList.add("no-favicon");
		} else {
			// arbitrary /favicon.ico load try out
			if (guessOtherFavicons && !favurlfound) {
				favurlfound = url.substr(0, url.indexOf("/", 8)) + "/favicon.ico";
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
}
function toggleEmpty(itemNode, hide) {
	if (!hide) {
		if (itemNode.parentNode.parentNode.id === "sidebar") {
			itemNode.parentNode.classList.remove("emptySection");
			itemNode.parentNode.previousElementSibling.classList.remove("emptySection");
		} else {
			itemNode.parentNode.parentNode.classList.remove("emptySection");
			toggleEmpty(itemNode.parentNode.parentNode, hide);
		}
	} else if (!itemNode.parentNode.classList.contains(pathToID(["web"]))) {
		var allDisabled = true;
		var siblings = itemNode.parentNode.children;
		for (var n = 0; n < siblings.length; n++) {
			if ((!siblings[n].classList.contains("disabled")) && (!siblings[n].classList.contains("emptySection"))) {
				allDisabled = false;
				break;
			}
		}
		if (allDisabled) {
			if (itemNode.parentNode.parentNode.id === "sidebar") {
				itemNode.parentNode.classList.add("emptySection");
				itemNode.parentNode.previousElementSibling.classList.add("emptySection");
			} else {
				itemNode.parentNode.parentNode.classList.add("emptySection");
				toggleEmpty(itemNode.parentNode.parentNode, hide);
			}
		}
	}
}
function toggleStorage(itemID) {
	var toggledSettings = JSON.parse(localStorage.getItem(userjs + "disabled-search-links")) || {};
	if (toggledSettings[itemID]) {
		delete toggledSettings[itemID];
	} else {
		toggledSettings[itemID] = true;
	}
	localStorage.setItem(userjs + "disabled-search-links", JSON.stringify(toggledSettings));
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
		ldng.appendChild(createTag("a", {a: {href: entityUrlRelsWS}}, "*"));
		ldng.appendChild(document.createTextNode(" in "));
		ldng.appendChild(createTag("a", {a: {href: "http://userscripts-mirror.org/scripts/show/108889"}}, "all links"));
		ldng.appendChild(document.createTextNode(" ("));
		ldng.appendChild(createTag("a", {e: {click: function(event) {
			var err = document.getElementById(userjs + "-error");
			if (err) { err.parentNode.removeChild(err); }
			addHiddenLinks();
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
	var detectedLanguages = [];
	for (var il = 0; il < inputLanguages.length; il++) {
		var nextLanguage = inputLanguages[il];
		switch (nextLanguage) {
			case "navigator":
				detectedLanguages = detectedLanguages.concat(guessNavigatorLanguages());
				break;
			case "musicbrainz":
				detectedLanguages.push(document.documentElement.getAttribute("lang") || "en");
				break;
			default:
				detectedLanguages.push(nextLanguage);
		}
	}
	var outputLanguages = [];
	for (var dl = 0; dl < detectedLanguages.length; dl++) {
		var nextLanguage = detectedLanguages[dl];
		if (outputLanguages.indexOf(nextLanguage) < 0) {
			outputLanguages.push(nextLanguage);
			if (nextLanguage.match("-")) {
				var splitLanguage = nextLanguage.split("-")[0];
				if (outputLanguages.indexOf(splitLanguage) < 0) {
					outputLanguages.push(splitLanguage);
				}
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
			var newUserAutolinks = prompt("Edit your user autolinks\r\nCopy/paste in a real editor\r\nSorry for such an awful prompt\r\n\r\nAvailable variables:\r\n- for all entity pages: %entity-type%, %entity-mbid% and %entity-name%\r\n- for \"foobar\" entity pages: %foobar-mbid% and %foobar-name% where \"foobar\" is an entity type.\r\n- for artist entity pages: %artist-sort-name%, %artist-family-name-first% and %artist-latin-script-name%\r\n- for url entity pages: %url-target% (while %entity-name% and %url-name% are deliberately ignored)\r\n\r\nExample: {\"Search for reviews\": \"//duckduckgo.com/?q=%entity-name%+reviews\",\r\n\"Search for fans\": \"//duckduckgo.com/?q=%artist-name%+fans\",\r\n\"Works\": \"/ws/2/artist/%artist-mbid%?inc=works\",\r\n\"La FNAC\": \"http://recherche.fnac.com/SearchResult/ResultList.aspx?SCat=3%211&Search=%release-name%&sft=1&sa=0\"}", loadedUserAutolinks);
			if (newUserAutolinks && newUserAutolinks != loadedUserAutolinks && JSON.stringify(newUserAutolinks)) {
				localStorage.setItem(userjs + "user-autolinks", newUserAutolinks);
			}
			break;
		case "filter search links":
			var topSectionNodes = sidebar.children;
			for (var n = 0; n < sidebar.children.length; n++) {
				if (sidebar.children[n].classList.contains(userjs + "searchLinks")) {
					sidebar.children[n].classList.toggle("configure");
				}
			}
			break;
		case "choose languages":
			var defaultLanguages = parseLanguages(["navigator", "musicbrainz"]);
			var navigatorLanguages = guessNavigatorLanguages();
			var musicbrainzLanguage = document.documentElement.getAttribute("lang") || "en";
			var loadedLanguages = (localStorage.getItem(userjs + "languages") || JSON.stringify(rawLanguages)).replace(/,/g, "$& ").replace(/\s+/g, " ");
			var newLanguages = prompt("Choose your favourite language(s)\r\n\r\nType a language array: [\"favourite language\", \"second favourite\", …, \"least favourite\"]\r\n\r\nTwo meta languages can be used:\r\n- \"navigator\" for navigator settings, currently " + (navigatorLanguages.length > 0 ? "detected as " + JSON.stringify(navigatorLanguages).replace(/,/g, "$& ").replace(/\s+/g, " ") : "undetected") + "\r\n- \"musicbrainz\" for selected MusicBrainz UI language, currently " + (musicbrainzLanguage ? "detected as [" + JSON.stringify(musicbrainzLanguage) + "]" : "undetected") + "\r\n\r\nDefault:\r\n- [\"navigator\", \"musicbrainz\"], currently expands to " + JSON.stringify(defaultLanguages).replace(/,/g, "$& ").replace(/\s+/g, " ") + "\r\n\r\nSome examples:\r\n- [\"musicbrainz\", \"fr-FR\", \"en-GB\", \"vi\", \"ja\", \"navigator\"]\r\n- [\"fr\", \"en\", \"vi\", \"ja\"]\r\n- [\"en-GB\"]\r\n- [\"fr-FR\", \"navigator\", \"en-GB\", \"musicbrainz\"]\r\n- []" + "\r\n\r\nCurrent setting expands to " + JSON.stringify(parseLanguages(JSON.parse(loadedLanguages))).replace(/,/g, "$& ").replace(/\s+/g, " "), loadedLanguages);
			if (
				newLanguages
				&& (newLanguages = newLanguages.match(/\[(\s*["'](navigator|musicbrainz|\w{2}(-\w{2,}(-\w{2,})?)?)['"]\s*,?\s*)*]/))
				&& (newLanguages = newLanguages[0])
				&& newLanguages != loadedLanguages
				&& JSON.parse(newLanguages)
			) {
				localStorage.setItem(userjs + "languages", newLanguages);
				rawLanguages = JSON.parse(newLanguages);
			}
			break;
	}
}
