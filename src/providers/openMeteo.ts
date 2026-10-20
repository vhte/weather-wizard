import type { City } from "../cities";
import { getJson } from "../http";
import type { Reading } from "../wizard";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "wind_speed_10m",
  "cloud_cover",
  "weather_code",
  "is_day",
] as const;

interface CurrentBlock {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  cloud_cover: number;
  weather_code: number;
  is_day: 0 | 1;
}

interface ForecastLocation {
  current: CurrentBlock;
}

export interface Observation extends Reading {
  /** Local observation time, ISO 8601 without offset (Open-Meteo "timezone=auto"). */
  observedAt: string;
}

export function buildForecastUrl(cities: readonly City[]): string {
  const params = new URLSearchParams({
    latitude: cities.map((city) => city.lat).join(","),
    longitude: cities.map((city) => city.lon).join(","),
    current: CURRENT_FIELDS.join(","),
    timezone: "auto",
    wind_speed_unit: "kmh",
  });
  return `${FORECAST_URL}?${params}`;
}

export function toObservation(current: CurrentBlock): Observation {
  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    cloudCover: current.cloud_cover,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    observedAt: current.time,
  };
}

/**
 * Current weather for every city in one request. Open-Meteo returns an array
 * for several locations and a bare object for one; results keep input order.
 */
export async function fetchCurrent(
  cities: readonly City[],
  signal?: AbortSignal,
): Promise<Observation[]> {
  if (cities.length === 0) return [];
  const body = await getJson<ForecastLocation | ForecastLocation[]>(buildForecastUrl(cities), signal);
  const locations = Array.isArray(body) ? body : [body];
  return locations.map((location) => toObservation(location.current));
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  country?: string;
  admin1?: string;
}

/** Finds places by name anywhere in the world. */
export async function searchPlaces(name: string, signal?: AbortSignal): Promise<City[]> {
  const params = new URLSearchParams({ name, count: "8", language: "en", format: "json" });
  const body = await getJson<{ results?: GeocodingResult[] }>(`${GEOCODING_URL}?${params}`, signal);
  return (body.results ?? []).map((place) => ({
    name: place.name,
    lat: place.latitude,
    lon: place.longitude,
    country: place.country_code,
    region: [place.admin1, place.country].filter(Boolean).join(", "),
  }));
}
