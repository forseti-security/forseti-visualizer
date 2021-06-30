#!/bin/bash 
#
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

gcloud services enable compute container --project $PROJECT_ID

GCR_IMAGE_NAME="gcr.io\/$PROJECT_ID\/forseti-visualizer" # must be escaped
REGION="us-central1"
# REGION="us-west1"
APP_NAME="$PROJECT_ID-app"

ENDPOINTS_IP="$APP_NAME-endpoints-ip"
STATIC_IP=$(gcloud compute addresses list --format="get(address)" --filter="name=$ENDPOINTS_IP" --project $PROJECT_ID)

if [ -z $STATIC_IP ];
then
    # is unset
    echo "Creating a new address"
    gcloud compute addresses create $ENDPOINTS_IP --region $REGION
    STATIC_IP=$(gcloud compute addresses list --format="get(address)" --filter="name=$ENDPOINTS_IP" --project $PROJECT_ID)
else
    # is set
    echo $STATIC_IP
fi

# cp all templates
rm -rf gke-templates/
mkdir gke-templates/
cp -R cluster-template/templates/* gke-templates/
cd gke-templates/

# MAC: use sed -i '' -e
# LINUX: use sed -i 

if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX

    # replace [GCR-IMAGE]
    sed -i '' "s/\[GCR-IMAGE\]/$GCR_IMAGE_NAME/g" *.yaml

    # replace [MY-PROJECT]
    sed -i '' "s/\[MY-PROJECT\]/$PROJECT_ID/g" *.yaml

    # replace [MY-STATIC-IP]
    sed -i '' "s/\[MY-STATIC-IP\]/$STATIC_IP/g" *.yaml

    # replace [APP-NAME]
    sed -i '' "s/\[APP-NAME\]/$APP_NAME/g" *.yaml
else
    # CloudShell (Linux)

    # replace [GCR-IMAGE]
    sed -i "s/\[GCR-IMAGE\]/$GCR_IMAGE_NAME/g" *.yaml

    # replace [MY-PROJECT]
    sed -i "s/\[MY-PROJECT\]/$PROJECT_ID/g" *.yaml

    # replace [MY-STATIC-IP]
    sed -i "s/\[MY-STATIC-IP\]/$STATIC_IP/g" *.yaml

    # replace [APP-NAME]
    sed -i "s/\[APP-NAME\]/$APP_NAME/g" *.yaml
fi

### DEPLOYMENT PHASE
###     Reference: https://www.qwiklabs.com/focuses/2771?parent=catalog
gcloud endpoints services deploy openapi.yaml

# create cluster service account
gcloud iam service-accounts create kubernetes-engine \
    --project $PROJECT_ID

SERVICE_ACCOUNT_EMAIL=kubernetes-engine@$PROJECT_ID.iam.gserviceaccount.com

# add policy binding
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT_EMAIL \
    --role=roles/storage.objectViewer
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT_EMAIL \
    --role=roles/endpoints.portalAdmin

echo "Creating Cluster"
CLUSTER_NAME=$APP_NAME-gke
gcloud container clusters create $CLUSTER_NAME \
    --region $REGION \
    --num-nodes="1" \
    --project $PROJECT_ID \
    --service-account $SERVICE_ACCOUNT_EMAIL
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION --project $PROJECT_ID

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

# PREVIOUS
helm del --purge cert-manager;
kubectl delete crd \
    certificates.certmanager.k8s.io issuers.certmanager.k8s.io clusterissuers.certmanager.k8s.io;
helm install --name cert-manager --version v0.5.2 \
    --namespace kube-system stable/cert-manager

# NEW
# helm list | grep cert-manager
# kubectl apply --validate=false -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.11/deploy/manifests/00-crds.yaml
# kubectl create namespace cert-manager
# helm repo add jetstack https://charts.jetstack.io
# helm repo update
# helm install \
#   --name cert-manager \
#   --namespace cert-manager \
#   --version v0.11.0 \
#   jetstack/cert-manager

EMAIL=garrettwong@domain.com
cat letsencrypt-issuer.yaml | sed -e "s/email: ''/email: $EMAIL/g" | kubectl apply -f-
kubectl apply -f ingress-tls.yaml

cat > teardown-gke.sh << EOF
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

chmod +x teardown-gke.sh

