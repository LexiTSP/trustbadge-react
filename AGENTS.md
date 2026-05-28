# AGENTS.md

## Cursor Cloud specific instructions

This is `@lexitsp/trustbadge-react`, a React component library (not a runnable app). There is no dev server or backend service to start.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm ci` |
| Run tests | `npm run test` (vitest, jsdom env) |
| Build library | `npm run build` (tsup → `dist/`) |
| Type-check | `npx tsc --noEmit` |

### Notes

- No lint script is configured in `package.json`. TypeScript strict mode (`npx tsc --noEmit`) is the primary static analysis check.
- Tests use `jsdom` (no real browser needed). All 24 tests run in under 1 second.
- The build produces ESM output in `dist/` with `.d.ts` type declarations.
- CI (`.github/workflows/ci.yml`) runs: `npm ci` → `npm run test` → `npm run build` on Node 22.
- Peer dependencies (`react`, `react-dom`, `@lexitsp/sdk`) are listed in `devDependencies` for local dev; they are externalized during build.
