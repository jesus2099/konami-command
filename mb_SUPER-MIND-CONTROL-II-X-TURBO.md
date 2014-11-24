mb. SUPER MIND CONTROL Ⅱ X TURBO
================================

Some [musicbrainz.org](http://musicbrainz.org) power‐ups (mbsandbox.org too).

:gem: new **EASY_DATE**®, **TRACKLIST_TOOLS** and **MBSANDBOX.ORG** suppert !

* **Install** from [Greasy Fork], 
  from [OpenUserJS] or 
  from [GitHub]
* [changelogs]

Requirements
------------

This user script requires one of those to install and run:

* [Opera] (runs faster with [Violent monkey])
* [Firefox] + [Greasemonkey]
* [Chromium] (or [Chrome]) + [Tampermonkey]

<!--
TOC
---

<ol class="j2toc"></ol>

1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Settings](#settings)
  1. [RELEASE_CLONER](#release_cloner)
  1. [RADIO_DOUBLE_CLICK_SUBMIT](#radio_double_click_submit) ← <del>[RADIO DOUBLE‐CLICK SUBMIT][135557]</del>
  1. [POWER_RELATE_TO](#power_relate_to) ← <del>[remember last “Relate to …” options + autofocus + autoselect][85790]</del>
  1. [RELEASE_EDITOR_PROTECTOR](#release_editor_protector) ← <del>[release editor tab index fix submit / cancel protector][111023]</del>
  1. [TRACKLIST_TOOLS](#tracklist_tools) ← <del>ex‐TRACK_LENGTH_PARSER + fixed [search→replace][8580947]</del>
  1. [ALIAS_SORT_NAME](#alias_sort_name) ← <del>add alias sort name</del>
  1. [LAST_SEEN_EDIT](#last_seen_edit)
  1. [COOL_SEARCH_LINKS](#cool_search_links)
  1. [COPY_TOC](#copy_toc) ← <del>[re‐lookup DiscID][104480]</del>
  1. [SERVER_SWITCH](#server_switch) ← <del>[ngs/test/classic musicbrainz switcher][103422]</del>
  1. [TAG_SWITCH](#tag_switch)
  1. [USER_STATS](#user_stats)
  1. [RETURN_TO_MB_PROPERLY](#return_to_mb_properly) ([MBS-6837] fix)
  1. [CHECK_ALL_SUBSCRIPTIONS](#check_all_subscriptions) ← <del>[check all subscriptions][122083]</del>
  1. [EASY_DATE](#easy_date) ← [Kejo feature request][193018], very basic [paste‐a‐date!][121217]‐like ([MBS-1197])
  1. [ROW_HIGHLIGHTER](#row_highlighter)
  1. [STATIC_MENU](#static_menu) ← <del>STATIC MENU</del>
  1. [MERGE_USER_MENUS](#merge_user_menus) (default off)
  1. [SLOW_DOWN_RETRY](#slow_down_retry)
  1. [SPOT_AC, SPOT_CAA and WARN_NEW_WINDOW](#spot_ac-spot_caa-and-warn_new_window)
-->

Settings
--------

Everything in this user script is configurable, each module can at least be 
enable or disabled at will in a settings GUI, without editing the code and 
without loosing your settings when the user script is updated.

![oOeRl7I]

INCREDIBL: The marvellously documented settings are directly changed 
in MB’s **Editing** menu ! Now ladies and gentlemen fasten your seatbelts 
because you won’t believe how huge this all ended up to be.

This is now world acclaimed ground breaking features 
**ALMIGHTY SCRUPT [merge][119639]** of (all those are now superseded):

<ol class="j2toc"></ol>

---

### RELEASE_CLONER

Clone (copy/paste) release(s): open Musicbrainz **Editing** menu to find this 
**duplication tool** (there’s also a huge workaround to [MBS-6549] that I must 
remember to remove when this ticket is fixed).

### RADIO_DOUBLE_CLICK_SUBMIT

Submit forms when double clicking any of its radio buttons ([MBS-3229]).
This leaves vote buttons out to [POWER VOTE][57765] script.

### POWER_RELATE_TO

![REMEMBER YAY][XZIZI]

Remembers last used search type (artist/release/track/label) and end point 
(release/recordings) for “Relate to …” inline AJAX search relationship 
creator; Quickly get into search text field (autofocus/autoselect).

### RELEASE_EDITOR_PROTECTOR

**Before** :thumbsdown: (using <kbd>TAB</kbd> key):

    Edit note
      ↓
    Cancel → Previous → Enter edit

**After** :thumbsup: (using <kbd>TAB</kbd> key):

                        Edit note
                            ↓
    Cancel ← Previous ← Enter edit

Avoid release edits accidental cancellations in RE’s last tab 
“review/edit note” ([MBS-3112]): 
* Tab‐indexes fix. Next button after TAB from edit note becomes “Enter edit” 
  instead of cancel. 
* cancel button becomes confirm protected. 
* set focus/cursor/select in edit note.

### TRACKLIST_TOOLS

* **Search replace** text in tracklists.
* Fed up of typing all track times by hands even if you have them as a text 
  somewhere? Me too. This is fixed with **Parse track lengths**.
* (Mass) **remove recording relationships** and **Set selected works date** 
  in relationship editor.

### ALIAS_SORT_NAME

Copy as you type it alias name into alias sort name (only if the situation 
allows it and is appropriate) instead of letting empty sort name.

### LAST_SEEN_EDIT

it shows you what edits you have already seen (reviewed) on entities 
edit histories, yeah man. only save states when looking at all edits 
(not only open) of entity.

### COOL_SEARCH_LINKS

Additional search links (switch between open and all edits, 
**Refine this search** link excluding PUID edits, your own edits, 
you didn’t vote on, etc.)

### COPY_TOC

Adds a [re‐lookup](https://musicbrainz.org/cdtoc/attach?toc=1%202%2047265%20150%2024107) 
link next to the CD TOC on a [Disc ID](https://musicbrainz.org/cdtoc/1ddfodmV5lPnb2yMX4U.162ubz0-)’s 
page, so you can copy the Disc ID to another edition release.

### SERVER_SWITCH

You can switch between various MusicBrainz servers (you can edit the list 
of servers for mbsandbox.org).

### TAG_SWITCH

![three situations WOW][l0zO9nk]

Allows to jump from your (or other’s) tags and everyone’s tags and vice versa 
with only the magic of one click.

### USER_STATS

[![Freso stats][KvC7dX6]](https://musicbrainz.org/user/Freso)

Adds more stats and vote search links to user pages.

### RETURN_TO_MB_PROPERLY

When you are on a beta or a test server, the link back to normal MB is now 
fixed so that you stay on the same page on your way back to normal 
musicbrainz.org server (instead of being dumped on the top home page).

### CHECK_ALL_SUBSCRIPTIONS

![WOW][kGiMP]

Adds a “check all” checkbox to subscriptions pages ([MBS-3629]).

### EASY_DATE

Paste full dates (YYYY-MM-DD or D.M.YYYY) in that new YYY+ field and it will fill‐in all Y, M and D fields.

Press “c” key to copy current date into the other (begin→end or end→begin).

### ROW_HIGHLIGHTER

Evolution of brianfreud’s [MusicBrainz row highlighter][118008].
Now also works in details lists and dynamically added content.

### STATIC_MENU

Makes the main MB menu always there when you need it (without scrolling top).

### MERGE_USER_MENUS

(default off)

[![combined menus][kHQeOpQs]][kHQeOpQ]

Merges both **MY NAME** user menu and **MY DATA** user menu into one / 
  also adds **(stop) use beta site link** in **user preferences**.

### SLOW_DOWN_RETRY

(default off)

Wait sufficient time and reload when slow down! message. 
Useful when opening many background tabs for later editing.

### SPOT_AC, SPOT_CAA and WARN_NEW_WINDOW

Various user CSS (cf. settings for description).


prestigious awards and international praise
-------------------------------------------

An independent jury of worldwide famous celebrities discerned this script the
:trophy: **OMFG GOLDEN WORLD CHOMPIONSHIP BLACK BELT AWARD 2011**.

※ Initially coded for [Opera] (it’s even more **TURBO** with [Violent monkey]), 
this script was sent to a dedicated NAZA hacker team which added a patented 3D 
hack that enabled Firefox+Greasemonkey, Chromium+Tampermonkey and the likes.

[Greasy Fork]: https://greasyfork.org/fr/scripts/2322
[OpenUserJS]: https://openuserjs.org/scripts/jesus2099/mb._SUPER_MIND_CONTROL_Ⅱ_X_TURBO
[GitHub]: https://github.com/jesus2099/konami-command/raw/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
[changelogs]: https://github.com/jesus2099/konami-command/commits/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js

[kGiMP]: http://i.imgur.com/kGiMP.png
[kHQeOpQ]: http://i.imgur.com/kHQeOpQ.png
[kHQeOpQs]: http://i.imgur.com/kHQeOpQs.png
[KvC7dX6]: http://i.imgur.com/KvC7dX6.png
[l0zO9nk]: http://i.imgur.com/l0zO9nk.png
[oOeRl7I]: http://i.imgur.com/oOeRl7I.png
[XZIZI]: http://i.imgur.com/XZIZI.gif

[opera]: http://opera.com/download/guide/?ver=12.17
[violent monkey]: http://addons.opera.com/extensions/details/violent-monkey
[firefox]: http://mozilla.org/firefox
[greasemonkey]: http://addons.mozilla.org/firefox/addon/greasemonkey
[chromium]: http://download-chromium.appspot.com
[chrome]: http://google.com/chrome
[tampermonkey]: http://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

[MBS-1197]: http://tickets.musicbrainz.org/browse/MBS-1197 "Date field on RE should be magic"
[MBS-3112]: http://tickets.musicbrainz.org/browse/MBS-3112 "TAB from “Edit note” doesn’t go to “Enter edit” in “Release editor”"
[MBS-3229]: http://tickets.musicbrainz.org/browse/MBS-3229 "Double‐click on radio button to select entry"
[MBS-3629]: http://tickets.musicbrainz.org/browse/MBS-3629 "Mass unsubscribe checkbox"
[MBS-6549]: http://tickets.musicbrainz.org/browse/MBS-6549 "Release Editor Seeding : events.n.country = “JP” doesn’t work"
[MBS-6837]: http://tickets.musicbrainz.org/browse/MBS-6837 "beta.mb→mb link (unset_beta=1) should stay on same page"

[57765]: http://userscripts-mirror.org/scripts/show/57765
[85790]: http://userscripts-mirror.org/scripts/show/85790 "mb. SUPER MIND CONTROL II X TURBO"
[103422]: http://userscripts-mirror.org/scripts/show/103422
[104480]: http://userscripts-mirror.org/scripts/show/104480
[111023]: http://userscripts-mirror.org/scripts/show/111023
[118008]: http://userscripts-mirror.org/scripts/show/118008
[121217]: http://userscripts-mirror.org/scripts/show/121217
[122083]: http://userscripts-mirror.org/scripts/show/122083
[135557]: http://userscripts-mirror.org/scripts/show/135557
[8580947]: https://gist.github.com/jesus2099/8580947 "search→replace bookmarklet"

[119639]: http://userscripts-mirror.org/topics/119639
[193018]: http://userscripts-mirror.org/topics/193018

<script type="text/javascript">
	var toc = document.querySelector("ol.j2toc");
	var chapters = document.querySelectorAll("h3 > a[id]");
	for (var c=0; c<chapters.length; c++) {
		var a = document.createElement("a");
		a.appendChild(document.createTextnode(chapters[c].textContent));
		a.setAttribute("href", "#"+chapters[c].getAttribute("id"));
		toc.appendChild(document.createElement("li").appendChild(a).parentNode);
	}
</script>
