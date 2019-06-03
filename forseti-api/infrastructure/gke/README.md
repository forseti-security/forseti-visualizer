# GKE infrastructure/ scripts README

Multiple bash scripts to help manage yuour GKE deployment

## Assumptions

* You are either using "Legacy Authorization" on the GKE cluster --> GCP Kubernetes Cluster > Edit
* OR, you can run through RBAC, via setting up a tiller service account

```bash
kubectl get deployment forseti-api-deployment -o yaml --export > myapp.yaml
```

## References

* [GKE: Hello-App](https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app)
* [Kubernetes Deployment URL](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.11/#create-21)
* [Generate .yaml file from Kubernetes deployment](https://blog.heptio.com/using-kubectl-to-jumpstart-a-yaml-file-heptioprotip-6f5b8a63a3ea)
* [Kubernetes Deployments](http://kubernetesbyexample.com/deployments/)
* [Kubernetes Controllers and Concepts](https://kubernetes.io/docs/concepts/workloads/controllers/deployment)
* [Creating a Kubernetes Deployment](https://www.mirantis.com/blog/introduction-to-yaml-creating-a-kubernetes-deployment/)
* [Kubernetes Charts](https://github.com/kubernetes/charts/tree/master/stable/)