(module
  (memory (export "memory") 1)

  ;; count(ptr: i32, len: i32) -> i32
  ;; len は 16の倍数想定
  (func (export "count") (param $ptr i32) (param $len i32) (result i32)
    (local $i i32)
    (local $sum i32)
    (local $bytes v128)
    (local $pc8 v128)
    (local $pc16 v128)
    (local $pc32 v128)

    (local.set $i (i32.const 0))
    (local.set $sum (i32.const 0))

    (block $done
      (loop $loop
        (br_if $done
          (i32.ge_u (local.get $i) (local.get $len))
        )

        ;; bytes = load 16 bytes
        (local.set $bytes
          (v128.load (i32.add (local.get $ptr) (local.get $i)))
        )

        ;; per-byte popcount: i8x16 -> i8x16 (each lane 0..8)
        (local.set $pc8
          (i8x16.popcnt (local.get $bytes))
        )

        ;; pairwise widen+add: -> u16 lanes (0..16)
        (local.set $pc16
          (i16x8.extadd_pairwise_i8x16_u (local.get $pc8))
        )

        ;; pairwise widen+add: -> u32 lanes (0..32), 4 lanes
        (local.set $pc32
          (i32x4.extadd_pairwise_i16x8_u (local.get $pc16))
        )

        ;; sum += lanes 0..3 (extract_lane の即値は命令直後)
        (local.set $sum
          (i32.add (local.get $sum) (i32x4.extract_lane 0 (local.get $pc32)))
        )
        (local.set $sum
          (i32.add (local.get $sum) (i32x4.extract_lane 1 (local.get $pc32)))
        )
        (local.set $sum
          (i32.add (local.get $sum) (i32x4.extract_lane 2 (local.get $pc32)))
        )
        (local.set $sum
          (i32.add (local.get $sum) (i32x4.extract_lane 3 (local.get $pc32)))
        )

        ;; i += 16
        (local.set $i
          (i32.add (local.get $i) (i32.const 16))
        )
        br $loop
      )
    )

    (local.get $sum)
  )
)
