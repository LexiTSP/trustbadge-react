# `@lexitsp/trustbadge-react`

> Drop-in React component for showing a [Trust Standard Protocol](https://truststandardprotocol.com)
> receipt to end users. Pair it with [`@lexitsp/sdk`](https://github.com/LexiTSP/sdk).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TrustBadge v0.2 alpha](https://img.shields.io/badge/TrustBadge-0.2--alpha-1E3A5F.svg)](https://truststandardprotocol.com/spec)
[![npm](https://img.shields.io/badge/npm-@lexitsp%2Ftrustbadge--react@alpha-cb3837.svg)](https://www.npmjs.com/package/@lexitsp/trustbadge-react)

`TrustBadge` is the end-user surface for TSP. When an AI answer carries a
signed `TrustEnvelope`, the badge shows it to the person reading the
answer and — with one click — opens a panel with seven canonical fields
that they (or their auditor) can inspect.

> Status: `0.2.2` alpha. Tracks [`@lexitsp/sdk@^3.0.0-alpha.6`](https://github.com/LexiTSP/sdk).

---

## Install

```bash
npm install @lexitsp/trustbadge-react @lexitsp/sdk
# or: bun add @lexitsp/trustbadge-react @lexitsp/sdk
```

Peer dependencies: `react@>=18`, `react-dom@>=18`,
`@lexitsp/sdk@^3.0.0-alpha.6`.

## Quick start

```tsx
import { TrustBadge } from "@lexitsp/trustbadge-react";
import "@lexitsp/trustbadge-react/styles.css";
import { verifyOnline } from "@lexitsp/sdk/v3";

export function AnswerWithReceipt({ envelope }) {
  return (
    <article>
      <p>{envelope.content.value}</p>
      <TrustBadge envelope={envelope} verify={verifyOnline} />
    </article>
  );
}
```

For a Next.js app, the same component works in any client component (mark
the file with `"use client"`). If you compute verification on the server
you can hand the result in via `initialResult` to skip the client-side
verify call.

```tsx
"use client";

import { TrustBadge } from "@lexitsp/trustbadge-react";
import "@lexitsp/trustbadge-react/styles.css";
import { verifyOnline } from "@lexitsp/sdk/v3";

export function ReceiptBadge({ envelope, initialResult }) {
  return (
    <TrustBadge
      envelope={envelope}
      verify={verifyOnline}
      initialResult={initialResult}
      verifyMode={initialResult ? "manual" : "lazy"}
    />
  );
}
```

For the underlying envelope construction, see the SDK's
[`examples/01-minimal-wrap-verify`](https://github.com/LexiTSP/sdk/tree/main/examples/01-minimal-wrap-verify)
and [`examples/02-eu-ai-act`](https://github.com/LexiTSP/sdk/tree/main/examples/02-eu-ai-act).

---

## What the panel shows

When the user opens the badge, they see seven canonical fields. Each is
deliberately structured so it can be read by a non-technical reader and
mapped one-to-one to a TSP envelope field by a developer or auditor.

| # | Field | Sourced from | Speaks to |
| --- | --- | --- | --- |
| 1 | Source | `declaration.primarySource` | Art. 13 |
| 2 | Citations | `declaration.citations[]` | Art. 13 |
| 3 | Model | `process.model` | Art. 12, Art. 15 |
| 4 | Timestamp | `timestamp.claimed` (+ TSA token) | Art. 12 |
| 5 | Ledger ID | `ledger.id` | Art. 12 |
| 6 | System prompt | `process.systemPrompt` (text or hash + reason) | Art. 12, Art. 15 |
| 7 | Uncertainty | `alignment.uncertainty[]`, `alignment.humanReviewRequired` | Art. 14, Art. 15 |

---

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `envelope` | `TrustEnvelope` | required | The signed envelope to render. |
| `verify` | `(env) => Promise<VerifyResult>` | — | Verifier function (typically `verifyOnline`). Required unless `initialResult` is provided. |
| `initialResult` | `VerifyResult` | — | Pre-computed result (e.g. from SSR). Skips the initial verify call. |
| `verifyMode` | `"lazy" \| "eager" \| "manual"` | `"lazy"` | When `verify` fires: `lazy` on first open, `eager` on mount, `manual` if the caller is in charge. |
| `labels` | `Partial<Labels>` | English | Override individual UI strings for i18n. |
| `className` | `string` | — | Additional class on the outer container. |
| `onResult` | `(result) => void` | — | Callback after `verify` resolves. |

## Styling

The component ships a default theme via CSS Custom Properties. Override
in global CSS:

```css
:root {
  --tsp-color-verified: #047857;
  --tsp-color-warn:     #f59e0b;
  --tsp-color-danger:   #dc2626;
  --tsp-color-trust:    #ea580c;
  --tsp-radius:         6px;
  --tsp-font:           'Inter', sans-serif;
  --tsp-panel-width:    min(440px, 90vw);
}
```

See [`src/styles.css`](./src/styles.css) for the full list of variables.

## i18n

```tsx
import { TrustBadge, type Labels } from "@lexitsp/trustbadge-react";

const norwegian: Partial<Labels> = {
  badgeVerified: "Verifisert",
  badgeFailedCrypto: "Verifisering feilet",
  panelTitle: "Tillit-detaljer",
  sectionSource: "Kilde",
  // ...
};

<TrustBadge envelope={env} verify={verifyOnline} labels={norwegian} />;
```

## Failure tiers

A failed verification is rendered in one of three visual tiers so the
user immediately sees the *kind* of failure, not just that one occurred:

- **`crypto`** — red, loud. A cryptographic primitive failed (signature,
  hash, certificate chain). Likely tampering.
- **`trust`** — orange. A trust check failed (certificate expired,
  revoked, DANE mismatch).
- **`network`** — yellow. A network/external check could not complete
  (manifest fetch, TSA reach).

This dispatch is automatic based on `result.checks` — consumers do not
need to wire it manually.

---

## Companion repositories

- [`LexiTSP/sdk`](https://github.com/LexiTSP/sdk) — the reference
  TypeScript SDK and CLI used to build the envelopes this badge renders.
- [`LexiTSP/tsp-site`](https://github.com/LexiTSP/tsp-site) — public
  site, spec, fixtures and browser verifier source.

## Security

See [`SECURITY.md`](./SECURITY.md). Report security issues privately to
`tsp@lexico.no`. The badge renders whatever envelope it is given — be
careful what you publish in `process.systemPrompt.text` and
`alignment.uncertainty` fields, as those can leak internal context.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Licence

MIT © LexiCo AS · <https://truststandardprotocol.com> · tsp@lexico.no
