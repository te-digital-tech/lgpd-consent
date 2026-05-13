# Changesets

This folder contains [changesets](https://github.com/changesets/changesets) — small markdown files describing version bumps for each release.

## Workflow

1. Make changes in a feature branch
2. Run `pnpm changeset` to describe what changed and pick a bump type (patch / minor / major)
3. Commit the generated `.md` file alongside your code
4. When merged to `main`, the release workflow consumes the changesets, bumps versions and publishes to npm
