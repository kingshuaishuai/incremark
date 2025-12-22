/**
 * 构建样式脚本
 * 
 * 构建流程：
 * 1. 读取已生成的 CSS Variables Less 文件（由 generate-css-variables.ts 生成）
 * 2. 编译 Less 到 CSS
 * 3. 输出最终 CSS 文件
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

async function buildStyles() {
  console.log(`Building styles... (${isProd ? 'production' : 'development'})`)

  // 1. 检查 CSS Variables Less 文件是否存在
  const cssVarsPath = resolve(srcDir, 'styles/css-variables.less')
  if (!existsSync(cssVarsPath)) {
    console.error('❌ Error: css-variables.less not found!')
    console.error('   Please run "tsx scripts/generate-css-variables.ts" first.')
    process.exit(1)
  }

  // 2. 读取 Less 主文件
  console.log('  Reading Less files...')
  const lessContent = readFileSync(resolve(srcDir, 'styles/index.less'), 'utf-8')

  // 3. 编译 Less
  console.log('  Compiling Less to CSS...')
  const result = await less.render(lessContent, {
    paths: [resolve(srcDir, 'styles')],
    compress: isProd, // 生产环境压缩
    sourceMap: !isProd ? {
      outputSourceFiles: true
    } : undefined
  })

  // 4. 输出到 dist/styles.css
  console.log('  Writing dist/styles.css...')
  writeFileSync(resolve(distDir, 'styles.css'), result.css, 'utf-8')

  // 5. 如果有 source map，也输出
  if (result.map && !isProd) {
    writeFileSync(resolve(distDir, 'styles.css.map'), result.map, 'utf-8')
    console.log('  Writing dist/styles.css.map...')
  }

  // 6. 输出文件大小信息
  const sizeKB = (result.css.length / 1024).toFixed(2)
  console.log(`✓ Styles built successfully! (${sizeKB} KB)`)
}

// 运行构建
buildStyles().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})

