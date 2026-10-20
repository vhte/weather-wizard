/** [longitude, latitude], GeoJSON order. */
export type Position = [number, number];

export type PolygonGeometry =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] };

/** Even-odd ray casting against one ring. */
function inRing(lon: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Inside the outer ring and outside every hole. */
function inPolygon(lon: number, lat: number, rings: Position[][]): boolean {
  const [outer, ...holes] = rings;
  if (!outer || !inRing(lon, lat, outer)) return false;
  return !holes.some((hole) => inRing(lon, lat, hole));
}

export function containsPoint(geometry: PolygonGeometry | null, lat: number, lon: number): boolean {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return inPolygon(lon, lat, geometry.coordinates);
  return geometry.coordinates.some((polygon) => inPolygon(lon, lat, polygon));
}
