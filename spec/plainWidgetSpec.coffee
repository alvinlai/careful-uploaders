describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = wrapper = hidden = file = uploading = null
  beforeEach ->
    form    = $('<form />')
    wrapper = $('<div role="uploadcare-container abc" />').appendTo(form)
    hidden  = $('<input type="hidden" role="uploadcare-plain-uploader cba" />')
    wrapper.append('<input />').append(hidden)
    form.hide().appendTo('body')

    uploading = $.Deferred()
    spyOn(UploadCare, 'upload').andReturn(uploading.promise())

  afterEach ->
    form.remove()

  describe 'file input', ->
    beforeEach ->
      UploadCare.Plain.init(form)
      file = form.find(':file')

    it 'should add file input after hidden input', ->
      expect(file.length).toEqual(1)
      expect(file.attr('name')).toEqual('file')
      expect(file.hasClass('uploadcare-uploader')).toBeTruthy()
      expect(hidden.next()[0]).toEqual(file[0])

    it 'should upload file on file change', ->
      file.change()
      expect(UploadCare.upload).toHaveBeenCalled()

  describe 'from URL', ->
    text = submit = null

    describe 'by data attribute', ->
      beforeEach ->
        hidden.attr('data-uploadcare-from-url', '#upload_from')
        text = $('<input type="text" id="upload_from" />').appendTo(form).
          attr('data-uploadcare-submit', '#submit').val('http://example.com')
        submit = $('<input type="submit" id="submit" />').appendTo(form)
        UploadCare.Plain.init(form)

      it 'should upload from URL by submit button', ->
        submit.click()
        expect(UploadCare.upload).
          toHaveBeenCalledWith('http://example.com', meduim : 'plain')

      it 'should upload from URL by Enter', ->
        e = jQuery.Event('keypress')
        e.keyCode = '13'
        text.trigger(e)
        expect(UploadCare.upload).
          toHaveBeenCalledWith('http://example.com', meduim : 'plain')

    describe 'by enlive option', ->
      beforeEach ->
        text = $('<input type="text" />').val('http://example.c').appendTo(form)
        submit = $('<input type="submit" />').appendTo(form)
        UploadCare.Plain.enlive(hidden[0], fromUrl: text, fromUrlSubmit: submit)

      it 'should upload from URL by submit button', ->
        submit.click()
        expect(UploadCare.upload).
          toHaveBeenCalledWith('http://example.c', meduim : 'plain')

      it 'should upload from URL by Enter', ->
        e = jQuery.Event('keypress')
        e.keyCode = '13'
        text.trigger(e)
        expect(UploadCare.upload).
          toHaveBeenCalledWith('http://example.c', meduim : 'plain')

  describe '.init', ->

    it 'should call enlive', ->
      spyOn(UploadCare.Plain, 'enlive')
      UploadCare.Plain.init(form)
      expect(UploadCare.Plain.enlive).toHaveBeenCalledWith(hidden[0])

  describe '.enlive', ->

    it 'should send custom widget name', ->
      file = UploadCare.Plain.enlive(hidden[0], meduim: 'custom')
      file.change()
      expect(UploadCare.upload).toHaveBeenCalledWith(
        jasmine.any(Object), meduim: 'custom')

    describe 'common cases', ->
      beforeEach ->
        file = UploadCare.Plain.enlive(hidden[0])

      it 'should return file input', ->
        expect(file[0]).toEqual(form.find(':file')[0])

      it 'should set file ID to hidden input', ->
        file.change()
        uploading.resolve('12345')
        expect(hidden.val()).toEqual('12345')

      it 'should trigger events on hidden input', ->
        start    = jasmine.createSpy()
        success  = jasmine.createSpy()
        complete = jasmine.createSpy()

        hidden.bind('uploadcare-start',    start)
        hidden.bind('uploadcare-success',  success)
        hidden.bind('uploadcare-complete', complete)

        file.change()
        expect(start).toHaveBeenCalled()

        expect(success).not.toHaveBeenCalled()
        expect(complete).not.toHaveBeenCalled()

        uploading.resolve()
        expect(success).toHaveBeenCalled()
        expect(complete).toHaveBeenCalled()

      it 'should send widget name', ->
        file.change()
        expect(UploadCare.upload).toHaveBeenCalledWith(
          jasmine.any(Object), { meduim: 'plain' })

      it 'should add loading class to specify wrapper', ->
        file.change()
        expect(wrapper.hasClass('uploadcare-loading')).toBeTruthy()
        expect(   form.hasClass('uploadcare-loading')).toBeFalsy()

        uploading.resolve()
        expect(wrapper.hasClass('uploadcare-loading')).toBeFalsy()

      it 'should without specify wrapper add loading class to form', ->
        form.html(wrapper.html())
        UploadCare.Plain.init(form)
        form.find(':file').change()
        expect(wrapper.hasClass('uploadcare-loading')).toBeFalsy()
        expect(   form.hasClass('uploadcare-loading')).toBeTruthy()

      it 'should block form submit during upload', ->
        file.change()
        prevented = null
        form.submit (e) ->
          prevented = e.isDefaultPrevented()
          false

        form.submit()
        expect(prevented).toBeTruthy()

        submited = false
        form.submit -> submited = true
        uploading.resolve()
        expect(submited).toBeTruthy()

        form.submit()
        expect(prevented).toBeFalsy()
