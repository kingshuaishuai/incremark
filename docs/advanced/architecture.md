# Architecture

## Overall Architecture

```
┌─────────────────────────────────────────────────────┐
│                  IncremarkContent                    │
│  (High-level encapsulation, handles append/finalize) │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                   useIncremark                       │
│  (State management, reactivity wrapper)              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                  IncremarkParser                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Boundary    │  │ AST         │  │ Definition  │  │
│  │ Detector    │  │ Builder     │  │ Manager     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                 BlockTransformer                     │
│  (Typewriter, character-level incremental rendering) │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ Plugins     │  │ Chunk       │                   │
│  │ System      │  │ Animation   │                   │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                    Renderer                          │
│  (Framework-specific components)                     │
└─────────────────────────────────────────────────────┘
```

## Internal Structure

### IncremarkParser
- **BoundaryDetector**: Identifies stable boundaries in the markdown stream to commit blocks.
- **AstBuilder**: Constructs the Abstract Syntax Tree from the committed tokens.
- **DefinitionManager / FootnoteManager**: Manages references and footnotes across blocks.

### Performance Optimizations
- **Incremental Line Parsing**: Only parses new lines, keeping previous state.
- **Context Caching**: Caches parser context to resume parsing efficiently.
- **AST Incremental Appending**: Appends new AST nodes without rebuilding the entire tree.
