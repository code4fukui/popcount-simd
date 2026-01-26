import { popcount } from "./popcount.js";
import { popcount as popcount_nosimd } from "./popcount_nosimd.js";

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

// 横軸：配列サイズ（10倍ずつ）
const sizes = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];

let timesSimd = [];
let timesJs = [];

function fillRandom(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.random() * 256;
  }
}

function measure(fn) {
  const t0 = performance.now();
  fn();
  const t1 = performance.now();
  return t1 - t0;
}

const log10 = (x) => Math.log10(Math.max(x, 0.000001)); // 0除外

function draw() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const L = 70, R = 20, T = 20, B = 50;
  const pw = w - L - R;
  const ph = h - T - B;

  const all = [...timesSimd, ...timesJs].filter(v => v > 0);
  const ymin = all.length ? Math.min(...all) : 0.0000001;
  const ymax = all.length ? Math.max(...all) : 1;

  const logMin = -6; // log10(ymin);
  const logMax = log10(ymax);

  // axes
  ctx.strokeStyle = "#888";
  ctx.beginPath();
  ctx.moveTo(L, T);
  ctx.lineTo(L, T + ph);
  ctx.lineTo(L + pw, T + ph);
  ctx.stroke();

  // Y labels (log)
  ctx.fillStyle = "#666";
  ctx.font = "12px system-ui";
  const steps = Math.floor(logMax - logMin) + 1;
  for (let i = 0; i <= steps; i++) {
    const v = Math.pow(10, Math.floor(logMin) + i);
    const y = T + ph - ph * ((log10(v) - logMin) / (logMax - logMin));

    ctx.strokeStyle = "#eee";
    ctx.beginPath();
    ctx.moveTo(L, y);
    ctx.lineTo(L + pw, y);
    ctx.stroke();

    ctx.fillText(`${v.toFixed(3)} ms`, 10, y + 4);
  }

  // X labels（配列長）
  const toLogStr = (n) => {
    return "1e" + log10(n);
  };
  sizes.forEach((s, i) => {
    const x = L + (pw * i) / (sizes.length - 1);
    ctx.fillStyle = "#666";
    ctx.fillText(toLogStr(s), x - 10, T + ph + 20);
  });
  ctx.fillText("array length", L + pw / 2 - 30, T + ph + 38);

  function plot(series, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    series.forEach((v, i) => {
      const x = L + (pw * i) / (sizes.length - 1);
      const y = T + ph - ph * ((log10(v) - logMin) / (logMax - logMin));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = color;
    series.forEach((v, i) => {
      const x = L + (pw * i) / (sizes.length - 1);
      const y = T + ph - ph * ((log10(v) - logMin) / (logMax - logMin));
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 凡例
  ctx.fillStyle = "#1f77b4";
  ctx.fillRect(L + 10, T + 6, 16, 6);
  ctx.fillStyle = "#111";
  ctx.fillText("Wasm SIMD", L + 30, T + 12);

  ctx.fillStyle = "#ff7f0e";
  ctx.fillRect(L + 120, T + 6, 16, 6);
  ctx.fillStyle = "#111";
  ctx.fillText("JS", L + 140, T + 12);

  plot(timesSimd, "#1f77b4");
  plot(timesJs, "#ff7f0e");
}

async function runBench() {
  timesSimd = [];
  timesJs = [];
  draw();

  for (const n0 of sizes) {
    const n = (n0 + 15) & ~15; // SIMD用に16の倍数
    const data = new Uint8Array(n);
    fillRandom(data);

    const tSimd = measure(() => popcount(data));
    timesSimd.push(tSimd);
    draw();
    await new Promise(r => setTimeout(r, 0));

    const tJs = measure(() => popcount_nosimd(data));
    timesJs.push(tJs);
    draw();
    await new Promise(r => setTimeout(r, 0));

    console.log(n0, "simd:", tSimd, "js:", tJs);
  }
}

runBench();
