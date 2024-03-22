import { useState, useEffect } from "react";
import './App.css';
import CodeBox from './CodeBox';
import { createWorker } from "./db";
import Map from "./Map";
import Table from "./Table";

function App() {
  const fakeRows = [
    ["1234", "Highway 6 / Slocan Park", "49.0000", "-117.1234"],
    ["1235", "Nelson: Ward / Baker", "49.5555", "-117.3333"],
    ["1236", "KBR Hospital", "49.001", "-117.000"],
    ["1237", "Castlegar: Selkirk College", "49.00067", "-117.002020"]
  ];
  const fakeData = [
    ["stop_id", "stop_name", "stop_lat", "stop_lon"],
    ...fakeRows,
    ...fakeRows,
    ...fakeRows,
    ...fakeRows,
    ...fakeRows,
    ...fakeRows
  ];

  const [view, setView] = useState<'table'|'map'>('table');
  const [feedCode, setFeedCode] = useState('STM');
  const [step, setStep] = useState('PRE');
  const [worker, setWorker] = useState<Awaited<ReturnType<typeof createWorker>>|null>(null);
  const [query, setQuery] = useState('');
  const [data, setSqlResult] = useState<{error:string}|{data:unknown}|null>(null);
  
  useEffect(() => {
    if (!feedCode || !step) {
      setWorker(null);
      console.log("worker was cleared");
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
  
  return (
    <div className="explorer">
      <div className="header">
        <div className="title">
          <h1>GTFS Explorer</h1>
        </div>
        <div className="data-selector">
              <div>
                <label htmlFor="feed">feed code:</label>
                <input id="feed" value={feedCode} onChange={e => setFeedCode(e.target.value)} />
              </div>

              <div>
                <label htmlFor="step">step:</label>
                <input id="step" value={step} onChange={e => setStep(e.target.value)} />
              </div>
              
              <div>
              <label htmlFor="view">view:</label>
              <button id="view" onClick={() => setView(view === 'table' ? 'map' : 'table')}>{view}</button>
              </div>
        </div>
        <CodeBox sendQuery={setQuery}/>
      </div>
      {view === 'table' ? <Table results={fakeData} /> : <Map />}
    </div>
  );
}

export default App;
