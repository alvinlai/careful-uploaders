fs     = require('fs')
path   = require('path')
uglify = require('uglify-js')
wrench = require('wrench')

task 'build', 'Concatenate and compress widgets files', ->
  fs.mkdirSync('pkg/', 0755) unless path.existsSync('pkg/')

  pack = (bundleName, files) ->
    js = files.reduce ( (all, i) -> all + fs.readFileSync("lib/#{i}") ), ''

    ast = uglify.parser.parse(js)
    ast = uglify.uglify.ast_mangle(ast)
    ast = uglify.uglify.ast_squeeze(ast)
    js  = uglify.uglify.gen_code(ast)

    fs.writeFileSync("pkg/#{bundleName}.js", js)

  bundles = JSON.parse(fs.readFileSync('bundles.json'))
  for bundle, files of bundles
    i18n = false
    translations = null

    for filepath, i in files
      [i18n, translations] = [i, filepath] if filepath.match /i18n$/

    if i18n
      for translation in fs.readdirSync("lib/#{translations}")
        locale = translation.replace('.js', '')
        files[i18n] = path.join(translations, translation)
        pack("#{bundle}.#{locale}", files)
    else
      pack(bundle, files)

task 'clobber', 'Delete all generated files', ->
  wrench.rmdirSyncRecursive('pkg/') if path.existsSync('pkg/')

task 'test', 'Run specs server', ->
  server = require('jasmine-runner/lib/server').newServer
    src_dir:   "/lib/"
    spec_dir:  "/spec/"
    server:    { port: 8124 }
    externals: []

  srcs = ['/jquery.js', '/lib/uploader.js', '/lib/plain/plain-widget.js']

  server.app.remove('/', 'get')
  server.app.get '/', (req, res) ->
    specs = fs.readdirSync('spec/').
      filter( (i) -> i.match /\.coffee$/ ).map( (i) -> "/spec/#{i}" )
    res.render 'index.jade',
      locals:
        srcs:  srcs,
        specs: specs,
        externals: []
      layout: false
  server.app.get '/jquery.js', (req, res) ->
    res.send(fs.readFileSync('node_modules/jquery/dist/node-jquery.js'))

  formidable = require('formidable')
  server.app.post '/iframe', (req, res) ->
    form = new formidable.IncomingForm()
    form.parse req, (error, fields, files) ->
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.write(JSON.stringify(fields))
      res.end()

  server.start()
