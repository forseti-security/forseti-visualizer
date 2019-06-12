#!/bin/sh

mysql -uroot -p -h $CLOUDSQL_HOSTNAME --ssl-ca=./certs/server-ca.pem --ssl-cert=./certs/client-cert.pem --ssl-key=./certs/client-key.pem  
