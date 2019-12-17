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

source utils/version_utils.sh
source source.env

DIST_UI_INCLUDE_DIRECTORY_NAME="dist-forseti-visualizer-ui"
VERSION=$(cat VERSION)
NEW_VERSION=$(increment_version $VERSION 2) # bump minor minor version

# remove contents from $DIST_UI_INCLUDE_DIRECTORY_NAME
rm -rf ../forseti-api/$DIST_UI_INCLUDE_DIRECTORY_NAME

# execute a new build
cd ../forseti-visualizer-ui/
npm run build

# return
cd ../infrastructure/

# copy contents
cp -R ../forseti-visualizer-ui/dist ../forseti-api/$DIST_UI_INCLUDE_DIRECTORY_NAME

docker build -f ../forseti-api/Dockerfile -t gcr.io/$PROJECT_ID/forseti-visualizer:$VERSION ../forseti-api
docker build -f ../forseti-api/Dockerfile -t gcr.io/$PROJECT_ID/forseti-visualizer:latest ../forseti-api

docker push gcr.io/$PROJECT_ID/forseti-visualizer:$VERSION
docker push gcr.io/$PROJECT_ID/forseti-visualizer:latest

echo $VERSION
echo $NEW_VERSION > VERSION


IMAGE_NAME=$(gcloud container images list --project $PROJECT_ID | grep "forseti-visualizer")
echo $IMAGE_NAME
gcloud container images list-tags $IMAGE_NAME --project $PROJECT_ID
