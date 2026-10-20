import type { Condition } from "../wizard";

/**
 * Animated inline SVG icons, one per condition, drawn on a 64×64 grid. The
 * motion lives in style.css (classes prefixed "i-") and is switched off
 * under prefers-reduced-motion.
 */

const CLOUD = "M19 48h28a11 11 0 0 0 1.6-21.9A15 15 0 0 0 20 23.5 12.5 12.5 0 0 0 19 48z";

const cloud = (fill: string, transform = "", className = "") =>
  `<path class="${className}" d="${CLOUD}" fill="${fill}" transform="${transform}"/>`;

const ICONS: Record<Condition, string> = {
  sun: `
    <g class="i-spin">
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((angle) => `<rect x="30" y="4" width="4" height="10" rx="2" fill="#fff6c9" transform="rotate(${angle} 32 32)"/>`)
        .join("")}
    </g>
    <circle cx="32" cy="32" r="13" fill="#fff6c9"/>`,
  moon: `
    <path d="M40 12a20 20 0 1 0 14 34A17 17 0 0 1 40 12z" fill="#f4f1ff"/>
    <circle class="i-twinkle" cx="16" cy="14" r="2" fill="#f4f1ff"/>
    <circle class="i-twinkle i-delay-1" cx="52" cy="54" r="1.6" fill="#f4f1ff"/>
    <circle class="i-twinkle i-delay-2" cx="10" cy="40" r="1.3" fill="#f4f1ff"/>`,
  clouds: `
    <g class="i-drift-slow">${cloud("#ffffffaa", "translate(-8 -10) scale(0.8)")}</g>
    <g class="i-drift">${cloud("#ffffff")}</g>`,
  rain: `
    ${cloud("#eef3fb", "translate(0 -8)")}
    <g stroke="#dbe9ff" stroke-width="3" stroke-linecap="round">
      <line class="i-fall" x1="24" y1="44" x2="21" y2="52"/>
      <line class="i-fall i-delay-1" x1="34" y1="44" x2="31" y2="52"/>
      <line class="i-fall i-delay-2" x1="44" y1="44" x2="41" y2="52"/>
    </g>`,
  snow: `
    ${cloud("#ffffff", "translate(0 -8)")}
    <g fill="#ffffff">
      <circle class="i-fall" cx="23" cy="48" r="2.6"/>
      <circle class="i-fall i-delay-1" cx="33" cy="48" r="2.6"/>
      <circle class="i-fall i-delay-2" cx="43" cy="48" r="2.6"/>
    </g>`,
  thunder: `
    ${cloud("#c9c3e6", "translate(0 -10)")}
    <path class="i-flash" d="M35 38 25 52h8l-4 10 12-16h-8l4-8z" fill="#ffe14d"/>`,
  wind: `
    <g fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round">
      <path class="i-gust" d="M8 24h30a7 7 0 1 0-7-7"/>
      <path class="i-gust i-delay-1" d="M8 34h42a7 7 0 1 1-7 7"/>
      <path class="i-gust i-delay-2" d="M8 44h20"/>
    </g>`,
  cold: `
    <g class="i-spin-slow" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none">
      ${[0, 60, 120]
        .map(
          (angle) => `<g transform="rotate(${angle} 32 32)">
            <line x1="32" y1="8" x2="32" y2="56"/>
            <path d="M26 13l6 6 6-6M26 51l6-6 6 6"/>
          </g>`,
        )
        .join("")}
    </g>`,
  hot: `
    <path d="M28 10a6 6 0 0 1 12 0v26a11 11 0 1 1-12 0z" fill="#fff1e6"/>
    <rect x="31.5" y="18" width="5" height="22" rx="2.5" fill="#ff5a36"/>
    <circle class="i-pulse" cx="34" cy="45" r="7" fill="#ff5a36"/>
    <g stroke="#fff1e6" stroke-width="2.5" stroke-linecap="round" fill="none" class="i-shimmer">
      <path d="M48 14c3 3-3 5 0 8s-3 5 0 8"/>
      <path d="M54 18c3 3-3 5 0 8"/>
    </g>`,
};

export const conditionIcon = (condition: Condition): string =>
  `<svg class="icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${ICONS[condition]}</svg>`;

export const WARNING_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 2 21h20L12 3z" fill="currentColor"/><path d="M12 10v5M12 18v.01" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
