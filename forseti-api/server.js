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

'use strict';

// express 4.0
const express = require('express');

import api from './server/api';
import config from './server/config.json';

// setup app
const app = express();
app.set('view engine', 'pug');
app.use(express.static('public')); // images,css,etc.

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Override static assets to use public
console.log(__dirname);
const { resolve } = require('path')
// const publicPath = resolve(__dirname, '../forseti-visualization-ui/dist')
const publicPath = resolve(__dirname, 'dist-forseti-visualization-ui')
const staticConf = { maxAge: '1y', etag: false }
app.use(express.static(publicPath, staticConf))

// set up /api routes
app.use('/api', api({
  config
}));

// set up / main route
app.get('/', (req, res) => {
  res.render('index', {
    title: `Hello World`
  });
});

// test routes
app.get('/home', function (req, res) {
  res.send('GET: ' + req.url);
});

app.post('/home', function (req, res) {
  res.send('POST: ' + req.url);
});




/* AUTH */

const uuid = require('uuid/v4')
const session = require('express-session');
const MemcachedStore = require('connect-memjs')(session);
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');


// [START session]
// Configure the session and session storage.
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.SECRET,
  signed: true
};

// In production use the Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config['NODE_ENV'] === 'production' && config['MEMCACHE_URL']) {
  if (config['MEMCACHE_USERNAME'] && config['MEMCACHE_PASSWORD']) {
    sessionConfig.store = new MemcachedStore({
      servers: [config['MEMCACHE_URL']],
      username: config['MEMCACHE_USERNAME'],
      password: config['MEMCACHE_PASSWORD']});
  } else {
    sessionConfig.store = new MemcachedStore({
      servers: [config['MEMCACHE_URL']]
    });
  }
}

app.use(session(sessionConfig));
// [END session]

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// app.use(session({
//   genid: (req) => {
//     console.log('Inside session middleware genid function', req.session)
//     console.log(`Request object sessionID from client: ${req.sessionID}`)
//     return uuid() // use UUIDs for session IDs
//   },
//   store: new FileStore(),
//   secret: 'super secret',
//   resave: false,
//   saveUninitialized: true
// }))

app.use(passport.initialize());
app.use(passport.session());
app.use(require('./server/services/oauth2').router);

/* END AUTH */



// initialize app
app.listen(config.port, config.host);
console.log(`Running on http://${config.host}:${config.port}`);