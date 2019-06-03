# Forseti ViZ UI

## Intro

The purpose of this application is to:

* Enable GCP organizations to understand and effectively communicate policies, identity and access management, violations, and resource management and organization folder structure.
* Provide an interactive and visual user experience integrated with Forseti to quickly answer complex questions.

## Technical Overview

* This application serves the frontend configuration which is written in D3.js and Vue.js using Vuetify.  This application uses babel-transpiler, therefore supporting ES6.

## Getting Started

```bash
## the application will be served on port :8081
cd forseti-visualization-ui/
npm install
npm start
```

## Deployment

* Refer to the ../infrastructure/ folder at the root of the project for building the docker images and deployment to GCE/GKE.

```bash
gcloud builds submit --config cloudbuild.yaml
export CLUSTER_NAME="forseti-visualization-cluster"
export ZONE="us-west1-a"
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE
kubectl get pods
kubectl delete pod $POD_NAME
```

## Reference: Testing

* [Test Article](https://alexjover.com/blog/write-the-first-vue-js-component-unit-test-in-jest/)

### Dependencies

* npm i -D jest vue-jest babel-jest
* npm i -D vue-test-utils
* jest entry in package.json
* tests in ./test/ folder

### Config

```bash
export VUE_CLI_BABEL_TARGET_NODE=true
export VUE_CLI_BABEL_TRANSPILE_MODULES=true
./node_modules/jest/bin/jest.js --clearCache
node --inspect-brk ./node_modules/jest/bin/jest.js -i
```