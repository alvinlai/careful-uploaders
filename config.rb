# Compass config

css_dir    = "tmp/"
sass_dir   = "lib/"
images_dir = "lib/"

relative_assets = true

output_style = :compressed

on_stylesheet_saved do |css|
  js   = css.gsub(/\.css$/, '.js')
  name = File.basename(css).gsub('-style.css', '')
  File.open(js, 'w') do |io|
    io << "UploadCare.#{name.capitalize}.style = '"
    io << File.read(css).gsub("'", '"').gsub("\n", '')
    io << "';"
  end
end
