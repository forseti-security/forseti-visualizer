#!/bin/sh
SA="forseti-server-gcp-4ebc72af@devops-shared-vpc.iam.gserviceaccount.com"
gcloud iam service-accounts keys create sa-key.json --iam-account=$SA
export GOOGLE_APPLICATION_CREDENTIALS="sa-key.json"

node main.js

gcloud auth revoke

PRIVATE_KEY_ID=$(cat sa-key.json | jq -r .private_key_id)
gcloud iam service-accounts keys delete $PRIVATE_KEY_ID --iam-account=$SA

gcloud config set account garrettwong@gwongcloud.com