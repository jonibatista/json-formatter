// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name content.js
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/chrome_extensions.js
// @js_externs var console = {assert: function(){}};
// @formatting pretty_print
// ==/ClosureCompiler==

/** @license
  JSON Formatter | MIT License
  Copyright 2012 Callum Locke

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
  of the Software, and to permit persons to whom the Software is furnished to do
  so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

 */

/*jshint eqeqeq:true, forin:true, strict:true */
/*global chrome, console */

(function() {

  "use strict" ;

  var jfListContent,
      jfTableContent,
      pre,
      jfStyleEl,
      slowAnalysisTimeout,
      port,
      startTime = +(new Date()),
      domReadyTime,
      isJsonTime,
      exitedNotJsonTime,
      displayedFormattedJsonTime,
      buttonSelected = document.createElement('button')
  ;
  
  // Open the port "jf" now, ready for when we need it
    // console.time('established port') ;
    port = chrome.extension.connect({name: 'jf'}) ;
    
  // Add listener to receive response from BG when ready
    port.onMessage.addListener( function (msg) {
      // console.log('Port msg received', msg[0], (""+msg[1]).substring(0,30)) ;
      
      switch (msg[0]) {
        case 'NOT JSON' :
          pre.hidden = false ;
          // console.log('Unhidden the PRE') ;
          document.body.removeChild(jfListContent) ;          
          document.body.removeChild(jfTableContent) ;

          exitedNotJsonTime = +(new Date()) ;
          break ;
          
        case 'FORMATTING' :
          isJsonTime = +(new Date()) ;

          // It is JSON, and it's now being formatted in the background worker.

          // Clear the slowAnalysisTimeout (if the BG worker had taken longer than 1s to respond with an answer to whether or not this is JSON, then it would have fired, unhiding the PRE... But now that we know it's JSON, we can clear this timeout, ensuring the PRE stays hidden.)
            clearTimeout(slowAnalysisTimeout) ;
          
          // Insert CSS
            jfStyleEl = document.createElement('style') ;
            jfStyleEl.id = 'jfStyleEl' ;
            //jfStyleEl.innerText = 'body{padding:0;}' ;
            document.head.appendChild(jfStyleEl) ;

            jfStyleEl.insertAdjacentHTML(
              'beforeend',
              'body{-webkit-user-select:text;overflow-y:scroll !important;margin:0;position:relative}#optionBar{-webkit-user-select:none;display:block;position:absolute;top:9px;right:17px}#buttonListFormat,#buttonTableFormat,#buttonPlain{-webkit-border-radius:2px;-webkit-box-shadow:0px 1px 3px rgba(0,0,0,0.1);-webkit-user-select:none;background:-webkit-linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5);border:1px solid #aaa;color:#444;font-size:12px;margin-bottom:0px;min-width:4em;padding:3px 0;position:relative;z-index:10;display:inline-block;width:80px;text-shadow:1px 1px rgba(255,255,255,0.3)}#buttonListFormat{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}#buttonTableFormat{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}#buttonPlain{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0;border-right:none}#buttonListFormat:hover,#buttonTableFormat:hover,#buttonPlain:hover{-webkit-box-shadow:0px 1px 3px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9);border-color:#999;color:#222}#buttonListFormat:active,#buttonTableFormat:active,#buttonPlain:active{-webkit-box-shadow:inset 0px 1px 3px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc);color:#333}#buttonListFormat.selected,#buttonTableFormat.selected,#buttonPlain.selected{-webkit-box-shadow:inset 0px 1px 5px rgba(0,0,0,0.2);background:#ebebeb -webkit-linear-gradient(#e4e4e4, #dfdfdf 40%, #dcdcdc);color:#333}#jsonpOpener,#jsonpCloser{padding:4px 0 0 8px;color:black;margin-bottom:-6px}#jsonpCloser{margin-top:0}#formattedJson{padding-left:28px;padding-top:6px}pre{padding:36px 5px 5px 5px}.kvov{display:block;padding-left:20px;margin-left:-20px;position:relative}.collapsed{white-space:nowrap}.collapsed>.blockInner{display:none}.collapsed>.ell:after{content:"…";font-weight:bold}.collapsed>.ell{margin:0 4px;color:#888}.collapsed .kvov{display:inline}.e{width:20px;height:18px;display:block;position:absolute;left:-2px;top:1px;z-index:5;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYGBgOADE%2F3Hgw0DM4IRHgSsDFOzFInmMAQnY49ONzZRjDFiADT7dMLALiE8y4AGW6LoBAgwAuIkf%2F%2FB7O9sAAAAASUVORK5CYII%3D");background-repeat:no-repeat;background-position:center center;display:block;opacity:0.15}.collapsed>.e{-webkit-transform:rotate(-90deg);width:18px;height:20px;left:0px;top:0px}.e:hover{opacity:0.35}.e:active{opacity:0.5}.collapsed .kvov .e{display:none}.blockInner{display:block;padding-left:24px;border-left:1px dotted #bbb;margin-left:2px}#formattedJson,#jsonpOpener,#jsonpCloser{color:#333;font:13px/18px monospace}#formattedJson{color:#444}.b{font-weight:bold}.s{color:#0B7500;word-wrap:break-word}a:link,a:visited{text-decoration:none;color:inherit}a:hover,a:active{text-decoration:underline;color:#050}.bl,.nl,.n{font-weight:bold;color:#1A01CC}.k{color:black}#formattingMsg{font:13px "Lucida Grande", "Segoe UI", "Tahoma";padding:10px 0 0 8px;margin:0;color:#333}#formattingMsg>svg{margin:0 7px;position:relative;top:1px}[hidden]{display:none !important}span{white-space:pre-wrap}@-webkit-keyframes spin{from{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}#spinner{-webkit-animation:spin 2s 0 infinite}*{-webkit-font-smoothing:antialiased}#jfTableContent{overflow: auto;padding-top:40px;}#jfTable{border-collapse:collapse;width:100%}#jfTableContent td,th{border: solid 1px black}'
            ) ;
  
            // Add custom font name if set - FROM FUTURE
              // if (typeof settings.fontName === 'string') {
              //   jfStyleEl.insertAdjacentHTML(
              //     'beforeend',
              //     '#formattedJson,#jsonpOpener,#jsonpCloser{font-family: "' + settings.fontName + '"}'
              //   ) ;
              // }

          // Show 'Formatting...' spinner
            // jfListContent.innerHTML = '<p id="formattingMsg"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP%2F%2F%2FwAAANra2tDQ0Orq6gYGBgAAAC4uLoKCgmBgYLq6uiIiIkpKSoqKimRkZL6%2BviYmJgQEBE5OTubm5tjY2PT09Dg4ONzc3PLy8ra2tqCgoMrKyu7u7gAAAAAAAAAAACH%2BGkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAALAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh%2BQQACwABACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5%2By967tYLyicBYE7EYkYAgAh%2BQQACwACACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W%2FHISxGBzdHTuBNOmcJVCyoUlk7CEAAh%2BQQACwADACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ%2BYrBH%2BhWPzJFzOQQaeavWi7oqnVIhACH5BAALAAQALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkEAAsABQAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C%2B4FIIACH5BAALAAYALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa%2F7txxwlwv2isSacYUc%2Bl4tADQGQ1mvpBAAIfkEAAsABwAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r%2Fu3HHCXC%2FaKxJpxhRz6Xi0ANAZDWa%2BkEAA7AAAAAAAAAAAA"> Formatting...</p>' ;
            // jfListContent.innerHTML = '<p id="formattingMsg">Formatting...<br><progress/></p>' ;
            jfListContent.innerHTML = '<p id="formattingMsg"><svg id="spinner" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path></svg> Formatting...</p>' ;


            var formattingMsg = document.getElementById('formattingMsg') ;
            // TODO: set formattingMsg to visible after about 300ms (so faster than this doesn't require it)
            formattingMsg.hidden = true ;
            setTimeout(function(){
              formattingMsg.hidden = false ;
            }, 250) ;
          
          
          // Create option bar
            var optionBar = document.createElement('div') ;
            optionBar.id = 'optionBar' ;
          
          
          // Show options link, if needed - FROM FUTURE
            // if (settings.enableOptionsLink) {
            //   var optionsLink = document.createElement('a') ;
            //   optionsLink.id = 'optionsLink' ;
            //   optionsLink.innerText = 'Options' ;
            //   optionsLink.href = settings['optionsUrl'] ;
            //   optionsLink.target = '_BLANK' ;
            //   optionBar.appendChild(optionsLink) ;
            // }
          
          // Create toggleFormat button
            var buttonPlain = document.createElement('button'),
              buttonListFormat = document.createElement('button'),
              buttonTableFormat = document.createElement('button') ;
            buttonPlain.id = 'buttonPlain' ;
            buttonPlain.innerText = 'Raw' ;
            buttonListFormat.id = 'buttonListFormat' ;
            buttonListFormat.innerText = 'List' ;
            buttonListFormat.classList.add('selected') ;
            buttonSelected = buttonListFormat;
            buttonTableFormat.id = 'buttonTableFormat' ;
            buttonTableFormat.innerText = 'Table' ;
            
            buttonPlain.addEventListener(
              'click',
              function () {
                // When plain button clicked...
                if (buttonSelected.id != 'buttonPlain') {
                  pre.hidden = false ;
                  jfListContent.hidden = true ;                  
                  jfTableContent.hidden = true ;

                  buttonSelected.classList.remove('selected') ;
                  buttonSelected = buttonPlain;
                  buttonPlain.classList.add('selected') ;
                }
              },
              false
            ) ;
            
            buttonListFormat.addEventListener(
              'click',
              function () {
                // When list format button clicked...
                if (buttonSelected.id != 'buttonListFormat') {
                  pre.hidden = true ;
                  jfListContent.hidden = false ;                  
                  jfTableContent.hidden = true ;

                  buttonSelected.classList.remove('selected') ;
                  buttonSelected = buttonListFormat;
                  buttonListFormat.classList.add('selected') ;
                }
              },
              false
            ) ;

            buttonTableFormat.addEventListener(
              'click',
              function () {
                // When table format button clicked...
                if (buttonSelected.id != 'buttonTableFormat') {
                  pre.hidden = true ;
                  jfListContent.hidden = true ;
                  jfTableContent.hidden = false ;

                  buttonSelected.classList.remove('selected') ;
                  buttonSelected = buttonTableFormat;
                  buttonTableFormat.classList.add('selected') ;
                }
              },
              false
            ) ;
            
            // Put it in optionBar
              optionBar.appendChild(buttonPlain) ;
              optionBar.appendChild(buttonListFormat) ;              
              optionBar.appendChild(buttonTableFormat) ;

          // Attach event handlers
            document.addEventListener(
              'click',
              generalClick,
              false // No need to propogate down
            ) ;
          
          // Put option bar in DOM
            document.body.insertBefore(optionBar, pre) ;

          break ;
            
        case 'FORMATTED' :
          // Insert HTML content
            jfListContent.innerHTML = msg[1] ;
          
          displayedFormattedJsonTime = Date.now() ;

          // Log times
            //console.log('DOM ready took '+ (domReadyTime - startTime) +'ms' ) ;
            //console.log('Confirming as JSON took '+ (isJsonTime - domReadyTime) +'ms' ) ;
            //console.log('Formatting & displaying JSON took '+ (displayedFormattedJsonTime - isJsonTime) +'ms' ) ;
            // console.log('JSON detected and formatted in ' + ( displayedFormattedJsonTime - domReadyTime ) + ' ms') ;
            // console.markTimeline('JSON formatted and displayed') ;

          // Export parsed JSON for easy access in console
            setTimeout(function () {
              var script = document.createElement("script") ;
              script.innerHTML = 'window.json = ' + JSON.parse(JSON.stringify(msg[2])) + ';' ;
              document.head.appendChild(script) ;
              console.log('JSON Formatter: Type "json" to inspect.') ;

              // parse json object into html table
              // This might be refectored because it might be not well integrated with the project authors source.  
              jsonToTable(JSON.parse(msg[2]));
            }, 100) ;

          break ;
        
        default :
          throw new Error('Message not understood: ' + msg[0]) ;
      }
    });
  
    // console.timeEnd('established port') ;


  function ready () {
    
    domReadyTime = Date.now() ;
      
    // First, check if it's a PRE and exit if not
      var bodyChildren = document.body.childNodes ;
      pre = bodyChildren[0] ;
      var jsonLength = (pre && pre.innerText || "").length ;
      if (
        bodyChildren.length !== 1 ||
        pre.tagName !== 'PRE' ||
        jsonLength > (3000000) ) {

        // console.log('Not even text (or longer than 3MB); exiting') ;
        // console.log(bodyChildren.length,pre.tagName, pre.innerText.length) ;

        // Disconnect the port (without even having used it)
          port.disconnect() ;
        
        // EXIT POINT: NON-PLAIN-TEXT PAGE (or longer than 3MB)
      }
      else {
        // This is a 'plain text' page (just a body with one PRE child).
        // It might be JSON/JSONP, or just some other kind of plain text (eg CSS).
        
        // Hide the PRE immediately (until we know what to do, to prevent FOUC)
          pre.hidden = true ;
          //console.log('It is text; hidden pre at ') ;
          slowAnalysisTimeout = setTimeout(function(){
            pre.hidden = false ;
          }, 1000) ;
        
        // Send the contents of the PRE to the BG script
          // Add jfListContent DIV, ready to display stuff
            jfListContent = document.createElement('div') ;
            jfListContent.id = 'jfListContent' ;
            document.body.appendChild(jfListContent) ;

            jfTableContent = document.createElement('div') ;
            jfTableContent.id = 'jfTableContent' ;
            jfTableContent.hidden = true ;
            document.body.appendChild(jfTableContent) ;

          // Post the contents of the PRE
            port.postMessage({
              type: "SENDING TEXT",
              text: pre.innerText,
              length: jsonLength
            });
          
          // Now, this script will just wait to receive anything back via another port message. The returned message will be something like "NOT JSON" or "IS JSON"
      
      }
  }
  
  document.addEventListener("DOMContentLoaded", ready, false);

  var lastKvovIdGiven = 0 ;
  function collapse(elements) {
    // console.log('elements', elements) ;

    var el, i, blockInner, count ;

    for (i = elements.length - 1; i >= 0; i--) {
      el = elements[i] ;
      el.classList.add('collapsed') ;

      // (CSS hides the contents and shows an ellipsis.)

      // Add a count of the number of child properties/items (if not already done for this item)
        if (!el.id) {
          el.id = 'kvov' + (++lastKvovIdGiven) ;

          // Find the blockInner
            blockInner = el.firstElementChild ;
            while ( blockInner && !blockInner.classList.contains('blockInner') ) {
              blockInner = blockInner.nextElementSibling ;
            }
            if (!blockInner)
              continue ;

          // See how many children in the blockInner
            count = blockInner.children.length ;

          // Generate comment text eg "4 items"
            var comment = count + (count===1 ? ' item' : ' items') ;
          // Add CSS that targets it
            jfStyleEl.insertAdjacentHTML(
              'beforeend',
              '\n#kvov'+lastKvovIdGiven+'.collapsed:after{color: #aaa; content:" // '+comment+'"}'
            ) ;
        }
    }
  }
  function expand(elements) {
    for (var i = elements.length - 1; i >= 0; i--)
      elements[i].classList.remove('collapsed') ;
  }

  var mac = navigator.platform.indexOf('Mac') !== -1,
      modKey ;
  if (mac)
    modKey = function (ev) {
      return ev.metaKey ;
    } ;
  else
    modKey = function (ev) {
      return ev.ctrlKey ;
    } ;

  function generalClick(ev) {
    // console.log('click', ev) ;

    if (ev.which === 1) {
      var elem = ev.target ;
      
      if (elem.className === 'e') {
        // It's a click on an expander.

        ev.preventDefault() ;

        var parent = elem.parentNode,
            div = jfListContent,
            prevBodyHeight = document.body.offsetHeight,
            scrollTop = document.body.scrollTop,
            parentSiblings
        ;
        
        // Expand or collapse
          if (parent.classList.contains('collapsed')) {
            // EXPAND
              if (modKey(ev))
                expand(parent.parentNode.children) ;
              else
                expand([parent]) ;
          }
          else {
            // COLLAPSE
              if (modKey(ev))
                collapse(parent.parentNode.children) ;
              else
                collapse([parent]) ;
          }

        // Restore scrollTop somehow
          // Clear current extra margin, if any
            div.style.marginBottom = 0 ;

          // No need to worry if all content fits in viewport
            if (document.body.offsetHeight < window.innerHeight) {
              // console.log('document.body.offsetHeight < window.innerHeight; no need to adjust height') ;
              return ;
            }

          // And no need to worry if scrollTop still the same
            if (document.body.scrollTop === scrollTop) {
              // console.log('document.body.scrollTop === scrollTop; no need to adjust height') ;
              return ;
            }

          // console.log('Scrolltop HAS changed. document.body.scrollTop is now '+document.body.scrollTop+'; was '+scrollTop) ;
          
          // The body has got a bit shorter.
          // We need to increase the body height by a bit (by increasing the bottom margin on the jfListContent div). The amount to increase it is whatever is the difference between our previous scrollTop and our new one.
          
          // Work out how much more our target scrollTop is than this.
            var difference = scrollTop - document.body.scrollTop  + 8 ; // it always loses 8px; don't know why

          // Add this difference to the bottom margin
            //var currentMarginBottom = parseInt(div.style.marginBottom) || 0 ;
            div.style.marginBottom = difference + 'px' ;

          // Now change the scrollTop back to what it was
            document.body.scrollTop = scrollTop ;
            
        return ;
      }
    }
  }

  function jsonToTable(json) {
    var html = '<table id="jfTable"><thead><tr>',
     keys = Object.keys(json[0]),
     baseRow = document.createElement('tr'),
     table;

    for (var i = 0; i < keys.length; i++) {
      var cell = baseRow.insertCell(-1);
      cell.className = keys[i];
      html += '<th id="' + keys[i] + '">' + keys[i] + '</th>'; 
    }

    html += '</tr></thead><tbody id="jfTableBody"></tbody></table>';
    jfTableContent.innerHTML = html;

    var tbody = document.getElementById("jfTableBody");
    for (var n = 0; n < json.length; n++) {
      var newRow = baseRow.cloneNode(false);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var cell = newRow.insertCell(-1);
        cell.className = key;

        if( typeof json[n][key] != 'undefined' && json[n][key] !== null && json[n][key].length == 21){
          var date = new Date(parseInt(json[n][key].substr(6)));
          if(isNaN(date)){
            cell.appendChild(document.createTextNode(json[n][key]));        
          }else{
            cell.appendChild(document.createTextNode(date.hhmmyyyymmdd()));     
          }
        }else{  
          cell.appendChild(document.createTextNode(json[n][key]));        
        }
      }

      tbody.appendChild(newRow);
    }
  }; 

  Date.prototype.hhmmyyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var MM = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var hh = this.getHours().toString();
   var mm = this.getMinutes().toString();
   return (hh[1]?hh:"0"+hh[0])+ ':' + (mm[1]?mm:"0"+mm[0]) + ' ' + yyyy + '/' + (MM[1]?MM:"0"+MM[0]) + '/' + (dd[1]?dd:"0"+dd[0]); // padding
  }; 

})();
