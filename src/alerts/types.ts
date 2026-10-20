export type Severity = "warning" | "watch" | "advisory" | "statement";

export interface Alert {
  title: string;
  severity: Severity;
  /** Plain text body; may contain line breaks. */
  text: string;
  /** Area the agency issued the alert for. */
  area: string;
  /** ISO 8601 expiry, when the agency provides one. */
  expires?: string;
  /** Agency name, shown as the source. */
  source: string;
}

const RANK: Record<Severity, number> = { warning: 0, watch: 1, advisory: 2, statement: 3 };

export const bySeverity = (a: Alert, b: Alert): number => RANK[a.severity] - RANK[b.severity];

/** Drops repeats of the same alert (agencies often publish one per overlapping zone). */
export function dedupe(alerts: Alert[]): Alert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    const key = `${alert.title}\n${alert.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
