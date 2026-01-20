/**
 * 从 TypeScript Token 定义生成 Less 格式的 CSS Variables 文件
 * 
 * 这是构建流程的第一步，确保 Less 编译时 CSS Variables 已经存在
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')
const srcDir = resolve(rootDir, 'src')

// 直接从源文件导入（tsx 支持 TypeScript）
import { generateCSSVars } from '../src/utils/generate-css-vars.js'
import { defaultTheme, darkTheme } from '../src/themes/index.js'

async function main() {
  console.log('Generating CSS Variables Less file...')

  // 1. 生成默认主题的 CSS Variables
  const defaultVars = generateCSSVars(defaultTheme, {
    prefix: 'incremark',
    selector: ':root'
  })

  // 2. 生成深色主题的 CSS Variables
  const darkVars = generateCSSVars(darkTheme, {
    prefix: 'incremark',
    selector: '[data-theme="dark"], .theme-dark'
  })

  // 3. 生成 Less 文件内容
  const lessContent = `/**
 * CSS Variables 定义
 * 
 * ⚠️ 此文件由脚本自动生成，请勿手动编辑
 * 生成脚本: scripts/generate-css-variables.ts
 * 数据来源: src/tokens/*.ts 和 src/themes/*.ts
 */

/* ============================================
   默认主题 CSS Variables
   ============================================ */
${defaultVars}

/* ============================================
   深色主题 CSS Variables
   ============================================ */
${darkVars}
`

  // 4. 写入文件
  const outputPath = resolve(srcDir, 'styles/css-variables.less')
  writeFileSync(outputPath, lessContent, 'utf-8')

  console.log(`✓ CSS Variables Less file generated`)
  console.log(`  Output: ${outputPath}`)
}

// 运行生成
main().catch((error) => {
  console.error('❌ Failed to generate CSS Variables Less file:')
  console.error(error)
  process.exit(1)
})

