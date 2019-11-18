"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

/* crypto-service */
var CryptoService =
/*#__PURE__*/
function () {
  function CryptoService() {
    var projectId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'forseti-security-new';
    var keyRingId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'test';
    var cryptoKeyId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'quickstart';

    _classCallCheck(this, CryptoService);

    this.projectId = projectId;
    this.keyRingId = keyRingId;
    this.cryptoKeyId = cryptoKeyId;
  }

  _createClass(CryptoService, [{
    key: "encrypt",
    value: function encrypt() {
      var plaintextFileName,
          ciphertextFileName,
          fs,
          _require,
          promisify,
          kms,
          client,
          locationId,
          readFile,
          contentsBuffer,
          plaintext,
          name,
          _ref,
          _ref2,
          result,
          writeFile,
          _args = arguments;

      return regeneratorRuntime.async(function encrypt$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              plaintextFileName = _args.length > 0 && _args[0] !== undefined ? _args[0] : '/Users/garrettwong/Git/forseti-visualizer/forseti-api/dockersource.env';
              ciphertextFileName = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'dockersource.env.enc';
              fs = require('fs');
              _require = require('util'), promisify = _require.promisify; // Import the library and create a client

              kms = require('@google-cloud/kms');
              client = new kms.KeyManagementServiceClient(); // The location of the crypto key's key ring, e.g. "global"

              locationId = 'global'; // Reads the file to be encrypted

              readFile = promisify(fs.readFile);
              _context.next = 10;
              return regeneratorRuntime.awrap(readFile(plaintextFileName));

            case 10:
              contentsBuffer = _context.sent;
              console.log(contentsBuffer);
              plaintext = contentsBuffer.toString('base64');
              console.log(plaintext);
              name = client.cryptoKeyPath(this.projectId, locationId, this.keyRingId, this.cryptoKeyId); // Encrypts the file using the specified crypto key

              _context.next = 17;
              return regeneratorRuntime.awrap(client.encrypt({
                name: name,
                plaintext: plaintext
              }));

            case 17:
              _ref = _context.sent;
              _ref2 = _slicedToArray(_ref, 1);
              result = _ref2[0];
              writeFile = promisify(fs.writeFile);
              _context.next = 23;
              return regeneratorRuntime.awrap(writeFile(ciphertextFileName, Buffer.from(result.ciphertext, 'base64')));

            case 23:
              console.log("Encrypted ".concat(plaintextFileName, " using ").concat(result.name, "."));
              console.log("Result saved to ".concat(ciphertextFileName, "."));
              return _context.abrupt("return", Buffer.from(result.ciphertext, 'base64'));

            case 26:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decrypt",
    value: function decrypt() {
      var ciphertextFileName,
          plaintextFileName,
          fs,
          _require2,
          promisify,
          kms,
          client,
          locationId,
          readFile,
          contentsBuffer,
          name,
          ciphertext,
          _ref3,
          _ref4,
          result,
          writeFile,
          _args2 = arguments;

      return regeneratorRuntime.async(function decrypt$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              ciphertextFileName = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'dockersource.env.enc';
              plaintextFileName = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 'dockersource.env.decrypted';
              fs = require('fs');
              _require2 = require('util'), promisify = _require2.promisify; // Import the library and create a client

              kms = require('@google-cloud/kms');
              client = new kms.KeyManagementServiceClient(); // The location of the crypto key's key ring, e.g. "global"

              locationId = 'global'; // Reads the file to be decrypted

              readFile = promisify(fs.readFile);
              _context2.next = 10;
              return regeneratorRuntime.awrap(readFile(ciphertextFileName));

            case 10:
              contentsBuffer = _context2.sent;
              name = client.cryptoKeyPath(this.projectId, locationId, this.keyRingId, this.cryptoKeyId);
              ciphertext = contentsBuffer.toString('base64'); // Decrypts the file using the specified crypto key

              _context2.next = 15;
              return regeneratorRuntime.awrap(client.decrypt({
                name: name,
                ciphertext: ciphertext
              }));

            case 15:
              _ref3 = _context2.sent;
              _ref4 = _slicedToArray(_ref3, 1);
              result = _ref4[0];
              // Writes the decrypted file to disk
              writeFile = promisify(fs.writeFile);
              _context2.next = 21;
              return regeneratorRuntime.awrap(writeFile(plaintextFileName, Buffer.from(result.plaintext, 'base64')));

            case 21:
              console.log("Decrypted ".concat(ciphertextFileName, ", result saved to ").concat(plaintextFileName, "."));
              console.log(Buffer.from(result.plaintext, 'base64').toString('utf8'));
              return _context2.abrupt("return", Buffer.from(result.plaintext, 'base64').toString('utf8'));

            case 24:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);

  return CryptoService;
}();

var _default = new CryptoService();

exports["default"] = _default;
//# sourceMappingURL=crypto-service.js.map