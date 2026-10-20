# AGENTS.md

Guidance for AI coding agents working in this repository. Human-facing docs live in `README.md`.

## What this is

A static single-page app (Vite + TypeScript, no UI framework, no runtime dependencies) that shows current weather and public weather alerts for a fixed list of cities per country, plus a free-text city search. It is deployed to GitHub Pages, so **there is no backend and there must never be an API key**. Every data source has to be keyless and send CORS headers that allow browser calls.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Tests (Vitest, node env) | `npm test` |
| Typecheck | `npm run typecheck` |
| Production build to `dist/` | `npm run build` (typechecks first) |

Run `npm test` and `npm run build` before committing. CI (`.github/workflows/pages.yml`) runs both on every push and PR and deploys `dist/` to Pages from `master` only.

## Layout

```
index.html              Page shell: header, tabs/search/toggles, grid, <dialog>, footer
public/favicon.svg      Logo (also used in the header)
src/
  main.ts               App state, URL-hash routing, event wiring, load orchestration
  wizard.ts             Core rules: Reading -> Condition, WMO code descriptions, unit conversions
  cities.ts             Country list (code, name, alert agency) and their cities (name, lat, lon)
  http.ts               getJson(): fetch with timeout + AbortSignal, throws HttpError on non-2xx
  geo.ts                Point-in-polygon for GeoJSON Polygon/MultiPolygon
  providers/openMeteo.ts  Current weather (batched) and geocoding search
  alerts/
    index.ts            fetchAlerts(): per-country dispatch, never rejects
    types.ts            Alert, Severity, sorting and de-duplication
    canada.ts           ECCC GeoMet collection + local point-in-polygon matching
    usa.ts              NWS active alerts per point
  ui/
    render.ts           Pure HTML-string renderers (bubble, details, skeletons), formatting, escaping
    icons.ts            Inline animated SVG icon per Condition
  style.css             Design tokens, light/dark themes, bubble skies, icon animations
  **/*.test.ts          Colocated Vitest tests
```

## Data flow

1. `main.ts` reads the view from the URL hash: `#ca`, `#us`, `#br` or `#search=<query>`. An unknown hash falls back to the first country.
2. `load()` aborts any in-flight load, shows skeleton bubbles and resolves the city list: the static list from `cities.ts`, or `searchPlaces()` for a search.
3. It starts `fetchAlerts(cities)` and `fetchCurrent(cities)` together. Weather renders as soon as it arrives. Alerts are patched into the entries afterwards and the grid re-renders.
4. Each `Entry` = `{ city, observation, condition, alerts }`. `alerts` is `null` while pending, otherwise an `AlertResult`.
5. Clicking a bubble opens the `<dialog>` with `details(entry)`. The dialog content is refreshed whenever the grid re-renders.

## Core rules (`wizard.ts`)

`classify(reading)` returns the first match in this precedence order. It ports the 2019 bit-flag logic, minus its bugs.

1. `thunder`: WMO 95, 96, 99
2. `snow`: WMO 71, 73, 75, 77, 85, 86
3. `rain`: WMO 51–57, 61–67, 80–82
4. `clouds`: WMO 3, 45, 48 **or** cloud cover > 80%
5. `cold`: feels-like ≤ −20 °C
6. `hot`: feels-like > 30 °C
7. `wind`: wind > 22.5 km/h
8. `sun` / `moon`: by Open-Meteo `is_day`

Cold, hot and wind only apply under a clear-ish sky. That is intentional and comes from the original app. The thresholds live in `THRESHOLDS`. If you change a rule, update `wizard.test.ts` and this section.

All internal values are metric (°C, km/h, %). Imperial is a display-only conversion in `ui/render.ts`.

## External APIs (all keyless, all CORS `*`)

| Purpose | Endpoint | Notes |
| --- | --- | --- |
| Weather | `api.open-meteo.com/v1/forecast` | One request for every city: comma-separated `latitude`/`longitude`. Returns an **array** for several locations and a **bare object** for one. Results keep input order. Can be slow (2–5 s). |
| Search | `geocoding-api.open-meteo.com/v1/search` | No `results` key when nothing matches. |
| Canada alerts | `api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=1000` | The whole country in one GeoJSON collection (about 100–200 KB). Fetched **once** per load, then matched per city with `geo.containsPoint`. Filter out `status_en` ended/cancelled and expired items. Not to be confused with the old `weather.gc.ca/rss/warning/*` feeds, which now return 404. |
| US alerts | `api.weather.gov/alerts/active?point=lat,lon&status=actual` | One request per city. Rejects unknown query params with 400 (for example `limit`). Severity is read from the event name (Warning/Watch/Advisory/Statement). |

Brazil has no alert agency wired in, so it returns `"unsupported"`. To add one, give the country an `alertAgency` in `cities.ts`, add an `alerts/<country>.ts` that returns `Alert[]`, add a `case` in `alerts/index.ts`, and add tests that mock `fetch`.

## Conventions

- **Never let alerts break weather.** `fetchAlerts` must not reject. Agency failures map to `"unavailable"` for the affected cities.
- **Escape everything** that comes from an API or from the URL hash before putting it into HTML (`escapeHtml` in `ui/render.ts`). Renderers build HTML strings, so this is the XSS boundary. The search query arrives through the hash and is attacker-controllable.
- **Tests mock `fetch`** with `vi.stubGlobal`. They must never hit the network.
- Keep dependencies at zero at runtime. Dev dependencies are only `vite`, `vitest` and `typescript`.
- `vite.config.ts` uses `base: "./"` so the build works under any Pages sub-path. Asset URLs in `index.html` must stay relative.
- Colors are CSS custom properties. Dark mode has to be defined in both `@media (prefers-color-scheme: dark)` (guarded by `:root:not([data-theme="light"])`) and `:root[data-theme="dark"]`, because the theme toggle sets `data-theme`.
- Each condition's look comes from `--sky`, `--ring` and `--ink` set by `[data-condition="…"]` in `style.css`. A new condition needs an entry in `CONDITIONS`, an icon in `ui/icons.ts`, and a sky in `style.css`.
- Animations must stay disabled under `prefers-reduced-motion` (there is a global rule at the end of `style.css`).
- `localStorage` is only used for preferences (`ww-units`, `ww-theme`), always wrapped in try/catch.

## History

The 2019 Python implementation (OpenWeather + API key file, `http.server` backend, `untangle` XML scraping) is at tag `v1-python-2019`. It is reference material only. Do not reintroduce a backend or API keys.
