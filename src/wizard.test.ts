import { describe as suite, expect, it } from "vitest";
import { celsiusToFahrenheit, classify, describe, kmhToMph, type Reading } from "./wizard";

const clear: Reading = {
  temperature: 18,
  feelsLike: 18,
  humidity: 50,
  windSpeed: 5,
  cloudCover: 10,
  weatherCode: 0,
  isDay: true,
};

suite("classify", () => {
  it("is sun on a clear day and moon on a clear night", () => {
    expect(classify(clear)).toBe("sun");
    expect(classify({ ...clear, isDay: false })).toBe("moon");
  });

  it("puts precipitation ahead of clouds, thunder first", () => {
    expect(classify({ ...clear, weatherCode: 95, cloudCover: 100 })).toBe("thunder");
    expect(classify({ ...clear, weatherCode: 73, cloudCover: 100 })).toBe("snow");
    expect(classify({ ...clear, weatherCode: 61, cloudCover: 100 })).toBe("rain");
    expect(classify({ ...clear, weatherCode: 81 })).toBe("rain");
  });

  it("is snow even without heavy clouds (the 2019 bit flags turned this into rain)", () => {
    expect(classify({ ...clear, weatherCode: 71, cloudCover: 20 })).toBe("snow");
  });

  it("is clouds above 80% cover, for overcast codes and for fog", () => {
    expect(classify({ ...clear, cloudCover: 81 })).toBe("clouds");
    expect(classify({ ...clear, cloudCover: 80 })).toBe("sun");
    expect(classify({ ...clear, weatherCode: 3, cloudCover: 50 })).toBe("clouds");
    expect(classify({ ...clear, weatherCode: 45 })).toBe("clouds");
  });

  it("applies cold, hot and wind only under a clear sky, in that order", () => {
    expect(classify({ ...clear, feelsLike: -20 })).toBe("cold");
    expect(classify({ ...clear, feelsLike: -19.9 })).toBe("sun");
    expect(classify({ ...clear, feelsLike: 30.1 })).toBe("hot");
    expect(classify({ ...clear, feelsLike: 30 })).toBe("sun");
    expect(classify({ ...clear, windSpeed: 23 })).toBe("wind");
    expect(classify({ ...clear, feelsLike: -30, windSpeed: 60 })).toBe("cold");
    expect(classify({ ...clear, feelsLike: -30, cloudCover: 90 })).toBe("clouds");
  });
});

suite("helpers", () => {
  it("describes WMO codes and falls back for unknown ones", () => {
    expect(describe(0)).toBe("Clear sky");
    expect(describe(96)).toBe("Thunderstorm with hail");
    expect(describe(42)).toBe("Unknown conditions");
  });

  it("converts units", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
    expect(kmhToMph(1.609344)).toBeCloseTo(1);
  });
});
