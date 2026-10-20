# Weather Wizard

Live weather and public weather alerts for the capitals of **Canada**, the **USA** and **Brazil**, drawn as a grid of little skies. Each city gets a bubble whose colors and animated icon reflect what is happening outside right now: sun, moon, clouds, rain, snow, thunder, wind, bitter cold or heat. When a government agency has an active warning for a city, its bubble pulses red.

**Live demo:** https://vhte.github.io/weather-wizard/

## What it does

- **Country view:** pick Canada, USA or Brazil to see every capital at a glance.
- **Search any city:** type a name to see every place in the world that matches it.
- **Public alerts:** click a city to see its readings and any active watches, warnings or advisories, with the agency's full text.
- **Your preferences:** switch between °C and °F and between light and dark themes. Both choices are remembered.
- **Shareable links:** every view has its own URL, for example `#us` or `#search=Lisbon`.
- **Always fresh:** data refreshes every 15 minutes while the page is open.

## Where the data comes from

Everything is fetched by your browser from free, public, keyless APIs. There is no server and no API key.

| Data | Source |
| --- | --- |
| Current weather and city search | [Open-Meteo](https://open-meteo.com/) |
| Alerts in Canada | [Environment and Climate Change Canada](https://weather.gc.ca/) (MSC GeoMet) |
| Alerts in the USA | [National Weather Service](https://www.weather.gov/) |
| Alerts in Brazil | Not available yet |

## Run it locally

You need [Node.js](https://nodejs.org/) 22 or newer.

```sh
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Other commands:

```sh
npm test          # run the test suite
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Publishing the demo

Every push to `master` runs the tests, builds the site and deploys it to GitHub Pages. To turn this on for a fork, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## History

Weather Wizard started in 2019 as a Python app: a small local server called OpenWeather with a personal API key and scraped government alert feeds, and a plain HTML page drew the bubbles. In 2026 it was rebuilt as a static TypeScript app so it can run anywhere, including GitHub Pages, without a server or a key. The rules that pick each city's look are the same, with a couple of old bugs fixed.

The original version is preserved under the git tag `v1-python-2019`.

## License

[GNU General Public License v3.0](LICENSE)
