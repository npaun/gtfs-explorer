import { createDbWorker } from "sql.js-httpvfs"

// sadly there's no good way to package workers and wasm directly so you need a way to get these two URLs from your bundler.
// This is the webpack5 way to create a asset bundle of the worker and wasm:
const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL(
  "sql.js-httpvfs/dist/sql-wasm.wasm",
  import.meta.url,
);
// the legacy webpack4 way is something like `import wasmUrl from "file-loader!sql.js-httpvfs/dist/sql-wasm.wasm"`.


export const createWorker = (feedCode: string, step: string) => {
  return createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full", // file is just a plain old full sqlite database
          requestChunkSize: 4096, // the page size of the  sqlite database (by default 4096)
          url: `https://pheeds.storage.googleapis.com/${feedCode}_${step}.db` // url to the database (relative or full)
        }
      }
    ],
    workerUrl.toString(),
    wasmUrl.toString(),
  );
}
