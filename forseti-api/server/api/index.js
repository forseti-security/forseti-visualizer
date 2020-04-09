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

import {
	version
} from '../../package.json';
import {
	Router
} from 'express';
import forseti from './forseti';
import user from './user';

export default ({
	config,
	db
}) => {
	let api = Router();

	// mount resources
	api.use('/forseti', forseti({
		config,
		db
	}));

	// mount resources
	api.use('/user', user({
		config,
		db
	}));


	



	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		console.log(req.session);

		// res.json({
		// 	version
		// });

		let connection = new Telnet();

		if (process.env['CLOUDSQL_HOSTNAME'] === '') {
			res.render('error')
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
				renderIndex(res, true);
			}, function (error) {
				console.log('Not connected to Cloud SQL', error);
				renderIndex(res, false);
			})
			.catch(function (error) {
				// handle the throw (timeout)
				console.log('Not connected to Cloud SQL', error);
				renderIndex(res, false);
			});
	});

	return api;
}