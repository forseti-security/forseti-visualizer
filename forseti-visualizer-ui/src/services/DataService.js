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

import $ from 'jquery';

class DataService {
    /**
     * @function constructor
     * @description sets the host.  the host is the URL to the backend api server
     */
    constructor() {
        // THIS SHOULD BE ENABLED THIS WHEN DEPLOYING ALONE WITH forseti-visualizer
        // this.host = 'http://localhost:8080';
        
        // THIS SHOULD BE ENABLED THIS WHEN DEPLOYING VIA FORSETI-API
        this.host = '';
    }

    /**
     * @function getForsetiResources
     * @description gets forseti resources (for structure, reference ./forseti-visualizer-ui/public/dataset1_resources.json)
     * @param parentId 
     * @return promise containing an array of forseti-resources
     */
    getForsetiResources(parentId) {
        // let url = `${this.host}/api/forseti/resources`;
        let url = `${this.host}/api/forseti/resources/${parentId ? parentId : ''}`;
        return $.get(url);
    }

    /**
     * @function getViolations
     * @description based on the inventory_index_id, get all violations (during a scan)
     * @return promise containing an array of forseti-violations
     */
    getViolations(inventoryIndexId) {
        let url = `${this.host}/api/forseti/violations/${inventoryIndexId}`;
        return $.get(url);
    }

    /**
     * @function getExplainIdentity
     * @description based on an iamPrefix, get all resources where the iamPrefixedResource has roles
     * @return promise containing an array of forseti-policies
     */
    getExplainIdentity(iamPrefix) {
        let url = `${this.host}/api/forseti/getExplainIdentity/${encodeURIComponent(iamPrefix)}`;
        return $.get(url);
    }
    
    /**
     * @function getExplainRole
     * @description TODO: Not Ready
     * @return TODO
     */
    getExplainRole(role) {
        let url = `${this.host}/api/forseti/explainRole/${encodeURIComponent(role)}`;
        return $.get(url);
    }

    /**
     * @function getForsetiJson
     * @description [TO BE DEPRECATED]
     */
    getForsetiJson() {
        return $.get(`${this.host}/api/forseti`);
    }

    /**
     * @function getForsetiCsv
     * @description [TO BE DEPRECATED]
     */
    getForsetiCsv() {
        return $.get(`${this.host}/api/forseti/csv`);
    }
}

export default DataService;