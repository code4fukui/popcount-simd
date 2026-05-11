# popcount-simd

WebAssembly SIMD を使用した高速な popcount（セットされたビットのカウント）。

このモジュールは、WebAssembly SIMD 命令を活用した並列処理により、`Uint8Array` 内のセットされたビット（1）の数をカウントする、高度に最適化された関数を提供します。

[**ライブベンチマークデモ**](https://code4fukui.github.io/popcount/)

## パフォーマンス

WebAssembly SIMD 実装は、特に大規模なデータセットに対して、従来の JavaScript のルックアップテーブルを用いたアプローチよりもはるかに高速です。配列サイズが増加するにつれてパフォーマンスの差は広がります。

ライブデモでは以下のベンチマーク結果を確認できます:
-   **Wasm SIMD（青線）:** ほぼ線形のパフォーマンス曲線を描き、安定して高速です。
-   **JS（オレンジ線）:** より遅く、特に 100 KB を超える配列で顕著になります。

![ベンチマークチャート](https://code4fukui.github.io/popcount/benchmark.png)

## 特徴

-   WebAssembly の固定幅 SIMD128 命令を活用。
-   `i8x16.popcnt` を使用し、1回のループ反復で16バイトを処理。
-   階層的な `extadd_pairwise` 命令を使用して、各レーンの結果を効率的に合計。

## 使い方

ESモジュールから `popcount` 関数をインポートします。この関数は `Uint8Array` を受け取り、セットされたビットの総数を返します。

```js
import { popcount } from "https://code4fukui.github.io/popcount/popcount.js";

// 例データ
const data = new Uint8Array([0b11110000, 0b10101010, 0b11111111]); // 4 + 4 + 8 = 16

const count = popcount(data);

console.log(count); // 16
```

## ソースからのビルド

`.wat` ソースファイルから WebAssembly モジュールをビルドするには、`wat2wasm` を含む [WebAssembly Binary Toolkit (WABT)](https://github.com/WebAssembly/wabt) が必要です。

1.  **WebAssembly テキスト形式をバイナリにコンパイル:**
    ```bash
    wat2wasm popcnt16.wat -o popcnt16.wasm
    ```

2.  **WASM バイナリを JavaScript ESモジュールに変換:**
    このプロジェクトでは、[bin2js](https://github.com/code4fukui/bin2js) を使用してバイナリを JS ファイルに埋め込んでいます。
    ```bash
    deno run -A https://code4fukui.github.io/bin2js/bin2js.js popcnt16.wasm
    ```
    このコマンドにより `popcnt16.wasm.js` が生成され、メインの `popcount.js` モジュールで利用されます。

## ライセンス

MIT
