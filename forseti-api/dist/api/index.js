"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _package = require("../../package.json");

var _express = require("express");

var _forseti = _interopRequireDefault(require("./forseti"));

var _user = _interopRequireDefault(require("./user"));

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
var _default = function _default(_ref) {
  var config = _ref.config,
      db = _ref.db;
  var api = (0, _express.Router)(); // mount resources

  api.use('/forseti', (0, _forseti["default"])({
    config: config,
    db: db
  })); // mount resources

  api.use('/user', (0, _user["default"])({
    config: config,
    db: db
  })); // perhaps expose some API metadata at the root

  api.get('/', function (req, res) {
    console.log(req.session);
    res.json({
      version: _package.version
    });
  });
  return api;
};

exports["default"] = _default;
//# sourceMappingURL=index.js.map