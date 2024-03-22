const STOP_ID = 'stop_id';
const TRIP_ID = 'trip_id';

const QUERY_BY_SPATIAL_ID = {
  'shape_id': (ids: string[]) => `SELECT shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon FROM shapes WHERE shape_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'trip_id': (ids: string[]) => `SELECT trip.trip_id, shape.shape_id, shape.shape_pt_sequence, shape.shape_pt_lat, shape.shape_pt_lon FROM shapes JOIN trips on trip.shape_id = shape.shape_id WHERE trip.trip_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'stop_id': (ids: string[]) => `SELECT stop_id, stop_lat, stop_lon FROM stops WHERE stop_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_id': (ids: string[]) => `SELECT trip.route_id, shape.shape_id, shape.shape_pt_sequence, shape.shape_pt_lat, shape.shape_pt_lon FROM shapes JOIN trips on trip.shape_id = shape.shape_id WHERE trip.route_id IN (${ids.map(cleanSqlInput).join(",")});`,
  'route_short_name': (ids: string[]) => `SELECT route.route_short_name, shape.shape_id, shape.shape_pt_sequence, shape.shape_pt_lat, shape.shape_pt_lon FROM shapes JOIN trips on trip.shape_id = shape.shape_id JOIN routes on routes.route_id = trips.route_id WHERE route.route_short_name IN (${ids.map(cleanSqlInput).join(",")});`,
}

function interceptMapData(cols: string[], values: unknown[][]) {
  for (const [idField, queryBuilder] of Object.entries(QUERY_BY_SPATIAL_ID)) {
    const idFieldIdx = cols.indexOf(idField);
    if (idFieldIdx === -1) {
      continue;
    }
    const ids = values.map(row => String(row[idFieldIdx]));
    const query = queryBuilder(Array.from(new Set(ids)));
    console.log(query);
  }
}

const cleanSqlInput = (string: string) => `"${string.replaceAll('"', '""')}"`;
