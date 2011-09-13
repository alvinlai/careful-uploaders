var fs     = require('fs');
var path   = require('path');
var uglify = require('uglify-js');
var wrench = require('wrench');

desc('Concatenate and compress widgets files.');
task('build', [], function () {
    if ( !path.existsSync('pkg/') ) {
        fs.mkdirSync('pkg/', 0755);
    }

    var pack = function (result, files) {
        var js = files.reduce(function (all, file) {
            return all + fs.readFileSync('lib/' + file);
        }, '');

        var ast = uglify.parser.parse(js);
        ast = uglify.uglify.ast_mangle(ast);
        ast = uglify.uglify.ast_squeeze(ast);
        js  = uglify.uglify.gen_code(ast);

        fs.writeFileSync('pkg/' + result + '.js', js);
    };

    var bundles = JSON.parse(fs.readFileSync('bundles.json'));
    for (var bundle in bundles) {
        var files   = bundles[bundle];
        var i18n    = null;
        var i18nDir = null;

        files.forEach(function (path, i) {
            if ( path.match(/i18n$/) ) {
                i18n    = i;
                i18nDir = path;
            }
        });

        if ( i18nDir ) {
            fs.readdirSync('lib/' + i18nDir).forEach(function (translation) {
                var locale = translation.replace('.js', '');
                files[i18n] = path.join(i18nDir, translation);
                pack(bundle + '.' + locale, files);
            });
        } else {
            pack(bundle, files);
        }
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
