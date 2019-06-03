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

class GoogleCloudImageService {
    /**
     * @function getImageUrl
     * @description gets the image url based on a resourceType
     * @param resourceType a forseti resource_type
     * @returns the webpack based path to the image (based off of package.json - file-loader)
     */
    getImageUrl(resourceType) {
        let imageFileName = this.getImageFileNameByResourceType(resourceType);

        // returns static reference
        let imageResult = require(`../../public/Products & Services/public/${imageFileName}`);

        return imageResult;
    }

    /**
     * @function getRemoteImageUrl [DEPRECATE?]
     * @description gets the image url based on a resourceType
     * @param resourceType a forseti resource_type
     * @returns the webpack based path to the image (based off of package.json - file-loader)
     */
    getRemoteImageUrl(resourceType) {
        var URL_BASE = 'https://storage.googleapis.com/forseti-visualizer-icons/public/';
        
        let imageFileName = this.getImageFileNameByResourceType(resourceType);

        return URL_BASE + imageFileName;
    }

    /**
     * @function getImageFileNameByResourceType
     * @description gets image file (statically stored) based on forseti resource type
     * @param resourceType a forseti resource_type
     * @returns the fileName from the file system
     */
    getImageFileNameByResourceType(resourceType) {
        let imageFilename = 'project_logo.png';

        switch (resourceType.toLowerCase()) {
            case 'organization':
                imageFilename = 'cloud_logo.png';
                break;

            case 'folder':
                imageFilename = 'folder_logo.png';
                break;

            case 'project':
                imageFilename = 'project_logo.png';
                break;

            case 'appengine_app':
                imageFilename = 'App Engine.png';
                break;

            case 'kubernetes_cluster':
                imageFilename = 'Kubernetes_logo.png';
                break;

            case 'instance':
                imageFilename = 'Compute Engine.png';
                break;

            case 'cloudsqlinstance':
                imageFilename = 'Cloud SQL.png';
                break;

            case 'bucket':
                imageFilename = 'Cloud Storage.png';
                break;

            case 'dataset':
                imageFilename = 'BigQuery.png';
                break;

            case 'firewall':
                imageFilename = 'Cloud Firewall Rules.png';
                break;

            case 'network':
                imageFilename = 'Virtual Private Cloud.png';
                break;

            case 'serviceaccount':
                imageFilename = 'Cloud IAM.png';
                break;

            case 'serviceaccount_key':
                imageFilename = 'Security Key Enforcement.png';
                break;

            default:
                imageFilename = 'project_logo.png';
                break;
        }

        return imageFilename;
    }
}

export default new GoogleCloudImageService();