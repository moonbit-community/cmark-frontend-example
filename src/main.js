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

async function fetchDocText(path) {
  const doc = await fetch(path);
  return await doc.text();
}

async function homeView() {
  const docText = await fetchDocText("../public/tour.md");
  return `<hr />` + cmarkWASM(docText);
}

async function profileView() {
  const docText = await fetchDocText("../public/spec.md");
  console.profile();
  const res = cmarkWASM(docText);
  console.profileEnd();
  return (
    `<h2>Note</h2>
<p>
  <strong
    >Open your browser's
    <a
      href="https://developer.chrome.com/docs/devtools/performance"
      rel="nofollow"
      >Performance Tab</a
    >
    and refresh this page to see the CPU profile.</strong
  >
</p>` + res
  );
}

async function onRouteChange() {
  let view;
  const location = window.location.hash.replace("#", "") ?? "/";
  switch (location) {
    case "profile":
      view = await profileView();
      break;
    default:
      view = await homeView();
  }
  document.getElementById("app").innerHTML = view;
}

window.addEventListener("hashchange", async () => await onRouteChange());

onRouteChange();
