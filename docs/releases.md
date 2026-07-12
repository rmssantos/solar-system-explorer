# Releases and production

This repository uses Semantic Versioning, Release Please, immutable tags, and GitHub Releases. A normal merge into `main` updates the release pull request but does not publish production. Merging the release pull request creates a `vX.Y.Z` tag and GitHub Release; that immutable tag is then validated and deployed to Azure Static Web Apps.

## Choosing the next version

Use a Conventional Commit title for the pull request and squash commit:

- `fix: correct ship orientation` produces a patch (`1.2.3` → `1.2.4`).
- `feat: add touch controls` produces a minor release (`1.2.3` → `1.3.0`).
- `feat!: replace the save format`, or a body containing `BREAKING CHANGE:`, produces a major release (`1.2.3` → `2.0.0`).
- `docs:`, `test:`, `chore:`, and `ci:` changes are recorded when relevant but do not raise the version on their own.

Release Please keeps `CHANGELOG.md`, `package.json`, `package-lock.json`, and `.release-please-manifest.json` together in the release pull request. Do not edit those version numbers manually outside a documented bootstrap operation.

## Normal release flow

1. A product pull request receives tests, lint, type checking, a production build, review, and an Azure preview.
2. After it merges into `main`, `.github/workflows/release.yml` creates or updates one release pull request.
3. Review the proposed version and changelog and require green checks before merging the release pull request.
4. Release Please creates the immutable tag and GitHub Release.
5. `deploy-production` checks out that tag, repeats the full quality gate, and embeds `VITE_APP_VERSION` plus `VITE_GIT_SHA` in the build.
6. The pinned Azure Static Web Apps CLI deploys `dist-paper-preview` with the production deployment token.
7. Verify the footer version and smoke-test `/`, `/jogo/`, `/biblioteca/`, and `/privacidade/` on the production hostname.

Do not deploy an arbitrary untagged `main` commit as a normal release. Pull-request previews remain telemetry-free; the Application Insights connection string is injected only into the release-tagged production build.

## Repository and Azure configuration

The release and deployment path requires these GitHub secrets:

- `RELEASE_PLEASE_TOKEN`: a repository-scoped user token used to create pull requests whose checks can run.
- `AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_SMOKE_09DEA4A03`: the current Azure deployment token.

`VITE_APPLICATIONINSIGHTS_CONNECTION_STRING` is optional. When configured, it provides the production telemetry routing identifier; when absent, the privacy and analytics adapter remains a telemetry-free no-op.

For a fine-grained Release Please token, restrict it to this repository and grant Metadata read, Contents read/write, Pull requests read/write, and Issues read/write. A classic token requires `repo`. Store it without printing it:

```powershell
gh auth token | gh secret set RELEASE_PLEASE_TOKEN
gh secret list
```

The Static Web App deployment authorization policy must be `DeploymentToken`. If the Azure token is rotated, update the matching GitHub secret before the next release. The workflow deliberately uses the pinned Azure Static Web Apps CLI command recorded in `release.yml`; change the workflow and this runbook together.

The GitHub `production` environment can require human reviewers if an additional manual deployment gate is desired.

## Rollback or deliberate redeploy

A rollback republishes an existing verified tag. It does not rewrite tags or Git history.

```powershell
gh workflow run release.yml --ref main -f ref=v1.2.3 -f reason='Rollback from v1.3.0 after a startup regression'
gh run list --workflow release.yml --limit 3
gh run watch
```

The same operation is available under **Actions → Release and production deploy → Run workflow**. The job validates the requested ref, derives its version and SHA, rebuilds it, and sends that exact artefact to production.

After a rollback:

1. Confirm the workflow is green and the footer shows the expected older version.
2. Smoke-test the homepage, game, library, privacy controls, and telemetry boundary.
3. Open a `fix:` pull request for the regression and publish a new patch release.
4. Record the reason, previous tag, restored tag, and verification result in the incident or issue.

Never delete or move an existing release tag to “correct” it. Restore a known tag, then publish a new version containing the fix.

## Troubleshooting

- **No release pull request:** inspect the `release.yml` run, verify `RELEASE_PLEASE_TOKEN`, and confirm a releasable `feat:` or `fix:` exists after the latest tag.
- **Release pull request has no checks:** confirm Release Please uses `RELEASE_PLEASE_TOKEN`, not the workflow `GITHUB_TOKEN`.
- **GitHub Release exists but production did not change:** inspect `deploy-production`, verify the `production` environment, the deployment-token secret, and Azure's `DeploymentToken` authorization policy.
- **Azure CLI reports an invalid token:** rotate the Static Web App deployment token and update `AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_SMOKE_09DEA4A03` without logging the value.
- **Footer version is wrong:** verify the checked-out tag and the `VITE_APP_VERSION` / `VITE_GIT_SHA` values in the build step.
