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

DEPLOYMENT="forseti-visualization"
PROJECT_ID="australia-hack-6-7dc4"

export PROJECT_ID="$(gcloud config get-value project -q)"

export IMAGE_NAME="forseti-visualization"

docker build -t gcr.io/${PROJECT_ID}/$IMAGE_NAME .



# kubectl run $DEPLOYMENT --image=gcr.io/${PROJECT_ID}/forseti-visualization:v1 --port 8081

kubectl create -f deployment.yml --save-config

# kubectl create -f rbac-config.yaml

kubectl get pods

# push the udated deployment
kubectl apply -f deployment.yml 

# push to gcr.io (docker) push gcr.io/${PROJECT_ID}/${APP_NAME}:latest)
docker push gcr.io/${PROJECT_ID}/${APP_NAME}:latest

# docker build -f ../forseti-api/Dockerfile -t gcr.io/australia-hack-6-7dc4/forsetiapi .

# docker build -t gcr.io/australia-hack-6-7dc4/forsetiapi .
# docker push gcr.io/australia-hack-6-7dc4/forsetiapi:v2
# kubectl run forsetiapi --image=gcr.io/australia-hack-6-7dc4/forsetiapi --port 8080
# kubectl expose deployment forsetiapi --type=LoadBalancer --port 80 --target-port 8080

# docker build -t gcr.io/australia-hack-6-7dc4/forseti-visualization:v2 .
# docker push gcr.io/australia-hack-6-7dc4/forseti-visualization:v2

# kubectl run forseti-visualization --image=gcr.io/australia-hack-6-7dc4/forseti-visualization:v2 --port 8081
# kubectl expose deployment forseti-visualization --type=LoadBalancer --port 80 --target-port 8081
# kubectl edit deployment forseti-visualization