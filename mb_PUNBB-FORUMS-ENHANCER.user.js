// ==UserScript==
// @name         mb. PUNBB FORUMS ENHANCER
// @version      2015.7.6.1452
// @changelog    https://github.com/jesus2099/konami-command/commits/master/mb_PUNBB-FORUMS-ENHANCER.user.js
// @description  BBCode markup buttons (bold, italic, url, etc.) with keyboard shortcut keys and restore accesskey on preview and submit too in musicbrainz forums + Hide some forums from new posts page
// @homepage     http://userscripts-mirror.org/scripts/show/125668
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12.17)+violentmonkey  my own setup
// @compatible   firefox(39)+greasemonkey    quickly tested
// @compatible   chromium(46)+tampermonkey   quickly tested
// @compatible   chrome+tampermonkey         should be same as chromium
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
(function(){"use strict";
	var userjs = "jesus2099userjs125668";
/*ignore some forums on new posts page*/
	if (location.pathname == "/search.php" && location.search.match(/show_new/)) {
		var hide = JSON.parse(localStorage.getItem(userjs+"hide")) || [];
		var zone = document.querySelector("div#brd-crumbs-top > p");
		var forums = document.querySelectorAll("div.forum-forums li.info-forum > a[href^='http://forums.musicbrainz.org/viewforum.php?id=']");
		for (var f = 0; f < forums.length; f++) {
			var id = forums[f].getAttribute("href").match(/id=(\d+)$/);
				if (id) {
				id = id[1];
				if (hide.indexOf(id) > -1) {
					getParent(forums[f], "div", "main-item").style.setProperty("display", "none");
					ignoredForum(id, forums[f].textContent);
				} else {
					forums[f].parentNode.appendChild(createTag("a", {a: {ref: id, title: "click to hide new posts from forum #" + id}, e: {click: function(event) {
						hide.push(this.getAttribute("ref"));
						localStorage.setItem(userjs + "hide", JSON.stringify(hide));
						location.reload();
					}}}, "hide"));
				}
			}
		}
	} else {
		if (location.pathname.match(/^\/view(forum|topic)\.php$/) && document.title.match(/ \(Page 1\) — /) && !document.head.querySelector("link[rel='next']")) {
			document.title = document.title.replace(" (Page 1) — ", " — ");
		}
/*add some markup tools on new/edit post page*/
		var textarea, form, submittedButt;
		if ((textarea = document.querySelector("textarea[name='req_message']")) && (form = getParent(textarea, "form"))) {
			var operaAccessKeyHack = {};
			var texttools = {
				"bold":       { pattern: "[b]%s[/b]", accesskey: "b" },
				"underlined": { pattern: "[u]%s[/u]", accesskey: "u" },
				"italic":     { pattern: "[i]%s[/i]", accesskey: "i" },
				"colour":     { pattern: "[color=%p]%s[/color]", accesskey: "r", prompt: "Type colour (red, #ff6, #ccff33, etc.)" },
				"url":        { pattern: "[url=%p]%s[/url]", accesskey: "l", prompt: "Type an URL (or delete if you already have selected an URL)", "default": "http://" },
				"e-mail":     { pattern: "[email=%p]%s[/email]", accesskey: "e", prompt: "Type an e-mail address (or delete if you already have selected an address)", "default": "@" },
				"img":        { pattern: "[img]%s[/img]", accesskey: "g" },
				"header":     { pattern: "[h]%s[/h]", accesskey: "h" },
				"quote":      { pattern: "[quote=%p]%s[/quote]", accesskey: "q", prompt: "Type the name of the quoted person (optional)" },
				"code":       { pattern: "[code]%s[/code]", accesskey: "o" },
			};
			var tt = createTag("div", {s: {"line-height": "2em"}}, "BBCode tools: ");
			if (typeof opera != "undefined" && operaAccessKeyHack) {
				textarea.addEventListener("keydown", function(event) {
					var butt;
					if (event.ctrlKey && (butt = operaAccessKeyHack[event.keyCode+32])) {
						submittedButt = butt;
						butt.click();
						return stop(event);
					}
				}, false);
				form.addEventListener("submit", function(event) {
					if (event.shiftKey || event.ctrlKey) {
						setTimeout(function() {
							submittedButt.removeAttribute("disabled");
							var click = document.createEvent("MouseEvents");
							click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
							submittedButt.dispatchEvent(click);
						}, 100);
						return stop(event);
					} else {
						submittedButt = null;
						return true;
					}
				}, false);
			}
			for (var tool in texttools) if (texttools.hasOwnProperty(tool)) {
				tt.appendChild(createBBCodeButt(tool, function(event) {
					textarea.focus();
					var osel = [textarea.value.substring(textarea.selectionStart, textarea.selectionEnd), textarea.selectionStart, textarea.selectionEnd];
					var tool = this.textContent;
					var nsel = texttools[tool].pattern.replace(/%s/g, osel[0]);
					var p = null;
					if (texttools[tool].pattern.indexOf("=%p") != -1) {
						p = prompt(texttools[tool].prompt ? texttools[tool].prompt : "Type parameter (%p) for “" + nsel + "”\u00a0:", texttools[tool]["default"] ? texttools[tool]["default"] : "");
						nsel = nsel.replace(/=%p/g, p ? "=" + p : "");
					}
					textarea.value = textarea.value.substr(0, osel[1]) + nsel + textarea.value.substr(osel[2]);
					if (osel[1] != osel[2]) {
						textarea.selectionStart = osel[1];
						textarea.selectionEnd = osel[1] + nsel.length;
					} else {
						textarea.selectionStart = osel[1] + nsel.indexOf("[", 1);
						textarea.selectionEnd = textarea.selectionStart;
					}
				}, texttools[tool].pattern, texttools[tool].accesskey));
				tt.appendChild(document.createTextNode(" "));
			}
			textarea.parentNode.insertBefore(tt, textarea);
			var subscribe = form.querySelector("input[type='checkbox'][name='subscribe']");
			if (!subscribe) {
				var substatus = document.querySelector("div.main-head > p.options a.sub-option");
				if (substatus) {
					substatus = substatus.textContent.match(/unsubscribe/i);
				}
				subscribe = createTag("input", {a: {type: "checkbox", name: "subscribe", value: "1"}});
				subscribe.checked = substatus;
				(form.querySelector("div.frm-buttons") || form).appendChild(createTag("label", null, [subscribe, " Subscribe to this topic"]));
			}
			var subs = form.querySelectorAll("input[type='submit']");
			for (var sb = 0; sb < subs.length; sb++) {/*opens in new window because of shift:/*/
				var accesskey = subs[sb].getAttribute("accesskey");
				if (!accesskey) {
					accesskey = subs[sb].getAttribute("value").substring(0, 1).toLowerCase();
					subs[sb].setAttribute("accesskey", accesskey);
				}
				operaAccessKeyHack[accesskey.charCodeAt(0)] = subs[sb];
				subs[sb].setAttribute("title", akey(accesskey));
				subs[sb].setAttribute("value", subs[sb].getAttribute("value").replace(/^(.)(.+)$/, "($1)$2"));
			}
		}
	}
	function ignoredForum(fid, fname) {
		var ifora = document.getElementById(userjs + "ignored" + fid);
		if (zone && !ifora) {
			zone.appendChild(document.createTextNode(zone.querySelectorAll("a[id^='" + userjs + "ignored']").length < 1 ? " — hidden forums: " : ", "));
			zone.appendChild(createTag("a", {a: {ref: id, id: userjs + "ignored" + fid, title: "click to stop hiding new posts from " + fname + " (forum #" + fid + ")"}, e: {click: function(event) {
				var newhide = [];
				for (var nh = 0; nh < hide.length; nh++) {
					if (hide[nh] != this.getAttribute("ref")) {
						newhide.push(hide[nh]);
					}
				}
				localStorage.setItem(userjs + "hide", JSON.stringify(newhide));
				location.reload();
			}}, s: {"text-decoration": "line-through", "background-color": "#FF6"}}, fname));
		}
	}
	function akey(k) {
		var kk = k.toUpperCase();
		if (typeof opera != "undefined") {
			return "CTRL+" + kk + " or \nSHIFT+ESC… " + kk;
		} else if (navigator.userAgent.match(/firefox/i)) {
			return "ALT+SHIFT+" + kk;
		} else {
			return "ALT+" + kk;
		}
	}
	function getParent(obj, tag, cls) {
		var cur = obj;
		if (cur.parentNode) {
			cur = cur.parentNode;
			if (cur.tagName.toUpperCase() == tag.toUpperCase() && (!cls || cls && cur.classList.contains(cls))) {
				return cur;
			} else {
				return getParent(cur, tag, cls);
			}
		} else {
			return null;
		}
	}
	function createTag(tag, gadgets, children) {
		var t = document.createElement(tag);
		if(t.tagName) {
			if (gadgets) {
				for (var attri in gadgets.a) { if (gadgets.a.hasOwnProperty(attri)) { t.setAttribute(attri, gadgets.a[attri]); } }
				for (var style in gadgets.s) { if (gadgets.s.hasOwnProperty(style)) { t.style.setProperty(style.replace(/!/,""), gadgets.s[style], style.match(/!/)?"important":""); } }
				for (var event in gadgets.e) { if (gadgets.e.hasOwnProperty(event)) { t.addEventListener(event, gadgets.e[event], false); } }
			}
			if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) { t.style.setProperty("cursor", "pointer"); }
			if (children) { var chldrn = children; if (typeof chldrn == "string" || chldrn.tagName) { chldrn = [chldrn]; } for(var child=0; child<chldrn.length; child++) { t.appendChild(typeof chldrn[child]=="string"?document.createTextNode(chldrn[child]):chldrn[child]); } t.normalize(); }
		}
		return t;
	}
	function createBBCodeButt(text, link, title, accesskey) {
		var truc = createTag("span", {s: {"white-space": "nowrap"}}, "\u00a0");
		var a = truc.appendChild(createTag("a", {s: {"background-color": "#eee", padding: "2px 4px", border: "1px outset grey", "text-transform": "uppercase"}}));
		if (link && typeof link == "string") {
			a.setAttribute("href", link);
		}
		else {
			if (link && typeof link == "function") {
				a.addEventListener("click", link, false);
			}
			a.style.setProperty("cursor", "pointer");
		}
		if (title) {
			a.setAttribute("title", title);
		}
		if (accesskey) {
			a.setAttribute("accesskey", accesskey);
			var key = akey(accesskey);
			if (navigator.userAgent.match(/firefox/i)) {
				key += ":";
			}
			a.setAttribute("title", text.toUpperCase() + " \n" + a.getAttribute("title") + " \n\n" + key);
			if (typeof opera != "undefined" && operaAccessKeyHack) {
				operaAccessKeyHack[accesskey.toLowerCase().charCodeAt(0)] = a;
			}
		}
		if (accesskey) {
			var kpos = text.indexOf(accesskey);
			a.appendChild(document.createTextNode(text.substr(0, kpos)));
			a.appendChild(createTag("strong", null, text.charAt(kpos)));
			a.appendChild(document.createTextNode(text.substr(kpos + 1)));
		} else {
			a.appendChild(document.createTextNode(text));
		}
		return truc;
	}
	function stop(e) {
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		e.preventDefault();
		return false;
	}
})();
