#!/usr/local/bin/node

// usage: node xargs.js hello world

var streamify = require('stream-array');
var xargs = require('xargs');

streamify(process.argv)
  .pipe(xargs(['echo']))
  .pipe(process.stdout);  // outputs: /usr/local/bin/node ${FULL_PATH}/xargs.js hello world
