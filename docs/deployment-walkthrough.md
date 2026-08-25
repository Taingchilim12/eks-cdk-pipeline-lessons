---
id: deployment-walkthrough
title: 8. Deployment Walkthrough
sidebar_position: 9
slug: /deployment-walkthrough
---

# Step-by-Step: From Clone to Running Cluster

This walks through deploying the **dev** environment end-to-end. The same
shape applies to `feature`, `stag`, and `prod` — only the env vars and
context flags change.

## Step 1 — Install and build

```bash
cd cdk/my-pipeline
npm ci
npm run build
```

`npm ci` installs from the lockfile exactly (no version drift). `npm run
build` compiles TypeScript before you synth or deploy.

## Step 2 — Export common environment variables

These are required for **every** environment:

```bash
export PIPELINE_ACCOUNT_ID=<pipeline-account-id>
export PIPELINE_REGION=ap-southeast-1
export CODESTAR_CONNECTION_ARN=<codestar-connection-arn>
```

## Step 3 — Export environment-specific variables

For `dev`, you additionally need:

```bash
export DEV_ACCOUNT_ID=<dev-account-id>
export DEV_EKS_ADMIN_ARN=<iam-principal-arn>
```

:::info Only set what you need
You don't need `STAG_*` or `PROD_*` variables to deploy `dev`. Each
environment only reads its own slice of config.
:::

## Step 4 — Bootstrap the target account (first time only)

Every target account must trust the pipeline account before CDK can deploy
into it. See [Cross-Account Bootstrap](/cross-account-bootstrap) for the
full command — for `dev`, since it shares the pipeline account, this is
usually already done as part of bootstrapping the pipeline account itself.

## Step 5 — Deploy

```bash
npx cdk deploy -c env=dev
```

This creates the CodePipeline. On this **first run**, CDK deploys the
pipeline stack directly from your machine.

## Step 6 — Watch the pipeline self-mutate and deploy

After the first `cdk deploy`, the pipeline takes over. It:

1. Pulls source from the `develop` branch via the CodeStar connection
2. Synths the CDK app
3. Self-mutates (updates its own definition if needed)
4. Deploys the Infra Stage: VPC → EKS → (Addons ∥ Karpenter) → K8s
5. Pauses for manual approval before each of VPC, EKS, and K8s (since
   `dev.requireApproval = true`)

:::tip Env vars are baked in after the first deploy
The environment variables you exported get baked into the CodeBuild project
definition during that first deploy. You do **not** need to re-export them
for subsequent pipeline runs — only for your local `cdk diff` / `cdk synth`
sessions.
:::

## Step 7 — Verify

```bash
npx cdk ls -c env=dev       # list all stacks
npx cdk diff -c env=dev     # confirm what would change
```

Once the K8s stack completes, the platform layer (Karpenter, ingress
controller) is live. From here, **ArgoCD** — deployed separately, outside
this pipeline — takes over syncing application manifests via GitOps.

## Step 8 — Iterate

Push a commit to `develop`. You don't re-run `cdk deploy` locally — the
pipeline is already watching that branch and picks it up automatically.

## Tearing down

```bash
npx cdk destroy -c env=dev
```

:::caution Destroying the pipeline ≠ destroying the infrastructure
This only removes the CodePipeline and its stacks' CloudFormation
management. It does **not** delete the EKS cluster or VPC it deployed — if
those stacks were themselves destroyed as part of the stage, fine, but if
you only meant to tear down orchestration, double-check what's left in the
target account.
:::

Next: [Cross-Account Bootstrap →](/cross-account-bootstrap)
