import { useState, useEffect } from "react";
import './App.css';
import CodeBox from './CodeBox';
import { createWorker } from "./db";

function App() {
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
    <div className="gtfs explorer">
      <div className="header">
        <h1>GTFS Explorer</h1>
      </div>
      <div className="data-selector">
        <div>
          <label>
            feed code:
            <input value={feedCode} onChange={e => setFeedCode(e.target.value)} />
          </label>
          <label>
            step:
            <input value={step} onChange={e => setStep(e.target.value)} />
          </label>
        </div>
      </div>
      <CodeBox sendQuery={setQuery}/>
    </div>
  );
}

export default App;
