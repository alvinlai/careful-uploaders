describe 'UploadCare.Plain', ->
  $ = UploadCare.jQuery

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
      input = document.createElement('input')
      UploadCare.Plain.init(input)
      expect(enlived).toEqual($(input))

    it 'should understand jQuery input', ->
      input = $('<input />')
      UploadCare.Plain.init(input)
      expect(enlived).toEqual(input)

    it 'should find input with specify role in DOM node', ->
      div    = document.createElement('div')
      input  = document.createElement('input')
      common = document.createElement('input')
      input.setAttribute('role', 'uploadcare-plain-uploader')
      div.appendChild(input)
      div.appendChild(common)

      UploadCare.Plain.init(div)

      expect(enlived.length).toEqual(1)
      expect(enlived[0]).toEqual(input)

    it 'should find input with specify role in jQuery node', ->
      input = $('<input role="uploadcare-plain-uploader" />')
      div   = $('<div />').append('<input />').append(input)

      UploadCare.Plain.init(div)

      expect(enlived.length).toEqual(1)
      expect(enlived[0]).toEqual(input[0])
