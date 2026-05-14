// src/TrustBadge.tsx
import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState as useState2 } from "react";

// src/labels.ts
var DEFAULT_LABELS = {
  badgeUnverified: "Click to verify",
  badgeVerifying: "Verifying\u2026",
  badgeVerified: "Verified",
  badgeFailedCrypto: "Verification failed",
  badgeFailedNetwork: "Verification incomplete",
  badgeFailedTrust: "Trust check failed",
  panelTitle: "Trust details",
  panelClose: "Close",
  sectionSource: "Source",
  sectionCitations: "Citations",
  sectionModel: "Model",
  sectionTimestamp: "Timestamp",
  sectionLedgerId: "Ledger ID",
  sectionSystemPrompt: "System prompt",
  sectionUncertainty: "Uncertainty",
  sourceTitle: "Title",
  sourceUrl: "URL",
  sourceRetrieved: "Retrieved",
  citationParagraph: "Paragraph",
  citationQuote: "Quote",
  modelName: "Name",
  modelTemperature: "Temperature",
  modelContextWindow: "Context window",
  modelProvider: "Provider",
  systemPromptText: "Text",
  systemPromptRedacted: "Redacted",
  systemPromptHash: "Hash",
  uncertaintySeverityLow: "low",
  uncertaintySeverityMed: "medium",
  uncertaintySeverityHigh: "high",
  uncertaintyNone: "No uncertainty flagged",
  timestampClaimed: "Claimed time",
  timestampTsa: "TSA",
  timestampTsaPlaceholder: "Not externally attested (alpha placeholder)",
  ledgerCopy: "Copy",
  ledgerCopied: "Copied",
  checkSchema: "Schema",
  checkContentHash: "Content hash",
  checkLedgerHash: "Ledger hash",
  checkManifestFetch: "Manifest fetch",
  checkRootSignature: "Org-root signature",
  checkCertChain: "Instance cert chain",
  checkCertValidity: "Cert validity window",
  checkRevocation: "Revocation",
  checkTsa: "TSA token",
  checkDane: "DNS DANE",
  checkSignature: "Envelope signature",
  sectionRefusal: "Refusal",
  sectionFlags: "Alignment flags",
  sectionPolicy: "Policy",
  refusalReason: "Reason",
  noFlags: "No flags raised",
  policyId: "Policy ID",
  policyVersion: "Version",
  tierCryptoMessage: "Cryptographic verification failed. This envelope may have been tampered with.",
  tierNetworkMessage: "Could not complete verification due to a network issue. Try again or contact support.",
  tierTrustMessage: "Trust check failed (cert validity, revocation, or DANE)."
};
function mergeLabels(overrides) {
  if (!overrides) return DEFAULT_LABELS;
  return { ...DEFAULT_LABELS, ...overrides };
}

// src/status-tier.ts
function getTier(result, isVerifying) {
  if (isVerifying) return "verifying";
  if (!result) return "pending";
  if (result.valid) return "verified";
  const c = result.checks;
  if (c.contentHash.status === "failed") return "crypto";
  if (c.ledgerHash.status === "failed") return "crypto";
  if (c.rootSignature.status === "failed") return "crypto";
  if (c.certChain.status === "failed") return "crypto";
  if (c.signatures.some((s) => s.status === "failed")) return "crypto";
  if (c.schema.status === "failed") return "crypto";
  if (c.tsa.status === "failed" && /placeholder/i.test(c.tsa.detail)) return "crypto";
  if (c.tsa.status === "failed" && /signature/i.test(c.tsa.detail)) return "crypto";
  if (c.tsa.status === "failed" && /not match/i.test(c.tsa.detail)) return "crypto";
  if (c.certValidity.status === "failed") return "trust";
  if (c.revocation.status === "failed") return "trust";
  if (c.dane?.status === "failed") return "trust";
  if (c.manifestFetch.status === "failed") return "network";
  if (c.tsa.status === "failed") return "network";
  return "network";
}
function isLoudTier(tier) {
  return tier === "crypto";
}

// src/format.ts
function truncateHash(hex, leading = 8, trailing = 4) {
  if (hex.length <= leading + trailing + 1) return hex;
  return `${hex.slice(0, leading)}\u2026${hex.slice(-trailing)}`;
}
function formatIsoTime(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
  } catch {
    return iso;
  }
}
function tsaUrlHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// src/TrustBadge.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function TrustBadge(props) {
  const {
    envelope,
    verify,
    initialResult,
    verifyMode = "lazy",
    labels: labelOverrides,
    className,
    onResult
  } = props;
  const labels = mergeLabels(labelOverrides);
  const panelId = useId();
  const [open, setOpen] = useState2(false);
  const [result, setResult] = useState2(initialResult ?? null);
  const [verifying, setVerifying] = useState2(false);
  const [hasFiredVerify, setHasFiredVerify] = useState2(!!initialResult);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const runVerify = useCallback(async () => {
    if (!verify) return;
    setVerifying(true);
    try {
      const r = await verify(envelope);
      setResult(r);
      onResult?.(r);
    } catch (e) {
      const synthetic = {
        valid: false,
        envelope,
        checks: {
          schema: { status: "skipped", detail: "verifier threw before checks ran" },
          contentHash: { status: "skipped", detail: "" },
          ledgerHash: { status: "skipped", detail: "" },
          manifestFetch: { status: "failed", detail: `verifier threw: ${e.message}` },
          rootSignature: { status: "skipped", detail: "" },
          certChain: { status: "skipped", detail: "" },
          certValidity: { status: "skipped", detail: "" },
          revocation: { status: "skipped", detail: "" },
          tsa: { status: "skipped", detail: "" },
          signatures: []
        },
        warnings: []
      };
      setResult(synthetic);
      onResult?.(synthetic);
    } finally {
      setVerifying(false);
      setHasFiredVerify(true);
    }
  }, [verify, envelope, onResult]);
  useEffect(() => {
    if (verifyMode === "eager" && !hasFiredVerify) {
      void runVerify();
    }
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);
  const tier = getTier(result, verifying);
  const badgeLabel = badgeLabelFor(tier, labels);
  const badgeIcon = badgeIconFor(tier);
  return /* @__PURE__ */ jsxs("span", { className: ["tsp-badge", `tsp-badge--${tier}`, className].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        type: "button",
        className: "tsp-badge__trigger",
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: open ? handleClose : handleOpen,
        children: [
          /* @__PURE__ */ jsx("span", { className: "tsp-badge__icon", "aria-hidden": "true", children: badgeIcon }),
          /* @__PURE__ */ jsx("span", { className: "tsp-badge__label", children: badgeLabel })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        id: panelId,
        className: "tsp-panel",
        role: "dialog",
        "aria-modal": "false",
        "aria-label": labels.panelTitle,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "tsp-panel__header", children: [
            /* @__PURE__ */ jsx("h2", { className: "tsp-panel__title", children: labels.panelTitle }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tsp-panel__close",
                onClick: handleClose,
                "aria-label": labels.panelClose,
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(TierMessage, { tier, labels }),
          /* @__PURE__ */ jsxs("dl", { className: "tsp-panel__sections", children: [
            /* @__PURE__ */ jsx(SourceSection, { envelope, labels }),
            /* @__PURE__ */ jsx(CitationsSection, { envelope, labels }),
            /* @__PURE__ */ jsx(ModelSection, { envelope, labels }),
            /* @__PURE__ */ jsx(TimestampSection, { envelope, labels }),
            /* @__PURE__ */ jsx(LedgerSection, { envelope, labels }),
            /* @__PURE__ */ jsx(SystemPromptSection, { envelope, labels }),
            /* @__PURE__ */ jsx(UncertaintySection, { envelope, labels }),
            /* @__PURE__ */ jsx(AlignmentExtraSection, { envelope, labels })
          ] }),
          result && !result.valid && /* @__PURE__ */ jsx(ChecksList, { result, labels })
        ]
      }
    )
  ] });
}
function badgeLabelFor(tier, l) {
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
function badgeIconFor(tier) {
  switch (tier) {
    case "verified":
      return "\u2713";
    case "crypto":
      return "\u2717";
    case "network":
      return "\u26A0";
    case "trust":
      return "\u25B3";
    case "verifying":
      return "\u2026";
    case "pending":
    default:
      return "?";
  }
}
function TierMessage({ tier, labels }) {
  if (tier === "crypto") {
    return /* @__PURE__ */ jsx("p", { className: "tsp-panel__tier-message tsp-panel__tier-message--crypto", children: labels.tierCryptoMessage });
  }
  if (tier === "network") {
    return /* @__PURE__ */ jsx("p", { className: "tsp-panel__tier-message tsp-panel__tier-message--network", children: labels.tierNetworkMessage });
  }
  if (tier === "trust") {
    return /* @__PURE__ */ jsx("p", { className: "tsp-panel__tier-message tsp-panel__tier-message--trust", children: labels.tierTrustMessage });
  }
  return null;
}
function Section({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "tsp-panel__section", children: [
    /* @__PURE__ */ jsx("dt", { className: "tsp-panel__section-label", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "tsp-panel__section-value", children })
  ] });
}
function SourceSection({ envelope, labels }) {
  const s = envelope.declaration.primarySource;
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionSource, children: /* @__PURE__ */ jsxs("div", { className: "tsp-source", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.sourceTitle,
        ":"
      ] }),
      " ",
      s.title
    ] }),
    s.url && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.sourceUrl,
        ":"
      ] }),
      " ",
      /* @__PURE__ */ jsx("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", children: s.url })
    ] }),
    s.retrieved && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.sourceRetrieved,
        ":"
      ] }),
      " ",
      formatIsoTime(s.retrieved)
    ] })
  ] }) });
}
function CitationsSection({ envelope, labels }) {
  const cites = envelope.declaration.citations;
  if (!cites || cites.length === 0) return null;
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionCitations, children: /* @__PURE__ */ jsx("ul", { className: "tsp-citations", children: cites.map((c, i) => /* @__PURE__ */ jsxs("li", { className: "tsp-citation", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.citationParagraph,
        ":"
      ] }),
      " ",
      /* @__PURE__ */ jsx("a", { href: c.url, target: "_blank", rel: "noopener noreferrer", children: c.paragraph })
    ] }),
    /* @__PURE__ */ jsx("blockquote", { className: "tsp-citation__quote", children: c.quote })
  ] }, i)) }) });
}
function ModelSection({ envelope, labels }) {
  const m = envelope.process.model;
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionModel, children: /* @__PURE__ */ jsxs("div", { className: "tsp-model", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.modelName,
        ":"
      ] }),
      " ",
      m.name,
      " ",
      /* @__PURE__ */ jsx("span", { className: "tsp-model__version", children: m.version })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.modelProvider,
        ":"
      ] }),
      " ",
      m.provider
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.modelTemperature,
        ":"
      ] }),
      " ",
      m.temperature
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.modelContextWindow,
        ":"
      ] }),
      " ",
      m.contextWindow.toLocaleString()
    ] })
  ] }) });
}
function TimestampSection({ envelope, labels }) {
  const t = envelope.timestamp;
  const isPlaceholder = t.tsaToken === "__phase1__";
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionTimestamp, children: /* @__PURE__ */ jsxs("div", { className: "tsp-timestamp", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.timestampClaimed,
        ":"
      ] }),
      " ",
      formatIsoTime(t.claimed)
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.timestampTsa,
        ":"
      ] }),
      " ",
      isPlaceholder ? /* @__PURE__ */ jsx("em", { className: "tsp-timestamp__placeholder", children: labels.timestampTsaPlaceholder }) : /* @__PURE__ */ jsx("span", { children: tsaUrlHostname(t.tsaUrl) })
    ] })
  ] }) });
}
function LedgerSection({ envelope, labels }) {
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
  return /* @__PURE__ */ jsxs(Section, { label: labels.sectionLedgerId, children: [
    /* @__PURE__ */ jsx("code", { className: "tsp-ledger__id", title: id, children: truncateHash(id, 8, 12) }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "tsp-ledger__copy", onClick: onCopy, children: copied ? labels.ledgerCopied : labels.ledgerCopy })
  ] });
}
function SystemPromptSection({ envelope, labels }) {
  const sp = envelope.process.systemPrompt;
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionSystemPrompt, children: "text" in sp ? /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("pre", { className: "tsp-system-prompt__text", children: sp.text }),
    /* @__PURE__ */ jsxs("div", { className: "tsp-system-prompt__hash", children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.systemPromptHash,
        ":"
      ] }),
      " ",
      /* @__PURE__ */ jsx("code", { children: truncateHash(sp.hash) })
    ] })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "tsp-system-prompt__redacted", children: [
    /* @__PURE__ */ jsxs("strong", { children: [
      labels.systemPromptRedacted,
      ":"
    ] }),
    " ",
    sp.reason,
    /* @__PURE__ */ jsxs("div", { className: "tsp-system-prompt__hash", children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        labels.systemPromptHash,
        ":"
      ] }),
      " ",
      /* @__PURE__ */ jsx("code", { children: truncateHash(sp.hash) })
    ] })
  ] }) });
}
function UncertaintySection({ envelope, labels }) {
  const items = envelope.alignment.uncertainty;
  return /* @__PURE__ */ jsx(Section, { label: labels.sectionUncertainty, children: !items || items.length === 0 ? /* @__PURE__ */ jsx("em", { children: labels.uncertaintyNone }) : /* @__PURE__ */ jsx("ul", { className: "tsp-uncertainty", children: items.map((u, i) => /* @__PURE__ */ jsxs("li", { className: `tsp-uncertainty__item tsp-uncertainty__item--${u.severity}`, children: [
    /* @__PURE__ */ jsx("span", { className: `tsp-uncertainty__severity tsp-uncertainty__severity--${u.severity}`, children: severityLabel(u.severity, labels) }),
    /* @__PURE__ */ jsxs("span", { className: "tsp-uncertainty__field", children: [
      u.field,
      ":"
    ] }),
    " ",
    /* @__PURE__ */ jsx("span", { className: "tsp-uncertainty__reason", children: u.reason })
  ] }, i)) }) });
}
function AlignmentExtraSection({ envelope, labels }) {
  const refusal = envelope.alignment.refusal;
  const flags = envelope.alignment.flags ?? [];
  const policy = envelope.alignment.policy;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    refusal ? /* @__PURE__ */ jsx(Section, { label: labels.sectionRefusal, children: /* @__PURE__ */ jsxs("div", { className: "tsp-refusal", children: [
      /* @__PURE__ */ jsxs("span", { className: "tsp-refusal__label", children: [
        labels.refusalReason,
        ":"
      ] }),
      " ",
      /* @__PURE__ */ jsx("span", { className: "tsp-refusal__reason", children: refusal.reason })
    ] }) }) : null,
    /* @__PURE__ */ jsx(Section, { label: labels.sectionFlags, children: flags.length === 0 ? /* @__PURE__ */ jsx("em", { children: labels.noFlags }) : /* @__PURE__ */ jsx("ul", { className: "tsp-flags", children: flags.map((f, i) => /* @__PURE__ */ jsxs("li", { className: "tsp-flags__chip", children: [
      /* @__PURE__ */ jsx("code", { className: "tsp-flags__code", children: f.code }),
      f.detail ? /* @__PURE__ */ jsxs("span", { className: "tsp-flags__detail", children: [
        ": ",
        f.detail
      ] }) : null
    ] }, i)) }) }),
    policy ? /* @__PURE__ */ jsx(Section, { label: labels.sectionPolicy, children: /* @__PURE__ */ jsxs("dl", { className: "tsp-policy", children: [
      /* @__PURE__ */ jsx("dt", { children: labels.policyId }),
      /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("code", { children: policy.id }) }),
      /* @__PURE__ */ jsx("dt", { children: labels.policyVersion }),
      /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("code", { children: policy.version }) })
    ] }) }) : null
  ] });
}
function severityLabel(sev, labels) {
  if (sev === "low") return labels.uncertaintySeverityLow;
  if (sev === "med") return labels.uncertaintySeverityMed;
  return labels.uncertaintySeverityHigh;
}
function ChecksList({ result, labels }) {
  const c = result.checks;
  const rows = [
    { label: labels.checkSchema, status: c.schema.status, detail: c.schema.detail },
    { label: labels.checkContentHash, status: c.contentHash.status, detail: c.contentHash.detail },
    { label: labels.checkLedgerHash, status: c.ledgerHash.status, detail: c.ledgerHash.detail },
    { label: labels.checkManifestFetch, status: c.manifestFetch.status, detail: c.manifestFetch.detail },
    { label: labels.checkRootSignature, status: c.rootSignature.status, detail: c.rootSignature.detail },
    { label: labels.checkCertChain, status: c.certChain.status, detail: c.certChain.detail },
    { label: labels.checkCertValidity, status: c.certValidity.status, detail: c.certValidity.detail },
    { label: labels.checkRevocation, status: c.revocation.status, detail: c.revocation.detail },
    { label: labels.checkTsa, status: c.tsa.status, detail: c.tsa.detail }
  ];
  if (c.dane) rows.push({ label: labels.checkDane, status: c.dane.status, detail: c.dane.detail });
  c.signatures.forEach(
    (s, i) => rows.push({ label: `${labels.checkSignature} [${i}]`, status: s.status, detail: s.detail })
  );
  return /* @__PURE__ */ jsx("ul", { className: "tsp-checks", children: rows.map((r, i) => /* @__PURE__ */ jsxs("li", { className: `tsp-check tsp-check--${r.status}`, children: [
    /* @__PURE__ */ jsx("span", { className: "tsp-check__label", children: r.label }),
    /* @__PURE__ */ jsx("span", { className: "tsp-check__status", children: r.status }),
    /* @__PURE__ */ jsx("span", { className: "tsp-check__detail", children: r.detail })
  ] }, i)) });
}
export {
  DEFAULT_LABELS,
  TrustBadge,
  formatIsoTime,
  getTier,
  isLoudTier,
  mergeLabels,
  truncateHash,
  tsaUrlHostname
};
