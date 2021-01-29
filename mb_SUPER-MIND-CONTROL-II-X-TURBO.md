mb. SUPER MIND CONTROL Ⅱ X TURBO
================================

Some [musicbrainz.org](https://musicbrainz.org) power‐ups (beta too).

:gem: updated [**TAG_TOOLS**](#tag_tools) suppert !

- **Install** from [GitHub]
- [Change logs]
- [Known issues](https://github.com/jesus2099/konami-command/labels/mb_SUPER-MIND-CONTROL-II-X-TURBO)

Requirements
------------

This user script requires one of these browsers:

- [Firefox] on Linux and Windows as well as Android (FF version 68) (**my choice**)
- [Vivaldi] (**my other choice**)
- [Chromium] or [Chrome]

In which you need one of these add-ons/extensions, to install and run:

- [Greasemonkey] (**the pioneer**)
- [Tampermonkey]
- [Violentmonkey] (**my choice**)

Content
-------

1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Settings](#settings)
  1. [RELEASE_CLONER](#release_cloner)
  1. [RADIO_DOUBLE_CLICK_SUBMIT](#radio_double_click_submit) ← <del>[RADIO DOUBLE‐CLICK SUBMIT][USO-135557]</del>
  1. [CONTROL_ENTER_SUBMIT](#control_enter_submit)
  1. [TRACKLIST_TOOLS](#tracklist_tools) ← <del>ex‐TRACK_LENGTH_PARSER + fixed [search→replace][GIST-8580947]</del>
  1. [LAST_SEEN_EDIT](#last_seen_edit)
  1. [COOL_SEARCH_LINKS](#cool_search_links)
  1. [COPY_TOC](#copy_toc) ← <del>[re‐lookup DiscID][USO-104480]</del>
  1. [SERVER_SWITCH](#server_switch) ← <del>[ngs/test/classic musicbrainz switcher][USO-103422]</del>
  1. [TAG_TOOLS](#tag_tools)
  1. [USER_STATS](#user_stats)
  1. [CHECK_ALL_SUBSCRIPTIONS](#check_all_subscriptions) ← <del>[check all subscriptions][USO-122083]</del>
  1. [EASY_DATE](#easy_date) ← [Kejo feature request][USO-193018], very basic [paste‐a‐date!][USO-121217]‐like ([MBS-1197])
  1. [ROW_HIGHLIGHTER](#row_highlighter)
  1. [STATIC_MENU](#static_menu) ← <del>STATIC MENU</del>
  1. [SLOW_DOWN_RETRY](#slow_down_retry)
  1. [CENTER_FLAGS](#center_flags)
  1. [RATINGS_ON_TOP](#ratings_on_top)
  1. [SPOT_AC, SPOT_CAA and WARN_NEW_WINDOW](#spot_ac-spot_caa-and-warn_new_window)
  1. [HIDE_RATINGS](#hide_ratings)


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
**ALMIGHTY SCRUPT [merge][USO-119639]** of (all those are now superseded):

---

### RELEASE_CLONER

Clone (copy/paste) release(s): open Musicbrainz **Editing** menu to find this
**duplication tool** (there’s also a huge workaround to [MBS-6549] that I must
remember to remove when this ticket is fixed).

### RADIO_DOUBLE_CLICK_SUBMIT

Submit forms when double clicking any of its radio buttons ([MBS-3229]).
This leaves vote buttons out to [POWER VOTE][USO-57765] script.

### CONTROL_ENTER_SUBMIT

Submits forms when you hit CTRL+ENTER in a text area.

### TRACKLIST_TOOLS

* **Search replace** text in tracklists.
* Fed up of typing all track times by hands even if you have them as a text
  somewhere? Me too. This is fixed with **Parse track lengths**.
* (Mass) **remove recording relationships** and **Set selected works date**
  in relationship editor.

### LAST_SEEN_EDIT

(default off)

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

### TAG_TOOLS

![three situations WOW][l0zO9nk]

On tag page: Allows to jump from your (or other’s) tags and everyone’s
tags and vice versa with only the magic of one click.

On all pages (sidebar): Your own tags stand out and all of them are displayed
(not only your first 5 tags).

### USER_STATS

[![Freso stats][KvC7dX6]](https://musicbrainz.org/user/Freso)

Adds more stats and vote search links to user pages.

### CHECK_ALL_SUBSCRIPTIONS

![WOW][kGiMP]

Adds a “check all” checkbox to subscriptions pages ([MBS-3629]).

### EASY_DATE

(default off)

Paste full dates (YYYY-MM-DD or D.M.YYYY) in that new YYY+ field and it will fill‐in all Y, M and D fields.

Press “c” key to copy current date into the other (begin→end or end→begin).

### ROW_HIGHLIGHTER

Evolution of brianfreud’s [MusicBrainz row highlighter][USO-118008].
Now also works in details lists and dynamically added content.

### STATIC_MENU

Makes the main MB menu always there when you need it (without scrolling top).

### SLOW_DOWN_RETRY

(default off)

Wait sufficient time and reload when slow down! message.
Useful when opening many background tabs for later editing.

There is now a frequent `read timeout` search error.
This module will retry those as well (and obviously faster than above case).

### CENTER_FLAGS

Vertically center flags (which are otherwise slightly mis‐centered).

### RATINGS_ON_TOP

(default off)

Show (5 stars) ratings at the top of the sidebar (below the image per default).

### SPOT_AC, SPOT_CAA and WARN_NEW_WINDOW

Various user CSS (cf. settings for description).

### HIDE_RATINGS

(default off)

Hide those cute little stars and everything related to ratings in MB.

### UNLINK_ENTITY_HEADER

(default off)

Remove links from page headers (for easier mouse select and copy).


Prestigious awards and international praise
-------------------------------------------

An independent jury of worldwide famous celebrities nominated this script
to the :trophy: **OMFG GOLDEN WORLD CHOMPIONSHIP BLACK BELT AWARD 2011**.

[GitHub]: https://github.com/jesus2099/konami-command/raw/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js
[change logs]: https://github.com/jesus2099/konami-command/commits/master/mb_SUPER-MIND-CONTROL-II-X-TURBO.user.js

[kGiMP]: https://i.imgur.com/kGiMP.png
[kHQeOpQ]: https://i.imgur.com/kHQeOpQ.png
[kHQeOpQs]: https://i.imgur.com/kHQeOpQs.png
[KvC7dX6]: https://i.imgur.com/KvC7dX6.png
[l0zO9nk]: https://i.imgur.com/l0zO9nk.png
[oOeRl7I]: https://i.imgur.com/oOeRl7I.png

[chrome]: https://google.com/chrome
[chromium]: https://download-chromium.appspot.com
[firefox]: https://mozilla.org/firefox
[greasemonkey]: https://www.greasespot.net
[tampermonkey]: https://github.com/Tampermonkey/tampermonkey
[violentmonkey]: https://github.com/violentmonkey/violentmonkey
[vivaldi]: https://vivaldi.com

[MBS-1197]: https://tickets.musicbrainz.org/browse/MBS-1197 "Date field on RE should be magic"
[MBS-3229]: https://tickets.musicbrainz.org/browse/MBS-3229 "Double‐click on radio button to select entry"
[MBS-3629]: https://tickets.musicbrainz.org/browse/MBS-3629 "Mass unsubscribe checkbox"
[MBS-6549]: https://tickets.musicbrainz.org/browse/MBS-6549 "Release Editor Seeding : events.n.country = “JP” doesn’t work"
[MBS-6837]: https://tickets.musicbrainz.org/browse/MBS-6837 "beta.mb→mb link (unset_beta=1) should stay on same page"

[USO-57765]: https://web.archive.org/web/2013/userscripts.org/scripts/show/57765
[USO-103422]: https://web.archive.org/web/2013/userscripts.org/scripts/show/103422
[USO-104480]: https://web.archive.org/web/2013/userscripts.org/scripts/show/104480
[USO-118008]: https://web.archive.org/web/2013/userscripts.org/scripts/show/118008
[USO-121217]: https://web.archive.org/web/2013/userscripts.org/scripts/show/121217
[USO-122083]: https://web.archive.org/web/2013/userscripts.org/scripts/show/122083
[USO-135557]: https://web.archive.org/web/2013/userscripts.org/scripts/show/135557
[GIST-8580947]: https://gist.github.com/jesus2099/8580947 "search→replace bookmarklet"

[USO-119639]: https://web.archive.org/web/2013/userscripts.org/topics/119639
[USO-193018]: https://web.archive.org/web/2013/userscripts.org/topics/193018
