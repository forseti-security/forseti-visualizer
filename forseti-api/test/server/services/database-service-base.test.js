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

import DatabaseServiceBase from '../../../server/services/database-service-base.js'

describe('database-service-base.js', () => {
    let sut
    let testConfig = {
        hostname: '127.0.0.1',
        user: 'user',
        pass: '',
        schema: 'forseti_security'
    }

    beforeEach(() => {
        sut = new DatabaseServiceBase()
    })

    it('should set properties', done => {
        done()
    })
})