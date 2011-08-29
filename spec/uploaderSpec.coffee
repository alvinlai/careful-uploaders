describe 'UploadCare', ->

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

    it 'should get jQuery, when it is correct', ->
      UploadCare._checkJQuery({ fn: { jquery: '1.5.0' } }, noCallback, version)
      expect(noCallback).not.toHaveBeenCalled()
      expect(version).not.toHaveBeenCalled()
      expect(UploadCare._getJQuery).toHaveBeenCalled()

    it 'should get jQuery, when it has next version', ->
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

  describe '.ready', ->

    it 'should call callback, when UploadCare be initialized', ->
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
    $ = UploadCare.jQuery
    originUrl = UploadCare.uploadUrl
    beforeEach ->
      UploadCare.uploadUrl = location.href + 'iframe'
    afterEach ->
      UploadCare.uploadUrl = originUrl

    it 'should upload file to server', ->
      UploadCare.publicKey = 'ABCDEF'
      spyOn(UploadCare, '_uuid').andReturn('GENERATED-UUID')

      file = $('<input type="file" name="uploaded" />')
      hidden = $('<input type="hidden" />')

      start = jasmine.createSpy()
      success = jasmine.createSpy()
      hidden.bind('uploadcare.start', start).
             bind('uploadcare.success', success)

      answer = null
      hidden.bind 'uploadcare.success', ->
        $ = UploadCare.jQuery
        answer = $.parseJSON($('iframe:last').contents().text())

      UploadCare.upload(file, hidden, { widget: 'test' }).success(success)

      waitsFor -> answer != null
      runs ->
        expect(start).toHaveBeenCalled()
        expect(success.callCount).toEqual(2)

        expect(answer.UPLOADCARE_FILE_ID).toEqual('GENERATED-UUID')
        expect(answer.UPLOADCARE_FILE_ID).toEqual(hidden.val())

        expect(answer.UPLOADCARE_PUB_KEY).toEqual(UploadCare.publicKey)
        expect(answer.UPLOADCARE_WIDGET).toEqual('test')
        expect(answer.uploaded).toBeDefined()
