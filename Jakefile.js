var fs     = require('fs');
var path   = require('path');
var uglify = require('uglify-js');
var wrench = require('wrench');

desc('Concatenate and compress widgets files.');
task('build', [], function () {
    if ( !path.existsSync('pkg/') ) {
        fs.mkdirSync('pkg/', 0755);
    }
    bundles = JSON.parse(fs.readFileSync('bundles.json'));
    for (bundle in bundles) {
        var js = bundles[bundle].reduce(function (all, file) {
            return all + fs.readFileSync('lib/' + file);
        }, '');

        var ast = uglify.parser.parse(js);
        ast = uglify.uglify.ast_mangle(ast);
        ast = uglify.uglify.ast_squeeze(ast);
        js  = uglify.uglify.gen_code(ast);

        var io = fs.openSync('pkg/' + bundle + '.js', 'w+');
        fs.writeSync(io, js);
        fs.closeSync(io);
    }
});

desc('Delete all generated files.');
task('clobber', [], function () {
    if ( path.existsSync('pkg/') ) {
        wrench.rmdirSyncRecursive('pkg/');
    }
});

var server;

desc('Run specs server.');
task('test', [], function () {
    server = require('jasmine-runner/lib/server').newServer({
        src_dir:   "/lib/",
        spec_dir:  "/spec/",
        server:    { "port": 8124 },
        externals: []
    });

    var srcs = ['/jquery.js',
                '/lib/uploader.js',
                '/lib/plain/plain-widget.js'];

    server.app.remove('/', 'get');
    server.app.get('/', function (req, res)  {
        var specs = fs.readdirSync('spec/').
            filter(function (file) {
                return file.match(/(.js|.coffee)$/);
            }).
            map(function (file) {
                return '/spec/' + file;
            })
        res.render('index.jade', {
            locals: {
                srcs:  srcs,
                specs: specs,
                externals: []
            },
            layout: false
        });
    });
    server.app.get('/jquery.js', function (req, res) {
        res.send(fs.readFileSync('node_modules/jquery/dist/node-jquery.js'));
    });

    var formidable = require('formidable');
    server.app.post('/iframe', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (error, fields, files) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify(fields));
            res.end();
        });
    });

    server.start();
});

desc('Monitor for changes and rerun tests');
task('monitor', ['test'], function () {
    require('jasmine-runner/lib/monitor').startMonitor(server);
});
