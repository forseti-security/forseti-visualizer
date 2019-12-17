# Forseti Visualizer

![Forseti Visualizer GIF](.assets/forseti-visualizer-example.gif)

Forseti Visualizer provides a visualization solution, based on [Forseti Security's](https://github.com/forseti-security/forseti-security) Inventorying and Violation modules.  Forseti Visualizer attempts to enable Google Cloud Platform users to better understand their GCP Organization Structure, while providing insights into policy adherence through identification of violations.

## Overview

This solution contains a frontend (forseti-visualizer-ui) and backend (forseti-api) component.  The frontend defaults to running on port 8081, while the backend runs on port 8080.  

### Frontend (forseti-visualizer-ui)

Written in:

* [node.js v10.0.0+](https://nodejs.org/en/)
* [vue-cli](https://cli.vuejs.org/guide/installation.html)
* [d3v5](https://d3js.org/)

### Backend (forseti-api)

Written in:

* [express.js v4.16.1+](https://expressjs.com/)

## Getting Started (Local Development)

### forseti-visualizer-ui

Navigate to the forseti-visualizer-ui/ directory, install npm packages.

```bash
cd forseti-visualizer-ui/

# install the packages
npm install

# build the application (FYI: This also copies to dist to the ../forseti-api/ folder)
npm run build

# for developing just the UI - app is served on :8081
# npm start
```

### forseti-api

Navigate to forseti-api/.  Create a `source.env` file, which will should be sourced to set the appropriate ENV variables prior to runtime.  You will need to populate the fields below.  The HANDLE and CHANNEL are leveraged for the IAM Explain functionality.

```bash
# navigate to forseti-api
cd forseti-api/

# create source.env file.  Replace the variable values with the correct values.  You'll likely need to change `CLOUDSQL_PASSWORD`, `PROJECT_ID` (`FORSETI_SERVER_VM_CHANNEL` and `FORSETI_DATA_MODEL_HANDLE` are required ONLY for IAM Explain functionality).  
cat > source.env << EOF
export API_HOST="0.0.0.0"
export API_PORT="8080"
export CLOUDSQL_HOSTNAME="127.0.0.1"
export CLOUDSQL_USERNAME="root"
export CLOUDSQL_PASSWORD=""
export CLOUDSQL_SCHEMA="forseti_security"
export FORSETI_SERVER_VM_CHANNEL="0.0.0.0:50051"
export FORSETI_DATA_MODEL_HANDLE="21254f1de747879237a95cb552e80844"
export PROJECT_ID="forseti-visualizer"
EOF
```

While still in the "forseti-api/" directory:

```bash
# install npm packages
npm install

# if any vulnerabilities from JS package versions, then run
npm audit fix

# source environment variables
source source.env

# run the app: the APP can be accessed on PORT 8080
npm start
```

## Solution Deployment

There are a few provided solution deployment pipelines.  First, you need to build the image.  Replace the variables at the top of the build-images.sh file with those from your environment.

1. cd infrastructure/
2. ./build-images.sh

For each of the scripts, replace the variables at the top of each file with those from your environment.

1. infrastructure/deployments/deploy-gce.sh
2. infrastructure/deployments/deploy-gke.sh
3. infrastructure/deployments/deploy-cloudrun.sh

## References

* [Google Cloud Blog](https://cloud.google.com/blog/products/identity-security/understand-gcp-organization-resource-hierarchies-with-forseti-visualizer)
* [Medium](https://medium.com/google-cloud/visualize-gcp-architecture-using-forseti-2-0-and-d3-js-ffc8fdf59450)
