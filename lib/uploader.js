/*
 * Copyright (c) 2011 UploadCare
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

;(function () {
"use strict";

window.UploadCare = {

    // Is UploadCare initialized.
    _initialized: false,

    // Function, which are waiting UploadCare initializing.
    _readyCallbacks: [],

    // jQuery version for UploadCare.
    _jQueryMinVersion: [1, 5, 0],

    // URL to get jQuery from CDN.
    _jQueryCDN: 'http://ajax.googleapis.com/ajax/libs/' +
                'jquery/1.6.2/jquery.min.js',

    // ID counter to have unique iframe IDs.
    _lastIframeId: 0,

    // jQuery object for UploadCare.
    jQuery: null,

    // API public key.
    publicKey: null,

    // UploadCare upload server URL.
    uploadUrl: 'http://upload.uploadcare.com/iframe/',

    // Call `callback`, when HTML is loaded.
    _domReady: function (callback) {
        var self     = this;
        var isLoaded = false;
        var unbind   = null;
        var loaded   = function () {
            if ( isLoaded ) {
                return;
            }
            isLoaded = true;
            unbind();
            callback.call(self)
        }

        if ( document.readyState === 'complete' ) {
            callback.call(this);
            return;
        } else if ( document.addEventListener ) {
            unbind = function () {
                document.removeEventListener('DOMContentLoaded', loaded, false);
            }
            document.addEventListener('DOMContentLoaded', loaded, false);
            window.addEventListener('load', loaded, false);
        } else {
            unbind = function () {
                document.detachEvent('onreadystatechange', loaded, false);
            }
            document.attachEvent('onreadystatechange', loaded, false);
            window.attachEvent('load', loaded, false);
        }
    },

    // Call all callbacks, which were added by `ready` method.
    _callReadyCallbacks: function () {
        this._initialized = true;
        for (var i = 0; i < this._readyCallbacks.length; i++) {
            this._readyCallbacks[i].call(this, this.jQuery);
        }
    },

    // Hide form or iframe by absolute position.
    _hide: function (node) {
        node.css('position', 'absolute').css('top', '-9999px');
    },

    // Create iframe to upload file by AJAX.
    _createIframe: function () {
        this._lastIframeId += 1;
        var id = 'uploadcareIframe' + this._lastIframeId;
        var iframe = this.jQuery('<iframe />').attr({ id: id, name: id });
        this._hide(iframe.css('position', 'absolute'));
        iframe.appendTo('body');
        return iframe;
    },

    // Create form, link it action to `iframe` and clone `file` inside.
    _createFormForIframe: function (iframe, file, id) {
        var $ = this.jQuery;
        var form = $('<form />').attr({
            method:  'POST',
            action:  this.uploadUrl,
            enctype: 'multipart/form-data',
            target:  iframe.attr('id')
        });
        this._hide(form);

        $.each({ PUB_KEY: this.publicKey, FILE_ID: id }, function (name, val) {
            $('<input type="hidden" />').
                attr('name', 'UPLOADCARE_' + name).val(val).appendTo(form);
        })

        var next = file.clone();
        next.insertBefore(file);
        form.appendTo('body');
        file.appendTo(form);

        return form;
    },

    // Generate UUID for upload file ID.
    // Taken from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    _uuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.
            replace(/[xy]/g, function(c) {
                var r = Math.random() * 16|0,
                    v = (c == 'x' ? r : (r&0x3|0x8));
                return v.toString(16);
            });
    },

    // Check, that jQuery loaded and have correct version.
    _checkJQuery: function () {
        if ( !window.jQuery ) {
            return false;
        }
        var require, subversion, version = jQuery.fn.jquery.split('.')
        for (var i = 0; i < this._jQueryMinVersion; i++) {
            require    = this._jQueryMinVersion[i]
            subversion = parseInt(version[i]);
            if ( require > subversion ) {
                return false
            } else if ( require < subversion ) {
                return true
            }
        }
        return true
    },

    // Initialize jQuery object and call all function added by `ready`.
    init: function () {
        if ( this._checkJQuery() ) {
            this.jQuery = window.jQuery;
            this._callReadyCallbacks();
        }

        this._domReady(function () {
            var min = this._jQueryVersion;
            if ( this._checkJQuery() ) {
                this.jQuery = window.jQuery;
                this._callReadyCallbacks();
            } else {
                var script = document.createElement('script');
                script.src = this._jQueryCDN;
                var onload = function () {
                    window.jQuery.noConflict();
                    UploadCare.jQuery = jQuery;
                    window.jQuery = UploadCare._originjQuery;
                    delete UploadCare._originjQuery;
                    UploadCare._callReadyCallbacks();
                };
                if ( script.onload === null ) {
                    script.onload = onload;
                } else {
                    script.onreadystatechange = onload;
                }

                var head = document.getElementsByTagName('head')[0];
                if ( !head ) {
                    head = document.body;
                }

                this._originjQuery = window.jQuery;
                head.appendChild(script);
            }
        })
    },

    // Call `callback` when UploadCare will be initialized. First argumemt will
    // by jQuery object.
    ready: function (callback) {
        if ( this._initialized ) {
            callback.call(this, this.jQuery);
        } else {
            this._readyCallbacks.push(callback)
        }
    },

    // Get user public key from current script tag.
    getPublicKey: function () {
        var scripts = document.getElementsByTagName('script');
        var current = scripts[scripts.length - 1];
        this.publicKey = current.getAttribute('data-public-key');
    },

    // Upload file to UploadCare from `file` input and save file ID to
    // `hidden` input.
    upload: function (file, hidden) {
        hidden.trigger('uploadcare.start');

        var iframe = this._createIframe();
        var id     = this._uuid();
        var form   = this._createFormForIframe(iframe, file, id);

        var deferred = this.jQuery.Deferred();
        var complete = function () {
            iframe.remove();
            form.remove();
            hidden.trigger('uploadcare.complete');
        }
        iframe.bind('load', function () {
            hidden.val(id);
            hidden.trigger('uploadcare.success');
            deferred.resolve();
            complete();
        });
        iframe.bind('error', function () {
            hidden.trigger('uploadcare.error');
            deferred.reject();
            complete();
        });

        form.submit();
        var promise = deferred.promise();
		promise.success  = promise.done;
		promise.error    = promise.fail;
		promise.complete = promise.done;
        return promise;
    }

};

UploadCare.getPublicKey();
UploadCare.init();

})();
