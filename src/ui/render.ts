import type { AlertResult } from "../alerts";
import type { City } from "../cities";
import type { Observation } from "../providers/openMeteo";
import { celsiusToFahrenheit, classify, describe, kmhToMph, type Condition } from "../wizard";
import { conditionIcon, WARNING_ICON } from "./icons";

export type Units = "metric" | "imperial";

export interface Entry {
  city: City;
  observation: Observation;
  condition: Condition;
  /** null while the agency call is still in flight. */
  alerts: AlertResult | null;
}

export const toEntry = (city: City, observation: Observation): Entry => ({
  city,
  observation,
  condition: classify(observation),
  alerts: null,
});

export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export const formatTemperature = (celsius: number, units: Units): string =>
  `${Math.round(units === "metric" ? celsius : celsiusToFahrenheit(celsius))}°`;

export const formatWind = (kmh: number, units: Units): string =>
  units === "metric" ? `${Math.round(kmh)} km/h` : `${Math.round(kmhToMph(kmh))} mph`;

export const activeAlerts = (entry: Entry) => (Array.isArray(entry.alerts) ? entry.alerts : []);

function alertBadge(entry: Entry): string {
  const alerts = activeAlerts(entry);
  if (alerts.length === 0) return "";
  const label = alerts.length === 1 ? "1 alert" : `${alerts.length} alerts`;
  return `<span class="badge badge-${alerts[0]!.severity}" title="${label}">${WARNING_ICON}<span>${alerts.length}</span></span>`;
}

/** A city's bubble inside its grid cell. `fresh` fades it in when it replaces a skeleton. */
export const bubble = (entry: Entry, index: number, units: Units, fresh = false): string =>
  `<li${fresh ? ' class="fresh"' : ""}>${bubbleButton(entry, index, units)}</li>`;

/** Just the bubble, so a cell can be updated in place without replaying its entrance. */
export function bubbleButton(entry: Entry, index: number, units: Units): string {
  const { city, observation: obs, condition } = entry;
  const alerts = activeAlerts(entry);
  const description = describe(obs.weatherCode);
  const label = [
    `${city.name}: ${formatTemperature(obs.temperature, units)}, ${description}`,
    alerts.length ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return `<button type="button" class="bubble ${alerts.length ? "has-alert" : ""}" data-condition="${condition}"
      data-index="${index}" aria-label="${escapeHtml(label)}">
      ${alertBadge(entry)}
      ${conditionIcon(condition)}
      <span class="city">${escapeHtml(city.name)}</span>
      ${city.region ? `<span class="region">${escapeHtml(city.region)}</span>` : ""}
      <span class="temp">${formatTemperature(obs.temperature, units)}</span>
      <span class="desc">${escapeHtml(description)}</span>
      <span class="meta">
        <span title="Feels like">≈ ${formatTemperature(obs.feelsLike, units)}</span>
        <span title="Wind">${formatWind(obs.windSpeed, units)}</span>
      </span>
    </button>`;
}

/** Loading placeholders; the only cells with the staggered entrance. */
export const skeletons = (count: number): string =>
  Array.from(
    { length: count },
    (_, i) => `<li class="enter" style="--i:${i}"><div class="bubble skeleton" aria-hidden="true"></div></li>`,
  ).join("");

function alertStatus(entry: Entry): string {
  const { alerts } = entry;
  if (alerts === null) return `<p class="muted">Checking public alerts…</p>`;
  if (alerts === "unsupported")
    return `<p class="muted">No public alert agency is wired in for this country yet.</p>`;
  if (alerts === "unavailable") return `<p class="muted">The alert agency could not be reached. Try refreshing.</p>`;
  if (alerts.length === 0) return `<p class="muted">No active public alerts.</p>`;

  return `<ul class="alerts">${alerts
    .map(
      (alert) => `
      <li class="alert alert-${alert.severity}">
        <header>
          <span class="pill">${alert.severity}</span>
          <strong>${escapeHtml(alert.title)}</strong>
        </header>
        <p class="alert-meta">${escapeHtml(
          [alert.area, alert.expires ? `until ${formatDateTime(alert.expires)}` : "", alert.source]
            .filter(Boolean)
            .join(" · "),
        )}</p>
        <p class="alert-text">${escapeHtml(alert.text)}</p>
      </li>`,
    )
    .join("")}</ul>`;
}

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

export function details(entry: Entry, units: Units): string {
  const { city, observation: obs, condition } = entry;
  const rows: [string, string][] = [
    ["Feels like", formatTemperature(obs.feelsLike, units)],
    ["Wind", formatWind(obs.windSpeed, units)],
    ["Humidity", `${Math.round(obs.humidity)}%`],
    ["Cloud cover", `${Math.round(obs.cloudCover)}%`],
  ];
  return `
    <div class="details-hero" data-condition="${condition}">
      ${conditionIcon(condition)}
      <div>
        <h2 id="details-title">${escapeHtml(city.name)}</h2>
        ${city.region ? `<p class="region">${escapeHtml(city.region)}</p>` : ""}
        <p class="details-temp">${formatTemperature(obs.temperature, units)} <span>${escapeHtml(describe(obs.weatherCode))}</span></p>
      </div>
    </div>
    <dl class="readings">
      ${rows.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("")}
    </dl>
    <p class="muted small">Local time of reading: ${escapeHtml(obs.observedAt.replace("T", " "))}</p>
    <h3>Public alerts</h3>
    ${alertStatus(entry)}`;
}
