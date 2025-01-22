const cmarkwrapWASM = await WebAssembly.instantiateStreaming(
  fetch("../cmarkwrap/target/wasm-gc/release/build/lib/lib.wasm"),
  {},
  {
    builtins: ["js-string"],
    importedStringConstants: "_",
  }
);
const { render, result_is_ok, result_unwrap } = cmarkwrapWASM.instance.exports;

function cmarkWASM(md) {
  const res = render(md);
  if (!result_is_ok(res)) {
    throw new Error("cmarkWASM failed to render");
  }
  return result_unwrap(res);
}

async function specHTML() {
  const doc = await fetch("../public/tour.md");
  const docText = await doc.text();
  return cmarkWASM(docText);
}

document.getElementById("app").innerHTML = await specHTML();
