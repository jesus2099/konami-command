
How to contribute
=================

Thank you very much for your interest in contributing to these userscripts!


Code style
----------

Before you start coding, please read the simple code style:

- Indent with tabs
- Use English words


Testing
-------

- MusicBrainz (**MB**) database edits should be tested on the **sandbox**:
  https://test.musicbrainz.org
- Other tests can be done on the main MusicBrainz site (**MBS**):
  https://musicbrainz.org

### Interesting MB test pages ###

Here are some interesting special releases or release groups,
for which the web site and/or the web services do special treatments
like pagination, data filtering or data limiting:

- [Release groups with more than 100 releases](https://musicbrainz.org/search?query=releases%3A%5B101+TO+9999999%5D&type=release_group&method=advanced)
  (paginated)
- [Releases with more than 10 mediums](https://musicbrainz.org/search?query=mediums%3A%5B11+TO+99999999%5D&type=release&method=advanced) (mediums 11 and above are collapsed)
- [Releases with more than 500 tracks](https://musicbrainz.org/search?query=tracks%3A%5B501+TO+99999999%5D&type=release&method=advanced)
  for which `recording-level-rels` will not be returned by
  `/ws/2/release/64e12f22-9377-49d3-99a9-155f7f6c4eae?inc=release-groups+recordings+artists+artist-credits+labels+recording-level-rels+work-rels`
  (`relations` will not only be an empty `[]` array, it will be completely asbent ≈ `null`,
  which is fortunate to let us know that we are in this case and that we should fetch the relationships by an additional alternate request)
- [Releases with empty mediums](https://musicbrainz.org/search?query=tracksmedium%3A0&type=release&method=advanced)
- [Releases without mediums](https://musicbrainz.org/search?query=mediums%3A0&type=release&method=advanced)
  (none: not sure if it can really happen)


ESLint
------

[ESLint](https://eslint.org) is a kind of code checker.
This section is mostly for me to remember how to use it.

I have set up an `.eslintrc.yaml` ESLint ruleset in this repo.


### Install (nodejs, npm, eslint) on your PC ###

You must first install some big heavy packages on your PC.
Install the so called `npm` package, that might install something called `nodejs`:

    sudo apt install npm


### Install eslint in each repo ###

Now eslint can be called from anywhere, but it installs each time,
therefore it is very sluggish to run.

Go into repo to _install_ (copy?) eslint locally:

    npm install --save-dev

It will add many files to the repo but don’t worry,
it’s all in `/konami-command/.gitignore`.
No problemo.

Ignore the weirdo warnings, like:

> npm does not support Node.js v10.23.1

The thing stills works good.


### Use eslint to scan userscript files ###

You can run either one of the following commands:

    npx eslint modified.user.js
    npm eslint modified.user.js

You can replace `modified.user.js` by `.` to scan all files.

I have added the following to my Geany editor build command (F8):

    npx eslint --format compact "%f"

But maybe I should have used `npm`? I don’t know…
I don’t remember which one is best!
