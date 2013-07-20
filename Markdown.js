"use strict";

(function ( exports, global ) {

	// based on the work by Steven Levithan
	// http://stevenlevithan.com/assets/misc/recursion/matchRecursiveRegExp.js
	var _matchRecursive_cache = {};
	function _matchRecursive ( str, left, right, flags ) {
		var flags = flags || '';
		var global = flags.indexOf( 'g' ) > -1;
		var retext =  '(' + left + ')|' + right;
		if ( _matchRecursive_cache[retext] === undefined ) {
			_matchRecursive_cache[retext] = {};
		}
		var re = _matchRecursive_cache[retext][flags];
		if ( re ) {
			re.lastIndex = 0;
		}
		else {
			re = new RegExp( retext, 'g' + flags );
			_matchRecursive_cache[retext][flags] = re;
		}
		var ret = [];
		var t, start, m;
		var startm;

		ret:do {
			t = 0;
			while ( m = re.exec( str ) ) {
				if ( m[1] ) {
					if ( t++ == 0 ) {
						start = re.lastIndex;
						startm = m;
					}
				}
				else if ( t ) {
					if ( --t == 0 ) {
						var match = {
							match: str.slice( startm.index, re.lastIndex ),
							start: startm.index,
							end: re.lastIndex,
						};
						var left = {
							match: startm[1],
							start: startm.index,
							end: startm.index + startm[1].length
						};
						var right = {
							match: m[2],
							start: m.index,
							end: re.lastIndex
						};
						var inner = {
							match: str.slice( left.end, right.start ),
							start: left.end,
							end: right.start
						};
						ret.push( {
							match: match,
							inner: inner,
							left: left,
							right: right
						} );
						if ( global === false ) {
							break ret;
						}
					}
				}
			}
		} while ( t && ( re.lastIndex = start ) );

		return ret.length > 0 ? ( global ? ret : ret[0] ) : null;
	}

	//console.log( _matchRecursive( '<code>asd <code>asd</code> qwe</code>', '<code[^>]*>', '</code>' ) );
	//console.log( _matchRecursive( '<code>asd <code>asd qwe</code>', '<code[^>]*>', '</code>' ) );
	//console.log( _matchRecursive( '<code>asd <code>asd qwe', '<code[^>]*>', '</code>' ) );

	
	



	

	var RE_STAGES = [];







		//private static
		var _htmlEscapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#27;'
		};

		//private static
		var RE_HTML_ESCAPES = /[&<>"']/g;
		var RE_HTML_ESCAPES_BASIC = /[&<>]/g;

		function RECB_HTML_ESCAPES ( match ) {
			return _htmlEscapes[match]; 
		}

		function _escapeHtml ( text ) {
			return text.replace( RE_HTML_ESCAPES, RECB_HTML_ESCAPES );
		}

		function _escapeHtmlBasic ( text ) {
			return text.replace( RE_HTML_ESCAPES_BASIC, RECB_HTML_ESCAPES );
		}




		var RE_TRIM_CODE_INDENT_SPACE = /^    /gm;
		var RE_TRIM_CODE_INDENT_TAB = /^\t/gm;
		function _codeBlock ( code, lang, options ) {

			var str = '';

			var cls = lang || options.codeDefaultLang;
			if ( cls ) {
				cls = options.codeLangClassPrefix + cls;
			}
			if ( options.codeBlockClass ) {
				cls = ( cls ? cls + ' ' : '' ) + options.codeBlockClass;
			}
			if ( cls ) {
				cls = ' class="'+cls+'"';
			}
			else {
				cls = '';
			}
			
			str += ( options.codeBlockWrapPre ? '<pre>' : '' ) + '<code'+cls+'>';
			
			code = options.codeBlockCallback ?
							options.codeBlockCallback( code, lang, options.codeDefaultLang  ) :
							_escapeHtmlBasic( code );

			if ( options.codeCallback ) {
				code = options.codeCallback( code );
			}

			str += code;
			
			str += '</code>' + ( options.codeBlockWrapPre ? '</pre>' : '' );

			return str;
		}

		// code block ```
		RE_STAGES.push( {
			re: /^`{3,}([^\n]+)?\n(?:([\s\S]+?)\n)?`{3,}$/gm,
			cb: function ( unparsed, m ) {
				unparsed.html += _codeBlock( m[2], m[1], unparsed._options );
			}
		} );

		// code block ~~~
		RE_STAGES.push( {
			re: /^~{3,}([^\n]+)?\n(?:([\s\S]+?)\n)?~{3,}$/gm,
			cb: function ( unparsed, m ) {
				unparsed.html += _codeBlock( m[2], m[1], unparsed._options );
			}
		} );

		// code indented with tab
		RE_STAGES.push( {
			re: /(?:\n\n|^)(\t(?:[^\n]|\n\t)+)(?:\n\n|$|\n(?!\t))/g,
			cb: function ( unparsed, m ) {
				unparsed.html += _codeBlock( m[1].replace( RE_TRIM_CODE_INDENT_TAB, '' ), null, unparsed._options );
			}
		} );

		// code indented with four spaces
		RE_STAGES.push( {
			re: /(?:\n\n|^)(    (?:[^\n]|\n    )+)(?:\n\n|$|\n(?!    ))/g,
			cb: function ( unparsed, m ) {
				unparsed.html += _codeBlock( m[1].replace( RE_TRIM_CODE_INDENT_SPACE, '' ), null, unparsed._options );
			}
		} );

		// html code tag
		RE_STAGES.push( {
			re: { start: '<code[^>]*>', end: '</code>', flags: 'i' },
			cb: function ( unparsed, m ) {
				 unparsed.html += _codeBlock( m.inner.match, null, unparsed._options );
			}
		} );















		// lists
		function _parseListItems ( text, spaces, type, unparsed ) {
			type = type.length == 1 ? '[\\+\\-\\*]' : '\\d+\\.';
			var _reListItem = new RegExp( '^(?: *'+type+' ((?:[^\\n]|\\n(?!'+spaces+type+' ))*))', 'gm' );
			var m;
			while ( m = _reListItem.exec( text ) ) {
				unparsed.html += '<li>';
				//start over stages here cause we can have code inside lists which is not matched so far
				//bacase the extra spaces
				new Unparsed( m[1], unparsed );
				unparsed.html += '</li>';
			}
		}

		RE_STAGES.push( {
			re: /^(?:( *)([\+\-\*]|\d+\.) (?:[^\n]|\n(?!\n))*)+(?:\n\n|$)/gm,
			cb: function ( unparsed, m ) {
				var tag = m[2].length == 1 ? 'ul' : 'ol';
				unparsed.html += '<'+tag+'>';
				_parseListItems( m[0], m[1], m[2], unparsed );
				unparsed.html += '</'+tag+'>'
			}
		}  );













		// block quotes
		var RE_TRIM_BLOCKQUOTE = /^> /gm;
		RE_STAGES.push( {
			re: /^(> (?:[^\n]|\n>)+)(?:\n\n|$)/gm,
			cb: function ( unparsed, m ) {
				unparsed.html += '<blockquote>';
				//start over stages here cause we can have code inside lists which is not matched so far
				//bacase the extra spaces
				new Unparsed( m[1].replace( RE_TRIM_BLOCKQUOTE, '' ), unparsed );
				unparsed.html += '</blockquote>';
			}
		} );


















		var RE_MD_ESCAPES = /\\[\\`\*_{}\[\]()#+\-\.!~<> \t\/\|]/gm;
	
		function RECB_MD_ESCAPES ( match ) {
			return '&#'+match.charCodeAt( 1 )+';'; 
		}

		function _escapeMarkdown ( text ) {
			return text.replace( RE_MD_ESCAPES, RECB_MD_ESCAPES );
		}

		var RE_REF1 = /\[([^\^].*?)\]: ?([^\s]+)(?: "([^"\\]*(?:\\.[^"\\]*)*)")?\n?/gm;
		function _getReferences ( text, ret ) {
			return text.replace( RE_REF1, function ( m, id, url, title ) {
				ret.references[id.toLowerCase()] = { url: url, title: title };
				return '';
			} );
		}

		// at this stage we have no code blocks so do escaping and get all references
		RE_STAGES.push( {
			cb: function ( unparsed ) {
				unparsed._text = _getReferences( _escapeMarkdown( unparsed._text ), unparsed._ret );
			}
		} );















		
		// tables
		var STR_RE_TABLE_ROW = '(?:^ *\\|?(?:[^\\|\\n]+\\|[^\\|\\n]+)+(?:\\|[^\\|\\n]+)?\\|? *\\n?)';
		var STR_RE_TABLE_HEAD = '(?:^ *\\|?(?: *:?-+?:? *\\| *:?-+:? *)+(?:\\| *:?-+:? *)?\\|? *\\n?)';
		var RE_TRIM_TABLE_LEFT = /^ *\|? */gm;
		var RE_TRIM_TABLE_RIGHT = / *\|? *$/gm;
		RE_STAGES.push( {
			re: new RegExp( '('+STR_RE_TABLE_ROW+')('+STR_RE_TABLE_HEAD+')('+STR_RE_TABLE_ROW+'*)', 'gm' ),
			cb: function ( unparsed, m ) {
				var m0 = m[0].trim().replace( RE_TRIM_TABLE_LEFT, '' ).replace( RE_TRIM_TABLE_RIGHT, '' );

				//the match
				unparsed.html += '<table class="'+unparsed._options.tableClass+'">';
				var rows = m0.split( '\n' );
				var aligns = [];
				//captions, if any
				if ( m[1] ) {
					var captions = rows.shift().split( '|' );
					unparsed.html += '<thead><tr>';
					for ( var i = 0, iend = captions.length; i < iend; ++i ) {
						unparsed.html += '<th class="'+unparsed._options.thClass+'">';
						new Unparsed( captions[i].trim(), unparsed, true );
						unparsed.html += '</th>';
					}
					unparsed.html += '</tr></thead>';
				}
				//aligns, if any
				if ( m[2] ) {
					aligns = rows.shift().split( '|' );
					for ( var i = 0, iend = aligns.length; i < iend; ++i ) {
						var col = aligns[i].trim();
						var left = col.charAt( 0 ) == ':';
						var right = col.charAt( col.length - 1 ) == ':';
						if ( left && right ) {
							aligns[i] = unparsed._options.tdCenterClass;
						}
						else if ( right ) {
							aligns[i] = unparsed._options.tdRightClass;
						}
						else if ( left ) {
							aligns[i] = unparsed._options.tdLeftClass;
						}
						else {
							aligns[i] = '';
						}
					}
				}

				//normal rows
				unparsed.html += '<tbody>';
				for ( var i = 0, iend = rows.length; i < iend; ++i ) {
					var cols = rows[i].split( '|' );
					unparsed.html += '<tr>';
					for ( var j = 0, jend = cols.length; j < jend; ++j ) {
						var cls = ' class="'+(aligns.length>j?aligns[j]:'')+'"';
						cls = cls.length > 9 ? cls : '';
						unparsed.html += '<td'+cls+'>';
						new Unparsed( cols[j].trim(), unparsed, true );
						unparsed.html += '</td>';
					}
					unparsed.html += '</tr>';
				}
				unparsed.html += '<tbody>';
				unparsed.html += '</table>';

			}
		} );















		





		// headers ###

		var RE_HEADER_NOALPHA = /[^0-9a-zA-Z_ \-]/g;
		var RE_HEADER_SPACE = / /g;
		var RE_WS = /[\s]+/g;

		function _headerAnchor( text ) {
			return text.replace( RE_HEADER_NOALPHA, '' ).replace( RE_HEADER_SPACE, '-' ).toLowerCase();
		}


		RE_STAGES.push( {
			re: /^(#+) ((?:[^\n]+?(?:  \n)?)+?)#*$/gm,
			cb: function( unparsed, m ) {
				var header = {
					level: Math.min( m[1].length, 6 ),
					text: m[2].replace( RE_WS, ' ' )
				};
				header.anchor = _headerAnchor( header.text );
				unparsed._ret.headers.push( header );
				
				var tag = 'h'+header.level;
				unparsed.html += '<a name="'+header.anchor+'"></a><'+tag+'>';
				var h = new Unparsed( m[2], unparsed, true );
				unparsed.html += '</'+tag+'>'
				
				header.html = h.html;
			}
		} );

		// headers --- ===
		RE_STAGES.push( {
			re: /^((?:[^\n](?:  \n[^\n=\-])?)+?)\n(?:(=){3,}|(-){3,})$/gm,
			cb: function( unparsed, m ) {
				var header = {
					level: m[2] ? 1 : 2,
					text: m[1].replace( RE_WS, ' ' )
				};
				header.anchor = _headerAnchor( header.text );
				unparsed._ret.headers.push( header );

				var tag = 'h'+header.level;
				unparsed.html += '<a name="'+header.anchor+'"></a><'+tag+'>';
				var h = new Unparsed( m[1], unparsed, true );
				unparsed.html += '</'+tag+'>'

				header.html = h.html;
			}
		} );















		// hr
		RE_STAGES.push( {
			re: /(?:^|\n\n)[\*_\-]{3,}(?:$|\n\n)/gm,
			cb: function ( unparsed, m ) {
				unparsed.html += '<hr/>';
			}
		} );

















		var RE_STAGE_INLINE = RE_STAGES.length;


		// inline code ```asd```

		var RE_MD_ESCAPES_ATTR =  /[\\`\*_{}\[\]()#+\-\.!~<>\/\|]/gm;
		function RECB_MD_ESCAPES_ATTR ( match ) {
			return '&#'+match.charCodeAt( 0 )+';'; 
		}

		function _escapeMarkdownAttr ( text ) {
			return text.replace( RE_MD_ESCAPES_ATTR, RECB_MD_ESCAPES_ATTR );
		}

		function _escapeHtmlAttr ( text ) {
			return _escapeMarkdownAttr( _escapeHtml( text ) );
		}


		function _inlineCode ( unparsed, m ) {
			var tag = unparsed._options.codeInlineTag;
			var cls = unparsed._options.codeInlineClass ? ' class="'+unparsed._options.codeInlineClass+'"' : '';
			var code = _escapeHtmlAttr( m[2] );
			code = unparsed._options.codeCallback ? unparsed._options.codeCallback( code ) : code;
			unparsed.html += m[1] + '<'+tag+cls+'>' + code + '</'+tag+'>';
		}

		RE_STAGES.push( {
			re: /([^`]|^)(?:```)(?!`) ?([\s\S]+?) ?```(?!`)/gm,
			cb: _inlineCode,
			inline: true
		} );

		// inline code ``asd``
		RE_STAGES.push( {
			re: /([^`]|^)(?:``)(?!`) ?([\s\S]+?) ?``(?!`)/gm,
			cb: _inlineCode,
			inline: true
		} );

		// inline code `asd`
		RE_STAGES.push( {
			re: /([^`]|^)(?:`(?!`))([\s\S]+?)`(?!`)/gm,
			cb: _inlineCode,
			inline: true
		} );










		//<email|url> which is not html tag
		RE_STAGES.push( {
			re: /<(?!\/[a-zA-Z])(?:([^"'>\s]+@[^"'\s>]+)|([^"'>\s]+:\/\/[^"'>\s]+))>/gm,
			cb: function ( unparsed, m ) {
				if ( m[1] ) {
					unparsed.html += '&lt;<a href="mailto:'+_escapeHtmlAttr(m[1])+'">'+m[1]+'</a>&gt;';
				}
				else /*if ( m[2] )*/ {
					unparsed.html += '&lt;<a href="'+_escapeHtmlAttr(m[2])+'">'+m[2]+'</a>&gt;';
				}
			},
			inline: true
		} );






		// in place image
		RE_STAGES.push( {
			re: /!\[(.*?)\]\((.*?)(?: "([^"\\]*(?:\\.[^"\\]*)*)")?\)/gm,
			cb: function ( unparsed, mm ) {
				var m = mm[0], text = mm[1], url = mm[2], title = mm[3];
				var title = ' title="'+_escapeHtmlAttr(text||title||'')+'"';
				title = title.length > 9 ? title : '';
				unparsed.html += '<img src="'+_escapeHtmlAttr(url)+'"'+title+' />';
			},
			inline: true
		} );




		// in place link
		RE_STAGES.push( {
			re: /\[(.*?)\]\((.*?)(?: "([^"\\]*(?:\\.[^"\\]*)*)")?\)/gm,
			cb: function ( unparsed, mm ) {
				var m = mm[0], text = mm[1], url = mm[2], title = mm[3];
				if ( !text ) {
					unparsed.html += m;
					return;
				}
				var title = ' title="'+_escapeHtmlAttr(title||'')+'"';
				title = title.length > 9 ? title : '';
				unparsed.html += '<a href="'+_escapeHtmlAttr(url)+'"'+title+'>';
				new Unparsed( text, unparsed, true );
				unparsed.html += '</a>';
			},
			inline: true
		} );



		// reference image
		RE_STAGES.push( {
			re: /!\[(.*?)\]\[(.*?)\]/gm,
			cb: function ( unparsed, mm ) {
				var m = mm[0], text = mm[1], id = mm[2];
				if ( !id ) {
					if ( text ) {
						id = text;
					}
					else {
						unparsed.html += m;
						return;
					}
				}
				var ref = unparsed._ret.references[ id.toLowerCase() ];
				if ( ref === undefined ) {
					unparsed.html += m;
					return;
				}
				var title = ' title="'+_escapeHtmlAttr(text||ref.title)+'"';
				title = title.length > 9 ? title : '';
				unparsed.html += '<img src="'+_escapeHtmlAttr(ref.url)+'"'+title+' />';
			}
		} );

			
		// reference link
		RE_STAGES.push( {
			re: /\[(.*?)\]\[(.*?)\]/gm,
			cb: function ( unparsed, mm ) {
				var m = mm[0], text = mm[1], id = mm[2];
				var altid = false;
				if ( !id ) {
					if ( text ) {
						id = text;
						altid = true;
					}
					else {
						unparsed.html += m;
						return;
					}
				}
				var ref = unparsed._ret.references[ id.toLowerCase() ];
				var isanchor = id.charAt( 0 ) == '^';
				if ( isanchor || ( altid && ref === undefined ) ) {
					if ( isanchor ) {
						id = _escapeHtmlAttr( id.substr( 1 ).toLowerCase() );
					}
					else {
						id = _headerAnchor( id );
					}
					unparsed.html += '<a href="#'+id+'">';
					new Unparsed( text, unparsed, true );
					unparsed.html += '</a>';
				}
				else {
					if ( !text ) {
						unparsed.html += m;
						return;
					}
					var title = ' title="'+_escapeHtmlAttr(ref.title||'')+'"';
					title = title.length > 9 ? title : '';
					unparsed.html += '<a href="'+_escapeHtmlAttr(ref.url)+'"'+title+'>';
					new Unparsed( text, unparsed, true );
					unparsed.html += '</a>';
				}
			}
		} );







		// emphasis elements
		var _emphasisTags = {
			'___': 'u',
			'**': 'strong',
			'__': 'strong',
			'*': 'em',
			'_': 'em',
			'--': 'strike',
			'~~': 'strike'
		};

		function _emphasis ( unparsed, m ) {
			var tag = _emphasisTags[ m[2] ];
			unparsed.html += m[1] + '<'+tag+'>';
			new Unparsed( m[3], unparsed, true );
			unparsed.html += '</'+tag+'>';
		}

		// underline
		RE_STAGES.push( {
			re: /([^_]|^)(___(?!_))([\s\S]+?)___(?!_)/gm,
			cb: _emphasis,
			inline: true
		} );

		// strong **
		RE_STAGES.push( {
			re: /([^\*]|^)(\*\*(?!\*))([\s\S]+?)\*\*(?!\*)/gm,
			cb: _emphasis,
			inline: true
		} );

		// strong __
		RE_STAGES.push( {
			re: /([^_]|^)(__(?!_))([\s\S]+?)__(?!_)/gm,
			cb: _emphasis,
			inline: true
		} );

		// em *
		RE_STAGES.push( {
			re: /([^\*]|^)(\*(?!\*))([\s\S]+?)\*(?!\*)/gm,
			cb: _emphasis,
			inline: true
		} );

		//em _
		RE_STAGES.push( {
			re:  /([^_a-zA-Z0-9]|^)(_(?!_))((?:[^_]|[a-zA-Z0-9_]+_+[a-zA-Z0-9_]+)+?)_(?![_a-zA-Z0-9])/gm,
			cb: _emphasis,
			inline: true
		} );

		// strike --
		RE_STAGES.push( {
			re: /([^\-]|^)(--(?!-))([\s\S]+?)--(?!-)/gm,
			cb: _emphasis,
			inline: true
		} );

		// strike ~~
		RE_STAGES.push( {
			re: /([^~]|^)(~~(?!~))([\s\S]+?)~~(?!-)/gm,
			cb: _emphasis,
			inline: true
		} );



		

		

		

		


		


		
		// call no code callback if any
		RE_STAGES.push( {
			cb: function ( unparsed ) {
				if ( unparsed._options.noCodeCallback ) {
					unparsed._text = unparsed._options.noCodeCallback( unparsed._text );
				}
			}
		} );










		// br's and final touch
		var RE_BR = /  \n/gm;
		var RE_BACKSPACE = /(.)\\b/gm;
		var RE_REF2 = /\[(\^.+?)\]:\n?/gm;
		function RECB_REF2 ( m, id ) {
			return '<a name="'+_escapeHtmlAttr(id.substr(1).toLowerCase())+'"></a>';
		}

		RE_STAGES.push( {
			cb: function ( unparsed ) {
				unparsed._text = unparsed._text
										.replace( RE_BACKSPACE, '' )
										.replace( RE_BR, '<br/>' )
										.replace( RE_REF2, RECB_REF2 );
				if ( unparsed._trim ) {
					unparsed._text = unparsed._text.trim();
				}
			}
		} );









		function _paragraphs ( text, trim, needp ) {
			if ( text.length == 0 ) {
				return;
			}
			if ( (trim || needp ) && text.indexOf( '\n\n' ) >= 0 ) {
				text = text.split( '\n\n' );
				var ps = [];
				for ( var i = 0, iend = text.length; i < iend; ++i ) {
					text[i] = text[i].trim();
					if ( text[i].length > 0 ) {
						ps.push( text[i] );
					}
				}
				text = ps.join( '</p><p>' );
				needp = true;
			}
			if ( needp ) {
				text = text.trim();
				if ( text.length == 0 ) {
					return;
				}
				return '<p>' + text  + '</p>';
			}
			else {
				return text;
			}
		}


		RE_STAGES.push( {
			cb: function ( unparsed, needp ) {
				var text = _paragraphs( unparsed._text, unparsed._trim, needp );
				if ( text ) {
					unparsed.html += text;
				}
			}
		} );












	function Unparsed ( text, parent, nextstage, needParagraph ) {
		this._text = text;
		this.html = '';
		if ( parent instanceof Unparsed ) {
			this._ret = parent._ret;
			this._options = parent._options;
			this._inline = parent._inline;
			this._stage = nextstage ? parent._stage + 1 : ( parent._inline ? RE_STAGE_INLINE : 0 );
			this._trim = !parent._inline;
		}
		else {
			this._ret = parent;
			this._options = nextstage;
			this._inline = false;
			this._stage = 0;
			this._trim = true;
		}





		for ( ;this._stage < RE_STAGES.length; ++this._stage ) {
			var stage = RE_STAGES[this._stage];
			var re = stage.re;
			var m, start, end;
			if ( re instanceof RegExp ) {
				if ( m = re.exec( this._text ) ) {
					start = m.index;
					end = m.index + m[0].length;
					re.lastIndex = 0;
				}
			}
			else if ( re instanceof Object ) {
				if ( m = _matchRecursive( this._text, re.start, re.end, re.flags ) ) {
					start = m.match.start;
					end = m.match.end;
				}
			}
			else {
				stage.cb( this, needParagraph );
				continue;
			}
			this._inline = this._stage >= RE_STAGE_INLINE;
			var needp = !this._inline;
			if ( m ) {
				//before the match
				new Unparsed( this._text.substr( 0, start ), this, true, needp );

				//the match
				stage.cb( this, m );
				
				//after the match
				new Unparsed( this._text.substr( end ), this, false, needp );

				if ( needParagraph && this._inline ) {
					this.html = _paragraphs( this.html, false, true );
				}

				break;
			}
		}

		parent.html += this.html;
	}















	var RE_EOL = /\r\n|\r/g;
	


	function Markdown ( text, options ) {
		var opts = {
			tableClass: 'table stripped',
			thClass: 'text-left',
			tdLeftClass: 'text-left',
			tdRightClass: 'text-right',
			tdCenterClass: 'text-center',
			codeLangClassPrefix: 'lang-',
			codeDefaultLang: null,
			codeBlockClass: 'block',
			codeInlineClass: 'inline',
			codeInlineTag: "code",
			needParagraph: false
		};

		if ( options instanceof Object ) {
			for ( var key in options ) {
				opts[key] = options[key];
			}
		}

		var ret = {
			html: '',
			references: {},
			headers: []
		};

		new Unparsed( text.replace( RE_EOL, '\n' ), ret, opts, opts.needParagraph );

		return ret;
	}


	exports.Markdown = Markdown;



})( this, typeof global != 'undefined' ? global : window );


