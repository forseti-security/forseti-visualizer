# forseti-visualizer

* A visualization solution with Forseti Integration to enable customers to better understand their GCP Organizational Structure, while communicating details around policy policy adherence through identification of violations.  

## Overview

* This solution has a frontend and backend component.  
* The frontend, "forseti-visualizer-ui/" and the backend, "forseti-api/" will need to be run concurrently.  
* The frontend is configured is use port 8081, while the backend runs on port 8080.  

## Pre-Requisites

* node.js - (Solution using v10.0.0)
* [vue-cli](https://cli.vuejs.org/guide/installation.html)

## Deployment

```bash
# end-to-end deployment script
# docker builds and pushes the 3 images
# creates a GCE VM with a startup script that will pull all three images down and use the docker run command to run each
./deploy_all.sh
```

### Current Steps

1. npm test
2. gcloud builds submit --config cloudbuild.yaml #mycloud.com
3. gcloud container clusters get-credentials cl-cluster
4. kubectl get pods
5. kubectl delete pod $POD_NAME
6. wait 5 minutes


## Getting Started - Local Development (forseti-api)

* Create a source.env file

```bash
cd forseti-api/
cat > source.env << EOF
export CLOUDSQL_HOSTNAME="[IP HERE]"
export CLOUDSQL_USERNAME="[YOUR_USER_HERE]"
export CLOUDSQL_PASSWORD="[YOUR_PASSWORD_HERE]"
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="[VM_IP]:[GRPC_PORT]"
export FORSETI_DATA_MODEL_HANDLE="[DATA_MODEL_HANDLE_HASH:21254f1de747879237a95cb552e80844]"
EOF
```

* Navigate to Directory, Install packages and Run

```bash
npm install

# served on localhost:8080/
source source.env
npm start
```

## Getting Started - Local Development (forseti-visualizer-ui)

* Navigate to Directory, Install packages and run

```bash
# served on localhost:8081
cd forseti-visualizer-ui/
npm install
npm start
```

## References

* [Medium](https://medium.com/p/23<F8>70a4b048cd)
