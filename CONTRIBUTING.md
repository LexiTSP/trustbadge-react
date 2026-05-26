# Contributing to `@lexitsp/trustbadge-react`

Thanks for helping make TSP receipts legible to end users.

## Three non-negotiables

1. **Badge states must be faithful to verifier results.** A
   `verifyLocal` / `verifyOnline` failure must be reflected visibly. Do
   not soften cryptographic failures into reassuring language.
2. **Visual tiers stay aligned with the spec.** Crypto failure is red,
   trust failure is orange, network failure is yellow. The dispatch is
   automatic from `result.checks`; do not bypass it.
3. **No silent leakage.** The badge renders the envelope it is given.
   When you add new panel fields, double-check that we are not exposing
   data that operators are likely to keep redacted (system prompt text,
   raw uncertainty traces, internal alignment notes).

## Running the suite

```bash
bun install
bun run test     # vitest run
```

## Coordinating with the SDK

For verifier semantics — what a `VerifyResult` actually means in each
tier — open an issue on [`LexiTSP/sdk`](https://github.com/LexiTSP/sdk)
first. We keep the SDK and TrustBadge aligned per release so the user
experience reads the same regardless of integration.

## Reporting security issues

Do **not** report security issues in public. See [`SECURITY.md`](./SECURITY.md).

## Contact

LexiCo AS · Tønsberg, Norway · <https://truststandardprotocol.com> · hello@truststandardprotocol.com
