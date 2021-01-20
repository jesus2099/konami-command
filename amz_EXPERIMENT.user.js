// ==UserScript==
// @name         AMZ. shrink product links and direct link to full size pictures
// @version      2021.1.19
// @description  Amazon. Shows links to full size images. Shrinks product and search URLs. Prevents from opening new windows in amazn.jp searches.
// @namespace    https://github.com/jesus2099/konami-command
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2012; https://web.archive.org/web/20131107081211/userscripts.org/scripts/show/139394
// @grant        none
// @include      /^https?:\/\/[^.]+\.amazon\.[^/]+/
// @exclude      *iframeproxy*
// @run-at       document-end
// ==/UserScript==
// ------------CONFIG-START------------
var shrink = true; // https://amazon.jp/dp/B00005LLFD (shortest) on links and https://www.amazon.co.jp/dp/B00005LLFD in adress bar instead of crazy stufff like https://www.amazon.co.jp/AJICO-SHOW/dp/B00005LLFD/ref=ntt_mus_dp_dpt_2
var shortestShrinkOnHeader = true; // show the shortest link on header of product page
var shrinkSearch = true; // shrinks to https://www.amazon.co.jp/s?field-keywords=VICL-60761 or https://www.amazon.co.jp/s?__mk_ja_JP=%83J%83%5E%83J%83i&field-keywords=%90%F3%88%E4%8C%92%88%EA
var shortestShrinkSearchOnHeader = true; // show the shortest link on header of search page
var fullSizePicLinks = true; // all product pictures become links to full size pics
var fullSizePicLinkLabels = "fullpic"; // or # or 100% etc.
var showASINonHeader = true;
var debugColours = true; // false if you don't want to see those funky border colours around modified pics and links
// ------------CONFIG--STOP------------
let amzn_re = "https?://(?:www\\.)?amazon\\.(ca|cn|co\\.jp|co\\.uk|com|de|es|fr|it)";
let asin, mk, h, surl;
function shrinkASINurl(url, extreme) {
	let ret = false;
	let split = url.match(new RegExp("\u000a*" + amzn_re + ".*/(?:dp|exec/obidos/ASIN|gp/product)/([A-Z0-9]{10}).*\u000a*", "i"));
	if (split) {
		ret = "https://www.amazon." + split[1] + "/dp/" + split[2];
	}
	if (ret && extreme) { ret = extremeShrinkUrl(ret); }
	if (ret && ret != url) { return ret; }
	else { return false; }
}
function shrinkSearchUrl(url, extreme) {
	let ret = false;
	let split = url.match(new RegExp(amzn_re + "/s.+(field-keywords=[^%&]+)" + (extreme ? "" : "&"), "i"));
	if (split) {
		ret = "https://www.amazon." + split[1] + "/s?" + split[2];
	} else if ((split = url.match(new RegExp(amzn_re + "/s.+(field-keywords=[^&]+)" + (extreme ? "" : "&"), "i"))) && (mk = url.match(/__mk_[a-z_-]+=[^&]+/i))) {
		ret = "https://www.amazon." + split[1] + "/s?" + mk + "&" + split[2];
	}
	if (ret && extreme) { ret = extremeShrinkUrl(ret); }
	return ret;
}
function extremeShrinkUrl(url) {
	return url.replace(new RegExp(amzn_re), "https://amazon.$1").replace(/(https?:\/\/amazon\.)co\.jp/, "$1jp");
}
// SHOW ASIN IN H1
if (showASINonHeader && (asin = document.querySelector("link[rel='canonical'][href]")) && (h = document.querySelector("h1") || document.querySelector("td.header > strong"))) {
	h.insertBefore(document.createElement("span").appendChild(document.createTextNode(asin.getAttribute("href").match(/[A-Z0-9]{10}$/) + " ")).parentNode, h.firstChild).style.setProperty("background-color", "yellow");
}
// SHORT SEARCH URLS
if (shrinkSearch && (surl = shrinkSearchUrl(self.location.href, false))) {
	self.location.href = surl;
	return;
}
// SHOW SHORTEST SEARCH LINK ON HEADER
if (shortestShrinkSearchOnHeader && (surl = shrinkSearchUrl(self.location.href, true)) && (h = document.querySelector("div#searchTemplate h1"))) {
	let sa = h.insertBefore(document.createElement("a").appendChild(document.createTextNode("#")).parentNode, h.firstChild);
	sa.setAttribute("href", surl);
	addAfter(document.createTextNode(" "), sa);
}
// SHOW SHORTEST PRODUCT LINK ON HEADER
if (shortestShrinkOnHeader && (surl = shrinkASINurl(self.location.href, true)) && (h = document.querySelector("h1"))) {
	let sa = h.insertBefore(document.createElement("a").appendChild(document.createTextNode("#")).parentNode, h.firstChild);
	sa.setAttribute("href", surl);
	addAfter(document.createTextNode(" "), sa);
}
// SHORT ASIN LINKS
if (shrink) {
	if ((surl = shrinkASINurl(self.location.href, false))) {
		self.location.href = surl;
		return;
	}
	let aas = document.querySelectorAll("a[href^='http://www.amazon.'][href*='/dp/'], a[href^='http://www.amazon.'][href*='/exec/obidos/ASIN/'], a[href^='http://www.amazon.'][href*='/gp/product/'], div.faceoutTitle > a[href*='http://www.amazon.']");
	for (let a = 0; a < aas.length; a++) {
		let href = aas[a].getAttribute("href");
		if ((asin = shrinkASINurl(href, true))) {
			aas[a].setAttribute("title", "was: \n" + href.replace(/\u000a/g, ""));
			aas[a].setAttribute("href", asin);
			if (aas[a].getAttribute("target")) { aas[a].removeAttribute("target"); }
			if (debugColours) { aas[a].style.setProperty("text-shadow", "1px 1px 2px orange", "important"); }
		}
	}
}
// FULL SIZE PICTURE LINKS
if (fullSizePicLinks) {
	let imgs = document.querySelectorAll("img[src*='.images-amazon.com/images/I/'][src$='_.jpg'], img[src*='.images-amazon.com/images/G/'][src$='_.jpg'], img[src*='.images-amazon.com/images/I/'][src$='_.png'], img[src*='.images-amazon.com/images/G/'][src$='_.png']");
	for (let i = 0; i < imgs.length; i++) {
		let img = imgs[i];
		let src = img.getAttribute("src");
		let fullsrc = src.replace(/ec.\.images-amazon\.com/, "ecx.images-amazon.com").replace(/(\._[^/.]+_)\.([a-z]{3})$/, ".$2");
		let pa = getParent(img, "a");
		if (pa) {
			img = pa;
		}
		let a = addAfter(document.createElement("a").appendChild(document.createTextNode(fullSizePicLinkLabels)).parentNode, img);
		a.setAttribute("title", "direct full pic link instead of: \n" + src);
		a.setAttribute("href", fullsrc);
	}
}
function addAfter(n, e) {
	if (n && e && e.parentNode) {
		if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
		else { return e.parentNode.appendChild(n); }
	} else { return null; }
}
function getParent(obj, tag, cls) {
	var cur = obj;
	if (cur.parentNode) {
		cur = cur.parentNode;
		if (cur.tagName == tag.toUpperCase() && (!cls || cls && cur.classList.contains(cls))) {
			return cur;
		} else {
			return getParent(cur, tag, cls);
		}
	} else {
		return null;
	}
}
