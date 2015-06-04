(function(){var meta={rawmdb:function(){
// ==UserScript==
// @name         mb. COLLECTION HIGHLIGHTER
// @version      2015.6.4.2302
// @description  musicbrainz.org: Highlights releases, release-groups, etc. that you have in your collections (anyone’s collection can be loaded) everywhere
// @homepage     http://userscripts-mirror.org/scripts/show/126380
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @compatible   opera(12)             my own coding setup
// @compatible   opera+violentmonkey   my own browsing setup
// @compatible   firefox+greasemonkey  quickly tested
// @compatible   chromium              quickly tested
// @compatible   chromium+tampermonkey quickly tested
// @compatible   chrome                tested with chromium
// @compatible   chrome+tampermonkey   tested with chromium
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_COLLECTION-HIGHLIGHTER.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_COLLECTION-HIGHLIGHTER.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-02-21
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http*://*musicbrainz.org/*edits*
// @include      http*://*musicbrainz.org/*votes*
// @include      http*://*musicbrainz.org/area/*
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/cdtoc/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/edit/*
// @include      http*://*musicbrainz.org/isrc/*
// @include      http*://*musicbrainz.org/label/*
// @include      http*://*musicbrainz.org/place/*
// @include      http*://*musicbrainz.org/puid/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*musicbrainz.org/release_group/*
// @include      http*://*musicbrainz.org/release-group/*
// @include      http*://*musicbrainz.org/report/*
// @include      http*://*musicbrainz.org/search*
// @include      http*://*musicbrainz.org/series/*
// @include      http*://*musicbrainz.org/tag/*
// @include      http*://*musicbrainz.org/tracklist/*
// @include      http*://*musicbrainz.org/url/*
// @include      http*://*musicbrainz.org/user/*/collections
// @include      http*://*musicbrainz.org/user/*/ratings*
// @include      http*://*musicbrainz.org/user/*/subscriptions/artist*
// @include      http*://*musicbrainz.org/user/*/subscriptions/collection*
// @include      http*://*musicbrainz.org/user/*/subscriptions/label*
// @include      http*://*musicbrainz.org/user/*/tag/*
// @include      http*://*musicbrainz.org/work/*
// @exclude      *//*/*musicbrainz.org/*
// @exclude      http*://*musicbrainz.org/collection/*/own_collection/*
// @run-at       document-end
// ==/UserScript==
	}};
	if (meta.rawmdb && meta.rawmdb.toString && (meta.rawmdb = meta.rawmdb.toString())) {
		var kv/*key,val*/, row = /\/\/\s+@(\S+)\s+(.+)/g;
		while ((kv = row.exec(meta.rawmdb)) !== null) {
			if (meta[kv[1]]) {
				if (typeof meta[kv[1]] == "string") meta[kv[1]] = [meta[kv[1]]];
				meta[kv[1]].push(kv[2]);
			} else meta[kv[1]] = kv[2];
		}
	}
	meta.name = meta.name.substr("4");
	var host = (["musicbrainz.org", "beta.musicbrainz.org", "test.musicbrainz.org"].indexOf(location.host) != -1);
	var cat = location.href.match(/(area(?!.+(artists|labels|releases|places|aliases|edits))|artist(?!.+(releases|recordings|works|relationships|aliases|edits))|artists|labels|releases|recordings|report|series|works|aliases|cdtoc|collection(?!s|.+edits)|collections|edit(?!s|\/subscribed)|edits|votes|edit\/subscribed|isrc|label(?!.+edits)|place(?!.+(aliases|edits))|puid|ratings|recording(?!s|.+edits)|relationships|release[-_]group(?!.+edits)|release(?!s|-group|.+edits)|search(?!\/edits)|tracklist|tag|url|work(?!s))/);
	if (host && cat) {
		/* -------- CONFIGURATION START (don’t edit above) -------- */
		var confirmIfMoreThan = 2000;/*-1 to never confirm*/
		var highlightColour = "purple";
		var highlightInEditNotes = false;
		var skipArtists = "89ad4ac3-39f7-470e-963a-56509c546377"; /*put artist GUID separated by space that you want to skip, example here it’s VA*/
		var MBWSRate = 600;
		/* -------- CONFIGURATION  END  (don’t edit below) -------- */
		var userjs = "jesus2099userjs126380";
		var DEBUG = false;
		var dialogprefix = "..:: "+meta.name.replace(/ /g, " :: ")+" ::..\n\n";
		var maxRetry = 10;
		var retryPause = 5000;
		var slowDownStepAfterRetry = 200;
		var css_nextPage = "ul.pagination > li:last-of-type > a";
		var retry = 0;
		var debugBuffer = "";
		var cWARN = "gold";
		var cERR = "pink";
		document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
		var j2ss = document.styleSheets[document.styleSheets.length-1];
		var brdr = " border-left: 4px solid "+highlightColour+"; ";
		j2ss.insertRule("."+userjs+"HLbox {"+brdr.replace(/-left/, "")+"}", j2ss.cssRules.length);
		j2ss.insertRule("."+userjs+"HLrow {"+brdr+"}", j2ss.cssRules.length);
		j2ss.insertRule("li."+userjs+"HLrow { padding-left: 4px; }", j2ss.cssRules.length);
		j2ss.insertRule("."+userjs+"HLitem { text-shadow: 0 0 8px "+highlightColour+"!important; }", j2ss.cssRules.length);
		j2ss.insertRule("."+userjs+"HLrow ."+userjs+"HLitem { border: 0; padding: 0; }", j2ss.cssRules.length);
		var server = location.protocol+"//"+location.host;
		var collectionsID = localStorage.getItem(userjs+"collections") || "";
		var releaseID;
		var stuff, collectedStuff = ["collection", "release", "release-group", "recording", "artist", "work", "label"];
		var strType = "release-group|recording|label|artist|work";
		var strMBID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
		cat = cat[1].replace(/edit\/subscribed|votes/, "edits").replace(/_/, "-");
		debug("CAT: "+cat);
		var xp, i;
		if (cat == "release" && (releaseID = location.pathname.match(new RegExp(strMBID)))) {
			releaseID = releaseID[0];
			var mainReleasePage = location.pathname.match(new RegExp("^/release/"+strMBID+"$"));
			var colls = document.querySelectorAll("div#sidebar a[href*='/own_collection/add?release='], div#sidebar a[href*='/own_collection/remove?release=']");
			for (var coll=0; coll<colls.length; coll++) {
				if (collectionsID.indexOf(colls[coll].getAttribute("href").match(new RegExp(strMBID))) > -1) {
					if (mainReleasePage) {
						collectionUpdater(colls[coll], colls[coll].getAttribute("href").match(/add|remove/).toString());
					} else {
						addAfter(createTag("div", {s:{textShadow:"0 0 8px "+highlightColour}}, ["(please go to ", createTag("a", {a:{href:"/release/"+releaseID}}, "main release page"), " for this button to auto‐update your collection highlighter)"]), colls[coll])
					}
				}
			}
			if (mainReleasePage && (lili = document.querySelector("div#sidebar > h2.collections + ul.links"))) {
				var buttxt = " this release to your local collection highlighter,\r\nwithout changing its status among you MB collection(s)";
				lili = lili.insertBefore(document.createElement("li"), lili.firstChild);
				lili.appendChild(document.createTextNode("Force highlight "));
				collectionUpdater(lili.appendChild(createA("ON", location.href, "Add"+buttxt, true)), "add");
				lili.appendChild(document.createTextNode(" / "));
				collectionUpdater(lili.appendChild(createA("OFF", location.href, "Remove"+buttxt.replace(" to ", " from "), true)), "remove");
			}
		}
		if (cat == "collections") {
			/*collection loader*/
			xp = document.evaluate("//xhtml:table[contains(@class, 'tbl')]/xhtml:thead//xhtml:th[contains(./text(), 'Collection')]", document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			if (xp.snapshotLength > 0) {
				xp.snapshotItem(0).parentNode.appendChild(createTag("th", {a:{colspan:"2"}}, meta.name));
				var tbl = getParent(xp.snapshotItem(0), "table");
				xp = document.evaluate("./xhtml:thead//xhtml:th[contains(./text(), 'Actions')]", tbl, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xp.snapshotLength > 0) {
					xp.snapshotItem(0).style.width = "";
				}
				xp = document.evaluate("./xhtml:tbody/xhtml:tr", tbl, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				for (i=0; i < xp.snapshotLength; i++) {
					var coll = xp.snapshotItem(i).getElementsByTagName("a")[0];
					var collid = coll.getAttribute("href").match(new RegExp(strMBID));
					if (collectionsID.indexOf(collid) > -1) {
						decorate("collection", coll);
					}
					var loadButt = [
						createA("Load",
							function(e) {
								var opts = document.querySelectorAll("td."+userjs+" input[type='checkbox']");
								stuff = {};
								for (var opt=0; opt<opts.length; opt++) {
									if (opts[opt].checked) {
										stuff[opts[opt].getAttribute("name")] = {};
									}
								}
								var nows;
								if (typeof opera != "undefined" && (nows = getParent(this, "tr")) && nows.textContent.match(/\n\s*Private\s*\n/)) {
									nows = true;
								} else { nows = false; }
								loadCollection(this.getAttribute("title").match(new RegExp(strMBID)), !nows, nows?1:0);
							},
							"Add this collection’s content to local storage ("+collid+")"
						),
						"/",
						createA("re‐load",
							function(e) {
								var cmsg = "This will REPLACE your current loaded stuff.";
								if (confirm(dialogprefix+cmsg)) {
									for (var stu=0; stu<collectedStuff.length; stu++) {
										localStorage.removeItem(userjs+collectedStuff[stu]+"s");
									}
									this.previousSibling.previousSibling.click();
								}
							},
							"Replace local storage with this collection’s content ("+collid+")"
						)
					];
					xp.snapshotItem(i).appendChild(document.createElement("td")).appendChild(concat(loadButt));
					if (i == 0) {
						/* settings */
						var settings = [];
						for (var stu=0; stu<collectedStuff.length; stu++) if (collectedStuff[stu] != "collection") {
							var cstuff = collectedStuff[stu];
							var lab = document.createElement("label");
							lab.style.setProperty("white-space", "nowrap");
							lab.appendChild(concat([createTag("input", {"a":{"type":"checkbox", "name":cstuff}, "e":{"change":function(){localStorage.setItem(userjs+"cfg"+this.getAttribute("name"), this.checked?"1":"0");}}}), cstuff+"s "]));
							var cfgcb = lab.querySelector("input[type='checkbox'][name='"+cstuff+"']");
							if (cstuff.match(/artist|recording|release(-group)?/)) {/*defaults*/
								cfgcb.setAttribute("checked", "checked");
							}
							if (cstuff.match(/release(-group)?/)) {/*forced*/
								lab.style.opacity = ".5";
								cfgcb.setAttribute("disabled", "disabled");
							} else {/*read previous settings from local storage*/
								var cfgstu = localStorage.getItem(userjs+"cfg"+cstuff);
								if (cfgstu == "1") {
									cfgcb.setAttribute("checked", "checked");
								} else if (cfgstu == "0") {
									cfgcb.removeAttribute("checked");
								}
							}
							if (cstuff.match(/artist|work/)) {/*artist and work tracking requires recording tracking*/
								cfgcb.addEventListener("change", function(e) {
									if (this.checked) {
										var recording = this.parentNode.parentNode.querySelector("input[name='recording']");
										recording.checked = true;
										sendEvent(recording, "change");
									}
								}, false);
							} else if (cstuff.match(/recording/)) {
								cfgcb.addEventListener("change", function(e) {
									if (!this.checked) {
										var artistwork = this.parentNode.parentNode.querySelectorAll("input[name='artist'], input[name='work']");
										for (var aw=0; aw<artistwork.length; aw++) {
											artistwork[aw].checked = false;
											sendEvent(artistwork[aw], "change");
										}
									}
								}, false);
							}
							settings.push(lab);
							settings.push(" ");
						}
						xp.snapshotItem(i).appendChild(createTag("td", {a:{class:userjs,rowspan:xp.snapshotLength}}, concat(settings)));
					}
				}
			}
		} else {
			/*almost generic stuff highlighter*/
			stuff = {};
			self.addEventListener("load",function(e){
				for (var stu=0; stu<collectedStuff.length; stu++) {
					localStorage.removeItem("jesus2099skip_linksdeco_"+collectedStuff[stu]);
				}
			},false);
			for (var stu=0; stu<collectedStuff.length; stu++) {
				var cstuff = collectedStuff[stu];
				stuff[cstuff] = {};
				var uphill = "";
				var downhill = cat=="release"&&cstuff=="label"?"":"[count(ancestor::xhtml:div[contains(@id, 'sidebar')])=0]";
				if (!highlightInEditNotes && (cat == "edit" || cat == "edits")) {
					downhill += "[count(ancestor::xhtml:div[contains(@class, 'edit-notes')])=0]";
				}
				var path = uphill+"//xhtml:a[starts-with(@href, '"+server+"/"+cstuff+"/')"+(cat=="release"?" or starts-with(@href, '/"+cstuff+"/')":"")+"]"+downhill;
				xp = document.evaluate(path, document, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xp.snapshotLength > 0) {
					var skip = localStorage.getItem("jesus2099skip_linksdeco_"+cstuff);/*skip deco shared with ENTITY ICONS asks only once per page*/
					if (confirmIfMoreThan < 0 || (xp.snapshotLength <= confirmIfMoreThan || skip && skip == "0" || !(skip && skip == "1") && xp.snapshotLength > confirmIfMoreThan && confirm("jesus2099 links decorator (MB entities / collection)\n\nThere are "+xp.snapshotLength+" "+cstuff.toUpperCase()+"S to parse on this page.\nThis can take a great while to check/decorate all these links.\n\nPress OK if you still want to proceed anyway or\npress CANCEL if you want to skip it this time."))) {
						skip = "0";
						for (i=0; i < xp.snapshotLength; i++) {
							var mbid = xp.snapshotItem(i).getAttribute("href").match(new RegExp("/"+cstuff+"/("+strMBID+")$"));
							if (mbid) {
								mbid = mbid[1];
								if (!stuff[cstuff].loaded) {
									stuff[cstuff].rawids = localStorage.getItem(userjs+cstuff+"s");
									if (stuff[cstuff].rawids) {
										stuff[cstuff].ids = stuff[cstuff].rawids.split(" ");
										debug(" \n"+stuff[cstuff].ids.length+" "+cstuff.toUpperCase()+(stuff[cstuff].ids.length==1?"":"S")+" loaded from local storage ("+userjs+cstuff+"s)\nMatching: "+path, true);
									} else { debug(" \nNo "+cstuff.toUpperCase()+"S in local storage ("+userjs+cstuff+"s)", true); }
									stuff[cstuff].loaded = true;
								}
								if (stuff[cstuff].ids && stuff[cstuff].ids.indexOf(mbid) > -1) {
									debug(mbid+" ● “"+xp.snapshotItem(i).textContent+"”", true);
									decorate(cstuff, xp.snapshotItem(i));
								}
							}
						}
					} else { skip = "1"; }
					localStorage.setItem("jesus2099skip_linksdeco_"+cstuff, skip);
				}
			}
			debug("");
		}
	}
	function decorate(stu, link) {
		var page = document.getElementById("page");
		var h1 = getParent(link, "h1");
		var tabs = getParent(link, "div", "tabs");
		var row = !getParent(link, "ul") && !getParent(link, "dl") && getParent(link, "tr");
		if (row && !h1 && !tabs && !(cat == "release" && page && page.classList.contains("box") && stu == "recording") && stu.match(/^(release|recording|work|release-group)$/)) { row.classList.add("row"); }
		if (!tabs) { link.classList.add("item"); }
		if (cat == "edit" || h1) { page.classList.add("box"); }
		else if (cat == "edits") {
			var edit = getParent(link, "div", "edit-list");
			if (edit) { edit.classList.add(stu.match(/^(release|recording|release-group)$/)?"box":"row"); }
		}
	}
	function setTitle(ldng, pc) {
		var old = document.title.match(/ :: (.+)$/);
		old = old?old[1]:document.title;
		if (ldng) {
			document.title = (pc?pc+"%":"⌛")+" Altering local collection… :: "+old;
		} else {
			document.title = old;
		}
	}
	function loadCollection(mbid, ws, po) {
		var limit = 100;
		var offset = po;
		var page = !ws?po:offset/limit+1;
		setTitle(true);
		var url = ws?"/ws/2/collection/"+mbid+"/releases?limit="+limit+"&offset="+offset:"/collection/"+mbid+"?page="+page;
		if (page == 1) {
			collectionsID = localStorage.getItem(userjs+"collections") || "";
			if (collectionsID .indexOf(mbid) < 0) {
				collectionsID += mbid+" ";
			}
			localStorage.setItem(userjs+"collections", collectionsID);
			modal(true, "Loading collection "+mbid+"…", 1);
			modal(true, concat(["WTF? If you want to stop this monster crap, just ", createA("reload", function(e){location.reload();}), " or close this page."]), 2);
			modal(true, concat(["<hr>", "Fetching releases…"]), 2);
			stuff["release-tmp"] = {ids:[]};
			for (var stu in stuff) if (collectedStuff.indexOf(stu) >= 0) {
				stuff[stu].rawids = localStorage.getItem(userjs+stu+"s") || "";
				stuff[stu].ids = stuff[stu].rawids.length>0?stuff[stu].rawids.split(" "):[];
			}
		}
		modal(true, "Reading page "+page+"… ");
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 401) {
					modal(true, concat(["NG.", "<br>", "Private collection problem, switching to slower mode…"]), 1);
					loadCollection(mbid, false, 1);
				} else if (this.status == 200) {
					var re = ws?'<release id="('+strMBID+')">':'<td>(?:<span class="mp">)?<a href=".+musicbrainz.org/release/('+strMBID+')">(.+)</a>';
					var rels = this.responseText.match(new RegExp(re, "g"));
					if (rels) {
						for (var rel=0; rel<rels.length; rel++) {
							var release = rels[rel].match(new RegExp(re))[1];
							if (stuff["release"].ids.indexOf(release)<0) {
								stuff["release"].ids.push(release);
								stuff["release"].rawids += release+" ";
							}
							stuff["release-tmp"].ids.push(release);
						}
						modal(true, rels.length+" release"+(rels.length==1?"":"s")+" fetched.", 1);
					}
					var ps, lastPage, nextPage;
					if (ws && (lastPage = this.responseText.match(/<release-list count="(\d+)">/))) {
						lastPage = Math.ceil(parseInt(lastPage[1], 10)/limit);
					} else if (!ws) {
						var responseDOM = document.createElement("html"); responseDOM.innerHTML = this.responseText;
						nextPage = responseDOM.querySelector(css_nextPage);
					}
					if (lastPage && page < lastPage || nextPage) {
						if (lastPage && page == 1) { modal(true, "(total "+lastPage+" pages)", 1); }
						retry = 0;
						setTimeout(function() { loadCollection(mbid, ws, ws?offset+limit:page+1); }, chrono(MBWSRate));
					} else if (lastPage && lastPage == page || !nextPage) {
						modal(true, " ", 1);
						if (stuff["release-tmp"].ids.length > 0) {
							localStorage.setItem(userjs+"releases", stuff["release"].rawids);
							modal(true, concat([createTag("strong", {}, stuff["release"].ids.length+" release"+(stuff["release"].ids.length==1?"":"s")), " saved into local storage ("+userjs+"releases)… "]));
							modal(true, "OK.", 2);
							retry = 0;
							setTimeout(function() { fetchReleasesStuff(); }, chrono(MBWSRate));
						} else {
							modal(true, "No new releases.", 2);
							end(true);
						}
						stuff["release"].rawids = "";
					} else {
						end(false, "Error while loading page "+page+(lastPage?"/"+lastPage:"")+".");
					}
				} else {
					if (retry++ < maxRetry ) {
						MBWSRate += slowDownStepAfterRetry;
						modal(true, "Error "+this.status+" ("+retry+"/"+maxRetry+")", 1);
						debugRetry(this.status);
						setTimeout(function() { loadCollection(mbid, ws, ws?offset:page); }, chrono(retryPause));
					} else {
						end(false, "Too many ("+maxRetry+") errors (last "+this.status+" while loading collection).");
					}
				}
			}
		};
		debug(server+url, true);
		chrono();
		xhr.open("GET", url, true);
		xhr.send(null);
	}
	function fetchReleasesStuff(pi) {
		var i = pi?pi:0;
		var mbid = stuff["release-tmp"].ids[i];
		if (mbid && mbid.match(new RegExp(strMBID))) {
			if (i == 0) {
				modal(true, concat(["<hr>", "Fetching release related stuffs…"]), 2);
			}
			var url = "/ws/2/release/"+stuff["release-tmp"].ids[i]+"?inc=release-groups+recordings+artists+artist-credits+labels+recording-level-rels+work-rels";
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						var res = this.responseXML;
						var xp = res.evaluate("//mb:release[1]", res, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
						var relName = xp.snapshotItem(0).getElementsByTagName("title")[0].textContent;
						var relid = xp.snapshotItem(0).getAttribute("id");
						var relComm = res.evaluate("./mb:disambiguation/text()", xp.snapshotItem(0), nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
						relComm = relComm.snapshotLength>0?" ("+relComm.snapshotItem(0).textContent+")":"";
						var frg = document.createDocumentFragment();
						var cou = xp.snapshotItem(0).getElementsByTagName("country");
						if (cou.length > 0) {
							cou = cou[0].textContent;
						}
						if (typeof cou == "string" && cou.length == 2 && (cou.charAt(0) != "X" || cou == "XE")) {
							frg.appendChild(createTag("img", {"a":{"alt":cou, "src":"http://i.hbtronix.de/flags/"+(cou=="XE"?"europeanunion":cou.toLowerCase())+".png"}}));
							frg.appendChild(document.createTextNode(" "));
						}
						modal(true, concat([
							frg,
							createA(relName, "/release/"+relid),
							relComm,
							"<br>",
						]), 0, [i+1, stuff["release-tmp"].ids.length]);
						var sep = "";
						var totalAddedStuff = 0
						for (var stu in stuff) if (stu != "release" && stuff.hasOwnProperty(stu)) {
							var addedStuff = 0;
							xp = res.evaluate("//mb:release[1]//mb:"+stu, res, nsr, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
							for (var ixp=0; ixp<xp.snapshotLength; ixp++) {
								var rgid = xp.snapshotItem(ixp).getAttribute("id");
								if (stu != "artist" || skipArtists.indexOf(rgid) < 0) {
									var stupos = stuff[stu].ids.indexOf(rgid);
									if (stupos<0) {
										stuff[stu].ids.push(rgid);
										stuff[stu].rawids += rgid+" ";
										addedStuff++; totalAddedStuff++;
									}
								}
							}
							if (addedStuff > 0) {
								modal(true, sep+addedStuff+" "+stu+(addedStuff==1?"":"s"));
								sep = ", ";
							}
						}
						if (totalAddedStuff > 0) { modal(true, ".", 1); }
						if (++i < stuff["release-tmp"].ids.length) {
							retry = 0;
							setTimeout(function() { fetchReleasesStuff(i); }, chrono(MBWSRate));
						} else {
							modal(true, " ", 1);
							delete(stuff["release-tmp"]);
							for (var stu in stuff) if (stu != "release" && stuff.hasOwnProperty(stu)) {
								localStorage.setItem(userjs+stu+"s", stuff[stu].rawids);
								stuff[stu].rawids = "";
								modal(true, concat([createTag("strong", {}, stuff[stu].ids.length+" "+stu+(stuff[stu].ids.length==1?"":"s")), " saved into local storage ("+userjs+stu+"s)… "]));
								modal(true, "OK.", 1);
							}
							end(true);
						}
					} else {
						if (retry++ < maxRetry ) {
							MBWSRate += slowDownStepAfterRetry;
							debugRetry(this.status);
							setTimeout(function() { fetchReleasesStuff(i); }, chrono(retryPause));
						} else {
							end(false, "Too many ("+maxRetry+") errors (last "+this.status+" while loading releases’ stuff).");
						}
					}
				}
			};
			debug(server+url, true);
			chrono();
			xhr.open("GET", url, true);
			xhr.send(null);
		}
	}
	var lastchrono;
	function chrono(delay) {
		if (delay) {
			var del = delay + lastchrono - new Date().getTime();
			del = del>0?del:0;
			return del;
		} else {
			lastchrono = new Date().getTime();
			return lastchrono;
		}
	}
	function sInt2msStr(seconds) {
		var s = seconds;
		var div = s%(60*60);
		var h = Math.floor(s/(60*60));
		var m = Math.floor(div/60);
		    s = Math.ceil(div%60);
		return ( (h>0?h+":":"") + (m>9?m:"0"+m) + ":" + (s>9?s:"0"+s) );
	}
	function end(ok, msg) {
		setTitle(false);
		if (debugBuffer != "") { debug(""); }
		if (ok) {
			modal(true, concat(["<br>", "<hr>", "Collection succesfully loaded in local storage.", "<br>", "You may now enjoy this stuff highlighted in various appropriate places. YAY(^o^;)Y", "<br>"]), 1);
		} else {
			modal(true, msg, 1).style.background = cERR;
			alert(dialogprefix+msg);
			modal(true, concat(["You can submit this error message to ", createA("jesus2099", meta.supportURL), " or just ", createA("reload this page", function(e){location.reload();}), "."]), 1);
		}
		closeButt();
	}
	function closeButt() {
		modal(true, concat(["☞ You can now review these cute logs, or ", createA("close", function(e){modal(false);}, "this will close this cute little window"), " them. ஜ۩۞۩ஜ"]), 1);
		document.getElementById(userjs+"modal").previousSibling.addEventListener("click", function(e) {
			if (gaugeto) { clearTimeout(gaugeto); gaugeto = null; }
			this.parentNode.removeChild(this.nextSibling);
			this.parentNode.removeChild(this);
		}, false);
	}
	var gaugeto;
	function modal(show, txt, brs, gauge) {
		var obj = document.getElementById(userjs+"modal");
		if (show && !obj) {
			coolstuff("div", "50", "100%", "100%", "black", ".6");
			obj = coolstuff("div", "55", "600px", "50%", "white");
			obj.setAttribute("id", userjs+"modal");
			obj.style.padding = "4px";
			obj.style.overflow = "auto";
			obj.style.whiteSpace = "nowrap";
			obj.style.border = "4px solid black";
			obj.addEventListener("mouseover", function(e) { this.style.borderColor = "silver"; }, false);
			obj.addEventListener("mouseout", function(e) { this.style.borderColor = "black"; }, false);
			var gaug = obj.appendChild(document.createElement("div"));
			gaug.style.position = "fixed";
			gaug.style.left = 0;
			gaug.style.bottom = 0;
			gaug.style.width = 0;
			gaug.style.background = "black";
			gaug.appendChild(document.createTextNode("\u00a0"));
			gaug = gaug.appendChild(document.createElement("div"));
			gaug.style.position = "fixed";
			gaug.style.left = 0;
			gaug.style.bottom = 0;
			gaug.style.width = "100%";
			gaug.style.textAlign = "center";
			gaug.style.color = "white";
			gaug.style.textShadow = "1px 2px 2px black";
			gaug.appendChild(document.createTextNode("\u00a0"));
		}
		if (show && obj && txt) {
			if (gauge && (pc = Math.floor(100*gauge[0]/gauge[1]))) {
				var gau = obj.firstChild;
				if (gaugeto || gau.style.display == "none") { clearTimeout(gaugeto); gaugeto = null; gau.style.display = "block"; }
				gau.style.width = Math.ceil(self.innerWidth*gauge[0]/gauge[1])+"px";
				gau.lastChild.replaceChild(document.createTextNode(gauge[0]+"/"+gauge[1]+" ("+pc+"%) approx. remaining "+sInt2msStr(Math.ceil((gauge[1]-gauge[0])*MBWSRate/1000))), gau.lastChild.firstChild);
				setTitle(true, pc);
				if (gauge[0] >= gauge[1]) {
					gaugeto = setTimeout(function() {
						if (obj = document.getElementById(userjs+"modal")) obj.firstChild.style.display = "none";
					}, 4000);
				}
			}
			var br = 0;
			if (brs && brs > 0) { br = brs; }
			obj.appendChild(typeof txt=="string"?document.createTextNode(txt):txt);
			for (var ibr=0; ibr<br; ibr++) {
				obj.appendChild(document.createElement("br"));
			}
			if (obj.style.borderColor == "black") { obj.scrollTop = obj.scrollHeight; }
		}
		if (!show && obj) {
			obj.parentNode.removeChild(obj.previousSibling);
			obj.parentNode.removeChild(obj);
		}
		return obj;
		function coolstuff(t,z,x,y,b,o,a) {
			var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
			truc.style.position = "fixed";
			truc.style.zIndex = z;
			truc.style.width = x;
			var xx = x.match(/^([0-9]+)(px|%)$/);
			if (xx) {
				truc.style.left = ((xx[2]=="%"?100:self.innerWidth)-xx[1])/2+xx[2];
			}
			truc.style.height = y;
			var yy = y.match(/^([0-9]+)(px|%)$/);
			if (yy) {
				truc.style.top = ((yy[2]=="%"?100:self.innerHeight)-yy[1])/2+yy[2];
			}
			if (b) { truc.style.background = b; }
			if (o) { truc.style.opacity = o; }
			return truc;
		}
	}
	var altered = false;
	function collectionUpdater(link, action) {
		if (link && action) {
			link.addEventListener("click", function(e) {
				altered = this.getAttribute("href") != location.href;
				modal(true, "Refreshing memory…", 1);
				collectionsID = localStorage.getItem(userjs+"collections") || "";
				for (var stu in stuff) if (collectedStuff.indexOf(stu) >= 0) {
					stuff[stu].rawids = localStorage.getItem(userjs+stu+"s");
					stuff[stu].ids = stuff[stu].rawids!=null?(stuff[stu].rawids.length>0?stuff[stu].rawids.split(" "):[]):null;
				}
				if (stuff["release"].ids && releaseID) {
					setTitle(true);
					var checks = getStuffs();
					switch (action) {
						case "add":
							if (stuff["release"].rawids.indexOf(releaseID) == -1) {
								modal(true, concat([createTag("strong", {}, "Adding this release"), " to loaded collection…"]), 1);
								stuff["release"].rawids += releaseID+" ";
								localStorage.setItem(userjs+"releases", stuff["release"].rawids);
							}
							for (var c=0; c<checks.length; c++) {
								if (match = checks[c].getAttribute("href").match(new RegExp("/("+strType+")/("+strMBID+")$", "i"))) {
									var type = match[1], mbid = match[2];
									if (stuff[type].ids && stuff[type].rawids.indexOf(mbid) < 0 && (type != "artist" || skipArtists.indexOf(mbid) < 0)) {
										modal(true, concat([createTag("strong", {}, ["Adding "+type, " ", createA(type!="release-group"?checks[c].textContent:mbid, checks[c].getAttribute("href"), type)]), "…"]), 1);
										stuff[type].rawids += mbid+" ";
										localStorage.setItem(userjs+type+"s", stuff[type].rawids);
										altered = true;
									}
								}
							}
							setTitle(false);
							break;
						case "remove":
							if (stuff["release"].rawids.indexOf(releaseID) > -1) {
								modal(true, concat([createTag("strong", {}, "Removing this release"), " from loaded collection…"]), 1);
								stuff["release"].rawids = stuff["release"].rawids.replace(new RegExp(releaseID+"( |$)"), "");
								localStorage.setItem(userjs+"releases", stuff["release"].rawids);
								altered = true;
							}
							if (checks.length > 0) {
								lastLink(this.getAttribute("href"));
								stuffRemover(checks);
								return stop(e);
							}
							break;
					}
				}
				if (!altered) {
					modal(true, "Nothing has changed.", 1);
					setTimeout(function(){modal(false)}, 1000);
					return stop(e);
				} else {
					modal(true, "Re‐loading page…", 1);
				}
			}, false);
			decorate("collection", link);
		}
	}
	function getStuffs(what, pwhere) {
		var cont = pwhere?pwhere:document;
		var selector = {
			"release": "div#content table.tbl > tbody > tr > td a[href^='"+server+"/release/']",/*pwhere(lab,rec,rgr)*/
			"release-group": "div.releaseheader a[href^='"+server+"/release-group/']",/*rel*/
			"recording": (pwhere?"div#content [href^='"+server+"/recording/']":"table.medium > tbody > tr > td:not(.pos):not(.video) > a[href^='"+server+"/recording/'], table.medium > tbody > tr > td:not(.pos):not(.video) > :not(div):not(.ars) a[href^='"+server+"/recording/']"),/*pwhere(art,wrk)/rel*/
			"artist": "div.releaseheader a[href^='"+server+"/artist/'], div#content table.tbl > tbody > tr > td > a[href^='"+server+"/artist/'], div#content table.tbl > tbody > tr > td > span.mp > a[href^='"+server+"/artist/']",/*rel*/
			"work": "div#content div.ars > dl.ars > dd > a[href^='"+server+"/work/'], div#content div.ars > dl.ars > dd > span.mp > a[href^='"+server+"/work/']",/*rel*/
			"label": "div#sidebar > ul.links > li a[href^='"+server+"/label/']",/*rel*/
		};
		if (what) {
			return cont.querySelectorAll(selector[what]);
		} else {
			var allrelsel = selector["release-group"];
			if (stuff["recording"].ids) { allrelsel += ", " + selector["recording"]; }
			if (stuff["label"].ids) { allrelsel += ", " + selector["label"]; }
			var all = basicOnly(cont.querySelectorAll(allrelsel));
			var allrecsel = "", sep = "";
			if (stuff["artist"].ids) { allrecsel += sep + selector["artist"]; sep = ", "; }
			if (stuff["work"].ids) { allrecsel += sep + selector["work"]; }
			if (allrecsel != "") {
				all = basicOnly(cont.querySelectorAll(allrecsel), all);
			}
			return all;
		}
		function pathname(href) {
			return href.match(new RegExp("/[^/]+/"+strMBID))+"";
		}
		function basicOnly(nodes, parr) {
			var arr = parr?parr:[];
			var hrefs = [];
			for (var a=0; a<arr.length; a++) {
				hrefs.push(pathname(arr[a].getAttribute("href")));
			}
			for (var n=0; n<nodes.length; n++) {
				if (nodes[n].getAttribute && (href = pathname(nodes[n].getAttribute("href"))) && href.match(new RegExp(strMBID+"$")) && hrefs.indexOf(href) == -1) {
					hrefs.push(href);
					arr.push(nodes[n]);
				}
			}
			return arr;
		}
	}
	function stuffRemover(checks, pp) {
		if (check = checks[0]) {
			var p = pp?pp:1;
			if (checkMatch = check.getAttribute("href").match(new RegExp("/("+strType+")/("+strMBID+")$", "i"))) {
				var checkType = checkMatch[1];
				var checkID = checkMatch[2]
				var checkAgainst;
				switch (checkType) {
					case "label":
					case "recording":
					case "release-group":
						checkAgainst = "release";
						break;
					case "artist":
					case "work":
						checkAgainst = "recording";
						break;
				}
				if (stuff[checkType].rawids.indexOf(checkID) > -1) {
					var url = "/"+checkType+"/"+checkID;
					if (checkType == "artist") { url += "/recordings"; }
					url += "?page="+p;
					modal(true, concat(["Checking "+checkType+" ", createA(checkType!="release-group"?check.textContent:checkID, check.getAttribute("href"), checkType), " against all its ", createA(checkAgainst+"s"+(p>1?" (page "+p+")":""), url), "…"]), 1);
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(e) {
						if (this.readyState == 4) {
							if (this.status == 200) {
								var res = document.createElement("html"); res.innerHTML = this.responseText;
								var nextPage = res.querySelector(css_nextPage);
								var mates = getStuffs(checkAgainst, res);
								for (var m=0; m<mates.length; m++) {
									if (stuff[checkAgainst].rawids.indexOf(mates[m].getAttribute("href").match(new RegExp(strMBID))) > -1) {
										modal(true, createTag("span", {"s":{"color":"grey"}}, "still used: keeping."), 1);
										retry = 0;
										setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
										return;
									}
								}
								if (nextPage) {
									if (p == 1) { modal(true, createTag("span", {"s":{"color":"grey"}}, "(several pages but this check will stop as soon as it finds something)"), 1); }
									retry = 0;
									setTimeout(function() { stuffRemover(checks, p+1); }, chrono(MBWSRate));
								} else {
									modal(true, concat([createTag("span", {"s":{"color":"grey"}}, "not used any more: "), "removing…"]), 1);
									stuff[checkType].rawids = stuff[checkType].rawids.replace(new RegExp(checkID+"( |$)"), "");
									localStorage.setItem(userjs+checkType+"s", stuff[checkType].rawids);
									altered = true;
									retry = 0;
									setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
								}
							} else {
								if (retry++ < maxRetry ) {
									MBWSRate += slowDownStepAfterRetry;
									debugRetry(this.status);
									setTimeout(function() { stuffRemover(checks, p); }, chrono(retryPause));
								} else {
									end(false, "Too many ("+maxRetry+") errors (last "+this.status+" while checking stuff to remove).");
								}
							}
						}/*4*/
					};
					debug(server+url);
					chrono();
					xhr.open("GET", url, true);
					xhr.send(null);
				} else {
					retry = 0;
					setTimeout(function() { stuffRemover(checks.slice(1)); }, chrono(MBWSRate));
				}
			}
		} else {
			setTitle(false);
			if (altered) { lastLink(); } else { modal(false); }
		}
	}
	function lastLink(href) {
		if (href) {
			localStorage.setItem(userjs+"lastlink", href);
		} else {
			if (ll = localStorage.getItem(userjs+"lastlink")) {
				localStorage.removeItem(userjs+"lastlink");
				modal(true, "Re‐loading page…", 1);
				setTimeout(function() { location.href = ll; }, chrono(MBWSRate));
			} else {
				modal(true, " ", 1);
				end(false, "Sorry, I’m lost. I don’t know what was the link you last clicked.");
			}
		}
	}
	function createA(text, link, title, stay) {
		var a = document.createElement("a");
		a.appendChild(document.createTextNode(text));
		if (link && typeof link == "string") {
			a.setAttribute("href", link);
			if (!stay) {
				a.setAttribute("target", "_blank");
			}
		} else {
			if (link && typeof link == "function") {
				a.addEventListener("click", link, false);
			}
			a.style.cursor = "pointer";
		}
		if (title){ a.setAttribute("title", title); }
		return a;
	}
	function createTag(tag, gadgets, children) {
		var t = (tag=="fragment"?document.createDocumentFragment():document.createElement(tag));
		if(t.tagName) {
			if (gadgets) {
				for (var attri in gadgets.a) if (gadgets.a.hasOwnProperty(attri)) t.setAttribute(attri, gadgets.a[attri]);
				for (var style in gadgets.s) if (gadgets.s.hasOwnProperty(style)) t.style.setProperty(style.replace(/!/g,"").replace(/[A-Z]/g,"-$&").toLowerCase(), gadgets.s[style].replace(/!/g,""), style.match(/!/)||gadgets.s[style].match(/!/)?"important":"");
				for (var event in gadgets.e) if (gadgets.e.hasOwnProperty(event)) t.addEventListener(event, gadgets.e[event], false);
			}
			if (t.tagName == "A" && !t.getAttribute("href") && !t.style.getPropertyValue("cursor")) t.style.setProperty("cursor", "pointer");
		}
		if (children) { var chldrn = children; if ((typeof chldrn).match(/number|string/) || chldrn.nodeType) chldrn = [chldrn]; for(var child=0; child<chldrn.length; child++) t.appendChild((typeof chldrn[child]).match(/number|string/)?document.createTextNode(chldrn[child]):chldrn[child]); t.normalize(); }
		return t;
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
	function concat(tstuff) {
		var concats = document.createDocumentFragment();
		var stuff = tstuff;
		if (typeof stuff != "object" || !stuff.length) {
			stuff = [stuff];
		}
		for (var thisStuff=0; thisStuff<stuff.length; thisStuff++) {
			var ccat = stuff[thisStuff];
			if (typeof ccat == "string") {
				var ccatr = ccat.match(/^<(.+)>$/);
				if (ccatr) { ccat = document.createElement(ccatr[1]); }
				else { ccat = document.createTextNode(ccat); }
			}
			concats.appendChild(ccat);
		}
		return concats;
	}
	function stop(e) {
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		e.preventDefault();
		return false;
	}
	function debug(txt, buffer) {
		if (DEBUG) {
			if (buffer) {
				debugBuffer += txt+"\n";
			} else {
				console.log(userjs+"(collec.HL)\n"+debugBuffer+txt);
				debugBuffer = "";
			}
		}
	}
	function debugRetry(status) {
		debug("Error "+status+"\nRetrying ("+retry+"/"+maxRetry+") in "+retryPause+" ms\nSlowing down, new rate: "+(MBWSRate-slowDownStepAfterRetry)+"+"+slowDownStepAfterRetry+" = "+MBWSRate+" ms");
	}
	function nsr(prefix) {
	  var ns = {
	    "xhtml": "http://www.w3.org/1999/xhtml",
	    "mb": "http://musicbrainz.org/ns/mmd-2.0#",
	  };
	  return ns[prefix] || null;
	}
	function sendEvent(n, e){
		var ev = document.createEvent("HTMLEvents");
		ev.initEvent(e.toLowerCase(), true, true);
		n.dispatchEvent(ev);
	}
})();