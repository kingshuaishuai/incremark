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

- ⚡️ **Incremental Parsing**: Never re-parse what hasn't changed.
- 🚀 **Extreme Performance**: Handles massive streaming documents with ease.
- ⌨️ **Built-in Typewriter**: Smooth character-by-character reveals that respect markdown structure.
- 🧩 **Framework Agnostic**: Core logic is shared; connectors for Vue, React, and Svelte.
- 🎨 **Themable**: Tailored for modern, dark-mode-first interfaces.
- 🛠 **DevTools**: Inspect the parsing process in real-time.

## Ready to Start?

Check out the [Quick Start](/guide/quick-start) to integrate it into your app in minutes.
