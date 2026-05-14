import * as React from 'react';
import { TrustEnvelope, VerifyResult } from '@lexitsp/sdk/v3';

/**
 * @lexitsp/trustbadge-react · labels
 *
 * English defaults. Consumer overrides via `labels` prop.
 * Per spec II.5/C: English baseline, prop-overridable.
 */
interface Labels {
    badgeUnverified: string;
    badgeVerifying: string;
    badgeVerified: string;
    badgeFailedCrypto: string;
    badgeFailedNetwork: string;
    badgeFailedTrust: string;
    panelTitle: string;
    panelClose: string;
    sectionSource: string;
    sectionCitations: string;
    sectionModel: string;
    sectionTimestamp: string;
    sectionLedgerId: string;
    sectionSystemPrompt: string;
    sectionUncertainty: string;
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
    sectionRefusal: string;
    sectionFlags: string;
    sectionPolicy: string;
    refusalReason: string;
    noFlags: string;
    policyId: string;
    policyVersion: string;
    tierCryptoMessage: string;
    tierNetworkMessage: string;
    tierTrustMessage: string;
}
declare const DEFAULT_LABELS: Labels;
declare function mergeLabels(overrides?: Partial<Labels>): Labels;

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

interface TrustBadgeProps {
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
declare function TrustBadge(props: TrustBadgeProps): React.JSX.Element;

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

type Tier = "verified" | "crypto" | "trust" | "network" | "pending" | "verifying";
declare function getTier(result: VerifyResult | null | undefined, isVerifying: boolean): Tier;
declare function isLoudTier(tier: Tier): boolean;

/**
 * @lexitsp/trustbadge-react · formatting helpers
 */
declare function truncateHash(hex: string, leading?: number, trailing?: number): string;
declare function formatIsoTime(iso: string): string;
declare function tsaUrlHostname(url: string): string;

export { DEFAULT_LABELS, type Labels, type Tier, TrustBadge, type TrustBadgeProps, formatIsoTime, getTier, isLoudTier, mergeLabels, truncateHash, tsaUrlHostname };
