# Introduction

Incremark is an **incremental Markdown parser** designed specifically for AI streaming output scenarios.

## Problem Background

In AI chat scenarios, AI typically outputs Markdown text in a streaming manner. The traditional approach is:

```
Receive new chunk → Concatenate to existing text → Re-parse complete text → Re-render
```

This approach has serious performance issues:

- **Repeated parsing**: Already parsed content is parsed repeatedly
- **High CPU overhead**: Parsing time grows O(n²) as text increases
- **Page stutters**: Poor user experience

## Solution

Incremark uses an **incremental parsing** strategy:

```
Receive new chunk → Append to buffer → Detect completed blocks → Only parse new blocks → Incremental update
```

### Core Advantages

1. **Completed blocks are never re-parsed** - Save 90%+ parsing overhead
2. **Smart boundary detection** - Accurately identify when blocks are complete
3. **Maintain parsing correctness** - Handle code blocks, lists and other complex nested structures

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    @incremark/core                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Parser    │  │  Detector   │  │    Types    │  │
│  │  Incremental│  │  Boundary   │  │   Type Def  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │@incremark/vue│ │@incremark/react│ │@incremark/devtools│
   │  Vue 3      │ │  React 18+  │ │  Dev Tools   │
   └─────────────┘ └─────────────┘ └─────────────┘
```

## Use Cases

- ✅ AI chat applications (ChatGPT, Claude, etc.)
- ✅ Streaming document generation
- ✅ Real-time Markdown preview
- ✅ Low-latency rendering scenarios

## Next Steps

- [Quick Start](./getting-started) - Get started in 5 minutes
- [Core Concepts](./concepts) - Understand how it works
