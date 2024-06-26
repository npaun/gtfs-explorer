import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import './App.css';
import CodeBox from './CodeBox';
import { createWorker } from "./db";
import Map from "./Map";
import Table from "./Table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faTable } from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from "use-debounce";
import SampleQueries from "./SampleQueries";
import { interceptMapData } from "./intercept-map-data";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setFeedCode = (feedCode: string) => setSearchParams((prev) => new URLSearchParams({ ...Object.fromEntries(prev.entries()), ...{ feedCode } }));
  const setStep = (step: string) => setSearchParams((prev) => new URLSearchParams({ ...Object.fromEntries(prev.entries()), ...{ step } }));
  const setQuery = (query: string) => setSearchParams((prev) => new URLSearchParams({ ...Object.fromEntries(prev.entries()), ...{ query } }));
  const [feedCode] = useDebounce(searchParams.get('feedCode'), 500);
  const [step] = useDebounce(searchParams.get('step'), 500);
  const [query] = useDebounce(searchParams.get('query'), 500);

  const [view, setView] = useState<'table'|'map'>('table');
  const [worker, setWorker] = useState<Awaited<ReturnType<typeof createWorker>>|null>(null);
  const [sqlResult, setSqlResult] = useState<{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]}|null>(null);
  const [mapQuery, setMapQuery] = useState<{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]}|null>(null);
  
  useEffect(() => {
    if (!feedCode || !step) {
      setWorker(null);
      return;
    }

    createWorker(feedCode, step)
      .then(setWorker)
      .catch(() => setWorker(null));
  }, [feedCode, step]);

  useEffect(() => {
    if (query && query.endsWith(";")) {
      if (!worker) {
        setSqlResult({ error: "Not connected to the database" });
        return;
      }
      worker.db
        // @ts-ignore-error the typings for this library are not great
        .exec(query)
        // @ts-ignore-error the typings for this library are not great
        .then((data) => setSqlResult({ data }))
        // @ts-ignore-error the typings for this library are not great
        .catch((error) => setSqlResult({ error }));
    }
  }, [query, worker]);

  useEffect(() => {
    if (!worker || !sqlResult || 'error' in sqlResult || !sqlResult.data || !sqlResult.data[0]) {
      setMapQuery(null);
      return;
    }
    const interceptedMapQuery = interceptMapData(sqlResult.data[0].columns, sqlResult.data[0].values);
    if (!interceptedMapQuery) {
      setMapQuery(sqlResult);
    } else {
      worker.db
        // @ts-ignore-error the typings for this library are not great
        .exec(interceptedMapQuery ?? query)
        // @ts-ignore-error the typings for this library are not great
        .then((data) => setMapQuery({ data }))
        // @ts-ignore-error the typings for this library are not great
        .catch((error) => setSqlResult({ error }));
    }
  }, [query, sqlResult, worker]);
  
  return (
    <div className="explorer">
      <div className="header">
        <div className="data-selector">
        <div className="title">
          <h1>GTFS Explorer</h1>
        </div>

              <div>
                <label htmlFor="feed">feed code</label>
                <input id="feed" width={12} value={searchParams.get('feedCode') ?? ''} onChange={e => setFeedCode(e.target.value)} />
              </div>

              <div>
                <label htmlFor="step">step</label>
                <input id="step" width={3} value={searchParams.get('step') ?? ''} onChange={e => setStep(e.target.value)} />
              </div>
              
              <div>
              <label htmlFor="view">view</label>
              <FontAwesomeIcon className="view-icons view-table" data-selected={view === "table"} icon={faTable}  onClick={() => setView('table')} />
              <FontAwesomeIcon className="view-icons view-table" data-selected={view === "map"} icon={faMap} onClick={() => setView('map')} />
              </div>
        </div>
        <CodeBox sendQuery={setQuery} query={searchParams.get('query')}/>
      </div>
      {view === 'table' ? <Table sqlResult={sqlResult} /> : <Map sqlResult={mapQuery} />}
      <SampleQueries shouldDisplay={!query} setQuery={setQuery} />
    </div>
  );
}

export default App;
