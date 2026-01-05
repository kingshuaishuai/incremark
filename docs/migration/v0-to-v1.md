# Migration from v0 to v1

## Breaking Changes

### Deprecated APIs

- **`useStreamRenderer`** has been removed. Please use `useIncremark` or the `IncremarkContent` component instead.

### Component Props

Refactored props for `IncremarkContent`:

- `options` is now `incremarkOptions`.
- `data` is now `content`.

## Svelte Adaptations

For Svelte 5 support:

- Use `onclick` instead of `on:click`.
- Use Runes syntax (`$state`) in examples.
