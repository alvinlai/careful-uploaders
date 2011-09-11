describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = wrapper = hidden = file = null
  beforeEach ->
    form    = $('<form />')
    wrapper = $('<div role="uploadcare-container" />')
    hidden  = $('<input type="hidden" role="uploadcare-plain-uploader" />')
    form.append(wrapper)
    wrapper.append('<input />').append(hidden)

  describe 'file input', ->
    beforeEach ->
      UploadCare.Plain.init(form)
      file = form.find(':file')

    it 'should add file input after hidden input', ->
      expect(file.length).toEqual(1)
      expect(file.hasClass('uploadcare-uploader')).toBeTruthy()
      expect(hidden.next()[0]).toEqual(file[0])

    it 'should upload file on file change', ->
      spyOn(UploadCare, 'upload').andReturn(done: ( -> ), fail: ( -> ))
      file.change()
      expect(UploadCare.upload).toHaveBeenCalled()

  describe 'upload', ->
    uploading = null

    beforeEach ->
      UploadCare.Plain.init(form)
      file = form.find(':file')

      uploading = $.Deferred()
      spyOn(UploadCare, 'upload').andReturn(uploading.promise())

    it 'should set file ID to hidden input', ->
      file.change()
      uploading.resolve('12345')
      expect(hidden.val()).toEqual('12345')

    it 'should trigger events on hidden input', ->
      start    = jasmine.createSpy()
      success  = jasmine.createSpy()
      complete = jasmine.createSpy()

      hidden.bind('uploadcare.start',    start)
      hidden.bind('uploadcare.success',  success)
      hidden.bind('uploadcare.complete', complete)

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
        jasmine.any(Object), { widget: 'plain' })

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
