import "./SampleQueries.css";


const samples = [
    {
        "title": "View all stops for a feed",
        "query": `
        SELECT * FROM stops;
        `
    },
    {
        "title": "See the schedule for a trip",
        "query": `
        SELECT stop_sequence, arrival_time, departure_time, stops.stop_id, stop_name, stop_lat, stop_lon 
            FROM stop_times 
            JOIN stops ON stops.stop_id=stop_times.stop_id
            WHERE trip_id='2255266:1835074:1835828'
            ORDER BY cast(stop_sequence as int) ASC;
        `
    },
    {
        "title": "Find trips serving a stop",
        "query": `
        select trips.trip_id, route_id, trip_headsign, departure_time from stop_times 
  join trips on trips.trip_id=stop_times.trip_id
  join stops on stops.stop_id=stop_times.stop_id 
  where stop_name='Slocan Park Gas Station'
  order by departure_time ASC;
        `
    },
    {
        "title": "Compute the number of trips for each route",
        "query": `
        select route_id, count(*) as num_trips from trips group by route_id order by num_trips desc;
        `
    },
    {
        "title": "Analyze continuations within a block",
        "query": `
        drop view if exists trip_spans;
        create temporary view trip_spans as 
          select trip_id, 
            min(cast(stop_sequence as int)) as sseq, 
            max(cast(stop_sequence as int)) as eseq
          from stop_times group by trip_id;
        
        select trip_spans.trip_id, trips.route_id, trips.trip_headsign, sst.departure_time, est.arrival_time 
          from trip_spans 
          join stop_times sst on sst.trip_id=trip_spans.trip_id and sst.stop_sequence=trip_spans.sseq
          join stop_times est on est.trip_id=trip_spans.trip_id and est.stop_sequence=trip_spans.eseq
          join trips on trips.trip_id=trip_spans.trip_id
          where block_id='488839';
          `
    }
];

function SampleQuery({title, query, setQuery}: {title: string, query: string, setQuery: unknown}) {
    return (
        <div className="sample">
        <h2>{title}</h2>
        <pre className="code-link" onClick={() => setQuery(query.trim())}>{query}</pre>
        </div>
    );
}

export default function SampleQueries({shouldDisplay, setQuery}: {shouldDisplay: boolean, setQuery: unknown}) {
    if (!shouldDisplay) {
        return (<></>);
    }

    return (
        <div className="samples">
        {samples.map((samp) => (<SampleQuery title={samp.title} query={samp.query} setQuery={setQuery} />))}
        </div>
    );
}