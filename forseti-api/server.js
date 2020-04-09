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

'use strict';

// express 4.0
const express = require('express');
const Telnet = require('telnet-client');

import {
  version
} from './package.json';
import RenderHelpers from './server/render-helpers';
import api from './server/api';

// setup application
const app = express();
app.set('view engine', 'pug'); // use pug for HTML templating
app.use(express.static('public')); // configure static assets folder, images,css,etc.

// configure default headers
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// extend static assets to use the forseti-visualizer-ui UI code distribution
console.log(__dirname);
const {
  resolve
} = require('path');
const publicPath = resolve(__dirname, 'dist-forseti-visualizer-ui');
const staticConf = {
  maxAge: '1y',
  etag: false
};
app.use(express.static(publicPath, staticConf));



/* API Route Configuration */


// set up the main route '/'
app.get('/', (req, res) => {
  let connection = new Telnet();

  console.log(RenderHelpers);
  if (!process.env['CLOUDSQL_HOSTNAME']) {
    RenderHelpers.renderError(res, version);
    return;
  }

  console.log('Attempting connection to: ' + process.env['CLOUDSQL_HOSTNAME']);

  let params = {
    host: process.env['CLOUDSQL_HOSTNAME'],
    port: 3306,
    negotiationMandatory: false,
    timeout: 5000
  };

  connection.connect(params)
    .then(function (prompt) {
      console.log('Connected to Cloud SQL');
      RenderHelpers.renderIndex(res, version, true);
    }, function (error) {
      console.log('Not connected to Cloud SQL', error);
      RenderHelpers.renderIndex(res, version, false);
    })
    .catch(function (error) {
      // handle the throw (timeout)
      console.log('Not connected to Cloud SQL', error);
      RenderHelpers.renderIndex(res, version, false);
    });
});

// set up the default /api route
app.use('/api', api({}));


// EXPOSE APP using the API_HOST and API_PORT environment variables
app.listen(process.env['API_PORT'], process.env['API_HOST']);
console.log(`Running on http://${process.env['API_HOST']}:${process.env['API_PORT']}`);