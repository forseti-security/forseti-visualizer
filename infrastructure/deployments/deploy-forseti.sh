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

mkdir temp-forseti/ && cd temp-forseti/
wget https://releases.hashicorp.com/terraform/0.12.23/terraform_0.12.23_darwin_amd64.zip
unzip terraform_0.12.23_darwin_amd64.zip
chmod +x terraform
./terraform version

# if you are not the SuperAdmin, update this to the Super Administrator
USER=$(gcloud config get-value account) 
DOMAIN=$(gcloud organizations list --format="value(displayName)")
PROJECT_ID=$(gcloud config get-value project)
ORG_ID=$(gcloud organizations list --format="value(name)")

cat > forseti.tf << EOF
module "forseti" {
    source  = "terraform-google-modules/forseti/google"
    version = "~> 5.1"

    gsuite_admin_email = "$USER"
    domain             = "$DOMAIN"
    project_id         = "$PROJECT_ID"
    org_id             = "$ORG_ID"
}
EOF

./terraform init
./terraform plan
./terraform apply --auto-approve

cat > teardown.sh << EOF
./terraform destroy --auto-approve
EOF
chmod +x teardown.sh

# clean up 
# cd ..
# rm -rf temp-forseti/