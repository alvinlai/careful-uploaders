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

// Animation easing from jQuery Easing plugin by George McGinley Smith.
jQuery.extend(jQuery.easing, {
    easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
});

// Default one line upload widget.
//
// It create widget before every hidden input with `uploadcare-line-uploader`
// role. When user select file, widget will upload it by AJAX and set file ID
// to hidden input value.
//
// Widget will block form submit during file uploading.
//
// If you will add AJAX content and want to enlive new hidden inputs, call
// `UploadCare.Line.init` with new content:
//
//     $.get('/next/page', function (html) {
//         var newContent = $(html).appendTo('.list');
//         UploadCare.Line.init(newContent);
//     });
UploadCare.Line = {

    // Text messages. It will be set in translation, see `i18n/` dir.
    messages: { },

    // CSS for widget. Will be copied from `line-style.sass` by build script.
    style: '',

    // HTML structure of widget. Will be copied from `line-template.html`
    // by build script.
    html: '',

    // Add widgets to inputs inside `base`. You can pass DOM node or jQuery
    // objects.
    init: UploadCare._widgetInit('uploadcare-line-uploader'),

    // Add widget after hidden `input` to upload file to UploadCare.
    enlive: function (input) {
        var $ = UploadCare.jQuery;

        var hidden = $(input);
        var file   = UploadCare.Plain.enlive(hidden);

        var html = this.html.replace(/{([^}]+)}/g, function (_, name) {
            if ( name == 'style' ) {
                return UploadCare.Line.style;
            } else if ( name == 'file' ) {
                return '<div data-replace="file"></div>'
            } else if ( name.match(/^t /) ) {
                name = name.substr(2)
                var path    = name.split('.');
                var message = UploadCare.Line.messages
                for (var i = 0; i < path.length; i++) {
                    message = message[path[i]];
                    if ( typeof(message) == 'undefined' ) {
                        throw('There is no translation for `' + name + '`');
                    }
                }
                return message;
            }
        })

        var widget = $(html).insertAfter(file);
        file.detach().replaceAll($('[data-replace=file]', widget));

        $('a', widget).click(false);
        this.uploadingEvent(widget, hidden);
    },

    uploadingEvent: function (widget, hidden) {
        var progress = $('.uploadcare-line-progress div');
        var end      = progress.parent().width() - progress.width();
        var toLeft   = function () {
            progress.animate({ left: -1 }, 800, 'easeInOutQuad', toRight);
        }
        var toRight  = function () {
            progress.animate({ left: end }, 800, 'easeInOutQuad', toLeft);
        }
        hidden.bind('uploadcare-start', function () {
            widget.addClass('uploadcare-uploading');
            toRight();
        });

        $('.uploadcare-line-uploading .uploadcare-line-cancel', widget).
            click(function () {
                widget.removeClass('uploadcare-uploading');
            });
    }

};

})();
