/**
 * @lexitsp/trustbadge-react · formatting helpers
 */

export function truncateHash(hex: string, leading = 8, trailing = 4): string {
  if (hex.length <= leading + trailing + 1) return hex;
  return `${hex.slice(0, leading)}…${hex.slice(-trailing)}`;
}

export function formatIsoTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

export function tsaUrlHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
