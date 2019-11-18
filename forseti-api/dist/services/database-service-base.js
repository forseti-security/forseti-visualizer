"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysqlDbConnection = _interopRequireDefault(require("./mysql-db-connection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DatabaseServiceBase =
/*#__PURE__*/
function () {
  function DatabaseServiceBase() {
    _classCallCheck(this, DatabaseServiceBase);
  }

  _createClass(DatabaseServiceBase, [{
    key: "getMySqlDbConnection",
    value: function getMySqlDbConnection(hostname, user, pass, schema) {
      return new _mysqlDbConnection["default"](hostname, user, pass, schema);
    }
  }]);

  return DatabaseServiceBase;
}();

var _default = DatabaseServiceBase;
exports["default"] = _default;
//# sourceMappingURL=database-service-base.js.map