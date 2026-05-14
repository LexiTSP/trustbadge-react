# Contributing

Thanks for helping improve TrustBadge.

Before opening a PR:

1. Keep badge states faithful to verifier results.
2. Do not soften cryptographic failures into marketing language.
3. Keep visual tiers aligned with the TSP charter: crypto failure is red, trust failure is orange, network failure is yellow.
4. Run `bun run --cwd packages/trustbadge-react vitest run`.

For verifier semantics, coordinate changes with `@lexitsp/sdk` first.
