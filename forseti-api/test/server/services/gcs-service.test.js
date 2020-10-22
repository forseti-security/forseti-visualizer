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
import {
    assert
} from 'chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

import regeneratorRuntime from "regenerator-runtime";
const {Storage} = require('@google-cloud/storage');

describe('gcs-service.js', async () => {
    let sut
    let initEventSpy

    beforeEach(async () => {
        
    })

    it('should have been called', async function(done) {
        this.timeout(5000);

        const storage = new Storage({
            projectId: 'forseti-analytics',
        });
        const [buckets] = await storage.getBuckets();
        console.log('Buckets:');
        buckets.forEach(bucket => {
            console.log(bucket.name);
        });
    })
    
})