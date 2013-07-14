Markdown
--------
Somehow GFM compatible markdown parser.

This project was developed as supporting project for jsdocgen but can be used on its own.

For the supported syntax check Markdown.js or the documentation of jsdocgen.



TODO
----

* Ideally should be able to handle case like this \*\*strong \`intersects\*\* backtics\` and
  not produce broken html with intersecting elements.
* Right now the thing is not optimized. When it finds, for example, a code block, it should not look for the same pattern
  in the part of the text before the match. This will save a lot of regex passes.
* Nesting code in ul/ol
* matchRecursive should cache regexes


Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)