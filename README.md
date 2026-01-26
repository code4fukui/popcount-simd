# popcount-simd

Fast popcount using WebAssembly SIMD.
- `i8x16.popcnt`
- `extadd_pairwise`

## usage

```js
import { popcount } from "https://code4fukui.github.io/popcount/popcount.js";

const data = new Uint8Array();
const cnt = popcount(data);
console.log(cnt);
```

## how to build

```js
wat2wasm popcnt16.wat -o popcnt16.wasm
deno run -A https://code4fukui.github.io/bin2js/bin2js.js popcnt16.wasm
```
- [bin2js](https://github.com/code4fukui/bin2js)
