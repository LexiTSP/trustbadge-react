# Changelog

## Unreleased

### Changed
- README rewritten to lead with the end-user value proposition and a
  Next.js client-component snippet, cross-link to the new SDK
  examples, and map each of the seven canonical panel fields to the
  EU AI Act articles they speak to.
- `SECURITY.md` and `CONTRIBUTING.md` aligned with the SDK's release
  policy (canonical `tsp@lexico.no` channel, 90-day coordinated
  disclosure, three non-negotiables for badge state honesty).

### Notes
- No component behavior or API changes from `0.2.2`. Consumers do not
  need to upgrade.

## 0.2.2 — 2026-05-14

### Changed
- Metadata-only alpha refresh for the canonical `truststandardprotocol.com` launch.
- Updates npm package description and repository metadata to the public `LexiTSP/trustbadge-react` repository.
- Tracks `@lexitsp/sdk@^3.0.0-alpha.6`; component behavior is unchanged from `0.2.1`.

## 0.2.1 — 2026-05-14

### Fixed
- Publishes compiled ESM and declaration files under `dist/` for Node/npm consumers.
- Updates the peer dependency to `@lexitsp/sdk@^3.0.0-alpha.5`.
- Supersedes `0.2.0`, which exposed TSX source files in npm exports.

## 0.2.0 — 2026-04-30

### Added
- Render `alignment.refusal` in a dedicated Refusal section (only shown when present).
- Render `alignment.flags[]` as inline chips in a new Alignment-flags section.
- Render `alignment.policy` (id + version) in a new Policy section.
- New labels: `sectionRefusal`, `sectionFlags`, `sectionPolicy`, `refusalReason`, `noFlags`, `policyId`, `policyVersion`.
- Default styles for `.tsp-flags__chip`, `.tsp-refusal`, `.tsp-policy`.
- 4 new tests (24 total).

### Changed
- Bumps peer-dep to `@lexitsp/sdk@^3.0.0-alpha.4` (alignment schema requirement).
- Existing test fixture updated to include `alignment.policy`.

## 0.1.0 — 2026-04-30

### Added
- Initial release of `@lexitsp/trustbadge-react`.
- Monolith `<TrustBadge>` component implementing charter §5.
- Three verify modes: `lazy` (default), `eager`, `manual`.
- Tier-based failure rendering (crypto/trust/network) per spec II.3.
- CSS Custom Properties theme system; default styles in `./styles.css`.
- English default labels; `labels` prop for i18n.
- SSR-friendly via `initialResult` prop.
- Peer dependency on `@lexitsp/sdk@^3.0.0-alpha`.
- 20 tests (status-tier logic + component interaction + ARIA).

### Notes
- Package is alpha; API may evolve before 1.0 alongside `@lexitsp/sdk`.
- Charter §5 monolith design — sub-components are not exported. Custom layouts: call `verifyOnline()` directly.
