# popcount-simd

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

Fast popcount (counting set bits) using WebAssembly SIMD.

This module provides a highly optimized function to count the number of set bits (1s) in a `Uint8Array` by leveraging WebAssembly SIMD instructions for parallel processing.

[**Live Benchmark Demo**](https://code4fukui.github.io/popcount/)

## Performance

The WebAssembly SIMD implementation is significantly faster than a traditional JavaScript lookup-table approach, especially for large data sets. The performance gap widens as the array size increases.

The live demo shows the benchmark results:
-   **Wasm SIMD (blue line):** Consistently faster with a near-linear performance curve.
-   **JS (orange line):** Slower, especially on arrays larger than 100 KB.


![Benchmark Chart](https://code4fukui.github.io/popcount/benchmark.png)


## Features

-   Utilizes WebAssembly's fixed-width SIMD128 instructions.
-   Processes 16 bytes per loop iteration using `i8x16.popcnt`.
-   Efficiently sums lane results using hierarchical `extadd_pairwise` instructions.

## Usage

Import the `popcount` function from the ES module. It accepts a `Uint8Array` and returns the total count of set bits.

```js
import { popcount } from "https://code4fukui.github.io/popcount/popcount.js";

// Example data
const data = new Uint8Array([0b11110000, 0b10101010, 0b11111111]); // 4 + 4 + 8 = 16

const count = popcount(data);

console.log(count); // 16
```

## Build From Source

To build the WebAssembly module from the `.wat` source file, you will need the [WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt) for `wat2wasm`.

1.  **Compile the WebAssembly Text Format to a binary:**
    ```bash
    wat2wasm popcnt16.wat -o popcnt16.wasm
    ```

2.  **Convert the WASM binary to a JavaScript ES module:**
    This project uses [bin2js](https://github.com/code4fukui/bin2js) to embed the binary into a JS file.
    ```bash
    deno run -A https://code4fukui.github.io/bin2js/bin2js.js popcnt16.wasm
    ```
    This command creates `popcnt16.wasm.js`, which is used by the main `popcount.js` module.

## License

MIT