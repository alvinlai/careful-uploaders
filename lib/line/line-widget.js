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

    // CSS for widget.
    style: '',

    // HTML structure of widget.
    html: '<div class="uploadcare-line-uploader">' +
              '<style scoped>{style}</style>' +
              '{file}' +
          '</div>',

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
            }
        })

        var widget = $(html).insertAfter(file);
        file.detach().replaceAll($('[data-replace=file]', widget));
    }

};

// Translated messages shortcut
var t = UploadCare.Line.messages;

})();
