# Forseti API

The node.js backend for the forseti-visualization project.  

## Introduction

* Serves API content from the forseti_security Cloud SQL database
* Serves API content from GRPC calls to the forseti-server VM

## Pre-Requisites

* Deployed on a VM with firewall access to the Cloud SQL database (expose network traffic from your incoming IP address to your Cloud SQL database)
* Deployed on a VM with firewall access to forseti-server (expose port :50051 on the forseti-server VM)
* Deployed on a VM which can run docker images

To build and deploy the solution from your local system, please ensure you have the following:

* docker 18.05+
* (OPTIONAL): kubectl 1.9.7++

## Getting Started - Development Locally

To get started, you will need to create a local source.env file and source the file.

* Handle requires a Data Model to be created (forseti create model)
* Query the handle using `SELECT handle FROM forseti_security.model order by created_at_datetime desc LIMIT 1;` 

```javascript
cat > source.env << EOF
export CLOUDSQL_HOSTNAME="[IP HERE]"
export CLOUDSQL_USERNAME="[YOUR_CLOUDSQL_USER_HERE]"
export CLOUDSQL_PASSWORD="[YOUR_CLOUDSQL_PASSWORD_HERE]"
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="[VM_IP]:[GRPC_PORT]"
export FORSETI_DATA_MODEL_HANDLE="[DATA_MODEL_HANDLE_HASH:21254f1de747879237a95cb552e80844]"
EOF

source source.env
npm install
npm start

# the forseti-api server runs on localhost port 8080
open http://localhost:8080
```

## Deployment - Docker

To get started with Docker, you will need to create a local dockersource.env file with the following content.  Here, take note, not to include double quotes.

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
./infrastructure/docker_run.sh
```

## Remote Deployment - GCE VM

To get started with GCE, we'll deploy the Docker Image the VM.

```bash

IMAGE_NAME="forseti-api"
PROJECT_ID="$(gcloud config get-value project -q)"
docker build -t gcr.io/${PROJECT_ID}/$IMAGE_NAME:latest .
docker push gcr.io/${PROJECT_ID}/${APP_NAME}:latest


gcloud compute ...

```


## Remote Deployment - GKE Cluster

To get started with GKE, we'll take the local Docker Image one step further.

_NOTE_: You will need to configure the proper Firewall Rules to enable traffic.  2 FW rules are noted above.

```bash
# if you need to login (gcloud auth login) 

# 1. Create our GKE cluster
CLUSTER_NAME="forseti-api-cluster"
./infrastructure/gke/create_cluster.sh $CLUSTER_NAME
./infrastructure/gke/get_credentials.sh $CLUSTER_NAME

./infrastructure/deploy_gke.sh $CLUSTER_NAME
```

## Contributing

1. Add your name to the CONTRIBUTORS.md file
2. Run `git branch dev`
3. Run 'git checkout dev`

```bash
git add .
git commit -m "commit notes"
git push -u origin dev
```

## Opinions

* [.jshintrc](https://stackoverflow.com/questions/36318895/vs-code-with-es6) - JS formatting hints

## References

* [Nodejs Docker Webapp](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [Hello App](https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app)

### Deployment References

```bash
docker images
docker run -p 49160:8080 -d garrettwong/nodedocker
docker ps # get a list of the $CONTAINER_IDs that are currently running
# for debugging via /bin/bash from a container
docker exec -i -t $CONTAINER_ID /bin/bash
# for viewing docker logs from a container
docker logs $CONTAINER_ID

open localhost:49160
```