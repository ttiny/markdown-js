Markdown
--------
Somehow GFM compatible markdown parser for Node.js and browsers.

This project was developed as supporting project for [jsdocgen](https://github.com/Perennials/jsdocgen) but can be used on its own.


Supported syntax
----------------
- [GFM](https://help.github.com/articles/github-flavored-markdown)
- [GFM Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

Additionally:
- Reference links to headers `[Header text][]` is the same as
  `[Header text](#header-text)` if no reference with this name is found.
- `~~~` is also a code block.
- `[Internal link][^anchor-name]`.
- `[^anchor-name]:`.
- This is `___underline___`.
- This is `--strike through--` also.
- Line breaks inside headers.
- GFM line breaks are not respected.
  Always two trailing spaces and a newline to insert a line break.
- `\b` will delete the previous character.
- Additional escape characters: `~` `<` `>` `/` `|` and `space` and `tab`.


Usage
-----

```
npm install https://github.com/Perennials/markdown-js/tarball/master
```

```javascript
var Markdown = require( 'Markdown' ).Markdown;
var parsed = Markdown( 'markdown text', options );
```

options (with their default values):
```javascript
{
  tableClass: 'table stripped',
  // Class attribute for table tag.

  thClass: 'text-left',
  // Class attribute for table > thead > th tag.

  tdLeftClass: 'text-left',
  // Class attribute for table > tbody > td tag to align the text left.

  tdRightClass: 'text-right',
  // Class attribute for table > tbody > td tag to align the text right.

  tdCenterClass: 'text-center',
  // Class attribute for table > tbody > td tag to align the text center.

  codeLangClassPrefix: 'lang-',
  // Class prefix for code blocks with specified language.

  codeDefaultLang: null,
  // Default language for code blocks.

  codeBlockWrapPre: false,
  // If to wrap code blocks with pre tag.

  codeBlockClass: 'block',
  // Adds a class name to the code blocks to be able to identify them from inline code.

  codeInlineClass: 'inline',
  // Adds a class name to the inline code elements to be able to identify them from code blocks.

  codeInlineTag: 'code',
  // Chooses a different tag for 'inline code'.

  codeBlockCallback: null,
  // Callback that can be used to style the the code in code blocks.
  // If used this callback is responsible for escaping HTML entities inside the block.
  // First argument is the text to be styled, second argument is the language of the text (if any),
  // third argument is the default language (options). Should return the new HTML.

  codeCallback: null,
  // Additional callback for code, can be used for further escaping. Will be called for both
  // code blocks and inline code. Accepts text and returns new text.

  noCodeCallback: null,
  // Callback to be used as extra parsing step after all markdown has been parsed. Will be executed
  // only for parts of the text that are not code. First argument is the text. Should return text.

  needParagraph: false
  // If needs to wrap the top level element in paragraph.
}
```

return value:
```javascript
{
  html: '',
  // The produced HTML code.

  references: {},
  // All references used in the document.

  headers: []
  // All headers used in the document.
}
```


CHANGELOG
---------

### 1.1
- Added support for linking headers.
- Added support for nesting of code inside lists and blockquotes.
- Some performance optimizations.
- Changed the API a little bit.
- Fixed broken HTML in case if intersecting markdown.

### 1.0
First release for jsdocgen 0.8.



Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)
