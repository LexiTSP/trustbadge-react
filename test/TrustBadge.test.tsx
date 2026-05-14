import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TrustBadge } from "../src/TrustBadge";
import type { TrustEnvelope, VerifyResult } from "@lexitsp/sdk/v3";

const sampleEnvelope: TrustEnvelope = {
  tsp: "3.0",
  content: { type: "text", value: "Hei", hash: "a".repeat(64) },
  declaration: {
    primarySource: {
      type: "legal-database",
      url: "https://lovdata.no/dokument/NL/lov/1997-02-28-19",
      title: "Folketrygdloven",
      retrieved: "2026-04-30T10:00:00Z",
    },
    citations: [
      {
        url: "https://lovdata.no/lov/1997-02-28-19/§11-5",
        paragraph: "§11-5",
        quote: "Vilkår for AAP...",
        retrieved: "2026-04-30T10:00:00Z",
      },
    ],
  },
  process: {
    model: {
      name: "normistral",
      version: "11b",
      provider: "norwai-local",
      temperature: 0.0,
      contextWindow: 8192,
    },
    systemPrompt: { hash: "0".repeat(64), text: "Du er en oversetter." },
  },
  alignment: {
    uncertainty: [
      { field: "modell-temperatur", reason: "Modellen var ny", severity: "med" },
    ],
    humanReviewRequired: false,
    policy: { id: "default", version: "1.0" },
  },
  timestamp: {
    claimed: "2026-04-30T12:00:00Z",
    tsaToken: "__phase1__",
    tsaUrl: "https://placeholder.invalid/phase1",
  },
  ledger: {
    id: "01876543-0000-7000-8000-000000000001",
    prevHash: "0".repeat(64),
    hash: "f".repeat(64),
  },
  signatures: [
    {
      role: "instance",
      algorithm: "ed25519",
      keyRef: "https://example.test/.well-known/tsp/keys.json#i1",
      signature: "AAAA",
      certChain: [],
    },
  ],
};

const validResult: VerifyResult = {
  valid: true,
  envelope: sampleEnvelope,
  checks: {
    schema: { status: "passed", detail: "ok" },
    contentHash: { status: "passed", detail: "ok" },
    ledgerHash: { status: "passed", detail: "ok" },
    manifestFetch: { status: "passed", detail: "cached" },
    rootSignature: { status: "passed", detail: "ok" },
    certChain: { status: "passed", detail: "ok" },
    certValidity: { status: "passed", detail: "ok" },
    revocation: { status: "passed", detail: "ok" },
    tsa: { status: "skipped", detail: "legacy" },
    signatures: [{ status: "passed", detail: "ok" }],
  },
  warnings: [],
};

const failedCryptoResult: VerifyResult = {
  ...validResult,
  valid: false,
  checks: {
    ...validResult.checks,
    contentHash: { status: "failed", detail: "hash mismatch" },
  },
};

describe("<TrustBadge>", () => {
  it("renders 'pending' state initially in lazy mode", () => {
    const { container } = render(<TrustBadge envelope={sampleEnvelope} verify={async () => validResult} />);
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    expect(trigger).toHaveTextContent(/click to verify/i);
  });

  it("opens panel on click and triggers lazy verify", async () => {
    const verify = vi.fn().mockResolvedValue(validResult);
    const { container } = render(<TrustBadge envelope={sampleEnvelope} verify={verify} />);
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(verify).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(trigger).toHaveTextContent(/verified/i);
    });
  });

  it("uses initialResult without calling verify", async () => {
    const verify = vi.fn().mockResolvedValue(validResult);
    const { container } = render(
      <TrustBadge envelope={sampleEnvelope} verify={verify} initialResult={validResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    expect(trigger).toHaveTextContent(/verified/i);
    fireEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 20));
    expect(verify).not.toHaveBeenCalled();
  });

  it("eager mode calls verify on mount", async () => {
    const verify = vi.fn().mockResolvedValue(validResult);
    render(<TrustBadge envelope={sampleEnvelope} verify={verify} verifyMode="eager" />);
    await waitFor(() => expect(verify).toHaveBeenCalledTimes(1));
  });

  it("renders crypto-tier badge for cryptographic failure", () => {
    const { container } = render(
      <TrustBadge envelope={sampleEnvelope} initialResult={failedCryptoResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    expect(trigger).toHaveTextContent(/verification failed/i);
    fireEvent.click(trigger);
    expect(screen.getByText(/cryptographic verification failed/i)).toBeInTheDocument();
  });

  it("renders charter §5 sections in panel", () => {
    const { container } = render(<TrustBadge envelope={sampleEnvelope} initialResult={validResult} />);
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    // dt elements are the section labels
    const dts = Array.from(container.querySelectorAll("dt")).map((el) => el.textContent);
    expect(dts).toEqual(
      expect.arrayContaining([
        "Source",
        "Citations",
        "Model",
        "Timestamp",
        "Ledger ID",
        "System prompt",
        "Uncertainty",
      ])
    );
  });

  it("escape key closes panel", () => {
    const { container } = render(<TrustBadge envelope={sampleEnvelope} initialResult={validResult} />);
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respects custom labels", () => {
    const { container } = render(
      <TrustBadge
        envelope={sampleEnvelope}
        initialResult={validResult}
        labels={{ badgeVerified: "Verifisert" }}
      />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    expect(trigger).toHaveTextContent("Verifisert");
  });

  it("calls onResult after verify completes", async () => {
    const onResult = vi.fn();
    const verify = vi.fn().mockResolvedValue(validResult);
    const { container } = render(
      <TrustBadge envelope={sampleEnvelope} verify={verify} onResult={onResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(validResult));
  });

  it("shows redacted system prompt when systemPrompt has redacted: true", () => {
    const envWithRedacted: TrustEnvelope = {
      ...sampleEnvelope,
      process: {
        ...sampleEnvelope.process,
        systemPrompt: { hash: "0".repeat(64), redacted: true, reason: "proprietary" },
      },
    };
    const { container } = render(<TrustBadge envelope={envWithRedacted} initialResult={validResult} />);
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(screen.getByText(/redacted/i)).toBeInTheDocument();
    expect(screen.getByText(/proprietary/)).toBeInTheDocument();
  });

  it("renders refusal section when alignment.refusal is present", () => {
    const envRefused: TrustEnvelope = {
      ...sampleEnvelope,
      alignment: {
        ...sampleEnvelope.alignment,
        refusal: { reason: "policy violation: medical advice" },
      },
    };
    const { container } = render(
      <TrustBadge envelope={envRefused} initialResult={validResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(screen.getByText(/policy violation: medical advice/)).toBeInTheDocument();
  });

  it("renders flag chips for each alignment.flag", () => {
    const envWithFlags: TrustEnvelope = {
      ...sampleEnvelope,
      alignment: {
        ...sampleEnvelope.alignment,
        flags: [
          { code: "low-confidence" },
          { code: "policy-edge", detail: "near jurisdictional boundary" },
        ],
      },
    };
    const { container } = render(
      <TrustBadge envelope={envWithFlags} initialResult={validResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(container.querySelectorAll(".tsp-flags__chip")).toHaveLength(2);
    expect(screen.getByText(/low-confidence/)).toBeInTheDocument();
    expect(screen.getByText(/near jurisdictional boundary/)).toBeInTheDocument();
  });

  it("renders policy section showing id and version", () => {
    const { container } = render(
      <TrustBadge envelope={sampleEnvelope} initialResult={validResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    const dts = container.querySelectorAll("dt");
    const labels = Array.from(dts).map((d) => d.textContent);
    expect(labels).toContain("Policy ID");
    expect(labels).toContain("Version");
    expect(screen.getByText("default")).toBeInTheDocument();
  });

  it("shows 'No flags raised' when alignment.flags is empty", () => {
    const { container } = render(
      <TrustBadge envelope={sampleEnvelope} initialResult={validResult} />
    );
    const trigger = container.querySelector(".tsp-badge__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(screen.getByText(/no flags raised/i)).toBeInTheDocument();
  });
});
