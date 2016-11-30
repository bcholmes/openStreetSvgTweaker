# Open Street SVG Tweaker
A simple utility for manipulating SVG files downloaded from OpenStreetMap.org to make 
them more Inkscape-friendly. Importantly, a key part of what that means is moving items 
on to different Inkscape layers so that I can manipulate them more easily.

This project is implemented as a simple node command-line app. I download the SVG map
from OpenStreetMap.org and I run the following command:

```
node tweak.js -o outputFileName.svg inputFileName.svg
```

Another requirement I have is the need to sometimes convert a map into greyscale. 

```
node tweak.js -g -o outputFileName.svg inputFileName.svg
```

