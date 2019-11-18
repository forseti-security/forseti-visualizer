"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _databaseServiceBase = _interopRequireDefault(require("./database-service-base.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ForsetiService =
/*#__PURE__*/
function (_DatabaseServiceBase) {
  _inherits(ForsetiService, _DatabaseServiceBase);

  function ForsetiService() {
    _classCallCheck(this, ForsetiService);

    return _possibleConstructorReturn(this, _getPrototypeOf(ForsetiService).call(this));
  }
  /*
   * @param cb 
      function (error, results, fields) {
          if (error) throw error;
          
          console.log('durr', results, fields);
           return results;
      });
   */


  _createClass(ForsetiService, [{
    key: "getResources",
    value: function getResources(parentId, cb) {
      // include parent and its children
      var parentIdSqlPhrase = parentId ? "AND (g.resource_id = '".concat(parentId, "' OR g.parent_id = \n                (SELECT id \n                    FROM gcp_inventory \n                    WHERE inventory_index_id = g.inventory_index_id AND\n                        category = 'resource' AND \n                        resource_id = '").concat(parentId, "'\n                )\n            )") : '';
      console.log(parentIdSqlPhrase); // GETS resources from the last successful inventory?

      var sql = "\n        SELECT g.id, \n            g.resource_type, \n            g.category, \n            g.resource_id, \n            g.parent_id AS parent_id, \n            g.full_name AS full_name,\n            IFNULL(g.resource_data->>'$.displayName', '') as resource_data_displayname, \n            IFNULL(g.resource_data->>'$.name', '') as resource_data_name, g.resource_data->>'$.lifecycleState' as lifecycle_state,\n            g.inventory_index_id\n        FROM gcp_inventory g \n        WHERE g.inventory_index_id = (SELECT id \n                FROM inventory_index \n                WHERE inventory_status IN ('SUCCESS', 'PARTIAL_SUCCESS')\n                ORDER BY completed_at_datetime DESC LIMIT 1) \n            AND (g.category='resource') \n\n            AND g.resource_type IN ('organization', 'project', 'folder', \n                'appengine_app', 'kubernetes_cluster', 'cloudsqlinstance', 'instance', \n                'dataset', 'firewall', 'bucket', 'serviceaccount', 'serviceaccount_key', 'network')\n            \n            ".concat(parentIdSqlPhrase, "\n            \n            -- this will filter out DELETE_REQUESTED projects and the child resources under the DELETE_REQUESTED state resources\n            AND (g.resource_data->>'$.lifecycleState' != 'DELETE_REQUESTED' || g.resource_data->>'$.lifecycleState' is NULL)\n            AND (g.parent_id NOT IN (SELECT id FROM gcp_inventory gsub WHERE gsub.id = g.parent_id AND gsub.resource_data->>'$.lifecycleState' = 'DELETE_REQUESTED'))\n\n            ORDER BY CASE \n                WHEN g.resource_type = 'organization' THEN 0 \n                WHEN g.resource_type = 'folder' THEN 1 \n                WHEN g.resource_type = 'project' THEN 2 ELSE 3 END ASC;");

      try {
        var mySqlDbConn = this.getMySqlDbConnection(process.env.CLOUDSQL_HOSTNAME, process.env.CLOUDSQL_USERNAME, process.env.CLOUDSQL_PASSWORD, process.env.CLOUDSQL_SCHEMA);
        mySqlDbConn.query(sql, cb);
      } catch (ex) {
        console.log(ex);
      }
    }
    /**
     * @desc gets violations in forseti database
     * @param cb
     *  function (error, results, fields) {
            if (error) throw error;
            
            return results;
        });
     */

  }, {
    key: "getViolations",
    value: function getViolations(inventoryIndexId, cb) {
      var getInventoryIndexIdSqlStmt = "(SELECT id \n            FROM inventory_index \n            WHERE inventory_status IN ('SUCCESS', 'PARTIAL_SUCCESS') \n            ORDER BY completed_at_datetime DESC LIMIT 1)";

      if (inventoryIndexId !== null && inventoryIndexId > 0) {
        getInventoryIndexIdSqlStmt = inventoryIndexId;
      }

      var sql = "\n        SELECT ii.id as inventory_index_id, si.id as scanner_index_id, v.* FROM violations v \n        JOIN scanner_index si\n        ON v.scanner_index_id = si.id\n        JOIN inventory_index ii\n        ON si.inventory_index_id = ii.id\n        WHERE ii.id = ".concat(getInventoryIndexIdSqlStmt);
      console.log('gv', inventoryIndexId, sql);

      try {
        var mySqlDbConn = this.getMySqlDbConnection(process.env.CLOUDSQL_HOSTNAME, process.env.CLOUDSQL_USERNAME, process.env.CLOUDSQL_PASSWORD, process.env.CLOUDSQL_SCHEMA);
        mySqlDbConn.query(sql, cb);
      } catch (ex) {
        console.log('getViolations', ex);
      }
    }
    /**
     * gets the iam explain of a given prefix
     * @param {*} iamPrefix 'user/garrettwong@mycloud.com'
     * @param {*} cb function for callback processing
     */

  }, {
    key: "getExplainIdentity",
    value: function getExplainIdentity(iamPrefix, cb) {
      var PROTO_PATH = 'protos/explain.proto';

      var grpc = require('grpc');

      var protoLoader = require('@grpc/proto-loader'); // Suggested options for similarity to existing grpc.load behavior


      var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });
      var protoDescriptor = grpc.loadPackageDefinition(packageDefinition); // The protoDescriptor object has the full package hierarchy

      var ex = protoDescriptor.explain;
      var channel = process.env.FORSETI_SERVER_VM_CHANNEL;
      var res = new ex.Explain(channel, grpc.credentials.createInsecure());
      var meta = new grpc.Metadata();
      meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);
      console.log(ex);
      console.log(res);
      console.log('channel', channel);
      console.log('channel', process.env.FORSETI_DATA_MODEL_HANDLE);
      res.getAccessByMembers({
        member_name: iamPrefix
      }, meta, cb);
    }
    /**
     * gets the iam explain of a given prefix
     * @param {*} role ''
     * @param {*} cb function for callback processing
     */

  }, {
    key: "getExplainRoles",
    value: function getExplainRoles(role, cb) {
      var PROTO_PATH = 'explain.proto';

      var grpc = require('grpc');

      var protoLoader = require('@grpc/proto-loader'); // Suggested options for similarity to existing grpc.load behavior


      var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });
      var protoDescriptor = grpc.loadPackageDefinition(packageDefinition); // The protoDescriptor object has the full package hierarchy

      var ex = protoDescriptor.explain;
      var channel = process.env.FORSETI_SERVER_VM_CHANNEL;
      var res = new ex.Explain(channel, grpc.credentials.createInsecure());
      console.log(res);
      var meta = new grpc.Metadata();
      meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);
      res.getAccessByPermissions({
        role_name: 'roles/owner',
        permission_name: ''
      }, meta, cb);
      res.getPermissionsByRoles({// role_names: ['roles/owner']
        // role_prefixes: role_prefixes
      }, meta, cb);
    }
    /*
     * @param cb 
        function (error, results, fields) {
            if (error) throw error;
            
            console.log('durr', results, fields);
             return results;
        });
     */

  }, {
    key: "getResourcesJson",
    value: function getResourcesJson(cb) {
      var sql = "SELECT g.id, g.resource_type, g.category, g.resource_id, g.parent_id AS parent_id, IFNULL(g.resource_data->>'$.displayName', '') as resource_data_displayname, IFNULL(g.resource_data->>'$.name', '') as resource_data_name, g.resource_data->>'$.lifecycleState' as lifecycle_state FROM gcp_inventory g WHERE g.inventory_index_id = (SELECT id FROM inventory_index ORDER BY completed_at_datetime DESC LIMIT 1) AND (g.category='resource') AND g.resource_type IN ('organization', 'project', 'folder', 'appengine_app', 'kubernetes_cluster', 'cloudsqlinstance') ORDER BY CASE WHEN g.resource_type = 'organization' THEN 0 WHEN g.resource_type = 'folder' THEN 1 WHEN g.resource_type = 'project' THEN 2 ELSE 3 END ASC;";

      try {
        var mySqlDbConn = this.getMySqlDbConnection(process.env.CLOUDSQL_HOSTNAME, process.env.CLOUDSQL_USERNAME, process.env.CLOUDSQL_PASSWORD, process.env.CLOUDSQL_SCHEMA);
        mySqlDbConn.query(sql, cb);
      } catch (ex) {
        console.log(ex);
      }
    }
  }]);

  return ForsetiService;
}(_databaseServiceBase["default"]);

var _default = new ForsetiService();

exports["default"] = _default;
//# sourceMappingURL=forseti-service.js.map