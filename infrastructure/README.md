# Infrastructure

Multiple deployment pipelines for Forseti Visualizer:

1. Docker on GCE with COS
2. Docker on GKE with COS
3. Docker on Cloud Run

## Overview

Each script requires a docker image to be pre-built and pushed to the local gcr.io repository.

## Getting Started

```bash
# Prerequisite: Ensure application is built and runs locally
cd forseti-visualizer-ui/
npm install
npm run build
cp -R dist ../forseti-api/dist-forseti-visualizer-ui
cd ../forseti-api
npm install

# API:
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com

# create a file named "source.env"
cat > source.env << EOF
export CLOUDSQL_HOSTNAME="1.2.34.56"
export CLOUDSQL_USERNAME="user"
export CLOUDSQL_PASSWORD="password"
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="1.2.3.4:50051"
export FORSETI_DATA_MODEL_HANDLE="abcdaa3a5bc9fd9acfaf50fdd3620534"
EOF

# build docker images
./build-images.sh

# replace the variable(s) (PROJECT_ID, REGION) at the top of the deployment file and then run to deploy the image
./deployments/deploy-gke.sh
./deployments/deploy-gce.sh
./deployments/deploy-cloudrun.sh
```

## Pipeline

1. Build Image
2. Push Image
3. Create Deployment Resource (optional - otherwise we will need to provide the target resource values)
4. Deploy Image

## References

* [Static IP on GKE](https://cloud.google.com/kubernetes-engine/docs/tutorials/configuring-domain-name-static-ip)
* [Firewalls](https://cloud.google.com/solutions/prep-kubernetes-engine-for-prod#firewalling)
