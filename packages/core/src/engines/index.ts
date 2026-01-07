/**
 * 引擎模块
 *
 * 提供两种引擎的独立入口，支持 tree-shaking
 *
 * 推荐用法：
 * - 如需极速模式：import { createMarkedBuilder } from '@incremark/core/engines/marked'
 * - 如需稳定模式：import { createMicromarkBuilder } from '@incremark/core/engines/micromark'
 *
 * 注意：直接从此文件导入会同时包含两个引擎，无法 tree-shake
 */

// 导出两个引擎（注意：这会同时引入两个引擎的依赖）
export * from './marked'
export * from './micromark'
