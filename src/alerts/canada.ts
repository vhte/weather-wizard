import type { City } from "../cities";
import { containsPoint, type PolygonGeometry } from "../geo";
import { getJson } from "../http";
import { bySeverity, dedupe, type Alert, type Severity } from "./types";

/**
 * Environment and Climate Change Canada, via the MSC GeoMet OGC API. The
 * whole country's active alerts are one small GeoJSON collection, so it is
 * fetched once and matched to each city with a point-in-polygon test.
 */
export const CANADA_ALERTS_URL =
  "https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=1000&lang=en";

const SOURCE = "Environment Canada";
const INACTIVE_STATUSES = new Set(["ended", "cancelled"]);

export interface CanadaAlertFeature {
  geometry: PolygonGeometry | null;
  properties: {
    alert_type?: string;
    alert_name_en?: string;
    alert_short_name_en?: string;
    alert_text_en?: string;
    feature_name_en?: string;
    expiration_datetime?: string;
    status_en?: string;
  };
}

const SEVERITIES: Severity[] = ["warning", "watch", "advisory", "statement"];

const toSeverity = (type: string | undefined): Severity =>
  SEVERITIES.find((severity) => severity === type?.toLowerCase()) ?? "statement";

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export function isActive(feature: CanadaAlertFeature, now: Date): boolean {
  const { status_en, expiration_datetime } = feature.properties;
  if (status_en && INACTIVE_STATUSES.has(status_en.toLowerCase())) return false;
  return !expiration_datetime || new Date(expiration_datetime) > now;
}

export function toAlert(feature: CanadaAlertFeature): Alert {
  const props = feature.properties;
  return {
    title: capitalize(props.alert_name_en ?? props.alert_short_name_en ?? "Weather alert"),
    severity: toSeverity(props.alert_type),
    text: props.alert_text_en?.trim() ?? "",
    area: props.feature_name_en ?? "",
    expires: props.expiration_datetime,
    source: SOURCE,
  };
}

/** Active alerts whose area contains the city, most severe first. */
export function alertsForCity(
  features: readonly CanadaAlertFeature[],
  city: City,
  now = new Date(),
): Alert[] {
  const matching = features.filter(
    (feature) => isActive(feature, now) && containsPoint(feature.geometry, city.lat, city.lon),
  );
  return dedupe(matching.map(toAlert)).sort(bySeverity);
}

export async function fetchCanadaFeatures(signal?: AbortSignal): Promise<CanadaAlertFeature[]> {
  const body = await getJson<{ features?: CanadaAlertFeature[] }>(CANADA_ALERTS_URL, signal);
  return body.features ?? [];
}
