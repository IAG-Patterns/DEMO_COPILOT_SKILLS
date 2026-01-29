---
name: performance-triage
description: Identify and fix performance bottlenecks with minimal, measurable changes (complexity, IO/DB patterns, caching, concurrency).
---

# Performance Triage

## IAGAI defaults

Follow `skills/iagai-workflow` (measure, change minimally, verify correctness first).

## When to use

- User reports slowness, timeouts, high CPU/memory, or scale issues.

## Procedure

1. **Define the symptom**
   - latency, throughput, CPU, memory, DB time, network time.
2. **Pick the likely bottleneck class**
   - algorithmic complexity
   - IO/DB (N+1, missing pagination, unindexed queries)
   - serialization and payload size
   - concurrency/blocking calls
3. **Measure**
   - Add timing/log instrumentation or reproduce with a benchmark/test.
4. **Apply the smallest optimization**
   - Fix one bottleneck at a time.
5. **Verify**
   - Ensure correctness tests pass; add perf regression guard only if needed.

