---
id: intro
title: Start Here
sidebar_position: 1
slug: /intro
---

# Deploying EKS with CDK Pipelines and GitFlow

This lesson walks through a real-world pattern for deploying **Amazon EKS**
clusters using **AWS CDK Pipelines**, with a **GitFlow branching model** that
maps naturally onto multiple environments (`feature`, `dev`, `stag`, `prod`).

By the end of this lesson series you'll understand:

- How one CodePipeline exists **per environment** (and even per feature branch)
- How CDK's `kubectl` provider deploys Helm charts and manifests into a
  **private EKS cluster** from inside a Lambda running in your VPC
- How **Karpenter** is bootstrapped with least-privilege IAM, an SQS
  interruption queue, and Pod Identity
- How **ArgoCD** takes over application delivery once the platform layer is up
- How to safely bootstrap and deploy across **multiple AWS accounts**

## Who this is for

Developers who already know the basics of AWS and Kubernetes, and want to see
how a **production-grade GitOps platform pipeline** is actually wired
together — not just "hello world" CDK.

## What you'll need

- Node.js 20+
- The AWS CDK CLI (`npm install -g aws-cdk`)
- AWS credentials for a pipeline account (and target accounts, if you're
  deploying cross-account)
- A CodeStar/CodeConnections connection to GitHub or GitLab

:::tip Have the source code?
This lesson is written against a specific project layout. If you have the
actual CDK source, keep it open in another tab — each lesson links the
concept back to the file that implements it (e.g. `lib/my-pipeline-eks-stack.ts`).
:::

## Lesson map

| # | Lesson | What you'll learn |
|---|--------|--------------------|
| 1 | [Architecture](/architecture) | The big picture: pipeline → infra stage → stacks |
| 2 | [Environment Mapping](/environment-mapping) | How branches map to accounts and environments |
| 3 | [Project Structure](/project-structure) | How the CDK app and stacks are organized on disk |
| 4 | [Stack Dependencies](/stack-dependencies) | Deployment order and why it matters |
| 5 | [Networking](/networking) | VPC subnet layout for NAT vs Transit Gateway egress |
| 6 | [Karpenter](/karpenter) | Autoscaling, IAM, SQS interruption handling |
| 7 | [GitFlow Workflow](/gitflow-workflow) | Feature branches → develop → release → main |
| 8 | [Deployment Walkthrough](/deployment-walkthrough) | Step-by-step: from `npm ci` to a running cluster |
| 9 | [Cross-Account Bootstrap](/cross-account-bootstrap) | Trusting the pipeline account from target accounts |
| 10 | [Troubleshooting](/troubleshooting) | Common failure modes and how to read them |

Ready? Start with [Architecture →](/architecture)
