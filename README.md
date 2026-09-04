# MAP 2.0 Auto-Tagger

> **Sample code / non-production reference.** Validate security, legal, compliance, IAM, cost, account topology and operational requirements before deployment. You are responsible for testing and hardening the solution for your environment.

Automatic AWS resource tagging for MAP 2.0 credit tracking. The solution observes resource-creation activity through AWS-native events/queues and applies the `map-migrated` tag to supported resources, while keeping scope, drift handling and deployment controls explicit.

## Current repository posture — 2026-09-04

Current observed `main` before this README refresh: `41c1cd645f09548575609dae7d938cdcf90219fb`.

The latest accepted change restored the AI-DLC brownfield artifacts as an explicitly dated **2026-07-07 snapshot**. It made no functional runtime change; the recorded validation at that change was:

- build: PASS;
- YAML build: PASS;
- unit tests: **151 PASS**;
- generated-artifact verification: PASS.

The AI-DLC snapshot is historical/reverse-engineering evidence. Current engineering rules live in the maintained source/docs, not in the snapshot merely because it is present.

## What it solves

MAP credits can be missed when resources are created without the required migration tag or when dependent resources are created outside the original provisioning path. The Auto-Tagger provides a central AWS-native tagging path for supported resource types and records scope/configuration under the deployed solution.

The current source catalogue covers **154 resource types**. Always check [`docs/COVERAGE.md`](docs/COVERAGE.md) for the exact current matrix and exceptions.

## Quick start

### 1. Generate deployment script

Open `configurator.html`, enter the MAP engagement/configuration values and generate `deploy.sh`.

### 2. Review the script

Before execution, review:

- account/region scope;
- IAM roles/policies;
- EventBridge/CloudTrail/SQS/Lambda behavior;
- alerting and rollback/removal behavior;
- MAP engagement/tag value;
- expected AWS charges.

### 3. Deploy

```bash
bash deploy.sh
```

AWS CloudShell is the simplest supported operator path when the required permissions are present.

### 4. Verify

Create an admitted test resource and confirm the expected `map-migrated` tag after the event-processing interval. Do not use a production-critical resource as the first proof.

## Terraform / IaC coexistence

Terraform/provider tag reconciliation can remove tags applied out of band. If Terraform owns the resource, either declare `map-migrated` in IaC or configure `ignore_tags` for that key as appropriate.

Example:

```hcl
provider "aws" {
  ignore_tags {
    keys = ["map-migrated"]
  }
}
```

The solution's drift handling is alert-oriented; do not assume it will silently fight an IaC system and reapply a removed tag forever.

See [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) and the drift runbook in [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md).

## Day-2 operations

Use the documented update/remove paths rather than hand-editing deployed resources:

- account/scope changes: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md)
- service coverage: [`docs/COVERAGE.md`](docs/COVERAGE.md)
- upgrade/redeploy decisions: [`CHANGELOG.md`](CHANGELOG.md)
- design invariants: [`docs/DESIGN-INVARIANTS.md`](docs/DESIGN-INVARIANTS.md)
- known limitations: [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md)

Existing `map-migrated` tags are deliberately treated as migration-credit data; removal of the deployment should not be confused with removal of already-applied tags.

## Development

```bash
npm install
npm run build
npm test
npm run verify
npm run sync-rules
```

Source lives under `src/`; `configurator.html` is a built output. Edit source, rebuild and verify rather than hand-editing generated output.

AI-agent engineering rules live under `.kiro/steering/` and are mirrored to `.claude/rules/` through `npm run sync-rules`.

## Architecture / components

The solution uses AWS-managed services including CloudTrail/EventBridge, SQS, Lambda, SSM Parameter Store, CloudWatch and SNS. Exact resources depend on configuration and version.

The discovery/tagging path is intended to remain scoped and least-privilege. AWS Shared Responsibility still applies: deploying sample code does not transfer your IAM, security, compliance or operational responsibility.

## Documentation

- [`docs/OVERVIEW.md`](docs/OVERVIEW.md) — architecture and operating model
- [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) — deployment/day-2/runbooks
- [`docs/COVERAGE.md`](docs/COVERAGE.md) — exact service/resource coverage
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — hard constraints
- [`docs/DESIGN-INVARIANTS.md`](docs/DESIGN-INVARIANTS.md) — rules the solution must preserve
- [`docs/MAP_TAGGING_GAP_ANALYSIS.md`](docs/MAP_TAGGING_GAP_ANALYSIS.md) — AWS tagging gaps
- [`CHANGELOG.md`](CHANGELOG.md) — release history
- [`aidlc-docs/`](aidlc-docs/) — dated 2026-07-07 brownfield snapshot, not maintained current authority

## Licence

MIT-0 — see [`LICENSE`](LICENSE).

---

Cross-repository front-door currentness coordination: `overdrivemh/Mocc#6895`.
