"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _morgan = _interopRequireDefault(require("morgan"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _db = _interopRequireDefault(require("./db"));

var _middleware = _interopRequireDefault(require("./middleware"));

var _api = _interopRequireDefault(require("./api"));

var _config = _interopRequireDefault(require("./config.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var app = (0, _express["default"])();
app.server = _http["default"].createServer(app); // logger

app.use((0, _morgan["default"])('dev')); // 3rd party middleware

app.use((0, _cors["default"])({
  exposedHeaders: _config["default"].corsHeaders
}));
app.use(_bodyParser["default"].json({
  limit: _config["default"].bodyLimit
})); // connect to db

(0, _db["default"])(function (db) {
  // internal middleware
  app.use((0, _middleware["default"])({
    config: _config["default"],
    db: db
  })); // api router

  app.use('/api', (0, _api["default"])({
    config: _config["default"],
    db: db
  }));
  app.server.listen(process.env.PORT || _config["default"].port, function () {
    console.log("Started on port ".concat(app.server.address().port));
  });
});
var _default = app;
exports["default"] = _default;
//# sourceMappingURL=index-REMOVE.js.map