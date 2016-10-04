'use strict';

/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.codemirror', [])
  .constant('uiCodemirrorConfig', {})
  .directive('uiCodemirror', uiCodemirrorDirective);

/**
 * @ngInject
 */
function uiCodemirrorDirective($timeout, uiCodemirrorConfig) {

  return {
    restrict: 'EA',
    require: '?ngModel',
    compile: function compile() {

      // Require CodeMirror
      if (angular.isUndefined(window.CodeMirror)) {
        throw new Error('ui-codemirror need CodeMirror to work... (o rly?)');
      }

      return postLink;
    }
  };

  function postLink(scope, iElement, iAttrs, ngModel) {

    var codemirrorOptions = angular.extend(
      { value: iElement.text() },
      uiCodemirrorConfig.codemirror || {},
      scope.$eval(iAttrs.uiCodemirror),
      scope.$eval(iAttrs.uiCodemirrorOpts)
    );

    var codemirror = newCodemirrorEditor(iElement, codemirrorOptions);

    configOptionsWatcher(
      codemirror,
      iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts,
      scope
    );

    configNgModelLink(codemirror, ngModel, scope);

    configUiRefreshAttribute(codemirror, iAttrs.uiRefresh, scope);

    // Allow access to the CodeMirror instance through a broadcasted event
    // eg: $broadcast('CodeMirror', function(cm){...});
    scope.$on('CodeMirror', function(event, callback) {
      if (angular.isFunction(callback)) {
        callback(codemirror);
      } else {
        throw new Error('the CodeMirror event requires a callback function');
      }
    });

    // onLoad callback
    if (angular.isFunction(codemirrorOptions.onLoad)) {
      codemirrorOptions.onLoad(codemirror);
    }

    // Pasting images support
    new Paster(codemirror.getWrapperElement(),
        function (data) {
          if (data instanceof Blob) {
            scope.uploadedFile = data;
            scope.uploadImage();
          } else {
            codemirror.replaceSelection('![](' + data + ')')
          }
          codemirror.focus();
        }, function (string) {
          codemirror.focus();
          codemirror.replaceSelection(string);
        });
  }

  function newCodemirrorEditor(iElement, codemirrorOptions) {
    var codemirrot;

    if (iElement[0].tagName === 'TEXTAREA') {
      // Might bug but still ...
      codemirrot = window.CodeMirror.fromTextArea(iElement[0], codemirrorOptions);
    } else {
      iElement.html('');
      codemirrot = new window.CodeMirror(function(cm_el) {
        iElement.append(cm_el);
      }, codemirrorOptions);
    }

    return codemirrot;
  }

  function configOptionsWatcher(codemirrot, uiCodemirrorAttr, scope) {
    if (!uiCodemirrorAttr) { return; }

    var codemirrorDefaultsKeys = Object.keys(window.CodeMirror.defaults);
    scope.$watch(uiCodemirrorAttr, updateOptions, true);
    function updateOptions(newValues, oldValue) {
      if (!angular.isObject(newValues)) { return; }
      codemirrorDefaultsKeys.forEach(function(key) {
        if (newValues.hasOwnProperty(key)) {

          if (oldValue && newValues[key] === oldValue[key]) {
            return;
          }

          codemirrot.setOption(key, newValues[key]);
        }
      });
    }
  }

  function configNgModelLink(codemirror, ngModel, scope) {
    if (!ngModel) { return; }
    // CodeMirror expects a string, so make sure it gets one.
    // This does not change the model.
    ngModel.$formatters.push(function(value) {
      if (angular.isUndefined(value) || value === null) {
        return '';
      } else if (angular.isObject(value) || angular.isArray(value)) {
        throw new Error('ui-codemirror cannot use an object or an array as a model');
      }
      return value;
    });


    // Override the ngModelController $render method, which is what gets called when the model is updated.
    // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
    ngModel.$render = function() {
      //Code mirror expects a string so make sure it gets one
      //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
      var safeViewValue = ngModel.$viewValue || '';
      codemirror.setValue(safeViewValue);
    };


    // Keep the ngModel in sync with changes from CodeMirror
    codemirror.on('change', function(instance) {
      var newValue = instance.getValue();
      if (newValue !== ngModel.$viewValue) {
        scope.$evalAsync(function() {
          ngModel.$setViewValue(newValue);
        });
      }
    });
  }

  function configUiRefreshAttribute(codeMirror, uiRefreshAttr, scope) {
    if (!uiRefreshAttr) { return; }

    scope.$watch(uiRefreshAttr, function(newVal, oldVal) {
      // Skip the initial watch firing
      if (newVal !== oldVal) {
        $timeout(function() {
          codeMirror.refresh();
        });
      }
    });
  }

}

/**
 * Image pasting for Chrome, Firefox and IE 11
 *
 * @param {DOMNode} elem
 * @param {Function} imageCallback - when image is pasted, this callback is called with either Blob representing raw image to upload, or URL on the image
 * @param {Function} stringCallback - Firefox only - when text is passed, the text is caught and passed through this callback
 */
function Paster(elem, imageCallback, stringCallback) {
  var _self = this;
  var ctrlPressed = false;
  var stringPastTimeout;
  var pasteCatcher;
  var isWebkit = window.chrome !== null && window.chrome !== undefined;


  /**
   * Constructor
   */
  this.init = function () {
    if (isWebkit) {
      elem.addEventListener('paste', _self.pasteHandler, true); //official paste handler
      return;
    }

    // Content editable div, which catches all pasted data (images and text)
    pasteCatcher = document.createElement("div");
    pasteCatcher.setAttribute("id", "paste-catcher");
    pasteCatcher.setAttribute("contenteditable", "");
    pasteCatcher.style.cssText = 'opacity:0;position:fixed;top:0px;left:0px;width:10px;margin-left:-20px;z-index:1;';
    document.body.appendChild(pasteCatcher);

    elem.addEventListener('keydown', _self.onKeyboardAction, false);
    elem.addEventListener('keyup', _self.onKeyboardUpAction, false);
    pasteCatcher.addEventListener('paste', _self.pasteFallback);

    // Observer which detects DOM changes in pasteCatcher
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(_self.mutationHandler);
    });
    var target = document.getElementById('paste-catcher');
    var config = {attributes: true, childList: true, characterData: true};
    observer.observe(target, config);
  };

  this.mutationHandler = function (mutation) {
    if (ctrlPressed == false || mutation.type != 'childList') {
      return true;
    }

    if (mutation.addedNodes.length == 1) {
      // Pasted image
      if (mutation.addedNodes[0].src != undefined) {
        clearTimeout(stringPastTimeout); // Cancel pasting string
        var imgSrc = mutation.addedNodes[0].src;

        if (_self.isUrl(imgSrc)) { // src contains link on image
          imageCallback(imgSrc);
        } else if (imgSrc.lastIndexOf('data:image', 0) === 0) { // src contains img data in base64
          var mimeType = /(image\/(png|jpg|jpeg))/g.exec(imgSrc);
          imgSrc = imgSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
          imageCallback(_self.b64toBlob(imgSrc, mimeType[1]));
        } else { // unknown state
          console.log("Unknown src format: " + imgSrc);
        }
      }

      setTimeout(function () {
        pasteCatcher.innerHTML = '';
      }, 20);
    }
  };

  /**
   * Callback for 'paste' event which process image data.
   *
   * @param event
   */
  this.pasteHandler = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items || event.clipboardData.files;
    if (items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          var blob = items[i].getAsFile();
          imageCallback(blob);
          event.preventDefault();
        }
      }
    }
  };

  /**
   * Fallback callback for Firefox for pasting a plain text.
   * After event is fired, timeout is set to see if the pasted data was image or text.
   * If it was image, the timeout is cleared by the mutation observer.
   * If it was not image, the timeout runs out and the text is pasted.
   *
   * @param event
     */
  this.pasteFallback = function (event) {
    var text;
    if(event.clipboardData){ // Firefox
      text = event.clipboardData.getData("text/plain");
    }else{ // IE
      text = window.clipboardData.getData("Text");
    }

    if(text !== ""){
      stringPastTimeout = setTimeout(function () {
        stringCallback(text);
        event.preventDefault();
      }, 50);
    }
  };

  /**
   * Callback for detecting CTRL+V keys
   * @param event
     */
  this.onKeyboardAction = function (event) {
    var key = event.keyCode;

    //ctrl
    if (key == 17 || event.metaKey || event.ctrlKey) {
        ctrlPressed = true;
    }

    //v
    if (key == 86 && ctrlPressed == true) {
      pasteCatcher.focus();
    }
  };

  //on kaybord release
  this.onKeyboardUpAction = function (event) {
    ctrlPressed = false;
  };

  /**
   * Convert base64 data into Blob file
   * @param b64Data
   * @param contentType
   * @returns {Blob}
     */
  this.b64toBlob = function (b64Data, contentType) {
    contentType = contentType || '';

    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  };

  /**
   * Testing string if contains valid URL
   * @param string
   * @returns {boolean}
     */
  this.isUrl = function (string) {
    var urlPattern = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
    return urlPattern.test(string);
  };

  this.init();
}