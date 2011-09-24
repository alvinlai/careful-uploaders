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

// Plain uploader widget without any style.
//
// It create simple file input before every hidden input with
// `uploadcare-plain-uploader` role. When user select file, widget will upload
// it by AJAX and set file ID to hidden input value.
//
// Widget will block form submit during file uploading.
//
// Don’t forget to add loading styles, when widget will upload files. Widget
// add `uploadcare-loading` to closes block with `uploadcare-container` role
// or to closest form.
//
// If you will add AJAX content and want to enlive new hidden inputs, call
// `UploadCare.Plain.init` with new content:
//
//     $.get('/next/page', function (html) {
//         var newContent = $(html).appendTo('.list');
//         UploadCare.Plain.init(newContent);
//     });
//
// You can add input for upload file from Internal by URL. Just set to hidden
// input `data-uploadcare-from-url` attribute with jQuery selector. On URL input
// you can set `data-uploadcare-submit` with selector to submit button.
// Or you can use `fromUrl` and `fromUrlSubmit` enlive’s options with jQuery
// objects.
UploadCare.Plain = {

    // Add widgets to inputs inside `base`. You can pass DOM node or jQuery
    // objects.
    init: UploadCare._widgetInit('uploadcare-plain-uploader'),

    // Add file input after hidden `input` to upload file to UploadCare.
    //
    // You can set widget name as `meduim` option.
    enlive: function (input, options) {
        var $ = UploadCare.jQuery;
        if ( typeof(options) == 'undefined' ) {
            options = { };
        }

        var hidden = $(input);
        var file = $('<input type="file" name="file" />');
        file.addClass('uploadcare-uploader');
        file.insertAfter(hidden);

        var upload = function (uploader) {
            var form    = uploader.closest('form');
            var contain = uploader.closest('[role~=uploadcare-container]');
            if ( contain.length == 0 ) {
                contain = form;
            }
            contain.addClass('uploadcare-loading');

            var submitBlocking = false;
            form.bind('submit.uploadcare', function() {
                submitBlocking = true;
                return false;
            })

            var uploadOptions = { meduim: options.meduim || 'plain' };

            var publicKey = hidden.data('public-key');
            if ( publicKey ) {
                uploadOptions.publicKey = publicKey;
            }

            var uploadFrom = uploader;
            if ( !uploader.is(':file') ) {
                uploadFrom = uploader.val();
            }

            hidden.trigger('uploadcare-start');
            var uploading = UploadCare.upload(uploadFrom, uploadOptions);

            uploading.progress(function (data) {
                hidden.trigger('uploadcare-progress', data);
            });
            uploading.error(function () {
                hidden.trigger('uploadcare-error');
                hidden.trigger('uploadcare-complete');
            });
            uploading.success(function (id) {
                hidden.val(id);
                hidden.trigger('uploadcare-success', id);
                hidden.trigger('uploadcare-complete');

                contain.removeClass('uploadcare-loading');

                form.unbind('submit.uploadcare');
                if ( submitBlocking ) {
                    form.submit();
                }
            });
        }

        var fromUrl = options.fromUrl;
        if ( !fromUrl && hidden.data('uploadcare-from-url') ) {
            var fromUrl = $(hidden.data('uploadcare-from-url'));
        }
        if ( fromUrl ) {
            fromUrl.keypress(function (e) {
                if ( e.keyCode == '13' ) { // Enter
                    upload(fromUrl);
                    e.preventDefault();
                }
            });

            var submit = options.fromUrlSubmit;
            if ( !submit && fromUrl.data('uploadcare-submit') ) {
                submit = $(fromUrl.data('uploadcare-submit'));
            }
            if ( submit ) {
                submit.click(function (e) {
                    upload(fromUrl);
                    e.preventDefault();
                });
            }
        }

        file.change(function () {
            var file = $(this);
            upload(file);
        });

        return file;
    }

};

})();
