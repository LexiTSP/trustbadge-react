/**
 * @lexitsp/trustbadge-react
 *
 * Charter §5 TrustBadge as a React component.
 * Pair with @lexitsp/sdk@^3 for the verify function.
 */

export { TrustBadge, type TrustBadgeProps } from "./TrustBadge";
export { DEFAULT_LABELS, mergeLabels, type Labels } from "./labels";
export { getTier, isLoudTier, type Tier } from "./status-tier";
export { truncateHash, formatIsoTime, tsaUrlHostname } from "./format";
