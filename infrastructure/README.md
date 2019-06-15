# Infrastructure

Multiple deployment pipelines for Forseti Visualizer:

1. Docker on GCE with COS
2. Docker on GKE with COS
3. Docker on Cloud Run

## Overview

* Each script should use Cloud Build to build the docker image and push it to the local gcr.io repository.  

## Pipeline

1. Build Image
2. Push Image
3. Create Deployment Resource (optional - otherwise we will need to provide the target resource values)
4. Deploy Image

## References

* [Static IP on GKE](https://cloud.google.com/kubernetes-engine/docs/tutorials/configuring-domain-name-static-ip)
* [Firewalls](https://cloud.google.com/solutions/prep-kubernetes-engine-for-prod#firewalling)
