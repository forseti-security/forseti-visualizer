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

import JSONLargeDataService from './JSONLargeDataService';
import DataService from './DataService';
import JSONDataService from './JSONDataService';

/**
 * @class DataServiceFactory
 * @desc returns the DataServiceFactory
 */
class DataServiceFactory {
    /**
     * @function constructor
     */
    constructor() {

    }

    /**
     * @function getDataServiceFactory
     * @description returns the data service factory type depending on flags
     * @param useJson boolean indicating whether to use JSON data, if false, then use CSV data
     * @param useCache boolean indicating whether to use .JSON cached data OR data from the Cloud SQL database
     * @return the proper data service factory
     */
    getDataServiceFactory(useJson, useCache) {
        if (!useJson) {
            return new JSONLargeDataService();
        }

        if (useCache) {
            return new JSONDataService();
        } else {
            return new DataService();
        }
    }
}

export default new DataServiceFactory();