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

    // Function, which are waiting UploadCare initializing.
    _readyCallbacks: [],

    // jQuery version for UploadCare.
    _jQueryMinVersion: [1, 5, 0],

    // URL to get jQuery from CDN.
    _jQueryCDN: 'http://ajax.googleapis.com/ajax/libs/' +
                'jquery/1.6.2/jquery.min.js',

    // ID counter to have unique iframe IDs.
    _lastIframeId: 0,

    // Is UploadCare initialized.
    initialized: false,

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
        this.initialized = true;
        for (var i = 0; i < this._readyCallbacks.length; i++) {
            this._readyCallbacks[i].call(this, this.jQuery);
        }
    },

    // Create iframe to upload file by AJAX.
    _createIframe: function () {
        this._lastIframeId += 1;
        var id = 'uploadcareIframe' + this._lastIframeId;
        var iframe = this.jQuery('<iframe />').attr({ id: id, name: id });
        iframe.css('position', 'absolute').css('top', '-9999px');
        iframe.appendTo('body');
        return iframe;
    },

    // Create form, link it action to `iframe` and clone `file` inside.
    _createFormForIframe: function (iframe, file) {
        var form = this.jQuery('<form />').attr({
            method:  'POST',
            action:  this.uploadUrl,
            enctype: 'multipart/form-data',
            target:  iframe.attr('id')
        });
        form.css('position', 'absolute').css('top', '-9999px');

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

    // Check, that jQuery loaded and have correct version. `noCallback` will be
    // call, if page doesn’t have jQuery, `versionCallback` – if page have
    // wrong version of jQuery.
    _checkJQuery: function (jQuery, noCallback, versionCallback) {
        if ( !jQuery ) {
            noCallback.call(this);
            return;
        }
        var require, subversion, version = jQuery.fn.jquery.split('.');
        for (var i = 0; i < this._jQueryMinVersion.length; i++) {
            require    = this._jQueryMinVersion[i]
            subversion = parseInt(version[i]);
            if ( require > subversion ) {
                versionCallback.call(this);
                return;
            } else if ( require < subversion ) {
                this._getJQuery();
                return;
            }
        }
        this._getJQuery();
    },

    // Copy jQuery to UploadCare object and run all callbacks.
    _getJQuery: function () {
        this.jQuery = window.jQuery;
        this._callReadyCallbacks();
    },

    // Load own jQuery for UploadCare.
    _loadJQuery: function () {
        var script = document.createElement('script');
        script.src = this._jQueryCDN;
        script.onload = script.onreadystatechange = function () {
            window.jQuery.noConflict();
            UploadCare.jQuery = window.jQuery;
            window.jQuery = UploadCare._originjQuery;
            delete UploadCare._originjQuery;
            UploadCare._callReadyCallbacks();
        };

        var head = document.getElementsByTagName('head')[0];
        if ( !head ) {
            head = document.body;
        }

        this._originjQuery = window.jQuery;
        head.appendChild(script);
    },

    // Get user public key from current script tag.
    _getPublicKey: function () {
        var scripts = document.getElementsByTagName('script');
        var current = scripts[scripts.length - 1];
        this.publicKey = current.getAttribute('data-public-key');
    },

    // Initialize jQuery object and call all function added by `ready`.
    init: function () {
        this._checkJQuery(window.jQuery,
            function () {
                this._domReady(function () {
                    this._checkJQuery(window.jQuery,
                        this._loadJQuery, this._loadJQuery);
                });
            },
            this._loadJQuery);
    },

    // Call `callback` when UploadCare will be initialized. First argumemt will
    // by jQuery object.
    ready: function (callback) {
        if ( this.initialized ) {
            callback.call(this, this.jQuery);
        } else {
            this._readyCallbacks.push(callback)
        }
    },

    // Upload file to UploadCare from `file` input and return jQuery Deferred.
    // UUID for uploaded file will be send to `done` callback.
    upload: function (file, options) {
        var $ = this.jQuery;
        if ( typeof(options) == 'undefined' ) {
            options = { };
        }

        var iframe = this._createIframe();
        var form   = this._createFormForIframe(iframe, file);
        var id     = this._uuid()

        var params = {
            PUB_KEY: options.publicKey || this.publicKey,
            FILE_ID: id,
            WIDGET:  options.widget
        };
        $.each(params, function (name, val) {
            $('<input type="hidden" />').
                attr('name', 'UPLOADCARE_' + name).val(val).appendTo(form);
        })

        var deferred = this.jQuery.Deferred();
        var complete = function () {
            iframe.remove();
            form.remove();
        }
        iframe.bind('load', function () {
            deferred.resolve(id);
            complete();
        });
        iframe.bind('error', function () {
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

UploadCare._getPublicKey();
UploadCare.init();

})();
