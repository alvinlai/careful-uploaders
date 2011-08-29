describe 'UploadCare', ->

  describe '._uuid', ->

    it 'should generate correct UUID', ->
      origin = Math.random
      this.after ->
        Math.random = origin

      i = 0
      Math.random = -> i++ / 32

      expect(UploadCare._uuid()).toEqual('00112233-4455-4667-b889-9aabbccddeef')
