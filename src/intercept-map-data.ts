const QUERY_BY_SPATIAL_ID = {
  'shape_id': (ids: string[]) => `SELECT shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon FROM shapes WHERE shape_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'trip_id': (ids: string[]) => `SELECT trips.trip_id, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id WHERE trips.trip_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'stop_id': (ids: string[]) => `SELECT stop_id, stop_lat, stop_lon FROM stops WHERE stop_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_id': (ids: string[]) => `SELECT trips.route_id, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id WHERE trips.route_id IN (${ids.map(cleanSqlInput).join(",")});`,

  'trip_headsign': (ids: string[]) => `SELECT trips.trip_headsign, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id WHERE trips.trip_headsign IN (${ids.map(cleanSqlInput).join(",")});`,
  'stop_code': (ids: string[]) => `SELECT stop_code, stop_lat, stop_lon FROM stops WHERE stop_code IN (${ids.map(cleanSqlInput).join(",")});`,
  'stop_name': (ids: string[]) => `SELECT stop_name, stop_lat, stop_lon FROM stops WHERE stop_name IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_short_name': (ids: string[]) => `SELECT routes.route_short_name, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id JOIN routes on routes.route_id = trips.route_id WHERE routes.route_short_name IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_key': (ids: string[]) => `SELECT routes.route_key, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id JOIN routes on routes.route_id = trips.route_id WHERE routes.route_key IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_long_name': (ids: string[]) => `SELECT routes.route_long_name, shapes.shape_id, shapes.shape_pt_sequence, shapes.shape_pt_lat, shapes.shape_pt_lon FROM shapes JOIN trips on trips.shape_id = shapes.shape_id JOIN routes on routes.route_id = trips.route_id WHERE routes.route_long_name IN (${ids.map(cleanSqlInput).join(",")});`,
}

const SPATIAL_GTFS_FIELDS = new Set(['stop_lat', 'stop_lon', 'shape_pt_lat', 'shape_pt_lon']);

export function interceptMapData(cols: string[], values: unknown[][]) {
  if (cols.some(col => SPATIAL_GTFS_FIELDS.has(col))) return;

  for (const [idField, queryBuilder] of Object.entries(QUERY_BY_SPATIAL_ID)) {
    const idFieldIdx = cols.indexOf(idField);
    if (idFieldIdx === -1) {
      continue;
    }
    const ids = values.map(row => String(row[idFieldIdx]));
    return queryBuilder(Array.from(new Set(ids)).filter(id => id));
  }
}

const cleanSqlInput = (string: string) => `"${string.replaceAll('"', '""')}"`;
