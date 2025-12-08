Ensure terser is install

npm install --global terser

Generate
terser hello.js math.js \
  --output bundle.min.js \
  --source-map "filename=bundle.min.js.map" \
  --source-map "url=bundle.min.js.map" \
  --source-map "includeSources" \
  --compress --mangle
  
Note that "includeSources" includes content into sourcesContent. 

Reconstruct:
node reconstruct.js bundle.min.js.map

node reconstruct-no-content.js bundle.min.js.map originals
