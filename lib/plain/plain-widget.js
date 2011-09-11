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

// Plain uploader widget. It create simple file input before every hidden
// input with `uploadcare-plain-uploader` role. When user select file,
// widget will upload it by AJAX and set file ID to hidden input value.
//
// Don’t forget to add loading styles, when widget will upload files. Widget
// add `uploadcare-plain-loading` to closes block with
// `uploadcare-plain-container` role or to closest form.
//
// Widget will block form submit, while it uploading file.
//
// If you will add AJAX content and want to enlive new hidden inputs, call
// `UploadCare.Plain.init` with new content:
//
//     $.get('/next/page', function (html) {
//         var newContent = $(html).appendTo('.list');
//         UploadCare.Plain.init(newContent);
//     });
UploadCare.Plain = {

    // Add widgets to inputs inside `base`. You can pass DOM node or jQuery
    // objects.
    init: UploadCare._widgetInit('uploadcare-plain-uploader'),

    // Add file input after hidden `input` to upload file to UploadCare.
    enlive: function (input) {
        var $ = UploadCare.jQuery;

        var file = $('<input type="file" name="file" />');
        file.addClass('uploadcare-uploader');
        file.insertAfter(input);

        file.change(function () {
            var form    = file.closest('form');
            var contain = file.closest('[role=uploadcare-container]');
            if ( contain.length == 0 ) {
                contain = form;
            }
            contain.addClass('uploadcare-loading');

            var submitBlocking = false;
            form.bind('submit.uploadcare', function() {
                submitBlocking = true;
                return false;
            })

            var options = { widget: 'plain' };
            var hidden = $(input);

            var publicKey = hidden.data('public-key');
            if ( publicKey ) {
                options.publicKey = publicKey;
            }

            hidden.trigger('uploadcare.start');
            var uploading = UploadCare.upload(file, options)

            uploading.fail(function () {
                hidden.trigger('uploadcare.error');
                hidden.trigger('uploadcare.complete');
            })
            uploading.done(function (id) {
                hidden.val(id);
                hidden.trigger('uploadcare.success', id);
                hidden.trigger('uploadcare.complete');

                contain.removeClass('uploadcare-loading');

                form.unbind('submit.uploadcare');
                if ( submitBlocking ) {
                    form.submit();
                }
            });
        });
    }

};

})();
