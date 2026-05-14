/**
 * @lexitsp/trustbadge-react · TrustBadge
 *
 * Charter §5 affordance: ETT klikk åpner et panel med syv felter.
 * Monolith component (sub-prosjekt II spec section 6 — komposabilitet/A).
 *
 * Verification trigger modes (spec II.2):
 *   - "lazy" (default): verify runs on first panel open
 *   - "eager": verify runs on mount
 *   - "manual": verify only runs when consumer triggers via callback (advanced)
 *
 * Failure tier dispatch (spec II.3):
 *   crypto / trust / network — controls visual severity.
 */

import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { TrustEnvelope, VerifyResult } from "@lexitsp/sdk/v3";
import { mergeLabels, type Labels } from "./labels";
import { getTier, type Tier } from "./status-tier";
import { truncateHash, formatIsoTime, tsaUrlHostname } from "./format";

export interface TrustBadgeProps {
  envelope: TrustEnvelope;
  /** Verifier function. Required unless `initialResult` is provided. */
  verify?: (env: TrustEnvelope) => Promise<VerifyResult>;
  /** Pre-computed result (e.g. from SSR). Pre-empts initial verify call. */
  initialResult?: VerifyResult;
  /** When verification fires. Default "lazy". */
  verifyMode?: "lazy" | "eager" | "manual";
  /** Override default English labels. Partial — unspecified keys fall back. */
  labels?: Partial<Labels>;
  /** Optional class on outer container (in addition to .tsp-badge). */
  className?: string;
  /** Notified after a verify call completes. */
  onResult?: (result: VerifyResult) => void;
}

export function TrustBadge(props: TrustBadgeProps): React.JSX.Element {
  const {
    envelope,
    verify,
    initialResult,
    verifyMode = "lazy",
    labels: labelOverrides,
    className,
    onResult,
  } = props;

  const labels = mergeLabels(labelOverrides);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(initialResult ?? null);
  const [verifying, setVerifying] = useState(false);
  const [hasFiredVerify, setHasFiredVerify] = useState(!!initialResult);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const runVerify = useCallback(async () => {
    if (!verify) return;
    setVerifying(true);
    try {
      const r = await verify(envelope);
      setResult(r);
      onResult?.(r);
    } catch (e) {
      // Treat thrown errors as a synthetic failed result with all-network tier
      // — consumers should ideally have verify() return a VerifyResult rather than throwing.
      // We surface the error in detail.
      const synthetic: VerifyResult = {
        valid: false,
        envelope,
        checks: {
          schema: { status: "skipped", detail: "verifier threw before checks ran" },
          contentHash: { status: "skipped", detail: "" },
          ledgerHash: { status: "skipped", detail: "" },
          manifestFetch: { status: "failed", detail: `verifier threw: ${(e as Error).message}` },
          rootSignature: { status: "skipped", detail: "" },
          certChain: { status: "skipped", detail: "" },
          certValidity: { status: "skipped", detail: "" },
          revocation: { status: "skipped", detail: "" },
          tsa: { status: "skipped", detail: "" },
          signatures: [],
        },
        warnings: [],
      };
      setResult(synthetic);
      onResult?.(synthetic);
    } finally {
      setVerifying(false);
      setHasFiredVerify(true);
    }
  }, [verify, envelope, onResult]);

  // Eager mode: run verify on mount
  useEffect(() => {
    if (verifyMode === "eager" && !hasFiredVerify) {
      void runVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyMode]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (verifyMode === "lazy" && !hasFiredVerify) {
      void runVerify();
    }
  }, [verifyMode, hasFiredVerify, runVerify]);

  const handleClose = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape closes panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const tier: Tier = getTier(result, verifying);
  const badgeLabel = badgeLabelFor(tier, labels);
  const badgeIcon = badgeIconFor(tier);

  return (
    <span className={["tsp-badge", `tsp-badge--${tier}`, className].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        type="button"
        className="tsp-badge__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={open ? handleClose : handleOpen}
      >
        <span className="tsp-badge__icon" aria-hidden="true">
          {badgeIcon}
        </span>
        <span className="tsp-badge__label">{badgeLabel}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="tsp-panel"
          role="dialog"
          aria-modal="false"
          aria-label={labels.panelTitle}
        >
          <div className="tsp-panel__header">
            <h2 className="tsp-panel__title">{labels.panelTitle}</h2>
            <button
              type="button"
              className="tsp-panel__close"
              onClick={handleClose}
              aria-label={labels.panelClose}
            >
              ×
            </button>
          </div>

          <TierMessage tier={tier} labels={labels} />

          <dl className="tsp-panel__sections">
            <SourceSection envelope={envelope} labels={labels} />
            <CitationsSection envelope={envelope} labels={labels} />
            <ModelSection envelope={envelope} labels={labels} />
            <TimestampSection envelope={envelope} labels={labels} />
            <LedgerSection envelope={envelope} labels={labels} />
            <SystemPromptSection envelope={envelope} labels={labels} />
            <UncertaintySection envelope={envelope} labels={labels} />
            <AlignmentExtraSection envelope={envelope} labels={labels} />
          </dl>

          {result && !result.valid && <ChecksList result={result} labels={labels} />}
        </div>
      )}
    </span>
  );
}

// ─── Helpers / sub-renderers ─────────────────────────────────────────────

function badgeLabelFor(tier: Tier, l: Labels): string {
  switch (tier) {
    case "verified":
      return l.badgeVerified;
    case "crypto":
      return l.badgeFailedCrypto;
    case "network":
      return l.badgeFailedNetwork;
    case "trust":
      return l.badgeFailedTrust;
    case "verifying":
      return l.badgeVerifying;
    case "pending":
    default:
      return l.badgeUnverified;
  }
}

function badgeIconFor(tier: Tier): string {
  switch (tier) {
    case "verified":
      return "✓";
    case "crypto":
      return "✗";
    case "network":
      return "⚠";
    case "trust":
      return "△";
    case "verifying":
      return "…";
    case "pending":
    default:
      return "?";
  }
}

function TierMessage({ tier, labels }: { tier: Tier; labels: Labels }): React.JSX.Element | null {
  if (tier === "crypto") {
    return <p className="tsp-panel__tier-message tsp-panel__tier-message--crypto">{labels.tierCryptoMessage}</p>;
  }
  if (tier === "network") {
    return <p className="tsp-panel__tier-message tsp-panel__tier-message--network">{labels.tierNetworkMessage}</p>;
  }
  if (tier === "trust") {
    return <p className="tsp-panel__tier-message tsp-panel__tier-message--trust">{labels.tierTrustMessage}</p>;
  }
  return null;
}

function Section({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="tsp-panel__section">
      <dt className="tsp-panel__section-label">{label}</dt>
      <dd className="tsp-panel__section-value">{children}</dd>
    </div>
  );
}

function SourceSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const s = envelope.declaration.primarySource;
  return (
    <Section label={labels.sectionSource}>
      <div className="tsp-source">
        <div>
          <strong>{labels.sourceTitle}:</strong> {s.title}
        </div>
        {s.url && (
          <div>
            <strong>{labels.sourceUrl}:</strong>{" "}
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.url}
            </a>
          </div>
        )}
        {s.retrieved && (
          <div>
            <strong>{labels.sourceRetrieved}:</strong> {formatIsoTime(s.retrieved)}
          </div>
        )}
      </div>
    </Section>
  );
}

function CitationsSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element | null {
  const cites = envelope.declaration.citations;
  if (!cites || cites.length === 0) return null;
  return (
    <Section label={labels.sectionCitations}>
      <ul className="tsp-citations">
        {cites.map((c, i) => (
          <li key={i} className="tsp-citation">
            <div>
              <strong>{labels.citationParagraph}:</strong>{" "}
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.paragraph}
              </a>
            </div>
            <blockquote className="tsp-citation__quote">{c.quote}</blockquote>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ModelSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const m = envelope.process.model;
  return (
    <Section label={labels.sectionModel}>
      <div className="tsp-model">
        <div>
          <strong>{labels.modelName}:</strong> {m.name} <span className="tsp-model__version">{m.version}</span>
        </div>
        <div>
          <strong>{labels.modelProvider}:</strong> {m.provider}
        </div>
        <div>
          <strong>{labels.modelTemperature}:</strong> {m.temperature}
        </div>
        <div>
          <strong>{labels.modelContextWindow}:</strong> {m.contextWindow.toLocaleString()}
        </div>
      </div>
    </Section>
  );
}

function TimestampSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const t = envelope.timestamp;
  const isPlaceholder = t.tsaToken === "__phase1__";
  return (
    <Section label={labels.sectionTimestamp}>
      <div className="tsp-timestamp">
        <div>
          <strong>{labels.timestampClaimed}:</strong> {formatIsoTime(t.claimed)}
        </div>
        <div>
          <strong>{labels.timestampTsa}:</strong>{" "}
          {isPlaceholder ? (
            <em className="tsp-timestamp__placeholder">{labels.timestampTsaPlaceholder}</em>
          ) : (
            <span>{tsaUrlHostname(t.tsaUrl)}</span>
          )}
        </div>
      </div>
    </Section>
  );
}

function LedgerSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const id = envelope.ledger.id;
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  return (
    <Section label={labels.sectionLedgerId}>
      <code className="tsp-ledger__id" title={id}>
        {truncateHash(id, 8, 12)}
      </code>
      <button type="button" className="tsp-ledger__copy" onClick={onCopy}>
        {copied ? labels.ledgerCopied : labels.ledgerCopy}
      </button>
    </Section>
  );
}

function SystemPromptSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const sp = envelope.process.systemPrompt;
  return (
    <Section label={labels.sectionSystemPrompt}>
      {"text" in sp ? (
        <div>
          <pre className="tsp-system-prompt__text">{sp.text}</pre>
          <div className="tsp-system-prompt__hash">
            <strong>{labels.systemPromptHash}:</strong> <code>{truncateHash(sp.hash)}</code>
          </div>
        </div>
      ) : (
        <div className="tsp-system-prompt__redacted">
          <strong>{labels.systemPromptRedacted}:</strong> {sp.reason}
          <div className="tsp-system-prompt__hash">
            <strong>{labels.systemPromptHash}:</strong> <code>{truncateHash(sp.hash)}</code>
          </div>
        </div>
      )}
    </Section>
  );
}

function UncertaintySection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const items = envelope.alignment.uncertainty;
  return (
    <Section label={labels.sectionUncertainty}>
      {!items || items.length === 0 ? (
        <em>{labels.uncertaintyNone}</em>
      ) : (
        <ul className="tsp-uncertainty">
          {items.map((u, i) => (
            <li key={i} className={`tsp-uncertainty__item tsp-uncertainty__item--${u.severity}`}>
              <span className={`tsp-uncertainty__severity tsp-uncertainty__severity--${u.severity}`}>
                {severityLabel(u.severity, labels)}
              </span>
              <span className="tsp-uncertainty__field">{u.field}:</span>{" "}
              <span className="tsp-uncertainty__reason">{u.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function AlignmentExtraSection({ envelope, labels }: { envelope: TrustEnvelope; labels: Labels }): React.JSX.Element {
  const refusal = envelope.alignment.refusal;
  const flags = envelope.alignment.flags ?? [];
  const policy = envelope.alignment.policy;
  return (
    <>
      {refusal ? (
        <Section label={labels.sectionRefusal}>
          <div className="tsp-refusal">
            <span className="tsp-refusal__label">{labels.refusalReason}:</span>{" "}
            <span className="tsp-refusal__reason">{refusal.reason}</span>
          </div>
        </Section>
      ) : null}
      <Section label={labels.sectionFlags}>
        {flags.length === 0 ? (
          <em>{labels.noFlags}</em>
        ) : (
          <ul className="tsp-flags">
            {flags.map((f, i) => (
              <li key={i} className="tsp-flags__chip">
                <code className="tsp-flags__code">{f.code}</code>
                {f.detail ? <span className="tsp-flags__detail">: {f.detail}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
      {policy ? (
        <Section label={labels.sectionPolicy}>
          <dl className="tsp-policy">
            <dt>{labels.policyId}</dt>
            <dd><code>{policy.id}</code></dd>
            <dt>{labels.policyVersion}</dt>
            <dd><code>{policy.version}</code></dd>
          </dl>
        </Section>
      ) : null}
    </>
  );
}

function severityLabel(sev: "low" | "med" | "high", labels: Labels): string {
  if (sev === "low") return labels.uncertaintySeverityLow;
  if (sev === "med") return labels.uncertaintySeverityMed;
  return labels.uncertaintySeverityHigh;
}

function ChecksList({ result, labels }: { result: VerifyResult; labels: Labels }): React.JSX.Element {
  const c = result.checks;
  const rows: { label: string; status: string; detail: string }[] = [
    { label: labels.checkSchema, status: c.schema.status, detail: c.schema.detail },
    { label: labels.checkContentHash, status: c.contentHash.status, detail: c.contentHash.detail },
    { label: labels.checkLedgerHash, status: c.ledgerHash.status, detail: c.ledgerHash.detail },
    { label: labels.checkManifestFetch, status: c.manifestFetch.status, detail: c.manifestFetch.detail },
    { label: labels.checkRootSignature, status: c.rootSignature.status, detail: c.rootSignature.detail },
    { label: labels.checkCertChain, status: c.certChain.status, detail: c.certChain.detail },
    { label: labels.checkCertValidity, status: c.certValidity.status, detail: c.certValidity.detail },
    { label: labels.checkRevocation, status: c.revocation.status, detail: c.revocation.detail },
    { label: labels.checkTsa, status: c.tsa.status, detail: c.tsa.detail },
  ];
  if (c.dane) rows.push({ label: labels.checkDane, status: c.dane.status, detail: c.dane.detail });
  c.signatures.forEach((s, i) =>
    rows.push({ label: `${labels.checkSignature} [${i}]`, status: s.status, detail: s.detail })
  );

  return (
    <ul className="tsp-checks">
      {rows.map((r, i) => (
        <li key={i} className={`tsp-check tsp-check--${r.status}`}>
          <span className="tsp-check__label">{r.label}</span>
          <span className="tsp-check__status">{r.status}</span>
          <span className="tsp-check__detail">{r.detail}</span>
        </li>
      ))}
    </ul>
  );
}
