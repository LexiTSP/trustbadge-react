# Security Policy

The TrustBadge is the end-user surface of TSP. Misleading badge states,
forged "verified" UI, or leaks of sensitive envelope fields are all
treated as security issues.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** to LexiCo AS at
**security@truststandardprotocol.com**. We will acknowledge within five working days.

For non-security matters (questions, pilots, integration support) use
the general TSP channel at **hello@truststandardprotocol.com** instead.

Do **not** open public GitHub issues for:

- verifier-status spoofing or misleading badge states;
- UI flows that render forged or unverifiable envelopes as "verified";
- private signing material accidentally exposed by the component;
- supply-chain or package-integrity issues against
  `@lexitsp/trustbadge-react`.

## Supported versions

| Package | Supported |
| --- | --- |
| `@lexitsp/trustbadge-react@0.2.2` | yes |
| earlier alphas | best effort, please upgrade |

## Render-time considerations

- The component renders whatever envelope it is handed. If your
  envelope's `process.systemPrompt.text` or `alignment.uncertainty[]`
  contain internal context you do not want to publish, redact those
  fields before passing the envelope to TrustBadge. The SDK supports
  hash-only `systemPrompt` with an explicit `reason` for redaction.
- Always pair the badge with a `verify` function (typically
  `verifyOnline` from `@lexitsp/sdk/v3`) or a trusted `initialResult`.
  Rendering an envelope without verification gives the user a false
  sense of safety.

## Coordinated disclosure

We follow a 90-day coordinated-disclosure window from the date a fix
ships. Acknowledged reporters who wish to be credited will be listed in
the project changelog and on <https://truststandardprotocol.com>.
