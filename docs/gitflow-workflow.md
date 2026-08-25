---
id: gitflow-workflow
title: 7. GitFlow Workflow
sidebar_position: 8
slug: /gitflow-workflow
---

# GitFlow Workflow

The branch model isn't decorative — every branch pattern in
[Environment Mapping](/environment-mapping) corresponds to a pipeline that
auto-triggers on push.

```mermaid
gitGraph
    commit id: "develop init"
    branch feature/auth
    checkout feature/auth
    commit id: "wip auth"
    commit id: "wip auth 2"
    checkout develop
    merge feature/auth id: "merge auth"
    branch release/1.0.0
    checkout release/1.0.0
    commit id: "rc fixes"
    checkout main
    merge release/1.0.0 id: "release 1.0.0"
    checkout develop
    merge main id: "back-merge"
```

## Feature development

1. Create `feature/xxx` from `develop`
2. Deploy an isolated feature pipeline:
   ```bash
   npx cdk deploy -c env=feature -c branch=feature/xxx
   ```
3. Push changes — the feature pipeline auto-deploys on every push to that
   branch
4. When done, tear it down:
   ```bash
   npx cdk destroy -c env=feature -c branch=feature/xxx
   ```
5. Merge `feature/xxx` → `develop` — this **triggers the dev pipeline**
   automatically (no manual deploy needed, since the dev pipeline is already
   watching `develop`)

## Release

1. Create `release/1.0.0` from `develop`
2. Point staging at it by editing `environments.ts`:
   ```ts
   stag: {
     branch: 'release/1.0.0',
     // ...
   }
   ```
3. Push to `release/1.0.0` — the stag pipeline **self-mutates** (because its
   source branch config changed) and then deploys
4. Validate in staging
5. Merge `release/1.0.0` → `main` — the prod pipeline triggers

## The one manual step to remember

Unlike `feature` and `dev`, which just work once the pipeline exists, **stag
requires you to edit and push `environments.ts`** every time you cut a new
release branch. This is intentional friction: it forces a deliberate,
reviewable decision about *which* release candidate staging currently
represents, rather than staging silently tracking whatever branch happens to
match a wildcard.

Next: [Deployment Walkthrough →](/deployment-walkthrough)
