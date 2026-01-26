import bin from "./popcnt16.wasm.js";

const { instance } = await WebAssembly.instantiate(bin, {});
const { memory, count } = instance.exports;

export const popcount = (bin) => {
  const len = (bin.length & 0xf) == 0 ? bin.length : (bin.length & ~0xf) + 0x10;
  const pagesNeeded = Math.ceil(len / 65536);
  const currentPages = memory.buffer.byteLength / 65536;
  if (pagesNeeded > currentPages) {
    memory.grow(pagesNeeded - currentPages);
  }
  new Uint8Array(memory.buffer).set(bin, 0);
  const ones = count(0, len);
  return ones;
};
