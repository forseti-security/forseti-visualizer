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

class MySQLDatabaseConnection {
    constructor(host, user, password, database) {
        this.initializeConnection(host, user, password, database);
    }

    initializeConnection(host, user, password, database) {
        const mysql = require('mysql');

        let connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database
        });

        connection.connect(function (err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
        });

        connection.on('error', (err) => {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                this.initializeConnection(host, user, password, database); // lost due to either server restart, or a
            } else { // connnection idle timeout (the wait_timeout
                throw err; // server variable configures this)
            }
        });

        this.connection = connection;
    }

    getActiveConnection() {
        return this.connection;
    }

    /*
        @param sql - string
        @param callback - function(error, results, fields) {}
     */
    query(sql, callback) {
        return this.connection.query(sql, callback);
    }

    end() {
        this.connection.end();
    }
}

export default MySQLDatabaseConnection;