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
