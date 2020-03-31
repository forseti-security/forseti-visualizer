# Forseti API

The node.js backend for the forseti-visualizer project. Forseti API serves content from the forseti_security Cloud SQL database and the GRPC server on the forseti-server vm.

## Pre-Requisites

- Follow the instructions FIRST on the forseti-visualizer-ui/README.md.
- A database connection using [Cloud SQL Proxy (recommended)](#Cloud-SQL-Proxy).
- If using IAM Explainer, the hosted solution must have access to the forseti-server GCE VM via a Firewall enabling GRPC traffic (port 50051)

To build and deploy the solution from your local system, please ensure you have the following:

- docker 18.05+
- kubectl 1.9.7++

## Getting Started - Development Locally

To get started, you will need to create a local source.env file and source the file.

- Handle requires a Data Model to be created (forseti create model)
- Query the handle using `SELECT handle FROM forseti_security.model order by created_at_datetime desc LIMIT 1;`

```bash
# create source.env file.  Replace the variable values with the correct values.  You'll likely need to change `CLOUDSQL_PASSWORD`, `PROJECT_ID` (`FORSETI_SERVER_VM_CHANNEL` and `FORSETI_DATA_MODEL_HANDLE` are required ONLY for IAM Explain functionality).
cat > source.env << EOF
export API_HOST="0.0.0.0"
export API_PORT="8080"
export CLOUDSQL_HOSTNAME="127.0.0.1"
export CLOUDSQL_USERNAME="root"
export CLOUDSQL_PASSWORD=""
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="0.0.0.0:50051"
export FORSETI_DATA_MODEL_HANDLE="21254f1de747879237a95cb552e80844"
export PROJECT_ID="forsetivisualizer"
EOF

npm install
source source.env
# the forseti-api server runs on localhost port 8080
npm start
```

## Deployment - Docker

`IF you are using Docker...`, you will need to create a local dockersource.env file with the following content. (Note: Do not include the double quotes)

```bash
cat > dockersource.env << EOF
API_HOST=0.0.0.0
API_PORT=8080
CLOUDSQL_HOSTNAME=127.0.0.1
CLOUDSQL_USERNAME=root
CLOUDSQL_PASSWORD=
CLOUDSQL_SCHEMA=forseti_security
FORSETI_SERVER_VM_CHANNEL=0.0.0.0:50051
FORSETI_DATA_MODEL_HANDLE=21254f1de747879237a95cb552e80844
PROJECT_ID=forseti-visualizer
EOF

# this script will run a docker build and a docker run
IMAGE_NAME="forseti-visualizer"
SOURCE_FILE="dockersource.env"
export PROJECT_ID="$(gcloud config get-value project -q)"
docker run --env-file $SOURCE_FILE --rm -d -p 8080:8080 -name forsetivisualizer gcr.io/$PROJECT_ID/$IMAGE_NAME
```

## References

- [.jshintrc](https://stackoverflow.com/questions/36318895/vs-code-with-es6) - JS formatting hints

### Cloud SQL Proxy

- [Reference](https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install)

```bash
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy

INSTANCE_CONNECTION_NAME="forseti-security-1e88:us-central1:forseti-server-db-586f404"
./cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:3306
```
