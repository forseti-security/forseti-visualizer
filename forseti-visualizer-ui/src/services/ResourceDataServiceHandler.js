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

import ResourceType from '../constants/ResourceType';
import GoogleCloudImageService from './GoogleCloudImageService';

let ResourceDataServiceHandler = {
    /**
     * @function handle
     * @description Handles item by item transformations returned by getForsetiResources
     * @returns updated data properties
     */
    handle: function (a) {
        // only set parent_id if the resource is NOT the organization node
        a.parent_id =
            a.resource_type == ResourceType.ORGANIZATION ? '' : a.parent_id;
        a.image = GoogleCloudImageService.getImageUrl(a.resource_type);
        a.resource_name =
            a.resource_data_displayname !== '' ?
            a.resource_data_displayname :
            a.resource_data_name;
        return a;
    },
};

export default ResourceDataServiceHandler;