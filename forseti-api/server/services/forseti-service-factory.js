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
import ForsetiService from './forseti-service.js';
import ForsetiServiceCache from './forseti-service-cache.js';

class ForsetiServiceFactory {
    constructor() {

    }

    /*
     * @description gets the Forseti Service based on CACHE_ENABLED
     * @param cb 
     */
    getForsetiService() {
        if (process.env.CACHE_ENABLED) {
            // return ForsetiService;
            return ForsetiServiceCache;
        } else {
            return ForsetiService;
        }
    }
}

export default new ForsetiServiceFactory();