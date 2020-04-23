// Copyright 2020 Google LLC
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

/* forseti-service */
import DatabaseServiceBase from './database-service-base.js';

class ForsetiService extends DatabaseServiceBase {
    constructor() {
        super()
    }

    /*
     * @param cb 
        function (error, results, fields) {
            if (error) throw error;
            
            console.log('durr', results, fields);

            return results;
        });
     */
    getResources(parentId, cb) {
        // include parent and its children
        let parentIdSqlPhrase = parentId ?
            `AND (g.resource_id = '${parentId}' OR g.parent_id = 
                (SELECT id 
                    FROM gcp_inventory 
                    WHERE inventory_index_id = g.inventory_index_id AND
                        category = 'resource' AND 
                        resource_id = '${parentId}'
                )
            )` : '';

        console.log(parentIdSqlPhrase);

        // GETS resources from the last successful inventory?
        let sql = `
        SELECT g.id, 
            g.resource_type, 
            g.category, 
            g.resource_id, 
            g.parent_id AS parent_id, 
            g.full_name AS full_name,
            IFNULL(g.resource_data->>'$.displayName', '') as resource_data_displayname, 
            IFNULL(g.resource_data->>'$.name', '') as resource_data_name, g.resource_data->>'$.lifecycleState' as lifecycle_state,
            g.inventory_index_id
        FROM gcp_inventory g 
        WHERE g.inventory_index_id = (SELECT id 
                FROM inventory_index 
                WHERE inventory_status IN ('SUCCESS', 'PARTIAL_SUCCESS')
                ORDER BY completed_at_datetime DESC LIMIT 1) 
            AND (g.category='resource') 

            AND g.resource_type IN ('organization', 'project', 'folder', 
                'appengine_app', 'kubernetes_cluster', 'cloudsqlinstance', 'instance', 
                'dataset', 'firewall', 'bucket', 'serviceaccount', 'serviceaccount_key', 'network')
            
            ${parentIdSqlPhrase}
            
            -- this will filter out DELETE_REQUESTED projects and the child resources under the DELETE_REQUESTED state resources
            AND (g.resource_data->>'$.lifecycleState' != 'DELETE_REQUESTED' || g.resource_data->>'$.lifecycleState' is NULL)
            AND (g.parent_id NOT IN (SELECT id FROM gcp_inventory gsub WHERE gsub.id = g.parent_id AND gsub.resource_data->>'$.lifecycleState' = 'DELETE_REQUESTED'))

            ORDER BY CASE 
                WHEN g.resource_type = 'organization' THEN 0 
                WHEN g.resource_type = 'folder' THEN 1 
                WHEN g.resource_type = 'project' THEN 2 ELSE 3 END ASC;`;

        try {
            let mySqlDbConn = this.getMySqlDbConnection(
                process.env.CLOUDSQL_HOSTNAME,
                process.env.CLOUDSQL_USERNAME,
                process.env.CLOUDSQL_PASSWORD,
                process.env.CLOUDSQL_SCHEMA
            );
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
    getViolations(inventoryIndexId, cb) {
        let getInventoryIndexIdSqlStmt = `(SELECT id 
            FROM inventory_index 
            WHERE inventory_status IN ('SUCCESS', 'PARTIAL_SUCCESS') 
            ORDER BY completed_at_datetime DESC LIMIT 1)`;

        if (inventoryIndexId !== null && inventoryIndexId > 0) {
            getInventoryIndexIdSqlStmt = inventoryIndexId;
        }

        let sql = `
        SELECT ii.id as inventory_index_id, si.id as scanner_index_id, v.* FROM violations v 
        JOIN scanner_index si
        ON v.scanner_index_id = si.id
        JOIN inventory_index ii
        ON si.inventory_index_id = ii.id
        WHERE ii.id = ${getInventoryIndexIdSqlStmt}`;

        console.log('gv', inventoryIndexId, sql);

        try {
            let mySqlDbConn = this.getMySqlDbConnection(
                process.env.CLOUDSQL_HOSTNAME,
                process.env.CLOUDSQL_USERNAME,
                process.env.CLOUDSQL_PASSWORD,
                process.env.CLOUDSQL_SCHEMA
            );
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
    getExplainIdentity(iamPrefix, cb) {
        var PROTO_PATH = 'protos/explain.proto';
        var grpc = require('grpc');
        var protoLoader = require('@grpc/proto-loader');
        // Suggested options for similarity to existing grpc.load behavior
        var packageDefinition = protoLoader.loadSync(
            PROTO_PATH, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        // The protoDescriptor object has the full package hierarchy
        var ex = protoDescriptor.explain;

        let channel = process.env.FORSETI_SERVER_VM_CHANNEL;
        let res = new ex.Explain(channel, grpc.credentials.createInsecure());

        var meta = new grpc.Metadata();
        meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);

        // console.log(ex);
        // console.log(res);
        console.log('channel', channel);
        console.log('channel', process.env.FORSETI_DATA_MODEL_HANDLE);
        console.log(iamPrefix);

        // ref: https://grpc.io/docs/tutorials/basic/node/
        //iamPrefix='user/garrettwong@gwongcloud.com';
        let call2 = res.getAccessByMembers({
            member_name: iamPrefix,
            permission_names: ['iam.serviceAccounts.actAs'],
            expand_resources: true
        }, meta);

        var results = [];
        call2.on('data', function (result) {
            console.log('result:', result);
            results.push(result);
        })
        call2.on('end', function() {
            console.log('streamEnd!')
            cb(undefined, results);
        });
    }

    /**
     * gets the iam explain of a given prefix
     * @param {*} role ''
     * @param {*} cb function for callback processing
     */
    getExplainRoles(role, cb) {
        var PROTO_PATH = 'protos/explain.proto';
        var grpc = require('grpc');
        var protoLoader = require('@grpc/proto-loader');
        // Suggested options for similarity to existing grpc.load behavior
        var packageDefinition = protoLoader.loadSync(
            PROTO_PATH, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        // The protoDescriptor object has the full package hierarchy
        var ex = protoDescriptor.explain;

        let channel = process.env.FORSETI_SERVER_VM_CHANNEL;
        let res = new ex.Explain(channel, grpc.credentials.createInsecure());
        console.log(res);
        console.log(cb);

        var meta = new grpc.Metadata();
        meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);

        // res.getAccessByPermissions({
        //     role_name: 'roles/storage.objectViewer',
        //     permission_name: '',
        // }, meta, function(a) { console.log(a); });

        res.getPermissionsByRoles({
                role_names: ['roles/owner']
                // role_prefixes: role_prefixes
            }, meta, function (data, sec) {
                console.log('success', data, sec);
                console.log(sec.permissionsbyroles[0].permissions.length)
                console.log(sec.permissionsbyroles[0].permissions[0])
            },
            function (err) {
                console.log('err', err);
            });
    }

    /*
     * @param cb 
        function (error, results, fields) {
            if (error) throw error;
            
            console.log('durr', results, fields);

            return results;
        });
     */
    getResourcesJson(cb) {
        let sql = "SELECT g.id, g.resource_type, g.category, g.resource_id, g.parent_id AS parent_id, IFNULL(g.resource_data->>'$.displayName', '') as resource_data_displayname, IFNULL(g.resource_data->>'$.name', '') as resource_data_name, g.resource_data->>'$.lifecycleState' as lifecycle_state FROM gcp_inventory g WHERE g.inventory_index_id = (SELECT id FROM inventory_index ORDER BY completed_at_datetime DESC LIMIT 1) AND (g.category='resource') AND g.resource_type IN ('organization', 'project', 'folder', 'appengine_app', 'kubernetes_cluster', 'cloudsqlinstance') ORDER BY CASE WHEN g.resource_type = 'organization' THEN 0 WHEN g.resource_type = 'folder' THEN 1 WHEN g.resource_type = 'project' THEN 2 ELSE 3 END ASC;";

        try {
            let mySqlDbConn = this.getMySqlDbConnection(
                process.env.CLOUDSQL_HOSTNAME,
                process.env.CLOUDSQL_USERNAME,
                process.env.CLOUDSQL_PASSWORD,
                process.env.CLOUDSQL_SCHEMA
            );
            mySqlDbConn.query(sql, cb);
        } catch (ex) {
            console.log(ex);
        }
    }
}

export default new ForsetiService();