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

gcloud beta compute \
    --project=$PROJECT_ID \
    instances delete $VM_NAME \
    --zone=$ZONE \
    --quiet

gcloud projects remove-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:compute-engine@$PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/storage.objectViewer

gcloud iam service-accounts delete \
    compute-engine@$PROJECT_ID.iam.gserviceaccount.com \
    --quiet

gcloud compute firewall-rules delete public-ingress-http --quiet
