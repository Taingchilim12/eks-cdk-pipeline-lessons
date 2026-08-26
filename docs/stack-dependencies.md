---
id: stack-dependencies
title: 4. Stack Dependencies
sidebar_position: 5
slug: /stack-dependencies
---

# Stack Deployment Order & Dependencies

```mermaid
flowchart TD
    VPC["VPC Stack"] --> EKS["EKS Stack\ncluster + node group + core addons"]
    EKS --> ADD["EKS Addons Stack\nCSI drivers + Pod Identity"]
    EKS --> KAR["Karpenter Stack\nIAM + SQS + EventBridge + Pod Identity"]
    KAR --> K8S["K8s Stack\nHelm charts + manifests"]

    style ADD fill:#fff3bf
    style KAR fill:#fff3bf
```

## Why this order

- **VPC before EKS** — obviously, the cluster needs subnets to launch into.
- **EKS Addons and Karpenter are independent of each other** — both depend
  only on the EKS cluster, not on one another. They can deploy in parallel.
- **K8s stack depends on Karpenter**, specifically because the Karpenter Helm
  chart's values need the **IAM role ARN and SQS queue URL** that the
  Karpenter stack creates. Without that dependency, CDK might try to deploy
  the Helm release before the resources it references exist. In code, this
  is the *only* explicit cross-stack dependency in the whole stage:

  ```typescript
  this.k8sStack.addDependency(this.karpenterStack);
  ```

  Every other ordering (VPC → EKS, EKS → Addons, EKS → Karpenter) is
  **inferred automatically by CDK** because those stacks receive the
  cluster or VPC object as a constructor prop — a cross-stack reference
  implies a dependency, no explicit `addDependency` needed.

## Ordering *inside* the K8s stack

The five stacks above are the CloudFormation-level ordering. Inside the K8s
stack itself, the Helm charts and manifests have their own dependency chain,
enforced with `.node.addDependency(...)` on each construct:

```mermaid
flowchart LR
    ALB["AWS LB Controller\nHelm chart"] --> KCRD["Karpenter CRD\nHelm chart"]
    KCRD --> KCTRL["Karpenter Controller\nHelm chart"]
    KCTRL --> NC["Default EC2NodeClass"]
    NC --> NP["Default NodePool"]
    ALB --> ARGO["ArgoCD\nHelm chart (if enabled)"]
    KCTRL --> ING["Ingress NGINX\nHelm chart (if enabled)"]
```

The reason the **ALB Controller deploys first**: its admission webhook needs
to be ready before Karpenter's CRDs are applied. Skipping this ordering can
produce flaky first-deploys where Karpenter resources get created before the
webhook that validates them is listening.

## Why the K8s stack uses `fromClusterAttributes`

The K8s stack doesn't receive the cluster object directly from the EKS
stack's construct tree. Instead it re-imports the cluster via
`eks.Cluster.fromClusterAttributes(...)`. The practical effect:

> If a Helm chart or manifest fails to apply, **only the K8s stack rolls
> back** — not the EKS cluster itself.

That's an important safety property. A bad Helm values file or a typo in a
manifest shouldn't be able to put your actual EKS cluster resource into a
rollback loop. It isolates "did the cluster provision correctly" from "did
the software we put on it apply correctly."

## Approval gates line up with stack boundaries

For environments with `requireApproval: true`, each stack gets its own
changeset review:

```
Prepare VPC → Approve VPC → Deploy VPC
Prepare EKS → Approve EKS → Deploy EKS
Prepare K8s → Approve K8s → Deploy K8s
```

Notice **EKS Addons and Karpenter deploy without a separate approval step**.
The reasoning: they're additive, IAM/infra-scoped changes with a
well-understood blast radius (CSI drivers, Pod Identity associations, an SQS
queue) — not changes to the cluster's core compute or its Kubernetes
workloads. Reserving manual approval for VPC, EKS, and K8s keeps the
approval burden on the changes most likely to be disruptive.

Next: [Networking →](/networking)
