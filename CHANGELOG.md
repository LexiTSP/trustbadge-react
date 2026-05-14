# Changelog

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
