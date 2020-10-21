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

const fs = require("fs");

class ForsetiServiceCache {
    constructor() {}

    /*
     * @param cb 
        function (error, results, fields) {
            if (error) throw error;
            
            return results;
        });
     */
    getResources(parentId, cb) {
        fs.readFile("./public/cached_data/resources.json", function (err, data) {
            if (err) throw err;

            // Converting to JSON 
            const resources = JSON.parse(data);

            cb(null, resources)
        });
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
        fs.readFile("./public/cached_data/violations.json", function (err, data) {
            if (err) throw err;

            // Converting to JSON 
            const resources = JSON.parse(data);

            cb(null, resources)
        });
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
        let explainClient = new ex.Explain(channel, grpc.credentials.createInsecure());

        var meta = new grpc.Metadata();
        meta.add('handle', process.env.FORSETI_DATA_MODEL_HANDLE);

        console.log('channel', channel);
        console.log('channel', process.env.FORSETI_DATA_MODEL_HANDLE);
        console.log(iamPrefix);

        // ref: https://grpc.io/docs/tutorials/basic/node/
        //iamPrefix='user/garrettwong@gwongcloud.com';
        let response = explainClient.getAccessByMembers({
            member_name: iamPrefix,
            // permission_names: ['iam.serviceAccounts.actAs'], // for filtering
            expand_resources: true
        }, meta);

        var results = [];
        response.on('data', function (result) {
            console.log('result:', result);
            results.push(result);
        })
        response.on('end', function () {
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

        res.getPermissionsByRoles({
                role_names: ['roles/owner']
                // role_prefixes: role_prefixes // for filtering
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

export default new ForsetiServiceCache();