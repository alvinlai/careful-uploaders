describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = wrapper = hidden = file = uploading = null
  beforeEach ->
    form    = $('<form />')
    wrapper = $('<div role="uploadcare-container" />').appendTo(form)
    hidden  = $('<input type="hidden" role="uploadcare-plain-uploader" />')
    wrapper.append('<input />').append(hidden)

    uploading = $.Deferred()
    spyOn(UploadCare, 'upload').andReturn(uploading.promise())

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

  describe '.upload', ->

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
