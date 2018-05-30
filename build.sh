# \bin\bash

rm ./docs/main.js
rm ./docs/main.css

echo -e '\n/******** jquery-3.3.1.slim.js *********/\n' >> ./docs/main.js
cat ./src/js/jquery-3.3.1.slim.js >> ./docs/main.js
echo -e '\n/******** QRreader.js *********/\n' >> ./docs/main.js
cat ./src/js/QRreader.js >> ./docs/main.js

cat ./src/css/main.css >> ./docs/main.css
cat ./src/css/QRreader.css >> ./docs/main.css