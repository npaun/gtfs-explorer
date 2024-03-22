import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';

export default function Map({ sqlResult }: {sqlResult:{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]} |null}) {
  const mapContainer = useRef<HTMLDivElement|null>(null);
  const map = useRef<maplibregl.Map|null>(null);
  const [lat, lng] = getCenterFromResults(sqlResult);
  const [zoom] = useState(14);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once
  
    map.current = new maplibregl.Map({
      // @ts-expect-error idk
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
      center: [lng, lat],
      zoom: zoom
    });

    addMarkersToMap(sqlResult, map.current);
  }, [lng, lat, zoom, sqlResult]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
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

const MaxStops = 1000;

const StopProperties = ['stop_lon', 'stop_lat'];
const OptionalStopProperties = ['stop_id', 'stop_code', 'stop_name'];

function getCenterFromResults(results: any) {
  const centroid = [0, 0];
  const coords = new TableView(results, StopProperties);
  let nCoords = 0;
  for (const latLng of coords.rows()) {
      centroid[0] += parseFloat(latLng[0]);
      centroid[1] += parseFloat(latLng[1]);
      nCoords += 1;
      if (nCoords >= MaxStops) {
          break;
      }
  }
  if (nCoords > 0) {
      centroid[0] /= nCoords;
      centroid[1] /= nCoords;
  }
  return centroid;
}

function addMarkersToMap(results: any, map: any) {
  const stops = new TableView(results, StopProperties, OptionalStopProperties).rows();
  if (stops.length === 0) {
    return;
  }

  let nCoords = 0;
  for (const stop of stops) {
    new maplibregl.Marker()
        .setLngLat([stop[0], stop[1]])
        .addTo(map);
    nCoords += 1;
    if (nCoords >= MaxStops) {
        break;
    }
  }

  const bounds = stops.reduce((acc : any, coord : any) => {
    return acc.extend(coord.slice(0, 2));
  }, new maplibregl.LngLatBounds(stops[0].slice(0, 2), stops[0].slice(0, 2)));
  map.fitBounds(bounds, {
     padding: 50,
     maxZoom: 15
  });
}
