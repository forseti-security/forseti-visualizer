const fs = require('fs');
const mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.CLOUDSQL_HOSTNAME,
    port: '3306',
    user: process.env.CLOUDSQL_USERNAME,
    password: process.env.CLOUDSQL_PASSWORD,
    database: process.env.CLOUDSQL_SCHEMA,
    ssl: {
        ca: fs.readFileSync(__dirname + '/certs/server-ca.pem'),
        key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
        cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
    }
});

connection.connect();

connection.query('SELECT * FROM gcp_inventory LIMIT 5', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0]);
});
   
connection.end();
