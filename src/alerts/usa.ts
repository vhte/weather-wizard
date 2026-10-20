import type { City } from "../cities";
import { getJson } from "../http";
import { bySeverity, dedupe, type Alert, type Severity } from "./types";

/** National Weather Service: active alerts for a single point. */
const NWS_ALERTS_URL = "https://api.weather.gov/alerts/active";

const SOURCE = "National Weather Service";

export interface NwsAlertFeature {
  properties: {
    event?: string;
    headline?: string;
    description?: string;
    instruction?: string | null;
    areaDesc?: string;
    expires?: string;
    ends?: string | null;
    senderName?: string;
  };
}

export const buildUsaAlertsUrl = (city: City): string =>
  `${NWS_ALERTS_URL}?point=${city.lat.toFixed(4)},${city.lon.toFixed(4)}&status=actual`;

/** NWS encodes the level in the event name ("Winter Storm Warning"). */
export function toSeverity(event: string): Severity {
  const name = event.toLowerCase();
  if (name.includes("warning") || name.includes("emergency")) return "warning";
  if (name.includes("watch")) return "watch";
  if (name.includes("advisory")) return "advisory";
  return "statement";
}

export function toAlert(feature: NwsAlertFeature): Alert {
  const props = feature.properties;
  const event = props.event ?? "Weather alert";
  const text = [props.headline, props.description, props.instruction]
    .filter((part): part is string => Boolean(part?.trim()))
    .join("\n\n");
  return {
    title: event,
    severity: toSeverity(event),
    text,
    area: props.areaDesc ?? "",
    expires: props.ends ?? props.expires,
    source: props.senderName ?? SOURCE,
  };
}

export async function fetchUsaAlerts(city: City, signal?: AbortSignal): Promise<Alert[]> {
  const body = await getJson<{ features?: NwsAlertFeature[] }>(buildUsaAlertsUrl(city), signal);
  return dedupe((body.features ?? []).map(toAlert)).sort(bySeverity);
}
