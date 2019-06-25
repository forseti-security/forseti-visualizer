#!/bin/bash -eu
#
# Copyright 2019 Google LLC
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

GCR_IMAGE_NAME="gcr.io/forseti-security-1e88/forseti-visualizer" # must be escaped
PROJECT_ID="forseti-security-1e88"
ZONE="us-central1-a"
# REGION="us-west1"
VM_NAME="forseti-visualizer-vm"
ENV_VARS="CLOUDSQL_HOSTNAME=$CLOUDSQL_HOSTNAME,CLOUDSQL_USERNAME=$CLOUDSQL_USERNAME,CLOUDSQL_PASSWORD=$CLOUDSQL_PASSWORD,CLOUDSQL_SCHEMA=$CLOUDSQL_SCHEMA"

gcloud beta compute \
--project=$PROJECT_ID \
instances create-with-container $VM_NAME \
--zone=$ZONE \
--machine-type=n1-standard-1 \
--subnet=default --network-tier=PREMIUM --metadata=google-logging-enabled=true \
--maintenance-policy=MIGRATE --service-account=521541240037-compute@developer.gserviceaccount.com \
--scopes=https://www.googleapis.com/auth/cloud-platform --tags=http-server,https-server --image=cos-stable-74-11895-125-0 \
--image-project=cos-cloud --boot-disk-size=10GB --boot-disk-type=pd-standard --boot-disk-device-name=forseti-visualizer-vm \
--container-image=$GCR_IMAGE_NAME --container-restart-policy=always \
--container-env=$ENV_VARS \
--labels=container-vm=cos-stable-74-11895-125-0