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
import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.should();

import forseti from '../../../server/api/forseti.js';

describe('forseti.js', () => {

  it('should get records', done => {
    console.log(forseti)
    done()
    
    // chai.request(forseti)
    //   .get('/')
    //   .end((err, res) => {
    //     console.log(err, res)
    //     res.should.have.status(200);
    //     res.body.should.be.a('object');
    //     done();
    //   });
  });

})