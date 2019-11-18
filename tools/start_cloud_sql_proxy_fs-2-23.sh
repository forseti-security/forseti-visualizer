#!/bin/sh

INSTANCE_CONNECTION_NAME="fs-2-23:us-west1:forseti-server-db-d4bc233d"

./cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:3306