# `@lexitsp/trustbadge-react`

Charter §5 TrustBadge as a React component for AI outputs wrapped with
[`@lexitsp/sdk`](https://www.npmjs.com/package/@lexitsp/sdk).

> **Status:** 0.2.1 alpha. Tracking `@lexitsp/sdk@^3.0.0-alpha.5`.

## Why

Per the TSP transparency model, every AI output
should carry a small, consistent visual affordance — the **TrustBadge** — that
opens (with one click) into a panel showing seven canonical fields:

1. **Source** (Kilde)
2. **Citations** (Paragraf-referanser)
3. **Model** (Modell)
4. **Timestamp** (Tidsstempel)
5. **Ledger ID** (Ledger-ID)
6. **System prompt** (System-prompt)
7. **Uncertainty** (Usikkerhet)

This package is the canonical reference implementation of that affordance.

## Install

```sh
bun add @lexitsp/trustbadge-react @lexitsp/sdk
# or: npm install @lexitsp/trustbadge-react @lexitsp/sdk
```

Peer-deps: `react@>=18`, `react-dom@>=18`, `@lexitsp/sdk@^3.0.0-alpha.5`.

Public docs: https://truststandardprotocol.org/docs

## Quick start

```tsx
import { TrustBadge } from "@lexitsp/trustbadge-react";
import "@lexitsp/trustbadge-react/styles.css";
import { verifyOnline } from "@lexitsp/sdk/v3";

export function MyResponse({ envelope }) {
  return (
    <div>
      <p>{envelope.content.value}</p>
      <TrustBadge envelope={envelope} verify={verifyOnline} />
    </div>
  );
}
```

## Props

| Prop            | Type                                               | Default    | Description                                                            |
|-----------------|----------------------------------------------------|------------|------------------------------------------------------------------------|
| `envelope`      | `TrustEnvelope`                                    | (required) | The signed envelope to render.                                          |
| `verify`        | `(env) => Promise<VerifyResult>`                   | —          | Verifier function (typically `verifyOnline`). Required unless `initialResult`. |
| `initialResult` | `VerifyResult`                                     | —          | Pre-computed result (e.g. from SSR). Skips initial verify call.         |
| `verifyMode`    | `"lazy" \| "eager" \| "manual"`                    | `"lazy"`   | When verify fires: lazy (on first open), eager (on mount), manual (caller). |
| `labels`        | `Partial<Labels>`                                  | English    | Override individual UI strings for i18n.                                |
| `className`     | `string`                                           | —          | Additional class on outer container.                                    |
| `onResult`      | `(result) => void`                                 | —          | Callback after verify completes.                                         |

## Styling

The component ships a default theme via CSS Custom Properties.
Override in your global CSS:

```css
:root {
  --tsp-color-verified: #047857;
  --tsp-color-warn: #f59e0b;
  --tsp-color-danger: #dc2626;
  --tsp-color-trust: #ea580c;
  --tsp-radius: 6px;
  --tsp-font: 'Inter', sans-serif;
  --tsp-panel-width: min(440px, 90vw);
}
```

See `src/styles.css` for the full list of variables.

## i18n

```tsx
import { TrustBadge, type Labels } from "@lexitsp/trustbadge-react";

const norwegian: Partial<Labels> = {
  badgeVerified: "Verifisert",
  badgeFailedCrypto: "Verifisering feilet",
  panelTitle: "Tillit-detaljer",
  sectionSource: "Kilde",
  // ... osv
};

<TrustBadge envelope={env} verify={verifyOnline} labels={norwegian} />;
```

## Failure tiers

A failed verification is rendered in one of three visual tiers (per design spec II.3):

- **`crypto`** — RED, loud. Cryptographic primitive failed (signature, hash, cert chain). Likely tampering.
- **`trust`** — ORANGE. Trust check failed (cert expired, revoked, DANE mismatch).
- **`network`** — YELLOW. Network/external check could not complete (manifest fetch, TSA reach).

This dispatch is automatic based on `result.checks` — no consumer wiring needed.

## License

MIT © LexiCo AS
