describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = wrapper = hidden = file = null
  beforeEach ->
    form    = $('<form />')
    wrapper = $('<div role="uploadcare-plain-container" />')
    hidden  = $('<input type="hidden" role="uploadcare-plain-uploader" />')
    form.append(wrapper)
    wrapper.append('<input />').append(hidden)

  describe 'init argument', ->
    enlived = null
    origin  = UploadCare.Plain.enlive

    beforeEach ->
      enlived = null
      UploadCare.Plain.enlive = (el) ->
        enlived = el

    afterEach ->
      UploadCare.Plain.enlive = origin

    it 'should understand DOM input', ->
      UploadCare.Plain.init(hidden[0])
      expect(enlived.length).toEqual(1)
      expect(enlived[0]).toEqual(hidden[0])

    it 'should understand jQuery input', ->
      UploadCare.Plain.init(hidden)
      expect(enlived).toEqual(hidden)

    it 'should find input with specify role in DOM node', ->
      UploadCare.Plain.init(form[0])

      expect(enlived.length).toEqual(1)
      expect(enlived[0]).toEqual(hidden[0])

    it 'should find input with specify role in jQuery node', ->
      UploadCare.Plain.init(form)

      expect(enlived.length).toEqual(1)
      expect(enlived[0]).toEqual(hidden[0])

  describe 'file input', ->
    beforeEach ->
      UploadCare.Plain.init(form)
      file = form.find(':file')

    it 'should add file input after hidden input', ->
      expect(file.length).toEqual(1)
      expect(hidden.next()[0]).toEqual(file[0])

    it 'should upload file on file change', ->
      spyOn(UploadCare, 'upload').andReturn({ done: -> })
      file.change()
      expect(UploadCare.upload).toHaveBeenCalled()

  describe 'upload', ->
    uploading = null

    beforeEach ->
      UploadCare.Plain.init(form)
      file = form.find(':file')

      uploading = $.Deferred()
      spyOn(UploadCare, 'upload').andReturn(uploading.promise())

    it 'should send widget name', ->
      file.change()
      expect(UploadCare.upload).toHaveBeenCalledWith(
        jasmine.any(Object), $(hidden[0]), { widget: 'plain' })

    it 'should add loading class to specify wrapper', ->
      file.change()
      expect(wrapper.hasClass('uploadcare-plain-loading')).toBeTruthy()
      expect(   form.hasClass('uploadcare-plain-loading')).toBeFalsy()

      uploading.resolve()
      expect(wrapper.hasClass('uploadcare-plain-loading')).toBeFalsy()

    it 'should without specify wrapper add loading class to form', ->
      form.html(wrapper.html())
      UploadCare.Plain.init(form)
      form.find(':file').change()
      expect(wrapper.hasClass('uploadcare-plain-loading')).toBeFalsy()
      expect(   form.hasClass('uploadcare-plain-loading')).toBeTruthy()

    it 'should block form submit, while upload', ->
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
