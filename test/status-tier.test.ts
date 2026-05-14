import { describe, it, expect } from "vitest";
import { getTier, isLoudTier } from "../src/status-tier";
import type { CheckResult, VerifyResult } from "@lexitsp/sdk/v3";

const baseChecks: {
  schema: CheckResult;
  contentHash: CheckResult;
  ledgerHash: CheckResult;
  manifestFetch: CheckResult;
  rootSignature: CheckResult;
  certChain: CheckResult;
  certValidity: CheckResult;
  revocation: CheckResult;
  tsa: CheckResult;
  signatures: CheckResult[];
} = {
  schema: { status: "passed", detail: "" },
  contentHash: { status: "passed", detail: "" },
  ledgerHash: { status: "passed", detail: "" },
  manifestFetch: { status: "passed", detail: "" },
  rootSignature: { status: "passed", detail: "" },
  certChain: { status: "passed", detail: "" },
  certValidity: { status: "passed", detail: "" },
  revocation: { status: "passed", detail: "" },
  tsa: { status: "passed", detail: "" },
  signatures: [{ status: "passed", detail: "" }],
};

function makeResult(valid: boolean, overrides: Partial<typeof baseChecks> = {}): VerifyResult {
  return {
    valid,
    envelope: {} as never,
    checks: { ...baseChecks, ...overrides },
    warnings: [],
  };
}

describe("getTier", () => {
  it("returns 'pending' when no result", () => {
    expect(getTier(null, false)).toBe("pending");
  });

  it("returns 'verifying' when isVerifying is true", () => {
    expect(getTier(null, true)).toBe("verifying");
  });

  it("returns 'verified' when result.valid is true", () => {
    expect(getTier(makeResult(true), false)).toBe("verified");
  });

  it("returns 'crypto' when contentHash failed", () => {
    expect(
      getTier(makeResult(false, { contentHash: { status: "failed", detail: "" } }), false)
    ).toBe("crypto");
  });

  it("returns 'crypto' when signature failed", () => {
    expect(
      getTier(makeResult(false, { signatures: [{ status: "failed", detail: "" }] }), false)
    ).toBe("crypto");
  });

  it("returns 'crypto' for tsa placeholder rejection", () => {
    expect(
      getTier(
        makeResult(false, { tsa: { status: "failed", detail: "legacy placeholder tsaToken" } }),
        false
      )
    ).toBe("crypto");
  });

  it("returns 'trust' when revocation failed", () => {
    expect(
      getTier(makeResult(false, { revocation: { status: "failed", detail: "revoked" } }), false)
    ).toBe("trust");
  });

  it("returns 'trust' when certValidity failed", () => {
    expect(
      getTier(
        makeResult(false, { certValidity: { status: "failed", detail: "expired" } }),
        false
      )
    ).toBe("trust");
  });

  it("returns 'network' when manifestFetch failed", () => {
    expect(
      getTier(
        makeResult(false, { manifestFetch: { status: "failed", detail: "ENETUNREACH" } }),
        false
      )
    ).toBe("network");
  });
});

describe("isLoudTier", () => {
  it("only crypto is loud", () => {
    expect(isLoudTier("crypto")).toBe(true);
    expect(isLoudTier("network")).toBe(false);
    expect(isLoudTier("trust")).toBe(false);
    expect(isLoudTier("verified")).toBe(false);
  });
});
