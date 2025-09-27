import type { Point } from "$lib/firebase/types";

// GeoJSON types
export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [lon, lat]
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

export interface GeoJSONFeature<TProperties = any> {
  type: "Feature";
  geometry: GeoJSONPolygon | GeoJSONPoint;
  properties: TProperties;
}

export interface GeoJSONFeatureCollection<TProperties = any> {
  type: "FeatureCollection";
  features: GeoJSONFeature<TProperties>[];
}

export function itemToGeoJSON<T extends { lat?: number; lon?: number; geometry?: Point[] }>(
  item: T,
  options?: { asPoint?: boolean }
): GeoJSONFeature<T> {
  let geometry: GeoJSONPoint | GeoJSONPolygon;

  if (options?.asPoint) {
    if (item.lat == null || item.lon == null) {
      throw new Error("Item missing lat/lon for Point geometry");
    }
    geometry = { type: "Point", coordinates: [item.lon, item.lat] };
  } else {
    if (!item.geometry || item.geometry.length === 0) {
      throw new Error("Item missing geometry for Polygon");
    }
    geometry = { type: "Polygon", coordinates: [item.geometry.map(p => [p.lon, p.lat])] };
  }

  return {
    type: "Feature",
    geometry,
    properties: { ...item },
  };
}

// Multiple items to GeoJSON FeatureCollection
export function itemsToGeoJSON<T extends { lat?: number; lon?: number; geometry?: Point[] }>(
  items: T[],
  options?: { asPoint?: boolean }
): GeoJSONFeatureCollection<T> {
  return {
    type: "FeatureCollection",
    features: items.map(item => itemToGeoJSON(item, options)),
  };
}