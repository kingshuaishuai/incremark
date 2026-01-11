# Benchmark

This page describes how to run performance benchmarks comparing Incremark with other Markdown streaming parsers.

## Parsers Tested

| Parser | Approach | Complexity | Description |
|--------|----------|------------|-------------|
| **Incremark** | Incremental parsing | O(n) | Only parses new content |
| **Streamdown** | Full re-parsing | O(n²) | Re-parses entire content each time |
| **markstream-vue** | Full re-parsing | O(n²) | Re-parses entire content each time |
| **ant-design-x** | Full re-parsing | O(n²) | Based on Marked |

## Test Methodology

1. Read all `.md` files from `test-data/` directory
2. Split content into small chunks (5 chars each, simulating AI token-by-token output)
3. For each parser:
   - **Incremark**: Uses `append()` method - only parses new content
   - **Others**: Accumulates string and re-parses entire content each time
4. Measure total time, per-chunk average, and memory usage

## Run Benchmark

### Clone Repository

```bash
git clone https://github.com/kingshuaishuai/incremark.git
cd incremark/benchmark-compare
```

### Install Dependencies

```bash
pnpm install
```

### Add Test Data

Place your Markdown files in the `test-data/` directory:

```bash
# Example: copy some markdown files
cp /path/to/your/*.md test-data/
```

### Run

```bash
# Standard run
pnpm benchmark

# With garbage collection (more accurate memory stats)
pnpm benchmark:gc
```

## Output

The benchmark generates:

- **Console output**: Summary table with timing comparisons
- **benchmark-results.json**: Detailed results in JSON format

### Sample Output

```
📊 Performance Summary (sorted by lines)

| filename          | lines | chars   | Incremark | Streamdown | vs Streamdown |
|-------------------|-------|---------|-----------|------------|---------------|
| short-doc.md      |    91 |   2,341 |      12.0 |       50.5 |          4.2x |
| medium-doc.md     |   147 |   4,123 |       9.0 |       58.8 |          6.6x |
| long-doc.md       |   391 |  12,456 |      19.1 |      208.4 |         10.9x |
| extra-long-doc.md |   916 |  28,912 |      87.7 |     1441.1 |         16.4x |

📈 Performance Summary:
   - Incremark total: 127.8 ms
   - Streamdown total: 1758.8 ms (13.8x slower)
```

## Expected Results

| Document Size | Lines | Incremark Advantage |
|---------------|-------|---------------------|
| Short | ~100 | 4-6x faster |
| Medium | ~400 | 10x+ faster |
| Long | ~900 | 16-65x faster |

::: tip Key Insight
**The longer the document, the greater the advantage of incremental parsing.**

This is because:
- Incremark: O(n) - only processes new content
- Others: O(n²) - re-processes entire accumulated content on each chunk
:::

## Benchmark Code

The benchmark script is located at `benchmark-compare/benchmark.ts`. Key implementation:

```typescript
// Incremark: O(n) incremental parsing
const parser = createIncremarkParser()
for (const chunk of chunks) {
  parser.append(chunk)  // Only parses new content
}
parser.finalize()

// Others: O(n²) full re-parsing
let accumulated = ''
for (const chunk of chunks) {
  accumulated += chunk
  parseMarkdown(accumulated)  // Re-parses entire content
}
```

## Contributing Test Data

We welcome contributions of real-world Markdown files for benchmarking. Please ensure:

1. Files are reasonably sized (100-1000+ lines)
2. Content is appropriate for public sharing
3. Files represent typical AI output scenarios

Submit via pull request to the `benchmark-compare/test-data/` directory.
