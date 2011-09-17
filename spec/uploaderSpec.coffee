describe 'UploadCare', ->
  $ = UploadCare.jQuery

  describe '._uuid', ->

    it 'should generate correct UUID', ->
      origin = Math.random
      this.after -> Math.random = origin

      i = 0
      Math.random = -> i++ / 32

      expect(UploadCare._uuid()).toEqual('00112233-4455-4667-b889-9aabbccddeef')

  describe '._checkJQuery', ->
    noCallback = version = originVersion = null

    beforeEach ->
      noCallback = jasmine.createSpy()
      version    = jasmine.createSpy()
      spyOn(UploadCare, '_getJQuery')

      originVersion = UploadCare._jQueryMinVersion
      UploadCare._jQueryMinVersion = [1, 5, 0]

    afterEach ->
      UploadCare._jQueryMinVersion = originVersion

    it 'should use jQuery, when it is correct', ->
      UploadCare._checkJQuery({ fn: { jquery: '1.5.0' } }, noCallback, version)
      expect(noCallback).not.toHaveBeenCalled()
      expect(version).not.toHaveBeenCalled()
      expect(UploadCare._getJQuery).toHaveBeenCalled()

    it 'should use jQuery, when it has next version', ->
      UploadCare._checkJQuery({ fn: { jquery: '2.0.0' } }, noCallback, version)
      expect(noCallback).not.toHaveBeenCalled()
      expect(version).not.toHaveBeenCalled()
      expect(UploadCare._getJQuery).toHaveBeenCalled()

    it 'should call noCallback if jQuery is not exists', ->
      UploadCare._checkJQuery(undefined, noCallback, version)
      expect(noCallback).toHaveBeenCalled()
      expect(version).not.toHaveBeenCalled()
      expect(UploadCare._getJQuery).not.toHaveBeenCalled()

    it 'should call versionCallback if jQuery has wrong version', ->
      UploadCare._checkJQuery({ fn: { jquery: '1.4.9' } }, noCallback, version)
      expect(noCallback).not.toHaveBeenCalled()
      expect(version).toHaveBeenCalled()
      expect(UploadCare._getJQuery).not.toHaveBeenCalled()

  describe '._widgetInit', ->
    form  = $('<form />')
    input = $('<input type="hidden" role="test-role abc" />')
    form.append(input)

    enlived = null
    widget  =
      init:   UploadCare._widgetInit('test-role')
      enlive: (el) -> enlived.push(el)

    beforeEach ->
      enlived = []

    it 'should understand DOM input', ->
      widget.init(input[0])
      expect(enlived).toEqual([input[0]])

    it 'should understand jQuery input', ->
      widget.init(input)
      expect(enlived).toEqual([input[0]])

    it 'should find input with specify role in DOM node', ->
      widget.init(form[0])
      expect(enlived).toEqual([input[0]])

    it 'should find input with specify role in jQuery node', ->
      widget.init(form)
      expect(enlived).toEqual([input[0]])

  describe '._translate', ->

    it 'should add translation', ->
      widget   = { messages: { } }
      messages = widget.messages

      UploadCare._translate(widget, 'en', one: 1)

      expect(widget.messages).toBe(messages)
      expect(widget.messages).toEqual({ locale: 'en', one: 1 })

  describe '.ready', ->

    it 'should call callback, when UploadCare is already initialized', ->
      UploadCare.initialized = false
      this.after -> UploadCare.initialized = true

      callback = jasmine.createSpy()
      UploadCare.ready(callback)
      expect(callback).not.toHaveBeenCalled()

      UploadCare._callReadyCallbacks()
      expect(callback).toHaveBeenCalledWith(UploadCare.jQuery)
      expect(UploadCare.initialized).toBeTruthy()

      another = jasmine.createSpy()
      UploadCare.ready(another)
      expect(another).toHaveBeenCalledWith(UploadCare.jQuery)

  describe '.upload', ->
    originUrl = UploadCare.uploadUrl

    beforeEach ->
      UploadCare.uploadUrl = location.href + 'iframe'

    afterEach ->
      UploadCare.uploadUrl = originUrl

    it 'should upload file to server', ->
      UploadCare.publicKey = 'ABCDEF'
      spyOn(UploadCare, '_uuid').andReturn('GENERATED-UUID')

      file    = $('<input type="file" name="uploaded" />')
      success = jasmine.createSpy()

      answer = null
      UploadCare.upload(file, { meduim: 'test' }).
        success(success).
        success ->
          answer = $.parseJSON($('iframe:last').contents().text())

      waitsFor -> answer != null
      runs ->
        expect(success).toHaveBeenCalledWith(answer.UPLOADCARE_FILE_ID)
        expect(answer.UPLOADCARE_FILE_ID).toEqual('GENERATED-UUID')
        expect(answer.UPLOADCARE_PUB_KEY).toEqual(UploadCare.publicKey)
        expect(answer.UPLOADCARE_MEDIUM).toEqual('test')
        expect(answer.uploaded).toBeDefined()

    it 'should get public key from options', ->
      UploadCare.publicKey = 'ABCDEF'
      file = $('<input type="file" name="uploaded" />')

      answer = null
      UploadCare.upload(file, { publicKey: 'FEDCBA' }).success ->
        answer = $.parseJSON($('iframe:last').contents().text())

      waitsFor -> answer != null
      runs ->
        expect(answer.UPLOADCARE_PUB_KEY).toEqual('FEDCBA')
