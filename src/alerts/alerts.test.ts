import { afterEach, describe, expect, it, vi } from "vitest";
import type { City } from "../cities";
import { alertsForCity, type CanadaAlertFeature } from "./canada";
import { fetchAlerts } from "./index";
import { buildUsaAlertsUrl, toAlert, toSeverity } from "./usa";

const ottawa: City = { name: "Ottawa", lat: 45.41, lon: -75.7, country: "CA" };
const now = new Date("2026-10-20T12:00:00Z");

const feature = (overrides: Partial<CanadaAlertFeature["properties"]> = {}): CanadaAlertFeature => ({
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-76, 45],
        [-75, 45],
        [-75, 46],
        [-76, 46],
        [-76, 45],
      ],
    ],
  },
  properties: {
    alert_type: "warning",
    alert_name_en: "rainfall warning",
    alert_text_en: "  Heavy rain expected.  ",
    feature_name_en: "City of Ottawa",
    expiration_datetime: "2026-10-21T00:00:00Z",
    status_en: "issued",
    ...overrides,
  },
});

describe("Canada alerts", () => {
  it("matches alerts whose polygon contains the city", () => {
    const [alert] = alertsForCity([feature()], ottawa, now);
    expect(alert).toEqual({
      title: "Rainfall warning",
      severity: "warning",
      text: "Heavy rain expected.",
      area: "City of Ottawa",
      expires: "2026-10-21T00:00:00Z",
      source: "Environment Canada",
    });
  });

  it("ignores far away, expired and ended alerts", () => {
    const toronto: City = { ...ottawa, lat: 43.7, lon: -79.42 };
    expect(alertsForCity([feature()], toronto, now)).toEqual([]);
    expect(alertsForCity([feature({ expiration_datetime: "2026-10-20T00:00:00Z" })], ottawa, now)).toEqual([]);
    expect(alertsForCity([feature({ status_en: "ended" })], ottawa, now)).toEqual([]);
  });

  it("dedupes repeats and puts warnings before advisories", () => {
    const advisory = feature({ alert_type: "advisory", alert_name_en: "frost advisory" });
    const alerts = alertsForCity([advisory, feature(), feature()], ottawa, now);
    expect(alerts.map((a) => a.title)).toEqual(["Rainfall warning", "Frost advisory"]);
  });
});

describe("USA alerts", () => {
  it("reads severity from the NWS event name", () => {
    expect(toSeverity("Winter Storm Warning")).toBe("warning");
    expect(toSeverity("Tornado Watch")).toBe("watch");
    expect(toSeverity("Wind Advisory")).toBe("advisory");
    expect(toSeverity("Special Weather Statement")).toBe("statement");
  });

  it("joins headline, description and instruction", () => {
    const alert = toAlert({
      properties: {
        event: "Flood Watch",
        headline: "Flood Watch until Friday",
        description: "Rain may cause flooding.",
        instruction: null,
        areaDesc: "District of Columbia",
        expires: "2026-10-21T00:00:00Z",
        senderName: "NWS Sterling VA",
      },
    });
    expect(alert.text).toBe("Flood Watch until Friday\n\nRain may cause flooding.");
    expect(alert.source).toBe("NWS Sterling VA");
    expect(alert.severity).toBe("watch");
  });

  it("queries a single point", () => {
    expect(buildUsaAlertsUrl({ name: "DC", lat: 38.8951, lon: -77.0364 })).toBe(
      "https://api.weather.gov/alerts/active?point=38.8951,-77.0364&status=actual",
    );
  });
});

describe("fetchAlerts", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("never rejects: failures become 'unavailable', unknown countries 'unsupported'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const results = await fetchAlerts([
      ottawa,
      { name: "DC", lat: 38.9, lon: -77, country: "US" },
      { name: "Recife", lat: -8.05, lon: -34.88, country: "BR" },
    ]);
    expect(results).toEqual(["unavailable", "unavailable", "unsupported"]);
  });

  it("fetches the Canadian collection once for many cities", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ features: [feature()] })));
    vi.stubGlobal("fetch", fetchMock);
    const results = await fetchAlerts([ottawa, { ...ottawa, name: "Gatineau" }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.map((r) => (Array.isArray(r) ? r.length : r))).toEqual([1, 1]);
  });
});
