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

class ForsetiResourceConverter {
    /**
     * @function convertResources
     * @description converts resources to forseti cloud asset inventory form
     * @return list of converted forseti violation resources
     */
    convertResources(forsetiViolationResources, forsetiResourceArray) {
        for (let i = 0; i < forsetiViolationResources.length; i++) {
            if (
                forsetiViolationResources[i].resources[0].indexOf('organization') > -1
            ) {
                // find common resource name and replace
                for (let j = 0; j < forsetiResourceArray.length; j++) {
                    if (forsetiViolationResources[i].resources[0] === (forsetiResourceArray[j].resource_data_name.replace('organizations', 'organization'))) {
                        forsetiViolationResources[i].resources[0] = forsetiResourceArray[j].resource_name;
                    }
                }
            } else if (forsetiViolationResources[i].resources[0].indexOf('folder') > -1
            ) {
                for (let j = 0; j < forsetiResourceArray.length; j++) {
                    if (forsetiViolationResources[i].resources[0] === (forsetiResourceArray[j].resource_data_name.replace('folders', 'folder'))) {
                        forsetiViolationResources[i].resources[0] = forsetiResourceArray[j].resource_name;
                    }
                }
            } else if (
                forsetiViolationResources[i].resources[0].indexOf('project') > -1
            ) {
                forsetiViolationResources[i].resources[0] = forsetiViolationResources[i].resources[0].replace('project/', '');
            }
        }

        return forsetiViolationResources;
    }


    /**
     * @function convertResource
     * @description converts individual resource to forseti expected resource name
     * @returns string
     */
    convertResource(resourceName) {
        switch (resourceName) {
            case 'GCE Instance':
                return 'instance';
            case 'GCS Bucket':
                return 'bucket';
            case 'App Engine':
                return 'appengine_app';
            case 'GKE Cluster':
                return 'kubernetes_cluster';
            case 'Firewall':
                return 'firewall';
            case 'Network':
                return 'network';
            case 'Cloud SQL':
                return 'cloudsqlinstance';
            case 'BQ Dataset':
                return 'dataset';
            case 'Service Account':
                return 'serviceaccount';
            case 'Service Account Key':
                return 'serviceaccount_key';
            default:
                return resourceName;
        }
    }
}

export default new ForsetiResourceConverter();