import { popcount } from "./popcount.js";
import { popcount as popcount_nosimd } from "./popcount_nosimd.js";

const N = 100_000_000;
const data = new Uint8Array(N);
//crypto.getRandomValues(data); // err when too big
for (let i = 0; i < data.length; i++) {
  data[i] = Math.random() * 256;
}

console.time("wasm-simd-popcnt");
const ones = popcount(data);
console.timeEnd("wasm-simd-popcnt");
console.log("popcount(1-bits) =", ones);

console.time("js-popcnt");
const ones2 = popcount_nosimd(data);
console.timeEnd("js-popcnt");

console.log("popcount(1-bits) =", ones2);
