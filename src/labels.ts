/**
 * @lexitsp/trustbadge-react · labels
 *
 * English defaults. Consumer overrides via `labels` prop.
 * Per spec II.5/C: English baseline, prop-overridable.
 */

export interface Labels {
  // Badge states
  badgeUnverified: string;
  badgeVerifying: string;
  badgeVerified: string;
  badgeFailedCrypto: string;
  badgeFailedNetwork: string;
  badgeFailedTrust: string;

  // Panel chrome
  panelTitle: string;
  panelClose: string;

  // Charter §5 sections
  sectionSource: string;
  sectionCitations: string;
  sectionModel: string;
  sectionTimestamp: string;
  sectionLedgerId: string;
  sectionSystemPrompt: string;
  sectionUncertainty: string;

  // Section detail labels
  sourceTitle: string;
  sourceUrl: string;
  sourceRetrieved: string;
  citationParagraph: string;
  citationQuote: string;
  modelName: string;
  modelTemperature: string;
  modelContextWindow: string;
  modelProvider: string;
  systemPromptText: string;
  systemPromptRedacted: string;
  systemPromptHash: string;
  uncertaintySeverityLow: string;
  uncertaintySeverityMed: string;
  uncertaintySeverityHigh: string;
  uncertaintyNone: string;
  timestampClaimed: string;
  timestampTsa: string;
  timestampTsaPlaceholder: string;
  ledgerCopy: string;
  ledgerCopied: string;

  // Per-check labels (for failure detail rendering)
  checkSchema: string;
  checkContentHash: string;
  checkLedgerHash: string;
  checkManifestFetch: string;
  checkRootSignature: string;
  checkCertChain: string;
  checkCertValidity: string;
  checkRevocation: string;
  checkTsa: string;
  checkDane: string;
  checkSignature: string;

  // v3.0.0-alpha.5: structured alignment additions
  sectionRefusal: string;
  sectionFlags: string;
  sectionPolicy: string;
  refusalReason: string;
  noFlags: string;
  policyId: string;
  policyVersion: string;

  // Generic
  tierCryptoMessage: string;
  tierNetworkMessage: string;
  tierTrustMessage: string;
}

export const DEFAULT_LABELS: Labels = {
  badgeUnverified: "Click to verify",
  badgeVerifying: "Verifying…",
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
  tierTrustMessage: "Trust check failed (cert validity, revocation, or DANE).",
};

export function mergeLabels(overrides?: Partial<Labels>): Labels {
  if (!overrides) return DEFAULT_LABELS;
  return { ...DEFAULT_LABELS, ...overrides };
}
