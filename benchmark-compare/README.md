# Incremark Benchmark

Performance benchmark comparing [Incremark](https://github.com/kingshuaishuai/incremark) with other Markdown streaming parsers.

## Parsers Tested

| Parser | Approach | Complexity |
|--------|----------|------------|
| **Incremark** | Incremental parsing | O(n) |
| **Streamdown** | Full re-parsing | O(n²) |
| **markstream-vue** | Full re-parsing | O(n²) |
| **ant-design-x** | Full re-parsing (Marked) | O(n²) |

## Test Methodology

1. Read all `.md` files from `test-data/` directory
2. Split content into small chunks (5 chars each, simulating AI token-by-token output)
3. For each parser:
   - **Incremark**: Uses `append()` method - only parses new content
   - **Others**: Accumulates string and re-parses entire content each time
4. Measure total time, per-chunk average, and memory usage

## Quick Start

```bash
# Install dependencies
pnpm install

# Run benchmark
pnpm benchmark

# Run with garbage collection (more accurate memory stats)
pnpm benchmark:gc
```

## Results

The benchmark generates:
- Console output with summary table
- `benchmark-results.json` with detailed results

### Expected Performance

| Document Size | Incremark Advantage |
|---------------|---------------------|
| Short (~100 lines) | 4-6x faster |
| Medium (~400 lines) | 10x+ faster |
| Long (~900 lines) | 16-65x faster |

**The longer the document, the greater the advantage of incremental parsing.**

## Adding Test Files

Place any `.md` files in the `test-data/` directory. The benchmark will automatically include them.

## License

MIT
