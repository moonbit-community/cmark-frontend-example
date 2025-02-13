import * as comlink from "comlink";
import { micromark } from "micromark";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { Bench } from "tinybench";
import { unified } from "unified";

// Benchmark input/output definitions

export enum BenchSuite {
  SpecProfileWASMGC = "spec/profile/wasm-gc",
  SpecX1 = "spec/1",
  SpecX5 = "spec/5",
  SpecX10 = "spec/10",
}

export type Bencher = { results: BenchResult[]; run: (suite: string) => void };

export interface BenchResult {
  latencyAverageMS: number;
  latencyMedianMS: number;
  latencyRME: number;
  sampleCount: number;
  taskName: string;
  thruputAverageHZ: number;
  thruputMedianHZ: number;
  thruputRME: number;
}

async function benchSuiteDoc(suite: string): Promise<string> {
  const [fileName, multiplier] = suite.split("/");
  let multiplierNum = parseInt(multiplier);
  if (isNaN(multiplierNum)) {
    multiplierNum = 10;
  }
  const originalDoc = await (await fetch(`/${fileName}.md`)).text();
  return originalDoc.repeat(multiplierNum);
}

// Imports from `cmark.mbt` (WASM-GC backend)

async function makeCmarkWASM(path: string): Promise<(md: string) => string> {
  const cmarkwrapWASM = await WebAssembly.instantiateStreaming(
    fetch(path),
    {},
    // @ts-expect-error - This extra parameter is undocumented.
    {
      builtins: ["js-string"],
      importedStringConstants: "_",
    }
  );

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const { render, result_is_ok, result_unwrap }: any =
    cmarkwrapWASM.instance.exports;

  return (md: string): string => {
    const res = render(md);
    if (!result_is_ok(res)) {
      throw new Error("cmarkWASM failed to render");
    }
    return result_unwrap(res);
  };
}

const cmarkOptWASM = await makeCmarkWASM("../assets/cmarkopt.wasm");
const cmarkWASM = await makeCmarkWASM("../assets/cmark.wasm");

const bencher: Bencher = {
  results: [],
  async run(suite: string) {
    const fullDoc = await benchSuiteDoc(suite);

    const bench = new Bench({
      iterations: 10,
      time: 100,
      warmupIterations: 2,
      warmupTime: 50,
    });

    const isProfile = suite.endsWith("profile/wasm-gc");

    // Control groups
    if (!isProfile) {
      bench.add("micromark", () => {
        micromark(fullDoc);
      });

      bench.add("remark", () => {
        String(unified().use(remarkParse).use(remarkHtml).process(fullDoc));
      });
    }

    // Experimental group
    if (isProfile) {
      // @ts-expect-error - This is a profiling-specific API.
      console.profile();
    }
    bench.add("cmark.mbt (WASM-GC)", () => {
      cmarkWASM(fullDoc);
    });
    bench.add("cmark.mbt (WASM-GC + wasm-opt)", () => {
      cmarkOptWASM(fullDoc);
    });
    if (isProfile) {
      // @ts-expect-error - This is a profiling-specific API.
      console.profileEnd();
    }

    const rawResults = await bench.run();
    this.results = rawResults.map((task) => ({
      latencyAverageMS: task.result!.latency.mean,
      latencyMedianMS: task.result!.latency.p50!,
      latencyRME: task.result!.latency.rme,
      sampleCount: task.result!.latency.samples.length,
      taskName: task.name,
      thruputAverageHZ: task.result!.throughput.mean,
      thruputMedianHZ: task.result!.throughput.p50!,
      thruputRME: task.result!.throughput.rme,
    }));
  },
};

comlink.expose(bencher);
