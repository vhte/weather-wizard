import { describe, expect, it } from "vitest";
import { containsPoint, type PolygonGeometry, type Position } from "./geo";

const square = (x: number, y: number, size: number): Position[] => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y],
];

describe("containsPoint", () => {
  const polygon: PolygonGeometry = { type: "Polygon", coordinates: [square(-80, 40, 10)] };

  it("takes lat/lon while GeoJSON stores lon/lat", () => {
    expect(containsPoint(polygon, 45, -75)).toBe(true);
    expect(containsPoint(polygon, -75, 45)).toBe(false);
  });

  it("is false outside and for missing geometry", () => {
    expect(containsPoint(polygon, 55, -75)).toBe(false);
    expect(containsPoint(null, 45, -75)).toBe(false);
  });

  it("excludes holes", () => {
    const donut: PolygonGeometry = { type: "Polygon", coordinates: [square(0, 0, 10), square(4, 4, 2)] };
    expect(containsPoint(donut, 5, 5)).toBe(false);
    expect(containsPoint(donut, 1, 1)).toBe(true);
  });

  it("checks every part of a MultiPolygon", () => {
    const multi: PolygonGeometry = {
      type: "MultiPolygon",
      coordinates: [[square(0, 0, 1)], [square(10, 10, 1)]],
    };
    expect(containsPoint(multi, 10.5, 10.5)).toBe(true);
    expect(containsPoint(multi, 5, 5)).toBe(false);
  });
});
