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

/**
 * ResourceType
 * @description the mapped resource types to that used by Forseti Security
 */
const ResourceType = {
    ORGANIZATION: 'organization',
    FOLDER: 'folder',
    PROJECT: 'project',
    FIREWALL: 'firewall',
    APPENGINE: 'appengine_app',
    BUCKET: 'bucket',
    INSTANCE: 'instance',
    GCE_VM: 'instance',
    CLOUDSQL: 'cloudsqlinstance',
    DATASET: 'dataset',
    KUBERNETES_CLUSTER: 'kubernetes_cluster',
    GKE: 'kubernetes_cluster',
    SERVICE_ACCOUNT: 'serviceaccount',
    SERVICE_ACCOUNT_KEY: 'serviceaccount_key'
};

export default ResourceType;