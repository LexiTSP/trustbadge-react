/**
 * @lexitsp/trustbadge-react · status tier
 *
 * Maps a VerifyResult to one of four UX tiers (per spec II.3/C).
 * - "verified": all checks passed
 * - "crypto": cryptographic failure (signature, hash, cert chain) — loud
 * - "trust": trust failure (validity, revocation, DANE) — orange
 * - "network": network failure (manifest fetch, TSA fetch) — yellow
 * - "pending": no result yet (lazy mode, before click)
 * - "verifying": result is being computed
 */

import type { VerifyResult } from "@lexitsp/sdk/v3";

export type Tier = "verified" | "crypto" | "trust" | "network" | "pending" | "verifying";

export function getTier(result: VerifyResult | null | undefined, isVerifying: boolean): Tier {
  if (isVerifying) return "verifying";
  if (!result) return "pending";
  if (result.valid) return "verified";

  const c = result.checks;

  // Cryptographic failures
  if (c.contentHash.status === "failed") return "crypto";
  if (c.ledgerHash.status === "failed") return "crypto";
  if (c.rootSignature.status === "failed") return "crypto";
  if (c.certChain.status === "failed") return "crypto";
  if (c.signatures.some((s) => s.status === "failed")) return "crypto";
  if (c.schema.status === "failed") return "crypto";
  // Placeholder-tsa rejection counts as crypto (a verifier said "I won't pretend this was attested")
  if (c.tsa.status === "failed" && /placeholder/i.test(c.tsa.detail)) return "crypto";
  if (c.tsa.status === "failed" && /signature/i.test(c.tsa.detail)) return "crypto";
  if (c.tsa.status === "failed" && /not match/i.test(c.tsa.detail)) return "crypto";

  // Trust failures (validity, revocation, DANE)
  if (c.certValidity.status === "failed") return "trust";
  if (c.revocation.status === "failed") return "trust";
  if (c.dane?.status === "failed") return "trust";

  // Network failures (manifest fetch, TSA network errors)
  if (c.manifestFetch.status === "failed") return "network";
  if (c.tsa.status === "failed") return "network";

  // Fallback: if valid is false but no specific check is "failed", treat as network
  return "network";
}

export function isLoudTier(tier: Tier): boolean {
  return tier === "crypto";
}
