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

var express = require('express');

var api = require('./server/api');

// Constants
var PORT = 8080;
var HOST = '0.0.0.0';

// App
var app = express();
app.set('view engine', 'pug');
app.use(express.static('public')); // images,css,etc.


app.get('/', function (req, res) {
  var name = 'Test';
  res.render('index', {
    title: 'Hi ' + name
  });
});

app.get('/home', function (req, res) {
  res.send('GET: ' + req.url);
});

app.post('/home', function (req, res) {
  res.send('POST: ' + req.url);
});

app.get('/q', function (req, res) {
  var name = getRandomName();
  res.send('Hello ' + name);
});

app.get('/q/:id', function (req, res) {
  var id = req.params.id;
  res.send('Hello Q' + id);
});

app.listen(PORT, HOST);
console.log('Running on http://' + HOST + ':' + PORT);
//# sourceMappingURL=server.js.map