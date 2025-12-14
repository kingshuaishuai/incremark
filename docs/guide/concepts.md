# Core Concepts

Understanding how Incremark works helps you use and debug it better.

## Incremental Parsing Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        Input Stream                           │
│  "# Title" → "\n\nCon" → "tent\n" → "\n## Sub" → "title"     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Buffer                                   │
│  "# Title\n\nContent\n\n## Subtitle"                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Boundary Detection                         │
│  Line-by-line scanning to identify block boundaries:         │
│  - Empty lines separate paragraphs                           │
│  - Heading lines form independent blocks                     │
│  - Code fences ``` must be paired                            │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│    Completed Blocks      │     │    Pending Blocks       │
│  • Never re-parsed       │     │  • Re-parsed on append  │
│  • Nodes can be reused   │     │  • May be incomplete    │
└─────────────────────────┘     └─────────────────────────┘
```

## Block States

Each parsed block has three possible states:

| State | Description | Handling |
|-------|-------------|----------|
| `pending` | Being received, may be incomplete | Re-parsed on each append |
| `stable` | Possibly complete, but subsequent chunks may change it | Cached but not confirmed |
| `completed` | Confirmed complete, won't change | Permanently cached, no further processing |

## Boundary Detection Rules

Incremark uses heuristic rules to detect block boundaries:

### Simple Blocks

- **Empty lines** - Separate paragraphs
- **Headings** (`#`) - Form independent blocks
- **Thematic breaks** (`---`) - Form independent blocks

### Blocks Requiring Closure

- **Code blocks** (` ``` `) - Must wait for closing fence
- **Containers** (`:::`) - Must wait for closing marker

### Nested Blocks

- **Lists** - Track indentation level
- **Blockquotes** (`>`) - Track quote depth
- **Tables** - Detect separator line

## Context Tracking

To correctly handle nested structures, the parser maintains context state:

```ts
interface BlockContext {
  inFencedCode: boolean     // Inside code block
  fenceChar?: string        // Code fence character
  fenceLength?: number      // Fence length
  listDepth: number         // List nesting depth
  blockquoteDepth: number   // Quote nesting depth
  inContainer: boolean      // Inside container
  containerDepth: number    // Container nesting depth
}
```

## AST Structure

Incremark generates standard [MDAST](https://github.com/syntax-tree/mdast) format:

```ts
interface Root {
  type: 'root'
  children: RootContent[]
}

// Block-level nodes
type RootContent = 
  | Heading 
  | Paragraph 
  | Code 
  | List 
  | Blockquote 
  | Table 
  | ThematicBreak
  | ...
```

## Performance Optimization

### Why Fast?

1. **Skip completed blocks** - O(1) instead of O(n)
2. **Incremental line updates** - Only process new lines
3. **Prefix sum optimization** - O(1) line offset calculation

### Complexity Comparison

| Operation | Traditional | Incremark |
|-----------|-------------|-----------|
| Append chunk | O(n) | O(k) |
| Total parsing | O(n²) | O(n) |
| Memory | Repeated creation | Incremental reuse |

*n = total chars, k = new chars*

## Next Steps

- [Vue Integration](./vue) - Vue deep dive
- [Custom Components](./custom-components) - Custom rendering
