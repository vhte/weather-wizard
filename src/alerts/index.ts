import type { City } from "../cities";
import { alertsForCity, fetchCanadaFeatures } from "./canada";
import type { Alert } from "./types";
import { fetchUsaAlerts } from "./usa";

export type { Alert, Severity } from "./types";

/**
 * Alerts for one city: a list (possibly empty) when the country has an agency
 * wired in and the call worked, "unsupported" when it has none, and
 * "unavailable" when the agency could not be reached.
 */
export type AlertResult = Alert[] | "unsupported" | "unavailable";

/**
 * Looks up alerts for every city, in input order. Never rejects: an agency
 * failure only marks its cities "unavailable", so the weather still renders.
 */
export async function fetchAlerts(cities: readonly City[], signal?: AbortSignal): Promise<AlertResult[]> {
  const needsCanada = cities.some((city) => city.country === "CA");
  const canada = needsCanada ? fetchCanadaFeatures(signal).catch(() => null) : Promise.resolve(null);

  return Promise.all(
    cities.map(async (city): Promise<AlertResult> => {
      switch (city.country) {
        case "CA": {
          const features = await canada;
          return features ? alertsForCity(features, city) : "unavailable";
        }
        case "US":
          return fetchUsaAlerts(city, signal).catch(() => "unavailable" as const);
        default:
          return "unsupported";
      }
    }),
  );
}
