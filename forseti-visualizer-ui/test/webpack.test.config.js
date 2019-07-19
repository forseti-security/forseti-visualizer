const path = require('path');

module.exports = {
  entry: "./test/services/AllTests.js",
  output: {
    path: path.resolve(__dirname, "."),
    filename: "bundle.test.js"
  },
  mode: "none"
};