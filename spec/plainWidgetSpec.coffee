describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

  form = hidden = null
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
