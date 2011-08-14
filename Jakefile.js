var fs     = require('fs');
var path   = require('path');
var uglify = require('uglify-js');

var widgets = {
    plain: ['uploader.js', 'plain-widget.js']
}

desc('Concatenate and compress widgets files.');
task('build', [], function () {
    if ( !path.existsSync('pkg/') ) {
        fs.mkdirSync('pkg/', 0755);
    }
    for (widget in widgets) {
        var js = '';
        widgets[widget].forEach(function(file) {
            js += fs.readFileSync('lib/' + file);
        });

        var ast = uglify.parser.parse(js);
        ast = uglify.uglify.ast_mangle(ast);
        ast = uglify.uglify.ast_squeeze(ast);
        js  = uglify.uglify.gen_code(ast);

        var widgetFile = fs.openSync('pkg/' + widget + '.js', 'w+');
        fs.writeSync(widgetFile, js);
        fs.closeSync(widgetFile);
    }
});
