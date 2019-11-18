"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var MySQLDatabaseConnection =
/*#__PURE__*/
function () {
  function MySQLDatabaseConnection(host, user, password, database) {
    _classCallCheck(this, MySQLDatabaseConnection);

    this.initializeConnection(host, user, password, database);
  }

  _createClass(MySQLDatabaseConnection, [{
    key: "initializeConnection",
    value: function initializeConnection(host, user, password, database) {
      var _this = this;

      var mysql = require('mysql');

      var connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
      });
      connection.connect(function (err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
      });
      connection.on('error', function (err) {
        console.log('db error', err);

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          // Connection to the MySQL server is usually
          _this.initializeConnection(host, user, password, database); // lost due to either server restart, or a

        } else {
          // connnection idle timeout (the wait_timeout
          throw err; // server variable configures this)
        }
      });
      this.connection = connection;
    }
  }, {
    key: "getActiveConnection",
    value: function getActiveConnection() {
      return this.connection;
    }
    /*
        @param sql - string
        @param callback - function(error, results, fields) {}
     */

  }, {
    key: "query",
    value: function query(sql, callback) {
      return this.connection.query(sql, callback);
    }
  }, {
    key: "end",
    value: function end() {
      this.connection.end();
    }
  }]);

  return MySQLDatabaseConnection;
}();

var _default = MySQLDatabaseConnection;
exports["default"] = _default;
//# sourceMappingURL=mysql-db-connection.js.map