# Compass config

css_dir  = ""
sass_dir = ""

output_style = :compressed

on_stylesheet_saved do |css|
  js   = css.gsub(/\.css$/, '.js')
  name = File.basename(css).gsub('-style.css', '')
  File.open(js, 'w') do |io|
    io << "UploadCare.#{name.capitalize}.style = '"
    io << File.read(css).gsub('\\', '\\\\').gsub("'", "\\'").gsub("\n", ' ')
    io << "'"
  end
  FileUtils.rm css
end

# Fix for compass watch
Compass.configuration.sass_load_paths << File.expand_path('')
