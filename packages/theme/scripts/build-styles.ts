/**
 * 构建样式脚本
 *
 * 构建多个独立的 CSS 文件：
 * - incremark.css: Incremark Markdown 渲染相关样式
 * - chat.css: Chat UI 组件样式
 *
 * 注意：在运行此脚本前，必须先运行 generate-css-variables.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import less from 'less'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')
const srcDir = resolve(rootDir, 'src')
const distDir = resolve(rootDir, 'dist')

// 环境变量：是否为生产环境
const isProd = process.env.NODE_ENV === 'production'

async function buildLessFile(entryFile: string, outputFile: string, name: string) {
  // 1. 读取 Less 文件
  console.log(`  Building ${name}...`)
  const lessContent = readFileSync(resolve(srcDir, entryFile), 'utf-8')

  // 2. 编译 Less
  const result = await less.render(lessContent, {
    paths: [resolve(srcDir, 'styles')],
    compress: isProd,
    sourceMap: !isProd ? {
      outputSourceFiles: true
    } : undefined
  })

  // 3. 输出 CSS
  writeFileSync(resolve(distDir, outputFile), result.css, 'utf-8')

  // 4. 如果有 source map，也输出
  if (result.map && !isProd) {
    writeFileSync(resolve(distDir, `${outputFile}.map`), result.map, 'utf-8')
  }

  const sizeKB = (result.css.length / 1024).toFixed(2)
  console.log(`  ✓ ${name} built successfully! (${sizeKB} KB)`)
}

async function buildStyles() {
  console.log(`Building styles... (${isProd ? 'production' : 'development'})`)

  // 1. 检查 CSS Variables Less 文件是否存在
  const cssVarsPath = resolve(srcDir, 'styles/css-variables.less')
  if (!existsSync(cssVarsPath)) {
    console.error('❌ Error: css-variables.less not found!')
    console.error('   Please run "tsx scripts/generate-css-variables.ts" first.')
    process.exit(1)
  }

  // 2. 构建 incremark.css (Incremark Markdown 渲染样式)
  await buildLessFile('styles/incremark.less', 'incremark.css', 'incremark.css')

  // 3. 构建 chat.css (Chat UI 组件样式)
  await buildLessFile('styles/chat.less', 'chat.css', 'chat.css')

  console.log('✓ All styles built successfully!')
}

// 运行构建
buildStyles().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
