import "./style.css";
import { fetchAlerts } from "./alerts";
import { COUNTRIES, findCountry, type City } from "./cities";
import { fetchCurrent, searchPlaces } from "./providers/openMeteo";
import {
  activeAlerts,
  bubble,
  bubbleButton,
  details,
  escapeHtml,
  skeletons,
  toEntry,
  type Entry,
  type Units,
} from "./ui/render";

/** What the grid shows; mirrored in the URL hash (#ca, #search=lima). */
type View = { kind: "country"; code: string } | { kind: "search"; query: string };

const AUTO_REFRESH_MS = 15 * 60 * 1000; // Open-Meteo updates current conditions every 15 minutes.

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const grid = $<HTMLUListElement>("grid");
const tabs = $<HTMLElement>("tabs");
const summary = $<HTMLParagraphElement>("summary");
const updated = $<HTMLSpanElement>("updated");
const dialog = $<HTMLDialogElement>("details");
const dialogBody = $<HTMLDivElement>("details-body");
const searchForm = $<HTMLFormElement>("search");
const searchInput = $<HTMLInputElement>("search-input");
const unitsButton = $<HTMLButtonElement>("units");

const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode or blocked storage: preferences just won't persist.
    }
  },
};

const state = {
  view: parseHash(),
  units: (storage.get("ww-units") === "imperial" ? "imperial" : "metric") as Units,
  entries: [] as Entry[],
  openIndex: -1,
  controller: null as AbortController | null,
  lastLoad: 0,
};

function parseHash(): View {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash.startsWith("search=") && hash.length > 7) return { kind: "search", query: hash.slice(7) };
  const country = findCountry(hash) ?? COUNTRIES[0]!;
  return { kind: "country", code: country.code };
}

const viewHash = (view: View): string =>
  view.kind === "country" ? `#${view.code.toLowerCase()}` : `#search=${encodeURIComponent(view.query)}`;

tabs.innerHTML = COUNTRIES.map(
  (country) => `<a href="#${country.code.toLowerCase()}" class="tab" data-code="${country.code}">${country.name}</a>`,
).join("");

function markCurrentTab(): void {
  const current = state.view.kind === "country" ? state.view.code : null;
  tabs.querySelectorAll<HTMLAnchorElement>(".tab").forEach((tab) => {
    if (tab.dataset.code === current) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
}

/** Rebuilds every cell. `fresh` fades the bubbles in over the skeletons they replace. */
function renderGrid(fresh = false): void {
  grid.innerHTML = state.entries.map((entry, i) => bubble(entry, i, state.units, fresh)).join("");
  grid.setAttribute("aria-busy", "false");
  renderSummary();
  refreshDialog();
}

/** Swaps in only the bubbles that gained alerts, so the rest of the grid stays still. */
function patchAlerts(): void {
  state.entries.forEach((entry, i) => {
    if (activeAlerts(entry).length === 0) return;
    const template = document.createElement("template");
    template.innerHTML = bubbleButton(entry, i, state.units).trim();
    grid.querySelector(`.bubble[data-index="${i}"]`)?.replaceWith(template.content);
  });
  renderSummary();
  refreshDialog();
}

function refreshDialog(): void {
  const entry = state.entries[state.openIndex];
  if (dialog.open && entry) dialogBody.innerHTML = details(entry, state.units);
}

function renderSummary(): void {
  const withAlerts = state.entries.filter((entry) => activeAlerts(entry).length > 0).length;
  const pending = state.entries.some((entry) => entry.alerts === null);
  const scope =
    state.view.kind === "country"
      ? `${state.entries.length} cities in ${findCountry(state.view.code)?.name}`
      : `${state.entries.length} places matching “${state.view.query}”`;
  const country = state.view.kind === "country" ? findCountry(state.view.code) : null;
  const alertText =
    country && !country.alertAgency
      ? "public alerts not available here yet"
      : pending
        ? "checking public alerts…"
        : `${withAlerts} with active alerts`;
  summary.textContent = `${scope} · ${alertText}`;
}

function renderMessage(title: string, body: string, retry = false): void {
  grid.setAttribute("aria-busy", "false");
  grid.innerHTML = `
    <li class="message">
      <div class="bubble" data-condition="thunder">
        <span class="city">${escapeHtml(title)}</span>
        <span class="desc">${escapeHtml(body)}</span>
        ${retry ? '<button type="button" class="chip" data-retry>Try again</button>' : ""}
      </div>
    </li>`;
  summary.textContent = "";
}

async function citiesFor(view: View, signal: AbortSignal): Promise<City[]> {
  if (view.kind === "country") return findCountry(view.code)?.cities ?? [];
  return searchPlaces(view.query, signal);
}

async function load(): Promise<void> {
  state.controller?.abort();
  const controller = new AbortController();
  state.controller = controller;
  const { signal } = controller;
  const view = state.view;

  markCurrentTab();
  searchInput.value = view.kind === "search" ? view.query : "";
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = skeletons(view.kind === "country" ? (findCountry(view.code)?.cities.length ?? 8) : 4);
  summary.textContent = "Consulting the skies…";

  try {
    const cities = await citiesFor(view, signal);
    if (cities.length === 0) {
      renderMessage("Nothing found", `No place called “${view.kind === "search" ? view.query : ""}”.`);
      return;
    }

    // Weather first; alerts fill in when the agencies answer.
    const alertsPromise = fetchAlerts(cities, signal);
    const observations = await fetchCurrent(cities, signal);
    if (signal.aborted) return;
    state.entries = cities.map((city, i) => toEntry(city, observations[i]!));
    state.lastLoad = Date.now();
    updated.textContent = `Updated ${new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    renderGrid(true);

    const alerts = await alertsPromise;
    if (signal.aborted) return;
    state.entries = state.entries.map((entry, i) => ({ ...entry, alerts: alerts[i] ?? "unavailable" }));
    patchAlerts();
  } catch (error) {
    if (signal.aborted) return;
    console.error(error);
    renderMessage("The crystal ball is cloudy", "Weather data could not be loaded.", true);
  }
}

function navigate(view: View): void {
  const hash = viewHash(view);
  if (location.hash === hash) void load();
  else location.hash = hash; // hashchange triggers the load
}

function renderUnits(): void {
  unitsButton.textContent = state.units === "metric" ? "°C" : "°F";
  unitsButton.setAttribute("aria-label", `Units: ${state.units}. Switch units`);
}

window.addEventListener("hashchange", () => {
  state.view = parseHash();
  dialog.close();
  void load();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query) navigate({ kind: "search", query });
});

grid.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.closest("[data-retry]")) return void load();
  const button = target.closest<HTMLButtonElement>(".bubble[data-index]");
  if (!button) return;
  state.openIndex = Number(button.dataset.index);
  dialogBody.innerHTML = details(state.entries[state.openIndex]!, state.units);
  dialog.showModal();
});

$("close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close(); // backdrop click
});

$("refresh").addEventListener("click", () => void load());

unitsButton.addEventListener("click", () => {
  state.units = state.units === "metric" ? "imperial" : "metric";
  storage.set("ww-units", state.units);
  renderUnits();
  if (state.entries.length) renderGrid();
});

$("theme").addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
  storage.set("ww-theme", root.dataset.theme);
});

// Reload stale data, but only while someone is looking.
const refreshIfStale = () => {
  if (document.visibilityState === "visible" && state.lastLoad && Date.now() - state.lastLoad > AUTO_REFRESH_MS) {
    void load();
  }
};
document.addEventListener("visibilitychange", refreshIfStale);
setInterval(refreshIfStale, 60_000);

renderUnits();
void load();
