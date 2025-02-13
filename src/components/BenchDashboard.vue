<script setup lang="ts">
import Bowser from "bowser";
import * as comlink from "comlink";
import { ref } from "vue";

import { type Bencher, type BenchResult, BenchSuite } from "../bencher";
import BenchWorker from "../bencher?worker";

const benchSuites = [
  { text: "CommonMark Spec x 1", value: BenchSuite.SpecX1 },
  { text: "CommonMark Spec x 5", value: BenchSuite.SpecX5 },
  { text: "CommonMark Spec x 10", value: BenchSuite.SpecX10 },
  {
    text: "CommonMark Spec (WASM-GC Profiling)",
    value: BenchSuite.SpecProfileWASMGC,
  },
];

const benchSuite = ref("");
const benchRunning = ref(false);
const benchResults = ref<BenchResult[]>([]);

const hintTextOverride = ref<null | string>();
const buttonText = "Run";

const bencher = comlink.wrap<Bencher>(new BenchWorker());

function getBrowserVersion() {
  const { name, version } = Bowser.getParser(navigator.userAgent).getBrowser();
  return `${name} v${version}`;
}

async function onClick() {
  if (!Object.values<string>(BenchSuite).includes(benchSuite.value)) {
    hintTextOverride.value = "Unknown bench suite 🤷";
    await new Promise((resolve) => setTimeout(resolve, 2000));
    hintTextOverride.value = null;
    return;
  }
  benchRunning.value = true;
  benchResults.value = [];

  await bencher.run(benchSuite.value);
  benchResults.value = (await bencher.results).sort(
    (res, res1) => res1.thruputAverageHZ - res.thruputAverageHZ
  );
  benchRunning.value = false;
}
</script>

<template>
  <h1>Cmark.mbt</h1>

  <div v-if="benchResults.length !== 0">
    <VTable :data="benchResults">
      <template #head>
        <tr>
          <th>Test <small>(Fastest to Slowest)</small></th>
          <th>Samples</th>
          <th>Average/Hz</th>
          <th>±/%</th>
        </tr>
      </template>
      <template #body="{ rows }">
        <tr v-for="row in rows" :key="row.id">
          <td>{{ row.taskName }}</td>
          <td>{{ row.sampleCount }}</td>
          <td>{{ row.thruputAverageHZ.toFixed(2) }}</td>
          <td>{{ row.thruputRME.toFixed(2) }}</td>
        </tr>
      </template>
    </VTable>
  </div>
  <div v-else>
    {{
      hintTextOverride ??
      (benchRunning
        ? "Benchmark is running... ⏳"
        : "Please pick an option below to run the benchmark 👇")
    }}
  </div>
  <div class="card">
    <select name="suite" id="suite" v-model="benchSuite">
      <option value="" disabled>Bench suite</option>
      <option
        v-for="suite in benchSuites"
        :value="suite.value"
        :key="suite.value"
      >
        {{ suite.text }}
      </option>
    </select>
    <button type="button" @click="onClick()">{{ buttonText }}</button>
  </div>

  <footer>
    <small> Tested on {{ `${getBrowserVersion()}` }} </small>
  </footer>
</template>

<style scoped>
table {
  border-spacing: 0;
}
th,
td {
  padding: 15px;
  text-align: left;
  border: 1px solid #ddd;
}

div.card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1em;
}

select {
  -moz-appearance: none; /* Firefox */
  -webkit-appearance: none; /* Safari and Chrome */
  appearance: none;
}
</style>
