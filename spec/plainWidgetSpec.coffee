describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = hidden = file = null
  beforeEach ->
    form   = $('<form />')
    hidden = $('<input type="hidden" role="uploadcare-plain-uploader" />')
    form.append('<input />').append(hidden)

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
      spyOn(UploadCare, 'upload').andReturn({ complete: -> })
      file.change()
      expect(UploadCare.upload).toHaveBeenCalled()
