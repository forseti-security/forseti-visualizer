"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _package = require("../../package.json");

var _express = require("express");

var _forseti = _interopRequireDefault(require("./forseti"));

var _user = _interopRequireDefault(require("./user"));

var _cryptoService = _interopRequireDefault(require("../services/crypto-service"));

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
  })); // api.use('/auth', auth({
  // 	config,
  // 	db
  // }));
  // perhaps expose some API metadata at the root

  api.get('/', function (req, res) {
    console.log(req.session);
    res.json({
      version: _package.version
    });
  });
  /* Testing */
  // perhaps expose some API metadata at the root

  api.get('/enc', function _callee(req, res) {
    var textToEncrypt, encryptedText;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // enc / dec
            textToEncrypt = "Haha";
            _context.next = 3;
            return regeneratorRuntime.awrap(_cryptoService["default"].encrypt('/Users/garrettwong/Git/forseti-visualizer/forseti-api/dockersource.env', 'asdf.env.enc'));

          case 3:
            encryptedText = _context.sent;
            res.json({
              encryptedText: encryptedText
            });

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  }); // perhaps expose some API metadata at the root

  api.get('/dec', function _callee2(req, res) {
    var decryptedText;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(_cryptoService["default"].decrypt('asdf.env.enc', 'orginal.env'));

          case 2:
            decryptedText = _context2.sent;
            res.json({
              decryptedText: decryptedText
            });

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  return api;
};

exports["default"] = _default;
//# sourceMappingURL=index.js.map