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

    addMarkersToMap(sqlResult, map.current, markers.current);

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

const MaxStops = 1000;

function addMarkersToMap(results: any, map: maplibregl.Map|null, markers: Array<maplibregl.Marker>|null) {
  if (map === null || markers === null) {
    return;
  }

  while (markers.length > 0) {
    const marker = markers.pop();
    if (marker) {
      marker.remove();
    }
  }

  const stops = Stop.view(results);
  if (stops.length === 0) {
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  let nCoords = 0;
  for (const stop of stops) {
    bounds.extend([stop.lon, stop.lat]);
    const marker = getMarker(stop, map);
    markers.push(marker);
    nCoords += 1;
    if (nCoords >= MaxStops) {
        break;
    }
  }

  map.fitBounds(bounds, {
    padding: 50,
    maxZoom: 15
  });
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
