# cmark-bench

Benchmarking [`moonbit-community/cmark`](https://github.com/moonbit-community/cmark).

## Getting started

With `npm` installed, launching the benchmark page is as simple as:

```bash
npm run dev
```

In the page, choose any of the bench suites and click the "Run" button.

## Obtaining the V8 CPU profile

With your browser's [Performance Tab](https://developer.chrome.com/docs/devtools/performance) enabled,
you may choose one of the bench suites marked "Profiling" to launch the profiling mode.

When the bench suite completes, you will see the CPU profile directly available in the Performance Tab.

## How it works

This repo uses your browser for JavaScript-side benchmarking to compare the performance of the
`cmark` library compiled to WASM-GC and JavaScript backends against certain popular JavaScript-based 
CommonMark libraries as a reference, such as `commonmark.js` and `marked.js`.

The bench involves parsing a large Markdown file and rendering it to HTML.

To be able to perform a relatively fair comparison, the Markdown file is passed in as a JavaScript
string. To this end, a wrapper MoonBit library `cmarkwrap` is provided with this repo, so that an
`extern` function `render()` can be exposed to both WASM-GC and Javascript environments:

```moonbit
pub fn render(md : String) -> String
```

With the WASM-GC backend, we also set the JavaScript builtin string feature to `true`:

```json
{ "link": { "wasm-gc": { "use-js-builtin-string": true } } }
```

Optionally, the `console.profile()` and `console.profileEnd()` pair is used to trigger the
collection of a V8 CPU profile, which can then be analyzed in Chromium DevTools.
