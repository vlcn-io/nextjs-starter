import { useEffect, useRef, useState } from "react";
import initWasm from "@vlcn.io/crsqlite-wasm";
// @ts-ignore
import wasmUrl from "@vlcn.io/crsqlite-wasm/crsqlite.wasm";
import { CtxAsync, useQuery } from "@vlcn.io/react";
import tblrx from "@vlcn.io/rx-tbl";
import randomWords from "../common/randomWords.js";
import testSchema from "../schemas/testSchema.mjs";

type TestRecord = { id: string; name: string };

export default function Home() {
  const [ctx, setCtx] = useState<CtxAsync | null>(null);
  useEffect(() => {
    initWasm(() => wasmUrl).then(async (sqlite) => {
      const db = await sqlite.open(":memory:");
      await db.exec(testSchema.content);
      const ctx = {
        db,
        rx: tblrx(db),
      };
      setCtx(ctx);
    });
    return () => {
      if (ctx) {
        ctx.db.close();
      }
    };
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>{ctx == null ? "Loading db..." : <Component ctx={ctx} />}</div>
    </main>
  );
}

const wordOptions = { exactly: 3, join: " " };
function Component({ ctx }: { ctx: CtxAsync }) {
  const data = useQuery<TestRecord>(
    ctx,
    "SELECT * FROM test ORDER BY rowid DESC"
  ).data;

  const addData = () => {
    ctx.db.exec("INSERT INTO test (id, name) VALUES (?, ?);", [
      nanoid(10),
      randomWords(wordOptions) as string,
    ]);
  };

  return (
    <div style={{ minWidth: 350 }}>
      <button
        onClick={addData}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Data
      </button>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">{row.id}</td>
              <td className="border px-4 py-2">{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const nanoid = (t = 21) =>
  crypto
    .getRandomValues(new Uint8Array(t))
    .reduce(
      (t, e) =>
        (t +=
          (e &= 63) < 36
            ? e.toString(36)
            : e < 62
            ? (e - 26).toString(36).toUpperCase()
            : e > 62
            ? "-"
            : "_"),
      ""
    );
