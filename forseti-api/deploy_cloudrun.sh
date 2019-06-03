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

#!/bin/sh
PROJECT_ID="forseti-security-new"

# remove content from dist-forseti-visualizer-ui/
rm -rf dist-forseti-visualizer-ui/

# copy contents
cp -R ../forseti-visualizer-ui/dist dist-forseti-visualizer-ui/

docker build -t gcr.io/$PROJECT_ID/forseti-api-x:latest .

docker push gcr.io/$PROJECT_ID/forseti-api-x:latest


gcloud config set run/region us-central1

gcloud beta run deploy \
    --image gcr.io/forseti-security-new/forseti-api-x \
    --update-env-vars CLOUDSQL_HOSTNAME=104.197.52.78,CLOUDSQL_USERNAME=root,CLOUDSQL_PASSWORD=testPassword1,CLOUDSQL_SCHEMA=forseti_security,FORSETI_SERVER_VM_CHANNEL=35.232.32.159:50051,FORSETI_DATA_MODEL_HANDLE=21254f1de747879237a95cb552e80828 \
    --project $PROJECT_ID
