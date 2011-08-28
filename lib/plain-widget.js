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
    init: function (base) {
        UploadCare.ready(function ($) {
            var inputs = null;
            var $ = UploadCare.jQuery;
            if ( typeof(base.length) == 'undefined' ) {
                if ( base.tagName == 'input') {
                    inputs = $(base);
                }
            } else {
                if ( base.is('input') ) {
                    inputs = base
                }
            }
            if ( inputs === null ) {
                inputs = $('[role=uploadcare-plain-uploader]', base)
            }

            UploadCare.Plain.enlive(inputs);
        });
    },

    // Add file inputs after hidden `inputs` to upload file to UploadCare.
    enlive: function (inputs) {
        var $ = UploadCare.jQuery;
        inputs.each(function (_, input) {
            var file = $('<input type="file" name="file" />');
            file.addClass('uploadcare-plain-uploader');
            file.insertAfter(input);

            file.change(function () {
                var form = file.closest('form');
                var contain = file.closest('[role=uploadcare-plain-container]');
                if ( !form.length ) {
                    contain = form;
                }
                contain.addClass('uploadcare-plain-loading');

                var submitBlocking = false;
                form.bind('submit.uploadcare-plain', function() {
                    submitBlocking = true;
                    return false;
                })

                UploadCare.upload(file, $(input), { widget: 'plain' }).
                    complete(function() {
                        contain.removeClass('uploadcare-plain-loading');

                        form.unbind('submit.uploadcare-plain');
                        if (submitBlocking) {
                            form.submit();
                        }
                    });
            });
        });
    }

}

UploadCare.ready(function ($) {
    $(document).ready(function () {
        UploadCare.Plain.init($('body'));
    });
});

})();
