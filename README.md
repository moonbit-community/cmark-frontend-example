# cmark-frontend-example

This example project illustrates how to use MoonBit APIs exported to WASM
in a JavaScript-based Web frontend application.

## Getting Started

You will need a recent version of MoonBit installed on your system, as well
as any Web server of your choice.
The following example uses Python's built-in HTTP server.

```bash
> moon -C cmarkwrap build --release --no-strip --target=wasm-gc
> python3 -m http.server
```

Then, you may open your browser and navigate to `http://localhost:8000`.
