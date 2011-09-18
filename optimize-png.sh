#!/bin/sh
# Remove color-correction chunks (gamma, white balance, ICC color profile,
# standard RGB color profile) and optimze PNGs.

if [ $1 ]; then
  dir=$1
else
  dir=lib/*/images/
fi

for i in `find $dir -name "*.png"`; do
    optipng $i
    pngcrush -rem gAMA -rem cHRM -rem iCCP -rem sRGB $i $i.optimized
    rm $i
    mv $i.optimized $i
done
