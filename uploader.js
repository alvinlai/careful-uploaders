;(function() {
"use strict";

window.UploadCare = {

    // Is UploadCare initialized.
    _initialized: false,

    // Function, which are waiting UploadCare initializing.
    _readyCallbacks: [],

    // jQuery version for UploadCare.
    _jQVersion: 1.6,

    // URL to get jQuery from CDN.
    _jQCDN: 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js',

    // jQuery object for UploadCare.
    jQuery: null,

    // API public key.
    publicKey: null,

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
        for (var i = 0; i < this._readyCallbacks.length; i++) {
            this._readyCallbacks[i].call(this, this.jQuery);
        }
    },

    // Initialize jQuery object and call all function added by `ready`.
    init: function () {
        this._domReady(function () {
            var min = this._jQueryVersion;
            if ( window.jQuery && parseFloat(jQuery.fn.jquery) >= min ) {
                this.jQuery = window.jQuery;
                this._callReadyCallbacks();
            } else {
                var script = document.createElement('script');
                script.src = this._jQCDN;
                var onload = function() {
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
    }

};

UploadCare.getPublicKey();

})();
