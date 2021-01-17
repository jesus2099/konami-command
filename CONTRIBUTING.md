How to contribute
=================

Thank you very much for your interest in contributing to these userscripts.

Testing
-------

Usually https://test.musicbrainz.org is a great place for testing the 
userscripts that do modify database.

All changes there, are made in a test environment where you will not 
do any damage to MusicBrainz.

For testing features that only display things without editing, 
you should use the main https://musicbrainz.org site and make sure
your change does work properly over there.

Before committing your change, make sure you followed the same code style,
as much as possible:

- Indent with tabs (one at a time)
- Use English words


ESLint
------

ESLint is a code inspector: https://eslint.org

If you make a big change or if you like, and if you know how to do, 
there is an eslint config file here, so you can run eslint to check if
your code is OK against it.

# Install (nodejs, npm, eslint) on your PC

You must first install some big heavy packages on your PC.
Install the `npm` pakage, it should also install `nodejs`:


    sudo apt install npm

From here you can already run eslint, but it installs it everytime 
before each run, which takes very much time.

# Install eslint on your clone

Then go into your cloned repository (`/konami-command/` folder).
Notice that there is a `package.json` file here, 
which is some sort of `nodejs` (or `npm`? no idea) project file. 
Useful or useless, I do not know but 
I think you do not need to edit it.

Now to install eslint locally in this cloned repository, run:

    npm install --save-dev eslint

You may, like me, get some weirdo warning like:

    npm does not support Node.js v10.23.1`

but worry not, it works nonetheless.

# Run eslint on your modified file

I think it would be possible to add a pre-commit script in .git/hooks
But I will try that later.

For the moment, you can run one of the following commands:

    npx eslint <modified.user.js>
    npm eslint <modified.user.js>

I have added the following to my Geany (an editor) build command (F8):

    npx eslint --format compact "%f"

