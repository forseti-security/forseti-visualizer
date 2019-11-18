"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _forsetiService = _interopRequireDefault(require("../services/forseti-service"));

var _cors = _interopRequireDefault(require("cors"));

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
  var userApi = (0, _express.Router)();
  userApi.all('*', (0, _cors["default"])());
  /**
   * @desc returns the username
   */

  userApi.get('/', function (req, res) {
    res.json({
      username: 'Me'
    });
  });
  /**
   * @desc returns the username
   */

  userApi.get('/AuthenticatedUser', ensureAuthenticated, function (req, res) {
    console.log(req.user);
    res.json('access granted');
  });
  return userApi;
};

exports["default"] = _default;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next();
  }

  console.log(req.user); // denied. redirect to login

  res.redirect('/auth/login');
}
//# sourceMappingURL=user.js.map