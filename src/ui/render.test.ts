import { describe, expect, it } from "vitest";
import type { Observation } from "../providers/openMeteo";
import { bubble, details, escapeHtml, formatTemperature, formatWind, toEntry } from "./render";

const observation: Observation = {
  temperature: 21.6,
  feelsLike: 20.2,
  humidity: 50,
  windSpeed: 10,
  cloudCover: 5,
  weatherCode: 0,
  isDay: true,
  observedAt: "2026-10-20T14:00",
};

describe("render", () => {
  it("escapes markup from APIs and the URL", () => {
    expect(escapeHtml(`<img src=x onerror="a">&'`)).not.toMatch(/[<>"'&](?!#)/);
    const entry = toEntry({ name: "<script>x</script>", lat: 0, lon: 0 }, observation);
    expect(bubble(entry, 0, "metric")).not.toContain("<script>");
  });

  it("formats both unit systems", () => {
    expect(formatTemperature(21.6, "metric")).toBe("22°");
    expect(formatTemperature(0, "imperial")).toBe("32°");
    expect(formatWind(10, "metric")).toBe("10 km/h");
    expect(formatWind(16.09344, "imperial")).toBe("10 mph");
  });

  it("flags bubbles with alerts and lists them in the details", () => {
    const entry = {
      ...toEntry({ name: "Ottawa", lat: 45.4, lon: -75.7 }, observation),
      alerts: [{ title: "Rainfall warning", severity: "warning" as const, text: "Rain.", area: "Ottawa", source: "EC" }],
    };
    const html = bubble(entry, 3, "metric");
    expect(html).toContain("has-alert");
    expect(html).toContain('data-condition="sun"');
    expect(html).toContain("1 active alert");
    expect(details(entry, "metric")).toContain("Rainfall warning");
  });

  it("explains missing alert coverage", () => {
    const entry = { ...toEntry({ name: "Recife", lat: -8, lon: -35 }, observation), alerts: "unsupported" as const };
    expect(details(entry, "metric")).toContain("No public alert agency");
  });
});
