#!/bin/bash

# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

source source.env

GCR_IMAGE_NAME="gcr.io/$PROJECT_ID/forseti-visualizer"
ZONE="us-central1-a"
VM_NAME="forseti-visualizer-gce"
ENV_VARS="API_HOST=0.0.0.0,API_PORT=8080,CLOUDSQL_HOSTNAME=$CLOUDSQL_HOSTNAME,CLOUDSQL_USERNAME=$CLOUDSQL_USERNAME,CLOUDSQL_PASSWORD=$CLOUDSQL_PASSWORD,CLOUDSQL_SCHEMA=$CLOUDSQL_SCHEMA"

gcloud iam service-accounts create compute-engine

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:compute-engine@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/storage.objectViewer

gcloud compute firewall-rules create public-ingress-http \
    --project=$PROJECT_ID \
    --description="Open HTTP related ports" \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:443,tcp:8080 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=http-server

gcloud beta compute \
    --project=$PROJECT_ID \
    instances create-with-container $VM_NAME \
    --zone=$ZONE \
    --machine-type=n1-standard-1 \
    --subnet=default \
    --network-tier=PREMIUM \
    --metadata=google-logging-enabled=true \
    --maintenance-policy=MIGRATE \
    --service-account=$SERVICE_ACCOUNT \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=http-server \
    --image-family=cos-stable \
    --image-project=cos-cloud \
    --boot-disk-size=10GB \
    --boot-disk-type=pd-standard \
    --boot-disk-device-name=$VM_NAME \
    --container-image=$GCR_IMAGE_NAME \
    --container-restart-policy=always \
    --container-env=$ENV_VARS \
    --labels=container-vm=cos-stable \
    --service-account=compute-engine@$PROJECT_ID.iam.gserviceaccount.com
