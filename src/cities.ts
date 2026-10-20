export type CountryCode = "CA" | "US" | "BR";

export interface City {
  name: string;
  lat: number;
  lon: number;
  /** ISO country code, used to pick the alert agency. Absent for places we have no agency for. */
  country?: string;
  /** Extra context shown under the name, e.g. a region for search results. */
  region?: string;
}

export interface Country {
  code: CountryCode;
  name: string;
  /** Agency that publishes the public alerts, or null when none is wired in. */
  alertAgency: string | null;
  cities: City[];
}

const withCountry = (country: CountryCode, cities: Omit<City, "country">[]): City[] =>
  cities.map((city) => ({ ...city, country }));

// Capitals (state/provincial plus the national one) and a few large cities.
export const COUNTRIES: Country[] = [
  {
    code: "CA",
    name: "Canada",
    alertAgency: "Environment and Climate Change Canada",
    cities: withCountry("CA", [
      { name: "Charlottetown", lat: 46.24, lon: -63.13 },
      { name: "Edmonton", lat: 53.55, lon: -113.47 },
      { name: "Fredericton", lat: 45.95, lon: -66.67 },
      { name: "Halifax", lat: 44.65, lon: -63.57 },
      { name: "Iqaluit", lat: 63.75, lon: -68.51 },
      { name: "Ottawa", lat: 45.41, lon: -75.7 },
      { name: "Québec", lat: 46.81, lon: -71.21 },
      { name: "Regina", lat: 50.45, lon: -104.62 },
      { name: "St. John's", lat: 47.56, lon: -52.71 },
      { name: "Toronto", lat: 43.7, lon: -79.42 },
      { name: "Victoria", lat: 48.43, lon: -123.37 },
      { name: "Whitehorse", lat: 60.72, lon: -135.05 },
      { name: "Winnipeg", lat: 49.88, lon: -97.15 },
      { name: "Yellowknife", lat: 62.46, lon: -114.35 },
    ]),
  },
  {
    code: "US",
    name: "USA",
    alertAgency: "National Weather Service",
    cities: withCountry("US", [
      { name: "Austin", lat: 30.2672, lon: -97.7431 },
      { name: "Chicago", lat: 41.85, lon: -87.65 },
      { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
      { name: "Juneau", lat: 58.3019, lon: -134.4197 },
      { name: "Kansas City", lat: 39.0997, lon: -94.5786 },
      { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
      { name: "Miami", lat: 25.7743, lon: -80.1937 },
      { name: "Minneapolis", lat: 44.98, lon: -93.2638 },
      { name: "Nashville", lat: 36.1659, lon: -86.7844 },
      { name: "New Orleans", lat: 29.9547, lon: -90.0751 },
      { name: "New York", lat: 40.7143, lon: -74.006 },
      { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
      { name: "Seattle", lat: 47.6062, lon: -122.3321 },
      { name: "Washington (DC)", lat: 38.8951, lon: -77.0364 },
    ]),
  },
  {
    code: "BR",
    name: "Brazil",
    alertAgency: null,
    cities: withCountry("BR", [
      { name: "Aracaju", lat: -10.91, lon: -37.07 },
      { name: "Belo Horizonte", lat: -19.92, lon: -43.94 },
      { name: "Belém", lat: -1.46, lon: -48.5 },
      { name: "Boa Vista", lat: 2.82, lon: -60.67 },
      { name: "Brasília", lat: -15.78, lon: -47.93 },
      { name: "Campo Grande", lat: -20.44, lon: -54.65 },
      { name: "Cuiabá", lat: -15.6, lon: -56.1 },
      { name: "Curitiba", lat: -25.43, lon: -49.27 },
      { name: "Florianópolis", lat: -27.6, lon: -48.55 },
      { name: "Fortaleza", lat: -3.72, lon: -38.54 },
      { name: "Goiânia", lat: -16.68, lon: -49.25 },
      { name: "João Pessoa", lat: -7.12, lon: -34.86 },
      { name: "Macapá", lat: 0.04, lon: -51.07 },
      { name: "Maceió", lat: -9.67, lon: -35.74 },
      { name: "Manaus", lat: -3.1, lon: -60.02 },
      { name: "Natal", lat: -5.79, lon: -35.21 },
      { name: "Palmas", lat: -10.21, lon: -48.36 },
      { name: "Porto Alegre", lat: -30.03, lon: -51.23 },
      { name: "Porto Velho", lat: -8.76, lon: -63.9 },
      { name: "Recife", lat: -8.05, lon: -34.88 },
      { name: "Rio Branco", lat: -9.97, lon: -67.81 },
      { name: "Rio de Janeiro", lat: -22.9, lon: -43.21 },
      { name: "Salvador", lat: -12.97, lon: -38.51 },
      { name: "São Luís", lat: -2.53, lon: -44.3 },
      { name: "São Paulo", lat: -23.55, lon: -46.64 },
      { name: "Teresina", lat: -5.09, lon: -42.8 },
      { name: "Vitória", lat: -20.32, lon: -40.34 },
    ]),
  },
];

export const findCountry = (code: string): Country | undefined =>
  COUNTRIES.find((country) => country.code === code.toUpperCase());
