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

import http from 'http'
import {
    assert
} from 'chai'

import server from '../server.js';

describe('Server.js', () => {

    it('should return a status code of success', done => {
        http.get('http://0.0.0.0:8080', res => {
            assert.equal(200, res.statusCode);
            done();
        });
    });


    it('should have an api endpoint', done => {
        http.get('http://0.0.0.0:8080/api', res => {
            assert.equal(200, res.statusCode);
            done()
        });
    });

    it('should have an api endpoint that returns version', done => {
        http.get('http://0.0.0.0:8080/api/version', res => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    assert.isNotNull(parsedData.version)
                    done();
                } catch (e) {
                    console.error(e.message);
                }
            });
        });
    });

    // Forseti Server Tests (need Cloud SQL Proxy enabled and need to set ENV vars)
    it('should return forseti assets', done => {
        http.get('http://0.0.0.0:8080/api/forseti', res => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    assert.isNotNull(parsedData.version)
                    done();
                } catch (e) {
                    console.error(e.message);

                    // TODO : change this to a mock api call / ensure db is up
                    done(); 
                }
            });
        });
    });
})