# Contributing to EduSphere

## Branching

- `main` — stable, deployable
- `develop` — integration branch
- `feature/<short-description>` — new work, branched from `develop`

## Workflow

1. Branch off `develop`.
2. Make your changes, keeping commits focused.
3. Run checks locally before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
4. Open a PR into `develop`. CI must pass before merge.
5. Use [Conventional Commits](https://www.conventionalcommits.org/) style messages, e.g.:
   - `feat: add group creation form validation`
   - `fix: correct KNUST email regex for staff domain`
   - `docs: update backend setup guide`

## Code style

- TypeScript strict mode — no untyped `any` without a `// TODO` justification.
- Shared types live in `src/types/`, not inline in screens.
- New services follow the pattern in `src/services/` (one file per domain, using the shared `api.ts` axios instance).
- Run `npm run format` before committing.

## Tests

- Unit tests for utils/services go in `__tests__/unit/`.
- Component/integration tests go in `__tests__/integration/`.
- New screens or services should ship with at least one test.
