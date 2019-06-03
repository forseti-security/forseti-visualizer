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

import {
    Router
} from 'express';
import ForsetiService from '../services/forseti-service';
import cors from 'cors';

export default ({
    config,
    db
}) => {
    let forsetiApi = Router();

    forsetiApi.all('*', cors());
    
    /**
     * @desc returns .json file content
     */
    forsetiApi.get('/', function (req, res) {
        ForsetiService.getResourcesJson(function (error, results) {
            if (error) throw error;
            let json = results;
            res.json(json);
        });
    });

    /**
     * @desc returns resources
     */
    forsetiApi.get('/resources', function (req, res) {
        ForsetiService.getResources(function (error, results) {
            if (error) throw error;
            let json = results;
            res.json(json);
        });
    });

    /**
     * @desc returns grpc call for iam explain
     */
    forsetiApi.get('/getExplainIdentity/:iamPrefix', function (req, res) {
        let iamPrefix = req.params.iamPrefix;

        ForsetiService.getExplainIdentity(iamPrefix, function (error, results) {
            if (error) {
                console.log('Error: ', error);
            } else {
                for (let i = 0; i < results.accesses.length; i++) {
                    for (let j = 0; j < results.accesses[i].resources.length; j++) {
                        console.log(results.accesses[i]);
                        console.log(results.accesses[i].resources[j]);
                    }
                }

                res.json(results.accesses);
            }
        });
    });

    /**
     * @desc returns grpc call for iam explain role
     */
    forsetiApi.get('/getExplainRole/:role', function (req, res) {
        let role = req.params.role;

        console.log('rolex', role);

        ForsetiService.getExplainRoles(role, function (error, results) {
            if (error)
                console.log('Error: ', error);
            else {
                console.log(results);
                
                // TODO:

                res.json(results.accesses);
            }
        });
    });

    /**
     * @desc returns violations
     */
    forsetiApi.get('/violations/:inventoryIndexId', function (req, res) {
        let inventoryIndexId = req.params.inventoryIndexId;

        ForsetiService.getViolations(inventoryIndexId, function (error, results) {
            if (error) throw error;
            let json = results;
            res.json(json);
        });
    });

    return forsetiApi;
}