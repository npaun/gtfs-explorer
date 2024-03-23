import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';

export default function Map({ sqlResult }: {sqlResult:{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]} |null}) {
  const mapContainer = useRef<HTMLDivElement|null>(null);
  const map = useRef<maplibregl.Map|null>(null);
  const markers = useRef<Array<maplibregl.Marker>|null>(null);
  const [zoom] = useState(14);

  useEffect(() => {
    if (!map.current) { // stops map from intializing more than once
      markers.current = []
      createMap(map, mapContainer, zoom);
    }

    resetMap(map.current, markers.current)
    const bounds = addMarkersToMap(sqlResult, map.current, markers.current);
    addShapesToMap(sqlResult, map.current, bounds);
    setBounds(map.current, bounds);

  }, [zoom, sqlResult]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}

function createMap(map :any, mapContainer: any, zoom: number) {
  map.current = new maplibregl.Map({
    container: mapContainer.current,
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          'type': 'raster',
          'tiles': [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          'tileSize': 256,
          'attribution':  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    },
    center: [0, 0],
    zoom: zoom
  });
}

class TableView {
  _columns : any;
  _rows : any;
  indices : any;

  constructor(results: any, colNames: any, optionalColNames?: any) {
    this.indices = [];
    if (!results || !('data' in results) || results.data.length === 0 || results.data[0].values.length === 0) {
      return;
    }
    this._columns = results.data[0].columns;
    this._rows = results.data[0].values;
    for (const colName of colNames) {
      const idx = this._columns.indexOf(colName);
      if (idx < 0) {
        this.indices = [];
        break;
      }
      this.indices.push(idx);
    }
    if (optionalColNames !== undefined) {
      for (const colName of optionalColNames) {
        const idx = this._columns.indexOf(colName);
        this.indices.push(idx);
      }
    }
  }

  rows() {
    if (this.indices.length === 0) {
      return [];
    }
    return this._rows.map((row : any) => this.indices.map((idx : number) => idx >= 0 ? row[idx] : null));
  }
}


class Stop {
  lat: number;
  lon: number;
  id: string|null;
  code: string|null;
  name: string|null;

  constructor(arr: Array<string>) {
    this.lat = parseFloat(arr[0]);
    this.lon = parseFloat(arr[1]);
    this.id = arr.length >= 3 ? arr[2] : null;
    this.code = arr.length >= 4 ? arr[3] : null;
    this.name = arr.length >= 5 ? arr[4] : null;
  }

  toHTMLTooltip(): string|null {
    if (this.id === null && this.code === null && this.name === null) {
      return null;
    }

    let tooltip = ''
    if (this.code !== null && this.code !== '') {
      tooltip += this.code + ' ';
    }

    if (this.name !== null) {
      tooltip += this.name;
    }

    if (tooltip.length > 0) {
      tooltip = `<b>${tooltip}</b>`;
    }

    if (this.id !== null && this.id !== '') {
      if (tooltip.length > 0) {
        tooltip += '<br/>';
      }
      tooltip += `stop_id: ${this.id}`;
    }

    return tooltip;
  }

  static readonly PROPERTIES: Array<string> = ['stop_lat', 'stop_lon'];
  static readonly OPTIONAL_PROPERTIES: Array<string> = ['stop_id', 'stop_code', 'stop_name'];

  static view(results: any): Array<Stop> {
    return new TableView(results, Stop.PROPERTIES, Stop.OPTIONAL_PROPERTIES).rows().map((x: Array<string>) => new Stop(x));
  }
}


class Point {
  lat: number;
  lon: number;

  constructor(lat: string, lon: string) {
    this.lat = parseFloat(lat);
    this.lon = parseFloat(lon);
  }
}


class Shape {
  id: string;
  points: Array<Point>;

  static compareShapeId(a: Array<string>, b: Array<string>) {
    if (a[0] < b[0]) {
      return -1;
    }
    else if (a[0] > b[0]) {
      return 1;
    }
    else {
      return 0;
    }
  }

  toFeature() : any {
    return {
      type: 'Feature',
      properties: {
          name: this.id,
      },
      geometry: {
        type: 'LineString',
        coordinates: this.points.map((p: Point) => [p.lon, p.lat]),
      }
    }
  }

  static compareSequence(a: Array<any>, b: Array<any>) {
    return a[3] - b[3];
  }

  constructor(arr: Array<Array<any>>) {
    this.id = arr[0][0];
    this.points = [];

    const filteredArray = [];
    for (const row of arr) {
      if (row[0] !== this.id) {
        continue;
      }
      row[3] = parseInt(row[3]);
      filteredArray.push(row);
    }
    filteredArray.sort(Shape.compareSequence);
    let lastSeq = -1;
    for (const row of filteredArray) {
      if (lastSeq === row[3]) {
        continue;
      }
      lastSeq = row[3];
      this.points.push(new Point(row[1], row[2]));
    }
  }

  static readonly PROPERTIES: Array<string> = ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence'];

  static view(results: any): Array<Shape> {
    const shapeView = new TableView(results, Shape.PROPERTIES);
    const rows = shapeView.rows().sort(Shape.compareShapeId);
    if (rows.length === 0) {
      return [];
    }
    let lastShapeId = rows[0][0];
    let lastShape = [];
    const shapes = [];
    for (const shp of shapeView.rows().sort(Shape.compareShapeId))  {
      if (lastShapeId !== shp[0]) {
        shapes.push(new Shape(lastShape));
        lastShape = [];
        lastShapeId = shp[0];
      }
      lastShape.push(shp);
    }
    if (lastShapeId !== '') {
      shapes.push(new Shape(lastShape));
    }
    return shapes;
  }
}

const MaxStops = 1000;

function setBounds(map: any, bounds: any) {
  if (!bounds || bounds.isEmpty()) {
    return;
  }
  map.fitBounds(bounds, {
    padding: 50,
    maxZoom: 15
  });
}

const tooltips : Array<maplibregl.Popup> = [];

function displayTooltip(e: any, map: maplibregl.Map) {
  while (true) {
    const tooltip: maplibregl.Popup|undefined = tooltips.pop();
    if (tooltip) {
      tooltip.remove();
    }
    else {
      break;
    }
  }

  if (map.getLayer('gtfs-shapes-layer') === undefined) {
    return;
  }

  const features = map.queryRenderedFeatures(e.point, { layers: ['gtfs-shapes-layer'] });

  for (const feature of features) {
    const tooltip = new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML('<b>' + feature.properties.name + '</b>')
      .addTo(map);
    tooltips.push(tooltip);
  }
}

function handleMapLoad(map: maplibregl.Map, features: any) {
  if (features.length === 0) {
    return;
  }

  map.addSource('gtfs-shapes', {
    type: 'geojson' as const,
    data: {
        type: 'FeatureCollection',
        features: features
    }
  });

  map.addLayer({
    id: 'gtfs-shapes-layer',
    type: 'line' as const,
    source: 'gtfs-shapes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 2,
    }
  });
}

const mapLoadHandlers: any = [];

function addShapesToMap(results: any, map: maplibregl.Map|null, bounds: any) {
  if (map === null) {
    return;
  }

  let nShapes = 0;
  let features: any = [];

  for (const shape of Shape.view(results)) {
    nShapes++;
    if (nShapes === MaxStops) {
      break;
    }
    for (const point of shape.points) {
      bounds.extend([point.lon, point.lat]);
    }
    features.push(shape.toFeature());
  }

  map.on('mousemove', (e) => {
    displayTooltip(e, map);
  });

  if (map.loaded()) {
    handleMapLoad(map, features);
  }
  else {
    const handler = function() {
      handleMapLoad(map, features);
    };
    map.on('load', handler);
    mapLoadHandlers.push(handler);
  }
}

function resetMap(map: maplibregl.Map|null, markers: Array<maplibregl.Marker>|null) {
  if (markers !== null) {
    while (markers.length > 0) {
      const marker = markers.pop();
      if (marker) {
        marker.remove();
      }
    }
  }

  if (map == null) {
    return;
  }

  if (map.getLayer('gtfs-shapes-layer') !== undefined) {
    map.removeLayer('gtfs-shapes-layer');
  }
  if (map.getSource('gtfs-shapes') !== undefined) {
    map.removeSource('gtfs-shapes');
  }

  while (mapLoadHandlers.length > 0) {
    const handler = mapLoadHandlers.pop();
    map.off('load', handler);
  }
}

function addMarkersToMap(results: any, map: maplibregl.Map|null, markers: Array<maplibregl.Marker>|null) {
  if (map === null || markers === null) {
    return;
  }

  const stops = Stop.view(results);
  if (stops.length === 0) {
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  let nCoords = 0;
  for (const stop of stops) {
    if (!isFinite(stop.lon) || !isFinite(stop.lat)) {
      continue;
    }
    bounds.extend([stop.lon, stop.lat]);
    const marker = getMarker(stop, map);
    markers.push(marker);
    nCoords += 1;
    if (nCoords >= MaxStops) {
        break;
    }
  }

  return bounds;
}

function getMarker(stop: Stop, map: maplibregl.Map) {
  const marker = new maplibregl.Marker()
    .setLngLat([stop.lon, stop.lat])
    .addTo(map);

  const tooltipHTML = stop.toHTMLTooltip();
  if (tooltipHTML !== null) {
    const tooltip = new maplibregl.Popup({ offset: 25 }) // Adjust offset as needed
      .setHTML(tooltipHTML);

    marker.getElement().addEventListener('mouseenter', () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    });

    marker.getElement().addEventListener('mouseleave', () => {
      tooltip.remove();
    });
  }

  return marker;
}
