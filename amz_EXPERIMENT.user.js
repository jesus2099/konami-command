// ==UserScript==
// @name         AMZ. shrink product links and direct link to full size pictures
// @version      2016.5.11
// @description  Amazon. Shows links to full size images. Shrinks product and search URLs. Prevents from opening new windows in amazn.jp searches.
// @namespace    https://userscripts.org/139394
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @include      http://amazon.*
// @include      http://www.amazon.*
// @include      https://amazon.*
// @include      https://www.amazon.*
// @exclude      *://amazon.*iframeproxy*
// @exclude      *://www.amazon.*iframeproxy*
// @run-at       document-end
// ==/UserScript==
(function(){
/*------------CONFIG-START------------*/
	var shrink = true; /* http://amazon.jp/dp/B00005LLFD (shortest) on links and http://www.amazon.co.jp/dp/B00005LLFD in adress bar instead of crazy stufff like http://www.amazon.co.jp/AJICO-SHOW/dp/B00005LLFD/ref=ntt_mus_dp_dpt_2 */
	var shortestShrinkOnHeader = true; /* show the shortest link on header of product page */
	var shrinkSearch = true; /* shrinks to http://www.amazon.co.jp/s?field-keywords=VICL-60761 or http://www.amazon.co.jp/s?__mk_ja_JP=%83J%83%5E%83J%83i&field-keywords=%90%F3%88%E4%8C%92%88%EA */
	var shortestShrinkSearchOnHeader = true; /* show the shortest link on header of search page */
	var fullSizePicLinks = true; /* all product pictures become links to full size pics  */
	var fullSizePicLinkLabels = "fullpic"; /* or # or 100% etc. */
	var showASINonHeader = true;
	var debugColours = true; /* false if you don't want to see those funky border colours around modified pics and links */
/*------------CONFIG--STOP------------*/
	var amzn_re = "https?://(?:www\.)?amazon\.(ca|cn|co\.jp|co\.uk|com|de|es|fr|it)";
	function shrinkASINurl(url, extreme) {
		var ret = false;
		if (split = url.match(new RegExp("\u000a*"+amzn_re+".*/(?:dp|exec/obidos/ASIN|gp/product)/([A-Z0-9]{10}).*\u000a*", "i"))) {
			ret = "http://www.amazon."+split[1]+"/dp/"+split[2];
		}
		if (ret && extreme) { ret = extremeShrinkUrl(ret); }
		if (ret && ret != url) { return ret; }
		else { return false; }
	}
	function shrinkSearchUrl(url, extreme) {
		var ret = false;
		if (split = url.match(new RegExp(amzn_re+"/s.+(field-keywords=[^%&]+)"+(extreme?"":"&"), "i"))) {
			ret = "http://www.amazon."+split[1]+"/s?"+split[2];
		} else if ((split = url.match(new RegExp(amzn_re+"/s.+(field-keywords=[^&]+)"+(extreme?"":"&"), "i"))) && (mk = url.match(/__mk_[a-z_-]+=[^&]+/i))) {
			ret = "http://www.amazon."+split[1]+"/s?"+mk+"&"+split[2];
		}
		if (ret && extreme) { ret = extremeShrinkUrl(ret); }
		return ret;
	}
	function extremeShrinkUrl(url) {
		return url.replace(new RegExp(amzn_re), "http://amazon.$1").replace(/(https?:\/\/amazon\.)co\.jp/, "$1jp");
	}
	/* SHOW ASIN IN H1 */
	if (showASINonHeader && (ASIN = document.querySelector("link[rel='canonical'][href]")) && (h = document.querySelector("h1") || document.querySelector("td.header > strong"))) {
		h.insertBefore(document.createElement("span").appendChild(document.createTextNode(ASIN.getAttribute("href").match(/[A-Z0-9]{10}$/)+" ")).parentNode, h.firstChild).style.setProperty("background-color", "yellow");
	}
	/* SHORT SEARCH URLS */
	if (shrinkSearch && (surl = shrinkSearchUrl(location.href, false))) {
		location.href = surl;
		return;
	}
	/* SHOW SHORTEST SEARCH LINK ON HEADER */
	if (shortestShrinkSearchOnHeader && (surl = shrinkSearchUrl(location.href, true)) && (h = document.querySelector("div#searchTemplate h1"))) {
		var sa = h.insertBefore(document.createElement("a").appendChild(document.createTextNode("#")).parentNode, h.firstChild);
		sa.setAttribute("href", surl);
		addAfter(document.createTextNode(" "), sa);
	}
	/* SHOW SHORTEST PRODUCT LINK ON HEADER */
	if (shortestShrinkOnHeader && (surl = shrinkASINurl(location.href, true)) && (h = document.querySelector("h1"))) {
		var sa = h.insertBefore(document.createElement("a").appendChild(document.createTextNode("#")).parentNode, h.firstChild);
		sa.setAttribute("href", surl);
		addAfter(document.createTextNode(" "), sa);
	}
	/* SHORT ASIN LINKS */
	if (shrink) {
		if (surl = shrinkASINurl(location.href, false)) {
			location.href = surl;
			return;
		}
		var aas = document.querySelectorAll("a[href^='http://www.amazon.'][href*='/dp/'], a[href^='http://www.amazon.'][href*='/exec/obidos/ASIN/'], a[href^='http://www.amazon.'][href*='/gp/product/'], div.faceoutTitle > a[href*='http://www.amazon.']");
		for (var a=0; a < aas.length; a++) {
			var href = aas[a].getAttribute("href");
			if (asin = shrinkASINurl(href, true)) {
				aas[a].setAttribute("title", "was: \n"+href.replace(/\u000a/g, ""));
				aas[a].setAttribute("href", asin);
				if (aas[a].getAttribute("target")) { aas[a].removeAttribute("target"); }
				if (debugColours) { aas[a].style.setProperty("text-shadow", "1px 1px 2px orange", "important"); }
			}
		}
	}
	/* FULL SIZE PICTURE LINKS */
	if (fullSizePicLinks) {
		var imgs = document.querySelectorAll("img[src*='.images-amazon.com/images/I/'][src$='_.jpg'], img[src*='.images-amazon.com/images/G/'][src$='_.jpg'], img[src*='.images-amazon.com/images/I/'][src$='_.png'], img[src*='.images-amazon.com/images/G/'][src$='_.png']");
		for (var i=0; i < imgs.length; i++) {
			var img = imgs[i];
			var src = img.getAttribute("src");
			var fullsrc = src.replace(/ec.\.images-amazon\.com/, "ecx.images-amazon.com").replace(/(\._[^/.]+_)\.([a-z]{3})$/, ".$2");
			if (pa = getParent(img, "a")) {
				img = pa;
			}
			var a = addAfter(document.createElement("a").appendChild(document.createTextNode(fullSizePicLinkLabels)).parentNode, img);
			a.setAttribute("title", "direct full pic link instead of: \n"+src);
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
})();