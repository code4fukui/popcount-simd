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

export const popcount = (data) => {
  let sum = 0;
  const t = POPCNT8;
  for (let i = 0; i < data.length; i++) {
    sum += t[data[i]];
  }
  return sum;
};

