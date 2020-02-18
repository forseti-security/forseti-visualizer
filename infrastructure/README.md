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
cd ../forseti-api
npm install

# API:
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com

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

- [Static IP on GKE](https://cloud.google.com/kubernetes-engine/docs/tutorials/configuring-domain-name-static-ip)
- [Firewalls](https://cloud.google.com/solutions/prep-kubernetes-engine-for-prod#firewalling)
