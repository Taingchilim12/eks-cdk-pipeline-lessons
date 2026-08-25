---
id: troubleshooting
title: 10. Troubleshooting
sidebar_position: 11
slug: /troubleshooting
---

# Troubleshooting

Common failure modes when working with this pipeline, and where to look.

## "K8s stack rolled back but my EKS cluster looks fine"

This is expected behavior, not a bug. The K8s stack uses
`fromClusterAttributes` to reference the cluster rather than depending on it
directly, specifically so that **Helm/manifest failures only roll back the
K8s stack**. Check:

- The `kubectl` provider Lambda's CloudWatch logs (it runs inside your VPC —
  look for a Lambda function name containing your cluster name)
- Whether the failing Helm chart's values reference a resource from the
  Karpenter stack that hasn't finished creating (a dependency ordering issue)

## "Pod Identity / IRSA permission errors on startup, but the role exists"

Almost always a **race condition**: the pod started before its Pod Identity
association propagated. This is why Pod Identity associations are created
*before* the addons that need them in this project's stack ordering — if
you've customized the stack order, check that you haven't broken this
sequencing.

## "cdk deploy fails cross-account with an assume-role error"

Check, in order:

1. Did you bootstrap the **target** account with `--trust
   $PIPELINE_ACCOUNT_ID`?
2. Does the target account's bootstrap use the **same `--qualifier`**
   (`rnvdevops`) as the pipeline account? A mismatched qualifier means the
   pipeline looks for roles that don't exist under that name.
3. Is `$PIPELINE_ACCOUNT_ID` actually the account the pipeline runs in — not
   the account you happen to be authenticated as locally?

## "My env vars aren't taking effect on a re-deploy"

After the **first** `cdk deploy`, environment variables are baked into the
CodeBuild project definition. Re-exporting them locally won't change
anything the *pipeline* uses on subsequent runs — you'd need to update the
CodeBuild project (usually by changing `environments.ts` and letting the
pipeline self-mutate) rather than relying on local env vars.

## "Two feature pipelines are stepping on each other"

Parallel feature pipelines **share the same VPC CIDR** from the `feature`
environment config. If you deploy two feature branches into overlapping
network space in the same account, expect CIDR conflicts. Either:

- Run one feature pipeline at a time per account, or
- Assign different accounts per concurrent feature branch

## "Staging pipeline didn't trigger after I pushed to my release branch"

Check that you actually **edited `environments.ts`** to set `stag.branch` to
your new release branch name and pushed that change first. Staging's branch
isn't a wildcard — the pipeline only watches the exact branch name currently
configured, and updating that config requires the pipeline to self-mutate
before it starts watching the new branch.

## Where to look first, generally

| Symptom | Look at |
|---|---|
| Pipeline won't start | CodeStar/CodeConnections connection status |
| Synth fails | CodeBuild logs for the Synth stage |
| Stack stuck "IN_PROGRESS" | CloudFormation events for that specific stack |
| Helm/manifest errors | `kubectl` provider Lambda logs (CloudWatch, inside the VPC) |
| Cross-account deploy fails | Bootstrap trust + qualifier match |
| Node not scaling | Karpenter controller pod logs, SQS queue for stuck interruption messages |

---

That's the full lesson series. Back to [Start Here](/intro), or jump
straight to the [Architecture](/architecture) overview.
