---
id: architecture
title: 1. Architecture
sidebar_position: 2
slug: /architecture
---

# Architecture Overview

Every environment gets its **own CodePipeline**, but all pipelines live in a
single **pipeline account**. Each pipeline watches one branch, synths the CDK
app, self-mutates if the pipeline definition changed, and then deploys an
**infrastructure stage** made of five stacks.

```mermaid
flowchart TB
    subgraph PA["Pipeline Account"]
<<<<<<< HEAD
        SRC["Source\nCodeStar Connection\nGitHub / GitLab"]
=======
        SRC["Source\nCodeStar Connection\nTaingchilim12/eks-cdk-sample"]
>>>>>>> 49a63fe (update content to align with actual source code)
        SYN["Synth\nnpm ci + npm run build + cdk synth"]
        MUT["Self-Mutation\nupdates the pipeline itself"]

        subgraph STAGE["Infra Stage"]
            direction TB
            VPC["VPC Stack"]
<<<<<<< HEAD
            EKS["EKS Stack\ncluster + node group + core addons"]
            ADD["EKS Addons Stack\nCSI drivers + Pod Identity"]
            KAR["Karpenter Stack\nIAM + SQS + EventBridge + Pod Identity"]
            K8S["K8s Stack\nplatform bootstrap: Karpenter Helm, ingress"]
=======
            EKS["EKS Stack\ncluster + bootstrap node group + core addons"]
            ADD["EKS Addons Stack\nCSI drivers + ALB Controller IAM\n+ Pod Identity (all of them)"]
            KAR["Karpenter Stack\nIAM + SQS + EventBridge + Pod Identity"]
            K8S["K8s Stack\nALB Controller -> Karpenter Helm/CRDs\n-> NodeClass/NodePool -> ArgoCD + Ingress NGINX*"]
>>>>>>> 49a63fe (update content to align with actual source code)

            VPC --> EKS
            EKS --> ADD
            EKS --> KAR
            ADD -.independent.- KAR
            KAR --> K8S
        end

        SRC --> SYN --> MUT --> STAGE
    end

    subgraph TARGET["Target AWS Account (dev / stag / prod)"]
        CLUSTER[("Private EKS Cluster")]
    end

    STAGE -->|kubectl provider\nLambda in VPC| CLUSTER
<<<<<<< HEAD
    ARGO["ArgoCD"] -->|GitOps sync| CLUSTER
=======
    ARGO["ArgoCD\n(enabled in dev/stag/prod)"] -->|GitOps sync| CLUSTER
>>>>>>> 49a63fe (update content to align with actual source code)

    style PA fill:#eef4ff,stroke:#4c6ef5
    style TARGET fill:#eefaf0,stroke:#2f9e44
    style STAGE fill:#fff9e6,stroke:#f08c00
```

<<<<<<< HEAD
=======
*\* Ingress NGINX is only enabled in `dev`. In `stag`/`prod`, the ALB
Controller creates AWS Application Load Balancers directly from Kubernetes
`Ingress` resources — there's no in-cluster ingress controller to run.*

>>>>>>> 49a63fe (update content to align with actual source code)
## Reading the diagram

- **Source → Synth → Self-Mutation** is standard CDK Pipelines plumbing. Self
  mutation means if you change the pipeline's own definition (add a stage,
  change approval rules), the pipeline updates *itself* before deploying
  anything else.
- The **Infra Stage** is where your actual workload stacks live. They deploy
  in dependency order (covered in [Stack Dependencies](/stack-dependencies)).
<<<<<<< HEAD
=======
- The **EKS Stack** doesn't just create the cluster — it also creates a
  small **bootstrap node group** (1 spot node, tainted `CriticalAddonsOnly`)
  that exists to run the ALB Controller and Karpenter controller pods
  *before* Karpenter has provisioned any nodes of its own. See
  [Karpenter](/karpenter) for why this matters.
- The **EKS Addons Stack** covers IAM + Pod Identity for *every* addon that
  needs AWS permissions — not just the EBS/EFS CSI drivers, but the AWS Load
  Balancer Controller too.
>>>>>>> 49a63fe (update content to align with actual source code)
- Helm charts and Kubernetes manifests are **not** applied by `kubectl` from
  your laptop or a CI runner with network access to the cluster. They're
  applied by CDK's `kubectl` provider, which runs a **Lambda function inside
  your VPC**, because the cluster's API endpoint is private
  (`endpointAccess: PRIVATE`).
<<<<<<< HEAD
- Once the **K8s Stack** has bootstrapped the platform layer (Karpenter,
  ingress controller), **ArgoCD** takes over for *application* deployments
  using GitOps — the CDK pipeline doesn't touch application manifests.
=======
- Once the **K8s Stack** has bootstrapped the platform layer (ALB Controller,
  Karpenter), **ArgoCD** takes over for *application* deployments using
  GitOps — but only in environments where it's enabled (see
  [Environment Mapping](/environment-mapping)). The CDK pipeline itself
  never touches application manifests, in any environment.
>>>>>>> 49a63fe (update content to align with actual source code)

## Why per-environment pipelines instead of one pipeline with stages?

A common alternative is a single pipeline with `dev → stag → prod` stages in
sequence. This project instead runs **one pipeline per environment**,
triggered by its own branch. That trade-off:

| | Per-environment pipelines (this project) | Single pipeline, sequential stages |
|---|---|---|
| Isolation | Each environment fails independently | A broken stage can block promotion to prod |
| Feature branches | Trivial — spin up a whole pipeline per branch | Awkward — usually needs a separate mechanism |
| Promotion model | Git-based (merge triggers next pipeline) | Pipeline-based (manual/automatic stage advance) |
| Mental model | Maps directly to GitFlow | Maps directly to a single trunk |

Next: see exactly which branch, account, and approval setting each
environment uses in [Environment Mapping →](/environment-mapping)
