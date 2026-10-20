import { afterEach, describe, expect, it, vi } from "vitest";
import { buildForecastUrl, fetchCurrent, searchPlaces } from "./openMeteo";

const current = (temperature: number) => ({
  current: {
    time: "2026-10-20T17:15",
    temperature_2m: temperature,
    apparent_temperature: temperature - 2,
    relative_humidity_2m: 45,
    wind_speed_10m: 7.9,
    cloud_cover: 0,
    weather_code: 0,
    is_day: 1,
  },
});

const respond = (body: unknown) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));

afterEach(() => vi.unstubAllGlobals());

describe("Open-Meteo", () => {
  const cities = [
    { name: "Ottawa", lat: 45.41, lon: -75.7 },
    { name: "Toronto", lat: 43.7, lon: -79.42 },
  ];

  it("asks for every city in one request", () => {
    const url = new URL(buildForecastUrl(cities));
    expect(url.searchParams.get("latitude")).toBe("45.41,43.7");
    expect(url.searchParams.get("longitude")).toBe("-75.7,-79.42");
    expect(url.searchParams.get("current")).toContain("weather_code");
  });

  it("maps a multi-location array in order", async () => {
    respond([current(13), current(15)]);
    const observations = await fetchCurrent(cities);
    expect(observations.map((o) => o.temperature)).toEqual([13, 15]);
    expect(observations[0]).toMatchObject({ feelsLike: 11, isDay: true, observedAt: "2026-10-20T17:15" });
  });

  it("accepts the bare object returned for a single location", async () => {
    respond(current(20));
    expect(await fetchCurrent(cities.slice(0, 1))).toHaveLength(1);
  });

  it("rejects on HTTP errors so the UI can show a retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    await expect(fetchCurrent(cities)).rejects.toThrow(/HTTP 429/);
  });

  it("turns geocoding results into cities", async () => {
    respond({
      results: [{ name: "Ottawa", latitude: 41.3, longitude: -88.8, country_code: "US", admin1: "Illinois", country: "United States" }],
    });
    expect(await searchPlaces("Ottawa")).toEqual([
      { name: "Ottawa", lat: 41.3, lon: -88.8, country: "US", region: "Illinois, United States" },
    ]);
  });

  it("returns no places when geocoding has no results key", async () => {
    respond({ generationtime_ms: 0.1 });
    expect(await searchPlaces("Atlantis")).toEqual([]);
  });
});
