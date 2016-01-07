// ==UserScript==
// @name         mb. ALL LINKS
// @version      2015.12.6
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_ALL-LINKS.user.js
// @description  Hidden links include fanpage, social network, etc. (NO duplicates) Generated links (configurable) includes plain web search, auto last.fm, Discogs and LyricWiki searches, etc. Shows begin/end dates on URL and provides edit link.
// @homepage     http://userscripts-mirror.org/scripts/show/108889
// @coming-soon  https://github.com/jesus2099/konami-command/labels/mb_ALL-LINKS
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my setup
// @compatible   firefox(39)+greasemonkey    tested sometimes
// @compatible   chromium(46)+tampermonkey   tested sometimes
// @compatible   chrome+tampermonkey         should be same as chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-LINKS.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_ALL-LINKS.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2011-08-02
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=84017&v=2015.11.2
// @grant        none
// @include      http*://*musicbrainz.org/artist/*
// @exclude      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/split
// @include      http*://*musicbrainz.org/release/*
// @run-at       document-end
// ==/UserScript==
"use strict";
/* hint for Opera 12 users allow opera:config#UserPrefs|Allowscripttolowerwindow and opera:config#UserPrefs|Allowscripttoraisewindow */
/*------------settings*/
var nonLatinName = /[\u0384-\u1cf2\u1f00-\uffff]/; /*U+2FA1D is currently out of js range*/
var autolinksOpacity = ".5"; /*can be dimmer than existing links*/
/*
	%artist-id% (MBID)
	%arist-name%
	%artist-sort-name%
	%artist-family-name-first%
*/
var artist_autolinks = {
		"Web pages": "//duckduckgo.com/?q=%artist-name%",
		"Web pages (strict)": "//duckduckgo.com/?q=%2B%22%artist-name%%22",
	/*"Fun stuff": null, // you can insert headers this way (IMPORTANT: don't use space as first character)*/
		"Images": "//duckduckgo.com/?q=%artist-name%+!i",
		"Videos": "//duckduckgo.com/?q=%artist-name%+!v",
	"Credits": null,
		"SACEM (Interprète)": {"accept-charset":"ISO-8859-1", "action":"http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do", "parameters":{"ftin":"true","tiers":"%artist-name%"}},
		"SACEM (Auteur‐Compositeur‐Éditeur)": {"accept-charset":"ISO-8859-1", "action":"http://www.sacem.fr/oeuvres/oeuvre/rechercheOeuvre.do", "parameters":{"ftad":"true","tiers":"%artist-name%"}},
		"JASRAC（アーティスト）": {"title":"requires JASRAC direct link", "method":"post", "accept-charset":"Shift_JIS", "enctype":"multipart/form-data", "action":"http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3", "parameters":{"IN_ARTIST_NAME_OPTION1":"0","IN_ARTIST_NAME1":"%artist-name%","IN_DEFAULT_WORKS_KOUHO_MAX":"100","IN_DEFAULT_WORKS_KOUHO_SEQ":"1","IN_DEFAULT_SEARCH_WORKS_NAIGAI":"0","RESULT_CURRENT_PAGE":"1"}},
		"JASRAC（著作者）": {"title":"requires JASRAC direct link", "method":"post", "accept-charset":"Shift_JIS", "enctype":"multipart/form-data", "action":"http://www2.jasrac.or.jp/eJwid/main.jsp?trxID=A00401-3", "parameters":{"IN_KEN_NAME_OPTION1":"0","IN_KEN_NAME1":"%artist-family-name-first%","IN_KEN_NAME_JOB1":"0","IN_DEFAULT_WORKS_KOUHO_MAX":"100","IN_DEFAULT_WORKS_KOUHO_SEQ":"1","IN_DEFAULT_SEARCH_WORKS_NAIGAI":"0","RESULT_CURRENT_PAGE":"1"}},
		"音楽の森（アーティスト）": "//www.minc.gr.jp/db/ArtNmSrch.aspx?ArtNm=%artist-name%",
		"音楽の森（著作者）": "//www.minc.gr.jp/db/KenriSrch.aspx?KENRISYANM=%artist-family-name-first%",
	"Lyrics": null,
		"decoda": "http://decoda.com/search?q=%artist-name%",
		"LyricWiki": "//lyrics.wikia.com/%artist-name%",
		"うたまっぷ（アーティスト）": {"accept-charset":"euc-jp", "action":"http://www.utamap.com/searchkasi.php", "parameters":{"searchname":"artist","word":"%artist-name%"}},
		"うたまっぷ（作詞者）": {"accept-charset":"euc-jp", "action":"http://www.utamap.com/searchkasi.php", "parameters":{"searchname":"sakusi","word":"%artist-name%"}},
		"うたまっぷ（作曲者）": {"accept-charset":"euc-jp", "action":"http://www.utamap.com/searchkasi.php", "parameters":{"searchname":"sakyoku","word":"%artist-name%"}},
		"J-Lyric（歌手）": "http://j-lyric.net/index.php?ka=%artist-name%",
		"歌詞タイム": "//duckduckgo.com/?q=site%3Akasi-time.com+subcat+intitle:%artist-name%",
	"Japanese stuff": null,
		"VGMdb": "http://vgmdb.net/search?q=%artist-name%",
		"ja.Wikipedia": "//ja.wikipedia.org/w/index.php?search=%artist-name%",
		"CDJournal search": {"accept-charset":"euc-jp", "action":"https://cdjournal.com/search/do/", "parameters":{"k":"%artist-name%","target":"a"}},
		"Joshinweb search": {"accept-charset":"Shift_JIS", "action":"//joshinweb.jp/cdshops/Dps", "parameters":{"KEY":"ARTIST","FM":"0","KEYWORD":"%artist-name%"}},
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
};
var favicons = {
	"allmusic.com": "http://allmusic.com/img/favicon.ico",
	"ameblo.jp": "http://ameblo.jp/favicon.ico",
	"bbc.co.uk": "http://www.bbc.co.uk/favicon.ico",
	"discogs.com": "http://musicbrainz.org/static/images/favicons/discogs-16.png",
	"exblog.jp": "http://exblog.jp/favicon.ico",
	"joshinweb.jp": "http://joshinweb.jp/favicon.ico",
	"last.fm": "http://musicbrainz.org/static/images/favicons/lastfm-16.png",
	"lastfm.": "http://musicbrainz.org/static/images/favicons/lastfm-16.png",
	"livedoor.jp": "http://blog.livedoor.jp/favicon.ico",
	"lyrics.wikia.com": "http://lyrics.wikia.com/favicon.ico",
	"metal-archives.com": "http://www.metal-archives.com/favicon.ico",
	"musicbrainz.org": "http://musicbrainz.org/favicon.ico",
	"rakuten.co.jp": "http://plaza.rakuten.co.jp/favicon.ico",
	"secondhandsongs.com": "http://www.secondhandsongs.com/art/icons/shs.png",
	"soundcloud.com": "http://musicbrainz.org/static/images/favicons/soundcloud-16.png",
	"vgmdb.net": "http://vgmdb.net/favicon.ico",
	"vkdb.jp": "http://www.vkdb.jp/favicon.ico",
	"wikipedia.org": "http://en.wikipedia.org/favicon.ico",
	"yahoo.": "http://blogs.yahoo.co.jp/favicon.ico",
};
var guessOtherFavicons = true;
/*------------end of settings (don't edit below) */
var userjs = "j2ujs108889";
var sidebar = document.getElementById("sidebar");
var arelsws = "/ws/2/artist/%artist-id%?inc=url-rels";
var existingLinks, extlinks;
var hrStyle = {css: ""};
main();
for (var s = 0; s < document.styleSheets.length; s++)
	for (var r = 0; r < document.styleSheets[s].cssRules.length; r++)
		if (hrStyle.match = document.styleSheets[s].cssRules[r].cssText.match(/(#sidebar.+ul.+hr) {(.+)}/))
			hrStyle.css += hrStyle.match[2];
if (hrStyle.css) {
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	document.styleSheets[document.styleSheets.length - 1].insertRule("div#sidebar ul.external_links hr { margin-top:8px!important; width:inherit!important; " + hrStyle.css + "}", 0);
}
function main() {
	if (sidebar) {
		var rgextrels = sidebar.querySelector("ul.external_links_2 > li");
		if (rgextrels && (rgextrels = rgextrels.parentNode) && rgextrels.previousSibling.tagName == "UL") {
			rgextrels.parentNode.insertBefore(createTag("h2", {}, "Release group external links"), rgextrels);
		}
		var artistid = location.href.match(/musicbrainz.org\/artist\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/i);
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
				/*attached missing links*/
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(event) {
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							loading(false);
							var res = xhr.responseXML;
							var url, urls = res.evaluate("//mb:relation-list[@target-type='url']/mb:relation", res, nsr, XPathResult.ANY_TYPE, null);
							var haslinks = false;
							while (url = urls.iterateNext()) {
								var target = res.evaluate("./mb:target", url, nsr, XPathResult.ANY_TYPE, null);
								var target = target.iterateNext();
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
							/*artist_autolinks*/
							extlinksOpacity = autolinksOpacity;
							haslinks = false;
							for (var link in artist_autolinks) if (artist_autolinks.hasOwnProperty(link)) {
								var target = artist_autolinks[link];
								var sntarget = null;
								if (target) {
									if (typeof target == "string") {
										target = target.replace(/%artist-id%/, artistid);
										if (target.match(/%artist-name%/) && artistname != artistsortnameSwapped && artistname.match(nonLatinName)) {
											sntarget = target.replace(/%artist-name%/, encodeURIComponent(artistsortnameSwapped));
										}
										target = target.replace(/%artist-name%/, encodeURIComponent(artistname));
										target = target.replace(/%artist-family-name-first%/, encodeURIComponent(artistname.match(nonLatinName) ? artistname : artistsortname));
									}
									else {
										var aname = target["accept-charset"];
										aname = aname && aname.match(/iso-8859/i) && artistname != artistsortnameSwapped && artistname.match(nonLatinName) ? artistsortnameSwapped : artistname;
										for (var param in target.parameters) if (target.parameters.hasOwnProperty(param)) {
											target.parameters[param] = target.parameters[param].replace(/%artist-id%/, artistid).replace(/%artist-name%/, aname).replace(/%artist-family-name-first%/, artistname.match(nonLatinName) ? artistname : artistsortname);
										}
									}
								}
								if (addExternalLink({text: link, target: target, sntarget: sntarget})) {
									if (!haslinks) {
										haslinks = true;
										addExternalLink({text: " Generated links"});
									}
								}
							}
						} else if (xhr.status >= 400) {
							var txt = xhr.responseText.match(/<error><text>(.+)<\/text><text>/);
							txt = txt ? txt[1] : "";
							error(xhr.status, txt);
						}
					}
				};
				xhr.open("GET", arelsws, true);
				xhr.send(null);
			}
		}/*artist*/
	}
}
var favicontry = [];
var extlinksOpacity = "1";
function addExternalLink(parameters/*text, target, begin, end, sntarget, mbid*/) {
	var newLink = true;
	var lis = extlinks.getElementsByTagName("li");
	if (!existingLinks) {
		existingLinks = [];
		for (var ilis = 0; ilis < lis.length; ilis++) {
			var lisas = lis[ilis].getElementsByTagName("a");
			if (lisas.length>0) {
				existingLinks.push(lisas[0].getAttribute("href").trim().replace(/^https?:/,""));
			}
		}
	}
	if (parameters.target) {
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
					if (attr.match(/accept-charset|enctype|method/)) {
						info = parameters.target[attr] + " " + info;
					}
					form.setAttribute(attr, parameters.target[attr]);
				}
			}
			form.appendChild(createTag("a", {a: {title: info}, e: {click: function(event) {
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
			}, mousedown: function(event) {
				event.preventDefault();
				if (event.button == 1) {
					this.parentNode.setAttribute("target", weirdobg());
					this.parentNode.submit();
				}
			}}}, parameters.text));
			form.appendChild(document.createTextNode("*"));
			li = createTag("li", {}, form);
		} else {
			var exi = existingLinks.indexOf(parameters.target.trim().replace(/^https?:/, ""));
			if (exi == -1) {
				existingLinks.push(parameters.target.trim().replace(/^https?:/, ""));
				li = createTag("li", {a: {class: parameters.text}}, createTag("a", {a: {href: parameters.target}}, parameters.text));
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
				li.appendChild(document.createTextNode(" "));
				li.appendChild(createTag("div", {a: {class: "icon img edit-item"}, s: {opacity: ".5"}}, createTag("a", {a: {title: "edit this URL relationship", href: "/url/" + parameters.mbid + "/edit"}, s: {color: "transparent"}}, "edit")));
			}
		}
		var favurltest = (typeof parameters.target == "string") ? parameters.target : parameters.target.action;
		var favurlfound = false;
		for (var part in favicons) if (favicons.hasOwnProperty(part)) {
			if (favurltest.indexOf(part) != -1) {
				favurlfound = favicons[part];
				break;
			}
		}
		if (guessOtherFavicons && !favurlfound) {
			favurlfound = favurltest.substr(0, favurltest.indexOf("/", 7)) + "/favicon.ico";
		}
		var ifit = favicontry.length;
		favicontry[ifit] = new Image();
		/*favicontry.addEventListener("error", function (event) {
		});*/
		favicontry[ifit].addEventListener("load", function (event) {
			clearTimeout(this.to);
			if (this.width == 16) {
				this.li.style.setProperty("background-image", "url(" + this.src + ")");
			}
		});
		favicontry[ifit].li = li;
		favicontry[ifit].src = favurlfound;
		favicontry[ifit].to = setTimeout(function(){ favicontry[ifit].src = "/"; }, 5000);
	} else {
		var li = createTag("li", {s: {fontWeight: "bold"}}, parameters.text);
		if (parameters.text.indexOf(" ") == 0) {
			li.style.setProperty("padding-top", "0px");
			extlinks.insertBefore(li, extlinks.lastChild);
		} else {
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
