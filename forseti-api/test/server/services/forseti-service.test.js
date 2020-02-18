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

import ForsetiService from '../../../server/services/forseti-service.js'


describe('forseti-service.js', () => {
    let sut
    let initEventSpy
    const OLD_ENV = process.env

    beforeEach(() => {
        sut = ForsetiService

        initEventSpy = sinon.spy()
        initEventSpy()

        // set ForsetiService env varsiables
        process.env = {
            CLOUDSQL_HOSTNAME: '127.0.0.1',
            CLOUDSQL_USERNAME: 'root',
            CLOUDSQL_PASSWORD: '',
            CLOUDSQL_SCHEMA: 'forseti_security'
        }
    })

    afterEach(() => {
        process.env = OLD_ENV;
    });

    it('should have been called', done => {
        assert.isTrue(initEventSpy.called);
        // console.log(sut.getResourcesJson())
        done()
    })

    it('get resources should call callback', done => {
        let cb = function (error, results) {
            // console.log(error, results)
            assert.isNull(error)
            done()
        }
        sut.getResources(null, cb)
    })

    // it('getExplainIdentity should be called', done => {
    //     sut.getExplainIdentity('user/garrettwong@gwongcloud.com', function (error, results) {
    //         console.log(error, results)
    //     })
    // })
})