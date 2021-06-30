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

import {
    Router
} from 'express';
import ForsetiServiceFactory from '../services/forseti-service-factory';
import cors from 'cors';

export default ({
    config,
    db
}) => {
    let forsetiApi = Router();
    forsetiApi.all('*', cors());

    let forsetiService = ForsetiServiceFactory.getForsetiService();

    /**
     * @desc returns .json file content
     */
    forsetiApi.get('/', function (req, res) {
        forsetiService.getResourcesJson(function (error, results) {
            if (error) {
                console.log(error);
            }

            let json = results;
            res.json(json);
        });
    });

    /**
     * @desc returns resources
     */
    forsetiApi.get('/resources/:parentId?', function (req, res) {
        let parentId = req.params.parentId ? req.params.parentId : null;

        forsetiService.getResources(parentId, function (error, results) {
            if (error) {
                console.log(error);
            }

            let json = results;
            res.json(json);
        });
    });

    /**
     * @desc returns grpc call for iam explain
     */
    forsetiApi.get('/getExplainIdentity/:iamPrefix', function (req, res) {
        let iamPrefix = req.params.iamPrefix;

        forsetiService.getExplainIdentity(iamPrefix, function (error, results) {
            if (error) {
                console.log('Error: ', error);
            } else {
                res.json(results);
            }
        });
    });

    /**
     * @desc returns grpc call for iam explain role
     */
    forsetiApi.get('/getExplainRole/:role', function (req, res) {
        let role = req.params.role;

        forsetiService.getExplainRoles(role, function (error, results) {
            if (error) {
                console.log('Error: ', error);
            } else {
                res.json(results.accesses);
            }
        });
    });

    /**
     * @desc returns violations
     */
    forsetiApi.get('/violations/:inventoryIndexId', function (req, res) {
        let inventoryIndexId = req.params.inventoryIndexId;

        forsetiService.getViolations(inventoryIndexId, function (error, results) {
            if (error) {
                console.log(error);
            }

            let json = results;
            res.json(json);
        });
    });

    return forsetiApi;
}