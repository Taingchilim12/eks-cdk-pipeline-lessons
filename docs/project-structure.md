---
id: project-structure
title: 3. Project Structure
sidebar_position: 4
slug: /project-structure
---

# Project Structure

```
cdk/my-pipeline/
├── bin/
│   └── my-pipeline.ts                      # App entry point
├── lib/
│   ├── config/
│   │   └── environments.ts                 # Per-environment configuration
│   ├── my-pipeline-stack.ts                # Pipeline definition
│   ├── my-pipeline-inf-stage.ts            # Infrastructure stage
│   ├── my-pipeline-vpc-stack.ts            # VPC stack (NAT or TGW egress)
│   ├── my-pipeline-eks-stack.ts            # EKS cluster + node group + core addons
│   ├── my-pipeline-eks-addons-stack.ts     # CSI drivers + ALB Controller IAM/Pod Identity
│   ├── my-pipeline-karpenter-stack.ts      # Karpenter IAM, SQS, EventBridge, Pod Identity
│   └── my-pipeline-k8s-stack.ts            # Helm charts + K8s manifests (Karpenter, Ingress)
├── cdk.json
├── package.json
└── tsconfig.json
```

## The mental model

Think of it as three layers:

1. **`bin/my-pipeline.ts`** — the CDK app entry point. Reads context
   (`-c env=`, `-c branch=`) and environment variables, picks the right
   config from `environments.ts`, and instantiates **one**
   `MyPipelineStack`.
2. **`lib/my-pipeline-stack.ts`** — defines the CodePipeline itself: source,
   synth, self-mutation, and which stage to run.
3. **`lib/my-pipeline-inf-stage.ts`** — a CDK `Stage` that groups the five
   workload stacks (VPC, EKS, EKS Addons, Karpenter, K8s) so they deploy
   together, in dependency order, as a unit.

Everything under `lib/my-pipeline-*-stack.ts` is a plain CDK stack — if
you've written CDK before, nothing here is exotic. The interesting design
decision is *how they're composed and ordered*, which is the subject of the
next lesson.

## A note on naming

Stacks are named per-environment (and per-branch for `feature`), so multiple
environments — and multiple parallel feature branches — can coexist in the
same account without colliding. That's what makes it safe to run:

```bash
npx cdk deploy -c env=feature -c branch=feature/auth
npx cdk deploy -c env=feature -c branch=feature/payments
```

at the same time, in the same pipeline account, without one tearing down the
other.

Next: [Stack Dependencies →](/stack-dependencies)
