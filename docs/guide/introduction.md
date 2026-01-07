# Introduction

**Incremark** is a markdown renderer designed for the AI era. It prioritizes **streaming performance**, **incremental updates**, and **smooth visual effects**.

## Why Incremark?

With the rise of LLMs (Large Language Models), applications are increasingly displaying streaming text. Traditional markdown parsers were built for static documents, not for text that updates 50 times a second.

This mismatch leads to:
- High CPU usage on long responses.
- Janky scrolling and rendering.
- Difficulty implementing "Typewriter" effects without breaking markdown syntax.

**Incremark** rethinks markdown rendering as a stream processing problem.

## Key Features

- ⚡️ **Extreme Performance**: Average ~6x faster than Streamdown, ~7x faster than ant-design-x, ~28x faster than markstream-vue.
- 🔄 **Dual-Engine Architecture**: Marked with enhanced extensions for speed, or Micromark for strict CommonMark compliance.
- 🚀 **O(n) Incremental Parsing**: Only parse what's new — 18KB document is 19x faster than traditional parsers.
- ⌨️ **Built-in Typewriter**: Smooth character-by-character reveals that respect markdown structure.
- 🧩 **Framework Agnostic**: Core logic is shared; connectors for Vue, React, and Svelte.
- 🎨 **Themable**: Tailored for modern, dark-mode-first interfaces.
- 🛠 **DevTools**: Inspect the parsing process in real-time.

## Ready to Start?

Check out the [Quick Start](/guide/quick-start) to integrate it into your app in minutes.

## AI Friendliness

Incremark is designed for AI, and our documentation is too. We provide structured versions of our docs for better ingestion by LLMs:
- [llms.txt](/llms.txt): A concise index of our documentation.
- [llms-full.txt](/llms-full.txt): The entire documentation in a single file, perfect for providing context to Claude, Cursor, or ChatGPT.
