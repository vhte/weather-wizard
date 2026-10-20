/**
 * The "wizard": turns raw current-weather readings into one of nine visual
 * conditions. This is the heart of the original 2019 app, which encoded the
 * same states as bit flags over OpenWeather data. The rules are unchanged in
 * spirit, rewritten as an explicit precedence list over WMO weather codes.
 */

export const CONDITIONS = [
  "thunder",
  "snow",
  "rain",
  "clouds",
  "cold",
  "hot",
  "wind",
  "sun",
  "moon",
] as const;

export type Condition = (typeof CONDITIONS)[number];

/** Current readings in metric units (°C, km/h, %). */
export interface Reading {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  /** WMO 4677 weather interpretation code, as returned by Open-Meteo. */
  weatherCode: number;
  isDay: boolean;
}

/** Thresholds carried over from the original app. */
export const THRESHOLDS = {
  /** Cloud cover above this (%) counts as cloudy. */
  cloudy: 80,
  /** Feels-like at or below this (°C) is "cold". */
  cold: -20,
  /** Feels-like above this (°C) is "hot". */
  hot: 30,
  /** Wind above this (km/h) is "wind". */
  windy: 22.5,
} as const;

const THUNDER_CODES = new Set([95, 96, 99]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const OVERCAST_CODES = new Set([3, 45, 48]);

/**
 * Picks the condition shown for a reading. Precipitation wins over clouds,
 * and the temperature/wind states only apply under a clear-ish sky, as in the
 * original app; otherwise it is sun or moon depending on daylight.
 */
export function classify(reading: Reading): Condition {
  const code = reading.weatherCode;
  if (THUNDER_CODES.has(code)) return "thunder";
  if (SNOW_CODES.has(code)) return "snow";
  if (RAIN_CODES.has(code)) return "rain";
  if (OVERCAST_CODES.has(code) || reading.cloudCover > THRESHOLDS.cloudy) return "clouds";
  if (reading.feelsLike <= THRESHOLDS.cold) return "cold";
  if (reading.feelsLike > THRESHOLDS.hot) return "hot";
  if (reading.windSpeed > THRESHOLDS.windy) return "wind";
  return reading.isDay ? "sun" : "moon";
}

const DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export const describe = (weatherCode: number): string =>
  DESCRIPTIONS[weatherCode] ?? "Unknown conditions";

export const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

export const kmhToMph = (kmh: number): number => kmh / 1.609344;
