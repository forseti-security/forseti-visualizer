# Forseti API

The node.js backend for the forseti-visualizer project.  Forseti API serves content from the forseti_security Cloud SQL database and the GRPC server on the forseti-server vm.

## Pre-Requisites

* The hosted solution must have a route to the Cloud SQL database.
* The hosted solution must have access to the forseti-server via GRPC (port 50051)

To build and deploy the solution from your local system, please ensure you have the following:

* docker 18.05+
* kubectl 1.9.7++

## Getting Started - Development Locally

To get started, you will need to create a local source.env file and source the file.

* Handle requires a Data Model to be created (forseti create model)
* Query the handle using `SELECT handle FROM forseti_security.model order by created_at_datetime desc LIMIT 1;`

```bash
cat > source.env << EOF
export CLOUDSQL_HOSTNAME="[IP HERE]"
export CLOUDSQL_USERNAME="[YOUR_CLOUDSQL_USER_HERE]"
export CLOUDSQL_PASSWORD="[YOUR_CLOUDSQL_PASSWORD_HERE]"
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="[VM_IP]:[GRPC_PORT]"
export FORSETI_DATA_MODEL_HANDLE="[DATA_MODEL_HANDLE_HASH:21254f1de747879237a95cb552e80844]"
EOF

# create auth config.json for authenticating
# refer to instructions on setting up project authentication
cat > server/config.json << EOF
{
  "host": "0.0.0.0",
  "port": 8080,
  "bodyLimit": "100kb",
  "corsHeaders": ["Link"],  
  "GCLOUD_PROJECT": "[PROJECT_ID]",
  "DATA_BACKEND": "datastore",  
  "NODE_ENV": "",
  "OAUTH2_CLIENT_ID": "[SERVICE_ACCOUNT_NAME]@apps.googleusercontent.com",
  "OAUTH2_CLIENT_SECRET": "[CLIENT_SECRET]",
  "OAUTH2_CALLBACK": "http://localhost:8080/auth/google/callback",
  
  "SECRET": "[SECRET]"
}
EOF


npm install
source source.env
# the forseti-api server runs on localhost port 8080
npm start
```

## Deployment - Docker

To get started with Docker, you will need to create a local dockersource.env file with the following content.  (For Docker, do not use double quotes)

```bash
cat > dockersource.env << EOF
CLOUDSQL_HOSTNAME=[IP_HERE]
CLOUDSQL_USERNAME=[YOUR_CLOUDSQL_USER_HERE]
CLOUDSQL_PASSWORD=[YOUR_CLOUDSQL_PASSWORD_HERE]
CLOUDSQL_SCHEMA=forseti_security
FORSETI_SERVER_VM_CHANNEL=[VM_IP]:[GRPC_PORT]
FORSETI_DATA_MODEL_HANDLE=[DATA_MODEL_HANDLE_HASH:21254f1de747879237a95cb552e80844]
EOF

# this script will run a docker build and a docker run
IMAGE_NAME="forseti-api"
SOURCE_FILE="dockersource.env"
export PROJECT_ID="$(gcloud config get-value project -q)"
docker run --env-file $SOURCE_FILE --rm -d -p 8080:8080 gcr.io/$PROJECT_ID/$IMAGE_NAME
```

## Opinions

* [.jshintrc](https://stackoverflow.com/questions/36318895/vs-code-with-es6) - JS formatting hints
