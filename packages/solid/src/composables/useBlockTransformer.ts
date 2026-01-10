import { createSignal, createEffect, type Accessor } from 'solid-js'
import {
  createBlockTransformer,
  type RootContent,
  type DisplayBlock,
  type TransformerOptions,
  type TransformerPlugin
} from '@incremark/core'

export interface UseBlockTransformerOptions extends Omit<TransformerOptions, 'onChange'> {}

export interface UseBlockTransformerReturn {
  /** 转换后的块列表 */
  displayBlocks: Accessor<DisplayBlock<RootContent>[]>
  /** 是否正在处理 */
  isProcessing: Accessor<boolean>
  /** 是否已暂停 */
  isPaused: Accessor<boolean>
  /** 推送新的块进行转换 */
  push: (blocks: any[]) => void
  /** 跳过动画 */
  skip: () => void
  /** 暂停 */
  pause: () => void
  /** 恢复 */
  resume: () => void
  /** 重置 */
  reset: () => void
  /** 销毁 */
  destroy: () => void
  /** 更新配置 */
  setOptions: (options: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>) => void
}

/**
 * SolidJS 块转换器 Hook
 *
 * 用于管理增量内容的动画效果和转换逻辑
 */
export function useBlockTransformer(options: UseBlockTransformerOptions = {}): UseBlockTransformerReturn {
  const [displayBlocks, setDisplayBlocks] = createSignal<DisplayBlock<RootContent>[]>([])
  const [isProcessing, setIsProcessing] = createSignal(false)
  const [isPaused, setIsPaused] = createSignal(false)

  const transformer = createBlockTransformer<RootContent>({
    charsPerTick: options.charsPerTick ?? [1, 3],
    tickInterval: options.tickInterval ?? 30,
    effect: options.effect ?? 'none',
    pauseOnHidden: options.pauseOnHidden ?? true,
    plugins: options.plugins,
    onChange: (blocks) => {
      setDisplayBlocks(blocks as DisplayBlock<RootContent>[])
      setIsProcessing(transformer?.isProcessing() ?? false)
      setIsPaused(transformer?.isPausedState() ?? false)
    }
  })

  function push(blocks: any[]) {
    transformer.push(blocks)
  }

  function skip() {
    transformer.skip()
  }

  function pause() {
    transformer.pause()
  }

  function resume() {
    transformer.resume()
  }

  function reset() {
    transformer.reset()
  }

  function destroy() {
    transformer.destroy()
  }

  function setOptions(opts: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>) {
    transformer.setOptions(opts)
  }

  return {
    displayBlocks,
    isProcessing,
    isPaused,
    push,
    skip,
    pause,
    resume,
    reset,
    destroy,
    setOptions
  }
}
