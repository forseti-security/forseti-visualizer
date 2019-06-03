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



## pre-requisites: 
##      ./infrastructure/gke/create_cluster.sh $CLUSTER_NAME
##      ./infrastructure/gke/get_credentials.sh $CLUSTER_NAME

## usage: ./infrastructure/gke/deploy_new_version.sh $CLUSTER_NAME

export APP_NAME=$1
export DEPLOYMENT_NAME="$1-deployment"

export PROJECT_ID="$(gcloud config get-value project -q)"
export PATH_TO_VERSION_FILE="infrastructure/gke/VERSION"
export VERSION=$(cat $PATH_TO_VERSION_FILE)

# build docker image
docker build -t gcr.io/${PROJECT_ID}/${APP_NAME}:${VERSION} .

# push docker image to gcr.io in PROJECT
gcloud docker -- push gcr.io/${PROJECT_ID}/${APP_NAME}:${VERSION}

# set GKE image deployment
echo "kubectl set image deployment/${DEPLOYMENT_NAME} ${DEPLOYMENT_NAME}=gcr.io/${PROJECT_ID}/${APP_NAME}:${VERSION}"
kubectl set image deployment/${DEPLOYMENT_NAME} ${DEPLOYMENT_NAME}=gcr.io/${PROJECT_ID}/${APP_NAME}:${VERSION}

function increment_version() {
    VERSION=$(cat $PATH_TO_VERSION_FILE)
    VERSION_NUMBER=$(echo $VERSION | sed 's/v//g')
    NEW_VERSION_NUMBER=$((VERSION_NUMBER+1))
    echo v$NEW_VERSION_NUMBER > $PATH_TO_VERSION_FILE

    echo "incremented version from" $VERSION "to" $NEW_VERSION_NUMBER
}


# increment FILE VERSION
increment_version