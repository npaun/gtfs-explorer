import { useState, useEffect } from "react";
import './App.css';
import CodeBox from './CodeBox';
import { createWorker } from "./db";
import Map from "./Map";
import Table from "./Table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faTable } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [view, setView] = useState<'table'|'map'>('table');
  const [feedCode, setFeedCode] = useState('STM');
  const [step, setStep] = useState('PRE');
  const [worker, setWorker] = useState<Awaited<ReturnType<typeof createWorker>>|null>(null);
  const [query, setQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<{error:unknown}|{data:[{columns: string[]; values: unknown[][]}]}|null>(null);
  
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
    console.log('query effect');
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
        <div className="data-selector">
        <div className="title">
          <h1>GTFS Explorer</h1>
        </div>

              <div>
                <label htmlFor="feed">feed code</label>
                <input id="feed" width={12} value={feedCode} onChange={e => setFeedCode(e.target.value)} />
              </div>

              <div>
                <label htmlFor="step">step</label>
                <input id="step" width={3} value={step} onChange={e => setStep(e.target.value)} />
              </div>
              
              <div>
              <label htmlFor="view">view</label>
              <FontAwesomeIcon className="view-icons view-table" data-selected={view === "table"} icon={faTable}  onClick={() => setView('table')} />
              <FontAwesomeIcon className="view-icons view-table" data-selected={view === "map"} icon={faMap} onClick={() => setView('map')} />
              </div>
        </div>
        <CodeBox sendQuery={setQuery}/>
      </div>
      {view === 'table' ? <Table sqlResult={sqlResult} /> : <Map sqlResult={sqlResult} />}
    </div>
  );
}

export default App;
