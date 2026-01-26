//const bin = await Deno.readFile("popcnt16.wasm");
import bin from "./popcnt16.wasm.js";

const { instance } = await WebAssembly.instantiate(bin, {});

const { memory, count } = instance.exports;

// 例: 16の倍数サイズにする
const N = 16 * 1_000_000;
const data = new Uint8Array(N);
//crypto.getRandomValues(data);
for (let i = 0; i < data.length; i++) {
  data[i] = Math.random() * 256;
}

console.time("wasm-simd-popcnt16");
// wasmメモリへコピー
// 必要ならメモリ拡張（Nが64KiB超えるので通常はgrowが必要）
const pagesNeeded = Math.ceil(N / 65536);
const currentPages = memory.buffer.byteLength / 65536;
if (pagesNeeded > currentPages) {
  memory.grow(pagesNeeded - currentPages);
}
new Uint8Array(memory.buffer).set(data, 0);

//console.time("wasm-simd-popcnt16");
const ones = count(0, data.length);
console.timeEnd("wasm-simd-popcnt16");

console.log("popcount(1-bits) =", ones);

//

// 256-entry popcount table
const POPCNT8 = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let x = i, c = 0;
    while (x) {
      x &= x - 1;
      c++;
    }
    t[i] = c;
  }
  return t;
})();

export function popcount_u8_table(data) {
  let sum = 0;
  // できるだけローカル変数に落とす（JITに優しいことが多い）
  const t = POPCNT8;
  for (let i = 0; i < data.length; i++) {
    sum += t[data[i]];
  }
  return sum;
}

console.time("js-popcnt16");
const cnt = popcount_u8_table(data);
console.timeEnd("js-popcnt16");

console.log("popcount(1-bits) =", cnt);
