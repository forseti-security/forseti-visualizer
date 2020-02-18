#!/bin/sh

PROJECT_ID="forseti-security-1e88"
GCR_IMAGE_NAME="gcr.io\/$PROJECT_ID\/forseti-visualizer" # must be escaped
REGION="us-central1"
# REGION="us-west1"
APP_NAME="$PROJECT_ID-app"

ENDPOINTS_IP="$APP_NAME-endpoints-ip"
STATIC_IP=$(gcloud compute addresses list --format="get(address)" --filter="name=$ENDPOINTS_IP")

if [ -z $STATIC_IP ];
then
    # is unset
    echo "Creating a new address"
    gcloud compute addresses create $ENDPOINTS_IP --region $REGION
    STATIC_IP=$(gcloud compute addresses list --format="get(address)" --filter="name=$ENDPOINTS_IP")
else
    # is set
    echo $STATIC_IP
fi

# cp all templates
cp -R templates/ .

# replace [GCR-IMAGE]
sed -i '' -e "s/\[GCR-IMAGE\]/$GCR_IMAGE_NAME/g" *.yaml

# replace [MY-PROJECT]
sed -i '' -e "s/\[MY-PROJECT\]/$PROJECT_ID/g" *.yaml

# replace [MY-STATIC-IP]
sed -i '' -e "s/\[MY-STATIC-IP\]/$STATIC_IP/g" *.yaml

# replace [APP-NAME]
sed -i '' -e "s/\[APP-NAME\]/$APP_NAME/g" *.yaml


### DEPLOYMENT PHASE
###     Reference: https://www.qwiklabs.com/focuses/2771?parent=catalog
gcloud endpoints services deploy openapi.yaml

CLUSTER_NAME=$APP_NAME-gke
gcloud container clusters create $CLUSTER_NAME --region $REGION --num-nodes="1"
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION

kubectl create clusterrolebinding cluster-admin-binding \
    --clusterrole cluster-admin --user $(gcloud config get-value account)

curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh

kubectl create serviceaccount -n kube-system tiller
kubectl create clusterrolebinding tiller-binding \
    --clusterrole=cluster-admin \
    --serviceaccount kube-system:tiller
helm init --service-account tiller

helm repo update

sleep 30 # wait thirty seconds for pods to initialize

helm install stable/nginx-ingress --set controller.service.loadBalancerIP="$STATIC_IP",rbac.create=true

kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

# setup HTTPS
helm install --name cert-manager --version v0.3.2 \
    --namespace kube-system stable/cert-manager
EMAIL=garrettwong@gwongcloud.com
cat letsencrypt-issuer.yaml | sed -e "s/email: ''/email: $EMAIL/g" | kubectl apply -f-
kubectl apply -f ingress-tls.yaml


# post deployment - copy files to reference the deployment
ARCHIVE_FOLDER=$APP_NAME-$(hexdump -n 4 -e '4/4 "%08X" 1 "\n"' /dev/random | tr '[:upper:]' '[:lower:]')
ARCHIVE_FOLDER=$(echo $ARCHIVE_FOLDER | tr -d '[:space:]')
mkdir $ARCHIVE_FOLDER
cp *.yaml $ARCHIVE_FOLDER

cat > $ARCHIVE_FOLDER/cleanup.sh << EOF
#!/bin/sh
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

gcloud container clusters delete ${CLUSTER_NAME} --region ${REGION} -q
gcloud compute addresses delete ${ENDPOINTS_IP} --region ${REGION} -q
EOF