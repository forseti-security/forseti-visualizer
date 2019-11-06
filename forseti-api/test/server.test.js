import http from 'http'
import {
  assert
} from 'chai'

import server from '../server.js';

describe('Server.js', () => {
  
  it('should return a status code of success', done => {
    http.get('http://127.0.0.1:8080', res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should be accessible on 127.0.0.1:8080', done => {
    var util = require("util"),
      http = require("http");

    var options = {
      host: '127.0.0.1',
      port: 8080,
      path: '/'
    };

    var content = '';

    var req = http.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        content += chunk;
      });

      res.on('end', function () {
        util.log(content);

        assert.include(content, 'Please enable it to continue.')
        done()
      });
    });

    req.end();
  })
})