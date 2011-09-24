describe 'UploadCare', ->
  $ = UploadCare.jQuery
  UploadCare.publicKey = 'ABCDEF'

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

  describe '._promise', ->

    it 'should create promise object and add aliases', ->
      deferred = $.Deferred()
      promise  = UploadCare._promise(deferred, { test: -> 1 })
      expect(promise.error).toBe(promise.fail)
      expect(promise.success).toBe(promise.done)
      expect(promise.complete).toBe(promise.always)
      expect(promise.test()).toEqual(1)

    it 'should add progress method by default', ->
      promise = UploadCare._promise($.Deferred())
      expect(typeof(promise.progress)).toEqual('function')

  describe '._params', ->

    it 'should add global public key', ->
      expect(UploadCare._params()).toEqual(UPLOADCARE_PUB_KEY: 'ABCDEF')

    it 'should use custom key', ->
      expect(UploadCare._params(publicKey: 1)).toEqual(UPLOADCARE_PUB_KEY: 1)

    it 'should add meduim name', ->
      expect(UploadCare._params(meduim: 'test')).
        toEqual(UPLOADCARE_PUB_KEY: 'ABCDEF', UPLOADCARE_MEDIUM: 'test')

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

  describe '.byIframe', ->

    it 'should upload file to server', ->
      originUrl = UploadCare.byIframe.uploadUrl
      this.after -> UploadCare.byIframe.uploadUrl = originUrl
      UploadCare.byIframe.uploadUrl = location.href + 'iframe'

      spyOn(UploadCare, '_uuid').andReturn('GENERATED-UUID')
      success = jasmine.createSpy()

      answer = null
      file = $('<input type="file" name="uploaded" />')
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

  describe '.byUrl', ->
    progressing = starting = null
    originEvery = UploadCare.byUrl.checkEvery

    beforeEach ->
      starting    = $.Deferred()
      progressing = $.Deferred()
      UploadCare.byUrl.checkEvery = 30
      spyOn($, 'ajax').andReturn(UploadCare._promise(starting))

    afterEach ->
      UploadCare.byUrl.checkEvery = originEvery
      progressing.reject()

    it 'should start file uploading and progress checking', ->
      spyOn(UploadCare.byUrl, 'progress').
        andReturn(UploadCare._promise(progressing))

      UploadCare.upload('http://example.com', { meduim: 'test' })
      expect($.ajax).toHaveBeenCalledWith
        url:      UploadCare.byUrl.uploadUrl
        type:     'post'
        data:
          UPLOADCARE_PUB_KEY:    UploadCare.publicKey
          UPLOADCARE_MEDIUM:     'test'
          UPLOADCARE_SOURCE_URL: 'http://example.com'

      waits 35
      runs ->
        expect(UploadCare.byUrl.progress).not.toHaveBeenCalled()
        starting.resolve(token: '12345')

      waits 65
      runs ->
        expect(UploadCare.byUrl.progress.callCount).toEqual(2)
        expect(UploadCare.byUrl.progress).toHaveBeenCalledWith('12345')

    it 'should check uploading progress', ->
      spyOn(UploadCare.byUrl, 'progress').andCallFake ->
        UploadCare._promise(progressing = $.Deferred())

      progress = jasmine.createSpy()
      success  = jasmine.createSpy()
      UploadCare.upload('http://example.co').progress(progress).success(success)
      starting.resolve(token: '12345')

      waits 35
      runs ->
        progressing.resolve(status: 'pending', a: 1)
        expect(success).not.toHaveBeenCalled()
        expect(progress).toHaveBeenCalledWith(status: 'pending', a: 1)

      waits 35
      runs ->
        progressing.resolve(status: 'success', a: 2)
        expect(success).toHaveBeenCalled()
        expect(progress).toHaveBeenCalledWith(status: 'success', a: 2)

    it 'should check errors', ->
      spyOn(UploadCare.byUrl, 'progress').andCallFake ->
        UploadCare._promise(progressing = $.Deferred())

      progress = jasmine.createSpy()
      error    = jasmine.createSpy()

      UploadCare.upload('http://example.com').progress(progress).error(error)
      starting.resolve(token: '12345')

      waits 35
      runs ->
        progressing.reject()
        expect(progress).not.toHaveBeenCalled()
        expect(error).toHaveBeenCalled()
