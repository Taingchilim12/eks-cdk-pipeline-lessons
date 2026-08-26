---
id: karpenter
title: 6. Karpenter
sidebar_position: 7
slug: /karpenter
---

# Karpenter: Autoscaling Setup

Karpenter setup is split across two stacks — a deliberate separation between
**IAM/AWS resources** (Karpenter Stack) and **Kubernetes resources** (K8s
Stack) — following the pattern in the
[official Karpenter CloudFormation template](https://github.com/aws/karpenter-provider-aws).

```mermaid
flowchart TB
    subgraph KARSTACK["Karpenter Stack (AWS resources)"]
        CTRL["Controller IAM Role\nscoped, least-privilege policies"]
        NODE["Node IAM Role\n+ EKS Access Entry"]
        SQS["SQS Interruption Queue"]
        EB["EventBridge Rules\nspot / rebalance / state change / health"]
        PID["Pod Identity Association\n(controller)"]
    end

    subgraph K8SSTACK["K8s Stack (Kubernetes resources)"]
<<<<<<< HEAD
        CRD["Karpenter CRD Helm Chart"]
        CTRLCHART["Karpenter Controller Helm Chart"]
        NC["Default EC2NodeClass\nAL2023, karpenter.sh/discovery tags"]
        NP["Default NodePool\nspot + on-demand\nc5/c6i/m5/m6i.xlarge"]
=======
        ALB["AWS LB Controller\nHelm chart (deploys first)"]
        CRD["Karpenter CRD Helm Chart"]
        CTRLCHART["Karpenter Controller Helm Chart"]
        NC["Default EC2NodeClass\nAL2023, karpenter.sh/discovery tags"]
        NP["Default NodePool\nspot + on-demand"]
>>>>>>> 49a63fe (update content to align with actual source code)
    end

    CTRL --> PID
    PID --> CTRLCHART
    SQS --> CTRLCHART
    NODE --> NC
<<<<<<< HEAD
=======
    ALB --> CRD
>>>>>>> 49a63fe (update content to align with actual source code)
    CRD --> CTRLCHART
    CTRLCHART --> NC
    NC --> NP
```

<<<<<<< HEAD
=======
## Before Karpenter can run: a bootstrap node group

Karpenter's own controller pod has to run *somewhere* before it can start
provisioning nodes for everything else — it can't provision the node it
runs on. The **EKS Stack** solves this with a small managed node group,
created alongside the cluster itself:

```typescript
this.cluster.addNodegroupCapacity(`${id}-customNodeGroup`, {
  amiType: eks.NodegroupAmiType.AL2023_X86_64_STANDARD,
  instanceTypes,             // c5/c5a/c6i/c6a/m5/m6i.xlarge by default
  desiredSize: 1,
  minSize: 1,
  maxSize: 1,
  capacityType: eks.CapacityType.SPOT,
  taints: [
    { key: 'CriticalAddonsOnly', value: 'true', effect: eks.TaintEffect.NO_SCHEDULE },
  ],
});
```

**One spot node, tainted `CriticalAddonsOnly`.** Only pods that explicitly
tolerate that taint can schedule there — and if you look back at the K8s
Stack, both the ALB Controller and Karpenter Helm charts set exactly that
toleration:

```typescript
tolerations: [
  { key: 'CriticalAddonsOnly', operator: 'Exists', effect: 'NoSchedule' },
],
```

So this one node exists for a single purpose: **host the controllers that
provision every other node.** Regular application workloads never land
here — they wait for Karpenter to provision NodePool-managed capacity
instead.

## Why the ALB Controller deploys before Karpenter

Inside the K8s Stack, the AWS Load Balancer Controller Helm chart is
installed **before** the Karpenter CRD chart, with an explicit
dependency (`karpenterCrds.node.addDependency(albControllerChart)`). The
ALB Controller's **admission webhook** needs to already be listening before
other charts create resources it might need to validate — deploying it
first avoids race conditions on a fresh cluster bootstrap.

>>>>>>> 49a63fe (update content to align with actual source code)
## Why interruption handling matters

Spot instances can be reclaimed by AWS with **2 minutes' notice**. The SQS
queue plus EventBridge rules (spot interruption, rebalance recommendation,
instance state change, health events) let Karpenter **drain and replace
nodes proactively** instead of losing pods ungracefully. This is the
mechanism, not an optional extra — running Karpenter on spot without it
means workloads get killed with no warning.

## Default NodePool shape

Out of the box, the K8s Stack deploys a NodePool that mixes:

<<<<<<< HEAD
- **Capacity types**: spot + on-demand (Karpenter picks the cheapest
  available spot capacity, falling back to on-demand)
- **Instance families**: `c5`, `c6i`, `m5`, `m6i` at `.xlarge`
=======
- **Capacity types**: `spot` + `on-demand` — Karpenter tries spot first,
  falls back to on-demand
- **Instance types**: `c5.xlarge`, `c5a.xlarge`, `c6i.xlarge`, `m5.xlarge`,
  `m6i.xlarge`
- **Limits**: capped at `100` vCPU / `400Gi` memory total across all nodes
  this NodePool provisions
- **Disruption**: `consolidationPolicy: WhenEmptyOrUnderutilized`, checked
  every `1m` — Karpenter actively consolidates underused nodes down, not
  just scales up on demand

```typescript
limits: { cpu: '100', memory: '400Gi' },
disruption: {
  consolidationPolicy: 'WhenEmptyOrUnderutilized',
  consolidateAfter: '1m',
},
```
>>>>>>> 49a63fe (update content to align with actual source code)

This is a reasonable general-purpose starting point. Teams typically layer
additional NodePools on top for specialized workloads (GPU, memory-optimized,
etc.) once they know their workload shape.

## Why Pod Identity, and why before addons

Pod Identity associations are created **before** the addons that need them.
<<<<<<< HEAD
If a pod identity mapping doesn't exist yet when a CSI driver or the
Karpenter controller starts, it can hit a **credential race condition** —
starting up without permissions and either crash-looping or silently failing
API calls until the association is picked up. Ordering the stacks so IAM/Pod
Identity exists first avoids that entirely.
=======
If a pod identity mapping doesn't exist yet when a CSI driver, the ALB
Controller, or the Karpenter controller starts, it can hit a **credential
race condition** — starting up without permissions and either crash-looping
or silently failing API calls until the association is picked up. Ordering
the stacks so IAM/Pod Identity exists first avoids that entirely.
>>>>>>> 49a63fe (update content to align with actual source code)

Next: [GitFlow Workflow →](/gitflow-workflow)
