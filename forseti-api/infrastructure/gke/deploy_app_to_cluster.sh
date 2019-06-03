#!/bin/sh
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



## usage: ./deploy_app_to_cluster.sh

export IMAGE="forseti-api"
export DEPLOYMENT="forseti-api-deployment"
export PROJECT_ID="$(gcloud config get-value project -q)"

kubectl run $DEPLOYMENT --image=gcr.io/${PROJECT_ID}/$IMAGE --port 8080